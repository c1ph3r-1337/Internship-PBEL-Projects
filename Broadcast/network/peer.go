package network

import (
	"sync"
	"time"
)

// Packet represents the JSON structure sent over the network.
type Packet struct {
	Type       string `json:"type"`        // "heartbeat" or "message"
	ID         string `json:"id"`          // Unique message identifier
	SenderHost string `json:"sender_host"` // Sender's hostname
	SenderIP   string `json:"sender_ip"`   // Sender's IP address
	Content    string `json:"content"`     // Message text
	Timestamp  int64  `json:"timestamp"`   // Unix timestamp in seconds
}

// Peer represents an active host on the broadcast network.
type Peer struct {
	Hostname  string    `json:"hostname"`
	IP        string    `json:"ip"`
	LastSeen  time.Time `json:"last_seen"`
	IsActive  bool      `json:"is_active"`
}

// PeerManager maintains the directory of active peers on the network.
type PeerManager struct {
	mu           sync.RWMutex
	peers        map[string]*Peer
	pruneTimeout time.Duration
	onChange     func([]Peer)
}

// NewPeerManager creates a new PeerManager.
func NewPeerManager(pruneTimeout time.Duration) *PeerManager {
	pm := &PeerManager{
		peers:        make(map[string]*Peer),
		pruneTimeout: pruneTimeout,
	}
	go pm.startPruner()
	return pm
}

// OnChange registers a callback function to run when the active peer list updates.
func (pm *PeerManager) OnChange(f func([]Peer)) {
	pm.mu.Lock()
	pm.onChange = f
	pm.mu.Unlock()
}

// UpdatePeer adds or updates a peer in the manager.
func (pm *PeerManager) UpdatePeer(hostname, ip string) {
	pm.mu.Lock()
	p, exists := pm.peers[ip]
	if !exists {
		p = &Peer{
			Hostname: hostname,
			IP:       ip,
		}
		pm.peers[ip] = p
	}
	p.LastSeen = time.Now()
	p.IsActive = true
	pm.mu.Unlock()

	pm.notifyChange()
}

// GetPeers returns a slice of all active peers.
func (pm *PeerManager) GetPeers() []Peer {
	pm.mu.RLock()
	defer pm.mu.RUnlock()

	var result []Peer
	for _, p := range pm.peers {
		if p.IsActive {
			result = append(result, *p)
		}
	}
	return result
}

// startPruner periodically checks for inactive peers.
func (pm *PeerManager) startPruner() {
	ticker := time.NewTicker(5 * time.Second)
	for range ticker.C {
		pm.mu.Lock()
		changed := false
		now := time.Now()
		for ip, p := range pm.peers {
			if p.IsActive && now.Sub(p.LastSeen) > pm.pruneTimeout {
				p.IsActive = false
				changed = true
				// Clean up completely inactive peers after 2x prune timeout
				if now.Sub(p.LastSeen) > pm.pruneTimeout*2 {
					delete(pm.peers, ip)
				}
			}
		}
		pm.mu.Unlock()

		if changed {
			pm.notifyChange()
		}
	}
}

func (pm *PeerManager) notifyChange() {
	if pm.onChange != nil {
		pm.onChange(pm.GetPeers())
	}
}
