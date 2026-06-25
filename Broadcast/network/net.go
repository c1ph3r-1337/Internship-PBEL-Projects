package network

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"os"
	"sync"
	"syscall"
	"time"

	"golang.org/x/net/ipv4"
	"golang.org/x/sys/unix"
)

// NetworkService coordinates sending and receiving broadcast/multicast packets.
type NetworkService struct {
	multicastAddr string
	broadcastAddr string
	port          int
	LocalIP       string
	Hostname      string
	pm            *PeerManager
	
	mu         sync.Mutex
	conns      []net.PacketConn
	receivedMu sync.Mutex
	receivedID map[string]time.Time
	
	OnMessage  func(Packet)
	stopChan   chan struct{}
	wg         sync.WaitGroup
}

// NewNetworkService initializes a new NetworkService.
func NewNetworkService(port int, pm *PeerManager) *NetworkService {
	hostname, err := os.Hostname()
	if err != nil {
		hostname = "unknown-host"
	}

	localIP, err := GetLocalIP()
	if err != nil {
		localIP = "127.0.0.1"
	}

	return &NetworkService{
		multicastAddr: fmt.Sprintf("239.0.0.1:%d", port),
		broadcastAddr: fmt.Sprintf("255.255.255.255:%d", port),
		port:          port,
		LocalIP:       localIP,
		Hostname:      hostname,
		pm:            pm,
		receivedID:    make(map[string]time.Time),
		stopChan:      make(chan struct{}),
	}
}

// GetLocalIP returns the non-loopback local IPv4 address.
func GetLocalIP() (string, error) {
	conn, err := net.Dial("udp", "8.8.8.8:80")
	if err != nil {
		// Fallback: iterate interfaces
		addrs, err := net.InterfaceAddrs()
		if err != nil {
			return "", err
		}
		for _, address := range addrs {
			if ipnet, ok := address.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
				if ipnet.IP.To4() != nil {
					return ipnet.IP.String(), nil
				}
			}
		}
		return "127.0.0.1", nil
	}
	defer conn.Close()
	localAddr := conn.LocalAddr().(*net.UDPAddr)
	return localAddr.IP.String(), nil
}

// Start starts all listeners and background processes.
func (ns *NetworkService) Start() error {
	// Bind a single UDP listener to 0.0.0.0:port with port-sharing socket options enabled
	addrStr := fmt.Sprintf("0.0.0.0:%d", ns.port)
	
	lc := net.ListenConfig{
		Control: func(network, address string, c syscall.RawConn) error {
			var err error
			controlErr := c.Control(func(fd uintptr) {
				err = unix.SetsockoptInt(int(fd), unix.SOL_SOCKET, unix.SO_REUSEADDR, 1)
				if err != nil {
					return
				}
				// SO_REUSEPORT allows multiple processes on the same machine to bind to the same port
				err = unix.SetsockoptInt(int(fd), unix.SOL_SOCKET, unix.SO_REUSEPORT, 1)
			})
			if controlErr != nil {
				return controlErr
			}
			return err
		},
	}

	conn, err := lc.ListenPacket(context.Background(), "udp4", addrStr)
	if err != nil {
		return fmt.Errorf("failed to bind UDP port %d: %v", ns.port, err)
	}

	// Join the multicast group on all active interfaces that support multicast
	pConn := ipv4.NewPacketConn(conn)
	mIP := net.ParseIP("239.0.0.1")

	interfaces, err := net.Interfaces()
	if err == nil {
		joinedAny := false
		for _, ifi := range interfaces {
			// Skip down, loopback, or non-multicast interfaces
			if ifi.Flags&net.FlagUp == 0 || ifi.Flags&net.FlagMulticast == 0 || ifi.Flags&net.FlagLoopback != 0 {
				continue
			}
			err := pConn.JoinGroup(&ifi, &net.UDPAddr{IP: mIP})
			if err == nil {
				joinedAny = true
			}
		}
		if !joinedAny {
			// Try with nil (default interface) if no specific interfaces succeeded
			_ = pConn.JoinGroup(nil, &net.UDPAddr{IP: mIP})
		}
	} else {
		// Fallback to nil interface
		_ = pConn.JoinGroup(nil, &net.UDPAddr{IP: mIP})
	}

	ns.mu.Lock()
	ns.conns = append(ns.conns, conn)
	ns.mu.Unlock()

	// Start reading from the connection
	ns.wg.Add(1)
	go ns.listenLoop(conn, "P2P-Mesh")

	// Start periodic heartbeat sender
	ns.wg.Add(1)
	go ns.heartbeatLoop()

	// Start cleanup routine for duplicate packet ID tracking
	go ns.cleanupReceivedIDs()

	log.Printf("[Network] Service started. Hostname: %s, Local IP: %s, Multicast: %s, Broadcast: %s",
		ns.Hostname, ns.LocalIP, ns.multicastAddr, ns.broadcastAddr)
	return nil
}

