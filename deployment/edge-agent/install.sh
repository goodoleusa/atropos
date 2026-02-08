#!/bin/bash
#
# Atropos Edge Agent Installer
# Deploys AI security crew on client network (Raspberry Pi or Linux server)
#
# Usage: curl -fsSL https://get.atropos.io/install.sh | bash
#

set -e

echo "=================================================="
echo "  Atropos Edge Agent Installer"
echo "  AI-Powered Network Security Monitoring"
echo "=================================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "⚠️  Please run as root (sudo bash install.sh)"
  exit 1
fi

# Detect system
OS="$(uname -s)"
ARCH="$(uname -m)"

echo "Detected: $OS $ARCH"
echo ""

# Prompt for client ID
read -p "Enter your Client ID (from dashboard): " CLIENT_ID
if [ -z "$CLIENT_ID" ]; then
  echo "❌ Client ID is required"
  exit 1
fi

read -p "Enter Atropos Cloud API URL (default: https://atropos-platform.vercel.app): " CLOUD_API
CLOUD_API="${CLOUD_API:-https://atropos-platform.vercel.app}"

echo ""
echo "Installing for client: $CLIENT_ID"
echo ""

# 1. Install system dependencies
echo "📦 Installing system dependencies..."

if [ "$OS" = "Linux" ]; then
  apt-get update -qq
  apt-get install -y curl git python3 python3-pip python3-venv docker.io docker-compose nmap nuclei 2>&1 | grep -v "Selecting previously unselected"
elif [ "$OS" = "Darwin" ]; then
  brew install python3 docker docker-compose nmap nuclei
fi

# 2. Install Ollama (local LLM inference)
echo ""
echo "🧠 Installing Ollama (FREE local AI models)..."

if ! command -v ollama &> /dev/null; then
  curl -fsSL https://ollama.com/install.sh | sh
fi

# Pull required models
echo "Downloading AI models (this may take 5-10 minutes)..."
ollama pull mistral:7b
ollama pull nomic-embed-text

# 3. Install CrewAI and dependencies
echo ""
echo "🤖 Installing CrewAI framework..."

mkdir -p /opt/atropos
cd /opt/atropos

python3 -m venv venv
source venv/bin/activate

pip install --quiet crewai==0.28.8 crewai-tools==0.2.6 requests python-dotenv

# 4. Download agent scripts
echo ""
echo "📥 Downloading agent scripts..."

curl -fsSL https://raw.githubusercontent.com/goodoleusa/atropos/main/server/crewai/securityCrew.py > securityCrew.py
chmod +x securityCrew.py

# 5. Configure environment
echo ""
echo "⚙️  Configuring environment..."

cat > .env << EOF
CLIENT_ID=$CLIENT_ID
ATROPOS_CLOUD_API=$CLOUD_API
OLLAMA_HOST=http://localhost:11434
SCAN_FREQUENCY=3600
SERVICE_TIER=mid_market
EOF

# 6. Create systemd service
echo ""
echo "🔧 Setting up systemd service..."

cat > /etc/systemd/system/atropos-agent.service << EOF
[Unit]
Description=Atropos Security Agent
After=network.target ollama.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/atropos
Environment=PATH=/opt/atropos/venv/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=/opt/atropos/venv/bin/python securityCrew.py deploy --client $CLIENT_ID --network auto-detect --tier mid_market
Restart=always
RestartSec=300

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable atropos-agent
systemctl start atropos-agent

# 7. Create hourly scan cron job
echo ""
echo "⏰ Setting up automated scans..."

cat > /etc/cron.d/atropos-scan << EOF
# Atropos Security Agent - Hourly Network Scan
0 * * * * root cd /opt/atropos && venv/bin/python securityCrew.py deploy --client $CLIENT_ID --network auto-detect --tier mid_market >> /var/log/atropos.log 2>&1
EOF

# 8. Verify installation
echo ""
echo "✅ Installation complete!"
echo ""
echo "=================================================="
echo "  Atropos Edge Agent Status"
echo "=================================================="
echo ""
echo "Client ID: $CLIENT_ID"
echo "Cloud API: $CLOUD_API"
echo "Service: systemctl status atropos-agent"
echo "Logs: tail -f /var/log/atropos.log"
echo ""
echo "AI Models Installed:"
ollama list
echo ""
echo "Dashboard: $CLOUD_API/client-portal"
echo "=================================================="
echo ""
echo "🎉 Your network is now protected by AI agents!"
echo ""
echo "First scan will run in: 1 hour"
echo "Check your dashboard for results."
echo ""
