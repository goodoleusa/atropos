import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGameSession';
import { X } from 'lucide-react';

const TAROT_CARDS = [
  { name: 'The Fool', symbol: '0', hint: 'Begin anew. The terminal awaits the curious.', icon: '🃏' },
  { name: 'The Magician', symbol: 'I', hint: 'All tools are at your disposal. Type "help".', icon: '🪄' },
  { name: 'The High Priestess', symbol: 'II', hint: 'Hidden knowledge lies in .hidden files.', icon: '🌙' },
  { name: 'The Empress', symbol: 'III', hint: 'Abundance flows through /void.', icon: '👑' },
  { name: 'The Tower', symbol: 'XVI', hint: 'Destruction reveals truth. Try ssh molten_core.', icon: '🗼' },
  { name: 'The Star', symbol: 'XVII', hint: 'Hope guides you. Check the routes config.', icon: '⭐' },
  { name: 'The Moon', symbol: 'XVIII', hint: 'Illusions obscure. The admin hides in plain sight.', icon: '🌕' },
  { name: 'The World', symbol: 'XXI', hint: 'Completion awaits those who collect all fragments.', icon: '🌍' },
];

const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', element: 'Fire', hint: 'Charge forward. Hidden paths reward the bold.' },
  { name: 'Taurus', symbol: '♉', element: 'Earth', hint: 'Patience reveals secrets in the footer.' },
  { name: 'Gemini', symbol: '♊', element: 'Air', hint: 'Duality exists. Two terminals, one truth.' },
  { name: 'Cancer', symbol: '♋', element: 'Water', hint: 'Home holds secrets. Look closer at the cards.' },
  { name: 'Leo', symbol: '♌', element: 'Fire', hint: 'The spotlight hides shadows. Check netstat.' },
  { name: 'Virgo', symbol: '♍', element: 'Earth', hint: 'Details matter. ls reveals hidden files.' },
  { name: 'Libra', symbol: '♎', element: 'Air', hint: 'Balance the scales. Import and export are mirrors.' },
  { name: 'Scorpio', symbol: '♏', element: 'Water', hint: 'Secrets run deep. Probe the void.' },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', hint: 'Adventure calls. Explore every route.' },
  { name: 'Capricorn', symbol: '♑', element: 'Earth', hint: 'Climb higher. The admin console watches all.' },
  { name: 'Aquarius', symbol: '♒', element: 'Air', hint: 'Innovation unlocks paths. Decode the messages.' },
  { name: 'Pisces', symbol: '♓', element: 'Water', hint: 'Dreams hold truth. The void speaks to seekers.' },
];

interface MysticalCard {
  type: 'tarot' | 'zodiac';
  data: typeof TAROT_CARDS[0] | typeof ZODIAC_SIGNS[0];
}

export const MysticalPopups = () => {
  const [activeCard, setActiveCard] = useState<MysticalCard | null>(null);
  const { collectClue, hasClue } = useGame();

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.92) {
        const isTarot = Math.random() > 0.5;
        if (isTarot) {
          const card = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
          setActiveCard({ type: 'tarot', data: card });
        } else {
          const sign = ZODIAC_SIGNS[Math.floor(Math.random() * ZODIAC_SIGNS.length)];
          setActiveCard({ type: 'zodiac', data: sign });
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleCollect = () => {
    if (!activeCard) return;
    
    const clueId = `mystical-${activeCard.type}-${activeCard.data.name.toLowerCase().replace(/\s+/g, '-')}`;
    
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
                <div className="text-4xl mb-2">{(activeCard.data as typeof TAROT_CARDS[0]).icon}</div>
                <div className="text-xs text-amber-700 font-mono mb-1">
                  {(activeCard.data as typeof TAROT_CARDS[0]).symbol}
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
                  {(activeCard.data as typeof ZODIAC_SIGNS[0]).symbol}
                </div>
                <div className="text-xs text-purple-700 font-mono mb-1">
                  {(activeCard.data as typeof ZODIAC_SIGNS[0]).element}
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
