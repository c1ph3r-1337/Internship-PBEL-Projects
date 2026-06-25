document.addEventListener('DOMContentLoaded', () => {
    const localHostEl = document.getElementById('local-host');
    const localIpEl = document.getElementById('local-ip');
    const peerListEl = document.getElementById('peer-list');
    const peerCountEl = document.getElementById('peer-count');
    const messagesContainer = document.getElementById('messages-container');
    const emptyStateEl = document.getElementById('empty-state');
    const broadcastForm = document.getElementById('broadcast-form');
    const messageInput = document.getElementById('message-input');

    let ws;
    let localNode = { hostname: 'Resolving...', ip: '0.0.0.0' };
    let reconnectInterval = 1000;

    // Fetch local node details on launch
    async function fetchNodeInfo() {
        try {
            const response = await fetch('/api/info');
            if (response.ok) {
                localNode = await response.json();
                localHostEl.textContent = localNode.hostname;
                localIpEl.textContent = localNode.ip;
            }
        } catch (err) {
            console.error('Failed to retrieve node info:', err);
        }
    }

    // Connect WebSocket
    function connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('WebSocket connection established.');
            reconnectInterval = 1000; // Reset reconnect timer
        };

        ws.onmessage = (event) => {
            try {
                const packet = JSON.parse(event.data);
                handleWSMessage(packet);
            } catch (err) {
                console.error('Error parsing WebSocket payload:', err);
            }
        };

        ws.onclose = () => {
            console.warn(`WebSocket closed. Reconnecting in ${reconnectInterval / 1000}s...`);
            setTimeout(() => {
                reconnectInterval = Math.min(reconnectInterval * 1.5, 30000); // Backoff limit
                connectWebSocket();
            }, reconnectInterval);
        };

        ws.onerror = (err) => {
            console.error('WebSocket error:', err);
            ws.close();
        };
    }

    // Handle incoming events from Go WebSocket server
    function handleWSMessage(packet) {
        switch (packet.type) {
            case 'history':
                renderHistory(packet.data);
                break;
            case 'peers':
                renderPeers(packet.data);
                break;
            case 'message':
                appendMessage(packet.data);
                break;
        }
    }

    // Generate deterministic HSL colors based on the host IP address
    function getIPColor(ip) {
        if (!ip) return 'hsl(260, 70%, 75%)';
        let hash = 0;
        for (let i = 0; i < ip.length; i++) {
            hash = ip.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash) % 360;
        return `hsl(${h}, 65%, 70%)`; // Crisp pastel colors
    }

    // Render active peer list
    function renderPeers(peers) {
        peerListEl.innerHTML = '';
        
        // Exclude self from peer count, but show in directory
        const externalPeers = peers.filter(p => p.ip !== localNode.ip && p.is_active);
        peerCountEl.textContent = externalPeers.length;

        if (peers.length === 0) {
            peerListEl.innerHTML = `
                <div class="loading-placeholder">
                    <div class="spinner"></div>
                    <span>Searching for other hosts...</span>
                </div>`;
            return;
        }

        // Sort peers: active first, then alphabetically by hostname
        peers.sort((a, b) => {
            if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
            return a.hostname.localeCompare(b.hostname);
        });

        peers.forEach(peer => {
            const isSelf = peer.ip === localNode.ip;
            const li = document.createElement('li');
            li.className = 'peer-item';
            if (!peer.is_active) li.style.opacity = '0.5';

            const initials = peer.hostname.slice(0, 2).toUpperCase();
            const avatarColor = getIPColor(peer.ip);

            li.innerHTML = `
                <div class="peer-avatar" style="background: ${avatarColor}">
                    ${initials}
                </div>
                <div class="peer-details">
                    <span class="peer-name">${peer.hostname} ${isSelf ? '<span class="badge" style="padding: 1px 4px; font-size: 0.65rem;">You</span>' : ''}</span>
                    <span class="peer-ip">${peer.ip}</span>
                </div>
                ${peer.is_active ? '<div class="peer-status"></div>' : ''}
            `;
            peerListEl.appendChild(li);
        });
    }

    // Render history packets
    function renderHistory(packets) {
        // Clear empty state if history exists
        if (packets && packets.length > 0) {
            emptyStateEl.style.display = 'none';
            packets.forEach(p => appendMessage(p, false));
            scrollToBottom();
        }
    }

    // Append single packet bubble to container
    function appendMessage(packet, scroll = true) {
        // Avoid adding duplicate placeholder templates
        if (document.getElementById(packet.id)) return;

        emptyStateEl.style.display = 'none';

        const isSelf = packet.sender_ip === localNode.ip || packet.id.startsWith('local-');
        const msgRow = document.createElement('div');
        msgRow.className = `msg-row ${isSelf ? 'self' : ''}`;
        msgRow.id = packet.id;

        const timeString = new Date(packet.timestamp * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const color = getIPColor(packet.sender_ip);

        msgRow.innerHTML = `
            <div class="msg-bubble">
                <div class="msg-info">
                    <span class="msg-author">${packet.sender_host}</span>
                    <span class="msg-ip" style="background: ${color}20; color: ${color}; border: 1px solid ${color}40">${packet.sender_ip}</span>
                    <span class="msg-time">${timeString}</span>
                </div>
                <div class="msg-body">${escapeHTML(packet.content)}</div>
            </div>
        `;

        messagesContainer.appendChild(msgRow);

        if (scroll) {
            scrollToBottom();
        }
    }

    // Scroll chat window to bottom
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // HTML Escape to prevent XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Message Input Keybindings
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitBroadcast();
        }
    });

    // Form submission
    broadcastForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitBroadcast();
    });

    // Post broadcast message to server REST endpoint
    async function submitBroadcast() {
        const text = messageInput.value.trim();
        if (!text) return;

        // Clear input early for snap responsive feel
        messageInput.value = '';

        try {
            const response = await fetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text })
            });

            if (!response.ok) {
                console.error('API Send failed:', await response.text());
            }
        } catch (err) {
            console.error('Error posting message:', err);
        }
    }

    // Initialize Web App
    fetchNodeInfo().then(connectWebSocket);
});
