---
{
  "id": "bgp_trace",
  "name": "BGP Route Tracing",
  "icon": "🌐",
  "difficulty": "advanced",
  "estimatedTime": "30-45 min",
  "tags": [
    "Network",
    "BGP",
    "Infrastructure"
  ],
  "color": "teal",
  "targetFields": [
    {
      "key": "ip",
      "label": "IP Address",
      "type": "ip",
      "required": true,
      "placeholder": "185.199.108.153"
    },
    {
      "key": "asn",
      "label": "ASN (optional)",
      "type": "asn",
      "required": false,
      "placeholder": "AS13335"
    }
  ],
  "dummyTargets": {
    "ip": "185.199.108.153",
    "asn": "AS13335"
  },
  "learningObjectives": [
    {
      "goal": "bgp_routing",
      "weight": 10,
      "description": "Master BGP protocol and autonomous system relationships"
    },
    {
      "goal": "network_security",
      "weight": 7,
      "description": "Understand network infrastructure security"
    }
  ],
  "skillsRequired": [
    "Basic networking",
    "IP addressing",
    "Routing concepts"
  ],
  "skillsTaught": [
    "BGP analysis",
    "AS path interpretation",
    "Route hijacking detection",
    "Peering relationship mapping"
  ],
  "learningOutcomes": [
    "Read and interpret BGP routing tables",
    "Trace packet paths through global internet",
    "Identify suspicious routing anomalies",
    "Use BGP looking glasses effectively",
    "Map AS relationships and peering"
  ],
  "industryContext": "Network engineers, ISP security teams, and incident responders use BGP analysis to detect route hijacking, DDoS mitigation bypasses, and nation-state traffic manipulation. Critical for infrastructure defense.",
  "realWorldExamples": [
    "Pakistan Telecom YouTube hijacking (2008)",
    "Cloudflare route leak incident",
    "Russia BGP hijacking incidents",
    "China Telecom traffic misdirection"
  ],
  "careerPaths": [
    "Network Security Engineer",
    "ISP Security Analyst",
    "Infrastructure Security",
    "Incident Response"
  ],
  "teachingAdaptations": {
    "experiential": "Pick an IP, hit a looking glass, see what comes back. Click through AS numbers. Follow the routing hops. Learn by exploring actual BGP data.",
    "visual": "Draw the topology as you discover it. Map ASNs geographically. Visualize peering relationships as a network graph. Watch packets flow through the map.",
    "analytical": "Study BGP RFC 4271 first. Understand path vector protocols, AS path selection, route propagation. Then analyze real-world routing with theoretical foundation.",
    "social": "Check NANOG mailing lists for BGP incident discussions. Read Cloudflare blog posts on routing security. Join network operator communities.",
    "pragmatic": "Use Hurricane Electric BGP Toolkit. Enter IP → get origin AS. Check peers. Done. Script it with whois and bgpq3 if you do this often."
  }
}
---

# BGP Route Tracing

## Overview
Trace IP hops around the world via BGP relations. Understand how traffic flows through ASNs.

## Objectives
1. Identify origin ASN
2. Map BGP relationships
3. Trace global routing paths
4. Identify transit providers
5. Detect anomalies

## Tools Required
- BGP Looking Glass
- RIPE RIS
- RouteViews
- Hurricane Electric BGP
- PeeringDB

## Starter Prompt
```
I want to trace network routes and understand BGP peering relationships.

Target: An IP address I found in the logs - 185.199.108.153

Help me:
1. Identify the origin ASN and organization
2. Map BGP peering relationships
3. Trace the path packets would take from different regions
4. Identify any interesting transit providers
5. Look for route hijacking indicators

What tools and looking glasses should we use to start this investigation?
```
