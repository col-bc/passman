#!/usr/bin/env bash

# Replace this with your actual SSH tunnel command
# -N prevents opening a remote shell, -L sets up the port forwarding
SSH_CMD="ssh -N -L 5432:localhost:5432 portfolio.us-east1-c.portfolio-489202"

echo "[⏳] Starting SSH tunnel..."

# 1. Start the SSH tunnel in the background
$SSH_CMD &
SSH_PID=$!

# Give it a second to establish (or fail immediately, like if a port is in use)
sleep 1

# 2. Check if the process is still running
if kill -0 $SSH_PID 2>/dev/null; then
    echo "[✅] SSH Tunnel Established. Press [cntl-c] to terminate the tunnel."
    
    # 3. Trap Ctrl-C (SIGINT) and clean up the background process
    trap "echo -e '\n[🛑] Terminating tunnel...'; kill $SSH_PID; exit 0" SIGINT SIGTERM
    
    # 4. Keep the script alive while the SSH tunnel runs
    wait $SSH_PID
else
    echo "[❌] Tunnel failed to start. Check your SSH command or port availability."
    exit 1
fi
