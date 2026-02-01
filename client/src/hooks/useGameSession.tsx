import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useLearningStore } from "@/stores/useLearningStore";

interface Clue {
  id: string;
  name: string;
  description: string;
  content: string;
  foundAt: string;
}

interface GameState {
  inventory: Clue[];
  sessionToken: string;
  username: string;
  synced: boolean;
  devMode: boolean;
}

interface GameContextType {
  gameState: GameState;
  collectClue: (clue: Clue) => void;
  hasClue: (id: string) => boolean;
  setSessionUsername: (name: string) => void;
  syncSession: () => Promise<void>;
  importSession: (token: string) => Promise<boolean>;
  toggleDevMode: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const learningProfile = useLearningStore(state => ({
    style: state.style,
    goals: state.goals,
    skillLevel: state.skillLevel,
    preferredPace: state.preferredPace
  }));
  
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('sysadmin_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, synced: false, devMode: parsed.devMode || false };
      } catch (e) {
        console.error("Corrupted save file", e);
      }
    }
    return {
      inventory: [],
      sessionToken: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
      username: 'Guest',
      synced: false,
      devMode: false
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

  // Sync session with server
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
        
        // Merge server clues with local inventory
        const serverClueIds = serverSession.collectedClues || [];
        const localClueIds = gameState.inventory.map(c => c.id);
        const allClueIds = [...new Set([...serverClueIds, ...localClueIds])];
        
        // If there are clues on server that we don't have locally, we can't restore full data
        // But at least mark synced
        setGameState(prev => ({
          ...prev,
          synced: true
        }));
        
        // Update server with any local clues it doesn't have
        const settings = {
          learningProfile,
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
  }, [gameState.sessionToken, gameState.username, gameState.inventory, gameState.devMode, learningProfile, persistSessionMetadata]);

  // Sync on mount
  useEffect(() => {
    syncSession();
  }, []);

  // Persist settings changes to server
  useEffect(() => {
    const settings = { learningProfile, devMode: gameState.devMode };
    const progress = {
      lastRoute: window.location.pathname,
      inventoryCount: gameState.inventory.length,
      lastSyncedAt: new Date().toISOString()
    };
    persistSessionMetadata({ settings, progress });
  }, [learningProfile, gameState.devMode, gameState.inventory.length, persistSessionMetadata]);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('sysadmin_session', JSON.stringify(gameState));
  }, [gameState]);

  const collectClue = async (clue: Clue) => {
    if (gameState.inventory.some(c => c.id === clue.id)) return;

    const newInventory = [...gameState.inventory, clue];
    
    setGameState(prev => ({
      ...prev,
      inventory: newInventory
    }));

    // Sync with server
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

    toast({
      title: "DATA FRAGMENT ACQUIRED",
      description: `Archived: ${clue.name}`,
      className: "border-primary text-primary bg-black/90 font-mono",
    });
  };

  const hasClue = (id: string) => {
    return gameState.inventory.some(c => c.id === id);
  };

  const setSessionUsername = (name: string) => {
    setGameState(prev => ({ ...prev, username: name }));
    
    // Sync with server
    fetch(`/api/session/${gameState.sessionToken}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: name,
        settings: {
          learningProfile,
          devMode: gameState.devMode
        }
      })
    }).catch(console.error);
  };

  const importSession = async (token: string): Promise<boolean> => {
    try {
      // Try to fetch the session from server
      const response = await fetch(`/api/session/${token}`);
      if (!response.ok) return false;
      
      const serverSession = await response.json();
      
      // Update local state with imported session
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
        synced: true
      }));
      
      toast({
        title: "SESSION IMPORTED",
        description: `Restored session with ${serverSession.collectedClues?.length || 0} fragments`,
        className: "border-teal-500 text-teal-400 bg-black/90 font-mono",
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

  return (
    <GameContext.Provider value={{ gameState, collectClue, hasClue, setSessionUsername, syncSession, importSession, toggleDevMode }}>
      {children}
    </GameContext.Provider>
  );
};
