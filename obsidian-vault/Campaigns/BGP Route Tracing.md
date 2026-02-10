---
id: "bgp_trace"
name: "BGP Route Tracing"
type: "campaign"
difficulty: "advanced"
tags:
  - "Network"
  - "BGP"
  - "Infrastructure"
icon: "🌐"
color: "teal"
estimatedTime: "30-45 min"
up:
  - "[[INDEX|INDEX]]"
next:
  - "[[Identify origin ASN]]"
objectives:
  - "Identify origin ASN"
  - "Map BGP relationships"
  - "Trace global routing paths"
  - "Identify transit providers"
  - "Detect anomalies"
tools:
  - "BGP Looking Glass"
  - "RIPE RIS"
  - "RouteViews"
  - "Hurricane Electric BGP"
  - "PeeringDB"
skills:
  - "BGP analysis"
  - "AS path interpretation"
  - "Route hijacking detection"
  - "Peering relationship mapping"
clues: []
---

# BGP Route Tracing

## Overview
Trace IP hops around the world via BGP relations. Understand how traffic flows through ASNs.

## Investigation Mesh
Use these [[Wikilinks]] to navigate the nodes of this investigation.

### Initial Objective
Identify origin ASN

### Knowledge Graph
- [[Identify origin ASN]]
- [[Map BGP relationships]]
- [[Trace global routing paths]]
- [[Identify transit providers]]
- [[Detect anomalies]]
- [[Tool: BGP Looking Glass]]
- [[Tool: RIPE RIS]]
- [[Tool: RouteViews]]
- [[Tool: Hurricane Electric BGP]]
- [[Tool: PeeringDB]]


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
