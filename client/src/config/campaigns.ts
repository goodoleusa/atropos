/**
 * CAMPAIGN SYSTEM - Switch game themes/messages on the fly
 * =========================================================
 * 
 * Each campaign defines a complete set of messages, themes, and content.
 * To switch campaigns: change ACTIVE_CAMPAIGN below.
 * To add a campaign: add a new entry to CAMPAIGNS object.
 */

// ============================================
// ACTIVE CAMPAIGN - Change this to switch themes
// ============================================
export const ACTIVE_CAMPAIGN = 'default';
// Options: 'default', 'halloween', 'ctf_event', 'training'

// ============================================
// CAMPAIGN DEFINITIONS
// ============================================
export const CAMPAIGNS = {
  
  // DEFAULT CAMPAIGN - Standard SysAdmin Corp theme
  default: {
    id: 'default',
    name: 'SysAdmin Corp - Standard',
    description: 'The main corporate infiltration experience',
    
    // Terminal messages
    terminal: {
      welcomeMessage: 'Connection established via encrypted tunnel.',
      helpPrompt: 'Type "help" for available commands. Type "modules" for CTF tools.',
      commandNotFound: (cmd: string) => `Command not found: ${cmd}`,
      connectionStatus: 'CONNECTION: UNSTABLE',
    },
    
    // Toast notifications
    toasts: {
      clueAcquired: { title: 'DATA FRAGMENT ACQUIRED', description: (name: string) => `Archived: ${name}` },
      accessDenied: { title: 'ACCESS DENIED', description: 'Nice try, script kiddie. This incident has been reported.' },
      secretFound: { title: 'HIDDEN PATH DETECTED', description: (loc: string) => `New route unlocked: ${loc}` },
    },
    
    // Chaos overlay messages
    chaosMessages: [
      'COPPER OXIDIZES',
      'THE MESH IS LEAKING', 
      'SILENCE IS GOLDEN',
      '0x5F3759DF',
      'LOOK CLOSER',
    ],
    
    // Mystical hints
    mysticalHints: {
      enabled: true,
      tarotEnabled: true,
      zodiacEnabled: true,
    },
    
    // UI text
    ui: {
      companyName: 'SYSADMIN CORP',
      tagline: 'INFRASTRUCTURE. STABILITY. CONTROL.',
      footerQuote: '"The metal remembers what the code forgets."',
    },
  },
  
  // HALLOWEEN CAMPAIGN
  halloween: {
    id: 'halloween',
    name: 'SysAdmin Corp - Halloween Event',
    description: 'Spooky corporate horror theme',
    
    terminal: {
      welcomeMessage: 'Connection established through the veil...',
      helpPrompt: 'Type "help" to see what lurks. Type "summon" for dark tools.',
      commandNotFound: (cmd: string) => `The void swallows your command: ${cmd}`,
      connectionStatus: 'CONNECTION: CURSED',
    },
    
    toasts: {
      clueAcquired: { title: 'SOUL FRAGMENT CAPTURED', description: (name: string) => `Bound to you: ${name}` },
      accessDenied: { title: 'THE GATE IS SEALED', description: 'Your offering was insufficient.' },
      secretFound: { title: 'PORTAL OPENED', description: (loc: string) => `The path to ${loc} reveals itself` },
    },
    
    chaosMessages: [
      'THEY WATCH FROM THE WIRES',
      'THE CODE BLEEDS',
      'DO NOT LOOK BEHIND YOU',
      'HELLO FROM INSIDE',
      'WE ARE THE SYSTEM',
    ],
    
    mysticalHints: {
      enabled: true,
      tarotEnabled: true,
      zodiacEnabled: false,
    },
    
    ui: {
      companyName: 'SYSADMIN CRYPT',
      tagline: 'FEAR. CONTROL. OBEY.',
      footerQuote: '"The server farm has eyes."',
    },
  },
  
  // CTF EVENT CAMPAIGN
  ctf_event: {
    id: 'ctf_event',
    name: 'SysAdmin Corp CTF Competition',
    description: 'Competitive capture-the-flag event',
    
    terminal: {
      welcomeMessage: 'CTF Environment initialized. Good luck, operator.',
      helpPrompt: 'Type "help" for commands. Type "flags" to view progress.',
      commandNotFound: (cmd: string) => `Invalid command: ${cmd} - Try again.`,
      connectionStatus: 'CTF MODE: ACTIVE',
    },
    
    toasts: {
      clueAcquired: { title: 'FLAG CAPTURED!', description: (name: string) => `+100 points: ${name}` },
      accessDenied: { title: 'INCORRECT', description: 'Flag format: FLAG{...}' },
      secretFound: { title: 'CHALLENGE UNLOCKED', description: (loc: string) => `New challenge available: ${loc}` },
    },
    
    chaosMessages: [
      'TIME IS RUNNING OUT',
      'SCOREBOARD UPDATED',
      'NEW HINT AVAILABLE',
      'FIRST BLOOD',
      'CHECK YOUR SHELL',
    ],
    
    mysticalHints: {
      enabled: false,
      tarotEnabled: false,
      zodiacEnabled: false,
    },
    
    ui: {
      companyName: 'SYSADMIN CTF',
      tagline: 'HACK. CAPTURE. WIN.',
      footerQuote: '"May the best hacker win."',
    },
  },
  
  // TRAINING CAMPAIGN
  training: {
    id: 'training',
    name: 'SysAdmin Corp - Training Mode',
    description: 'Educational/onboarding experience',
    
    terminal: {
      welcomeMessage: 'Training simulation active. Mistakes are expected.',
      helpPrompt: 'Type "tutorial" to begin, or "help" for all commands.',
      commandNotFound: (cmd: string) => `Unknown command: ${cmd}. Hint: Try "help" to see available commands.`,
      connectionStatus: 'TRAINING MODE',
    },
    
    toasts: {
      clueAcquired: { title: 'LESSON LEARNED', description: (name: string) => `Progress saved: ${name}` },
      accessDenied: { title: 'NOT YET', description: 'Complete the prerequisites first.' },
      secretFound: { title: 'BONUS CONTENT', description: (loc: string) => `Optional area unlocked: ${loc}` },
    },
    
    chaosMessages: [
      'TRY NMAP NEXT',
      'REMEMBER TO ENUMERATE',
      'CHECK ROBOTS.TXT',
      'READ THE SOURCE',
      'PERSISTENCE PAYS OFF',
    ],
    
    mysticalHints: {
      enabled: true,
      tarotEnabled: true,
      zodiacEnabled: true,
    },
    
    ui: {
      companyName: 'SYSADMIN ACADEMY',
      tagline: 'LEARN. PRACTICE. MASTER.',
      footerQuote: '"Every expert was once a beginner."',
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the currently active campaign config
 */
export function getActiveCampaign() {
  return CAMPAIGNS[ACTIVE_CAMPAIGN as keyof typeof CAMPAIGNS] || CAMPAIGNS.default;
}

/**
 * Get specific message from active campaign
 */
export function getCampaignMessage(category: string, key: string) {
  const campaign = getActiveCampaign();
  const categoryData = campaign[category as keyof typeof campaign];
  if (categoryData && typeof categoryData === 'object') {
    return (categoryData as Record<string, any>)[key];
  }
  return null;
}

/**
 * List all available campaigns
 */
export function listCampaigns() {
  return Object.entries(CAMPAIGNS).map(([id, config]) => ({
    id,
    name: config.name,
    description: config.description,
  }));
}
