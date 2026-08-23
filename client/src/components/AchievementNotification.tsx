import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Sparkles, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface AchievementUnlocked {
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  currencyReward: number;
}

interface AchievementNotificationProps {
  achievement: AchievementUnlocked | null;
  onClose: () => void;
}

const rarityColors: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  common: { 
    border: 'border-muted', 
    bg: 'bg-card/95', 
    text: 'text-foreground',
    glow: 'shadow-border/50'
  },
  rare: { 
    border: 'border-blue-600', 
    bg: 'bg-blue-950/95', 
    text: 'text-blue-300',
    glow: 'shadow-blue-600/50'
  },
  epic: { 
    border: 'border-purple-600', 
    bg: 'bg-purple-950/95', 
    text: 'text-purple-300',
    glow: 'shadow-purple-600/50'
  },
  legendary: { 
    border: 'border-amber-600', 
    bg: 'bg-amber-950/95', 
    text: 'text-amber-300',
    glow: 'shadow-amber-600/50'
  }
};

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  const colors = rarityColors[achievement.rarity];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
        >
          <div className={`${colors.bg} ${colors.border} border-2 rounded-lg p-6 ${colors.glow} shadow-2xl backdrop-blur-xl relative overflow-hidden`}>
            {/* Animated background sparkles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  initial={{ 
                    x: Math.random() * 100 + '%', 
                    y: '120%',
                    opacity: 0,
                    scale: 0
                  }}
                  animate={{ 
                    y: '-20%',
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1, 1, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.2,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
              className="absolute top-2 right-2 p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className={`w-5 h-5 ${colors.text}`} />
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Achievement Unlocked!</p>
              </div>

              <div className="flex items-start gap-4 mb-4">
                <motion.div 
                  className="text-5xl"
                  animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 0.5,
                    delay: 0.2
                  }}
                >
                  {achievement.icon}
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-xl font-bold ${colors.text}`}>{achievement.name}</h3>
                    <Badge className={`${colors.border} ${colors.text} text-[10px]`}>
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
              </div>

              {/* Rewards */}
              <div className="flex gap-3 pt-3 border-t border-border">
                {achievement.xpReward > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-900/20 rounded border border-amber-900/30">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-amber-400">+{achievement.xpReward} XP</span>
                  </div>
                )}
                {achievement.currencyReward > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-orange-900/20 rounded border border-orange-900/30">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-bold text-orange-400">+{achievement.currencyReward} Credits</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Achievement notification manager hook
let achievementQueue: AchievementUnlocked[] = [];
let notificationCallback: ((achievement: AchievementUnlocked) => void) | null = null;

export function useAchievementNotifications() {
  const [currentAchievement, setCurrentAchievement] = useState<AchievementUnlocked | null>(null);

  const showNext = useCallback(() => {
    if (achievementQueue.length > 0) {
      const next = achievementQueue.shift()!;
      setCurrentAchievement(next);
    } else {
      setCurrentAchievement(null);
    }
  }, []);

  useEffect(() => {
    notificationCallback = (achievement: AchievementUnlocked) => {
      achievementQueue.push(achievement);
      setCurrentAchievement(prev => {
        if (!prev) {
          const next = achievementQueue.shift();
          return next || null;
        }
        return prev;
      });
    };

    return () => {
      notificationCallback = null;
    };
  }, []);

  const handleClose = useCallback(() => {
    setCurrentAchievement(null);
    setTimeout(() => {
      if (achievementQueue.length > 0) {
        const next = achievementQueue.shift()!;
        setCurrentAchievement(next);
      }
    }, 500);
  }, []);

  return {
    currentAchievement,
    handleClose,
  };
}

// Global function to trigger achievement notifications
export function showAchievementNotification(achievement: AchievementUnlocked) {
  if (notificationCallback) {
    notificationCallback(achievement);
  } else {
    // Store in queue if callback not registered yet
    achievementQueue.push(achievement);
  }
}
