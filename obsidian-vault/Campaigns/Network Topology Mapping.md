---
id: "network_topology"
name: "Network Topology Mapping"
type: "campaign"
difficulty: "advanced"
tags: ["Network", "Infrastructure", "Mapping"]
icon: "🗺️"
color: "blue"
estimatedTime: "45-60 min"
parent:
  - "[[INDEX|INDEX]]"
child:
  - "[[Identify network segments]]"
sibling: []
left_side_friend: []
right_side_friend: []
objectives:
  - "Identify network segments"
  - "Map routing topology"
  - "Find critical infrastructure"
  - "Document trust relationships"
  - "Create network diagram"
tools:
  - "arp-scan"
  - "traceroute"
  - "nbtscan"
  - "enum4linux"
  - "BloodHound"
skillsRequired: []
skillsTaught: []
learningObjectives: []
targetFields:
  - "{\"key\":\"ip\",\"label\":\"Entry Host IP\",\"type\":\"ip\",\"required\":true,\"placeholder\":\"192.168.1.50\"}"
  - "{\"key\":\"cidr\",\"label\":\"Network Range (optional)\",\"type\":\"cidr\",\"required\":false,\"placeholder\":\"192.168.1.0/24\"}"
dummyTargets: "[object Object]"
industryContext: ""
clues: []
date_created: 2026-40-Mo
date_modified: 2026-54-Tu
---

# Network Topology Mapping

## Overview

Map internal network architecture. Identify VLANs, gateways, trust relationships.

## Investigation Mesh

Use these [[Wikilinks]] to navigate the nodes of this investigation.

### Initial Objective

Identify network segments

### Knowledge Graph

- [[Identify network segments]]
- [[Map routing topology]]
- [[Find critical infrastructure]]
- [[Document trust relationships]]
- [[Create network diagram]]
- [[Tool: arp-scan]]
- [[Tool: traceroute]]
- [[Tool: nbtscan]]
- [[Tool: enum4linux]]
- [[Tool: BloodHound]]

## Starter Prompt

I've gained access to an internal network and need to map the topology.

Current position: 192.168.1.50 (workstation VLAN)

Help me:

1. Identify network segments and VLANs
2. Find default gateways and routing
3. Discover domain controllers and critical servers
4. Map trust relationships
5. Identify network appliances (firewalls, proxies)
6. Create a network diagram

What's the safest way to start mapping without triggering alerts?
