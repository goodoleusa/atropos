import { useState, useEffect, useMemo } from "react";
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
import { Sparkles, Eye, Wand2, Save, RotateCcw, Layers, Zap, Copy, Check, Flame, Monitor, MousePointer, Globe, Paintbrush, Power } from "lucide-react";
import { MoltenWrapper, MoltenText, SlagParticles, MOLTEN_PRESETS, type MoltenEffect } from "@/components/MoltenEffects";
import { LightFilters, FILTER_PRESETS } from "@/components/LightFilters";
import { SubliminalOverlay, VideoOverlay, SUBLIMINAL_PRESETS, VIDEO_OVERLAY_PRESETS, type SubliminalMode } from "@/components/SubliminalEffects";
import { useGlobalEffects, EFFECT_PRESETS, type GlobalEffectsConfig } from "@/hooks/useGlobalEffects";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type RevealType = 'hover' | 'hold' | 'scratch' | 'tilt' | 'spotlight' | 'quantum' | 'glitch' | 'scanline';
type EffectIntensity = 'subtle' | 'medium' | 'intense';

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
  const [moltenEffect, setMoltenEffect] = useState<MoltenEffect>("ember-glow");
  const [moltenIntensity, setMoltenIntensity] = useState(0.5);
  const [moltenTextEffect, setMoltenTextEffect] = useState<"molten-text" | "cooling-metal" | "none">("molten-text");
  const [lightFilter, setLightFilter] = useState<"vignette" | "film-grain" | "scan-lines" | "warm-glow" | "cool-fade" | "none">("vignette");
  const [lightIntensity, setLightIntensity] = useState(0.25);
  const [showParticles, setShowParticles] = useState(false);
  const [subliminalMode, setSubliminalMode] = useState<SubliminalMode>("subtle");
  const [videoOverlay, setVideoOverlay] = useState<"cyberpunk" | "vhs" | "film" | "clean">("cyberpunk");
  const [videoIntensity, setVideoIntensity] = useState(0.4);

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
        <h3 className="text-lg font-orbitron text-purple-700 flex items-center gap-2">
          <Sparkles className="w-5 h-5" /> Effects Playground
        </h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setConfig(DEFAULT_CONFIG)}
            className="border-muted"
          >
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyConfigCode}
            className="border-purple-600 text-purple-700"
          >
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? 'Copied!' : 'Copy Config'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="configure" className="space-y-4">
        <TabsList className="bg-[hsl(var(--card))] border border-purple-900/30">
          <TabsTrigger value="configure" className="data-[state=active]:bg-purple-900/30">
            <Wand2 className="w-4 h-4 mr-2" /> Configure
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-purple-900/30">
            <Eye className="w-4 h-4 mr-2" /> Live Preview
          </TabsTrigger>
          <TabsTrigger value="apply" className="data-[state=active]:bg-purple-900/30">
            <Layers className="w-4 h-4 mr-2" /> Bulk Apply
          </TabsTrigger>
          <TabsTrigger value="molten" className="data-[state=active]:bg-amber-900/30">
            <Flame className="w-4 h-4 mr-2" /> Molten Effects
          </TabsTrigger>
          <TabsTrigger value="global" className="data-[state=active]:bg-teal-900/30">
            <Globe className="w-4 h-4 mr-2" /> Global Site FX
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configure">
          <ScrollArea className="h-[calc(100vh-340px)]">
            <div className="space-y-4 pr-4">
              <Card className="bg-[hsl(var(--card))] border-purple-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-700 text-sm font-mono">Reveal Type</CardTitle>
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
                            : 'border-border hover:border-muted'
                        }`}
                      >
                        <p className="text-sm font-medium text-foreground">{type.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{type.desc}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[hsl(var(--card))] border-amber-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-amber-800 text-sm font-mono">Visual Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-muted-foreground text-xs">Intensity</Label>
                      <Badge variant="outline" className="text-[10px]">{config.intensity}</Badge>
                    </div>
                    <div className="flex gap-2">
                      {(['subtle', 'medium', 'intense'] as EffectIntensity[]).map(level => (
                        <Button
                          key={level}
                          size="sm"
                          variant={config.intensity === level ? 'default' : 'outline'}
                          onClick={() => updateConfig('intensity', level)}
                          className={config.intensity === level ? 'bg-amber-700' : 'border-muted'}
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-muted-foreground text-xs">Glow Color</Label>
                      <span className="text-xs text-muted-foreground">{config.glowColor}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={config.glowColor}
                        onChange={(e) => updateConfig('glowColor', e.target.value)}
                        className="w-10 h-10 rounded border border-border bg-transparent cursor-pointer"
                      />
                      <Input
                        value={config.glowColor}
                        onChange={(e) => updateConfig('glowColor', e.target.value)}
                        className="flex-1 bg-black/50 border-border font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-muted-foreground text-xs">Parallax Depth</Label>
                      <span className="text-xs text-amber-800">{config.parallaxDepth}px</span>
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
                      <Label className="text-muted-foreground text-xs">Animation Speed</Label>
                      <span className="text-xs text-amber-800">{config.animationSpeed}s</span>
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
                      <Label className="text-muted-foreground text-xs">Blur Amount</Label>
                      <span className="text-xs text-amber-800">{config.blurAmount}px</span>
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
                      <Label className="text-muted-foreground text-xs">Pulse Effect</Label>
                      <Switch
                        checked={config.pulseEnabled}
                        onCheckedChange={(v) => updateConfig('pulseEnabled', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground text-xs">Particles</Label>
                      <Switch
                        checked={config.particlesEnabled}
                        onCheckedChange={(v) => updateConfig('particlesEnabled', v)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[hsl(var(--card))] border-teal-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-teal-800 text-sm font-mono">Advanced Effects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-muted-foreground text-xs">Distortion Level</Label>
                      <span className="text-xs text-teal-800">{(config.distortionLevel * 100).toFixed(0)}%</span>
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
                      <Label className="text-muted-foreground text-xs">Scanline Opacity</Label>
                      <span className="text-xs text-teal-800">{(config.scanlineOpacity * 100).toFixed(0)}%</span>
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
                      <Label className="text-muted-foreground text-xs">Chromatic Offset</Label>
                      <span className="text-xs text-teal-800">{config.chromaticOffset}px</span>
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
              <Card className="bg-[hsl(var(--card))] border-purple-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-700 text-sm font-mono flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Live Preview
                    <Badge className="bg-green-900/50 text-green-400 text-[10px]">LIVE</Badge>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    Hover/interact with the preview to see the effect
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Label className="text-muted-foreground text-xs">Preview Text</Label>
                    <Input
                      value={previewText}
                      onChange={(e) => setPreviewText(e.target.value)}
                      className="mt-1 bg-black/50 border-border"
                    />
                  </div>

                  <div className="relative min-h-[200px] bg-black/50 rounded-lg border border-border flex items-center justify-center overflow-hidden">
                    <LivePreviewCard config={config} text={previewText} intensityMultiplier={intensityMultiplier} />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-[hsl(var(--card))] border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-xs font-mono">Current Config</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-[10px] text-muted-foreground overflow-auto max-h-32">
                      {JSON.stringify(config, null, 2)}
                    </pre>
                  </CardContent>
                </Card>

                <Card className="bg-[hsl(var(--card))] border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-xs font-mono">Save Preset</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Preset name..."
                        className="bg-black/50 border-muted text-xs"
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
              <Card className="bg-[hsl(var(--card))] border-amber-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-amber-800 text-sm font-mono flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Select Clue Types
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
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
                            : 'border-border hover:border-muted'
                        }`}
                      >
                        <span className="text-xl">{type.icon}</span>
                        <span className="text-sm text-foreground">{type.name}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[hsl(var(--card))] border-purple-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-700 text-sm font-mono">Effect Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between p-2 bg-black/30 rounded">
                      <span className="text-muted-foreground">Reveal Type:</span>
                      <span className="text-purple-700">{config.revealType}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-black/30 rounded">
                      <span className="text-muted-foreground">Intensity:</span>
                      <span className="text-amber-800">{config.intensity}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-black/30 rounded">
                      <span className="text-muted-foreground">Parallax:</span>
                      <span className="text-teal-800">{config.parallaxDepth}px</span>
                    </div>
                    <div className="flex justify-between p-2 bg-black/30 rounded">
                      <span className="text-muted-foreground">Animation:</span>
                      <span className="text-teal-800">{config.animationSpeed}s</span>
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

        <TabsContent value="molten">
          <ScrollArea className="h-[calc(100vh-340px)]">
            <div className="space-y-6 pr-4">
              <Card className="bg-[hsl(var(--card))] border-amber-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-amber-800 text-sm font-mono">Border & Container Effects</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">Apply to cards, buttons, and containers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(["flowing-border", "ember-glow", "heat-shimmer", "forge-pulse", "crucible-ripple", "none"] as MoltenEffect[]).map((effect) => (
                      <button
                        key={effect}
                        onClick={() => setMoltenEffect(effect)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          moltenEffect === effect
                            ? 'border-amber-500 bg-amber-900/20'
                            : 'border-border hover:border-muted'
                        }`}
                      >
                        <p className="text-xs font-medium text-foreground capitalize">{effect.replace("-", " ")}</p>
                      </button>
                    ))}
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-muted-foreground text-xs">Intensity</Label>
                      <span className="text-xs text-amber-800">{(moltenIntensity * 100).toFixed(0)}%</span>
                    </div>
                    <Slider
                      value={[moltenIntensity]}
                      onValueChange={([v]) => setMoltenIntensity(v)}
                      min={0.1}
                      max={1}
                      step={0.1}
                      className="py-2"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground text-xs">Slag Particles</Label>
                    <Switch checked={showParticles} onCheckedChange={setShowParticles} />
                  </div>

                  <div className="pt-4">
                    <p className="text-muted-foreground text-xs mb-2">Preview:</p>
                    <MoltenWrapper effect={moltenEffect} intensity={moltenIntensity} className="rounded-lg">
                      <div className="bg-[hsl(var(--card))] border border-border rounded-lg p-6 text-center relative">
                        {showParticles && <SlagParticles count={6} />}
                        <p className="text-amber-800 font-mono">Sample Container</p>
                        <p className="text-muted-foreground text-xs mt-1">With {moltenEffect} effect</p>
                      </div>
                    </MoltenWrapper>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[hsl(var(--card))] border-amber-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-amber-800 text-sm font-mono">Text Effects</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">Apply to headings and labels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {(["molten-text", "cooling-metal", "none"] as const).map((effect) => (
                      <button
                        key={effect}
                        onClick={() => setMoltenTextEffect(effect)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          moltenTextEffect === effect
                            ? 'border-amber-500 bg-amber-900/20'
                            : 'border-border hover:border-muted'
                        }`}
                      >
                        <p className="text-xs font-medium text-foreground capitalize">{effect.replace("-", " ")}</p>
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 text-center">
                    <MoltenText effect={moltenTextEffect} intensity={moltenIntensity} as="h2" className="text-2xl font-orbitron text-amber-800">
                      MOLTEN HEADER
                    </MoltenText>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[hsl(var(--card))] border-purple-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-700 text-sm font-mono">Subliminal Overlay</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">Global page effects - glitches, scanlines, messages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(["off", "subtle", "moderate", "intense"] as SubliminalMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSubliminalMode(mode)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          subliminalMode === mode
                            ? 'border-purple-500 bg-purple-900/20'
                            : 'border-border hover:border-muted'
                        }`}
                      >
                        <p className="text-xs font-medium text-foreground capitalize">{mode}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Adds occasional glitch frames and subliminal text flashes</p>
                </CardContent>
              </Card>

              <Card className="bg-[hsl(var(--card))] border-teal-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-teal-800 text-sm font-mono">Video Overlay</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">For hero video sections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(["clean", "cyberpunk", "vhs", "film"] as const).map((variant) => (
                      <button
                        key={variant}
                        onClick={() => setVideoOverlay(variant)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          videoOverlay === variant
                            ? 'border-teal-500 bg-teal-900/20'
                            : 'border-border hover:border-muted'
                        }`}
                      >
                        <p className="text-xs font-medium text-foreground capitalize">{variant}</p>
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-muted-foreground text-xs">Intensity</Label>
                      <span className="text-xs text-teal-800">{(videoIntensity * 100).toFixed(0)}%</span>
                    </div>
                    <Slider
                      value={[videoIntensity]}
                      onValueChange={([v]) => setVideoIntensity(v)}
                      min={0.1}
                      max={0.8}
                      step={0.1}
                      className="py-2"
                    />
                  </div>

                  <div className="pt-4 relative h-32 bg-gradient-to-br from-card to-border rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">Video Preview Area</div>
                    <VideoOverlay variant={videoOverlay} intensity={videoIntensity} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[hsl(var(--card))] border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-muted-foreground text-sm font-mono">Light Filters</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">Global page filters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(["vignette", "film-grain", "scan-lines", "warm-glow", "cool-fade", "none"] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setLightFilter(filter)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          lightFilter === filter
                            ? 'border-muted bg-border/50'
                            : 'border-border hover:border-muted'
                        }`}
                      >
                        <p className="text-xs font-medium text-foreground capitalize">{filter.replace("-", " ")}</p>
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <Label className="text-muted-foreground text-xs">Intensity</Label>
                      <span className="text-xs text-muted-foreground">{(lightIntensity * 100).toFixed(0)}%</span>
                    </div>
                    <Slider
                      value={[lightIntensity]}
                      onValueChange={([v]) => setLightIntensity(v)}
                      min={0.1}
                      max={0.6}
                      step={0.05}
                      className="py-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="bg-amber-900/10 border border-amber-900/30 rounded-lg p-4">
                <h4 className="text-amber-800 font-mono text-sm mb-2">Usage Examples</h4>
                <pre className="text-[10px] text-muted-foreground overflow-x-auto">
{`// Border effect on a card
<MoltenWrapper effect="${moltenEffect}" intensity={${moltenIntensity}}>
  <Card>...</Card>
