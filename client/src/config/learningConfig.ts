export type LearningStyle = 
  | 'experiential'
  | 'visual'
  | 'analytical'
  | 'social'
  | 'pragmatic';

export type LearningGoal = 
  | 'bgp_routing'
  | 'osint_investigation'
  | 'threat_hunting'
  | 'malware_reverse_engineering'
  | 'incident_response'
  | 'penetration_testing'
  | 'vulnerability_research'
  | 'forensics'
  | 'social_engineering'
  | 'network_security'
  | 'cloud_security'
  | 'red_teaming'
  | 'blue_teaming';

export interface LearningProfile {
  style: LearningStyle;
  goals: LearningGoal[];
  interests: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferredPace: 'fast' | 'moderate' | 'thorough';
}

export const LEARNING_STYLES: { id: LearningStyle; name: string; description: string; icon: string }[] = [
  {
    id: 'experiential',
    name: 'Experiential Learner',
    description: 'Learn by doing - hands-on labs, practical exercises, and real-world scenarios',
    icon: '🔧'
  },
  {
    id: 'visual',
    name: 'Visual Learner',
    description: 'Prefer diagrams, flowcharts, network maps, and visual representations',
    icon: '📊'
  },
  {
    id: 'analytical',
    name: 'Analytical Learner',
    description: 'Deep dive into theory, documentation, RFCs, and technical specifications',
    icon: '🔬'
  },
  {
    id: 'social',
    name: 'Social Learner',
    description: 'Discussion-based learning, collaborative investigation, community resources',
    icon: '👥'
  },
  {
    id: 'pragmatic',
    name: 'Pragmatic Learner',
    description: 'Quick results, practical shortcuts, automation scripts, and efficiency',
    icon: '⚡'
  }
];

export const LEARNING_GOALS: { id: LearningGoal; name: string; description: string; category: string; tools: string[] }[] = [
  {
    id: 'bgp_routing',
    name: 'BGP & Routing Analysis',
    description: 'Border Gateway Protocol, AS paths, route hijacking detection',
    category: 'Network',
    tools: ['bgpstream', 'RIPE RIS', 'Hurricane Electric BGP Toolkit', 'Shodan']
  },
  {
    id: 'osint_investigation',
    name: 'OSINT Investigation',
    description: 'Open-source intelligence, target profiling, digital footprint analysis',
    category: 'Intelligence',
    tools: ['Maltego', 'theHarvester', 'Shodan', 'Censys', 'SpiderFoot']
  },
  {
    id: 'threat_hunting',
    name: 'Threat Hunting',
    description: 'Proactive threat detection, IOC analysis, behavioral patterns',
    category: 'Defense',
    tools: ['YARA', 'Sigma', 'Elasticsearch', 'Splunk', 'Velociraptor']
  },
  {
    id: 'malware_reverse_engineering',
    name: 'Malware Reverse Engineering',
    description: 'Static/dynamic analysis, unpacking, debugging malicious code',
    category: 'Analysis',
    tools: ['Ghidra', 'IDA Pro', 'x64dbg', 'Cutter', 'FLARE-VM']
  },
  {
    id: 'incident_response',
    name: 'Incident Response',
    description: 'Containment, eradication, recovery, forensic preservation',
    category: 'Defense',
    tools: ['Velociraptor', 'GRR', 'TheHive', 'MISP', 'Cortex']
  },
  {
    id: 'penetration_testing',
    name: 'Penetration Testing',
    description: 'Vulnerability exploitation, privilege escalation, lateral movement',
    category: 'Offense',
    tools: ['Metasploit', 'Burp Suite', 'Nmap', 'Cobalt Strike', 'BloodHound']
  },
  {
    id: 'vulnerability_research',
    name: 'Vulnerability Research',
    description: 'Bug hunting, fuzzing, CVE analysis, exploit development',
    category: 'Research',
    tools: ['AFL', 'libFuzzer', 'Nuclei', 'ZAP', 'Semgrep']
  },
  {
    id: 'forensics',
    name: 'Digital Forensics',
    description: 'Evidence acquisition, timeline analysis, artifact recovery',
    category: 'Analysis',
    tools: ['Autopsy', 'FTK', 'Volatility', 'Plaso', 'KAPE']
  },
  {
    id: 'social_engineering',
    name: 'Social Engineering',
    description: 'Phishing analysis, pretexting, human factor security',
    category: 'Offense',
    tools: ['Gophish', 'SET', 'Evilginx', 'King Phisher']
  },
  {
    id: 'network_security',
    name: 'Network Security',
    description: 'Traffic analysis, IDS/IPS, firewall configuration',
    category: 'Defense',
    tools: ['Wireshark', 'Zeek', 'Suricata', 'pfSense', 'tcpdump']
  },
  {
    id: 'cloud_security',
    name: 'Cloud Security',
    description: 'AWS/Azure/GCP security, IAM, container security',
    category: 'Defense',
    tools: ['Prowler', 'ScoutSuite', 'Pacu', 'CloudSploit', 'Trivy']
  },
  {
    id: 'red_teaming',
    name: 'Red Teaming',
    description: 'Adversary simulation, TTPs, MITRE ATT&CK framework',
    category: 'Offense',
    tools: ['Cobalt Strike', 'Sliver', 'Havoc', 'Brute Ratel', 'Mythic']
  },
  {
    id: 'blue_teaming',
    name: 'Blue Teaming',
    description: 'Detection engineering, SIEM, threat intelligence',
    category: 'Defense',
    tools: ['Elastic SIEM', 'Splunk', 'Microsoft Sentinel', 'Wazuh', 'OSSEC']
  }
];

export const SKILL_LEVELS = [
  { id: 'beginner', name: 'Beginner', description: 'New to cybersecurity, learning fundamentals' },
  { id: 'intermediate', name: 'Intermediate', description: 'Familiar with common tools and concepts' },
  { id: 'advanced', name: 'Advanced', description: 'Experienced with complex techniques and edge cases' },
  { id: 'expert', name: 'Expert', description: 'Deep expertise, exploring cutting-edge research' }
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Network': 'bg-blue-900/30 text-blue-400 border-blue-800',
  'Intelligence': 'bg-purple-900/30 text-purple-400 border-purple-800',
  'Defense': 'bg-green-900/30 text-green-400 border-green-800',
  'Offense': 'bg-red-900/30 text-red-400 border-red-800',
  'Analysis': 'bg-amber-900/30 text-amber-400 border-amber-800',
  'Research': 'bg-teal-900/30 text-teal-400 border-teal-800'
};
