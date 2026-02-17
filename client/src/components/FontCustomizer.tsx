import { useState, useEffect, useCallback } from "react";
import { Type, ChevronDown, RotateCcw } from "lucide-react";
import { useGame } from "@/hooks/useGameSession";

const FONT_OPTIONS = [
  { label: "Inter", value: "'Inter', sans-serif", vibe: "clean" },
  { label: "IBM Plex", value: "'IBM Plex Sans', sans-serif", vibe: "clean" },
  { label: "Outfit", value: "'Outfit', sans-serif", vibe: "clean" },
  { label: "Space Grotesk", value: "'Space Grotesk', sans-serif", vibe: "modern" },
  { label: "Exo 2", value: "'Exo 2', sans-serif", vibe: "modern" },
  { label: "Source Code", value: "'Source Code Pro', monospace", vibe: "techy" },
  { label: "Fira Code", value: "'Fira Code', monospace", vibe: "techy" },
  { label: "JetBrains", value: "'JetBrains Mono', monospace", vibe: "techy" },
  { label: "Share Tech", value: "'Share Tech Mono', monospace", vibe: "hacker" },
  { label: "VT323", value: "'VT323', monospace", vibe: "hacker" },
  { label: "Major Mono", value: "'Major Mono Display', monospace", vibe: "hacker" },
  { label: "Silkscreen", value: "'Silkscreen', monospace", vibe: "hacker" },
];

const VIBE_COLORS: Record<string, string> = {
  clean: "text-sky-400",
  modern: "text-amber-400",
  techy: "text-teal-400",
  hacker: "text-red-400",
};

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

const STYLE_ID = "atropos-font-override";

function applySettings(s: FontSettings) {
  const root = document.documentElement;
  root.style.setProperty("--font-heading", s.headingFont);
  root.style.setProperty("--font-body", s.bodyFont);
  root.style.setProperty("--font-scale", String(s.sizeScale));
  root.style.setProperty("--font-heading-weight", s.headingWeight);

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = `
    h1, h2, h3, h4, h5, h6,
    .molten-text, .font-display, .font-orbitron,
    [class*="text-3xl"], [class*="text-4xl"], [class*="text-5xl"],
    [class*="text-6xl"], [class*="text-7xl"], [class*="text-8xl"] {
      font-family: ${s.headingFont} !important;
      font-weight: ${s.headingWeight} !important;
    }
    body {
      font-family: ${s.bodyFont} !important;
      font-size: calc(1rem * ${s.sizeScale}) !important;
    }
  `;
}

export default function FontCustomizer() {
  const { gameState } = useGame();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<FontSettings>(loadSettings);

  useEffect(() => {
    applySettings(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = useCallback((patch: Partial<FontSettings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  if (!gameState?.devMode) return null;

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
        <div className="absolute bottom-12 left-0 w-72 bg-stone-950/95 border border-stone-800/60 rounded-lg shadow-2xl backdrop-blur-md p-3 space-y-3 max-h-[80vh] overflow-y-auto" data-testid="font-customizer-panel">
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

          <div className="flex items-center gap-1 text-[9px] text-stone-600">
            <span className="text-sky-400">clean</span>
            <span>→</span>
            <span className="text-amber-400">modern</span>
            <span>→</span>
            <span className="text-teal-400">techy</span>
            <span>→</span>
            <span className="text-red-400">hacker</span>
          </div>

          {["headingFont", "bodyFont"].map(target => (
            <div key={target} className="space-y-1">
              <label className="text-[10px] text-stone-500 uppercase tracking-wider">
                {target === "headingFont" ? "Headings" : "Body"}
              </label>
              <div className="flex flex-wrap gap-1">
                {FONT_OPTIONS.map(f => {
                  const isActive = settings[target as keyof FontSettings] === f.value;
                  return (
                    <button
                      key={f.value}
                      onClick={() => update({ [target]: f.value })}
                      style={{ fontFamily: f.value }}
                      className={`px-2 py-1 text-[10px] rounded border transition-all ${
                        isActive
                          ? "bg-stone-800/80 border-stone-600/80 " + VIBE_COLORS[f.vibe]
                          : "bg-stone-900/50 border-stone-800/40 text-stone-500 hover:text-stone-300 hover:border-stone-700/60"
                      }`}
                      data-testid={`font-${target === "headingFont" ? "heading" : "body"}-${f.label.toLowerCase().replace(/\s/g, '-')}`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="space-y-1">
            <label className="text-[10px] text-stone-500 uppercase tracking-wider">Weight</label>
            <div className="flex gap-1">
              {WEIGHT_OPTIONS.map(w => (
                <button
                  key={w.value}
                  onClick={() => update({ headingWeight: w.value })}
                  className={`px-2 py-1 text-[10px] rounded border transition-all ${
                    settings.headingWeight === w.value
                      ? "bg-stone-800/80 border-stone-600/80 text-amber-400"
                      : "bg-stone-900/50 border-stone-800/40 text-stone-500 hover:text-stone-300"
                  }`}
                  data-testid={`font-weight-${w.label.toLowerCase()}`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-stone-500 uppercase tracking-wider">Scale</label>
            <div className="flex gap-1">
              {SIZE_OPTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => update({ sizeScale: s.value })}
                  className={`px-3 py-1 text-[10px] rounded border transition-all ${
                    settings.sizeScale === s.value
                      ? "bg-stone-800/80 border-stone-600/80 text-amber-400"
                      : "bg-stone-900/50 border-stone-800/40 text-stone-500 hover:text-stone-300"
                  }`}
                  data-testid={`font-size-${s.label.toLowerCase()}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-stone-800/40 space-y-1">
            <p className="text-sm text-stone-400 leading-relaxed" style={{ fontFamily: settings.headingFont, fontWeight: Number(settings.headingWeight) }}>
              Heading Preview
            </p>
            <p className="text-[10px] text-stone-600 leading-relaxed" style={{ fontFamily: settings.bodyFont }}>
              Body: The quick brown fox jumps over the lazy dog. 0123456789
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
