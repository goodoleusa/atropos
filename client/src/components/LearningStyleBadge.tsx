import { useState, useRef, useEffect } from 'react';
import { useLearningStore } from '@/stores/useLearningStore';
import { Brain, Eye, Users, Wrench, FlaskConical } from 'lucide-react';
import type { LearningStyle } from '@/config/learningConfig';

const STYLES: Record<LearningStyle, { label: string; short: string; icon: any; color: string; bg: string }> = {
  experiential: { label: 'Experiential', short: 'Hands-on', icon: FlaskConical, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-800/30' },
  visual: { label: 'Visual', short: 'Visual', icon: Eye, color: 'text-sky-700 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-900/20 border-sky-300 dark:border-sky-800/30' },
  analytical: { label: 'Analytical', short: 'Deep', icon: Brain, color: 'text-purple-700', bg: 'bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-800/30' },
  social: { label: 'Social', short: 'Collab', icon: Users, color: 'text-amber-800', bg: 'bg-amber-100 dark:bg-amber-900/20 border-amber-300 dark:border-amber-800/30' },
  pragmatic: { label: 'Pragmatic', short: 'Quick', icon: Wrench, color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/20 border-rose-300 dark:border-rose-800/30' },
};

interface LearningStyleBadgeProps {
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function LearningStyleBadge({ size = 'sm', showLabel = false }: LearningStyleBadgeProps) {
  const style = useLearningStore(s => s.style);
  const setStyle = useLearningStore(s => s.setStyle);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler); };
  }, [open]);

  const current = STYLES[style];
  const Icon = current.icon;
  const isSm = size === 'sm';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 rounded border transition-colors ${current.bg} ${isSm ? 'h-7 px-1.5 md:px-2' : 'h-8 md:h-9 px-2 md:px-3'}`}
        title={`Learning style: ${current.label} — click to change`}
        data-testid="learning-style-badge"
      >
        <Icon className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${current.color}`} />
        {showLabel && <span className={`${current.color} ${isSm ? 'text-[9px] md:text-[10px]' : 'text-[10px] md:text-xs'} font-medium`}>{current.short}</span>}
        {!showLabel && <span className={`${current.color} text-[9px] md:text-[10px] hidden sm:inline`}>{current.short}</span>}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-xl p-1 min-w-[160px] md:min-w-[180px]" data-testid="learning-style-picker">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider px-2 py-1 font-bold">Learning Style</p>
          {(Object.entries(STYLES) as [LearningStyle, typeof STYLES[LearningStyle]][]).map(([key, meta]) => {
            const SIcon = meta.icon;
            const isActive = key === style;
            return (
              <button
                key={key}
                onClick={() => { setStyle(key); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-2 py-2 md:py-1.5 rounded text-left transition-colors min-h-[40px] md:min-h-0 ${
                  isActive ? `${meta.bg} ${meta.color}` : 'text-muted-foreground hover:bg-card hover:text-white'
                }`}
                data-testid={`style-option-${key}`}
              >
                <SIcon className={`w-3.5 h-3.5 ${isActive ? meta.color : 'text-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <span className={`text-[11px] md:text-xs font-medium ${isActive ? meta.color : ''}`}>{meta.label}</span>
                  <span className="text-[9px] text-muted-foreground ml-1.5 hidden md:inline">{meta.short}</span>
                </div>
                {isActive && <div className={`w-1.5 h-1.5 rounded-full ${meta.color.replace('text-', 'bg-')}`} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
