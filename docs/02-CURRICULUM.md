# Atropos Security Training Curriculum
## Experiential, Student-Led Learning Framework

> **Mission Critical Philosophy**: In cybersecurity, hands-on experience far outweighs traditional degrees. This curriculum emphasizes learning by doing, student-driven investigation, and real-world scenario mastery.

## Core Pedagogical Principles

### 1. **Experiential Learning First**
- **80% Hands-On**: Students spend 80% of time actively investigating, not passively reading
- **Real Scenarios**: Use actual threat intelligence, live feeds, and realistic targets
- **Fail Fast, Learn Faster**: Mistakes are teaching moments, not failures
- **No Prerequisites**: Jump in and learn what you need as you encounter it

### 2. **Student-Led Discovery**
- **Self-Paced Exploration**: No rigid timelines, learn at your own speed
- **Choose Your Path**: Select learning goals and specializations that interest you
- **Adaptive Difficulty**: System adjusts to your skill level dynamically
- **Peer Learning**: Share discoveries, collaborate on investigations

### 3. **Mission-Critical Skills**
- **Industry-Relevant**: Focus on skills that employers actually need
- **Tool Mastery**: Learn the same tools professionals use daily
- **Portfolio Building**: Every investigation adds to your documented expertise
- **Continuous Updates**: Curriculum reflects current threat landscape

### 4. **No Degree Required**
- **Skills Over Credentials**: Demonstrate competence through completed investigations
- **Alternative Assessment**: Portfolio reviews, not exams
- **Industry Recognition**: Achievements tied to real-world tasks
- **Experience Certificates**: Document your investigation portfolio

---

## Learning Style Adaptations

Atropos adapts to **five learning styles**, ensuring every student can learn effectively:

### 🔧 Experiential Learner
**Teaching Approach:**
- Start with hands-on lab immediately
- Minimal theory upfront - explain as you encounter it
- "Try this" prompts with immediate feedback
- Build skills through repetition and variation

**Example Campaign Flow:**
1. Launch investigation with starter target
2. Discover tools organically as needed
3. Hit obstacles → Get just-in-time guidance
4. Complete → Reflect on what was learned

### 📊 Visual Learner
**Teaching Approach:**
- Network diagrams, attack flow charts, relationship maps
- ASCII art terminal visualizations
- Timeline graphics for temporal analysis
- Before/after comparison visuals

**Example Campaign Flow:**
1. Show visual representation of target infrastructure
2. Map discovered assets on relationship graph
3. Visualize attack path possibilities
4. Generate investigation flowchart summary

### 🔬 Analytical Learner
**Teaching Approach:**
- Deep technical documentation references
- RFCs, whitepapers, CVE databases
- "Why" explanations for every technique
- Framework theory (MITRE ATT&CK, Cyber Kill Chain)

**Example Campaign Flow:**
1. Present investigation framework and methodology
2. Reference theoretical foundations
3. Explain technical rationale for each tool
4. Link findings to security frameworks

### 👥 Social Learner
**Teaching Approach:**
- Reference community resources and forums
- CTF writeups and collaborative approaches
- Discussion prompts and peer learning
- Real-world case studies from security community

**Example Campaign Flow:**
1. Show similar investigations from community
2. Prompt discussion questions
3. Suggest collaboration opportunities
4. Link to security blogs and forums

### ⚡ Pragmatic Learner
**Teaching Approach:**
- Cut to the chase - no fluff
- Automation scripts and shortcuts
- Quick wins and immediate results
- Efficient workflows and tool chaining

**Example Campaign Flow:**
1. Here's the target, here are the commands
2. Run these tools in this order
3. Parse output with these scripts
4. Report generated - done

---

## Curriculum Structure

### Phase 1: Foundation (Beginner)
**Goal**: Build confidence through successful small investigations

