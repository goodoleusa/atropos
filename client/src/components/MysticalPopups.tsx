import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGameSession';
import { X } from 'lucide-react';
import { MYSTICAL_CARDS } from '@/config/messages';

const DEFAULT_TAROT = MYSTICAL_CARDS.tarot.filter(card => card.enabled !== false);
const DEFAULT_ZODIAC = MYSTICAL_CARDS.zodiac.filter(card => card.enabled !== false);

interface MysticalCard {
  type: 'tarot' | 'zodiac';
  data: typeof DEFAULT_TAROT[0] | typeof DEFAULT_ZODIAC[0];
}

export const MysticalPopups = () => {
  const [activeCard, setActiveCard] = useState<MysticalCard | null>(null);
  const [tarotCards, setTarotCards] = useState(DEFAULT_TAROT);
  const [zodiacSigns, setZodiacSigns] = useState(DEFAULT_ZODIAC);
  const { collectClue, hasClue } = useGame();

  useEffect(() => {
    const loadCards = async () => {
      try {
        const res = await fetch('/api/mystical-cards');
        if (!res.ok) return;
        const cards = await res.json();
        if (!Array.isArray(cards) || cards.length === 0) return;

        const tarot = cards.filter((c: { type: string; enabled?: boolean }) => c.type === 'tarot' && c.enabled !== false);
        const zodiac = cards.filter((c: { type: string; enabled?: boolean }) => c.type === 'zodiac' && c.enabled !== false);

        if (tarot.length > 0) setTarotCards(tarot);
        if (zodiac.length > 0) setZodiacSigns(zodiac);
      } catch (error) {
        console.error('Failed to load mystical cards:', error);
      }
    };

    loadCards();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.92) {
        const hasTarot = tarotCards.length > 0;
        const hasZodiac = zodiacSigns.length > 0;
        if (!hasTarot && !hasZodiac) return;

        const isTarot = hasTarot && (!hasZodiac || Math.random() > 0.5);
        if (isTarot) {
          const card = tarotCards[Math.floor(Math.random() * tarotCards.length)];
          if (card) setActiveCard({ type: 'tarot', data: card });
        } else if (hasZodiac) {
          const sign = zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)];
          if (sign) setActiveCard({ type: 'zodiac', data: sign });
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [tarotCards, zodiacSigns]);

  const handleCollect = () => {
    if (!activeCard) return;

    const cardId = (activeCard.data as { cardId?: string }).cardId;
    const fallbackId = activeCard.data.name.toLowerCase().replace(/\s+/g, '-');
    const clueId = cardId ? `mystical-${cardId}` : `mystical-${activeCard.type}-${fallbackId}`;
    
    if (!hasClue(clueId)) {
      collectClue({
        id: clueId,
        name: `${activeCard.type === 'tarot' ? 'Tarot' : 'Zodiac'}: ${activeCard.data.name}`,
        description: `A mystical vision appeared.`,
        content: activeCard.data.hint,
        foundAt: new Date().toISOString()
      });
    }
    
    setActiveCard(null);
  };

  const dismissCard = () => setActiveCard(null);

  return (
    <AnimatePresence>
      {activeCard && (
        <>
          {/* Backdrop - click to dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissCard}
            className="fixed inset-0 z-[79] bg-black/20"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-16 sm:bottom-4 right-2 sm:right-4 md:bottom-8 md:right-8 z-[80] w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-xs"
          >
          <div className={`
            relative p-4 sm:p-6 rounded-lg backdrop-blur-md border shadow-2xl
            ${activeCard.type === 'tarot' 
              ? 'bg-gradient-to-br from-[#1a0f05] to-[#0a0500] border-amber-700/50 shadow-amber-900/30' 
              : 'bg-gradient-to-br from-[#0a0510] to-[#050008] border-purple-900/50 shadow-purple-900/30'
            }
          `}>
            {/* Close button - larger touch target for mobile */}
            <button 
              onClick={(e) => { e.stopPropagation(); dismissCard(); }}
              onPointerDown={(e) => { e.stopPropagation(); dismissCard(); }}
              className="absolute -top-3 -right-3 sm:top-2 sm:right-2 bg-stone-900 hover:bg-red-900 text-stone-300 hover:text-white transition-colors rounded-full w-[48px] h-[48px] flex items-center justify-center cursor-pointer shadow-xl border-2 border-stone-500 z-[100]"
              style={{ touchAction: 'manipulation' }}
              data-testid="mystical-close"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Tap to dismiss hint */}
            <div className="absolute -bottom-5 left-0 right-0 text-center text-[10px] text-stone-500 sm:hidden">
              tap X to close
            </div>

            {activeCard.type === 'tarot' ? (
              // Tarot Card Design
              <div className="text-center">
                <div className="text-4xl mb-2">{(activeCard.data as typeof DEFAULT_TAROT[0]).icon}</div>
                <div className="text-xs text-amber-700 font-mono mb-1">
                  {(activeCard.data as typeof DEFAULT_TAROT[0]).symbol}
                </div>
                <h3 className="text-amber-500 font-orbitron text-lg mb-3">
                  {activeCard.data.name}
                </h3>
                <p className="text-stone-400 text-sm italic mb-4">
                  "{activeCard.data.hint}"
                </p>
                <button
                  onClick={handleCollect}
                  className="px-4 py-2 bg-amber-900/50 hover:bg-amber-800/50 text-amber-400 text-xs font-mono rounded border border-amber-700/30 transition-colors"
                  data-testid="mystical-collect"
                >
                  ARCHIVE VISION
                </button>
              </div>
            ) : (
              // Zodiac Sign Design
              <div className="text-center">
                <div className="text-5xl mb-2 text-purple-400">
                  {(activeCard.data as typeof DEFAULT_ZODIAC[0]).symbol}
                </div>
                <div className="text-xs text-purple-700 font-mono mb-1">
                  {(activeCard.data as typeof DEFAULT_ZODIAC[0]).element}
                </div>
                <h3 className="text-purple-400 font-orbitron text-lg mb-3">
                  {activeCard.data.name}
                </h3>
                <p className="text-stone-400 text-sm italic mb-4">
                  "{activeCard.data.hint}"
                </p>
                <button
                  onClick={handleCollect}
                  className="px-4 py-2 bg-purple-900/50 hover:bg-purple-800/50 text-purple-400 text-xs font-mono rounded border border-purple-700/30 transition-colors"
                  data-testid="mystical-collect-zodiac"
                >
                  ARCHIVE OMEN
                </button>
              </div>
            )}

            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-amber-600/30 rounded-tl"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-amber-600/30 rounded-tr"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-amber-600/30 rounded-bl"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-amber-600/30 rounded-br"></div>
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
