import { useState, useEffect, useCallback } from "react";
import { Type, ChevronDown, RotateCcw } from "lucide-react";
import { useGame } from "@/hooks/useGameSession";

const FONT_OPTIONS = [
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Exo 2", value: "'Exo 2', sans-serif" },
  { label: "System", value: "system-ui, -apple-system, sans-serif" },
  { label: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
];

const SIZE_OPTIONS = [
  { label: "S", value: 0.85 },
  { label: "M", value: 1 },
  { label: "L", value: 1.1 },
  { label: "XL", value: 1.2 },
];

const WEIGHT_OPTIONS = [
  { label: "Light", value: "300" },
  { label: "Regular", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Semibold", value: "600" },
];

interface FontSettings {
  headingFont: string;
  bodyFont: string;
  sizeScale: number;
  headingWeight: string;
}

const DEFAULT_SETTINGS: FontSettings = {
  headingFont: "'Exo 2', sans-serif",
  bodyFont: "'Inter', sans-serif",
  sizeScale: 1,
  headingWeight: "600",
};

const STORAGE_KEY = "atropos-font-settings";

function loadSettings(): FontSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function applySettings(s: FontSettings) {
  const root = document.documentElement;
  root.style.setProperty("--font-heading", s.headingFont);
  root.style.setProperty("--font-body", s.bodyFont);
  root.style.setProperty("--font-scale", String(s.sizeScale));
  root.style.setProperty("--font-heading-weight", s.headingWeight);
}

export default function FontCustomizer() {
  const { gameState } = useGame();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<FontSettings>(loadSettings);

  useEffect(() => {
    applySettings(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  if (!gameState?.devMode) return null;

  const update = useCallback((patch: Partial<FontSettings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-50" data-testid="font-customizer">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-stone-900/90 border border-amber-800/40 flex items-center justify-center text-amber-500 hover:text-amber-400 hover:border-amber-600/60 transition-all shadow-lg backdrop-blur-sm"
        title="Font Settings"
        data-testid="font-customizer-toggle"
      >
        <Type className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute bottom-12 left-0 w-64 bg-stone-950/95 border border-stone-800/60 rounded-lg shadow-2xl backdrop-blur-md p-3 space-y-3" data-testid="font-customizer-panel">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-300 uppercase tracking-wider">Typography</span>
            <div className="flex gap-1">
              <button onClick={reset} className="text-stone-500 hover:text-amber-400 transition-colors" title="Reset to defaults" data-testid="font-reset">
                <RotateCcw className="w-3 h-3" />
              </button>
              <button onClick={() => setOpen(false)} className="text-stone-500 hover:text-stone-300 transition-colors">
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-stone-500 uppercase tracking-wider">Headings</label>
            <div className="flex flex-wrap gap-1">
              {FONT_OPTIONS.map(f => (
                <button
                  key={f.value}
                  onClick={() => update({ headingFont: f.value })}
                  className={`px-2 py-1 text-[10px] rounded border transition-all ${
                    settings.headingFont === f.value
                      ? "bg-amber-900/40 border-amber-700/60 text-amber-400"
                      : "bg-stone-900/50 border-stone-800/40 text-stone-400 hover:text-stone-300"
                  }`}
                  data-testid={`font-heading-${f.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-stone-500 uppercase tracking-wider">Body</label>
            <div className="flex flex-wrap gap-1">
              {FONT_OPTIONS.map(f => (
                <button
                  key={f.value}
                  onClick={() => update({ bodyFont: f.value })}
                  className={`px-2 py-1 text-[10px] rounded border transition-all ${
                    settings.bodyFont === f.value
                      ? "bg-amber-900/40 border-amber-700/60 text-amber-400"
                      : "bg-stone-900/50 border-stone-800/40 text-stone-400 hover:text-stone-300"
                  }`}
                  data-testid={`font-body-${f.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-stone-500 uppercase tracking-wider">Heading Weight</label>
            <div className="flex gap-1">
              {WEIGHT_OPTIONS.map(w => (
                <button
                  key={w.value}
                  onClick={() => update({ headingWeight: w.value })}
                  className={`px-2 py-1 text-[10px] rounded border transition-all ${
                    settings.headingWeight === w.value
                      ? "bg-amber-900/40 border-amber-700/60 text-amber-400"
                      : "bg-stone-900/50 border-stone-800/40 text-stone-400 hover:text-stone-300"
                  }`}
                  data-testid={`font-weight-${w.label.toLowerCase()}`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-stone-500 uppercase tracking-wider">Size Scale</label>
            <div className="flex gap-1">
              {SIZE_OPTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => update({ sizeScale: s.value })}
                  className={`px-3 py-1 text-[10px] rounded border transition-all ${
                    settings.sizeScale === s.value
                      ? "bg-amber-900/40 border-amber-700/60 text-amber-400"
                      : "bg-stone-900/50 border-stone-800/40 text-stone-400 hover:text-stone-300"
                  }`}
                  data-testid={`font-size-${s.label.toLowerCase()}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-1 border-t border-stone-800/40">
            <p className="text-[9px] text-stone-600 leading-relaxed" style={{ fontFamily: settings.bodyFont }}>
              Preview: The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