#### Module 1.1: OSINT Fundamentals
- **Duration**: Self-paced (typically 10-15 hours)
- **Approach**: Guided investigation with guardrails
- **Skills**: Passive reconnaissance, search techniques, data aggregation
- **Tools**: Google dorking, WHOIS, DNS enumeration, Shodan basics
- **Deliverable**: Complete target profile (organization/person)
- **Assessment**: Can you find hidden subdomains, employee emails, and tech stack?

#### Module 1.2: Geolocation Intelligence
- **Duration**: Self-paced (8-12 hours)
- **Approach**: Visual, map-based learning
- **Skills**: Photo analysis, coordinate systems, shadow analysis, landmark identification
- **Tools**: Google Earth Pro, SunCalc, Overpass Turbo, satellite imagery
- **Deliverable**: Geolocate 5 real-world images from CTFs
- **Assessment**: Can you pinpoint locations from minimal visual clues?

#### Module 1.3: Social Media Intelligence (SOCMINT)
- **Duration**: Self-paced (12-18 hours)
- **Approach**: Real profile investigations (ethically)
- **Skills**: Profile correlation, relationship mapping, timeline analysis, alias discovery
- **Tools**: Sherlock, Maltego, social scrapers, OSINT Framework
- **Deliverable**: Social network map of test target
- **Assessment**: Can you find connected accounts and establish identity?

### Phase 2: Specialization (Intermediate)
**Goal**: Deep dive into chosen specialization tracks

#### Track A: Financial Crime Investigation
**For students interested in**: Fraud detection, money laundering, corporate intelligence

**Modules:**
- **2A.1**: Corporate Structure Investigation
  - Shell companies, beneficial ownership, offshore jurisdictions
  - Tools: OpenCorporates, ICIJ Database, Companies House
  - Project: Trace ownership through complex corporate structure

- **2A.2**: Cryptocurrency & Blockchain Analysis
  - Wallet clustering, transaction tracing, mixer analysis
  - Tools: Chainalysis Reactor (demo), Etherscan, GraphSense
  - Project: Trace ransomware payment through blockchain

- **2A.3**: Sanctions & Compliance Investigation
  - OFAC SDN lists, trade compliance, embargo enforcement
  - Tools: OFAC screening, World-Check, Refinitiv
  - Project: Screen entity for sanctions exposure

#### Track B: Nation-State Threat Intelligence
**For students interested in**: APT tracking, geopolitical analysis, strategic intelligence

**Modules:**
- **2B.1**: APT Group Profiling
  - Attribution techniques, TTPs, campaign tracking
  - Tools: MITRE ATT&CK, ThreatConnect, Mandiant Intel
  - Project: Build APT group profile from indicators

- **2B.2**: Infrastructure Tracking
  - C2 servers, malware distribution networks, phishing infrastructure
  - Tools: Shodan, PassiveTotal, RiskIQ, VirusTotal
  - Project: Map adversary infrastructure over time

- **2B.3**: Strategic Threat Assessment
  - Geopolitical context, targeting patterns, capability analysis
  - Tools: Open-source news, diplomatic cables, security advisories
  - Project: Produce strategic threat assessment report

#### Track C: Dark Web Intelligence
**For students interested in**: Underground forums, stolen data, cybercrime markets

**Modules:**
- **2C.1**: Dark Web Navigation
  - Tor architecture, onion services, operational security
  - Tools: Tor Browser, Tails OS, Ahmia, DarkSearch
  - Project: Map dark web marketplace ecosystem

- **2C.2**: Stolen Data Monitoring
  - Breach databases, credential stuffing, combo lists
  - Tools: Have I Been Pwned, Dehashed, Intelligence X
  - Project: Monitor organization exposure in breaches

- **2C.3**: Cybercrime Marketplace Analysis
  - Vendor tracking, product analysis, escrow systems
  - Tools: Archive crawling, automated monitoring, OSINT
  - Project: Threat actor profile from forum activity

### Phase 3: Advanced Operations (Advanced)
**Goal**: Conduct complex, multi-source investigations independently

