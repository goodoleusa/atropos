---
id: phishing_analysis
name: Phishing Email Analysis
difficulty: beginner
tags:
  - Phishing
  - Email
  - Analysis
icon: 📧
---

# Phishing Email Analysis

## Overview
Analyze a suspicious email. Extract IOCs, trace infrastructure, attribute threat actors.

## Investigation Mesh (Twine-style)
Use these [[Wikilinks]] to navigate the nodes of this investigation.

### Initial Objective
Parse email headers

### Knowledge Graph
- [[Parse email headers]]
- [[Analyze infrastructure]]
- [[Check URL reputation]]
- [[Extract IOCs]]
- [[Create detections]]
- [[Tool: MXToolbox]]
- [[Tool: URLscan.io]]
- [[Tool: PhishTank]]
- [[Tool: VirusTotal]]
- [[Tool: WHOIS]]

## Starter Prompt
```
User reported a suspicious email. I have the full EML file.

Headers show:
- From: support@amaz0n-verify.com
- Reply-To: verify@gmail.com
- X-Originating-IP: 185.234.xxx.xxx
- Contains link: hxxp://amaz0n-verify[.]com/login

Help me analyze:
1. Parse email headers for origin
2. Analyze sender infrastructure
3. Check URL reputation and history
4. Extract all IOCs
5. Identify phishing kit signatures
6. Write detection rules

Walk me through the analysis methodology.
```

## Clues & Discovery
- [[Clue: phishing_analysis_source]]
- [[Evidence: phishing_analysis_intel]]
