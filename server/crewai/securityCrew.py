#!/usr/bin/env python3
"""
Offensive Security Crew - Bespoke AI agents for client network monitoring
Powered by CrewAI with 100% FREE models

Deploy on client networks for real-time threat detection and response
"""

from crewai import Agent, Task, Crew, Process
from crewai_tools import tool
import os
import json
import subprocess
import requests
from datetime import datetime
from typing import Dict, List, Optional

# ============================================================================
# TOOLS - Wrapped security tools for agent use
# ============================================================================

@tool
def run_nmap_scan(target: str, scan_type: str = "quick") -> str:
    """
    Run nmap scan on target network.
    Scan types: quick, full, stealth, vuln
    Returns: JSON formatted scan results
    """
    try:
        scan_commands = {
            'quick': f'nmap -T4 -F {target}',
            'full': f'nmap -T4 -p- {target}',
            'stealth': f'nmap -sS -T2 {target}',
            'vuln': f'nmap -sV --script=vuln {target}'
        }
        
        cmd = scan_commands.get(scan_type, scan_commands['quick'])
        result = subprocess.run(
            cmd.split(),
            capture_output=True,
            text=True,
            timeout=300
        )
        
        return f"Scan completed:\n{result.stdout}"
    except Exception as e:
        return f"Error running nmap: {str(e)}"

@tool
def run_nuclei_scan(target: str) -> str:
    """
    Run Nuclei vulnerability scanner on target.
    Returns: Discovered vulnerabilities with severity
    """
    try:
        cmd = f'nuclei -u {target} -json -silent'
        result = subprocess.run(
            cmd.split(),
            capture_output=True,
            text=True,
            timeout=300
        )
        
        vulns = []
        for line in result.stdout.split('\n'):
            if line.strip():
                try:
                    vuln = json.loads(line)
                    vulns.append({
                        'template': vuln.get('template-id'),
                        'severity': vuln.get('info', {}).get('severity'),
                        'name': vuln.get('info', {}).get('name'),
                        'matched': vuln.get('matched-at')
                    })
                except:
                    continue
        
        return json.dumps(vulns, indent=2)
    except Exception as e:
        return f"Error running nuclei: {str(e)}"

