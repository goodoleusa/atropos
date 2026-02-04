// Bug Bounty & Security Research Report Template
// Designed to prioritize high-value findings and maximize bounty ROI

export interface ReportSection {
  id: string;
  title: string;
  description: string;
  fields: ReportField[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  bountyImpact: string;
}

export interface ReportField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multi-select' | 'checklist' | 'table' | 'severity';
  placeholder?: string;
  options?: string[];
  tip?: string;
  autoPopulate?: string;
}

export interface Finding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cvss?: number;
  category: string;
  description: string;
  stepsToReproduce: string;
  impact: string;
  recommendation: string;
  evidence: string[];
  estimatedBounty: string;
  confidence: 'confirmed' | 'likely' | 'potential';
  status: 'new' | 'validated' | 'reported' | 'resolved' | 'duplicate';
}

export const SEVERITY_SCORES = {
  critical: { min: 9.0, max: 10.0, color: '#dc2626', bountyMultiplier: 4 },
  high: { min: 7.0, max: 8.9, color: '#f97316', bountyMultiplier: 2 },
  medium: { min: 4.0, max: 6.9, color: '#eab308', bountyMultiplier: 1 },
  low: { min: 0.1, max: 3.9, color: '#14b8a6', bountyMultiplier: 0.5 },
  info: { min: 0, max: 0, color: '#6b7280', bountyMultiplier: 0 }
};

export const VULNERABILITY_CATEGORIES = [
  { id: 'injection', name: 'Injection Flaws', examples: 'SQLi, XSS, Command Injection, LDAP', avgBounty: '$500-$15,000' },
  { id: 'auth', name: 'Authentication Bypass', examples: 'Broken auth, session hijacking, credential stuffing', avgBounty: '$1,000-$25,000' },
  { id: 'idor', name: 'IDOR / Access Control', examples: 'Horizontal/vertical privilege escalation', avgBounty: '$500-$10,000' },
  { id: 'ssrf', name: 'SSRF', examples: 'Server-side request forgery, cloud metadata access', avgBounty: '$1,000-$20,000' },
  { id: 'rce', name: 'Remote Code Execution', examples: 'Deserialization, file upload, template injection', avgBounty: '$5,000-$100,000+' },
  { id: 'info_disclosure', name: 'Information Disclosure', examples: 'PII leakage, source code exposure, debug endpoints', avgBounty: '$100-$5,000' },
  { id: 'business_logic', name: 'Business Logic Flaws', examples: 'Race conditions, workflow bypass, pricing manipulation', avgBounty: '$500-$20,000' },
  { id: 'crypto', name: 'Cryptographic Issues', examples: 'Weak algorithms, key exposure, padding oracles', avgBounty: '$200-$8,000' },
  { id: 'api', name: 'API Security', examples: 'GraphQL introspection, mass assignment, rate limiting', avgBounty: '$300-$10,000' },
  { id: 'mobile', name: 'Mobile-Specific', examples: 'Insecure storage, certificate pinning bypass', avgBounty: '$200-$8,000' }
];

export const HIGH_VALUE_INDICATORS = [
  { indicator: 'Affects payment/financial flows', multiplier: 3, icon: '💰' },
  { indicator: 'Exposes PII or credentials', multiplier: 2.5, icon: '🔐' },
  { indicator: 'Affects authentication/authorization', multiplier: 2, icon: '🚪' },
  { indicator: 'Chain-able with other vulns', multiplier: 2, icon: '🔗' },
  { indicator: 'Affects all users (not just self)', multiplier: 2, icon: '👥' },
  { indicator: 'Requires no user interaction', multiplier: 1.5, icon: '🎯' },
  { indicator: 'Affects core business function', multiplier: 1.5, icon: '⚙️' },
  { indicator: 'New/unique attack vector', multiplier: 1.5, icon: '✨' },
  { indicator: 'Easily reproducible', multiplier: 1.2, icon: '🔄' },
  { indicator: 'Has working PoC', multiplier: 1.2, icon: '💻' }
];

