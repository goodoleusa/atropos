import { ArcTemplate, CampaignNode, CampaignLink, HiddenClue, ClueType, mkNode, mkLink, mkClue } from './CampaignTypes';

export const ARC_TEMPLATES: ArcTemplate[] = [
  { name: 'Phantom Thread', desc: 'Phishing / Initial Access', category: 'social', nodes: [
    mkNode('pt1','step','Suspicious Email','Analyze the phishing email. Check [[Sender Analysis]] for header clues.',0,0),
    mkNode('pt2','tool','Sender Analysis','Run DKIM/SPF checks. Forward to [[Payload Extraction]].',300,0),
    mkNode('pt3','step','Payload Extraction','Extract the malicious attachment. See [[Credential Harvest]].',600,0),
    mkNode('pt4','output','Credential Harvest','Document captured credentials and IOCs.',900,0),
  ], links: [mkLink('pt1','pt2'),mkLink('pt2','pt3'),mkLink('pt3','pt4')],
    clues: [mkClue('source-code','pt3','Check the HTML source for a hidden form action','https://evil.corp/harvest'),mkClue('http-header','pt1','Inspect X-Originating-IP header','192.168.13.37')]},
  { name: 'Ghost Protocol', desc: 'Persistence / Backdoor', category: 'exploit', nodes: [
    mkNode('gp1','step','Initial Foothold','Enumerate services. Proceed to [[Registry Persistence]].',0,0),
    mkNode('gp2','tool','Registry Persistence','Plant RunOnce key. Verify with [[Callback Verification]].',300,0),
    mkNode('gp3','output','Callback Verification','Confirm C2 beacon established.',600,0),
  ], links: [mkLink('gp1','gp2'),mkLink('gp2','gp3')],
    clues: [mkClue('console-log','gp2','Check browser console for encoded beacon','beacon_active=true'),mkClue('data-attribute','gp3','Look for data-status attribute','persistence-confirmed')]},
  { name: 'Shadow Network', desc: 'OSINT Recon', category: 'osint', nodes: [
    mkNode('sn1','step','Target Profile','Gather initial intel on target. Check [[Domain Recon]].',0,0),
    mkNode('sn2','tool','Domain Recon','WHOIS/DNS enumeration. See [[Social Footprint]].',300,0),
    mkNode('sn3','step','Social Footprint','Map social accounts. Cross-ref with [[Dark Web Search]].',600,0),
    mkNode('sn4','tool','Dark Web Search','Search .onion indexes for mentions. See [[Intel Report]].',300,200),
    mkNode('sn5','output','Intel Report','Compile findings into structured report.',600,200),
  ], links: [mkLink('sn1','sn2'),mkLink('sn2','sn3'),mkLink('sn3','sn4'),mkLink('sn4','sn5')],
    clues: [mkClue('meta-tag','sn1','Check meta author tag','agent_shadow'),mkClue('css-comment','sn3','Hidden CSS comment reveals alias','/* alias: gh0st_runner */'),mkClue('base64','sn5','Decode the base64 string in the report footer','U2hhZG93IE5ldHdvcms=')]},
  { name: 'Wire Transfer', desc: 'Financial / Crypto Tracing', category: 'forensics', nodes: [
    mkNode('wt1','step','Transaction Alert','Suspicious transfer flagged. Trace via [[Blockchain Explorer]].',0,0),
    mkNode('wt2','tool','Blockchain Explorer','Follow the money through mixers. See [[Exchange KYC]].',300,0),
    mkNode('wt3','step','Exchange KYC','Subpoena exchange records. Compile in [[Financial Report]].',600,0),
    mkNode('wt4','output','Financial Report','Document the complete money trail.',900,0),
  ], links: [mkLink('wt1','wt2'),mkLink('wt2','wt3'),mkLink('wt3','wt4')],
    clues: [mkClue('network-request','wt2','Inspect XHR for hidden wallet address','bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'),mkClue('hex-encoded','wt4','Decode hex in transaction memo','4d6f6e6579204c61756e646572696e67')]},
  { name: 'Social Spider', desc: 'Social Engineering', category: 'social', nodes: [
    mkNode('ss1','step','Target Selection','Identify high-value target. Build [[Pretext Profile]].',0,0),
    mkNode('ss2','step','Pretext Profile','Craft believable cover story. Plan [[Vishing Call]].',300,0),
    mkNode('ss3','tool','Vishing Call','Execute voice phishing. Record in [[Debrief]].',600,0),
    mkNode('ss4','output','Debrief','Document what intel was extracted.',900,0),
  ], links: [mkLink('ss1','ss2'),mkLink('ss2','ss3'),mkLink('ss3','ss4')],
    clues: [mkClue('http-header','ss1','Check custom X-Agent header','spider-agent-7'),mkClue('source-code','ss3','View source for hidden script tag','<script>reportBack("success")</script>')]},
  { name: 'Dark Mirror', desc: 'Dark Web Intel', category: 'osint', nodes: [
    mkNode('dm1','step','Surface Scan','Search clearnet for breadcrumbs. Follow to [[Onion Crawl]].',0,0),
    mkNode('dm2','tool','Onion Crawl','Crawl hidden services. Document in [[Intel Dossier]].',300,0),
    mkNode('dm3','output','Intel Dossier','Compile dark web intelligence report.',600,0),
  ], links: [mkLink('dm1','dm2'),mkLink('dm2','dm3')],
    clues: [mkClue('steganography','dm2','Image contains hidden data','dead_drop_location_42'),mkClue('base64','dm3','Base64 in page footer','RGFyayBNaXJyb3IgQWN0aXZl')]},
  { name: 'Packet Storm', desc: 'Network Forensics', category: 'forensics', nodes: [
    mkNode('ps1','step','Capture Traffic','Start packet capture on suspect interface. Analyze in [[Protocol Analysis]].',0,0),
    mkNode('ps2','tool','Protocol Analysis','Deep-dive into anomalous packets. Check [[DNS Tunneling]].',300,0),
    mkNode('ps3','decision','DNS Tunneling','Is data being exfiltrated via DNS? See [[Forensic Report]].',600,0),
    mkNode('ps4','output','Forensic Report','Document network forensics findings.',900,0),
  ], links: [mkLink('ps1','ps2'),mkLink('ps2','ps3'),mkLink('ps3','ps4')],
    clues: [mkClue('console-log','ps1','Console shows hidden packet count','captured_packets: 1337'),mkClue('network-request','ps2','XHR reveals C2 domain','c2.malware.internal'),mkClue('http-header','ps4','Response header contains case ID','X-Case-ID: PKT-2026-001')]},
  { name: 'Zero Day', desc: 'Vulnerability Research', category: 'exploit', nodes: [
    mkNode('zd1','step','Attack Surface','Map the application attack surface. Start [[Fuzzing]].',0,0),
    mkNode('zd2','tool','Fuzzing','Fuzz input parameters. Crashes lead to [[Root Cause]].',300,0),
    mkNode('zd3','step','Root Cause','Analyze crash dump. Develop [[Exploit PoC]].',600,0),
    mkNode('zd4','tool','Exploit PoC','Build proof-of-concept exploit. Write [[Advisory]].',300,200),
    mkNode('zd5','output','Advisory','Responsible disclosure report.',600,200),
  ], links: [mkLink('zd1','zd2'),mkLink('zd2','zd3'),mkLink('zd3','zd4'),mkLink('zd4','zd5')],
    clues: [mkClue('source-code','zd2','View source for buffer size hint','MAX_BUF=256'),mkClue('data-attribute','zd3','data-vuln-class attribute','heap-overflow'),mkClue('css-comment','zd5','CSS comment has CVE','/* CVE-2026-31337 */')]},
  { name: 'Red Herring', desc: 'Counter-Intelligence', category: 'defense', nodes: [
    mkNode('rh1','step','Threat Detection','Anomaly detected. Is it real or a [[Decoy Analysis]]?',0,0),
    mkNode('rh2','decision','Decoy Analysis','Determine if this is misdirection. Report in [[CI Brief]].',300,0),
    mkNode('rh3','output','CI Brief','Counter-intelligence assessment.',600,0),
  ], links: [mkLink('rh1','rh2'),mkLink('rh2','rh3')],
    clues: [mkClue('meta-tag','rh1','Meta tag reveals true origin','origin: counterintel-unit-9'),mkClue('hex-encoded','rh3','Hex string in report','5265642048657272696e67')]},
  { name: 'First Contact', desc: 'Beginner Tutorial', category: 'recon', nodes: [
    mkNode('fc1','step','Welcome','Welcome to your first investigation! Start by reading [[Gather Clues]].',0,0),
    mkNode('fc2','step','Gather Clues','Look around the page for hidden information. Then [[Write Report]].',300,0),
    mkNode('fc3','output','Write Report','Summarize what you found. Congratulations!',600,0),
  ], links: [mkLink('fc1','fc2'),mkLink('fc2','fc3')],
    clues: [mkClue('source-code','fc2','Right-click and View Source to find the flag','FLAG{welcome_agent}')]},
];