// Stop stops the service and closes connections.
func (ns *NetworkService) Stop() {
	close(ns.stopChan)
	ns.mu.Lock()
	for _, conn := range ns.conns {
		conn.Close()
	}
	ns.mu.Unlock()
	ns.wg.Wait()
	log.Println("[Network] Service stopped.")
}

// SendBroadcast transmits a text message to all nodes on the network.
func (ns *NetworkService) SendBroadcast(content string) error {
	packet := Packet{
		Type:       "message",
		ID:         generateUUID(),
		SenderHost: ns.Hostname,
		SenderIP:   ns.LocalIP,
		Content:    content,
		Timestamp:  time.Now().Unix(),
	}

	// Deduplicate our own messages so we don't display them twice when we receive them back
	ns.receivedMu.Lock()
	ns.receivedID[packet.ID] = time.Now()
	ns.receivedMu.Unlock()

	return ns.sendPacket(packet)
}

func (ns *NetworkService) sendPacket(packet Packet) error {
	data, err := json.Marshal(packet)
	if err != nil {
		return err
	}

	// Send to multicast
	mAddr, err := net.ResolveUDPAddr("udp4", ns.multicastAddr)
	if err == nil {
		conn, err := net.DialUDP("udp4", nil, mAddr)
		if err == nil {
			conn.Write(data)
			conn.Close()
		}
	}

	// Send to broadcast
	bAddr, err := net.ResolveUDPAddr("udp4", ns.broadcastAddr)
	if err == nil {
		// Needs to be dialable to write broadcast
		conn, err := net.DialUDP("udp4", nil, bAddr)
		if err == nil {
			conn.Write(data)
			conn.Close()
		}
	}

	return nil
}

// listenLoop reads packets from a connection and processes them.
func (ns *NetworkService) listenLoop(conn net.PacketConn, label string) {
	defer ns.wg.Done()
	buffer := make([]byte, 65535)

	for {
		n, srcAddr, err := conn.ReadFrom(buffer)
		if err != nil {
			select {
			case <-ns.stopChan:
				return
			default:
				log.Printf("[%s] Read error: %v", label, err)
				return
			}
		}

		var p Packet
		if err := json.Unmarshal(buffer[:n], &p); err != nil {
			// Ignore malformed packets (e.g. other services scanning ports)
			continue
		}

		// Prevent loops / duplicate packet delivery (multicast and broadcast packets both arriving)
		ns.receivedMu.Lock()
		if _, exists := ns.receivedID[p.ID]; exists {
			ns.receivedMu.Unlock()
			continue
		}
		ns.receivedID[p.ID] = time.Now()
		ns.receivedMu.Unlock()

		// Always update active peer status on any received packet
		ns.pm.UpdatePeer(p.SenderHost, p.SenderIP)

		// Process packet based on type
		switch p.Type {
		case "heartbeat":
			// PeerManager is already updated above, nothing extra to do.
		case "message":
			log.Printf("[%s] %s (%s): %s", label, p.SenderHost, p.SenderIP, p.Content)
			if ns.OnMessage != nil {
				ns.OnMessage(p)
			}
		default:
			log.Printf("[%s] Received unknown packet type: %s from %s", label, p.Type, srcAddr)
		}
	}
}

// heartbeatLoop sends periodic status updates to announce our presence.
func (ns *NetworkService) heartbeatLoop() {
	defer ns.wg.Done()
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	// Update self in local PeerManager and send initial heartbeat immediately
	ns.pm.UpdatePeer(ns.Hostname, ns.LocalIP)
	initialHeartbeat := Packet{
		Type:       "heartbeat",
		ID:         generateUUID(),
		SenderHost: ns.Hostname,
		SenderIP:   ns.LocalIP,
		Timestamp:  time.Now().Unix(),
	}
	_ = ns.sendPacket(initialHeartbeat)

	for {
		select {
		case <-ns.stopChan:
			return
		case <-ticker.C:
			// Refresh local IP in case network configuration changed (e.g. interface reconnect)
			if ip, err := GetLocalIP(); err == nil {
				ns.LocalIP = ip
			}
			
			ns.pm.UpdatePeer(ns.Hostname, ns.LocalIP)
			h := Packet{
				Type:       "heartbeat",
				ID:         generateUUID(),
				SenderHost: ns.Hostname,
				SenderIP:   ns.LocalIP,
				Timestamp:  time.Now().Unix(),
			}
			_ = ns.sendPacket(h)
		}
	}
}

// cleanupReceivedIDs prevents memory leaks by purging old tracking IDs.
func (ns *NetworkService) cleanupReceivedIDs() {
	ticker := time.NewTicker(1 * time.Minute)
	for range ticker.C {
		ns.receivedMu.Lock()
		now := time.Now()
		for id, t := range ns.receivedID {
			if now.Sub(t) > 2*time.Minute {
				delete(ns.receivedID, id)
			}
		}
		ns.receivedMu.Unlock()
	}
}

// generateUUID generates a standard RFC4122 v4 UUID format string.
func generateUUID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	// Apply UUID v4 variant & version bits
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}
