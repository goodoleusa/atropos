# Privacy Policy

**SysAdmin Corp / NEXUS Security Platform**  
**Last Updated:** February 4, 2025  
**Effective Date:** February 4, 2025

---

## 1. Introduction

SysAdmin Corp ("we," "us," "our") operates an AI-powered cybersecurity investigation and training platform (the "Platform"). This Privacy Policy explains how we collect, use, retain, and protect your information when you use our services.

We are committed to minimizing personal data collection while providing effective security training and investigation tools. Our Platform operates primarily on a **session-based model** without requiring traditional user accounts or authentication.

---

## 2. Data Controller

**Company:** SysAdmin Corp  
**Contact:** privacy@sysadmincorp.io  
**Data Protection Contact:** dpo@sysadmincorp.io

For EU residents: Our EU representative can be contacted at eu-representative@sysadmincorp.io

---

## 3. What Data We Collect

### 3.1 Session Data (Minimal Identification)

We use a **session-based identification system** that does not require personal accounts:

| Data Type | Description | Purpose |
|-----------|-------------|---------|
| Session Token | Random alphanumeric identifier (e.g., `sess_abc123xyz`) | Track your progress and preferences |
| Session Timestamp | When your session was created | Analytics and data retention |
| Browser Fingerprint (optional) | Device/browser characteristics | Session continuity across visits |

**What we DON'T collect:**
- Real names (unless voluntarily provided)
- Email addresses (unless provided for data export)
- Phone numbers
- Government IDs
- Payment information (unless purchasing services)
- Precise geolocation

### 3.2 AI Interaction Data

We log interactions with our AI systems (NEXUS) to improve service quality and for legitimate security research:

| Data Type | Retention Period | Purpose |
|-----------|------------------|---------|
| Chat prompts/queries | 12 months | Service improvement, debugging |
| AI responses | 12 months | Quality assurance |
| Tool execution logs | 24 months | Security research, audit trail |
| Investigation reports | Until deletion requested | Your work preservation |
| Learning preferences | Session duration + 90 days | Personalized experience |

### 3.3 Technical Data

| Data Type | Retention Period | Purpose |
|-----------|------------------|---------|
| IP address (anonymized) | 30 days | Security, abuse prevention |
| Browser type/version | 30 days | Compatibility |
| Referrer URL | 30 days | Analytics |
| Error logs | 90 days | Debugging |

### 3.4 Atropos Scanner Data

When using our Atropos OSINT scanner:
- **Scan targets** you specify are logged for audit purposes
- **Scan results** are retained for your session history
- We do **not** store sensitive findings on our servers beyond session retention

---

## 4. How We Use Your Data

### 4.1 Legal Basis for Processing (GDPR Article 6)

| Processing Activity | Legal Basis |
|---------------------|-------------|
| Providing the Platform service | Contract performance |
| AI interaction logging | Legitimate interest (service improvement) |
| Security monitoring | Legitimate interest (fraud prevention) |
| Anonymized analytics | Legitimate interest |
| Exported reports retention | Legitimate interest (research value) |

### 4.2 AI Model Training

**Transparency Statement:**  
Your interactions may be used to improve our AI systems. Specifically:
- Prompts and responses may be reviewed for quality assurance
- Anonymized patterns may be used for model fine-tuning
- We use third-party AI providers (OpenRouter/OpenAI) who have their own data policies

You can opt out of training data usage by contacting us (see Section 8).

---

## 5. Data Retention

| Data Category | Retention Period | Deletion Method |
|---------------|------------------|-----------------|
| Active session data | Session duration + 90 days | Automatic deletion |
| AI interaction logs | 12 months | Automatic anonymization, then deletion |
| Exported investigation reports | Indefinite (company retention) | Manual deletion upon valid request |
| Technical logs | 30-90 days | Automatic deletion |
| Anonymized analytics | Indefinite | N/A (no personal data) |

**Company Retention Policy:**  
Exported investigation reports may be retained indefinitely for legitimate security research and training purposes. This data is stored with minimal identifying information (session token only).

---

## 6. Third-Party Services

We share data with the following processors:

