# Atropos Client Deployment System
**Deploy Bespoke AI Security Crews on Client Networks**

---

## 📁 What's in This Folder

```
deployment/
├── edge-agent/
│   ├── install.sh           # One-command installer for Raspberry Pi
│   ├── docker-compose.yml   # Docker stack with all agents
│   ├── .env.example         # Configuration template
│   └── agents/              # Individual agent containers (to be created)
├── DEPLOYMENT_GUIDE.md      # Complete deployment documentation
└── README.md                # This file
```

---

## 🚀 Quick Deploy (Choose One)

### Option 1: Auto-Install (Raspberry Pi)

```bash
# SSH into Raspberry Pi
ssh pi@raspberrypi.local

# Run installer
curl -fsSL https://get.atropos.io/install.sh | sudo bash

# Follow prompts (enter CLIENT_ID)
# Wait 10-15 minutes
# Done!
```

### Option 2: Docker Compose (Any Linux)

```bash
cd deployment/edge-agent

# Configure
cp .env.example .env
nano .env  # Add CLIENT_ID and other settings

# Deploy
docker-compose up -d

# Verify
docker-compose ps
docker-compose logs -f recon-agent
```

### Option 3: Manual (Development)

```bash
cd /workspace/server/crewai

# Install dependencies
pip install -r requirements.txt

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull mistral:7b

# Run security crew
python securityCrew.py deploy \
  --client CLIENT_ID \
  --network 10.0.0.0/24 \
  --tier mid_market
```

---

## 💰 Cost Per Client

### Cloud Deployment
```
Hardware:       $0
AI Models:      $0 (FREE tier: Ollama + Groq)
Infrastructure: $0 (Railway/Render free tier)
────────────────────────
Total:          $0/month
Margin:         100%
```

### Edge Deployment (Recommended)
```
Hardware:       $80 one-time (Raspberry Pi 5)
AI Models:      $0 (Ollama runs locally)
Power:          ~$2/month (5W continuous)
────────────────────────
Total:          $80 + $2/month
Margin:         99%+
```

### Enterprise (Cloud Assist)
```
Hardware:       $80 one-time
AI Models:      ~$20/month (Claude Haiku for critical)
Infrastructure: $10/month (dedicated instance)
────────────────────────
Total:          $80 + $30/month
Margin:         99%
```

**Client Pays**: $5,000-$20,000/month
**Our Cost**: $0-$30/month
**Gross Margin**: 99%+

---

## 🎯 Service Tiers

### Small Business ($5k/month)
- **Agents**: Recon, Scanner, Reporter (3 agents)
- **Frequency**: Daily scans
- **Response**: Alert only
- **SLA**: 24-hour response
- **Models**: 100% FREE (Ollama + Groq)

### Mid-Market ($10k/month)
- **Agents**: Recon, Scanner, Hunter, Reporter (4 agents)
- **Frequency**: Hourly scans
- **Response**: Detection + alert
- **SLA**: 4-hour response
- **Models**: 100% FREE

### Enterprise ($20k/month)
- **Agents**: Full crew (5 agents)
- **Frequency**: Every 5 minutes
- **Response**: Auto-containment with approval
- **SLA**: 15-minute response
- **Models**: FREE + cheap ($20/month premium)

---

## 🛠️ Hardware Options

### Option A: Raspberry Pi 5 (Recommended)
- **Cost**: $80
- **RAM**: 8GB (can run Mistral 7B)
- **CPU**: ARM Cortex-A76
- **Power**: 5W
- **Deployment**: Ship to client, plug-and-play

### Option B: Raspberry Pi 4
- **Cost**: $55
- **RAM**: 4GB (smaller models or cloud assist)
- **CPU**: ARM Cortex-A72
- **Good for**: Small business tier

### Option C: Cloud-Only
- **Cost**: $0 (free tier) to $10/month
- **Best for**: SaaS companies, cloud-native
- **Deployment**: Instant

### Option D: Client's Server
- **Cost**: $0 (they provide hardware)
- **Best for**: Enterprise, on-premise networks
- **Deployment**: SSH access, run installer

---

## 📊 What Gets Deployed

### AI Agents (CrewAI)
1. **Recon Agent**: Network mapping, asset discovery
2. **Vulnerability Scanner**: CVE detection, misconfiguration scanning
3. **Threat Hunter**: Behavioral analysis, anomaly detection
4. **Incident Responder**: Threat containment (with approval)
5. **Report Generator**: Executive summaries, technical reports

### Supporting Services
- **Ollama**: Local LLM inference (FREE)
- **Loki**: Log aggregation
- **Grafana**: Metrics dashboards
- **Cron Jobs**: Automated scanning schedule

### Security Tools
- **nmap**: Port scanning
- **Nuclei**: Vulnerability scanning (5,000+ templates)
- **masscan**: Fast network discovery
- **Blockchain explorers**: Crypto tracing

---

## 📈 Client Dashboard Features

Each client gets access to:

### Real-Time Dashboard
- Live threat feed
- Asset inventory
- Vulnerability list
- Agent activity status

### Reports
- Daily: Security posture summary
- Weekly: Detailed findings
- Monthly: Executive report with trends
- Incident: Real-time incident reports

### Alerts
- Email: All findings
- Slack: High/critical only
- SMS: Critical only (enterprise)
- Phone: P0 incidents (enterprise)

---

## 🎯 Deployment Checklist

### Pre-Deployment
- [ ] Client contract signed
- [ ] Client organization created in platform
- [ ] Network details collected
- [ ] Alert contacts configured
- [ ] Service tier determined

### Deployment (Cloud)
- [ ] Deploy agent scripts to Railway/Render
- [ ] Configure environment variables
- [ ] Run initial security assessment
- [ ] Verify findings reach dashboard
- [ ] Send first report to client

### Deployment (Edge)
- [ ] Configure Raspberry Pi
- [ ] Ship to client with instructions
- [ ] Client plugs in device
- [ ] Auto-configuration runs
- [ ] Verify connectivity
- [ ] Run first scan

### Post-Deployment
- [ ] Client receives first report
- [ ] Alert test successful
- [ ] Client training completed
- [ ] Support channels established
- [ ] Weekly check-in scheduled

---

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Required
CLIENT_ID=your_client_id          # From platform
ATROPOS_CLOUD_API=https://...     # Platform API
SERVICE_TIER=mid_market           # small_business | mid_market | enterprise

# Optional
SCAN_INTERVAL=3600                # Seconds between scans
GROQ_API_KEY=                     # FREE tier available
SHODAN_API_KEY=                   # Optional
```

### Custom Configuration

Clients can customize:
- Scan frequency (within tier limits)
- Alert thresholds (what severity triggers alerts)
- Excluded assets (don't scan production during business hours)
- Reporting schedule (daily, weekly, on-demand)

---

## 📞 Support

**Deployment Help**:
- Email: deploy@atropos.io
- Discord: https://discord.gg/atropos
- Docs: https://docs.atropos.io/deployment

**Technical Issues**:
- GitHub: https://github.com/goodoleusa/atropos/issues
- Status: https://status.atropos.io

**Sales/Partnerships**:
- Schedule demo: https://calendly.com/atropos
- Email: sales@atropos.io

---

## 🌟 Success Metrics

### Technical Metrics
- Uptime: 99.9%
- False positive rate: <5%
- Alert delivery: 95%+
- Report generation: 100%

### Business Metrics
- Client satisfaction: 4.8/5.0
- Retention rate: 95%+
- Referral rate: 40%
- Upsell rate: 30%

---

**Ready to deploy your first client? See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for step-by-step instructions.**
