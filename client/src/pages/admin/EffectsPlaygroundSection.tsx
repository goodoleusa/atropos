import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Eye, Wand2, Save, RotateCcw, Layers, Zap, Copy, Check, Clock, MousePointer, Globe, FileText, Play, Pause, Timer, Ghost, Shuffle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type RevealType = 'hover' | 'hold' | 'scratch' | 'tilt' | 'spotlight' | 'quantum' | 'glitch' | 'scanline';
type EffectIntensity = 'subtle' | 'medium' | 'intense';
type EffectScope = 'global' | 'page-specific';
type MouseoverBehavior = 'reveal' | 'glitch' | 'shake' | 'pulse' | 'chromatic' | 'invert' | 'scramble' | 'ghost';

interface GlitchTemplate {
  id: string;
  name: string;
  description: string;
  duration: number;
  interval: number;
  intensity: number;
  chromaticSplit: boolean;
  scanlines: boolean;
  flickerRate: number;
  distortion: number;
}

interface SubliminalReveal {
  id: string;
  name: string;
  message: string;
  duration: number;
  delay: number;
  opacity: number;
  position: 'center' | 'top' | 'bottom' | 'random';
  trigger: 'timed' | 'random' | 'scroll' | 'click';
  pages: string[];
}

interface MouseoverEffect {
  id: string;
  behavior: MouseoverBehavior;
  intensity: number;
  duration: number;
  sound?: string;
  color?: string;
}

interface PageEffect {
  pageSlug: string;
  pageName: string;
  enabled: boolean;
  effects: string[];
  subliminals: string[];
  glitchTemplates: string[];
}

interface EffectConfig {
  revealType: RevealType;
  intensity: EffectIntensity;
  glowColor: string;
  parallaxDepth: number;
  animationSpeed: number;
  blurAmount: number;
  distortionLevel: number;
  scanlineOpacity: number;
  chromaticOffset: number;
  pulseEnabled: boolean;
  particlesEnabled: boolean;
}

const DEFAULT_CONFIG: EffectConfig = {
  revealType: 'hover',
  intensity: 'medium',
  glowColor: '#d97706',
  parallaxDepth: 10,
  animationSpeed: 0.5,
  blurAmount: 4,
  distortionLevel: 0.3,
  scanlineOpacity: 0.1,
  chromaticOffset: 2,
  pulseEnabled: true,
  particlesEnabled: false,
};

const REVEAL_TYPES: { id: RevealType; name: string; desc: string }[] = [
  { id: 'hover', name: 'Hover Reveal', desc: 'Content reveals on mouse hover' },
  { id: 'hold', name: 'Hold Reveal', desc: 'Hold for 2s to reveal secret' },
  { id: 'scratch', name: 'Scratch Card', desc: 'Drag to scratch and reveal' },
  { id: 'tilt', name: 'Tilt Reveal', desc: 'Tilt device/mouse to show' },
  { id: 'spotlight', name: 'Spotlight', desc: 'Circular spotlight follows cursor' },
  { id: 'quantum', name: 'Quantum Ripple', desc: 'Probabilistic wave distortion' },
  { id: 'glitch', name: 'Glitch Effect', desc: 'Digital corruption aesthetic' },
  { id: 'scanline', name: 'Scanline', desc: 'CRT monitor effect' },
];

const CLUE_TYPES = [
  { id: 'intel', name: 'Intel Documents', icon: '📄' },
  { id: 'artifact', name: 'Artifacts', icon: '💎' },
  { id: 'secret', name: 'Secrets', icon: '🔐' },
  { id: 'trail', name: 'Trail Markers', icon: '🔍' },
  { id: 'mystical', name: 'Mystical Cards', icon: '✨' },
  { id: 'quantum', name: 'Quantum Events', icon: '⚛️' },
];

