# Records of Processing Activities (ROPA)

**Organization:** SysAdmin Corp  
**Document Version:** 1.0  
**Last Updated:** February 4, 2025  
**Data Protection Officer:** dpo@sysadmincorp.io

---

## Controller Information

| Field | Value |
|-------|-------|
| **Controller Name** | SysAdmin Corp |
| **Contact Details** | privacy@sysadmincorp.io |
| **DPO Contact** | dpo@sysadmincorp.io |
| **EU Representative** | eu-representative@sysadmincorp.io |

---

## Processing Activity 1: Platform Session Management

| Field | Description |
|-------|-------------|
| **Processing Activity** | Creation and management of user sessions |
| **Purpose** | Enable users to access and use the platform, track progress |
| **Categories of Data Subjects** | Platform users (session-based, no accounts) |
| **Categories of Personal Data** | Session tokens, timestamps, browser fingerprint (optional) |
| **Legal Basis** | Contract performance (Art. 6(1)(b)) |
| **Recipients** | Internal staff, hosting provider (Replit) |
| **Third Country Transfers** | USA (Replit infrastructure) - SCCs in place |
| **Retention Period** | Session duration + 90 days |
| **Security Measures** | TLS 1.3, session token encryption, access controls |

---

## Processing Activity 2: AI Interaction Processing

| Field | Description |
|-------|-------------|
| **Processing Activity** | Processing user prompts and generating AI responses |
| **Purpose** | Provide AI-assisted cybersecurity investigation and training |
| **Categories of Data Subjects** | Platform users |
| **Categories of Personal Data** | Chat prompts, AI responses, session tokens |
| **Legal Basis** | Contract performance (Art. 6(1)(b)) |
| **Recipients** | OpenRouter (AI processor), internal staff |
| **Third Country Transfers** | USA (OpenRouter) - DPA required |
| **Retention Period** | 12 months |
| **Security Measures** | TLS encryption, pseudonymization, access controls |

---

## Processing Activity 3: AI Interaction Logging for Service Improvement

| Field | Description |
|-------|-------------|
| **Processing Activity** | Logging and analyzing AI interactions for quality improvement |
| **Purpose** | Improve AI response quality, debug issues, quality assurance |
| **Categories of Data Subjects** | Platform users |
| **Categories of Personal Data** | Chat prompts, AI responses, session tokens, timestamps |
| **Legal Basis** | Legitimate interest (Art. 6(1)(f)) - See LIA |
| **Recipients** | Internal engineering and QA teams |
| **Third Country Transfers** | USA (database hosting) - SCCs in place |
| **Retention Period** | 12 months, then anonymization or deletion |
| **Security Measures** | Encryption, access controls, pseudonymization |

---

## Processing Activity 4: Atropos OSINT Scanning

| Field | Description |
|-------|-------------|
| **Processing Activity** | Executing security scans on user-specified targets |
| **Purpose** | Provide OSINT and vulnerability scanning capabilities |
| **Categories of Data Subjects** | Platform users, scan target owners (third parties) |
| **Categories of Personal Data** | Session tokens, scan targets (domains/IPs), scan results |
| **Legal Basis** | Contract performance (users), Legitimate interest (targets) |
| **Recipients** | Internal staff, no external sharing |
| **Third Country Transfers** | N/A (processing on platform) |
| **Retention Period** | 24 months |
| **Security Measures** | Input validation, access controls, audit logging |

---

## Processing Activity 5: Investigation Report Retention

| Field | Description |
|-------|-------------|
| **Processing Activity** | Storage of exported investigation reports |
| **Purpose** | Preserve security research for future reference and improvement |
| **Categories of Data Subjects** | Platform users (report creators) |
| **Categories of Personal Data** | Session tokens, report content, timestamps |
| **Legal Basis** | Legitimate interest (Art. 6(1)(f)) - See LIA |
| **Recipients** | Internal research and security teams |
| **Third Country Transfers** | USA (database hosting) - SCCs in place |
| **Retention Period** | Up to 7 years (priority-based) |
| **Security Measures** | Encryption, access controls, retention policies |

---

## Processing Activity 6: Security Advisor Analysis

| Field | Description |
|-------|-------------|
| **Processing Activity** | Analyzing user behavior patterns for security recommendations |
| **Purpose** | Provide personalized security recommendations and scan suggestions |
| **Categories of Data Subjects** | Platform users |
| **Categories of Personal Data** | Session tokens, tool usage patterns, investigation targets |
| **Legal Basis** | Legitimate interest (Art. 6(1)(f)) - See LIA |
| **Recipients** | Internal (automated system) |
| **Third Country Transfers** | N/A |
| **Retention Period** | Session duration + 90 days |
| **Security Measures** | Session-scoped analysis only, no persistent profiles |

---

## Processing Activity 7: Technical Logging

| Field | Description |
|-------|-------------|
| **Processing Activity** | Collection of technical logs for security and debugging |
| **Purpose** | Security monitoring, abuse prevention, debugging |
| **Categories of Data Subjects** | Platform users |
| **Categories of Personal Data** | IP addresses (anonymized), browser info, error logs |
| **Legal Basis** | Legitimate interest (Art. 6(1)(f)) |
| **Recipients** | Internal IT and security teams |
| **Third Country Transfers** | USA (hosting provider) |
| **Retention Period** | 30-90 days |
| **Security Measures** | IP anonymization, access controls |

---

## Processors

| Processor | Processing Activity | Location | Safeguards |
|-----------|---------------------|----------|------------|
| OpenRouter | AI model inference | USA | DPA (pending) |
| Replit | Application hosting | USA | DPA (platform terms) |
| Neon | Database hosting | USA | DPA (service terms) |

---

## Data Subject Rights Handling

| Right | Process | Timeframe |
|-------|---------|-----------|
| Access | DSAR via email with session token verification | 30 days |
| Rectification | Contact DPO with correction request | 30 days |
| Erasure | Verified deletion request | 30 days |
| Portability | JSON export via API or email request | 30 days |
| Object | Contact DPO to object to processing | 30 days |

---

## Review Schedule

This document must be reviewed:
- Annually (minimum)
- When new processing activities are added
- When existing activities change significantly
- When new processors are engaged

**Next Review Date:** February 4, 2026

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| Feb 4, 2025 | 1.0 | Initial creation | DPO |

---

*This document satisfies the record-keeping requirements of GDPR Article 30.*
