import type { Campaign } from './agentCampaigns';

export const CIVIC_CAMPAIGNS: Campaign[] = [
  {
    id: 'serbia_otpor',
    name: 'Serbia: Otpor! and the Fall of Milosevic',
    icon: '',
    description: 'Study how a youth-led movement used humor, unity, and creative resistance to topple an authoritarian regime in 2000.',
    difficulty: 'intermediate',
    estimatedTime: '45-60 min',
    tags: ['Civic Engagement', 'Nonviolent Resistance', 'Serbia', 'Otpor', 'Grassroots'],
    color: 'red',
    targetFields: [
      { key: 'movement_name', label: 'Movement to Study', type: 'text', required: false, placeholder: 'Otpor!' },
      { key: 'focus_area', label: 'Focus Area', type: 'text', required: false, placeholder: 'Use of humor in resistance' }
    ],
    dummyTargets: {
      movement_name: 'Otpor!',
      focus_area: 'Use of humor in resistance'
    },
    starterPrompt: `I want to understand how Otpor! (Resistance) in Serbia succeeded in mobilizing citizens against Slobodan Milosevic in 2000.

Help me explore:
1. The role of humor and satire in delegitimizing the regime
2. How "Gotov je!" (He's finished!) became a unifying slogan
3. The strategy of unity across ethnic and political divides
4. The October 5th revolution and nonviolent transfer of power
5. How lessons from Serbia influenced later movements (Georgia, Ukraine)

What made laughter and unity more powerful than violence in this case?`,
    objectives: [
      'Understand Otpor! organizational structure and tactics',
      'Analyze humor as a delegitimization strategy',
      'Map the role of unity in overcoming ethnic divisions',
      'Connect Serbia 2000 to later color revolutions'
    ],
    tools: ['Historical archives', 'Documentary analysis', 'Academic sources', 'Primary witness accounts'],
    learningObjectives: [
      { goal: 'grassroots_organizing', weight: 10, description: 'Youth-led movement building and horizontal structure' },
      { goal: 'civic_engagement', weight: 9, description: 'Mobilizing citizens for electoral and regime change' },
      { goal: 'movement_history', weight: 10, description: 'Case study of successful nonviolent regime change' }
    ],
    skillsRequired: ['Basic historical research', 'Understanding of authoritarian regimes'],
    skillsTaught: ['Nonviolent resistance tactics', 'Humor in political mobilization', 'Coalition building', 'Strategic messaging'],
    learningOutcomes: [
      'Explain Otpor! tactics and why they worked',
      'Analyze humor as a weapon against authoritarianism',
      'Understand unity-building across divides',
      'Apply lessons to contemporary civic movements'
    ],
    industryContext: 'Activists, organizers, and democracy advocates study Otpor! as a model of youth-led nonviolent revolution. Its playbook influenced movements globally.',
    realWorldExamples: [
      'Otpor! founding and early actions (1998-1999)',
      'Gotov je! campaign and referendum (2000)',
      'October 5th revolution and fall of Milosevic',
      'CANVAS training model exported globally'
    ],
    careerPaths: ['Community Organizer', 'Democracy Advocate', 'NGO Program Director', 'Strategic Communications'],
    teachingAdaptations: {
      experiential: 'Role-play an Otpor! action: design a satirical poster, plan a flash mob, craft a slogan that unites. Learn by doing the creative work organizers did.',
      visual: 'Create a timeline of Otpor! actions. Map coalition partners. Diagram the "Gotov je!" message flow. Visualize how humor spread.',
      analytical: 'Study Gene Sharp\'s theory of nonviolent action. Read CANVAS manuals. Compare Otpor! to other color revolutions. Deep theoretical grounding.',
      social: 'Discuss with peers: When does humor work? When does it backfire? Study Otpor! alumni networks and how knowledge spread to Georgia, Ukraine.',
      pragmatic: 'Five-step Otpor! playbook: 1) Identify regime weakness, 2) Use humor to expose it, 3) Build broad coalition, 4) Create simple unifying message, 5) Mobilize for decisive moment.'
    }
  },
  {
    id: 'euromaidan',
    name: 'Euromaidan: Ukraine 2013-2014',
    icon: '',
    description: 'Examine the grassroots mobilization in Kyiv that combined European aspirations, unity, and creative resistance against Yanukovych.',
    difficulty: 'intermediate',
    estimatedTime: '45-60 min',
    tags: ['Civic Engagement', 'Ukraine', 'Euromaidan', 'Grassroots', 'European Integration'],
    color: 'blue',
    targetFields: [
      { key: 'phase', label: 'Phase of Movement', type: 'text', required: false, placeholder: 'Initial mobilization' },
      { key: 'focus', label: 'Focus', type: 'text', required: false, placeholder: 'Self-organization structures' }
    ],
    dummyTargets: {
      phase: 'Maidan encampment',
      focus: 'Self-organization and mutual aid'
    },
    starterPrompt: `I'm studying the Euromaidan movement in Ukraine (November 2013 - February 2014).

Help me understand:
1. How the initial EU Association Agreement protest evolved into a broader civic mobilization
2. The role of self-organization: kitchens, barricades, medical tents, information hubs
3. Laughter and culture: songs, jokes, solidarity as resistance
4. Unity across regions (Lviv, Donbas voices on Maidan) and generations
5. The shift from "European choice" to "dignity" as the unifying theme

What can contemporary organizers learn from Maidan's structure?`,
    objectives: [
      'Map Euromaidan evolution from trade protest to revolution',
      'Understand self-organization and mutual aid on Maidan',
      'Analyze cultural and symbolic resistance',
      'Study unity-building across linguistic and regional lines'
    ],
    tools: ['Primary sources', 'Documentary footage', 'Academic analysis', 'Witness testimonies'],
    learningObjectives: [
      { goal: 'grassroots_organizing', weight: 10, description: 'Protest camp self-organization and horizontal coordination' },
      { goal: 'civic_engagement', weight: 9, description: 'Mobilizing diverse population for collective action' },
      { goal: 'movement_history', weight: 9, description: 'Case study of mass mobilization under authoritarian pressure' }
    ],
    skillsRequired: ['Basic political science', 'Understanding of Eastern Europe context'],
    skillsTaught: ['Protest camp logistics', 'Consensus-building', 'Symbolic resistance', 'Cross-regional coalition building'],
    learningOutcomes: [
      'Explain Euromaidan phases and turning points',
      'Design self-organized structures for sustained protest',
      'Use culture and solidarity as resistance tools',
      'Build unity across identity divides'
    ],
    industryContext: 'Organizers study Euromaidan for lessons on sustaining mass mobilization, self-organization, and maintaining nonviolent discipline under provocation.',
    realWorldExamples: [
      'November 21 crackdown and overnight mobilization',
      'Maidan encampment self-organization',
      'Hromadske TV and citizen journalism',
      'February 18-20 and Yanukovych flight'
    ],
    careerPaths: ['Community Organizer', 'Human Rights Advocate', 'Crisis Response Coordinator', 'International Solidarity Worker'],
    teachingAdaptations: {
      experiential: 'Simulate a protest camp: assign roles (kitchen, medical, media, barricades). Coordinate without hierarchy. Debrief: What worked? What broke down?',
      visual: 'Map Maidan geography: where were kitchens, stages, barricades? Timeline of key events. Diagram decision-making structures.',
      analytical: 'Read social movement theory. Compare Euromaidan to Occupy, Tahrir. Study pre-Maidan civil society buildup in Ukraine.',
      social: 'Find Maidan participant accounts. Discuss: How did people from different regions find common ground? What role did humor play?',
      pragmatic: 'Maidan playbook: 1) Space occupation with clear exit strategy, 2) Self-organized logistics (food, medical, media), 3) Symbolic unity (flags, songs), 4) De-escalation when possible, 5) Demand clarity.'
    }
  },
  {
    id: 'hong_kong_resistance',
    name: 'Hong Kong: Creative Resistance and the Umbrella Movement',
    icon: '',
    description: 'Explore Hong Kong\'s tradition of creative, humorous resistance—from the Umbrella Movement to the 2019 protests—and lessons in unity under pressure.',
    difficulty: 'advanced',
    estimatedTime: '45-60 min',
    tags: ['Civic Engagement', 'Hong Kong', 'Umbrella Movement', 'Creative Resistance', 'Digital Citizenship'],
    color: 'yellow',
    targetFields: [
      { key: 'movement', label: 'Movement or Moment', type: 'text', required: false, placeholder: '2019 protests' },
      { key: 'tactic', label: 'Tactic to Study', type: 'text', required: false, placeholder: 'Lennon walls' }
    ],
    dummyTargets: {
      movement: '2019 Anti-ELAB protests',
      tactic: 'Human chains and creative symbolism'
    },
    starterPrompt: `I'm researching Hong Kong's tradition of creative and humorous civic resistance.

Focus areas:
1. Umbrella Movement (2014): Occupation tactics, symbolism, international visibility
2. 2019 Anti-ELAB protests: Lennon walls, human chains, "Be Water" philosophy
3. Use of humor: memes, parodies, ridicule of authority
4. Unity across age groups, professions, and political spectrums
5. Digital tools: Telegram, LIHKG, real-time coordination
6. Lessons: What worked? What are the limits under escalating pressure?

How did Hong Kongers use creativity and unity when traditional protest was increasingly restricted?`,
    objectives: [
      'Map Hong Kong protest tactics evolution (2014-2019)',
      'Understand creative and symbolic resistance',
      'Analyze "Be Water" philosophy and decentralized action',
      'Study digital citizenship under surveillance'
    ],
    tools: ['Primary sources', 'Social media archives', 'Documentary analysis', 'Academic research'],
    learningObjectives: [
      { goal: 'digital_citizenship', weight: 10, description: 'Digital coordination, safety, and communication under pressure' },
      { goal: 'grassroots_organizing', weight: 8, description: 'Decentralized, leaderless resistance structures' },
      { goal: 'civic_engagement', weight: 9, description: 'Creative tactics when traditional protest is restricted' },
      { goal: 'movement_history', weight: 8, description: 'Hong Kong as case study of innovative resistance' }
    ],
    skillsRequired: ['Understanding of Hong Kong context', 'Basic digital security awareness'],
    skillsTaught: ['Creative resistance tactics', 'Decentralized coordination', 'Symbolic protest', 'Digital safety for activists'],
    learningOutcomes: [
      'Explain Hong Kong protest evolution and tactics',
      'Design creative resistance when space is restricted',
      'Apply "Be Water" principles to organizing',
      'Balance visibility with safety'
    ],
    industryContext: 'Scholars and organizers study Hong Kong for innovation in creative resistance, decentralized organizing, and digital citizenship under authoritarian pressure.',
    realWorldExamples: [
      'Umbrella Movement occupation (2014)',
      'Lennon walls and sticker art',
      '2019 human chains and mass rallies',
      '"Be Water" and tactical flexibility'
    ],
    careerPaths: ['Digital Rights Advocate', 'Creative Activist', 'Community Organizer', 'Human Rights Researcher'],
    teachingAdaptations: {
      experiential: 'Create a Lennon wall (virtual or physical): sticky notes with messages of solidarity. Plan a "Be Water" action: how would you disperse and regroup?',
      visual: 'Map Hong Kong protest geography. Timeline of 2014 vs 2019. Diagram decentralized coordination structures. Compare tactics.',
      analytical: 'Study Hong Kong Basic Law, one country two systems. Read on creative resistance theory. Compare to other movements under similar pressures.',
      social: 'Find Hong Konger voices and accounts. Discuss: What sustained people? What were the costs? How did humor help or sometimes backfire?',
      pragmatic: 'Hong Kong tactics toolkit: 1) Lennon walls for expression when speech is restricted, 2) Telegram/LIHKG for coordination, 3) "Be Water" for tactical flexibility, 4) Humor to sustain morale, 5) International visibility strategy.'
    }
  },
  {
    id: 'digital_citizenship',
    name: 'Digital Citizenship Fundamentals',
    icon: '',
    description: 'Build skills for informed, ethical, and effective participation in digital civic life—from fact-checking to safe communication.',
    difficulty: 'beginner',
    estimatedTime: '30-45 min',
    tags: ['Digital Citizenship', 'Media Literacy', 'Civic Engagement', 'Information Integrity'],
    color: 'teal',
    targetFields: [
      { key: 'topic', label: 'Topic or Skill', type: 'text', required: false, placeholder: 'Fact-checking' },
      { key: 'context', label: 'Context', type: 'text', required: false, placeholder: 'Election information' }
    ],
    dummyTargets: {
      topic: 'Verifying viral claims',
      context: 'Local community issues'
    },
    starterPrompt: `I want to strengthen my digital citizenship skills for civic engagement.

Help me learn:
1. Fact-checking: How to verify viral claims, images, and videos
2. Information hygiene: Recognizing manipulation, avoiding amplification of misinformation
3. Safe communication: When and how to use encrypted tools for organizing
4. Ethical sharing: Spreading reliable information, not panic or falsehoods
5. Building trust: How communities develop shared standards for information

Where should I start as someone new to intentional digital citizenship?`,
    objectives: [
      'Apply fact-checking techniques to viral content',
      'Identify common misinformation patterns',
      'Understand when encryption and operational security matter',
      'Practice ethical information sharing'
    ],
    tools: ['Reverse image search', 'Fact-check sites', 'Signal/encrypted messaging', 'Cross-referencing sources'],
    learningObjectives: [
      { goal: 'digital_citizenship', weight: 10, description: 'Core skills for responsible digital civic participation' },
      { goal: 'civic_engagement', weight: 7, description: 'How digital skills enable effective civic action' }
    ],
    skillsRequired: ['Basic internet literacy', 'Critical thinking'],
    skillsTaught: ['Fact-checking', 'Reverse image search', 'Source verification', 'Operational security basics', 'Ethical sharing'],
    learningOutcomes: [
      'Verify images and claims before sharing',
      'Recognize manipulation tactics',
      'Choose appropriate tools for different contexts',
      'Contribute to information integrity in your community'
    ],
    industryContext: 'Journalists, educators, and organizers need digital citizenship skills to protect themselves and their communities from misinformation and surveillance.',
    realWorldExamples: [
      'Verification during breaking news events',
      'Debunking deepfakes and AI-generated content',
      'Secure coordination in high-risk contexts',
      'Community fact-checking networks'
    ],
    careerPaths: ['Journalist', 'Educator', 'Community Organizer', 'Information Integrity Specialist'],
    teachingAdaptations: {
      experiential: 'Pick a viral claim from your feed. Verify it step by step. Document your process. Share what you found.',
      visual: 'Create a fact-checking flowchart. Diagram information flow. Map sources and their reliability.',
      analytical: 'Study media literacy frameworks. Learn about cognitive biases and why we share misinformation. Understand information ecosystems.',
      social: 'Join a fact-checking community. Practice collaborative verification. Discuss: How do we decide what to trust?',
      pragmatic: 'Quick verification checklist: 1) Reverse image search, 2) Check date and source, 3) Cross-reference with known outlets, 4) When in doubt, don\'t share.'
    }
  },
  {
    id: 'grassroots_organizing',
    name: 'Grassroots Political Organizing',
    icon: '',
    description: 'Learn the fundamentals of building power from the ground up: one-on-ones, leadership development, and community-driven campaigns.',
    difficulty: 'beginner',
    estimatedTime: '40-50 min',
    tags: ['Grassroots', 'Community Organizing', 'Civic Engagement', 'Leadership'],
    color: 'emerald',
    targetFields: [
      { key: 'issue', label: 'Issue or Campaign', type: 'text', required: false, placeholder: 'Local housing' },
      { key: 'community', label: 'Community', type: 'text', required: false, placeholder: 'Neighborhood association' }
    ],
    dummyTargets: {
      issue: 'Community safety',
      community: 'Apartment building'
    },
    starterPrompt: `I want to learn grassroots organizing to build power in my community.

Help me understand:
1. One-on-one conversations: Why they matter, how to conduct them
2. Leadership development: Finding and cultivating leaders, not followers
3. Issue selection: Picking winnable, meaningful campaigns
4. Building coalitions: Working across groups without losing base
5. Sustaining organization: Beyond single campaigns

I'm new to organizing. What's the first thing I should do?`,
    objectives: [
      'Conduct effective one-on-one relationship-building conversations',
      'Identify and develop community leaders',
      'Select and scope winnable issues',
      'Build and sustain coalitions'
    ],
    tools: ['One-on-one guides', 'Power mapping', 'Campaign planning templates', 'Meeting facilitation'],
    learningObjectives: [
      { goal: 'grassroots_organizing', weight: 10, description: 'Core organizing principles and practices' },
      { goal: 'civic_engagement', weight: 9, description: 'Turning concern into collective action' }
    ],
    skillsRequired: ['Willingness to listen', 'Basic communication skills'],
    skillsTaught: ['Relational organizing', 'Power analysis', 'Issue cutting', 'Coalition building', 'Action planning'],
    learningOutcomes: [
      'Conduct organizing conversations that build relationships',
      'Map power and identify leverage points',
      'Design campaigns with clear demands and timelines',
      'Build durable community organizations'
    ],
    industryContext: 'Community organizers, union organizers, and advocacy groups use these methods to build people power and achieve policy change.',
    realWorldExamples: [
      'Industrial Areas Foundation (IAF) organizing',
      'ACORN community organizing model',
      'DSA chapter building',
      'Local mutual aid network formation'
    ],
    careerPaths: ['Community Organizer', 'Union Organizer', 'Campaign Manager', 'Nonprofit Program Director'],
    teachingAdaptations: {
      experiential: 'Conduct a real one-on-one with someone in your community. Report back: What did you learn? What would you do differently?',
      visual: 'Power map your community. Diagram relationships. Create a campaign timeline. Visualize your theory of change.',
      analytical: 'Read Saul Alinsky, Marshall Ganz. Study organizing traditions. Compare models (IAF, DART, PICO).',
      social: 'Join an organizing training. Practice with peers. Role-play difficult conversations. Get feedback.',
      pragmatic: 'Organizing 101: 1) Listen more than you talk, 2) Find the anger and the hope, 3) Make an ask, 4) Follow up, 5) Repeat.'
    }
  },
  {
    id: 'humor_unity_resistance',
    name: 'Laughter and Unity: Weapons Against Authoritarianism',
    icon: '',
    description: 'Study how humor and unity have historically weakened authoritarian regimes—from ridicule to collective identity—across Serbia, Ukraine, Hong Kong, and beyond.',
    difficulty: 'intermediate',
    estimatedTime: '45-60 min',
    tags: ['Nonviolent Resistance', 'Humor', 'Unity', 'Movement History', 'Comparative'],
    color: 'amber',
    targetFields: [
      { key: 'regime', label: 'Regime or Movement', type: 'text', required: false, placeholder: 'Serbia' },
      { key: 'mechanism', label: 'Mechanism to Study', type: 'text', required: false, placeholder: 'Delegitimization through ridicule' }
    ],
    dummyTargets: {
      regime: 'Comparative analysis',
      mechanism: 'Humor as delegitimization'
    },
    starterPrompt: `I'm researching how laughter and unity have toppled or weakened authoritarian regimes.

Comparative focus:
1. Serbia (Otpor!): "Gotov je!" and ridicule of Milosevic
2. Ukraine (Euromaidan): Songs, jokes, solidarity on the square
3. Hong Kong: Memes, creative ridicule, "Be Water" unity
4. Other examples: Velvet Revolution, Georgia Rose Revolution
5. Why does humor work? (Delegitimization, lowering fear, building solidarity)
6. Why does unity matter? (Regimes depend on divide-and-rule)

What patterns can we identify across successful movements?`,
    objectives: [
      'Compare humor tactics across successful movements',
      'Analyze why ridicule weakens authoritarian legitimacy',
      'Understand unity-building across ethnic, political, generational divides',
      'Identify when humor helps and when it can backfire'
    ],
    tools: ['Comparative case studies', 'Social movement theory', 'Primary sources', 'Documentary evidence'],
    learningObjectives: [
      { goal: 'movement_history', weight: 10, description: 'Comparative study of humor and unity in resistance' },
      { goal: 'grassroots_organizing', weight: 7, description: 'Tactical application of humor and unity-building' },
      { goal: 'civic_engagement', weight: 8, description: 'Mobilizing through shared identity and ridicule of power' }
    ],
    skillsRequired: ['Basic comparative politics', 'Historical research skills'],
    skillsTaught: ['Tactical humor design', 'Unity messaging', 'Delegitimization strategies', 'Comparative movement analysis'],
    learningOutcomes: [
      'Explain why humor works against authoritarianism',
      'Design ridicule tactics for specific contexts',
      'Build unity messages that transcend divides',
      'Apply comparative lessons to new contexts'
    ],
    industryContext: 'CANVAS, ICNC, and democracy organizations train activists globally on nonviolent tactics including strategic use of humor and unity.',
    realWorldExamples: [
      'Otpor! Gotov je! campaign',
      'Euromaidan songs and cultural resistance',
      'Hong Kong Lennon walls and memes',
      'Velvet Revolution and Havel\'s power of the powerless'
    ],
    careerPaths: ['Strategic Communications', 'Democracy Trainer', 'Community Organizer', 'Movement Strategist'],
    teachingAdaptations: {
      experiential: 'Design a satirical campaign against an abstract "authoritarian figure." Test messages. What makes people laugh? What unifies?',
      visual: 'Create a comparative matrix: Serbia vs Ukraine vs Hong Kong. Map humor types, unity mechanisms, outcomes.',
      analytical: 'Study Gene Sharp, Erica Chenoweth. Read on authoritarian legitimation and how humor undermines it. Theory of why unity breaks regime coalitions.',
      social: 'Discuss with peers: Is humor universal or culture-specific? When has humor backfired? Share examples from your context.',
      pragmatic: 'Humor + unity playbook: 1) Identify regime\'s source of legitimacy, 2) Use ridicule to expose absurdity, 3) Create simple unifying slogan/identity, 4) Repeat until regime loses support of key groups, 5) Seize decisive moment.'
    }
  },
  {
    id: 'civic_engagement_basics',
    name: 'Civic Engagement Foundations',
    icon: '',
    description: 'Core skills for participating in democratic life: voting, contacting officials, attending meetings, and building civic habits.',
    difficulty: 'beginner',
    estimatedTime: '25-35 min',
    tags: ['Civic Engagement', 'Democracy', 'Participation', 'Local Government'],
    color: 'purple',
    targetFields: [
      { key: 'level', label: 'Level of Government', type: 'text', required: false, placeholder: 'Local' },
      { key: 'issue', label: 'Issue of Interest', type: 'text', required: false, placeholder: 'School board' }
    ],
    dummyTargets: {
      level: 'Local',
      issue: 'Community engagement'
    },
    starterPrompt: `I want to become more civically engaged but don't know where to start.

Help me with:
1. Understanding levels of government and where decisions get made
2. Practical ways to participate: voting, public comment, meetings
3. Finding and following local issues that affect my community
4. Building habits: small, sustainable civic actions
5. Connecting individual action to collective impact

What's one concrete step I can take this week?`,
    objectives: [
      'Navigate local, state, and federal government structures',
      'Identify meaningful civic participation opportunities',
      'Develop sustainable civic habits',
      'Connect personal action to collective outcomes'
    ],
    tools: ['Government websites', 'Meeting calendars', 'Ballot guides', 'Issue trackers'],
    learningObjectives: [
      { goal: 'civic_engagement', weight: 10, description: 'Foundation for democratic participation' },
      { goal: 'digital_citizenship', weight: 5, description: 'Using digital tools for civic engagement' }
    ],
    skillsRequired: ['None – beginner-friendly'],
    skillsTaught: ['Government structure', 'Finding decision-makers', 'Public comment', 'Voting and ballot literacy', 'Civic habit formation'],
    learningOutcomes: [
      'Identify where key decisions are made in your community',
      'Participate in at least one civic process',
      'Develop a personal civic engagement plan',
      'Understand how small actions add up'
    ],
    industryContext: 'Civic engagement is the foundation of democratic health. Nonprofits, libraries, and schools run programs to boost participation.',
    realWorldExamples: [
      'League of Women Voters ballot guides',
      'Participatory budgeting initiatives',
      'Town hall and school board participation',
      'Get-out-the-vote campaigns'
    ],
    careerPaths: ['Civic Engagement Coordinator', 'Policy Advocate', 'Elected Official', 'Nonprofit Program Manager'],
    teachingAdaptations: {
      experiential: 'Attend one local government meeting (or watch online). Document what you observed. Identify one way you could participate.',
      visual: 'Map your local government structure. Create a civic engagement checklist. Diagram how a policy becomes law in your jurisdiction.',
      analytical: 'Study civic engagement rates and why they vary. Read on democratic theory. Understand representation and accountability.',
      social: 'Find a civic group in your area. Attend a meeting. Discuss with peers: What keeps people from participating?',
      pragmatic: 'Week one civic plan: 1) Register to vote (if not), 2) Find next local meeting, 3) Pick one issue, 4) Make one contact (email/call), 5) Schedule next action.'
    }
  }
];

export const CIVIC_CAMPAIGN_CATEGORIES = [
  { id: 'movements', name: 'Movement History', campaigns: ['serbia_otpor', 'euromaidan', 'hong_kong_resistance', 'humor_unity_resistance'] },
  { id: 'organizing', name: 'Grassroots Organizing', campaigns: ['grassroots_organizing', 'civic_engagement_basics'] },
  { id: 'digital', name: 'Digital Citizenship', campaigns: ['digital_citizenship', 'hong_kong_resistance'] },
];
