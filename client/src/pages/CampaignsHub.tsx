import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  Search, Shield, Globe, Bug, Network, Users,
  FileText, Clock, ChevronRight, Terminal,
  Skull, FlaskConical, BookOpen,
  X, Layers
} from 'lucide-react';
import { ALL_CURRICULUM_TRACKS } from '@/config/aiCurriculum';
import { CIVIC_CAMPAIGNS } from '@/config/agentCampaigns';

interface UnifiedCampaign {
  campaignId: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: string;
  nodeCount: number;
  tags: string[];
  source: 'builder' | 'module' | 'curriculum' | 'lab';
  icon: string;
  color: string;
  route?: string;
}

const CATEGORY_META: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  all: { icon: <Layers className="w-3.5 h-3.5" />, label: 'All', color: 'text-foreground', bg: 'bg-border border-muted' },
  civic: { icon: <Users className="w-3.5 h-3.5" />, label: 'Civic', color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-800' },
  movements: { icon: <Users className="w-3.5 h-3.5" />, label: 'Movements', color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-800' },
  organizing: { icon: <Users className="w-3.5 h-3.5" />, label: 'Organizing', color: 'text-emerald-400', bg: 'bg-emerald-900/30 border-emerald-800' },
  apt: { icon: <Skull className="w-3.5 h-3.5" />, label: 'APT', color: 'text-red-400', bg: 'bg-red-900/30 border-red-800' },
  osint: { icon: <Globe className="w-3.5 h-3.5" />, label: 'OSINT', color: 'text-teal-400', bg: 'bg-teal-900/30 border-teal-800' },
  forensics: { icon: <Search className="w-3.5 h-3.5" />, label: 'Forensics', color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-800' },
  exploit: { icon: <Bug className="w-3.5 h-3.5" />, label: 'Exploit', color: 'text-red-400', bg: 'bg-red-900/30 border-red-800' },
  defense: { icon: <Shield className="w-3.5 h-3.5" />, label: 'Defense', color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-800' },
  recon: { icon: <Network className="w-3.5 h-3.5" />, label: 'Recon', color: 'text-cyan-400', bg: 'bg-cyan-900/30 border-cyan-800' },
  social: { icon: <Users className="w-3.5 h-3.5" />, label: 'Social', color: 'text-purple-400', bg: 'bg-purple-900/30 border-purple-800' },
  curriculum: { icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Learning', color: 'text-emerald-400', bg: 'bg-emerald-900/30 border-emerald-800' },
  lab: { icon: <FlaskConical className="w-3.5 h-3.5" />, label: 'Labs', color: 'text-violet-400', bg: 'bg-violet-900/30 border-violet-800' },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'border-emerald-700/60 text-emerald-400 bg-emerald-950/30',
  intermediate: 'border-amber-700/60 text-amber-400 bg-amber-950/30',
  advanced: 'border-red-700/60 text-red-400 bg-red-950/30',
  expert: 'border-purple-700/60 text-purple-400 bg-purple-950/30',
};

const NATION_STATE_FLAGS: Record<string, { label: string; color: string }> = {
  Russia: { label: 'RUS', color: 'text-red-400' },
  China: { label: 'CHN', color: 'text-orange-400' },
  DPRK: { label: 'DPRK', color: 'text-yellow-400' },
  Iran: { label: 'IRN', color: 'text-emerald-400' },
};

const getAptInfo = (tags: string[]) => {
  const isApt = tags.some(t => t === 'APT' || t.startsWith('APT'));
  const nation = tags.find(t => NATION_STATE_FLAGS[t]);
  return { isApt, nation };
};

export default function CampaignsHub() {
  const [, navigate] = useLocation();
  const [campaigns, setCampaigns] = useState<UnifiedCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/campaigns/published')
      .then(r => r.json())
      .then((serverCampaigns: UnifiedCampaign[]) => {
        const curriculumEntries: UnifiedCampaign[] = ALL_CURRICULUM_TRACKS.map(track => ({
          campaignId: `curriculum-${track.id}`,
          name: track.name,
          description: track.description,
          category: 'curriculum',
          difficulty: track.missions[0]?.difficulty || 'beginner',
          estimatedTime: track.missions.reduce((sum, m) => {
            const mins = parseInt(m.estimatedTime) || 20;
            return sum + mins;
          }, 0) + ' min total',
          nodeCount: track.missions.length,
          tags: ['curriculum', track.color, ...track.missions.slice(0, 2).map(m => m.name)],
          source: 'curriculum' as const,
          icon: track.icon,
          color: track.color,
          route: `/wiki?track=${track.id}`,
        }));

        const decoherenceLab: UnifiedCampaign = {
          campaignId: 'decoherence-lab',
          name: 'Decoherence Lab',
          description: 'AI failure mode exercises — test for hallucination, sycophancy, anchoring bias, and boundary violations. Learn to identify when AI breaks down.',
          category: 'lab',
          difficulty: 'intermediate',
          estimatedTime: '30-60 min',
          nodeCount: 12,
          tags: ['AI', 'prompt-engineering', 'bias', 'hallucination', 'lab'],
          source: 'lab' as const,
          icon: '🧪',
          color: 'violet',
          route: '/decoherence',
        };

        const civicEntries: UnifiedCampaign[] = CIVIC_CAMPAIGNS.map(c => ({
          campaignId: c.id,
          name: c.name,
          description: c.description,
          category: 'civic',
          difficulty: c.difficulty,
          estimatedTime: c.estimatedTime,
          nodeCount: c.objectives?.length ?? 4,
          tags: c.tags,
          source: 'curriculum' as const,
          icon: c.icon,
          color: c.color,
          route: `/investigate?tab=chat&campaign=${c.id}`,
        }));

        setCampaigns([...civicEntries, ...serverCampaigns, decoherenceLab, ...curriculumEntries]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const availableCategories = ['all', ...Array.from(new Set(campaigns.map(c => c.category)))];

  const filtered = campaigns.filter(c => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q) && !c.tags.some(t => t.toLowerCase().includes(q))) return false;
    }
    if (activeCategory !== 'all' && c.category !== activeCategory) return false;
    if (activeDifficulty && c.difficulty !== activeDifficulty) return false;
    return true;
  });

  const handleCardClick = (campaign: UnifiedCampaign) => {
    if (campaign.route) {
      navigate(campaign.route);
    } else if (campaign.source === 'module') {
      navigate(`/agents?module=${campaign.campaignId}`);
    } else {
      navigate(`/play/${campaign.campaignId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--card))] text-foreground" data-testid="campaigns-hub">
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-16">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-amber-500" data-testid="hub-title">
            Missions & Labs
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Investigations, APT case studies, curriculum tracks, and hands-on labs — all in one place.
          </p>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground font-mono">
            <span>{campaigns.length} total</span>
            <span>·</span>
            <span>{filtered.length} shown</span>
          </div>
        </div>

        {/* Search — full width, mobile friendly */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search campaigns, labs, tracks..."
            className="pl-10 pr-10 bg-card border-border text-foreground h-11 text-sm rounded-lg"
            data-testid="search-campaigns"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              data-testid="clear-search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category chips — horizontal scroll on mobile */}
        <div
          className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {availableCategories.map(cat => {
            const meta = CATEGORY_META[cat] || CATEGORY_META.all;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap border transition-all shrink-0 ${
                  isActive
                    ? `${meta.bg} ${meta.color} border-current`
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-muted'
                }`}
                data-testid={`filter-category-${cat}`}
              >
                {meta.icon}
                {meta.label}
              </button>
            );
          })}
        </div>

        {/* Difficulty chips — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap" style={{ WebkitOverflowScrolling: 'touch' }}>
          {['beginner', 'intermediate', 'advanced', 'expert'].map(d => (
            <button
              key={d}
              onClick={() => setActiveDifficulty(activeDifficulty === d ? null : d)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono whitespace-nowrap border transition-all shrink-0 capitalize ${
                activeDifficulty === d
                  ? DIFFICULTY_COLORS[d]
                  : 'bg-card border-border text-muted-foreground hover:text-muted-foreground'
              }`}
              data-testid={`filter-difficulty-${d}`}
            >
              {d}
            </button>
          ))}
          {activeDifficulty && (
            <button
              onClick={() => setActiveDifficulty(null)}
              className="px-2 py-1 text-[11px] text-muted-foreground hover:text-muted-foreground"
            >
              clear
            </button>
          )}
        </div>

        {/* Content grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground font-mono text-sm">Loading missions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Terminal className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-muted-foreground font-mono mb-2">No Matches</h3>
            <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters or search terms.</p>
            <Button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); setActiveDifficulty(null); }}
              variant="outline"
              className="border-border text-muted-foreground"
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((campaign, index) => {
              const catMeta = CATEGORY_META[campaign.category] || CATEGORY_META.all;
              const aptInfo = getAptInfo(campaign.tags);
              const nationMeta = aptInfo.nation ? NATION_STATE_FLAGS[aptInfo.nation] : null;

              return (
                <motion.div
                  key={campaign.campaignId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.5) }}
                >
                  <Card
                    className={`bg-card border-border/80 hover:border-amber-800/60 transition-all cursor-pointer group active:scale-[0.98] ${
                      aptInfo.isApt ? 'ring-1 ring-red-900/15' : ''
                    }`}
                    onClick={() => handleCardClick(campaign)}
                    data-testid={`campaign-card-${campaign.campaignId}`}
                  >
                    <CardContent className="p-4 sm:p-5">
                      {/* Top row: icon + category + difficulty */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm ${
                            aptInfo.isApt ? 'bg-red-950/30 border-red-800/40' :
                            campaign.source === 'lab' ? 'bg-violet-950/30 border-violet-800/40' :
                            campaign.source === 'curriculum' ? 'bg-emerald-950/30 border-emerald-800/40' :
                            catMeta.bg
                          }`}>
                            {campaign.icon || (aptInfo.isApt ? <Skull className="w-3.5 h-3.5 text-red-400" /> :
                              campaign.source === 'lab' ? <FlaskConical className="w-3.5 h-3.5 text-violet-400" /> :
                              campaign.source === 'curriculum' ? <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> :
                              catMeta.icon)}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-mono uppercase tracking-wider ${catMeta.color}`}>
                              {catMeta.label}
                            </span>
                            {nationMeta && (
                              <Badge variant="outline" className={`text-[8px] font-mono px-1 py-0 h-4 ${nationMeta.color} border-current/30`}>
                                {nationMeta.label}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${DIFFICULTY_COLORS[campaign.difficulty] || 'border-border text-muted-foreground'}`}>
                          {campaign.difficulty}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h3 className="font-mono text-sm font-bold text-foreground group-hover:text-amber-400 transition-colors mb-1.5 line-clamp-1" data-testid={`campaign-name-${campaign.campaignId}`}>
                        {campaign.name}
                      </h3>

                      {/* Description */}
                      <p className="text-muted-foreground text-xs line-clamp-2 mb-3 leading-relaxed">{campaign.description}</p>

                      {/* Footer: stats + arrow */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-muted-foreground text-[10px]">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" /> {campaign.nodeCount} {campaign.source === 'curriculum' ? 'missions' : 'steps'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {campaign.estimatedTime}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                      </div>

                      {/* Tags */}
                      {campaign.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border/40">
                          {campaign.tags.slice(0, 4).map(tag => (
                            <span
                              key={tag}
                              className={`text-[9px] px-1.5 py-0.5 rounded ${
                                tag === 'APT' ? 'text-red-400 bg-red-950/40' :
                                NATION_STATE_FLAGS[tag] ? `${NATION_STATE_FLAGS[tag].color} bg-card/60` :
                                tag === 'curriculum' ? 'text-emerald-400 bg-emerald-950/30' :
                                tag === 'lab' ? 'text-violet-400 bg-violet-950/30' :
                                'text-muted-foreground bg-card/50'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
