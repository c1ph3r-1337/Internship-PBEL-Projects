import csv
import ipaddress
from collections import Counter, defaultdict


CSV_FILE = "network_traffic.csv"
ALERT_FILE = "network_alerts.txt"

REQUIRED_COLUMNS = [
    "timestamp",
    "source_ip",
    "destination_ip",
    "source_port",
    "destination_port",
    "protocol",
    "bytes",
    "status",
]

COMMON_PORTS = {22, 53, 80, 443}
PORT_SCAN_LIMIT = 4
FAILED_CONNECTION_LIMIT = 3
LARGE_TRANSFER_LIMIT = 1_000_000


# Read and validate the CSV traffic file.
def read_traffic_file(file_name):
    valid_rows = []

    try:
        with open(file_name, "r", newline="", encoding="utf-8") as traffic_file:
            reader = csv.DictReader(traffic_file)

            if reader.fieldnames is None:
                print("Error: The CSV file is empty.")
                return valid_rows

            missing_columns = [
                column for column in REQUIRED_COLUMNS if column not in reader.fieldnames
            ]
            if missing_columns:
                print("Error: Missing CSV columns:", ", ".join(missing_columns))
                return valid_rows

            row_count = 0
            for line_number, row in enumerate(reader, start=2):
                row_count += 1
                clean_row = validate_row(row, line_number)
                if clean_row:
                    valid_rows.append(clean_row)

            if row_count == 0:
                print("Error: The CSV file has no traffic rows.")
            elif not valid_rows:
                print("Warning: The CSV file was read, but no valid rows were found.")

    except FileNotFoundError:
        print(f"Error: The file '{file_name}' was not found.")
    except OSError as error:
        print(f"Error: Could not read the file. Details: {error}")

    return valid_rows


# Check one CSV row and convert simple values to useful Python types.
def validate_row(row, line_number):
    if row.get(None):
        print(f"Invalid row {line_number}: too many values in this row.")
        return None

    for column in REQUIRED_COLUMNS:
        if not (row.get(column) or "").strip():
            print(f"Invalid row {line_number}: missing value for '{column}'.")
            return None

    source_ip = row["source_ip"].strip()
    destination_ip = row["destination_ip"].strip()

    try:
        ipaddress.ip_address(source_ip)
        ipaddress.ip_address(destination_ip)
    except ValueError:
        print(f"Invalid row {line_number}: incorrect IP address.")
        return None

    try:
        source_port = int(row["source_port"])
        destination_port = int(row["destination_port"])
        if not 0 <= source_port <= 65535 or not 0 <= destination_port <= 65535:
            raise ValueError
    except ValueError:
        print(f"Invalid row {line_number}: invalid port number.")
        return None

    try:
        byte_count = int(row["bytes"])
        if byte_count < 0:
            raise ValueError
    except ValueError:
        print(f"Invalid row {line_number}: invalid byte value.")
        return None

    protocol = row["protocol"].strip().upper()
    status = row["status"].strip().upper()

    if protocol not in {"TCP", "UDP"}:
        print(f"Invalid row {line_number}: protocol must be TCP or UDP.")
        return None

    if status not in {"SUCCESS", "FAILED"}:
        print(f"Invalid row {line_number}: status must be SUCCESS or FAILED.")
        return None

    return {
        "timestamp": row["timestamp"].strip(),
        "source_ip": source_ip,
        "destination_ip": destination_ip,
        "source_port": source_port,
        "destination_port": destination_port,
        "protocol": protocol,
        "bytes": byte_count,
        "status": status,
    }


# Assign a simple severity level to each alert type.
def assign_severity(alert_type):
    if alert_type == "large_transfer":
        return "Critical"
    if alert_type in {"port_scan", "failed_connections"}:
        return "High"
    if alert_type == "uncommon_port":
        return "Medium"
    return "Low"


# Detect a source IP that contacts four or more different destination ports.
def detect_port_scan(traffic_rows):
    ports_by_source = defaultdict(set)
    destinations_by_source = defaultdict(set)

    for row in traffic_rows:
        ports_by_source[row["source_ip"]].add(row["destination_port"])
        destinations_by_source[row["source_ip"]].add(row["destination_ip"])

    alerts = []
    for source_ip, ports in ports_by_source.items():
        if len(ports) >= PORT_SCAN_LIMIT:
            alerts.append(
                {
                    "type": "port_scan",
                    "severity": assign_severity("port_scan"),
                    "source_ip": source_ip,
                    "destination_ip": ", ".join(sorted(destinations_by_source[source_ip])),
                    "description": (
                        f"Source connected to {len(ports)} different destination ports: "
                        f"{', '.join(str(port) for port in sorted(ports))}"
                    ),
                }
            )

    return alerts


# Detect a source IP with three or more failed connections.
def detect_failed_connections(traffic_rows):
    failed_count_by_source = Counter()

    for row in traffic_rows:
        if row["status"] == "FAILED":
            failed_count_by_source[row["source_ip"]] += 1

    alerts = []
    for source_ip, failed_count in failed_count_by_source.items():
        if failed_count >= FAILED_CONNECTION_LIMIT:
            alerts.append(
                {
                    "type": "failed_connections",
                    "severity": assign_severity("failed_connections"),
                    "source_ip": source_ip,
                    "destination_ip": "Multiple",
                    "description": (
                        f"Source has {failed_count} failed connection attempts."
                    ),
                }
            )

    return alerts