export const REPORT_SECTIONS: ReportSection[] = [
  {
    id: 'executive_summary',
    title: 'Executive Summary',
    description: 'High-level overview for decision makers. What did you find and why does it matter?',
    priority: 'critical',
    bountyImpact: 'Sets the tone - strong summaries get faster triage',
    fields: [
      { id: 'target', label: 'Target Scope', type: 'text', placeholder: 'e.g., *.example.com, api.example.com', tip: 'Be specific about what\'s in scope' },
      { id: 'engagement_type', label: 'Engagement Type', type: 'select', options: ['Bug Bounty', 'VDP', 'Pentest', 'Red Team', 'CTF'], tip: 'Different programs have different expectations' },
      { id: 'testing_period', label: 'Testing Period', type: 'text', placeholder: 'Jan 15-20, 2026', tip: 'Shows your timeline and effort' },
      { id: 'total_findings', label: 'Total Findings Summary', type: 'textarea', placeholder: '2 Critical, 3 High, 5 Medium...', tip: 'Lead with impact, not quantity' },
      { id: 'key_risk', label: 'Primary Risk Statement', type: 'textarea', placeholder: 'The most significant finding allows an unauthenticated attacker to...', tip: 'One sentence that captures the worst-case scenario' }
    ]
  },
  {
    id: 'attack_surface',
    title: 'Attack Surface Analysis',
    description: 'Map the target before diving deep. Document what exists and what looks interesting.',
    priority: 'high',
    bountyImpact: 'Good recon = fewer duplicates, more unique finds',
    fields: [
      { id: 'subdomains', label: 'Subdomain Enumeration', type: 'textarea', placeholder: 'api.example.com - REST API\nadmin.example.com - Admin panel\nstaging.example.com - Staging env', tip: 'Note purpose of each, staging/dev often less hardened' },
      { id: 'tech_stack', label: 'Technology Stack', type: 'textarea', placeholder: 'Frontend: React 18\nBackend: Node.js/Express\nDatabase: PostgreSQL\nAuth: OAuth2/JWT', tip: 'Each tech has known vuln patterns' },
      { id: 'endpoints', label: 'Interesting Endpoints', type: 'textarea', placeholder: '/api/v1/users - User CRUD\n/api/admin/* - Admin functions\n/debug/* - Debug endpoints (!!)', tip: 'Star the juicy ones' },
      { id: 'auth_mechanisms', label: 'Authentication Methods', type: 'checklist', options: ['Session cookies', 'JWT tokens', 'API keys', 'OAuth', 'Basic auth', 'MFA', 'SSO'], tip: 'Auth vulns = high payouts' },
      { id: 'input_vectors', label: 'Input Vectors Identified', type: 'textarea', placeholder: 'File upload on /profile\nSearch with filters on /products\nWebSocket on /chat', tip: 'Every input is a potential entry point' }
    ]
  },
  {
    id: 'lead_prioritization',
    title: 'Lead Prioritization Matrix',
    description: 'Not all leads are equal. Prioritize by potential impact and likelihood of success.',
    priority: 'critical',
    bountyImpact: 'Focus your time on high-value targets first',
    fields: [
      { id: 'high_value_leads', label: 'High-Value Leads (Pursue First)', type: 'table', placeholder: 'Lead | Why High Value | Next Step | Time Est.', tip: 'These have the best ROI on your time' },
      { id: 'medium_leads', label: 'Medium-Value Leads (Queue)', type: 'table', placeholder: 'Lead | Potential | Blockers', tip: 'Good fallbacks if high-value don\'t pan out' },
      { id: 'low_value_parked', label: 'Parked Leads (For Later)', type: 'textarea', placeholder: 'Info disclosure that might chain later...', tip: 'Don\'t forget these - they might become critical with context' },
      { id: 'dead_ends', label: 'Dead Ends (Documented)', type: 'textarea', placeholder: 'Tried SQLi on /search - parameterized\nCSRF on /api/* - token validated', tip: 'Document to avoid repeating work' }
    ]
  },
  {
    id: 'hypothesis_testing',
    title: 'Hypothesis Testing Log',
    description: 'Scientific method for bug hunting. Form hypothesis, test, document results.',
    priority: 'high',
    bountyImpact: 'Systematic testing finds more bugs than random poking',
    fields: [
      { id: 'hypotheses', label: 'Active Hypotheses', type: 'textarea', placeholder: 'H1: File upload allows path traversal\nH2: JWT secret is weak/guessable\nH3: Rate limiting missing on /login', tip: 'Be specific and testable' },
      { id: 'tests_performed', label: 'Tests Performed', type: 'textarea', placeholder: 'H1: Tried ../../etc/passwd - blocked by WAF\nH1: Tried null byte injection - SUCCESS', tip: 'Document what worked AND what didn\'t' },
      { id: 'observations', label: 'Interesting Observations', type: 'textarea', placeholder: 'Error messages leak stack traces\nAdmin endpoints return 403 not 404\nCookies missing Secure flag', tip: 'Sometimes gold hides in weird behavior' },
      { id: 'next_tests', label: 'Next Tests Planned', type: 'textarea', placeholder: '- Try SSTI in email template\n- Check for mass assignment on user update\n- Test race condition on promo code', tip: 'Keep momentum with a test queue' }
    ]
  },
  {
    id: 'findings',
    title: 'Vulnerability Findings',
    description: 'The money section. Each finding should be complete enough to submit.',
    priority: 'critical',
    bountyImpact: 'Clear, reproducible reports get paid faster',
    fields: [
      { id: 'findings_list', label: 'Documented Findings', type: 'table', placeholder: 'See findings array in report state', tip: 'Use the Add Finding form below' }
    ]
  },
  {
    id: 'chaining',
    title: 'Vulnerability Chaining',
    description: 'Low-severity bugs can become critical when chained. Document chains.',
    priority: 'high',
    bountyImpact: 'Chains often pay more than individual vulns combined',
    fields: [
      { id: 'potential_chains', label: 'Potential Chains', type: 'textarea', placeholder: 'Info Disclosure (email) + Password Reset IDOR = Account Takeover\nOpen Redirect + OAuth = Token Theft', tip: 'Think like an attacker - what\'s the end goal?' },
      { id: 'confirmed_chains', label: 'Confirmed Chains', type: 'textarea', placeholder: 'CHAIN-1: XSS on /profile → Session theft → Admin access', tip: 'These are your highest-value submissions' },
      { id: 'chain_diagram', label: 'Attack Chain Diagram', type: 'textarea', placeholder: 'User clicks link → XSS fires → Cookie exfil → Attacker replays session → Full access', tip: 'Visuals help triage teams understand impact' }
    ]
  },
  {
    id: 'tools_used',
    title: 'Methodology & Tools',
    description: 'Document your approach for repeatability and learning.',
    priority: 'low',
    bountyImpact: 'Good for personal growth, not required for submission',
    fields: [
      { id: 'tools', label: 'Tools Used', type: 'checklist', options: ['Burp Suite', 'FFUF', 'Nuclei', 'SQLMap', 'Amass', 'Subfinder', 'httpx', 'Nmap', 'Postman', 'Browser DevTools', 'Custom Scripts'], tip: 'Note any custom configs or wordlists' },
      { id: 'methodology', label: 'Methodology Notes', type: 'textarea', placeholder: 'Started with subdomain enum...\nMoved to endpoint discovery...\nFocused on auth flows...', tip: 'What worked? What would you do differently?' },
      { id: 'time_spent', label: 'Time Investment', type: 'text', placeholder: '~15 hours over 3 days', tip: 'Track your ROI over time' }
    ]
  },
  {
    id: 'next_steps',
    title: 'Next Steps & Open Questions',
    description: 'Keep momentum between sessions. What should you do next?',
    priority: 'medium',
    bountyImpact: 'Prevents context loss between sessions',
    fields: [
      { id: 'immediate_actions', label: 'Immediate Actions', type: 'textarea', placeholder: '1. Submit the IDOR finding\n2. Get second opinion on chain validity\n3. Test staging subdomain discovered', tip: 'What\'s the most important next step?' },
      { id: 'open_questions', label: 'Open Questions', type: 'textarea', placeholder: '- Is /api/internal actually internal-only?\n- Why does /admin return 403 not 404?\n- What triggers the rate limiter?', tip: 'Questions often lead to findings' },
      { id: 'blocked_on', label: 'Blocked On', type: 'textarea', placeholder: 'Need Pro account to test premium features\nWaiting for password reset email to arrive', tip: 'Track blockers to unblock later' }
    ]
  }
];