| Service | Purpose | Data Shared | Privacy Policy |
|---------|---------|-------------|----------------|
| OpenRouter | AI model access | Chat prompts/responses | [openrouter.ai/privacy](https://openrouter.ai/privacy) |
| Replit | Hosting infrastructure | Technical data | [replit.com/privacy](https://replit.com/privacy) |
| PostgreSQL (Neon) | Database | All stored data | [neon.tech/privacy](https://neon.tech/privacy) |

---

## 7. Your Rights (GDPR & CCPA)

You have the right to:

| Right | Description | How to Exercise |
|-------|-------------|-----------------|
| **Access** | Obtain a copy of your data | Data Export Request |
| **Rectification** | Correct inaccurate data | Contact us |
| **Erasure** | Delete your data ("right to be forgotten") | Deletion Request |
| **Portability** | Receive data in machine-readable format | Data Export Request |
| **Object** | Stop processing of your data | Contact us |
| **Withdraw Consent** | Revoke previously given consent | Contact us |

---

## 8. Data Access & Export (DSAR)

### How to Request Your Data

Since we operate on a session-based system without traditional accounts, we offer multiple verification methods:

#### Option A: Session Token Verification (Recommended)
1. Locate your session token (displayed in the Platform footer or via the `/api/session` endpoint)
2. Submit a request to privacy@sysadmincorp.io with:
   - Your session token
   - Approximate dates of Platform usage
   - Description of at least 2 actions you performed (for verification)
3. We will respond within 30 days

#### Option B: Email Verification
If you provided an email address at any point:
1. Submit a request from that email address
2. We will send a verification link
3. Once verified, we will provide your data within 30 days

#### Option C: Browser Verification (Limited)
If you have an active session:
1. Navigate to `/api/security/reports/{your-session-token}`
2. Download your investigation reports directly
3. For full data export, contact us

### Verification Requirements

| Data Sensitivity | Verification Method |
|------------------|---------------------|
| Investigation reports | Session token + 2 knowledge questions |
| AI chat history | Session token + 2 knowledge questions |
| All session data | Session token + email verification |

**We cannot provide data if:**
- Session token is invalid or expired
- Verification questions cannot be answered correctly
- Request appears fraudulent or from unauthorized party

---

## 9. Data Export API

Programmatic access is available for your own data:

```
GET /api/security/reports/{sessionToken}
```

Returns your exported investigation reports in JSON format.

```
GET /api/security/dashboard/{sessionToken}
```

Returns your security context, recommendations, and IOC data.

---

## 10. Data Security

We implement appropriate technical and organizational measures:

- **Encryption:** TLS 1.3 for data in transit; AES-256 for data at rest
- **Access Controls:** Role-based access, principle of least privilege
- **Monitoring:** Automated security logging and anomaly detection
- **Pseudonymization:** Session tokens rather than personal identifiers
- **Data Minimization:** We collect only necessary data

### Breach Notification

In the event of a data breach affecting your personal data, we will:
- Notify relevant supervisory authorities within 72 hours (GDPR requirement)
- Notify affected individuals without undue delay if high risk

---

## 11. International Transfers

Data may be processed in:
- United States (hosting infrastructure)
- European Union (some services)

For EU residents: Transfers outside the EEA are protected by Standard Contractual Clauses (SCCs).

---

## 12. Cookies

We use minimal cookies:

| Cookie | Purpose | Duration |
|--------|---------|----------|
| `session_token` | Session identification | 30 days |
| `preferences` | UI preferences | 1 year |

We do not use advertising or third-party tracking cookies.

---

## 13. Children's Privacy

The Platform is not intended for users under 18. We do not knowingly collect data from minors.

---

## 14. California Privacy Rights (CCPA)

California residents have additional rights:
- Right to know what personal information is collected
- Right to delete personal information
- Right to opt-out of sale (we do not sell personal information)
- Right to non-discrimination

---

## 15. Changes to This Policy

We may update this policy periodically. Changes will be:
- Posted on this page with a new "Last Updated" date
- Announced via the Platform interface for significant changes

Continued use of the Platform after changes constitutes acceptance.

---

## 16. Contact Us

**For privacy inquiries:**  
Email: privacy@sysadmincorp.io

**For data access/deletion requests:**  
Email: dpo@sysadmincorp.io  
Subject Line: "DSAR - [Your Session Token]"

**Response Time:** Within 30 days (may be extended to 90 days for complex requests)

---

## Appendix: GDPR Compliance Summary

| GDPR Requirement | Our Approach |
|------------------|--------------|
| Lawful basis (Art. 6) | Legitimate interest + contract performance |
| Data minimization (Art. 5) | Session-based, no accounts required |
| Storage limitation (Art. 5) | Defined retention periods per data type |
| Right of access (Art. 15) | DSAR process with proportionate verification |
| Right to erasure (Art. 17) | Deletion upon verified request |
| Data portability (Art. 20) | JSON export via API |
| Privacy by design (Art. 25) | Pseudonymization, minimal collection |
| Breach notification (Art. 33-34) | 72-hour notification process |

---

*This privacy policy template is provided for informational purposes. Consult with a legal professional to ensure compliance with applicable laws in your jurisdiction.*