# Detect a single connection that transfers more than one million bytes.
def detect_large_transfer(traffic_rows):
    alerts = []

    for row in traffic_rows:
        if row["bytes"] > LARGE_TRANSFER_LIMIT:
            alerts.append(
                {
                    "type": "large_transfer",
                    "severity": assign_severity("large_transfer"),
                    "source_ip": row["source_ip"],
                    "destination_ip": row["destination_ip"],
                    "description": (
                        f"Connection transferred {row['bytes']} bytes to port "
                        f"{row['destination_port']}."
                    ),
                }
            )

    return alerts


# Detect destination ports outside the small common-port list.
def detect_uncommon_ports(traffic_rows):
    alerts = []

    for row in traffic_rows:
        if row["destination_port"] not in COMMON_PORTS:
            alerts.append(
                {
                    "type": "uncommon_port",
                    "severity": assign_severity("uncommon_port"),
                    "source_ip": row["source_ip"],
                    "destination_ip": row["destination_ip"],
                    "description": (
                        f"Connection used uncommon destination port "
                        f"{row['destination_port']}."
                    ),
                }
            )

    return alerts


# Calculate beginner-friendly traffic statistics.
def calculate_statistics(traffic_rows, alerts):
    source_counter = Counter(row["source_ip"] for row in traffic_rows)
    destination_counter = Counter(row["destination_ip"] for row in traffic_rows)
    destination_port_counter = Counter(row["destination_port"] for row in traffic_rows)

    statistics = {
        "total_connections": len(traffic_rows),
        "total_bytes": sum(row["bytes"] for row in traffic_rows),
        "successful_connections": sum(
            1 for row in traffic_rows if row["status"] == "SUCCESS"
        ),
        "failed_connections": sum(1 for row in traffic_rows if row["status"] == "FAILED"),
        "most_active_source_ip": source_counter.most_common(1)[0][0],
        "most_contacted_destination_ip": destination_counter.most_common(1)[0][0],
        "most_common_destination_port": destination_port_counter.most_common(1)[0][0],
        "tcp_connections": sum(1 for row in traffic_rows if row["protocol"] == "TCP"),
        "udp_connections": sum(1 for row in traffic_rows if row["protocol"] == "UDP"),
        "total_alerts": len(alerts),
    }

    return statistics


# Save the alert report as a plain text file.
def save_alert_report(alerts, file_name):
    try:
        with open(file_name, "w", encoding="utf-8") as alert_file:
            alert_file.write("Network Traffic Alert Report\n")
            alert_file.write("Data source: authorized simulated CSV data only\n")
            alert_file.write("=" * 45 + "\n\n")

            if not alerts:
                alert_file.write("No alerts generated.\n")
                return

            for number, alert in enumerate(alerts, start=1):
                alert_file.write(f"Alert {number}\n")
                alert_file.write(f"Severity: {alert['severity']}\n")
                alert_file.write(f"Type: {alert['type']}\n")
                alert_file.write(f"Source IP: {alert['source_ip']}\n")
                alert_file.write(f"Destination IP: {alert['destination_ip']}\n")
                alert_file.write(f"Details: {alert['description']}\n\n")

    except OSError as error:
        print(f"Error: Could not save the alert report. Details: {error}")


# Print alerts to the screen.
def display_alerts(alerts):
    print("\nAlerts")
    print("-" * 40)

    if not alerts:
        print("No alerts found.")
        return

    for alert in alerts:
        print(f"[{alert['severity']}] {alert['description']}")
        print(f"Source: {alert['source_ip']} -> Destination: {alert['destination_ip']}")


# Print the final traffic summary.
def display_summary(statistics):
    print("\nTraffic Summary")
    print("-" * 40)
    print(f"Total connections: {statistics['total_connections']}")
    print(f"Total bytes transferred: {statistics['total_bytes']}")
    print(f"Successful connections: {statistics['successful_connections']}")
    print(f"Failed connections: {statistics['failed_connections']}")
    print(f"Most active source IP: {statistics['most_active_source_ip']}")
    print(
        "Most contacted destination IP: "
        f"{statistics['most_contacted_destination_ip']}"
    )
    print(f"Most common destination port: {statistics['most_common_destination_port']}")
    print(f"TCP connections: {statistics['tcp_connections']}")
    print(f"UDP connections: {statistics['udp_connections']}")
    print(f"Total alerts: {statistics['total_alerts']}")


# Run the offline network-log analysis.
def main():
    print("Network Traffic Analysis Using Wireshark and Zeek")
    print("Offline CSV analysis for authorized lab data only")

    traffic_rows = read_traffic_file(CSV_FILE)
    if not traffic_rows:
        print("Program stopped because no valid traffic data was available.")
        return

    alerts = []
    alerts.extend(detect_port_scan(traffic_rows))
    alerts.extend(detect_failed_connections(traffic_rows))
    alerts.extend(detect_large_transfer(traffic_rows))
    alerts.extend(detect_uncommon_ports(traffic_rows))

    save_alert_report(alerts, ALERT_FILE)

    statistics = calculate_statistics(traffic_rows, alerts)
    display_alerts(alerts)
    display_summary(statistics)

    print(f"\nAlert report saved to: {ALERT_FILE}")


if __name__ == "__main__":
    main()
