---
{
  "id": "phishing_analysis",
  "name": "Phishing Email Analysis",
  "icon": "📧",
  "difficulty": "beginner",
  "estimatedTime": "20-30 min",
  "tags": [
    "Phishing",
    "Email",
    "Analysis"
  ],
  "color": "amber",
  "targetFields": [
    {
      "key": "url",
      "label": "Suspicious URL",
      "type": "url",
      "required": true,
      "placeholder": "hxxp://amaz0n-verify[.]com/login"
    },
    {
      "key": "email",
      "label": "Sender Email (optional)",
      "type": "email",
      "required": false,
      "placeholder": "support@amaz0n-verify.com"
    },
    {
      "key": "ip",
      "label": "Originating IP (optional)",
      "type": "ip",
      "required": false,
      "placeholder": "185.234.xxx.xxx"
    }
  ],
  "dummyTargets": {
    "url": "hxxp://amaz0n-verify[.]com/login",
    "email": "support@amaz0n-verify.com",
    "ip": "185.234.xxx.xxx"
  }
}
---

# Phishing Email Analysis

## Overview
Analyze a suspicious email. Extract IOCs, trace infrastructure, attribute threat actors.

## Objectives
1. Parse email headers
2. Analyze infrastructure
3. Check URL reputation
4. Extract IOCs
5. Create detections

## Tools Required
- MXToolbox
- URLscan.io
- PhishTank
- VirusTotal
- WHOIS

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
