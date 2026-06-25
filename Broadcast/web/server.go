package web

import (
	"embed"
	"encoding/json"
	"io/fs"
	"log"
	"net/http"
	"sync"
	"time"

	"broadcast-service/network"
	"github.com/gorilla/websocket"
)

//go:embed static/*
var staticFS embed.FS

// WSMessage represents a message sent to the WebSocket clients.
type WSMessage struct {
	Type string      `json:"type"` // "peers" or "message" or "history"
	Data interface{} `json:"data"`
}

// WebServer coordinates serving UI pages and handling real-time WebSocket connections.
type WebServer struct {
	addr        string
	ns          *network.NetworkService
	pm          *network.PeerManager
	upgrader    websocket.Upgrader
	clients     map[*websocket.Conn]bool
	clientsMu   sync.Mutex
	history     []network.Packet
	historyMu   sync.RWMutex
	maxHistory  int
}

// NewWebServer initializes a WebServer instance.
func NewWebServer(addr string, ns *network.NetworkService, pm *network.PeerManager) *WebServer {
	return &WebServer{
		addr: addr,
		ns:   ns,
		pm:   pm,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // Allow connection from any client origin
			},
		},
		clients:    make(map[*websocket.Conn]bool),
		history:    make([]network.Packet, 0),
		maxHistory: 50,
	}
}

// Start launches the HTTP server.
func (ws *WebServer) Start() error {
	// Extract sub-filesystem static/ to serve files at the root route
	staticSub, err := fs.Sub(staticFS, "static")
	if err != nil {
		return err
	}

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.FS(staticSub)))
	mux.HandleFunc("/ws", ws.handleWebSocket)
	mux.HandleFunc("/api/send", ws.handleSendMessage)
	mux.HandleFunc("/api/info", ws.handleNodeInfo)

	// Attach listener from the NetworkService to feed received packets into the WebSocket clients
	ws.ns.OnMessage = func(p network.Packet) {
		ws.addMessageToHistory(p)
		ws.broadcastToWebSockets(WSMessage{
			Type: "message",
			Data: p,
		})
	}

	// Register callback in PeerManager to broadcast updated peer list to UI clients
	ws.pm.UpdatePeer(ws.ns.Hostname, ws.ns.LocalIP) // Make sure self is on list
	ws.pm.OnChange(func(peers []network.Peer) {
		ws.broadcastToWebSockets(WSMessage{
			Type: "peers",
			Data: peers,
		})
	})

	server := &http.Server{
		Addr:    ws.addr,
		Handler: mux,
	}

	log.Printf("[Web] HTTP dashboard server running on http://%s", ws.addr)
	return server.ListenAndServe()
}

// addMessageToHistory appends a packet to the in-memory chat history buffer.
func (ws *WebServer) addMessageToHistory(p network.Packet) {
	ws.historyMu.Lock()
	defer ws.historyMu.Unlock()

	ws.history = append(ws.history, p)
	if len(ws.history) > ws.maxHistory {
		ws.history = ws.history[1:]
	}
}

// getHistory retrieves the cache of recent broadcast packets.
func (ws *WebServer) getHistory() []network.Packet {
	ws.historyMu.RLock()
	defer ws.historyMu.RUnlock()

	// Return a copy
	res := make([]network.Packet, len(ws.history))
	copy(res, ws.history)
	return res
}

// handleWebSocket upgrades clients to WebSockets and routes their event registrations.
func (ws *WebServer) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := ws.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[WebSocket] Upgrade failed: %v", err)
		return
	}

	ws.clientsMu.Lock()
	ws.clients[conn] = true
	ws.clientsMu.Unlock()

	// Send current history and online peers immediately on connection
	ws.historyMu.RLock()
	historyCopy := make([]network.Packet, len(ws.history))
	copy(historyCopy, ws.history)
	ws.historyMu.RUnlock()

	_ = conn.WriteJSON(WSMessage{
		Type: "history",
		Data: historyCopy,
	})

	_ = conn.WriteJSON(WSMessage{
		Type: "peers",
		Data: ws.pm.GetPeers(),
	})

	// Keep connection alive and clean up on disconnect
	go func() {
		defer func() {
			conn.Close()
			ws.clientsMu.Lock()
			delete(ws.clients, conn)
			ws.clientsMu.Unlock()
		}()

		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				break
			}
		}
	}()
}

// handleSendMessage exposes a REST API endpoint to post new broadcast messages.
func (ws *WebServer) handleSendMessage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Content string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	if req.Content == "" {
		http.Error(w, "Message content cannot be empty", http.StatusBadRequest)
		return
	}

	// Broadcast via UDP
	if err := ws.ns.SendBroadcast(req.Content); err != nil {
		log.Printf("[Network] Broadcast failed: %v", err)
		http.Error(w, "Failed to broadcast message", http.StatusInternalServerError)
		return
	}

	// Also display in our own dashboard
	selfPacket := network.Packet{
		Type:       "message",
		ID:         "local-" + time.Now().Format("20060102150405"),
		SenderHost: ws.ns.Hostname,
		SenderIP:   ws.ns.LocalIP,
		Content:    req.Content,
		Timestamp:  time.Now().Unix(),
	}
	ws.addMessageToHistory(selfPacket)
	ws.broadcastToWebSockets(WSMessage{
		Type: "message",
		Data: selfPacket,
	})

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// handleNodeInfo returns the current host's identification parameters.
func (ws *WebServer) handleNodeInfo(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	info := map[string]string{
		"hostname": ws.ns.Hostname,
		"ip":       ws.ns.LocalIP,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(info)
}

// broadcastToWebSockets pushes events to all connected dashboard instances.
func (ws *WebServer) broadcastToWebSockets(msg WSMessage) {
	ws.clientsMu.Lock()
	defer ws.clientsMu.Unlock()

	for client := range ws.clients {
		err := client.WriteJSON(msg)
		if err != nil {
			log.Printf("[WebSocket] Send failed, closing client: %v", err)
			client.Close()
			delete(ws.clients, client)
		}
	}
}
