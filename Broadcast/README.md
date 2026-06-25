# P2P UDP Broadcast & Multicast Network Service

A decentralized, zero-configuration peer-to-peer broadcast network service built in Go. Any host on the local network running this service automatically joins a shared real-time message stream. 

Every node acts as both a sender and a receiver. It includes a premium real-time Web Dashboard (glassmorphism UI) for typing and viewing broadcasts, making it incredibly easy to use.

---

## Architecture & Features

```
               [ Web Dashboard (Browser) ]
                            ▲
                            │ WebSockets
                            ▼
         ┌──────────────────────────────────────┐
         │         Local Go Service Node        │
         └──────────────────┬───────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
  UDP Multicast                          UDP Broadcast
 (239.0.0.1:9999)                     (255.255.255.255:9999)
        │                                       │
        └───────────────────┬───────────────────┘
                            ▼
              [ Shared Local Subnet Mesh ]
```

* **Dual-Protocol Delivery**: Packets are delivered via both UDP Multicast (`239.0.0.1`) and UDP Broadcast (`255.255.255.255`). This ensures maximum reliability across varying local network hardware and configurations.
* **Auto-Discovery Heartbeats**: Nodes broadcast a heartbeat pulse every 5 seconds. Offlines nodes are pruned from the peer directory after 15 seconds.
* **Cryptographic Deduplication**: To avoid loops and duplicate arrivals (receiving both multicast and broadcast packets), messages are cataloged and filtered using unique UUIDs.
* **Glassmorphism Web Dashboard**: Serves a local web interface (default port `8080`) containing the live chat stream, active peer status count, and a broadcast command center.
* **Self-Contained Executable**: Frontend assets (HTML, CSS, JS) are embedded directly into the Go binary at compile-time using Go `embed`. No external resource loading required.

---

## File Structure

* [main.go](file:///vault/Projects/internship/main.go) - Application entrypoint, traps termination signals, and parses flags.
* [network/peer.go](file:///vault/Projects/internship/network/peer.go) - Manages the dynamic list of online servers.
* [network/net.go](file:///vault/Projects/internship/network/net.go) - Handles UDP Multicast/Broadcast listeners, transmitters, and UUID generation.
* [web/server.go](file:///vault/Projects/internship/web/server.go) - Handles HTTP routes, WebSocket hub, and chat history.
* [web/static/](file:///vault/Projects/internship/web/static/) - Frontend resources.
  * [index.html](file:///vault/Projects/internship/web/static/index.html) - Structural markup.
  * [style.css](file:///vault/Projects/internship/web/static/style.css) - Premium dark/glass design.
  * [app.js](file:///vault/Projects/internship/web/static/app.js) - Real-time WebSocket handlers.
* [broadcast.service](file:///vault/Projects/internship/broadcast.service) - Template configuration for systemd integration.

---

## How to Build and Run

### 1. Requirements
* Go 1.21 or later installed.
* Ports `9999` (UDP) and `8080` (TCP/HTTP) open/available.

### 2. Build the Binary
Compile the project into a single executable binary:
```bash
go build -o broadcast-service
```

### 3. Run Manually
To start the node service:
```bash
./broadcast-service
```
You can customize the ports and configurations via command-line flags:
```bash
./broadcast-service -port 9999 -web :8080 -prune-timeout 15
```

### 4. Open the Dashboard
Open your browser and navigate to:
```text
http://localhost:8080
```
Open it on multiple machines on the same local network (LAN) to test peer-to-peer broadcasting!

### 5. Simulating Multiple Nodes on a Single Computer
If you want to test the full peer-to-peer network discovery and see multiple distinct host nodes connect and chat on the same computer:

1. **Start the First Node** in one terminal window:
   ```bash
   ./broadcast-service -web :8080 -port 9999
   ```
2. **Start the Second Node** in a second terminal window (we use a different web port `8081` to avoid HTTP port conflicts, but the same UDP port so they can exchange packets):
   ```bash
   ./broadcast-service -web :8081 -port 9999
   ```
3. **Open the Dashboards**:
   * Open `http://localhost:8080` in one browser tab.
   * Open `http://localhost:8081` in a second browser tab.

Both dashboards will display each other as active peers and sync messages instantly over the local UDP multicast mesh.

---

## Running as a Background System Service (systemd)

You can configure the node to run as a persistent system service.

1. Copy the service template into your systemd configuration:
   ```bash
   sudo cp broadcast.service /etc/systemd/system/broadcast.service
   ```
2. Reload systemd daemon to recognize the new service:
   ```bash
   sudo systemctl daemon-reload
   ```
3. Enable the service to start automatically on system boot:
   ```bash
   sudo systemctl enable broadcast.service
   ```
4. Start the service immediately:
   ```bash
   sudo systemctl start broadcast.service
   ```
5. Check status logs:
   ```bash
   sudo systemctl status broadcast.service
   # or view live logs via journalctl
   journalctl -u broadcast-service -f
   ```

---

## Testing / API Recipes

You can send broadcasts programmatically using simple cURL requests to the local node's web API.

### Broadcast a Message (REST API)
```bash
curl -X POST http://localhost:8080/api/send \
  -H "Content-Type: application/json" \
  -d '{"content": "System Alert: Maintenance beginning in 10 minutes!"}'
```

### Retrieve Node Identity Info
```bash
curl http://localhost:8080/api/info
```
Returns:
```json
{"hostname":"my-server-node","ip":"192.168.1.50"}
```