#### Module 3.1: Multi-INT Fusion
- Combine OSINT, GEOINT, SOCMINT, FININT into unified investigations
- Real-world case studies: Bellingcat investigations, Citizen Lab reports
- Project: Complete investigation requiring 3+ intelligence disciplines

#### Module 3.2: Automated Collection Workflows
- Build scrapers, monitors, and alerting systems
- Python scripting for OSINT automation
- Tools: BeautifulSoup, Selenium, API integration
- Project: Custom OSINT collection platform

#### Module 3.3: Report Writing & Intelligence Products
- Professional reporting standards
- Executive summaries, technical annexes, visual presentations
- Peer review and feedback cycles
- Project: Publication-ready threat intelligence report

### Phase 4: Expert Specialization (Expert)
**Goal**: Contribute to the security community, conduct original research

#### Module 4.1: Novel Technique Development
- Develop new OSINT methodologies
- Tool creation and open-source contribution
- Conference presentation preparation

#### Module 4.2: Threat Actor Attribution
- Advanced infrastructure correlation
- Linguistic analysis, operational patterns
- High-confidence attribution frameworks

#### Module 4.3: Teaching & Mentoring
- Mentor newer students
- Create campaign modules for others
- Contribute to curriculum development

---

## Campaign Design Integration

Every investigation campaign incorporates:

### Learning Objective Mapping
Each campaign explicitly states:
- **Primary Skills**: Core competencies being developed
- **Learning Goals**: Mapped to curriculum goals (e.g., `geolocation_osint`, `crypto_blockchain_investigation`)
- **Difficulty Level**: Beginner → Expert progression
- **Prerequisites**: What you should know first (optional, not blocking)
- **Estimated Time**: Self-paced guideline

### Adaptive Teaching
Campaigns adjust based on:
- **Learning Style**: Prompts and guidance adapt to your preferred learning mode
- **Skill Level**: Hints and difficulty scale to your experience
- **Pace Preference**: Fast/Moderate/Thorough modes available
- **Previous Performance**: System learns what works for you

### Real-World Context
Every campaign includes:
- **Threat Context**: Why does this matter? Real incidents.
- **Industry Application**: Where is this skill used professionally?
- **Tool Ecosystem**: Which tools do professionals use for this?
- **Career Paths**: What roles need this skill?

### Assessment Without Exams
Progress measured by:
- **Investigation Completion**: Did you find the intelligence?
- **Methodology Soundness**: Did you use appropriate techniques?
- **Documentation Quality**: Can you explain your process?
- **Tool Proficiency**: Do you understand tool outputs?

---

## Skill Progression Framework

### Beginner (Level 1-5)
**Characteristics:**
- Learning tool basics
- Guided investigations with hints
- Single-source intelligence (one tool at a time)
- Structured campaigns with clear objectives

**Unlock Criteria:**
- Complete 5 beginner campaigns
- Demonstrate proficiency in 3 core tools
- Document 1 complete investigation

### Intermediate (Level 6-15)
**Characteristics:**
- Multi-tool workflows
- Less guidance, more autonomy
- Introduction to scripting/automation
- Complex, multi-step investigations

**Unlock Criteria:**
- Complete 10 intermediate campaigns
- Develop custom tool/script
- Complete cross-discipline investigation

### Advanced (Level 16-30)
**Characteristics:**
- Self-directed investigations
- Novel technique application
- Peer mentoring capability
- Professional-grade reporting

**Unlock Criteria:**
- Complete 15 advanced campaigns
- Publish 1 investigation report
- Contribute 1 campaign to community

### Expert (Level 31+)
**Characteristics:**
- Original research
- Community contribution
- Technique innovation
- Teaching others

**Unlock Criteria:**
- 25+ campaigns across multiple disciplines
- Published research or tool
- Proven expertise through peer review

---

## Learning Path Recommendations

