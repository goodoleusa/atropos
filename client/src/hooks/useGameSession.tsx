import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";

interface Clue {
  id: string;
  name: string;
  description: string;
  content: string; // The actual "secret" or data
  foundAt: string;
}

interface GameState {
  inventory: Clue[];
  sessionToken: string;
  username: string;
}

interface GameContextType {
  gameState: GameState;
  collectClue: (clue: Clue) => void;
  hasClue: (id: string) => boolean;
  setSessionUsername: (name: string) => void;
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
  
  // Initialize state from localStorage or default
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('sysadmin_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Corrupted save file", e);
      }
    }
    return {
      inventory: [],
      sessionToken: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
      username: 'Guest'
    };
  });

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('sysadmin_session', JSON.stringify(gameState));
  }, [gameState]);

  const collectClue = (clue: Clue) => {
    if (gameState.inventory.some(c => c.id === clue.id)) return;

    setGameState(prev => ({
      ...prev,
      inventory: [...prev.inventory, clue]
    }));

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
  };

  return (
    <GameContext.Provider value={{ gameState, collectClue, hasClue, setSessionUsername }}>
      {children}
    </GameContext.Provider>
  );
};
