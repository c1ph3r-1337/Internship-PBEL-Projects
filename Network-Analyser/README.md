Network Traffic Analysis Using Wireshark and Zeek
=================================================

Project Purpose
---------------
This beginner-friendly internship project analyzes a small offline CSV file that contains network connection records. The program reads network_traffic.csv, validates each row, calculates basic traffic statistics, detects simple suspicious patterns, prints alerts on the screen, and saves them in network_alerts.txt.

The program does not capture live traffic and does not read PCAP files directly. It only analyzes authorized, simulated, or laboratory network data.

Legal-Use Notice
----------------
Use this project only with data that you own or have explicit permission to analyze. Do not use it for unauthorized network sniffing, password interception, packet injection, denial-of-service activity, session hijacking, man-in-the-middle attacks, exploitation, or bypassing security controls.

Required Software
-----------------
1. Python 3
2. Optional: Wireshark, if you want to export packet details to CSV
3. Optional: Zeek, if you want to create connection logs such as conn.log in a lab environment

No requirements.txt file is needed because the Python program uses only standard Python libraries.

Project Files
-------------
1. main.py
2. network_traffic.csv
3. network_alerts.txt
4. README.txt
5. Network_Traffic_Analysis_Report.docx

CSV File Format
---------------
The CSV file must be named network_traffic.csv and must contain these columns:

timestamp,source_ip,destination_ip,source_port,destination_port,protocol,bytes,status

Example row:

2026-07-15 10:00:00,192.0.2.10,198.51.100.20,50000,80,TCP,600,SUCCESS

The sample file uses documentation-reserved IP addresses only:

192.0.2.0/24
198.51.100.0/24
203.0.113.0/24

Running the Python Program
--------------------------
Open a terminal in the project folder and run:

python3 main.py

Expected Output
---------------
The program prints:

1. Detected alerts
2. Total number of connections
3. Total bytes transferred
4. Successful and failed connection counts
5. Most active source IP address
6. Most contacted destination IP address
7. Most common destination port
8. TCP and UDP connection counts
9. Total alert count

The alerts are also saved in network_alerts.txt.

Detection Rules
---------------
Port scan:
An alert is generated when one source IP connects to four or more different destination ports.
Severity: High

Repeated failed connections:
An alert is generated when one source IP has three or more failed connections.
Severity: High

Large data transfer:
An alert is generated when one connection transfers more than 1,000,000 bytes.
Severity: Critical

Uncommon port:
An alert is generated when the destination port is outside this simple common-port list:
22, 53, 80, 443
Severity: Medium

Normal connection:
A normal connection is considered Low severity and does not create an alert in this small demo.

Exporting CSV Data from Wireshark
---------------------------------
Wireshark can open authorized packet captures and export packet details to CSV. This project does not read PCAP files directly.

Simple Wireshark display filters:

tcp
udp
dns
http
tcp.port == 22
tcp.port == 80
ip.src == 192.0.2.10
ip.dst == 198.51.100.20
tcp.flags.syn == 1 && tcp.flags.ack == 0

Basic export steps:

1. Open an authorized capture file in Wireshark.
2. Apply a display filter if needed.
3. Choose File > Export Packet Dissections > As CSV.
4. Select or arrange fields that match the project CSV format.
5. Save the file as network_traffic.csv.
6. Run python3 main.py.

Basic Information About Zeek
----------------------------
Zeek is a network security monitoring tool that can generate log files from network traffic. One important Zeek log is conn.log, which stores connection information. Fields in conn.log are similar to this project's CSV fields, such as source IP, destination IP, source port, destination port, protocol, bytes, and connection state.

For this beginner project, Zeek data should be converted or copied into network_traffic.csv before running the Python script.

Troubleshooting
---------------
Missing CSV file:
Make sure network_traffic.csv is in the same folder as main.py.

Empty file:
Make sure the CSV file contains the header row and at least one traffic row.

Missing columns:
Check that all required columns are present and spelled correctly.

Invalid port numbers:
Ports must be numbers from 0 to 65535.

Invalid byte values:
The bytes field must be zero or a positive number.

Incorrect IP addresses:
Use valid IP address format, such as 192.0.2.10.

Invalid rows:
The program skips invalid rows and continues with valid rows when possible.

Limitations
-----------
This is a lightweight internship demonstration. It does not inspect packet payloads, decrypt traffic, read PCAP files, capture live traffic, use machine learning, or replace professional monitoring tools. The alerts are based on simple rule thresholds and may produce false positives.
