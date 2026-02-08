#!/bin/bash
#
# Test Atropos Security Agents Locally
# Demonstrates agent capabilities on safe test targets
#

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   ATROPOS SECURITY AGENT DEMO                             ║"
echo "║   Testing AI agents on safe targets                       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check dependencies
echo "🔍 Checking dependencies..."

if ! command -v python3 &> /dev/null; then
  echo -e "${RED}❌ Python 3 not found. Please install Python 3.8+${NC}"
  exit 1
fi

if ! command -v ollama &> /dev/null; then
  echo -e "${YELLOW}⚠️  Ollama not installed. Install with:${NC}"
  echo "   curl -fsSL https://ollama.com/install.sh | sh"
  echo ""
  read -p "Install Ollama now? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    curl -fsSL https://ollama.com/install.sh | sh
  else
    exit 1
  fi
fi

cd server/crewai

# Install Python dependencies if needed
if [ ! -d "venv" ]; then
  echo "📦 Creating Python virtual environment..."
  python3 -m venv venv
fi

echo "📦 Installing CrewAI and dependencies..."
source venv/bin/activate
pip install --quiet -r requirements.txt

# Pull required models
echo ""
echo "🧠 Downloading AI models (this may take a few minutes)..."
ollama pull mistral:7b
ollama pull nomic-embed-text

echo -e "${GREEN}✅ All dependencies ready${NC}"
echo ""

# ============================================================================
# DEMO 1: NETWORK SECURITY ASSESSMENT
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🛡️  DEMO 1: NETWORK SECURITY ASSESSMENT"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Target: scanme.nmap.org (safe test target)"
echo "Agents: Recon, Scanner, Reporter"
echo ""
read -p "Press Enter to start security assessment..."

python securityCrew.py deploy \
  --client DEMO_CLIENT_001 \
  --network scanme.nmap.org \
  --tier mid_market

echo ""
echo -e "${GREEN}✅ Security assessment complete!${NC}"
echo "Report saved: /tmp/security_report_DEMO_CLIENT_001.json"
echo ""
read -p "Press Enter to continue to next demo..."

# ============================================================================
# DEMO 2: ANTI-TRAFFICKING INVESTIGATION
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🚨 DEMO 2: ANTI-TRAFFICKING INVESTIGATION"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Scenario: Suspected trafficking recruitment on Instagram"
echo "Target: @demo_modeling_agency (fictional account)"
echo "Agents: SocMint, Crypto Tracer, Report Generator"
echo ""
read -p "Press Enter to start investigation..."

python securityCrew.py investigate \
  --client NGO_DEMO \
  --instagram @demo_modeling_agency \
  --bitcoin 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa

echo ""
echo -e "${GREEN}✅ Investigation complete!${NC}"
echo "Report saved: /tmp/investigation_NGO_DEMO.txt"
echo ""

# ============================================================================
# DEMO COMPLETE
# ============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉 DEMO COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Generated Reports:"
echo "1. /tmp/security_report_DEMO_CLIENT_001.json"
echo "2. /tmp/investigation_NGO_DEMO.txt"
echo ""
echo "Review these reports to see what clients will receive."
echo ""
echo "Cost of this demo: \$0.00"
echo "Traditional security assessment: \$15,000-$30,000"
echo "Traditional investigation: 2-4 weeks of analyst time"
echo ""
echo "Our agents did it in minutes."
echo ""
echo -e "${GREEN}This is what you're selling.${NC}"
echo ""
echo "Next steps:"
echo "1. Record screen capture of this demo"
echo "2. Add narration explaining what's happening"
echo "3. Edit to 5 minutes"
echo "4. Upload to YouTube"
echo "5. Send to investors and prospects"
echo ""
echo "═══════════════════════════════════════════════════════════"
