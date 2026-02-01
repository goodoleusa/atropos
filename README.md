# Atropos - Security Investigation Platform

A comprehensive AI-powered security investigation platform with dual purposes: professional bug bounty/security research tools and hidden CTF game elements.

## Quick Start

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5000`.

## Features

### Core Platform
- **AI-Powered OSINT Agent**: Investigation assistant with pre-built campaigns (Shell Corp, BGP Tracing, Threat Hunting, etc.)
- **Campaign Designer**: Visual Twine-inspired flow editor for creating investigation paths with wikilinks and branching logic
- **AI Lab (Battleground)**: Prompt engineering playground with model comparison, token cost tracking, and AI pentesting challenges
- **Report Builder**: Structure bug bounty findings with export capabilities and AI benchmarking
- **Terminal Interface**: Custom command-line experience with hidden CTF elements

### Investigation Capabilities
- **Passive Reconnaissance**: DNS enumeration, certificate transparency, WHOIS analysis
- **Active Reconnaissance**: Port scanning, service detection, vulnerability probing
- **Network Analysis**: BGP tracing, topology mapping, traffic analysis
- **Threat Hunting**: IOC detection, log analysis, persistence identification
- **Social Engineering Recon**: Personnel profiling, org structure mapping

### Design
- **Mobile-First**: 48px+ touch targets, responsive layouts, touch-friendly terminal
- **Molten Bronze Aesthetic**: Dark theme with amber/gold accents and vaporwave teal highlights
- **No Green Elements**: Intentional design constraint for visual consistency

## Project Structure

```
client/
├── src/
│   ├── components/          # React components
│   │   ├── AgentChat.tsx        # AI investigation assistant
│   │   ├── CampaignDesigner.tsx # Visual flow editor
│   │   └── Terminal.tsx         # Custom terminal
│   ├── config/
│   │   ├── agentCampaigns.ts    # Investigation campaign definitions
│   │   ├── agentPrompts.ts      # AI system prompts
│   │   └── bountyConfig.ts      # Bug bounty tools & resources
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Route pages
│   └── stores/              # Zustand state stores
server/
├── routes.ts                # API endpoints
├── storage.ts               # Database interface (IStorage)
└── index.ts                 # Express server entry
shared/
└── schema.ts                # Drizzle ORM schema
docs/
└── YUBIKEY_SSH_SETUP.md     # SSH key setup guide
```

## Customizing Agent Campaigns

Agent campaigns are defined in `client/src/config/agentCampaigns.ts`. See [replit.md](./replit.md) for detailed customization instructions.

### Quick Example

```typescript
{
  id: 'my_campaign',
  name: 'My Investigation',
  icon: '🔍',
  description: 'Brief description',
  difficulty: 'intermediate',
  estimatedTime: '30-45 min',
  tags: ['OSINT', 'Recon'],
  color: 'teal',
  starterPrompt: `Investigation prompt...`,
  objectives: ['Goal 1', 'Goal 2'],
  tools: ['Shodan', 'Censys']
}
```

## Environment Variables

Required secrets (set via Replit Secrets):
- `OPENROUTER_API_KEY` - For AI agent functionality
- `DATABASE_URL` - PostgreSQL connection (auto-configured on Replit)

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Framer Motion, Wouter
- **Backend**: Node.js, Express, TypeScript (ESM)
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenRouter (Claude, GPT-4, Llama, etc.)
- **Auth**: Replit OpenID Connect
- **UI**: shadcn/ui (Radix UI primitives)

## Development

### External IDE Setup (Cursor/VS Code)

See [docs/YUBIKEY_SSH_SETUP.md](./docs/YUBIKEY_SSH_SETUP.md) for connecting via SSH with YubiKey.

### Key Commands

```bash
npm run dev          # Start development server
npm run db:push      # Sync database schema
npm run build        # Build for production
```

## Related Tools

Atropos integrates with and recommends:
- **RITA** - Real Intelligence Threat Analytics for C2 detection
- **CAI** - AI-powered pentesting framework
- **Shodan/Censys** - Internet-connected device search
- **SecurityTrails** - Historical DNS/WHOIS data

## License

MIT

---

**Built with Atropos** - Security research made intelligent.