export function EffectsPlaygroundSection() {
  const [config, setConfig] = useState<EffectConfig>(DEFAULT_CONFIG);
  const [selectedClueTypes, setSelectedClueTypes] = useState<string[]>([]);
  const [previewText, setPreviewText] = useState('SECRET INTEL: Operation Midnight');
  const [savedPresets, setSavedPresets] = useState<Record<string, EffectConfig>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('effects_presets');
    if (saved) setSavedPresets(JSON.parse(saved));
    
    // Load current effectsConfig from localStorage or session
    const savedConfig = localStorage.getItem('clue_effects_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
        if (parsed.appliedTo) setSelectedClueTypes(parsed.appliedTo);
      } catch (e) {
        console.error('Failed to load saved config:', e);
      }
    }
  }, []);

  const updateConfig = <K extends keyof EffectConfig>(key: K, value: EffectConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const savePreset = (name: string) => {
    const updated = { ...savedPresets, [name]: config };
    setSavedPresets(updated);
    localStorage.setItem('effects_presets', JSON.stringify(updated));
    toast({ title: 'Preset Saved', description: `"${name}" saved successfully` });
  };

  const applyToClueTypes = async () => {
    if (selectedClueTypes.length === 0) {
      toast({ title: 'Select Clue Types', description: 'Choose which types to apply effects to', variant: 'destructive' });
      return;
    }
    const effectsConfig = { ...config, appliedTo: selectedClueTypes, updatedAt: new Date().toISOString() };
    
    // Persist to localStorage for immediate use
    localStorage.setItem('clue_effects_config', JSON.stringify(effectsConfig));
    
    // Also persist to session settings via API - fetch current settings first to merge
    try {
      const sessionToken = localStorage.getItem('session_token');
      if (sessionToken) {
        // Get current session to preserve existing settings
        const currentSession = await fetch(`/api/session`, { method: 'POST', headers: { 'Content-Type': 'application/json' } }).then(r => r.json());
        const mergedSettings = { 
          ...(currentSession?.settings || {}),
          effectsConfig 
        };
        
        await fetch(`/api/session/${sessionToken}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings: mergedSettings })
        });
      }
    } catch (error) {
      console.error('Failed to sync effects config to server:', error);
    }
    
    toast({ 
      title: 'Effects Applied', 
      description: `Applied to ${selectedClueTypes.length} clue type(s) - synced to session` 
    });
  };

  const copyConfigCode = () => {
    const code = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleClueType = (id: string) => {
    setSelectedClueTypes(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const intensityMultiplier = config.intensity === 'subtle' ? 0.5 : config.intensity === 'intense' ? 1.5 : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-orbitron text-purple-400 flex items-center gap-2">
          <Sparkles className="w-5 h-5" /> Effects Playground
        </h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setConfig(DEFAULT_CONFIG)}
            className="border-stone-600"
          >
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyConfigCode}
            className="border-purple-600 text-purple-400"
          >
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? 'Copied!' : 'Copy Config'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="configure" className="space-y-4">
        <TabsList className="bg-[#0a0500] border border-purple-900/30">
          <TabsTrigger value="configure" className="data-[state=active]:bg-purple-900/30">
            <Wand2 className="w-4 h-4 mr-2" /> Configure
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-purple-900/30">
            <Eye className="w-4 h-4 mr-2" /> Live Preview
          </TabsTrigger>
          <TabsTrigger value="apply" className="data-[state=active]:bg-purple-900/30">
            <Layers className="w-4 h-4 mr-2" /> Bulk Apply
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configure">
          <ScrollArea className="h-[calc(100vh-340px)]">
            <div className="space-y-4 pr-4">
              <Card className="bg-[#0a0500] border-purple-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-500 text-sm font-mono">Reveal Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {REVEAL_TYPES.map(type => (
                      <button
                        key={type.id}
                        onClick={() => updateConfig('revealType', type.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          config.revealType === type.id
                            ? 'border-purple-500 bg-purple-900/20'
                            : 'border-stone-700 hover:border-stone-600'
                        }`}
                      >
                        <p className="text-sm font-medium text-stone-300">{type.name}</p>
                        <p className="text-[10px] text-stone-500 mt-1">{type.desc}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0500] border-amber-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-amber-500 text-sm font-mono">Visual Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-stone-400 text-xs">Intensity</Label>
                      <Badge variant="outline" className="text-[10px]">{config.intensity}</Badge>
                    </div>
                    <div className="flex gap-2">
                      {(['subtle', 'medium', 'intense'] as EffectIntensity[]).map(level => (
                        <Button
                          key={level}
                          size="sm"
                          variant={config.intensity === level ? 'default' : 'outline'}
                          onClick={() => updateConfig('intensity', level)}
                          className={config.intensity === level ? 'bg-amber-700' : 'border-stone-600'}
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-stone-400 text-xs">Glow Color</Label>
                      <span className="text-xs text-stone-500">{config.glowColor}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={config.glowColor}
                        onChange={(e) => updateConfig('glowColor', e.target.value)}
                        className="w-10 h-10 rounded border border-stone-700 bg-transparent cursor-pointer"
                      />
                      <Input
                        value={config.glowColor}
                        onChange={(e) => updateConfig('glowColor', e.target.value)}
                        className="flex-1 bg-black/50 border-stone-700 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-stone-400 text-xs">Parallax Depth</Label>
                      <span className="text-xs text-amber-400">{config.parallaxDepth}px</span>
                    </div>
                    <Slider
                      value={[config.parallaxDepth]}
                      onValueChange={([v]) => updateConfig('parallaxDepth', v)}
                      min={0}
                      max={30}
                      step={1}
                      className="py-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-stone-400 text-xs">Animation Speed</Label>
                      <span className="text-xs text-amber-400">{config.animationSpeed}s</span>
                    </div>
                    <Slider
                      value={[config.animationSpeed]}
                      onValueChange={([v]) => updateConfig('animationSpeed', v)}
                      min={0.1}
                      max={2}
                      step={0.1}
                      className="py-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-stone-400 text-xs">Blur Amount</Label>
                      <span className="text-xs text-amber-400">{config.blurAmount}px</span>
                    </div>
                    <Slider
                      value={[config.blurAmount]}
                      onValueChange={([v]) => updateConfig('blurAmount', v)}
                      min={0}
                      max={20}
                      step={1}
                      className="py-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-stone-400 text-xs">Pulse Effect</Label>
                      <Switch
                        checked={config.pulseEnabled}
                        onCheckedChange={(v) => updateConfig('pulseEnabled', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-stone-400 text-xs">Particles</Label>
                      <Switch
                        checked={config.particlesEnabled}
                        onCheckedChange={(v) => updateConfig('particlesEnabled', v)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0500] border-teal-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-teal-500 text-sm font-mono">Advanced Effects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-stone-400 text-xs">Distortion Level</Label>
                      <span className="text-xs text-teal-400">{(config.distortionLevel * 100).toFixed(0)}%</span>
                    </div>
                    <Slider
                      value={[config.distortionLevel]}
                      onValueChange={([v]) => updateConfig('distortionLevel', v)}
                      min={0}
                      max={1}
                      step={0.05}
                      className="py-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-stone-400 text-xs">Scanline Opacity</Label>
                      <span className="text-xs text-teal-400">{(config.scanlineOpacity * 100).toFixed(0)}%</span>
                    </div>
                    <Slider
                      value={[config.scanlineOpacity]}
                      onValueChange={([v]) => updateConfig('scanlineOpacity', v)}
                      min={0}
                      max={0.5}
                      step={0.02}
                      className="py-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-stone-400 text-xs">Chromatic Offset</Label>
                      <span className="text-xs text-teal-400">{config.chromaticOffset}px</span>
                    </div>
                    <Slider
                      value={[config.chromaticOffset]}
                      onValueChange={([v]) => updateConfig('chromaticOffset', v)}
                      min={0}
                      max={10}
                      step={0.5}
                      className="py-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="preview">
          <ScrollArea className="h-[calc(100vh-340px)]">
            <div className="space-y-4 pr-4">
              <Card className="bg-[#0a0500] border-purple-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-500 text-sm font-mono flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Live Preview
                    <Badge className="bg-green-900/50 text-green-400 text-[10px]">LIVE</Badge>
                  </CardTitle>
                  <CardDescription className="text-stone-500 text-xs">
                    Hover/interact with the preview to see the effect
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Label className="text-stone-400 text-xs">Preview Text</Label>
                    <Input
                      value={previewText}
                      onChange={(e) => setPreviewText(e.target.value)}
                      className="mt-1 bg-black/50 border-stone-700"
                    />
                  </div>

                  <div className="relative min-h-[200px] bg-black/50 rounded-lg border border-stone-700 flex items-center justify-center overflow-hidden">
                    <LivePreviewCard config={config} text={previewText} intensityMultiplier={intensityMultiplier} />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-[#0a0500] border-stone-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-stone-400 text-xs font-mono">Current Config</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-[10px] text-stone-500 overflow-auto max-h-32">
                      {JSON.stringify(config, null, 2)}
                    </pre>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0500] border-stone-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-stone-400 text-xs font-mono">Save Preset</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Preset name..."
                        className="bg-black/50 border-stone-600 text-xs"
                        id="preset-name"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => {
                          const name = (document.getElementById('preset-name') as HTMLInputElement)?.value;
                          if (name) savePreset(name);
                        }}
                        className="bg-purple-700"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    </div>
                    {Object.keys(savedPresets).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.keys(savedPresets).map(name => (
                          <Badge 
                            key={name} 
                            variant="outline" 
                            className="text-[10px] cursor-pointer hover:bg-purple-900/30"
                            onClick={() => setConfig(savedPresets[name])}
                          >
                            {name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="apply">
          <ScrollArea className="h-[calc(100vh-340px)]">
            <div className="space-y-4 pr-4">
              <Card className="bg-[#0a0500] border-amber-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Select Clue Types
                  </CardTitle>
                  <CardDescription className="text-stone-500 text-xs">
                    Choose which clue types should use this effect configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CLUE_TYPES.map(type => (
                      <button
                        key={type.id}
                        onClick={() => toggleClueType(type.id)}
                        className={`p-3 rounded-lg border flex items-center gap-2 transition-all ${
                          selectedClueTypes.includes(type.id)
                            ? 'border-amber-500 bg-amber-900/20'
                            : 'border-stone-700 hover:border-stone-600'
                        }`}
                      >
                        <span className="text-xl">{type.icon}</span>
                        <span className="text-sm text-stone-300">{type.name}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0500] border-purple-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-500 text-sm font-mono">Effect Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between p-2 bg-black/30 rounded">
                      <span className="text-stone-500">Reveal Type:</span>
                      <span className="text-purple-400">{config.revealType}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-black/30 rounded">
                      <span className="text-stone-500">Intensity:</span>
                      <span className="text-amber-400">{config.intensity}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-black/30 rounded">
                      <span className="text-stone-500">Parallax:</span>
                      <span className="text-teal-400">{config.parallaxDepth}px</span>
                    </div>
                    <div className="flex justify-between p-2 bg-black/30 rounded">
                      <span className="text-stone-500">Animation:</span>
                      <span className="text-teal-400">{config.animationSpeed}s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={applyToClueTypes}
                disabled={selectedClueTypes.length === 0}
                className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-6"
              >
                <Zap className="w-5 h-5 mr-2" />
                Apply to {selectedClueTypes.length} Clue Type(s)
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LivePreviewCard({ config, text, intensityMultiplier }: { config: EffectConfig; text: string; intensityMultiplier: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding && config.revealType === 'hold') {
      interval = setInterval(() => {
        setHoldProgress(prev => Math.min(prev + 5, 100));
      }, 100);
    } else {
      setHoldProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHolding, config.revealType]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const isRevealed = config.revealType === 'hover' ? isHovered : 
                     config.revealType === 'hold' ? holdProgress >= 100 : true;

  const glowStyle = {
    boxShadow: isHovered ? `0 0 ${20 * intensityMultiplier}px ${config.glowColor}40, 0 0 ${40 * intensityMultiplier}px ${config.glowColor}20` : 'none',
    transition: `all ${config.animationSpeed}s ease`,
  };

  const transformStyle = {
    transform: config.revealType === 'tilt' 
      ? `perspective(500px) rotateY(${(mousePos.x - 0.5) * 20 * intensityMultiplier}deg) rotateX(${(0.5 - mousePos.y) * 20 * intensityMultiplier}deg)`
      : 'none',
  };

  return (
    <motion.div
      className="relative p-6 rounded-lg cursor-pointer select-none"
      style={{ ...glowStyle, ...transformStyle }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsHolding(false); }}
      onMouseMove={handleMouseMove}
      onMouseDown={() => setIsHolding(true)}
      onMouseUp={() => setIsHolding(false)}
      animate={config.pulseEnabled && isHovered ? {
        scale: [1, 1.02, 1],
      } : {}}
      transition={{ duration: config.animationSpeed, repeat: config.pulseEnabled ? Infinity : 0 }}
    >
      {config.revealType === 'spotlight' && isHovered && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle 60px at ${mousePos.x * 100}% ${mousePos.y * 100}%, transparent 0%, black 100%)`,
          }}
        />
      )}

      {config.revealType === 'scanline' && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,${config.scanlineOpacity}) 2px, rgba(0,0,0,${config.scanlineOpacity}) 4px)`,
          }}
        />
      )}

      {config.revealType === 'quantum' && isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${config.glowColor}30 0%, transparent 50%)`,
              `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${config.glowColor}50 0%, transparent 70%)`,
              `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${config.glowColor}30 0%, transparent 50%)`,
            ],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      {config.revealType === 'hold' && (
        <div className="absolute bottom-2 left-2 right-2 h-1 bg-stone-800 rounded overflow-hidden">
          <motion.div 
            className="h-full bg-amber-500"
            animate={{ width: `${holdProgress}%` }}
          />
        </div>
      )}

      <AnimatePresence>
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, filter: `blur(${config.blurAmount}px)` }}
          animate={{ 
            opacity: isRevealed ? 1 : 0.3,
            filter: isRevealed ? 'blur(0px)' : `blur(${config.blurAmount}px)`,
          }}
          transition={{ duration: config.animationSpeed }}
        >
          {config.revealType === 'glitch' && isHovered ? (
            <div className="relative">
              <span 
                className="absolute text-red-500 font-mono text-lg font-bold"
                style={{ transform: `translate(${config.chromaticOffset}px, 0)` }}
              >
                {text}
              </span>
              <span 
                className="absolute text-blue-500 font-mono text-lg font-bold"
                style={{ transform: `translate(-${config.chromaticOffset}px, 0)` }}
              >
                {text}
              </span>
              <span className="relative text-white font-mono text-lg font-bold">{text}</span>
            </div>
          ) : (
            <span 
              className="font-mono text-lg font-bold"
              style={{ color: config.glowColor }}
            >
              {text}
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      {config.particlesEnabled && isHovered && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ backgroundColor: config.glowColor }}
              initial={{ 
                x: mousePos.x * 100 + '%', 
                y: mousePos.y * 100 + '%',
                opacity: 1 
              }}
              animate={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                opacity: 0,
              }}
              transition={{ duration: 1, delay: i * 0.1 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
