/**
 * SYSADMIN CORP - GAME MESSAGES CONFIGURATION
 * ============================================
 * 
 * This file centralizes all system and game messages for easy modification.
 * To disable a message, simply comment it out or set enabled: false.
 * 
 * SECTIONS:
 * - TERMINAL_MESSAGES: Messages shown in the terminal interface
 * - TOAST_MESSAGES: Pop-up notifications
 * - CHAOS_MESSAGES: Subliminal glitch overlay text
 * - MYSTICAL_CARDS: Tarot and zodiac hint cards
 * - UI_TEXT: Static UI labels and descriptions
 */

// ============================================
// TERMINAL MESSAGES
// ============================================
export const TERMINAL_MESSAGES = {
  // Initial welcome messages when terminal loads
  welcome: {
    enabled: true,
    connectionMessage: 'Connection established via encrypted tunnel.',
    helpPrompt: 'Type "help" for available commands. Type "modules" for CTF tools.',
  },
  
  // Error messages
  errors: {
    enabled: true,
    commandNotFound: (cmd: string) => `Command not found: ${cmd}`,
    helpHint: 'Type "help" for available commands or "modules" for CTF tools.',
    permissionDenied: 'Permission denied. Access level insufficient.',
    connectionFailed: 'Connection failed. Target unreachable.',
    authRequired: 'Authentication required. Use: ssh <target>',
  },
  
  // System status messages
  system: {
    enabled: true,
    scanning: 'Scanning...',
    complete: 'Scan complete.',
    connecting: 'Establishing connection...',
    analyzing: 'Analyzing data patterns...',
    decrypting: 'Decrypting payload...',
  },
  
  // Command-specific messages (can be customized per command)
  commands: {
    help: {
      enabled: true,
      header: '╔══════════════════════════════════════════════════════════╗',
      footer: '╚══════════════════════════════════════════════════════════╝',
    },
    clear: {
      enabled: true,
      // No message needed for clear
    },
    whoami: {
      enabled: true,
      guestResponse: 'guest@sysadmin-corp.local',
    },
  },
};

// ============================================
// TOAST NOTIFICATION MESSAGES
// ============================================
export const TOAST_MESSAGES = {
  // Clue collection
  clueAcquired: {
    enabled: true,
    title: 'DATA FRAGMENT ACQUIRED',
    description: (clueName: string) => `Archived: ${clueName}`,
  },
  
  // Quest completion
  questComplete: {
    enabled: true,
    title: 'OBJECTIVE COMPLETE',
    description: (questName: string) => `Achievement unlocked: ${questName}`,
  },
  
  // Admin login attempts (fake portal)
  adminDenied: {
    enabled: true,
    title: 'ACCESS DENIED',
    description: 'Nice try, script kiddie. This incident has been reported.',
  },
  
  adminInvalid: {
    enabled: true,
    title: 'INVALID CREDENTIALS',
    description: 'Authentication server is rejecting your handshake.',
  },
  
  // Session export/import
  sessionExported: {
    enabled: true,
    title: 'SESSION EXPORTED',
    description: 'QR code generated. Scan to restore progress.',
  },
  
  sessionImported: {
    enabled: true,
    title: 'SESSION RESTORED',
    description: 'Progress synchronized from external source.',
  },
  
  // Discovery notifications
  secretFound: {
    enabled: true,
    title: 'HIDDEN PATH DETECTED',
    description: (location: string) => `New route unlocked: ${location}`,
  },
};

// ============================================
// CHAOS OVERLAY MESSAGES (Subliminal)
// ============================================
export const CHAOS_MESSAGES = {
  enabled: true,
  // These appear randomly during glitch effects
  // Comment out any you don't want to show
  subliminal: [
    'COPPER OXIDIZES',
    'THE MESH IS LEAKING',
    'SILENCE IS GOLDEN',
    '0x5F3759DF',
    'LOOK CLOSER',
    // 'THEY ARE WATCHING', // Example: commented out
    // 'TRUST NO ONE',
  ],
  
  // Connection unstable dialog
  connectionDialog: {
    enabled: true,
    title: 'Connection Unstable',
    description: 'Quantum fluctuations detected in the data stream.',
    buttonText: 'STABILIZE',
  },
};

