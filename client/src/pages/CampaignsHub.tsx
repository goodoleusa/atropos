import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  Search, Play, Shield, Globe, Bug, Network, Users,
  FileText, Clock, ChevronRight, Zap, Filter, Sparkles, Terminal
} from 'lucide-react';
import { GlitchHover, GlitchText } from '@/components/GlitchHover';

interface PublishedCampaign {
  campaignId: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: string;
  nodeCount: number;
  tags: string[];
}

interface TemplateInfo {
  id: string;
  name: string;
  categories: string[];
}

const CATEGORY_META: Record<string, { icon: any; color: string; bg: string }> = {
  osint: { icon: <Globe className="w-4 h-4" />, color: 'text-teal-400', bg: 'bg-teal-900/20 border-teal-800' },
  forensics: { icon: <Search className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-800' },
  exploit: { icon: <Bug className="w-4 h-4" />, color: 'text-red-400', bg: 'bg-red-900/20 border-red-800' },
  social: { icon: <Users className="w-4 h-4" />, color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-800' },
  defense: { icon: <Shield className="w-4 h-4" />, color: 'text-amber-400', bg: 'bg-amber-900/20 border-amber-800' },
  recon: { icon: <Network className="w-4 h-4" />, color: 'text-cyan-400', bg: 'bg-cyan-900/20 border-cyan-800' },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'border-green-700 text-green-400',
  intermediate: 'border-amber-700 text-amber-400',
  advanced: 'border-red-700 text-red-400',
};

export default function CampaignsHub() {
  const [, navigate] = useLocation();
  const [campaigns, setCampaigns] = useState<PublishedCampaign[]>([]);
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genTemplate, setGenTemplate] = useState('');
  const [genSkill, setGenSkill] = useState('intermediate');
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/campaigns/published').then(r => r.json()).catch(() => []),
      fetch('/api/campaign-templates').then(r => r.json()).catch(() => []),
    ]).then(([c, t]) => {
      setCampaigns(c);
      setTemplates(t);
      setLoading(false);
    });
  }, []);

  const filtered = campaigns.filter(c => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q) && !c.tags.some(t => t.includes(q))) return false;
    }
    if (categoryFilter && c.category !== categoryFilter) return false;
    if (difficultyFilter && c.difficulty !== difficultyFilter) return false;
    return true;
  });

  const generateCampaign = async () => {
    if (!genTemplate || !genTopic) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/campaign-templates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: genTemplate, topic: genTopic, skill: genSkill }),
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/play/${data.campaignId}`);
      }
    } catch {}
    setGenerating(false);
  };

  const categories = Array.from(new Set(campaigns.map(c => c.category)));
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  return (
    <div className="min-h-screen bg-[#0a0500] text-stone-300">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-mono font-bold text-amber-500" data-testid="hub-title">
              Investigation Campaigns
            </h1>
            <p className="text-stone-500 text-sm mt-1">CTF-style security investigations with hidden clues embedded in page source, network traffic, and dev tools.</p>
          </div>
          <Button
            onClick={() => setShowGenerator(!showGenerator)}
            className="bg-amber-700 hover:bg-amber-600 gap-2"
            data-testid="toggle-generator"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden md:inline">Quick Generate</span>
          </Button>
        </div>

        {showGenerator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-stone-950 border-amber-900/30 mb-8">
              <CardHeader>
                <CardTitle className="text-amber-400 font-mono text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Campaign Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-stone-500 text-xs mb-1 block">Template</label>
                    <select
                      value={genTemplate}
                      onChange={e => setGenTemplate(e.target.value)}
                      className="w-full bg-black/50 border border-stone-700 rounded px-3 py-2 text-sm text-stone-300"
                      data-testid="select-template"
                    >
                      <option value="">Select template...</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-stone-500 text-xs mb-1 block">Topic</label>
                    <Input
                      value={genTopic}
                      onChange={e => setGenTopic(e.target.value)}
                      placeholder="e.g. BGP Hijacking, API Security..."
                      className="bg-black/50 border-stone-700 text-stone-300 text-sm"
                      data-testid="input-topic"
                    />
                  </div>
                  <div>
                    <label className="text-stone-500 text-xs mb-1 block">Skill Level</label>
                    <select
                      value={genSkill}
                      onChange={e => setGenSkill(e.target.value)}
                      className="w-full bg-black/50 border border-stone-700 rounded px-3 py-2 text-sm text-stone-300"
                      data-testid="select-skill"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={generateCampaign}
                      disabled={!genTemplate || !genTopic || generating}
                      className="w-full bg-teal-700 hover:bg-teal-600 gap-2"
                      data-testid="generate-campaign"
                    >
                      {generating ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Generate & Play
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search campaigns..."
              className="pl-10 bg-stone-950 border-stone-700 text-stone-300"
              data-testid="search-campaigns"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Filter className="w-3 h-3 text-stone-600" />
            </div>
            {categories.map(cat => {
              const meta = CATEGORY_META[cat] || CATEGORY_META.recon;
              return (
                <Badge
                  key={cat}
                  variant="outline"
                  className={`cursor-pointer transition-all ${
                    categoryFilter === cat ? `${meta.bg} ${meta.color}` : 'border-stone-700 text-stone-500 hover:text-stone-300'
                  }`}
                  onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                  data-testid={`filter-category-${cat}`}
                >
                  {meta.icon}
                  <span className="ml-1 capitalize">{cat}</span>
                </Badge>
              );
            })}
            <span className="text-stone-800">|</span>
            {difficulties.map(d => (
              <Badge
                key={d}
                variant="outline"
                className={`cursor-pointer transition-all ${
                  difficultyFilter === d ? DIFFICULTY_COLORS[d] : 'border-stone-700 text-stone-500 hover:text-stone-300'
                }`}
                onClick={() => setDifficultyFilter(difficultyFilter === d ? null : d)}
                data-testid={`filter-difficulty-${d}`}
              >
                {d}
              </Badge>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-stone-500 font-mono text-sm">Loading campaigns...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="bg-stone-950 border-stone-800">
            <CardContent className="p-12 text-center">
              <Terminal className="w-12 h-12 text-stone-700 mx-auto mb-4" />
              <h3 className="text-stone-400 font-mono mb-2">
                {campaigns.length === 0 ? 'No Campaigns Yet' : 'No Matching Campaigns'}
              </h3>
              <p className="text-stone-600 text-sm mb-4">
                {campaigns.length === 0
                  ? 'Use the Quick Generator above to create your first investigation campaign.'
                  : 'Try adjusting your filters or search terms.'}
              </p>
              {campaigns.length === 0 && (
                <Button
                  onClick={() => setShowGenerator(true)}
                  className="bg-amber-700 hover:bg-amber-600 gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Create Your First Campaign
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((campaign, index) => {
              const meta = CATEGORY_META[campaign.category] || CATEGORY_META.recon;
              return (
                <motion.div
                  key={campaign.campaignId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlitchHover effect="scanline" intensity={0.3}>
                  <Card
                    className="bg-stone-950 border-stone-800 hover:border-amber-800 transition-all cursor-pointer group"
                    onClick={() => navigate(`/play/${campaign.campaignId}`)}
                    data-testid={`campaign-card-${campaign.campaignId}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <GlitchHover effect="color-shift" intensity={0.4}>
                        <div className={`p-2 rounded-lg border ${meta.bg}`}>
                          {meta.icon}
                        </div>
                        </GlitchHover>
                        <Badge variant="outline" className={DIFFICULTY_COLORS[campaign.difficulty] || 'border-stone-700 text-stone-500'}>
                          {campaign.difficulty}
                        </Badge>
                      </div>
                      <h3 className="font-mono text-sm font-bold text-stone-200 group-hover:text-amber-400 transition-colors mb-1" data-testid={`campaign-name-${campaign.campaignId}`}>
                        <GlitchText text={campaign.name} effect="text-scramble" intensity={0.6} />
                      </h3>
                      <p className="text-stone-500 text-xs line-clamp-2 mb-3">{campaign.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-stone-600 text-[10px]">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" /> {campaign.nodeCount} steps
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {campaign.estimatedTime}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-700 group-hover:text-amber-500 transition-colors" />
                      </div>
                      {campaign.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-stone-800/50">
                          {campaign.tags.slice(0, 4).map(tag => (
                            <span key={tag} className="text-[9px] text-stone-600 bg-stone-900/50 px-1.5 py-0.5 rounded">{tag}</span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  </GlitchHover>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
