# Campaign Learning Metadata Template

Use this template to add learning integration to existing campaigns.

## Template Structure

```typescript
{
  id: 'campaign_id',
  name: 'Campaign Name',
  // ... existing fields ...
  
  // === ADD THESE FIELDS ===
  
  learningObjectives: [
    { 
      goal: 'learning_goal_from_learningConfig', 
      weight: 1-10, 
      description: 'What this campaign teaches about this goal' 
    }
  ],
  
  skillsRequired: [
    'Prerequisite skill 1',
    'Prerequisite skill 2'
  ],
  
  skillsTaught: [
    'New skill 1',
    'New skill 2',
    'New skill 3'
  ],
  
  learningOutcomes: [
    'Student will be able to...',
    'Student will be able to...',
    'Student will be able to...'
  ],
  
  industryContext: 'How professionals use this skill. Real-world application. Job relevance.',
  
  realWorldExamples: [
    'Actual incident/investigation 1',
    'Actual incident/investigation 2'
  ],
  
  careerPaths: [
    'Job Title 1',
    'Job Title 2'
  ],
  
  teachingAdaptations: {
    experiential: 'Jump in, try the tools, learn by doing. Minimal upfront theory.',
    visual: 'Draw diagrams, create visualizations, map relationships graphically.',
    analytical: 'Study theory first, understand frameworks, then apply with deep knowledge.',
    social: 'Reference community resources, discussions, collaborative approaches.',
    pragmatic: 'Here\'s the exact workflow. Commands to run. Get results fast.'
  }
}
```

## Available Learning Goals

From `learningConfig.ts`:

```typescript
// Core domains:
'bgp_routing'
'osint_investigation'
'threat_hunting'
'malware_reverse_engineering'
'incident_response'
'penetration_testing'
'vulnerability_research'
'forensics'
'social_engineering'
'network_security'
'cloud_security'
'red_teaming'
'blue_teaming'

// OSINT specializations:
'geolocation_osint'
'socmint'
'financial_investigation'
'crypto_blockchain_investigation'
'nation_state_threat_intel'
'dark_web_intelligence'
```

## Campaigns Requiring Updates

### Already Updated ✅:
1. shell_corp_osint - Financial investigation
2. bgp_trace - BGP routing
3. passive_recon - OSINT fundamentals

### High Priority (Core Skills):
1. **active_recon** - Penetration testing + network security
2. **dark_web_intel** - Dark web intelligence
3. **crypto_analysis** - Crypto blockchain investigation
4. **threat_hunting** - Threat hunting + nation state threat intel
5. **malware_triage** - Malware reverse engineering
6. **social_engineering** - Social engineering + SOCMINT
7. **phishing_analysis** - Social engineering + SOCMINT
8. **incident_response** - Incident response

### Medium Priority (Specialized):
9. **network_topology** - Network security
10. **osint** - General OSINT investigation
11. **network** - Network security
12. **defense** - Blue teaming
13. **analysis** - Forensics

### Low Priority (Perspectives - can be generic):
14-19. adversary, defender, insider, supply_chain, temporal, financial
      - These are meta-perspectives, use generic learning objectives

## Quick Reference by Difficulty

### Beginner Campaigns:
- passive_recon ✅ (updated)
- osint (needs update)
- recon (needs update)

### Intermediate Campaigns:
- shell_corp_osint ✅ (updated)
- active_recon (needs update)
- phishing_analysis (needs update)
- social_engineering (needs update)

### Advanced Campaigns:
- bgp_trace ✅ (updated)
- network_topology (needs update)
- threat_hunting (needs update)
- dark_web_intel (needs update)
- malware_triage (needs update)
- crypto_analysis (needs update)

### Expert Campaigns:
- incident_response (needs update)
- nation_state (implied, needs creation)

## Example: Dark Web Investigation

```typescript
learningObjectives: [
  { goal: 'dark_web_intelligence', weight: 10, description: 'Navigate and investigate dark web marketplaces safely' },
  { goal: 'osint_investigation', weight: 6, description: 'Apply OSINT to underground forums' }
],
skillsRequired: ['Basic OSINT', 'Understanding of anonymity networks'],
skillsTaught: ['Tor navigation', 'Marketplace analysis', 'Vendor profiling', 'Operational security'],
learningOutcomes: [
  'Navigate Tor hidden services safely',
  'Investigate dark web marketplaces',
  'Profile cybercrime vendors',
  'Monitor stolen data listings',
  'Maintain operational security'
],
industryContext: 'Law enforcement, cybersecurity firms, and fraud teams monitor dark web for stolen credentials, malware sales, and criminal activity. Essential for threat intelligence.',
realWorldExamples: [
  'Silk Road investigation and takedown',
  'AlphaBay market seizure',
  'Ransomware payment tracking',
  'Credential marketplace monitoring'
],
careerPaths: ['Threat Intelligence Analyst', 'Law Enforcement Cyber Investigator', 'Fraud Analyst'],
teachingAdaptations: {
  experiential: 'Install Tor, navigate to a dark web search engine, explore marketplace listings. Learn by exploring with guidance on what to look for.',
  visual: 'Map vendor relationships, visualize marketplace ecosystems, create network graphs of criminal connections.',
  analytical: 'Study Tor architecture, onion routing, cryptocurrency transactions. Understand anonymity systems before investigating.',
  social: 'Read Bellingcat dark web investigations, study OSINT Curious podcast episodes on underground intel, reference law enforcement case studies.',
  pragmatic: 'Use DarkSearch or Ahmia to find markets. Screenshot everything. Track vendors with spreadsheets. Extract data efficiently.'
}
```

## Implementation Notes

- Weight 10 = primary skill for this campaign
- Weight 5-7 = significant secondary skill
- Weight 1-3 = tangential/supporting skill
- Keep realWorldExamples to 3-5 notable incidents
- careerPaths should be actual job titles from job boards
- industryContext should answer "why does this matter professionally?"
- teachingAdaptations must be ACTIONABLE, not vague

## Status

Updated: 3/23 campaigns (13%)
Target: At least 10/23 campaigns (43%) for merge
Full coverage: 23/23 campaigns (100%) - nice to have