// ============================================
// MYSTICAL CARDS (Tarot + Zodiac)
// ============================================
export const MYSTICAL_CARDS = {
  enabled: true,
  
  // Tarot cards with game hints
  // Set enabled: false on individual cards to hide them
  tarot: [
    { enabled: true, name: 'The Fool', symbol: '0', hint: 'Begin anew. The terminal awaits the curious.', icon: '🃏' },
    { enabled: true, name: 'The Magician', symbol: 'I', hint: 'All tools are at your disposal. Type "help".', icon: '🪄' },
    { enabled: true, name: 'The High Priestess', symbol: 'II', hint: 'Hidden knowledge lies in .hidden files.', icon: '🌙' },
    { enabled: true, name: 'The Empress', symbol: 'III', hint: 'Abundance flows through /void.', icon: '👑' },
    { enabled: true, name: 'The Tower', symbol: 'XVI', hint: 'Destruction reveals truth. Try ssh molten_core.', icon: '🗼' },
    { enabled: true, name: 'The Star', symbol: 'XVII', hint: 'Hope guides you. Check the routes config.', icon: '⭐' },
    { enabled: true, name: 'The Moon', symbol: 'XVIII', hint: 'Illusions obscure. The admin hides in plain sight.', icon: '🌕' },
    { enabled: true, name: 'The World', symbol: 'XXI', hint: 'Completion awaits those who collect all fragments.', icon: '🌍' },
  ],
  
  // Zodiac signs with quantum hints
  zodiac: [
    { enabled: true, name: 'Aries', symbol: '♈', hint: 'Bold action unlocks /debug.', element: 'Fire' },
    { enabled: true, name: 'Taurus', symbol: '♉', hint: 'Persistence reveals the archive password.', element: 'Earth' },
    { enabled: true, name: 'Gemini', symbol: '♊', hint: 'Duality - try both ssh targets.', element: 'Air' },
    { enabled: true, name: 'Cancer', symbol: '♋', hint: 'Home holds secrets. Check the root.', element: 'Water' },
    { enabled: true, name: 'Leo', symbol: '♌', hint: 'Shine light on hidden directories.', element: 'Fire' },
    { enabled: true, name: 'Virgo', symbol: '♍', hint: 'Details matter. Read error messages carefully.', element: 'Earth' },
    { enabled: true, name: 'Libra', symbol: '♎', hint: 'Balance the quantum probability field.', element: 'Air' },
    { enabled: true, name: 'Scorpio', symbol: '♏', hint: 'Deep secrets await in /void.', element: 'Water' },
    { enabled: true, name: 'Sagittarius', symbol: '♐', hint: 'Explore all routes. Adventure awaits.', element: 'Fire' },
    { enabled: true, name: 'Capricorn', symbol: '♑', hint: 'Climb the corporate ladder. /admin beckons.', element: 'Earth' },
    { enabled: true, name: 'Aquarius', symbol: '♒', hint: 'Innovation through enumeration.', element: 'Air' },
    { enabled: true, name: 'Pisces', symbol: '♓', hint: 'Intuition guides. Trust the mystical popups.', element: 'Water' },
  ],
};

// ============================================
// UI TEXT & LABELS
// ============================================
export const UI_TEXT = {
  // Page titles
  pages: {
    home: {
      title: 'SysAdmin Corp',
      subtitle: 'Enterprise Infrastructure Solutions',
      tagline: 'Building the backbone of tomorrow\'s digital infrastructure.',
    },
    terminal: {
      title: 'Terminal Access',
      subtitle: 'Secure Shell Interface',
    },
    archive: {
      title: 'CLASSIFIED ARCHIVE',
      subtitle: 'Document Repository - Clearance Required',
      accessDenied: 'INSUFFICIENT CLEARANCE',
      accessDeniedDesc: (required: number, current: number) => 
        `This archive requires ${required} data fragments. You have collected ${current}.`,
    },
    debug: {
      title: 'SYSTEM DIAGNOSTICS',
      subtitle: 'Real-time Metrics Dashboard',
    },
    void: {
      title: 'THE VOID',
      subtitle: 'You have found what was hidden.',
    },
  },
  
  // Button labels
  buttons: {
    enterTerminal: 'ACCESS TERMINAL',
    export: 'EXPORT SESSION',
    import: 'IMPORT SESSION',
    authenticate: 'AUTHENTICATE',
    stabilize: 'STABILIZE',
  },
  
  // Navigation
  nav: {
    home: 'Home',
    terminal: 'Terminal',
    admin: 'Admin',
    archive: 'Archive',
  },
};

// ============================================
// ASCII ART (Terminal Logo)
// ============================================
export const ASCII_LOGO = `
 ███████╗██╗   ██╗███████╗ █████╗ ██████╗ ███╗   ███╗██╗███╗   ██╗
 ██╔════╝╚██╗ ██╔╝██╔════╝██╔══██╗██╔══██╗████╗ ████║██║████╗  ██║
 ███████╗ ╚████╔╝ ███████╗███████║██║  ██║██╔████╔██║██║██╔██╗ ██║
 ╚════██║  ╚██╔╝  ╚════██║██╔══██║██║  ██║██║╚██╔╝██║██║██║╚██╗██║
 ███████║   ██║   ███████║██║  ██║██████╔╝██║ ╚═╝ ██║██║██║ ╚████║
 ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝
                     ██████╗ ██████╗ ██████╗ ██████╗              
                    ██╔════╝██╔═══██╗██╔══██╗██╔══██╗             
                    ██║     ██║   ██║██████╔╝██████╔╝             
                    ██║     ██║   ██║██╔══██╗██╔═══╝              
                    ╚██████╗╚██████╔╝██║  ██║██║                  
                     ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝   v2.1.7-quantum
`;

// ============================================
// HELPER FUNCTIONS
// ============================================

// ============================================
// MYSTICAL MESSAGES (Templates)
// ============================================
export const MYSTICAL_MESSAGES = [
  {
    id: 'prophecy-001',
    type: 'lore',
    category: 'void',
    content: 'The mesh is leaking copper oxygen. The old world burns in bronze.'
  },
  {
    id: 'intel-fragment-7',
    type: 'clue',
    category: 'financial',
    content: 'Obsidian Holdings isn\'t a company. It\'s a routing table for ghosts.'
  }
];

/**
 * Get enabled tarot cards only
 */
export function getEnabledTarotCards() {
  return MYSTICAL_CARDS.tarot.filter(card => card.enabled);
}

/**
 * Get enabled zodiac signs only
 */
export function getEnabledZodiacSigns() {
  return MYSTICAL_CARDS.zodiac.filter(sign => sign.enabled);
}

/**
 * Get enabled subliminal messages
 */
export function getEnabledChaosMessages() {
  return CHAOS_MESSAGES.enabled ? CHAOS_MESSAGES.subliminal : [];
}