</MoltenWrapper>

// Text effect
<MoltenText effect="${moltenTextEffect}" as="h1">
  Title
</MoltenText>

// Video overlay
<VideoOverlay variant="${videoOverlay}" intensity={${videoIntensity}} />

// Global subliminal (wrap App or page)
<SubliminalOverlay config={{ mode: "${subliminalMode}" }}>
  <App />
</SubliminalOverlay>`}
                </pre>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="global">
          <GlobalSiteFXTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EffectPreviewBox({ children, label, active }: { children: React.ReactNode; label: string; active: boolean }) {
  return (
    <div className={`relative rounded-lg border overflow-hidden h-24 ${active ? 'border-amber-700/60' : 'border-border'}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-card to-card">
        <div className="absolute inset-0 flex items-center justify-center gap-3 p-3">
          <div className="w-10 h-10 rounded border border-border bg-border/50" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2 bg-border/50 rounded w-3/4" />
            <div className="h-2 bg-border/30 rounded w-1/2" />
            <div className="h-1.5 bg-border/20 rounded w-2/3" />
          </div>
        </div>
      </div>
      {active && children}
      <div className="absolute bottom-1 left-2">
        <span className={`text-[9px] font-mono ${active ? 'text-amber-800' : 'text-muted-foreground'}`}>{label}</span>
      </div>
      {!active && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="text-[10px] text-muted-foreground font-mono">OFF</span>
        </div>
      )}
    </div>
  );
}