@tool
def check_shodan(ip: str) -> str:
    """
    Query Shodan for internet-exposed services.
    Returns: Open ports, services, vulnerabilities
    """
    api_key = os.getenv('SHODAN_API_KEY')
    if not api_key:
        return "Shodan API key not configured"
    
    try:
        response = requests.get(
            f'https://api.shodan.io/shodan/host/{ip}',
            params={'key': api_key},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            return json.dumps({
                'ip': data.get('ip_str'),
                'ports': data.get('ports', []),
                'vulns': data.get('vulns', []),
                'services': [p.get('product', 'unknown') for p in data.get('data', [])]
            }, indent=2)
        else:
            return f"Shodan API error: {response.status_code}"
    except Exception as e:
        return f"Error querying Shodan: {str(e)}"

@tool
def trace_cryptocurrency(address: str, chain: str = "bitcoin") -> str:
    """
    Trace cryptocurrency transactions (public blockchain data only).
    Returns: Transaction history, connected addresses
    """
    try:
        if chain == "bitcoin":
            url = f"https://blockchain.info/rawaddr/{address}?limit=50"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return json.dumps({
                    'address': address,
                    'total_received': data.get('total_received', 0) / 100000000,  # BTC
                    'total_sent': data.get('total_sent', 0) / 100000000,
                    'balance': data.get('final_balance', 0) / 100000000,
                    'tx_count': data.get('n_tx', 0),
                    'first_tx': data.get('txs', [{}])[0].get('time') if data.get('txs') else None
                }, indent=2)
        
        return "Chain not supported (bitcoin only for now)"
    except Exception as e:
        return f"Error tracing crypto: {str(e)}"

@tool
def report_finding_to_cloud(finding: Dict) -> str:
    """
    Report security finding to cloud platform for client dashboard.
    Returns: Confirmation of alert creation
    """
    cloud_api = os.getenv('ATROPOS_CLOUD_API', 'http://localhost:5000')
    client_id = os.getenv('CLIENT_ID')
    
    try:
        response = requests.post(
            f'{cloud_api}/api/client-agents/findings',
            json={
                'client_id': client_id,
                'finding': finding,
                'timestamp': datetime.now().isoformat()
            },
            timeout=5
        )
        
        if response.status_code == 200:
            return f"Finding reported to client dashboard: {finding.get('title')}"
        else:
            return f"Failed to report finding: {response.status_code}"
    except Exception as e:
        return f"Error reporting finding: {str(e)}"

# ============================================================================
# AGENT DEFINITIONS - Security crew members
# ============================================================================

def create_recon_agent():
    """Network reconnaissance specialist"""
    return Agent(
        role='Network Reconnaissance Specialist',
        goal='Map the complete attack surface of the client network and identify all assets',
        backstory='''You are an expert in network reconnaissance and asset discovery.
        You use passive and active techniques to enumerate hosts, services, and potential entry points.
        You prioritize stealth and thoroughness, documenting everything you find.''',
        
        # FREE model - runs on edge device
        llm='ollama/mistral:7b',
        
        tools=[run_nmap_scan, check_shodan, report_finding_to_cloud],
        allow_delegation=False,
        verbose=True,
        max_iter=15
    )

def create_vulnerability_scanner():
    """Vulnerability assessment specialist"""
    return Agent(
        role='Vulnerability Assessment Specialist',
        goal='Identify and prioritize security vulnerabilities across the client infrastructure',
        backstory='''You are an expert in vulnerability assessment and CVE analysis.
        You scan for known vulnerabilities, misconfigurations, and security weaknesses.
        You prioritize findings by exploitability and business impact.''',
        
        # FREE model
        llm='ollama/mistral:7b',
        
        tools=[run_nuclei_scan, report_finding_to_cloud],
        allow_delegation=False,
        verbose=True,
        max_iter=15
    )

def create_threat_hunter():
    """Proactive threat hunting specialist"""
    return Agent(
        role='Threat Hunting Specialist',
        goal='Proactively search for indicators of compromise and suspicious patterns',
        backstory='''You are an expert threat hunter specializing in behavioral analysis.
        You look for anomalies, unusual patterns, and early indicators of attack.
        You think like an attacker to anticipate threats before they materialize.''',
        
        # FREE cloud model for heavy analysis
        llm='groq/mixtral-8x7b-32768',
        
        tools=[report_finding_to_cloud],
        allow_delegation=True,
        verbose=True,
        max_iter=15
    )

def create_incident_responder():
    """Incident response and containment specialist"""
    return Agent(
        role='Incident Response Specialist',
        goal='Contain security incidents quickly and minimize damage',
        backstory='''You are an expert in incident response and threat containment.
        You make rapid decisions to isolate threats while preserving evidence.
        You always get human approval before taking containment actions.''',
        
        # CHEAP model for critical decisions
        llm='openrouter/anthropic/claude-3-haiku',
        
        tools=[report_finding_to_cloud],
        allow_delegation=False,
        verbose=True,
        max_iter=10,
        # Human approval required for actions
        human_input_mode='ALWAYS'
    )

def create_report_generator():
    """Security report and communication specialist"""
    return Agent(
        role='Security Report Specialist',
        goal='Generate clear, actionable security reports for technical and executive audiences',
        backstory='''You are an expert in security reporting and executive communication.
        You translate technical findings into business impact.
        You create reports that drive decision-making and remediation.''',
        
        # FREE model with good writing
        llm='groq/llama-3.1-70b-versatile',
        
        tools=[],
        allow_delegation=False,
        verbose=True
    )

# ============================================================================
# CREW DEPLOYMENT - Main orchestration
# ============================================================================

class ClientSecurityCrew:
    """
    Manages a complete security crew deployed on a client network.
    Runs continuously, reports findings, requests human approval for actions.
    """
    
    def __init__(self, client_id: str, client_network: str, service_tier: str):
        self.client_id = client_id
        self.client_network = client_network
        self.service_tier = service_tier
        
        # Initialize agents
        self.recon_agent = create_recon_agent()
        self.vuln_scanner = create_vulnerability_scanner()
        self.threat_hunter = create_threat_hunter()
        self.incident_responder = create_incident_responder()
        self.report_generator = create_report_generator()
        
        # Configure crew based on service tier
        self.configure_for_tier(service_tier)
    
    def configure_for_tier(self, tier: str):
        """Adjust agent capabilities based on client service tier"""
        if tier == 'small_business':
            # Basic monitoring - recon and scanning only
            self.agents = [self.recon_agent, self.vuln_scanner, self.report_generator]
            self.scan_frequency = 86400  # Daily
            
        elif tier == 'mid_market':
            # Full crew minus auto-response
            self.agents = [
                self.recon_agent,
                self.vuln_scanner,
                self.threat_hunter,
                self.report_generator
            ]
            self.scan_frequency = 3600  # Hourly
            
        elif tier == 'enterprise':
            # Full crew with incident response
            self.agents = [
                self.recon_agent,
                self.vuln_scanner,
                self.threat_hunter,
                self.incident_responder,
                self.report_generator
            ]
            self.scan_frequency = 300  # Every 5 minutes
    
    def run_security_assessment(self) -> Dict:
        """
        Execute full security assessment with agent crew.
        Returns: Comprehensive security report
        """
        
        # Task 1: Network Reconnaissance
        recon_task = Task(
            description=f'''
            Perform network reconnaissance on {self.client_network}:
            1. Discover all live hosts
            2. Enumerate open ports and services
            3. Identify web applications and APIs
            4. Check Shodan for exposed services
            5. Document findings clearly
            
            Focus on: Attack surface mapping and asset inventory
            ''',
            agent=self.recon_agent,
            expected_output='Complete network map with all discovered assets'
        )
        
        # Task 2: Vulnerability Scanning
        vuln_task = Task(
            description='''
            Scan discovered assets for vulnerabilities:
            1. Run Nuclei against all web targets
            2. Prioritize by severity (critical > high > medium > low)
            3. Check for known CVEs
            4. Identify misconfigurations
            5. Report high-severity findings immediately
            
            Focus on: Exploitable vulnerabilities and quick wins
            ''',
            agent=self.vuln_scanner,
            expected_output='Prioritized vulnerability list with remediation guidance',
            context=[recon_task]
        )
        
        # Task 3: Threat Hunting (if enabled)
        if self.threat_hunter in self.agents:
            hunt_task = Task(
                description='''
                Hunt for threats based on discovered infrastructure:
                1. Look for signs of compromise
                2. Identify suspicious patterns
                3. Check for backdoors or persistence
                4. Analyze for data exfiltration indicators
                5. Assess overall security posture
                
                Think like an attacker: What would YOU target first?
                ''',
                agent=self.threat_hunter,
                expected_output='Threat assessment with risk scoring',
                context=[recon_task, vuln_task]
            )
        else:
            hunt_task = None
        
        # Task 4: Generate Report
        report_task = Task(
            description='''
            Generate comprehensive security report:
            
            Executive Summary:
            - Overall risk score (0-100)
            - Critical findings summary
            - Business impact assessment
            - Immediate action items
            
            Technical Details:
            - Complete asset inventory
            - Vulnerability breakdown by severity
            - Threat indicators found
            - Network topology
            
            Recommendations:
            - Prioritized remediation roadmap
            - Cost estimates for fixes
            - Timeline for implementation
            
            Make it clear, actionable, and valuable for both technical and executive audiences.
            ''',
            agent=self.report_generator,
            expected_output='Professional security assessment report',
            context=[recon_task, vuln_task] + ([hunt_task] if hunt_task else [])
        )
        
        # Assemble crew and execute
        tasks = [recon_task, vuln_task]
        if hunt_task:
            tasks.append(hunt_task)
        tasks.append(report_task)
        
        crew = Crew(
            agents=self.agents,
            tasks=tasks,
            process=Process.sequential,
            verbose=True,
            memory=True,  # Agents remember previous scans
            embedder={
                "provider": "ollama",
                "config": {
                    "model": "nomic-embed-text"
                }
            }
        )
        
        # Execute the investigation
        print(f"\n{'='*80}")
        print(f"Starting security assessment for client: {self.client_id}")
        print(f"Target network: {self.client_network}")
        print(f"Service tier: {self.service_tier}")
        print(f"Agents deployed: {len(self.agents)}")
        print(f"{'='*80}\n")
        
        result = crew.kickoff()
        
        return {
            'client_id': self.client_id,
            'scan_date': datetime.now().isoformat(),
            'report': str(result),
            'agents_used': len(self.agents),
            'total_cost': self.calculate_cost()
        }
    
    def calculate_cost(self) -> float:
        """Calculate actual cost of this scan (should be near $0)"""
        # Ollama models: FREE
        # Groq models: FREE
        # Claude Haiku: ~$0.50 for typical incident response
        return 0.50 if self.incident_responder in self.agents else 0.0

# ============================================================================
# SPECIALIZED CREWS FOR ANTI-TRAFFICKING
# ============================================================================

def create_anti_trafficking_crew():
    """
    Specialized crew for human trafficking investigations.
    Focuses on: Social media, dark web, cryptocurrency, network mapping
    """
    
    # Social Media Investigator
    socmint_agent = Agent(
        role='Social Media Intelligence Specialist',
        goal='Identify trafficking recruitment patterns and suspicious accounts on social platforms',
        backstory='''You are an expert in social media OSINT and online trafficking indicators.
        You know the red flags: fake modeling agencies, too-good-to-be-true job offers,
        isolated communications, payment requests. You protect victims by finding networks early.''',
        
        llm='groq/mixtral-8x7b-32768',
        verbose=True
    )
    
    # Cryptocurrency Tracer
    crypto_agent = Agent(
        role='Cryptocurrency Forensics Specialist',
        goal='Trace trafficking proceeds through blockchain to identify cash-out points',
        backstory='''You are an expert in blockchain forensics and anti-money laundering.
        You trace Bitcoin through mixers, identify exchange deposits, and cluster wallets.
        Your work has led to asset seizures and prosecutions.''',
        
        llm='groq/llama-3.1-70b-versatile',
        tools=[trace_cryptocurrency],
        verbose=True
    )
    
    # Dark Web Analyst
    darkweb_agent = Agent(
        role='Dark Web Intelligence Analyst',
        goal='Safely gather intelligence on dark web trafficking operations',
        backstory='''You are an expert in dark web investigations and operational security.
        You analyze infrastructure, identify operators, and map networks WITHOUT accessing
        illegal content. You work only with metadata and public information.''',
        
        llm='groq/mixtral-8x7b-32768',
        verbose=True
    )
    
    # Report Generator (Law Enforcement Format)
    le_reporter = Agent(
        role='Law Enforcement Report Specialist',
        goal='Generate actionable intelligence reports formatted for law enforcement and NGOs',
        backstory='''You are an expert in writing reports for FBI, HSI, and Interpol.
        You know what information they need, what format they prefer, and what makes
        intelligence actionable. Your reports have led to arrests and rescues.''',
        
        llm='groq/llama-3.1-70b-versatile',
        verbose=True
    )
    
    return {
        'socmint': socmint_agent,
        'crypto': crypto_agent,
        'darkweb': darkweb_agent,
        'reporter': le_reporter
    }

def investigate_trafficking_network(
    instagram_handle: str,
    bitcoin_address: Optional[str] = None
) -> str:
    """
    Execute Operation Shadow Network investigation.
    """
    agents = create_anti_trafficking_crew()
    
    # Task 1: Social Media Investigation
    social_task = Task(
        description=f'''
        Investigate suspected trafficking recruitment on Instagram: {instagram_handle}
        
        Analyze:
        1. Account red flags (fake followers, stock photos, suspicious patterns)
        2. Follower network (identify other suspicious accounts)
        3. Communication patterns (DMs, comments, common phrases)
        4. Geographic indicators (locations mentioned)
        5. Network connections (same operator, different accounts?)
        
        ⚠️ ETHICS: Never contact suspect, never pose as victim. Public data only.
        
        Output: Network map of connected suspicious accounts
        ''',
        agent=agents['socmint'],
        expected_output='Social media network analysis with red flags'
    )
    
    # Task 2: Cryptocurrency Tracing (if wallet provided)
    crypto_task = None
    if bitcoin_address:
        crypto_task = Task(
            description=f'''
            Trace trafficking proceeds through blockchain: {bitcoin_address}
            
            Investigate:
            1. Transaction history (inbound/outbound)
            2. Mixer/tumbler usage detection
            3. Exchange deposit identification
            4. Wallet clustering (same owner)
            5. Cash-out points (final destination)
            
            Methodology: FBI blockchain forensics (Colonial Pipeline style)
            
            Output: Money flow diagram with exchange identifications
            ''',
            agent=agents['crypto'],
            expected_output='Cryptocurrency tracing report with cash-out points'
        )
    
    # Task 3: Generate Law Enforcement Report
    report_task = Task(
        description='''
        Generate actionable intelligence report for law enforcement:
        
        Format for: FBI VCAC, HSI, NCMEC CyberTipline
        
        Include:
        1. Executive Summary (1 page)
        2. Network Map (visual diagram)
        3. Indicators of Compromise:
           - Instagram accounts
           - Bitcoin addresses
           - Communication patterns
        4. Evidence Summary (what to subpoena)
        5. Recommended Actions (next investigative steps)
        6. Appendix (detailed methodology)
        
        Make it professional and court-admissible.
        ''',
        agent=agents['reporter'],
        expected_output='Complete law enforcement intelligence package',
        context=[social_task] + ([crypto_task] if crypto_task else [])
    )
    
    # Execute investigation
    tasks = [social_task]
    if crypto_task:
        tasks.append(crypto_task)
    tasks.append(report_task)
    
    crew = Crew(
        agents=list(agents.values()),
        tasks=tasks,
        process=Process.sequential,
        verbose=True,
        memory=True
    )
    
    print(f"\n{'='*80}")
    print(f"🚨 OPERATION SHADOW NETWORK - Anti-Trafficking Investigation")
    print(f"Target: {instagram_handle}")
    if bitcoin_address:
        print(f"Crypto: {bitcoin_address}")
    print(f"{'='*80}\n")
    
    result = crew.kickoff()
    
    return str(result)

# ============================================================================
# DEPLOYMENT SCRIPT - Run this on client networks
# ============================================================================

def deploy_security_crew(client_id: str, network_cidr: str, tier: str):
    """
    Deploy security crew on client network.
    
    Usage:
        python securityCrew.py deploy --client CLIENT123 --network 10.0.0.0/24 --tier enterprise
    """
    crew = ClientSecurityCrew(client_id, network_cidr, tier)
    result = crew.run_security_assessment()
    
    print("\n" + "="*80)
    print("SECURITY ASSESSMENT COMPLETE")
    print("="*80)
    print(f"Client: {client_id}")
    print(f"Cost: ${result['total_cost']}")
    print(f"Agents: {result['agents_used']}")
    print(f"Report generated: {result['scan_date']}")
    print("="*80 + "\n")
    
    # Save report
    with open(f'/tmp/security_report_{client_id}.json', 'w') as f:
        json.dump(result, f, indent=2)
    
    print(f"Report saved: /tmp/security_report_{client_id}.json")
    
    return result

# ============================================================================
# CLI INTERFACE
# ============================================================================

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Deploy Atropos Security Crew')
    parser.add_argument('command', choices=['deploy', 'investigate'], help='Command to execute')
    parser.add_argument('--client', required=True, help='Client ID')
    parser.add_argument('--network', help='Network CIDR (for deploy)')
    parser.add_argument('--tier', default='mid_market', choices=['small_business', 'mid_market', 'enterprise'])
    parser.add_argument('--instagram', help='Instagram handle (for investigate)')
    parser.add_argument('--bitcoin', help='Bitcoin address (for investigate)')
    
    args = parser.parse_args()
    
    if args.command == 'deploy':
        if not args.network:
            print("Error: --network required for deploy command")
            exit(1)
        
        deploy_security_crew(args.client, args.network, args.tier)
        
    elif args.command == 'investigate':
        if not args.instagram:
            print("Error: --instagram required for investigate command")
            exit(1)
        
        result = investigate_trafficking_network(args.instagram, args.bitcoin)
        
        print("\n" + "="*80)
        print("INVESTIGATION COMPLETE")
        print("="*80)
        print(result)
        print("="*80 + "\n")
        
        # Save report
        with open(f'/tmp/investigation_{args.client}.txt', 'w') as f:
            f.write(result)
        
        print(f"Report saved: /tmp/investigation_{args.client}.txt")

"""
DEPLOYMENT EXAMPLES:

1. Deploy security crew on client network:
   python securityCrew.py deploy --client CLIENT001 --network 10.0.0.0/24 --tier enterprise

2. Run anti-trafficking investigation:
   python securityCrew.py investigate --client NGO_POLARIS --instagram @suspicious_agency --bitcoin 1A1zP1e...

3. Continuous monitoring (cron job):
   */30 * * * * cd /opt/atropos && python securityCrew.py deploy --client CLIENT001 --network 10.0.0.0/24
"""