### For Aspiring Threat Intelligence Analysts:
1. OSINT Fundamentals → Nation-State Threat Intel → Dark Web Intelligence
2. Focus on analytical learning style
3. Emphasize report writing and strategic assessment
4. Tools: MITRE ATT&CK, ThreatConnect, Maltego

### For Financial Investigators / Fraud Analysts:
1. OSINT Fundamentals → Financial Investigation → Crypto/Blockchain Investigation
2. Focus on pragmatic learning style
3. Emphasize compliance and regulatory frameworks
4. Tools: OpenCorporates, Chainalysis, ICIJ Database

### For OSINT Specialists / Private Investigators:
1. OSINT Fundamentals → SOCMINT → Geolocation Intelligence → Dark Web
2. Focus on experiential learning style
3. Emphasize multi-source correlation
4. Tools: Maltego, Google Earth, Sherlock, Tor

### For Security Researchers / Bug Hunters:
1. OSINT Fundamentals → Network Security → Penetration Testing → Vulnerability Research
2. Focus on analytical learning style
3. Emphasize automation and tool development
4. Tools: nmap, Burp Suite, Nuclei, custom scripts

---

## Assessment & Certification

### Portfolio-Based Assessment
Students build an **Investigation Portfolio** containing:
- Completed investigations with full documentation
- Tool proficiency demonstrations
- Custom scripts or automation workflows
- Published reports or write-ups

### Skill Verification
Rather than exams, students demonstrate:
- **Live Investigations**: Complete a timed investigation
- **Tool Challenges**: Use specific tools to solve problems
- **Peer Review**: Other students verify methodology
- **Industry Review**: Optional professional assessment

### Achievement System
Micro-credentials for specific skills:
- 🏆 **"Subdomain Hunter"**: Found 100+ subdomains across investigations
- 🏆 **"Blockchain Tracer"**: Successfully traced 10+ cryptocurrency transactions
- 🏆 **"Geolocator"**: Precisely located 25+ images
- 🏆 **"APT Tracker"**: Profiled 5+ nation-state threat actors
- 🏆 **"Dark Web Navigator"**: Documented 10+ underground market activities

### Experience Certificates
Upon completion of learning tracks:
- **OSINT Investigator Certificate**: Foundation + 3 specialization tracks
- **Financial Crime Analyst Certificate**: Financial investigation track completion
- **Threat Intelligence Analyst Certificate**: Nation-state + dark web tracks
- **Master Investigator Certificate**: All tracks + expert-level contributions

---

## Teaching Resources for Instructors

### Running Atropos in Educational Settings

#### For University Courses:
- Integrate as lab component of cybersecurity courses
- Students progress through curriculum at their own pace
- Track progress via admin dashboard
- Export investigation portfolios for grading

#### For Training Programs:
- Bootcamp-style intensive tracks
- Cohort-based learning with shared campaigns
- Instructor-led demonstrations with student practice
- Certification preparation

#### For Self-Study:
- Complete autonomy over pace and path
- Community forum for peer support
- Weekly challenges for motivation
- Optional mentor matching

### Campaign Creation Guidelines for Educators

When creating custom campaigns:
1. **Define Learning Objectives**: What should students be able to do after?
2. **Map to Skills**: Which tools and techniques are practiced?
3. **Set Difficulty**: Beginner/Intermediate/Advanced/Expert
4. **Choose Learning Style Adaptations**: How does guidance change per style?
5. **Provide Real Context**: Why does this matter professionally?
6. **Build Scaffolding**: Hints, resources, fallback guidance
7. **Design Success Criteria**: What indicates mastery?

---

## Continuous Improvement

This curriculum is **living and evolving**:
- **Student Feedback**: Campaigns refined based on completion data
- **Industry Input**: Skills updated to match job market demands
- **Threat Landscape**: New campaigns for emerging threats
- **Community Contributions**: Students become curriculum developers

**Last Updated**: 2026-02-06  
**Version**: 2.0  
**Contributors**: Atropos Platform Team + Security Community