function TimingSlider({ label, value, onChange, min, max, step, unit }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; unit: string;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <Label className="text-muted-foreground text-[10px]">{label}</Label>
        <span className="text-[10px] text-muted-foreground font-mono">{value}{unit}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} className="py-1" />
    </div>
  );
}

function GlobalSiteFXTab() {
  const { config: gfx, updateConfig: setGfx, applyPreset, saveToServer } = useGlobalEffects();
  const [saving, setSaving] = useState(false);
  const [previewGlitch, setPreviewGlitch] = useState(false);
  const [previewFlicker, setPreviewFlicker] = useState(false);
  const [previewFlash, setPreviewFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!gfx.glitch) { setPreviewGlitch(false); return; }
    const id = setInterval(() => {
      if (Math.random() < gfx.glitchFrequency) {
        setPreviewGlitch(true);
        setTimeout(() => setPreviewGlitch(false), gfx.glitchDurationMs || 100);
      }
    }, gfx.glitchIntervalMs || 2000);
    return () => clearInterval(id);
  }, [gfx.glitch, gfx.glitchFrequency, gfx.glitchIntervalMs, gfx.glitchDurationMs]);

  useEffect(() => {
    if (!gfx.flickerEnabled) { setPreviewFlicker(false); return; }
    const id = setInterval(() => {
      if (Math.random() < 0.3) {
        setPreviewFlicker(true);
        setTimeout(() => setPreviewFlicker(false), gfx.flickerDurationMs || 50);
      }
    }, gfx.flickerIntervalMs || 800);
    return () => clearInterval(id);
  }, [gfx.flickerEnabled, gfx.flickerIntervalMs, gfx.flickerDurationMs]);

  useEffect(() => {
    if (!gfx.subliminalFlashes || gfx.subliminalMessages.length === 0) { setPreviewFlash(null); return; }
    const id = setInterval(() => {
      const msg = gfx.subliminalMessages[Math.floor(Math.random() * gfx.subliminalMessages.length)];
      setPreviewFlash(msg);
      setTimeout(() => setPreviewFlash(null), gfx.subliminalDurationMs || 100);
    }, gfx.subliminalIntervalMs || 5000);
    return () => clearInterval(id);
  }, [gfx.subliminalFlashes, gfx.subliminalMessages, gfx.subliminalIntervalMs, gfx.subliminalDurationMs]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveToServer();
      toast({ title: "Effects saved", description: "Global effects configuration saved to server." });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
    setSaving(false);
  };

  const presetNames = Object.keys(EFFECT_PRESETS);

  return (
    <ScrollArea className="h-[calc(100vh-340px)]">
      <div className="space-y-4 pr-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Switch
              data-testid="toggle-global-fx"
              checked={gfx.enabled}
              onCheckedChange={(v) => setGfx({ enabled: v })}
            />
            <span className={`text-sm font-mono ${gfx.enabled ? "text-teal-800" : "text-muted-foreground"}`}>
              {gfx.enabled ? "ACTIVE" : "DISABLED"}
            </span>
          </div>
          <Button
            data-testid="save-global-fx"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-teal-700 hover:bg-teal-600"
          >
            <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save to Server"}
          </Button>
        </div>

        <Card className="bg-[hsl(var(--card))] border-teal-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-teal-800 text-sm font-mono flex items-center gap-2">
              <Paintbrush className="w-4 h-4" /> Presets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presetNames.map((name) => (
                <button
                  key={name}
                  data-testid={`preset-${name}`}
                  onClick={() => applyPreset(name)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    gfx.preset === name
                      ? "border-teal-500 bg-teal-900/20"
                      : "border-border hover:border-muted"
                  }`}
                >
                  <p className="text-xs font-medium text-foreground capitalize">
                    {name.replace(/_/g, " ")}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(var(--card))] border-amber-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-800 text-sm font-mono flex items-center gap-2">
              <Monitor className="w-4 h-4" /> Screen Overlays
            </CardTitle>
            <CardDescription className="text-muted-foreground text-[10px]">These effects layer over the entire page. Previews below show each one in isolation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <EffectPreviewBox label="Scanlines" active={gfx.scanlines}>
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,${gfx.scanlineOpacity}) 2px, rgba(0,0,0,${gfx.scanlineOpacity}) 4px)`,
                }} />
              </EffectPreviewBox>
              <EffectPreviewBox label="Vignette" active={gfx.vignette}>
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: `radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,${gfx.vignetteIntensity * 0.6}) 60%, rgba(0,0,0,${gfx.vignetteIntensity}) 100%)`,
                }} />
              </EffectPreviewBox>
              <EffectPreviewBox label="CRT" active={gfx.crt}>
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)`,
                  boxShadow: `inset 0 0 ${gfx.crtCurvature * 4}px rgba(0,0,0,0.4)`,
                  borderRadius: `${gfx.crtCurvature}px`,
                }} />
              </EffectPreviewBox>
              <EffectPreviewBox label="Warm Glow" active={gfx.warmGlow}>
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: `radial-gradient(ellipse at 50% 0%, rgba(184,115,51,${gfx.warmGlowIntensity}) 0%, transparent 60%)`,
                }} />
              </EffectPreviewBox>
              <EffectPreviewBox label="Noise" active={gfx.noise}>
                <div className="absolute inset-0 pointer-events-none" style={{
                  opacity: Math.min(gfx.noiseOpacity * 8, 0.5),
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }} />
              </EffectPreviewBox>
              <EffectPreviewBox label="Chromatic" active={gfx.chromaticAberration}>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 mix-blend-screen" style={{ background: 'rgba(255,0,0,0.06)', transform: `translateX(${gfx.chromaticOffset}px)` }} />
                  <div className="absolute inset-0 mix-blend-screen" style={{ background: 'rgba(0,255,255,0.06)', transform: `translateX(-${gfx.chromaticOffset}px)` }} />
                </div>
              </EffectPreviewBox>
              <EffectPreviewBox label="Glitch" active={gfx.glitch}>
                {previewGlitch && (
                  <div className="absolute inset-0 pointer-events-none" style={{ opacity: gfx.glitchIntensity }}>
                    <div className="absolute inset-0" style={{
                      background: `linear-gradient(${Math.random() * 360}deg, transparent 40%, rgba(184,115,51,0.1) 50%, transparent 60%)`,
                    }} />
                    <div className="absolute h-[2px] w-full bg-amber-700/30" style={{ top: `${Math.random() * 100}%` }} />
                  </div>
                )}
              </EffectPreviewBox>
              <EffectPreviewBox label="Flicker" active={gfx.flickerEnabled}>
                {previewFlicker && <div className="absolute inset-0 bg-black/30 pointer-events-none" />}
              </EffectPreviewBox>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-xs">Scanlines</Label>
                <Switch checked={gfx.scanlines} onCheckedChange={(v) => setGfx({ scanlines: v })} />
              </div>
              <TimingSlider label="Opacity" value={gfx.scanlineOpacity} onChange={(v) => setGfx({ scanlineOpacity: v })} min={0.01} max={0.15} step={0.01} unit="" />

              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-xs">Vignette</Label>
                <Switch checked={gfx.vignette} onCheckedChange={(v) => setGfx({ vignette: v })} />
              </div>
              <TimingSlider label="Intensity" value={gfx.vignetteIntensity} onChange={(v) => setGfx({ vignetteIntensity: v })} min={0.1} max={0.8} step={0.05} unit="" />

              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-xs">CRT Curvature</Label>
                <Switch checked={gfx.crt} onCheckedChange={(v) => setGfx({ crt: v })} />
              </div>
              <TimingSlider label="Curvature" value={gfx.crtCurvature} onChange={(v) => setGfx({ crtCurvature: v })} min={1} max={10} step={1} unit="px" />

              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-xs">Chromatic Aberration</Label>
                <Switch checked={gfx.chromaticAberration} onCheckedChange={(v) => setGfx({ chromaticAberration: v })} />
              </div>
              <TimingSlider label="Offset" value={gfx.chromaticOffset} onChange={(v) => setGfx({ chromaticOffset: v })} min={0.5} max={5} step={0.5} unit="px" />

              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-xs">Warm Glow</Label>
                <Switch checked={gfx.warmGlow} onCheckedChange={(v) => setGfx({ warmGlow: v })} />
              </div>
              <TimingSlider label="Intensity" value={gfx.warmGlowIntensity} onChange={(v) => setGfx({ warmGlowIntensity: v })} min={0.05} max={0.4} step={0.05} unit="" />

              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-xs">Film Noise</Label>
                <Switch checked={gfx.noise} onCheckedChange={(v) => setGfx({ noise: v })} />
              </div>
              <TimingSlider label="Opacity" value={gfx.noiseOpacity} onChange={(v) => setGfx({ noiseOpacity: v })} min={0.005} max={0.08} step={0.005} unit="" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(var(--card))] border-red-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-700 text-sm font-mono flex items-center gap-2">
              <Zap className="w-4 h-4" /> Timed Effects
            </CardTitle>
            <CardDescription className="text-muted-foreground text-[10px]">
              These effects fire on timers. Adjust interval (how often), duration (how long each burst lasts), and probability.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="border border-border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground text-xs font-mono">Glitch Effects</Label>
                <Switch checked={gfx.glitch} onCheckedChange={(v) => setGfx({ glitch: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TimingSlider label="Check Interval" value={gfx.glitchIntervalMs || 2000} onChange={(v) => setGfx({ glitchIntervalMs: v })} min={200} max={10000} step={100} unit="ms" />
                <TimingSlider label="Burst Duration" value={gfx.glitchDurationMs || 100} onChange={(v) => setGfx({ glitchDurationMs: v })} min={20} max={500} step={10} unit="ms" />
                <TimingSlider label="Probability" value={gfx.glitchFrequency} onChange={(v) => setGfx({ glitchFrequency: v })} min={0.01} max={0.2} step={0.01} unit="" />
                <TimingSlider label="Intensity" value={gfx.glitchIntensity} onChange={(v) => setGfx({ glitchIntensity: v })} min={0.1} max={1} step={0.1} unit="" />
              </div>
              <div className="relative h-12 rounded border border-border overflow-hidden bg-gradient-to-r from-card to-card">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    fires every {gfx.glitchIntervalMs || 2000}ms for {gfx.glitchDurationMs || 100}ms
                  </span>
                </div>
                {previewGlitch && (
                  <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: gfx.glitchIntensity }} exit={{ opacity: 0 }}>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent 30%, rgba(184,115,51,0.15) 50%, transparent 70%)' }} />
                    <div className="absolute h-[2px] w-full bg-amber-600/40" style={{ top: '30%' }} />
                    <div className="absolute h-[1px] w-full bg-amber-500/20" style={{ top: '65%' }} />
                  </motion.div>
                )}
              </div>
            </div>

            <div className="border border-border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground text-xs font-mono">Subliminal Flashes</Label>
                <Switch checked={gfx.subliminalFlashes} onCheckedChange={(v) => setGfx({ subliminalFlashes: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TimingSlider label="Flash Interval" value={gfx.subliminalIntervalMs || 5000} onChange={(v) => setGfx({ subliminalIntervalMs: v })} min={1000} max={30000} step={500} unit="ms" />
                <TimingSlider label="Flash Duration" value={gfx.subliminalDurationMs || 100} onChange={(v) => setGfx({ subliminalDurationMs: v })} min={30} max={500} step={10} unit="ms" />
              </div>
              <div className="relative h-12 rounded border border-border overflow-hidden bg-gradient-to-r from-card to-card">
                <div className="absolute inset-0 flex items-center justify-center">
                  {previewFlash ? (
                    <span className="text-lg font-black text-amber-800/30 tracking-widest font-mono blur-[0.5px]">{previewFlash}</span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-mono">flash every {gfx.subliminalIntervalMs || 5000}ms for {gfx.subliminalDurationMs || 100}ms</span>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-[10px] mb-1 block">Messages (comma-separated)</Label>
                <Input
                  value={gfx.subliminalMessages.join(", ")}
                  onChange={(e) => setGfx({ subliminalMessages: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  className="bg-black/30 border-border text-xs text-foreground"
                  placeholder="LOOK CLOSER, 0xDEAD, THE SIGNAL"
                />
              </div>
            </div>

            <div className="border border-border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground text-xs font-mono">Screen Flicker</Label>
                <Switch checked={gfx.flickerEnabled} onCheckedChange={(v) => setGfx({ flickerEnabled: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TimingSlider label="Flicker Interval" value={gfx.flickerIntervalMs || 800} onChange={(v) => setGfx({ flickerIntervalMs: v })} min={100} max={5000} step={50} unit="ms" />
                <TimingSlider label="Dim Duration" value={gfx.flickerDurationMs || 50} onChange={(v) => setGfx({ flickerDurationMs: v })} min={10} max={200} step={5} unit="ms" />
              </div>
              <div className="relative h-12 rounded border border-border overflow-hidden bg-gradient-to-r from-card to-card">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground font-mono">dims every {gfx.flickerIntervalMs || 800}ms for {gfx.flickerDurationMs || 50}ms</span>
                </div>
                {previewFlicker && <div className="absolute inset-0 bg-black/30 pointer-events-none" />}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(var(--card))] border-purple-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-700 text-sm font-mono flex items-center gap-2">
              <MousePointer className="w-4 h-4" /> Cursor Effects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-xs">Cursor Glow</Label>
                <Switch checked={gfx.cursorGlow} onCheckedChange={(v) => setGfx({ cursorGlow: v })} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground text-[10px]">Color</Label>
                  <Input
                    type="color"
                    value={gfx.cursorGlowColor}
                    onChange={(e) => setGfx({ cursorGlowColor: e.target.value })}
                    className="w-8 h-6 p-0 border-0"
                  />
                  <span className="text-[10px] text-muted-foreground">{gfx.cursorGlowColor}</span>
                </div>
                <TimingSlider label="Size" value={gfx.cursorGlowSize} onChange={(v) => setGfx({ cursorGlowSize: v })} min={50} max={400} step={10} unit="px" />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-xs">Cursor Trail</Label>
                <Switch checked={gfx.cursorTrail} onCheckedChange={(v) => setGfx({ cursorTrail: v })} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground text-[10px]">Color</Label>
                  <Input
                    type="color"
                    value={gfx.cursorTrailColor}
                    onChange={(e) => setGfx({ cursorTrailColor: e.target.value })}
                    className="w-8 h-6 p-0 border-0"
                  />
                </div>
                <TimingSlider label="Length" value={gfx.cursorTrailLength} onChange={(v) => setGfx({ cursorTrailLength: v })} min={5} max={50} step={5} unit="" />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-xs">Click Ripples</Label>
                <Switch checked={gfx.cursorRipple} onCheckedChange={(v) => setGfx({ cursorRipple: v })} />
              </div>
              <TimingSlider label="Ripple Duration" value={gfx.cursorRippleDurationMs || 800} onChange={(v) => setGfx({ cursorRippleDurationMs: v })} min={200} max={2000} step={50} unit="ms" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(var(--card))] border-teal-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-teal-800 text-sm font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Background Effects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-xs">Particles</Label>
                <Switch checked={gfx.bgParticles} onCheckedChange={(v) => setGfx({ bgParticles: v })} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground text-[10px]">Color</Label>
                  <Input
                    type="color"
                    value={gfx.bgParticleColor}
                    onChange={(e) => setGfx({ bgParticleColor: e.target.value })}
                    className="w-8 h-6 p-0 border-0"
                  />
                </div>
                <TimingSlider label="Count" value={gfx.bgParticleCount} onChange={(v) => setGfx({ bgParticleCount: v })} min={10} max={120} step={10} unit="" />
                <TimingSlider label="Speed" value={gfx.bgParticleSpeed} onChange={(v) => setGfx({ bgParticleSpeed: v })} min={0.1} max={3} step={0.1} unit="x" />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-xs">Matrix Rain</Label>
                <Switch checked={gfx.bgMatrixRain} onCheckedChange={(v) => setGfx({ bgMatrixRain: v })} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground text-[10px]">Color</Label>
                  <Input
                    type="color"
                    value={gfx.bgMatrixColor}
                    onChange={(e) => setGfx({ bgMatrixColor: e.target.value })}
                    className="w-8 h-6 p-0 border-0"
                  />
                </div>
                <TimingSlider label="Speed" value={gfx.bgMatrixSpeed} onChange={(v) => setGfx({ bgMatrixSpeed: v })} min={0.3} max={3} step={0.1} unit="x" />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-xs">Grid Pulse</Label>
                <Switch checked={gfx.bgGridPulse} onCheckedChange={(v) => setGfx({ bgGridPulse: v })} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground text-[10px]">Color</Label>
                  <Input
                    type="color"
                    value={gfx.bgGridColor}
                    onChange={(e) => setGfx({ bgGridColor: e.target.value })}
                    className="w-8 h-6 p-0 border-0"
                  />
                </div>
                <TimingSlider label="Opacity" value={gfx.bgGridOpacity} onChange={(v) => setGfx({ bgGridOpacity: v })} min={0.01} max={0.1} step={0.005} unit="" />
                <TimingSlider label="Pulse Speed" value={gfx.bgGridPulseSpeed || 4} onChange={(v) => setGfx({ bgGridPulseSpeed: v })} min={1} max={15} step={0.5} unit="s" />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-xs">Floating Orbs</Label>
                <Switch checked={gfx.bgFloatingOrbs} onCheckedChange={(v) => setGfx({ bgFloatingOrbs: v })} />
              </div>
              <div className="space-y-2">
                <TimingSlider label="Count" value={gfx.bgOrbCount} onChange={(v) => setGfx({ bgOrbCount: v })} min={2} max={12} step={1} unit="" />
                <TimingSlider label="Drift Speed" value={gfx.bgOrbSpeed || 20} onChange={(v) => setGfx({ bgOrbSpeed: v })} min={5} max={60} step={1} unit="s" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[hsl(var(--card))] border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-sm font-mono">Page Exclusions</CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Pages where effects are disabled (e.g. /admin)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {gfx.excludedPages.map((page) => (
                <Badge
                  key={page}
                  variant="outline"
                  className="border-muted text-muted-foreground cursor-pointer hover:border-red-500 hover:text-red-400"
                  onClick={() => setGfx({ excludedPages: gfx.excludedPages.filter((p) => p !== page) })}
                >
                  {page} x
                </Badge>
              ))}
              <Input
                placeholder="Add path..."
                className="w-32 h-7 text-xs bg-black/30 border-border"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val && !gfx.excludedPages.includes(val)) {
                      setGfx({ excludedPages: [...gfx.excludedPages, val] });
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
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
        <div className="absolute bottom-2 left-2 right-2 h-1 bg-border rounded overflow-hidden">
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
                className="absolute text-red-700 font-mono text-lg font-bold"
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
