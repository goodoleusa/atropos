# NEXUS - Security Investigation Platform

A comprehensive security investigation platform with dual purposes: professional bug bounty/security research tools and hidden CTF game elements.

## Quick Start

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5000`.

## Features

- **AI-Powered OSINT Agent**: Investigation assistant with pre-built campaigns
- **Campaign Designer**: Visual flow editor for creating investigation paths
- **AI Lab**: Prompt engineering playground with model comparison
- **Report Builder**: Structure bug bounty findings with export capabilities
- **Terminal Interface**: Custom command-line experience
- **Mobile-First Design**: 48px+ touch targets, responsive layouts

## Customizing Agent Campaigns

Agent campaigns are defined in `client/src/config/agentCampaigns.ts`. This file controls the pre-built investigation workflows available in the NEXUS agent.

### Adding a New Campaign

```typescript
// In client/src/config/agentCampaigns.ts

// Add to AGENT_CAMPAIGNS array:
{
  id: 'my_new_campaign',           // Unique identifier
  name: 'My Campaign Name',        // Display name
  icon: '🔍',                      // Emoji for UI
  description: 'Brief description',
  difficulty: 'intermediate',      // beginner | intermediate | advanced | expert
  estimatedTime: '30-45 min',
  tags: ['OSINT', 'Recon'],
  color: 'teal',                   // Tailwind color
  starterPrompt: `Your detailed prompt that initializes the investigation...`,
  objectives: [
    'First goal to accomplish',
    'Second goal to accomplish'
  ],
  tools: ['Shodan', 'Censys', 'crt.sh']
}
```

### Adding OSINT Tools

```typescript
// Add to OSINT_TOOLS array:
{
  name: 'NewTool',
  purpose: 'What the tool does',
  whenToUse: 'Scenario when to recommend',
  exampleQuery: 'example query syntax',
  outputInterpretation: 'How to interpret results'
}
```

### Adding Adaptive Responses

```typescript
// Add to ADAPTIVE_RESPONSES object:
my_trigger_keyword: `
**Heading**
Markdown-formatted guidance that appears contextually...

**Next Steps:**
1. First action
2. Second action
`
```

### Adding Investigation Perspectives

```typescript
// Add to INVESTIGATION_PERSPECTIVES array:
{ 
  id: 'new_perspective', 
  name: 'Perspective Name', 
  icon: '🎯', 
  prompt: 'Guiding question for this mindset...' 
}
```

### Campaign Categories

Group campaigns for UI display in `CAMPAIGN_CATEGORIES`:

```typescript
{ 
  id: 'my_category', 
  name: 'Category Display Name', 
  campaigns: ['campaign_id_1', 'campaign_id_2'] 
}
```

## Project Structure

```
client/
├── src/
│   ├── components/      # React components
│   ├── config/          # Configuration files
│   │   ├── agentCampaigns.ts   # Campaign definitions
│   │   └── agentPrompts.ts     # System prompts
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Route pages
│   └── stores/          # Zustand state stores
server/
├── routes.ts            # API endpoints
├── storage.ts           # Database interface
└── index.ts             # Server entry
shared/
└── schema.ts            # Drizzle ORM schema
```

## Environment Variables

Required secrets (set via Replit Secrets):
- `OPENROUTER_API_KEY` - For AI agent functionality
- `DATABASE_URL` - PostgreSQL connection (auto-configured)

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenRouter (multiple model support)
- **Auth**: Replit OpenID Connect

## License

MIT
