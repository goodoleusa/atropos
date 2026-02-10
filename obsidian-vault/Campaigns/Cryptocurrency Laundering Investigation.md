---
id: "crypto_laundering_trace"
name: "Cryptocurrency Laundering Investigation"
type: "campaign"
difficulty: "advanced"
tags:
  - "Cryptocurrency"
  - "Money Laundering"
  - "AML"
  - "Financial Crime"
icon: "💰"
color: "yellow"
estimatedTime: "60-90 min"
parent:
  - "[[INDEX|INDEX]]"
child:
  - "[[Analyze Bitcoin transaction patterns]]"
sibling: []
prev: []
next:
  - "[[Analyze Bitcoin transaction patterns]]"
left_side_friend: []
right_side_friend: []
objectives:
  - "Analyze Bitcoin transaction patterns"
  - "Identify cryptocurrency mixers/tumblers"
  - "Trace funds to exchange cash-outs"
  - "Build financial intelligence report"
  - "Learn FBI blockchain forensics methodology"
tools:
  - "Blockchain Explorers"
  - "WalletExplorer"
  - "Transaction Graph Tools"
  - "Exchange Identification"
  - "Clustering Analysis"
skillsRequired: []
skillsTaught: []
learningObjectives:
  - "{\"goal\":\"crypto_blockchain_investigation\",\"weight\":10,\"description\":\"Master advanced blockchain forensics\"}"
  - "{\"goal\":\"financial_investigation\",\"weight\":9,\"description\":\"Learn money laundering detection and tracing\"}"
targetFields:
  - "{\"key\":\"wallet_address\",\"label\":\"Source Bitcoin Address\",\"type\":\"text\",\"required\":true,\"placeholder\":\"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa\"}"
dummyTargets: "[object Object]"
industryContext: ""
clues: []
---

# Cryptocurrency Laundering Investigation

## Overview
Track $500,000 in Bitcoin from ransomware through mixers and exchanges. Learn advanced blockchain forensics used by FBI and Treasury.

## Investigation Mesh
Use these [[Wikilinks]] to navigate the nodes of this investigation.

### Initial Objective
Analyze Bitcoin transaction patterns

### Knowledge Graph
- [[Analyze Bitcoin transaction patterns]]
- [[Identify cryptocurrency mixers/tumblers]]
- [[Trace funds to exchange cash-outs]]
- [[Build financial intelligence report]]
- [[Learn FBI blockchain forensics methodology]]
- [[Tool: Blockchain Explorers]]
- [[Tool: WalletExplorer]]
- [[Tool: Transaction Graph Tools]]
- [[Tool: Exchange Identification]]
- [[Tool: Clustering Analysis]]


## Starter Prompt
```
💰 OPERATION MONEY TRAIL - CRYPTOCURRENCY LAUNDERING INVESTIGATION

CASE BRIEFING:
A ransomware attack netted criminals $500,000 in Bitcoin. The funds have been linked to human trafficking operations. Your mission: Trace the money to its final cash-out point.

This is the EXACT methodology used by FBI to recover $2.3M from Colonial Pipeline ransomware.

🔗 PHASE 1: INITIAL WALLET ANALYSIS

Target Address: 1CounterpartyXXXXXXXXXXXXXXXUWLpVr

Investigation checklist:
1. Transaction History:
   - How much Bitcoin has this address received?
   - How many transactions (inbound/outbound)?
   - When was it most active?
   - Are there patterns in transaction amounts?

2. Address Labeling:
   - Is this address known/labeled? (exchange, mixer, etc.)
   - Check multiple blockchain explorers
   - Look for public reports mentioning this address

3. First Hops:
   - Where did the initial $500k go?
   - Single address or split across multiple?
   - Transaction timing (all at once or staggered?)

Tools:
- Blockchain.com explorer
- Blockchair.com (advanced search)
- WalletExplorer (address clustering)

🌊 PHASE 2: FOLLOWING THE MIXING TRAIL

Criminals often use "mixers" or "tumblers" to obscure origin.

Mixer Detection:
- Look for:
  ✓ Funds split into many small amounts
  ✓ Rapid transactions through multiple addresses
  ✓ Known mixer addresses (ChipMixer, Wasabi, etc.)
  ✓ Even-amount patterns (0.1 BTC, 0.5 BTC)

Advanced Technique: "Peeling Chain Analysis"
- Mixer sends 90% forward, keeps 10% (fee)
- Follow the larger output recursively
- Eventually reaches unmixed funds

Questions:
- How many hops until funds hit a mixer?
- Can you identify the mixer service?
- How much was lost to fees?
- Where do funds re-emerge?

🏦 PHASE 3: EXCHANGE IDENTIFICATION (The Cash-Out)

Eventually, criminals need to convert Bitcoin to fiat currency.
This requires a cryptocurrency exchange.

Exchange Indicators:
- Large wallets (hot wallets holding millions)
- Known exchange addresses (check WalletExplorer)
- Deposit patterns (many small inputs, few large outputs)
- KYC requirements mean real identity may be accessible

Popular Exchanges to Check:
- Binance
- Coinbase
- Kraken
- LocalBitcoins (peer-to-peer, risky for criminals)

Action Items:
1. Identify which exchange(s) received funds
2. Calculate total amount deposited
3. Document transaction IDs
4. Note timestamps for subpoena timing

💼 PHASE 4: BUILDING THE FINANCIAL INTELLIGENCE REPORT

Create a comprehensive money flow analysis:

1. Transaction Graph:
   - Visual diagram of money flow
   - Label all key addresses
   - Highlight mixer services
   - Mark exchange deposits

2. Timeline:
   - When was ransom paid?
   - How long until mixing started?
   - When did funds hit exchanges?
   - Total time to cash out?

3. Financial Summary:
   - Starting amount: $500,000
   - Mixer fees: $X
   - Exchange deposits: $Y at [Exchange Names]
   - Estimated recovery: $Z

4. Law Enforcement Recommendations:
   - Subpoena targets (exchange names + dates)
   - Account identification (exchange KYC)
   - Asset seizure opportunities
   - International cooperation needed? (if offshore)

🎯 ADVANCED TECHNIQUES

Cross-Chain Analysis:
- Did funds convert to other cryptocurrencies?
- Check: Bitcoin → Monero → Bitcoin (privacy coin bridge)
- Look for atomic swaps or DEX (decentralized exchange) use

Clustering Analysis:
- Group addresses by common ownership
- Look for change addresses (same wallet)
- Co-spending patterns (multiple inputs = same owner)

Real-World Success Stories:
- Colonial Pipeline: FBI recovered $2.3M by tracing Bitcoin
- Silk Road: $1B+ in Bitcoin seized through blockchain analysis
- Twitter hack 2020: Teens caught via blockchain forensics
- Welcome to Video: 337 arrests via cryptocurrency tracing

📊 DELIVERABLE: FINTEL REPORT

Your report will be used to:
1. Identify suspects (via exchange KYC)
2. Seize assets (freeze exchange accounts)
3. Prosecute criminals (blockchain = immutable evidence)
4. Recover victim funds (where possible)

Ready to begin tracing? What's your first investigative step?
```
