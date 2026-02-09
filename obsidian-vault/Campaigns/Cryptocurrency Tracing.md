---
{
  "id": "crypto_analysis",
  "name": "Cryptocurrency Tracing",
  "icon": "₿",
  "difficulty": "advanced",
  "estimatedTime": "45-60 min",
  "tags": [
    "Crypto",
    "Financial",
    "Blockchain"
  ],
  "color": "yellow",
  "targetFields": [
    {
      "key": "address",
      "label": "Wallet Address",
      "type": "address",
      "required": true,
      "placeholder": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
    }
  ],
  "dummyTargets": {
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
  },
  "learningObjectives": [
    {
      "goal": "crypto_blockchain_investigation",
      "weight": 10,
      "description": "Master cryptocurrency tracing and blockchain analysis"
    },
    {
      "goal": "financial_investigation",
      "weight": 8,
      "description": "Follow the money through digital transactions"
    }
  ],
  "skillsRequired": [
    "Basic cryptocurrency understanding",
    "Transaction concepts",
    "Address formats"
  ],
  "skillsTaught": [
    "Blockchain analysis",
    "Wallet clustering",
    "Exchange identification",
    "Mixing detection",
    "Transaction graph analysis",
    "UTXO tracing"
  ],
  "learningOutcomes": [
    "Read and interpret blockchain transactions",
    "Cluster wallet addresses by ownership",
    "Identify exchange deposits and withdrawals",
    "Detect cryptocurrency mixing services",
    "Trace funds through multiple hops",
    "Build financial flow visualizations",
    "Generate attribution reports"
  ],
  "industryContext": "Law enforcement, regulatory agencies, and cybersecurity firms trace cryptocurrency in ransomware investigations, fraud cases, sanctions enforcement, and money laundering. Blockchain analysts are in high demand for crypto compliance.",
  "realWorldExamples": [
    "Colonial Pipeline ransomware Bitcoin recovery (FBI)",
    "Bitfinex hack $3.6B Bitcoin seizure",
    "Silk Road Bitcoin tracing",
    "WannaCry ransomware tracking",
    "North Korean Lazarus Group crypto laundering"
  ],
  "careerPaths": [
    "Blockchain Analyst",
    "Crypto Compliance Officer",
    "Financial Crime Investigator",
    "Cybercrime Investigator",
    "Forensic Accountant"
  ],
  "teachingAdaptations": {
    "experiential": "Enter the Bitcoin address into Blockchain.com explorer. See transactions flow. Click through inputs and outputs. Follow the money visually. Learn by tracing real transactions.",
    "visual": "Use tools that generate transaction graphs. Watch money flow from address to address. Create visual maps of wallet clusters. Sankey diagrams for fund flows.",
    "analytical": "Study Bitcoin whitepaper, UTXO model, transaction structure. Understand cryptographic signatures and address derivation. Learn blockchain fundamentals before analysis.",
    "social": "Follow @ErgoBTC on Twitter for tracing techniques. Read Chainalysis and Elliptic blog posts. Study Lazarus Group reports. Join blockchain analysis communities.",
    "pragmatic": "Copy address → paste in BlockChair → export CSV of transactions → analyze in Excel. Use Etherscan for Ethereum. OXT.me for advanced users. Get results fast."
  }
}
---

# Cryptocurrency Tracing

## Overview
Trace cryptocurrency transactions. Follow the money through blockchain analysis.

## Objectives
1. Analyze transaction flow
2. Cluster addresses
3. Identify exchanges
4. Detect mixing
5. Build timeline

## Tools Required
- Blockchain explorers
- Chainalysis
- Elliptic
- OXT
- Crystal

## Starter Prompt
```
I need to trace cryptocurrency associated with a suspected fraud operation.

Known Bitcoin address: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa

Help me:
1. Analyze transaction history
2. Cluster related addresses
3. Identify exchange deposits/withdrawals
4. Trace mixing service usage
5. Find connections to known entities
6. Build a financial timeline

What blockchain analysis approach should we take?
```
