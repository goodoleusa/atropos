import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useLearningStore } from "@/stores/useLearningStore";
import { useShallow } from 'zustand/react/shallow';

interface Clue {
  id: string;
  name: string;
  description: string;
  content: string;
  foundAt: string;
}

interface PlayerStats {
  commandsRun: number;
  campaignsStarted: number;
  campaignsCompleted: number;
  cluesFound: number;
  missionsCompleted: number;
  totalPlayTimeMinutes: number;
  longestStreak: number;
  currentStreak: number;
  lastPlayDate: string | null;
}

interface AcceptedMission {
  id: string;
  name: string;
  command: string;
  description: string;
  source: 'void' | 'terminal' | 'qr-c2' | 'campaign';
  acceptedAt: string;
  status: 'accepted' | 'in_progress' | 'completed';
}

interface GameState {
  inventory: Clue[];
  sessionToken: string;
  username: string;
  synced: boolean;
  devMode: boolean;
  settings: Record<string, any>;
  xp: number;
  level: number;
  achievements: string[];
  stats: PlayerStats;
  acceptedMissions: AcceptedMission[];
}

interface GameContextType {
  gameState: GameState;
  collectClue: (clue: Clue) => void;
  hasClue: (id: string) => boolean;
  setSessionUsername: (name: string) => void;
  syncSession: () => Promise<void>;
  importSession: (token: string) => Promise<boolean>;
  toggleDevMode: () => void;
  awardXP: (amount: number, reason: string) => Promise<void>;
  checkAchievements: () => Promise<void>;
  checkQuestCompletion: () => Promise<void>;
  incrementStat: (stat: keyof PlayerStats, amount?: number) => void;
  acceptMission: (mission: Omit<AcceptedMission, 'acceptedAt' | 'status'>) => void;
  completeMission: (missionId: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

const DEFAULT_STATS: PlayerStats = {
  commandsRun: 0,
  campaignsStarted: 0,
  campaignsCompleted: 0,
  cluesFound: 0,
  missionsCompleted: 0,
  totalPlayTimeMinutes: 0,
  longestStreak: 0,
  currentStreak: 0,
  lastPlayDate: null,
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const style = useLearningStore(state => state.style);
  const goals = useLearningStore(useShallow(state => state.goals));
  const skillLevel = useLearningStore(state => state.skillLevel);
  const preferredPace = useLearningStore(state => state.preferredPace);
  
  const learningProfileRef = useRef({ style, goals, skillLevel, preferredPace });
  learningProfileRef.current = { style, goals, skillLevel, preferredPace };
  
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('sysadmin_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          synced: false,
          devMode: parsed.devMode || false,
          settings: parsed.settings || {},
          xp: parsed.xp || 0,
          level: parsed.level || 1,
          achievements: parsed.achievements || [],
          stats: { ...DEFAULT_STATS, ...(parsed.stats || {}) },
          acceptedMissions: parsed.acceptedMissions || [],
        };
      } catch (e) {
        console.error("Corrupted save file", e);
      }
    }
    return {
      inventory: [],
      sessionToken: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
      username: 'Guest',
      synced: false,
      devMode: false,
      settings: {},
      xp: 0,
      level: 1,
      achievements: [],
      stats: { ...DEFAULT_STATS },
      acceptedMissions: [],
    };
  });

  const persistSessionMetadata = useCallback(async (updates: Record<string, any>) => {
    try {
      await fetch(`/api/session/${gameState.sessionToken}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('Session metadata sync failed:', error);
    }
  }, [gameState.sessionToken]);

  const syncSession = useCallback(async () => {
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: gameState.sessionToken,
          username: gameState.username
        })
      });
      
      if (response.ok) {
        const serverSession = await response.json();
        
        const serverClueIds = serverSession.collectedClues || [];
        const localClueIds = gameState.inventory.map(c => c.id);
        const allClueIds = Array.from(new Set([...serverClueIds, ...localClueIds]));
        
        setGameState(prev => ({
          ...prev,
          synced: true,
          settings: serverSession.settings || prev.settings || {},
          xp: serverSession.xp || prev.xp || 0,
          level: serverSession.level || prev.level || 1,
          achievements: serverSession.achievements || prev.achievements || [],
          stats: { ...DEFAULT_STATS, ...(serverSession.stats || prev.stats || {}) },
        }));
        
        const settings = {
          learningProfile: learningProfileRef.current,
          devMode: gameState.devMode
        };

        const progress = {
          lastRoute: window.location.pathname,
          inventoryCount: gameState.inventory.length,
          lastSyncedAt: new Date().toISOString()
        };

        if (localClueIds.length > serverClueIds.length) {
          await fetch(`/api/session/${gameState.sessionToken}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              collectedClues: allClueIds,
              username: gameState.username,
              settings,
              progress
            })
          });
        } else {
          await persistSessionMetadata({ settings, progress });
        }
      }
    } catch (error) {
      console.error('Session sync failed:', error);
    }
  }, [gameState.sessionToken, gameState.username, gameState.inventory, gameState.devMode, persistSessionMetadata]);

  useEffect(() => {
    syncSession();
  }, []);

  useEffect(() => {
    if (!gameState.synced) return;
    const settings = { learningProfile: learningProfileRef.current, devMode: gameState.devMode };
    const progress = {
      lastRoute: window.location.pathname,
      inventoryCount: gameState.inventory.length,
      lastSyncedAt: new Date().toISOString()
    };
    persistSessionMetadata({ settings, progress });
  }, [style, goals, skillLevel, preferredPace, gameState.devMode, gameState.inventory.length, persistSessionMetadata, gameState.synced]);

  useEffect(() => {
    localStorage.setItem('sysadmin_session', JSON.stringify(gameState));
  }, [gameState]);

  // Track play time every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          totalPlayTimeMinutes: prev.stats.totalPlayTimeMinutes + 5,
        }
      }));
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const awardXP = useCallback(async (amount: number, reason: string) => {
    try {
      const res = await fetch('/api/gameplay/award-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken: gameState.sessionToken, amount, reason })
      });
      if (res.ok) {
        const data = await res.json();
        const leveledUp = data.leveledUp;
        setGameState(prev => ({
          ...prev,
          xp: data.newXP,
          level: data.newLevel,
        }));
        if (leveledUp) {
          toast({
            title: "LEVEL UP!",
            description: `You are now Level ${data.newLevel}: ${data.title}`,
            className: "border-amber-500 text-amber-800 bg-black/90 font-mono",
          });
        }
      }
    } catch (error) {
      console.error('Failed to award XP:', error);
    }
  }, [gameState.sessionToken, toast]);

  const checkAchievements = useCallback(async () => {
    try {
      const res = await fetch(`/api/gameplay/check-achievements/${gameState.sessionToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.newUnlocks?.length > 0) {
          for (const unlock of data.newUnlocks) {
            toast({
              title: "ACHIEVEMENT UNLOCKED",
              description: `${unlock.name} (+${unlock.xpReward} XP)`,
              className: "border-amber-500 text-amber-800 bg-black/90 font-mono",
            });
          }
          setGameState(prev => ({
            ...prev,
            achievements: Array.from(new Set([...prev.achievements, ...data.newUnlocks.map((u: any) => u.achievementId)])),
            xp: prev.xp + data.totalXPAwarded,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  }, [gameState.sessionToken, toast]);

  const checkQuestCompletion = useCallback(async () => {
    try {
      const res = await fetch(`/api/gameplay/check-quests/${gameState.sessionToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.newlyCompleted?.length > 0) {
          for (const questId of data.newlyCompleted) {
            toast({
              title: "QUEST COMPLETED",
              description: `Mission accomplished: ${questId}`,
              className: "border-teal-500 text-teal-800 bg-black/90 font-mono",
            });
          }
          setGameState(prev => ({
            ...prev,
            xp: prev.xp + data.xpAwarded,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to check quests:', error);
    }
  }, [gameState.sessionToken, toast]);

  const incrementStat = useCallback((stat: keyof PlayerStats, amount = 1) => {
    setGameState(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: (prev.stats[stat] as number || 0) + amount,
      }
    }));
  }, []);

  const collectClue = async (clue: Clue) => {
    if (gameState.inventory.some(c => c.id === clue.id)) return;

    const newInventory = [...gameState.inventory, clue];
    
    setGameState(prev => ({
      ...prev,
      inventory: newInventory,
      stats: {
        ...prev.stats,
        cluesFound: prev.stats.cluesFound + 1,
      }
    }));

    try {
      await fetch(`/api/session/${gameState.sessionToken}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectedClues: newInventory.map(c => c.id),
          progress: {
            lastRoute: window.location.pathname,
            inventoryCount: newInventory.length,
            lastSyncedAt: new Date().toISOString()
          }
        })
      });
    } catch (error) {
      console.error('Failed to sync clue:', error);
    }

    await awardXP(100, `Found clue: ${clue.name}`);

    toast({
      title: "DATA FRAGMENT ACQUIRED",
      description: `Archived: ${clue.name} (+100 XP)`,
      className: "border-primary text-primary bg-black/90 font-mono",
    });

    setTimeout(() => {
      checkQuestCompletion();
      checkAchievements();
    }, 500);
  };

  const hasClue = (id: string) => {
    return gameState.inventory.some(c => c.id === id);
  };

  const setSessionUsername = (name: string) => {
    setGameState(prev => ({ ...prev, username: name }));
    
    fetch(`/api/session/${gameState.sessionToken}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: name,
        settings: {
          learningProfile: learningProfileRef.current,
          devMode: gameState.devMode
        }
      })
    }).catch(console.error);
  };

  const importSession = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/session/${token}`);
      if (!response.ok) return false;
      
      const serverSession = await response.json();
      
      setGameState(prev => ({
        ...prev,
        sessionToken: token,
        username: serverSession.username || 'Guest',
        inventory: serverSession.collectedClues?.map((id: string) => ({
          id,
          name: `Clue ${id}`,
          description: 'Imported from session',
          content: 'Restored from server',
          foundAt: new Date().toISOString()
        })) || [],
        synced: true,
        xp: serverSession.xp || 0,
        level: serverSession.level || 1,
        achievements: serverSession.achievements || [],
        stats: { ...DEFAULT_STATS, ...(serverSession.stats || {}) },
      }));
      
      toast({
        title: "SESSION IMPORTED",
        description: `Restored session with ${serverSession.collectedClues?.length || 0} fragments`,
        className: "border-teal-500 text-teal-800 bg-black/90 font-mono",
      });
      
      return true;
    } catch (error) {
      console.error('Failed to import session:', error);
      return false;
    }
  };

  const toggleDevMode = () => {
    setGameState(prev => ({ ...prev, devMode: !prev.devMode }));
  };

  const acceptMission = useCallback((mission: Omit<AcceptedMission, 'acceptedAt' | 'status'>) => {
    setGameState(prev => {
      if (prev.acceptedMissions.some(m => m.id === mission.id && m.status !== 'completed')) {
        return prev;
      }
      return {
        ...prev,
        acceptedMissions: [...prev.acceptedMissions, {
          ...mission,
          acceptedAt: new Date().toISOString(),
          status: 'accepted' as const,
        }],
      };
    });
    toast({
      title: "MISSION ACCEPTED",
      description: `${mission.name} added to Mission Control`,
      className: "border-teal-500 text-teal-800 bg-black/90 font-mono",
    });
  }, [toast]);

  const completeMission = useCallback((missionId: string) => {
    setGameState(prev => ({
      ...prev,
      acceptedMissions: prev.acceptedMissions.map(m =>
        m.id === missionId ? { ...m, status: 'completed' as const } : m
      ),
      stats: {
        ...prev.stats,
        missionsCompleted: prev.stats.missionsCompleted + 1,
      },
    }));
  }, []);

  return (
    <GameContext.Provider value={{
      gameState,
      collectClue,
      hasClue,
      setSessionUsername,
      syncSession,
      importSession,
      toggleDevMode,
      awardXP,
      checkAchievements,
      checkQuestCompletion,
      incrementStat,
      acceptMission,
      completeMission,
    }}>
      {children}
    </GameContext.Provider>
  );
};
