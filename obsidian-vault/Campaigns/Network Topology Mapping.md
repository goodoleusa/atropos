---
{
  "id": "network_topology",
  "name": "Network Topology Mapping",
  "icon": "🗺️",
  "difficulty": "advanced",
  "estimatedTime": "45-60 min",
  "tags": [
    "Network",
    "Infrastructure",
    "Mapping"
  ],
  "color": "blue",
  "targetFields": [
    {
      "key": "ip",
      "label": "Entry Host IP",
      "type": "ip",
      "required": true,
      "placeholder": "192.168.1.50"
    },
    {
      "key": "cidr",
      "label": "Network Range (optional)",
      "type": "cidr",
      "required": false,
      "placeholder": "192.168.1.0/24"
    }
  ],
  "dummyTargets": {
    "ip": "192.168.1.50",
    "cidr": "192.168.1.0/24"
  }
}
---

# Network Topology Mapping

## Overview
Map internal network architecture. Identify VLANs, gateways, trust relationships.

## Objectives
1. Identify network segments
2. Map routing topology
3. Find critical infrastructure
4. Document trust relationships
5. Create network diagram

## Tools Required
- arp-scan
- traceroute
- nbtscan
- enum4linux
- BloodHound

## Starter Prompt
```
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
```