export const FINDING_TEMPLATE: Finding = {
  id: '',
  title: '',
  severity: 'medium',
  category: '',
  description: '',
  stepsToReproduce: '',
  impact: '',
  recommendation: '',
  evidence: [],
  estimatedBounty: '',
  confidence: 'potential',
  status: 'new'
};

export const REPORT_EXPORT_FORMATS = [
  { id: 'markdown', name: 'Markdown', extension: '.md', icon: '📝' },
  { id: 'json', name: 'JSON (Portable)', extension: '.json', icon: '🔧' },
  { id: 'html', name: 'HTML Report', extension: '.html', icon: '🌐' },
  { id: 'hackerone', name: 'HackerOne Format', extension: '.txt', icon: '🔴' },
  { id: 'bugcrowd', name: 'Bugcrowd Format', extension: '.txt', icon: '🟠' }
];

export function calculateBountyEstimate(finding: Finding, indicators: string[]): { min: number; max: number; confidence: string } {
  const category = VULNERABILITY_CATEGORIES.find(c => c.id === finding.category);
  if (!category) return { min: 0, max: 0, confidence: 'unknown' };

  const [minStr, maxStr] = category.avgBounty.replace(/\$/g, '').replace(/,/g, '').replace(/\+/g, '').split('-');
  let baseMin = parseInt(minStr) || 0;
  let baseMax = parseInt(maxStr) || baseMin * 2;

  const severityMultiplier = SEVERITY_SCORES[finding.severity]?.bountyMultiplier || 1;
  let indicatorMultiplier = 1;
  
  indicators.forEach(ind => {
    const match = HIGH_VALUE_INDICATORS.find(h => h.indicator === ind);
    if (match) indicatorMultiplier *= match.multiplier;
  });

  const finalMultiplier = severityMultiplier * Math.min(indicatorMultiplier, 5);
  
  return {
    min: Math.round(baseMin * finalMultiplier),
    max: Math.round(baseMax * finalMultiplier),
    confidence: finding.confidence
  };
}

export function generateMarkdownReport(report: Record<string, string>, findings: Finding[]): string {
  let md = `# Security Assessment Report\n\n`;
  md += `**Generated:** ${new Date().toISOString()}\n\n`;
  md += `---\n\n`;

  REPORT_SECTIONS.forEach(section => {
    md += `## ${section.title}\n\n`;
    section.fields.forEach(field => {
      const value = report[field.id];
      if (value) {
        md += `### ${field.label}\n${value}\n\n`;
      }
    });
  });

  if (findings.length > 0) {
    md += `## Detailed Findings\n\n`;
    findings.forEach((f, i) => {
      md += `### Finding ${i + 1}: ${f.title}\n\n`;
      md += `**Severity:** ${f.severity.toUpperCase()} | **Category:** ${f.category} | **Status:** ${f.status}\n\n`;
      md += `**Description:**\n${f.description}\n\n`;
      md += `**Steps to Reproduce:**\n${f.stepsToReproduce}\n\n`;
      md += `**Impact:**\n${f.impact}\n\n`;
      md += `**Recommendation:**\n${f.recommendation}\n\n`;
      md += `---\n\n`;
    });
  }

  return md;
}
