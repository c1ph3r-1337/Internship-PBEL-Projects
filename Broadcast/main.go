package main

import (
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"broadcast-service/network"
	"broadcast-service/web"
)

func main() {
	// Parse CLI parameters
	portFlag := flag.Int("port", 9999, "UDP port for P2P broadcast and multicast")
	webFlag := flag.String("web", ":8080", "Address (IP:PORT) to bind the web dashboard server")
	pruneFlag := flag.Int("prune-timeout", 15, "Seconds of inactivity before pruning offline peers")
	flag.Parse()

	log.Println("[App] Starting Broadcast Node Service...")

	// 1. Initialize Peer Manager
	pruneTimeout := time.Duration(*pruneFlag) * time.Second
	pm := network.NewPeerManager(pruneTimeout)

	// 2. Initialize Network Service (UDP)
	ns := network.NewNetworkService(*portFlag, pm)
	if err := ns.Start(); err != nil {
		log.Fatalf("[App] Failed to start network listener: %v", err)
	}

	// 3. Initialize Web Server (HTTP/WebSocket)
	ws := web.NewWebServer(*webFlag, ns, pm)
	
	// Run Web Server in a separate goroutine
	go func() {
		if err := ws.Start(); err != nil {
			log.Fatalf("[App] Web server failed: %v", err)
		}
	}()

	// 4. Trap OS interrupts for clean shutdowns
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	
	sig := <-sigChan
	log.Printf("[App] Received shutdown signal: %v. Initiating graceful termination...", sig)

	// Shutdown services
	ns.Stop()
	log.Println("[App] Goodbye!")
}
