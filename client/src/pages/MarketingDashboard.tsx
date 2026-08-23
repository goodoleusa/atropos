import { useState, useCallback } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft, ArrowRight, ArrowDown, Target, Users, TrendingUp,
  Megaphone, Palette, Copy, Zap, Shield, Globe, Award, Heart,
  Play, ChevronRight, BarChart3, MousePointerClick, Eye, Clock,
  Lightbulb, CheckCircle, Shuffle, FileText, Share2, Sparkles,
  DollarSign, GraduationCap, Briefcase, Mail, Video, Image
} from 'lucide-react';

type Segment = 'it_pro' | 'student';
type FunnelStage = 'awareness' | 'interest' | 'consideration' | 'decision' | 'action' | 'retention';
type ToneStyle = 'professional' | 'bold' | 'empathetic' | 'urgent' | 'educational';

interface CampaignVariant {
  id: string;
  label: string;
  headline: string;
  subheadline: string;
  cta: string;
  ctaSecondary: string;
  tone: ToneStyle;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface FunnelStep {
  stage: FunnelStage;
  name: string;
  icon: any;
  duration: string;
  bestPractice: string;
  contentLength: string;
  conversionTip: string;
  dropoffRisk: string;
  color: string;
}

const TONES: { id: ToneStyle; label: string; desc: string }[] = [
  { id: 'professional', label: 'Professional', desc: 'Clean, authoritative, data-driven' },
  { id: 'bold', label: 'Bold & Disruptive', desc: 'Challenge the status quo, strong claims' },
  { id: 'empathetic', label: 'Empathetic', desc: 'Mission-driven, emotionally compelling' },
  { id: 'urgent', label: 'Urgent', desc: 'Time-sensitive, scarcity-driven' },
  { id: 'educational', label: 'Educational', desc: 'Value-first, teach before selling' },
];

const BRAND_COLORS = {
  primary: { label: 'Molten Bronze', value: '#CD7F32', tw: 'amber' },
  secondary: { label: 'Deep Teal', value: '#14B8A6', tw: 'teal' },
  accent: { label: 'Forge Red', value: '#DC2626', tw: 'red' },
  dark: { label: 'Void Black', value: '#0A0500', tw: 'stone' },
};

const IT_PRO_VARIANTS: CampaignVariant[] = [
  {
    id: 'itp-a',
    label: 'Variant A — Authority',
    headline: 'OSINT for Good: Fight Trafficking with Real Skills',
    subheadline: 'Join 10,000+ investigators using AI-enabled cybersecurity to disrupt criminal networks. FBI-grade techniques. No fluff.',
    cta: 'Start Your First Investigation',
    ctaSecondary: 'See the Curriculum',
    tone: 'professional',
    impressions: 45200,
    clicks: 3616,
    conversions: 542,
  },
  {
    id: 'itp-b',
    label: 'Variant B — Mission-Led',
    headline: 'Your Cybersecurity Skills Can Save Lives',
    subheadline: '40 million people are enslaved right now. Your OSINT expertise could help find them. Real investigations. Real impact.',
    cta: 'Deploy Your Skills for Good',
    ctaSecondary: 'Watch the Impact Video',
    tone: 'empathetic',
    impressions: 44800,
    clicks: 4928,
    conversions: 689,
  },
];

const STUDENT_VARIANTS: CampaignVariant[] = [
  {
    id: 'stu-a',
    label: 'Variant A — Career Path',
    headline: 'Become a Cyber Bounty Hunter',
    subheadline: 'Skip the theory. Build a professional portfolio that proves you can hack. AI-enabled cybersecurity training with real investigations, not textbooks.',
    cta: 'Start Free — No Signup Required',
    ctaSecondary: 'See Career Paths',
    tone: 'bold',
    impressions: 62100,
    clicks: 8074,
    conversions: 967,
  },
  {
    id: 'stu-b',
    label: 'Variant B — Social Impact',
    headline: 'Learn Cybersecurity by Fighting Real Crime',
    subheadline: 'Experience over fluff. Build your portfolio showcasing your skills while helping combat human trafficking. The most meaningful way to start your career.',
    cta: 'Launch Your First Mission',
    ctaSecondary: 'Explore OSINT for Good',
    tone: 'empathetic',
    impressions: 61500,
    clicks: 7380,
    conversions: 1107,
  },
];

const IT_PRO_FUNNEL: FunnelStep[] = [
  {
    stage: 'awareness',
    name: 'Discovery Ad / LinkedIn Post',
    icon: Megaphone,
    duration: '3-5 seconds',
    bestPractice: 'Hook in first 3 words. Lead with credential (FBI techniques) or shocking stat (40M enslaved). Short-form video outperforms static 3:1 on LinkedIn.',
    contentLength: '< 150 characters headline + 30s video or single image',
    conversionTip: 'Use "OSINT for Good" as the hook — it creates curiosity gap. IT pros respond to specificity over hype.',
    dropoffRisk: 'Generic cybersecurity messaging blends into noise. Must differentiate with anti-trafficking angle immediately.',
    color: 'amber',
  },
  {
    stage: 'interest',
    name: 'Landing Page (Long-form)',
    icon: Eye,
    duration: '2-4 minutes read time',
    bestPractice: 'LONG page. IT pros research before committing. Include: social proof (case count), curriculum overview, tool list, career impact stats. Above-fold CTA + bottom CTA.',
    contentLength: '1500-2500 words with visual breaks. Include comparison table vs traditional certs.',
    conversionTip: 'Show real investigation screenshots. "Experience over fluff" messaging resonates — they are tired of cert mills.',
    dropoffRisk: 'If page looks too "marketing" they bounce. Keep it technical and evidence-based. No stock photos of smiling people.',
    color: 'amber',
  },
  {
    stage: 'consideration',
    name: 'Free Investigation Trial',
    icon: Play,
    duration: '15-30 minutes hands-on',
    bestPractice: 'Let them DO something immediately. No signup wall. First campaign should complete in 15 min with a visible result (found a fake company, traced a wallet).',
    contentLength: 'Single guided campaign with 3-5 steps. Show XP earned and skill progress at end.',
    conversionTip: 'The "aha moment" is when they see the NEXUS agent analyze their findings. Make this happen in first 10 minutes.',
    dropoffRisk: 'Highest dropout: if first investigation feels fake or too easy. Use real-world data patterns. Challenge them.',
    color: 'teal',
  },
  {
    stage: 'decision',
    name: 'Portfolio Preview + Social Proof',
    icon: Award,
    duration: '5-10 minutes',
    bestPractice: 'Show what their completed portfolio looks like. Include testimonials from working security professionals. Compare to SANS/OSCP cost ($8K+ vs free).',
    contentLength: 'Interactive portfolio preview + 3-5 testimonials + pricing comparison table',
    conversionTip: '"Professional portfolio showcasing your skills" — this is the key differentiator. Show a sample portfolio they can aspire to.',
    dropoffRisk: 'Price objection is low (free tier). Main objection: "Is this legit?" — counter with industry partnerships and real case stats.',
    color: 'teal',
  },
  {
    stage: 'action',
    name: 'Account Creation + Onboarding',
    icon: Zap,
    duration: '< 60 seconds',
    bestPractice: 'One-click Replit auth. No forms. Immediately drop them into their next investigation. Show progress bar: "You are 15% through the OSINT track."',
    contentLength: 'Single CTA button. Progress indicator. First campaign auto-selected based on trial behavior.',
    conversionTip: 'Reduce friction to zero. They already did a trial — now just persist their progress.',
    dropoffRisk: 'Any form with more than email = major dropoff. Use social auth exclusively.',
    color: 'amber',
  },
  {
    stage: 'retention',
    name: 'Daily Challenges + Community',
    icon: TrendingUp,
    duration: 'Ongoing — 10-15 min/day',
    bestPractice: 'Daily OSINT challenge (rotating). Leaderboard visibility. Weekly new campaign drops. Monthly "case study" newsletter with real trafficking busts.',
    contentLength: 'Push notification: < 50 chars. Email: 200-400 words max. In-app: daily challenge card.',
    conversionTip: 'Streak mechanics work. "Day 7 streak — you\'ve earned 500 XP" drives habit formation.',
    dropoffRisk: 'Day 3-7 is the danger zone. Send re-engagement at hour 48 if no login. Highlight unfinished investigation.',
    color: 'teal',
  },
];

const STUDENT_FUNNEL: FunnelStep[] = [
  {
    stage: 'awareness',
    name: 'TikTok / YouTube Short / Instagram Reel',
    icon: Video,
    duration: '15-60 seconds',
    bestPractice: 'Show, don\'t tell. Screen recording of an actual investigation with dramatic music. "I just traced a criminal\'s Bitcoin wallet in 5 minutes." Hook in first 2 seconds.',
    contentLength: '15-30s video (TikTok), 60s (YouTube Shorts). Caption < 100 chars.',
    conversionTip: '"Cyber Bounty Hunter" as identity label — students want to BE something, not learn something. Make it aspirational.',
    dropoffRisk: 'If it looks like a school course, they scroll past. Must look like a game or heist movie.',
    color: 'amber',
  },
  {
    stage: 'interest',
    name: 'Landing Page (Short + Visual)',
    icon: Eye,
    duration: '30-90 seconds scan time',
    bestPractice: 'SHORT page. Students scan, not read. Hero video/animation, 3 value props with icons, one testimonial from a young professional, immediate CTA. Mobile-first.',
    contentLength: '400-600 words max. Heavy visuals. Progress bar showing "what you will learn." Career salary ranges visible.',
    conversionTip: '"No degree required. No experience needed. Start now." — remove every barrier. Show salary ranges ($85K-$140K for cybersecurity roles).',
    dropoffRisk: 'Long text walls = instant bounce for this segment. Every section must have a visual.',
    color: 'amber',
  },
  {
    stage: 'consideration',
    name: 'Instant Play — No Signup',
    icon: Play,
    duration: '5-15 minutes',
    bestPractice: 'ZERO friction. No email, no signup, no paywall. Drop them straight into a spy mission with cinematic briefing. Gamify everything — XP, levels, clue collection.',
    contentLength: 'Single spy mission (SHADOW PROTOCOL). 5 steps, each < 2 minutes. Boss fight at end.',
    conversionTip: 'The "dopamine hit" is earning their first achievement badge + seeing XP bar fill. Make this happen in first 5 minutes.',
    dropoffRisk: 'If it feels like homework, they quit. Must feel like a game. Classified document aesthetic, spy handler voice.',
    color: 'teal',
  },
  {
    stage: 'decision',
    name: 'Career Path Reveal + Portfolio',
    icon: GraduationCap,
    duration: '3-5 minutes',
    bestPractice: 'After first mission, show: "Based on your performance, you would excel as a Threat Hunter (avg salary: $120K)." Show their portfolio starting to build automatically.',
    contentLength: 'Interactive career path selector. 6 paths with job titles, salaries, and companies hiring.',
    conversionTip: '"Professional portfolio showcasing your skills" — students don\'t have work experience. This IS their experience. Make it shareable on LinkedIn.',
    dropoffRisk: '"This is cool but I\'ll come back later" — use streak mechanics. "Your investigation expires in 24h."',
    color: 'teal',
  },
  {
    stage: 'action',
    name: 'Save Progress / Create Account',
    icon: Zap,
    duration: '< 30 seconds',
    bestPractice: 'Pop-up after first mission: "Save your progress and portfolio? Sign in with one click." Show what they will lose if they don\'t (XP, clues, portfolio entries).',
    contentLength: 'Modal: 1 sentence + social auth buttons + "You earned 150 XP — don\'t lose it!"',
    conversionTip: 'Loss aversion > gain framing. "Don\'t lose your 150 XP and 3 clues" converts 2x better than "Create account to earn more."',
    dropoffRisk: 'If auth has ANY friction (email verification, form fields), massive dropoff. One-click only.',
    color: 'amber',
  },
  {
    stage: 'retention',
    name: 'Streak System + Social Sharing',
    icon: TrendingUp,
    duration: 'Ongoing — 5-10 min/day',
    bestPractice: 'Daily challenge streak. Shareable achievement cards for social media. Monthly "Cyber Bounty Hunter of the Month" with real prizes. Referral XP bonus.',
    contentLength: 'Push: < 40 chars. Social card: auto-generated image with stats. Weekly email: "Your weekly intel briefing."',
    conversionTip: 'Peer pressure works. "3 of your friends earned more XP than you this week." Leaderboard visibility drives daily returns.',
    dropoffRisk: 'Week 2 is critical. Must have new content drop. "New classified campaign unlocked" at day 8.',
    color: 'teal',
  },
];

const CTA_TEMPLATES = [
  { category: 'Action', templates: ['Start Your Investigation', 'Launch Mission', 'Deploy Now', 'Begin Training', 'Enter the Lab', 'Start Hunting'] },
  { category: 'Value', templates: ['Get Free Access', 'Unlock Your Portfolio', 'Claim Your Rank', 'Build Your Skills', 'Earn Your Badge', 'Join the Hunt'] },
  { category: 'Urgency', templates: ['Limited Spots Available', 'Start Before It Expires', 'Join 10,000+ Investigators', 'Don\'t Miss This Intel', 'Act Now — Free Access'] },
  { category: 'Social Proof', templates: ['See What Others Built', 'Join the Community', 'View Success Stories', 'Rated 4.9 by Investigators', 'Trusted by Security Pros'] },
  { category: 'Identity', templates: ['Become a Cyber Bounty Hunter', 'Join OSINT for Good', 'Be the Investigator', 'Prove Your Skills', 'Your Portfolio Awaits'] },
];

const KEY_PHRASES = [
  { phrase: 'OSINT for Good', usage: 'Brand identity, hashtag, movement name', where: 'Hero headlines, social bios, merch' },
  { phrase: 'Cyber Bounty Hunter', usage: 'Aspirational identity for students', where: 'Student ads, onboarding, portfolio titles' },
  { phrase: 'AI-Enabled Cybersecurity', usage: 'Differentiator, modern positioning', where: 'IT pro landing page, comparison tables' },
  { phrase: 'Experience Over Fluff', usage: 'Anti-certification positioning', where: 'Subheadlines, testimonials, value props' },
  { phrase: 'Professional Portfolio Showcasing Your Skills', usage: 'Outcome-focused value prop', where: 'Decision stage, career sections, CTAs' },
  { phrase: 'No Degree Required', usage: 'Barrier removal for students', where: 'Student hero, FAQ, career paths' },
  { phrase: 'Real Investigations, Real Impact', usage: 'Credibility + mission', where: 'All segments, social proof sections' },
];

export default function MarketingDashboard() {
  const [activeSegment, setActiveSegment] = useState<Segment>('student');
  const [activeTone, setActiveTone] = useState<ToneStyle>('bold');
  const [activeTab, setActiveTab] = useState('funnels');
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [customHeadline, setCustomHeadline] = useState('');
  const [customSub, setCustomSub] = useState('');
  const [customCta, setCustomCta] = useState('');
  const [generatedCtas, setGeneratedCtas] = useState<string[]>([]);

  const variants = activeSegment === 'it_pro' ? IT_PRO_VARIANTS : STUDENT_VARIANTS;
  const funnel = activeSegment === 'it_pro' ? IT_PRO_FUNNEL : STUDENT_FUNNEL;

  const getWinningVariant = (vs: CampaignVariant[]) => {
    const rates = vs.map(v => ({ ...v, ctr: (v.clicks / v.impressions) * 100, cvr: (v.conversions / v.clicks) * 100 }));
    return rates.reduce((a, b) => a.cvr > b.cvr ? a : b);
  };

  const generateCtas = useCallback(() => {
    const pool = CTA_TEMPLATES.flatMap(c => c.templates);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setGeneratedCtas(shuffled.slice(0, 6));
    toast({ title: 'CTAs Generated', description: '6 fresh call-to-action options ready for testing.' });
  }, []);

  const copyCta = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: `"${text}" copied to clipboard.` });
  }, []);

  const winner = getWinningVariant(variants);

  return (
    <div className="min-h-screen bg-[hsl(var(--card))] text-foreground">
      <header className="sticky top-0 z-50 bg-[hsl(var(--card))]/95 backdrop-blur border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400 min-h-[44px]" data-testid="back-btn">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-400" />
                <h1 className="text-lg font-bold text-amber-400" data-testid="marketing-title">
                  Marketing HQ
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-900/30 text-amber-400 border-amber-800/50" data-testid="segment-badge">
                {activeSegment === 'it_pro' ? 'IT Professional Segment' : 'Student Segment'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <Button
              variant={activeSegment === 'it_pro' ? 'default' : 'outline'}
              onClick={() => setActiveSegment('it_pro')}
              className={activeSegment === 'it_pro' ? 'bg-amber-700 text-black' : 'border-border text-muted-foreground'}
              data-testid="segment-it-pro"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              IT Professionals
            </Button>
            <Button
              variant={activeSegment === 'student' ? 'default' : 'outline'}
              onClick={() => setActiveSegment('student')}
              className={activeSegment === 'student' ? 'bg-teal-700 text-black' : 'border-border text-muted-foreground'}
              data-testid="segment-student"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Beginner Students
            </Button>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">Tone:</span>
            <Select value={activeTone} onValueChange={(v) => setActiveTone(v as ToneStyle)}>
              <SelectTrigger className="w-[160px] bg-card border-border text-foreground h-9" data-testid="tone-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {TONES.map(t => (
                  <SelectItem key={t.id} value={t.id} className="text-foreground">{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card/50 border border-border p-1 flex-wrap" data-testid="marketing-tabs">
            <TabsTrigger value="funnels" className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400 min-h-[40px] gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Funnels
            </TabsTrigger>
            <TabsTrigger value="ab" className="data-[state=active]:bg-teal-900/50 data-[state=active]:text-teal-400 min-h-[40px] gap-1.5">
              <Shuffle className="w-3.5 h-3.5" /> A/B Tests
            </TabsTrigger>
            <TabsTrigger value="cta" className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400 min-h-[40px] gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5" /> CTA Lab
            </TabsTrigger>
            <TabsTrigger value="copy" className="data-[state=active]:bg-teal-900/50 data-[state=active]:text-teal-400 min-h-[40px] gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Copy & Phrases
            </TabsTrigger>
            <TabsTrigger value="brand" className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400 min-h-[40px] gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Brand Kit
            </TabsTrigger>
          </TabsList>

          {/* FUNNELS TAB */}
          <TabsContent value="funnels" className="space-y-6 mt-6" data-testid="tab-funnels">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-amber-400 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {activeSegment === 'it_pro' ? 'IT Pro Anti-Trafficking SME Funnel' : 'Student Cyber Bounty Hunter Funnel'}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Full customer journey from first touch to retention. Each step includes best-practice timing, content length, and conversion tips based on 2025 funnel research.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {funnel.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.stage} data-testid={`funnel-step-${step.stage}`}>
                      <Card className="bg-card/80 border-border hover:border-amber-800/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-lg bg-${step.color}-900/30 border border-${step.color}-800/50 flex items-center justify-center shrink-0`}>
                              <Icon className={`w-5 h-5 text-${step.color}-400`} />
                            </div>
                            <div className="flex-1 min-w-0 space-y-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className="bg-border text-muted-foreground border-border text-[10px] uppercase tracking-wider">
                                  Stage {idx + 1}
                                </Badge>
                                <Badge className={`bg-${step.color}-900/30 text-${step.color}-400 border-${step.color}-800/50`}>
                                  {step.stage}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {step.duration}
                                </div>
                              </div>
                              <h3 className="text-sm font-semibold text-foreground">{step.name}</h3>
                              
                              <div className="grid sm:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-[10px] uppercase tracking-wider text-amber-600 font-bold">Best Practice</span>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.bestPractice}</p>
                                  </div>
                                  <div>
                                    <span className="text-[10px] uppercase tracking-wider text-teal-600 font-bold">Content Length</span>
                                    <p className="text-xs text-muted-foreground mt-1">{step.contentLength}</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-[10px] uppercase tracking-wider text-amber-600 font-bold flex items-center gap-1">
                                      <Lightbulb className="w-3 h-3" /> Conversion Tip
                                    </span>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.conversionTip}</p>
                                  </div>
                                  <div>
                                    <span className="text-[10px] uppercase tracking-wider text-red-600 font-bold">Dropoff Risk</span>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.dropoffRisk}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      {idx < funnel.length - 1 && (
                        <div className="flex justify-center py-1">
                          <ArrowDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-teal-400 text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Funnel Timing Research Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-card/80 rounded-lg p-4 border border-border">
                    <div className="text-2xl font-bold text-amber-400">3s</div>
                    <div className="text-xs text-muted-foreground mt-1">Avg time to hook or lose on social media. Your headline must work in 3 seconds.</div>
                  </div>
                  <div className="bg-card/80 rounded-lg p-4 border border-border">
                    <div className="text-2xl font-bold text-teal-400">10 min</div>
                    <div className="text-xs text-muted-foreground mt-1">Max time to "aha moment." If users don't see value in 10 min, 73% never return.</div>
                  </div>
                  <div className="bg-card/80 rounded-lg p-4 border border-border">
                    <div className="text-2xl font-bold text-red-400">48h</div>
                    <div className="text-xs text-muted-foreground mt-1">Critical re-engagement window. If no return in 48 hours, send recovery email/push.</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* A/B TESTS TAB */}
          <TabsContent value="ab" className="space-y-6 mt-6" data-testid="tab-ab">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-teal-400 flex items-center gap-2">
                  <Shuffle className="w-5 h-5" />
                  A/B Test: {activeSegment === 'it_pro' ? 'IT Professional' : 'Student'} Hero Campaign
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Compare messaging variants. Click any variant to edit copy. Winner highlighted by conversion rate.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {variants.map(v => {
                    const ctr = ((v.clicks / v.impressions) * 100).toFixed(1);
                    const cvr = ((v.conversions / v.clicks) * 100).toFixed(1);
                    const isWinner = v.id === winner.id;
                    return (
                      <Card
                        key={v.id}
                        className={`border transition-colors cursor-pointer ${
                          isWinner
                            ? 'bg-amber-950/20 border-amber-800/50'
                            : 'bg-card/80 border-border hover:border-border'
                        }`}
                        onClick={() => {
                          setEditingVariant(v.id);
                          setCustomHeadline(v.headline);
                          setCustomSub(v.subheadline);
                          setCustomCta(v.cta);
                        }}
                        data-testid={`variant-${v.id}`}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-border text-muted-foreground border-border">{v.label}</Badge>
                            {isWinner && (
                              <Badge className="bg-amber-900/50 text-amber-400 border-amber-800">
                                <CheckCircle className="w-3 h-3 mr-1" /> Winner
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-base font-bold text-foreground">{v.headline}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">{v.subheadline}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className="bg-amber-900/30 text-amber-400 border-amber-800/50 text-xs">{v.cta}</Badge>
                            <Badge variant="outline" className="border-border text-muted-foreground text-xs">{v.ctaSecondary}</Badge>
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                            <span>Impressions: <span className="text-foreground">{v.impressions.toLocaleString()}</span></span>
                            <span>CTR: <span className={`${parseFloat(ctr) > 10 ? 'text-teal-400' : 'text-foreground'}`}>{ctr}%</span></span>
                            <span>CVR: <span className={`${parseFloat(cvr) > 12 ? 'text-amber-400' : 'text-foreground'}`}>{cvr}%</span></span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {editingVariant && (
                  <Card className="bg-card/80 border-amber-900/30" data-testid="variant-editor">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Edit Copy — {variants.find(v => v.id === editingVariant)?.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Headline</label>
                        <Input
                          value={customHeadline}
                          onChange={(e) => setCustomHeadline(e.target.value)}
                          className="bg-card border-border text-foreground mt-1"
                          data-testid="edit-headline"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">{customHeadline.length} chars — aim for 40-60 for social, 60-90 for landing page</p>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Subheadline</label>
                        <Textarea
                          value={customSub}
                          onChange={(e) => setCustomSub(e.target.value)}
                          className="bg-card border-border text-foreground mt-1"
                          rows={2}
                          data-testid="edit-subheadline"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">{customSub.length} chars — keep under 160 for social cards</p>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Primary CTA</label>
                        <Input
                          value={customCta}
                          onChange={(e) => setCustomCta(e.target.value)}
                          className="bg-card border-border text-foreground mt-1"
                          data-testid="edit-cta"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">{customCta.length} chars — best CTAs are 2-5 words, start with a verb</p>
                      </div>

                      <div className="bg-card/50 rounded-lg p-4 border border-border">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Live Preview</p>
                        <div className="text-center space-y-2">
                          <h2 className="text-xl font-bold text-foreground">{customHeadline || 'Your Headline'}</h2>
                          <p className="text-sm text-muted-foreground">{customSub || 'Your subheadline goes here'}</p>
                          <Button className="bg-amber-600 hover:bg-amber-500 text-black font-bold mt-2">
                            {customCta || 'Your CTA'} <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-amber-400 text-sm">A/B Testing Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                    <span>Test ONE variable at a time (headline OR CTA, not both)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                    <span>Minimum 1,000 impressions per variant before declaring winner</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                    <span>CVR (conversion rate) matters more than CTR (click-through rate)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                    <span>Run tests for 7-14 days minimum to account for day-of-week effects</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                    <span>Identity-based CTAs ("Become a...") outperform action-based ("Sign up") by 30%</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                    <span>Short-form video ads convert 2-3x over static images for under-30 audience</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CTA LAB TAB */}
          <TabsContent value="cta" className="space-y-6 mt-6" data-testid="tab-cta">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-amber-400 flex items-center gap-2">
                      <MousePointerClick className="w-5 h-5" />
                      CTA Generator
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Generate, preview, and copy call-to-action text. Each click gives you 6 fresh options across 5 categories.
                    </CardDescription>
                  </div>
                  <Button onClick={generateCtas} className="bg-amber-700 hover:bg-amber-600 text-black min-h-[44px]" data-testid="generate-ctas-btn">
                    <Shuffle className="w-4 h-4 mr-2" />
                    Generate CTAs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {generatedCtas.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {generatedCtas.map((cta, i) => (
                      <div
                        key={i}
                        className="bg-card/80 border border-border rounded-lg p-3 flex items-center justify-between gap-2 hover:border-amber-800/50 transition-colors cursor-pointer"
                        onClick={() => copyCta(cta)}
                        data-testid={`generated-cta-${i}`}
                      >
                        <div className="flex items-center gap-2">
                          <Badge className="bg-amber-900/30 text-amber-400 border-amber-800/50 text-xs shrink-0 w-6 h-6 flex items-center justify-center p-0">
                            {i + 1}
                          </Badge>
                          <span className="text-sm text-foreground font-medium">{cta}</span>
                        </div>
                        <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-amber-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MousePointerClick className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Click "Generate CTAs" to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-teal-400 text-sm">CTA Templates by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {CTA_TEMPLATES.map(cat => (
                  <div key={cat.category}>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">{cat.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.templates.map(t => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="border-border text-muted-foreground hover:border-amber-800 hover:text-amber-400 cursor-pointer transition-colors py-1"
                          onClick={() => copyCta(t)}
                          data-testid={`cta-template-${t.replace(/\s+/g, '-').toLowerCase()}`}
                        >
                          {t}
                          <Copy className="w-2.5 h-2.5 ml-1.5 opacity-40" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-amber-400 text-sm">CTA Button Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['Start Your Investigation', 'Become a Cyber Bounty Hunter', 'Launch Mission', 'Join OSINT for Good', 'Build Your Portfolio', 'Deploy Your Skills'].map(cta => (
                    <div key={cta} className="space-y-2">
                      <Button className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold">
                        {cta} <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <p className="text-[10px] text-center text-muted-foreground">{cta.length} chars</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COPY & PHRASES TAB */}
          <TabsContent value="copy" className="space-y-6 mt-6" data-testid="tab-copy">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-teal-400 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Key Phrases & Messaging Library
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Core brand phrases to use across all marketing materials. Click any phrase to copy.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {KEY_PHRASES.map(kp => (
                  <div
                    key={kp.phrase}
                    className="bg-card/80 border border-border rounded-lg p-3 hover:border-amber-800/30 transition-colors cursor-pointer"
                    onClick={() => copyCta(kp.phrase)}
                    data-testid={`phrase-${kp.phrase.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-amber-400">{kp.phrase}</h3>
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Usage</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{kp.usage}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Where to Use</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{kp.where}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-amber-400 text-sm">Segment-Specific Messaging</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-card/80 border border-amber-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-bold text-amber-400">IT Professionals</h3>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p><span className="text-foreground font-medium">Pain:</span> "I have cybersecurity skills but no way to apply them for social good"</p>
                      <p><span className="text-foreground font-medium">Desire:</span> Subject matter expertise recognition in anti-trafficking</p>
                      <p><span className="text-foreground font-medium">Objection:</span> "Is this platform serious or just gamified fluff?"</p>
                      <p><span className="text-foreground font-medium">Counter:</span> Real investigation data, FBI/Interpol-grade techniques, case studies</p>
                      <p><span className="text-foreground font-medium">Tone:</span> Professional, evidence-based, no hype. Let the work speak.</p>
                    </div>
                  </div>
                  <div className="bg-card/80 border border-teal-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="w-4 h-4 text-teal-400" />
                      <h3 className="text-sm font-bold text-teal-400">Beginner Students</h3>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p><span className="text-foreground font-medium">Pain:</span> "I want to learn cybersecurity but don't know where to start or can't afford certs"</p>
                      <p><span className="text-foreground font-medium">Desire:</span> Cool career identity + portfolio + doing meaningful work</p>
                      <p><span className="text-foreground font-medium">Objection:</span> "This looks cool but will it actually help me get a job?"</p>
                      <p><span className="text-foreground font-medium">Counter:</span> Portfolio beats certificates. Show salary ranges. "No degree required."</p>
                      <p><span className="text-foreground font-medium">Tone:</span> Bold, aspirational, gamified. Make them feel like a protagonist.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BRAND KIT TAB */}
          <TabsContent value="brand" className="space-y-6 mt-6" data-testid="tab-brand">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-amber-400 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Brand Colors
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Core palette for all marketing materials. Click a swatch to copy the hex value.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(BRAND_COLORS).map(([key, color]) => (
                    <div
                      key={key}
                      className="bg-card/80 border border-border rounded-lg p-3 cursor-pointer hover:border-amber-800/50 transition-colors"
                      onClick={() => copyCta(color.value)}
                      data-testid={`color-${key}`}
                    >
                      <div
                        className="w-full h-16 rounded-md mb-2 border border-border"
                        style={{ backgroundColor: color.value }}
                      />
                      <p className="text-sm font-medium text-foreground">{color.label}</p>
                      <p className="text-xs text-muted-foreground font-mono">{color.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Tailwind: {color.tw}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-teal-400 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Typography
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-card/80 border border-border rounded-lg p-4">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Headlines</p>
                    <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Exo 2', sans-serif" }}>Exo 2</p>
                    <p className="text-xs text-muted-foreground mt-1">Weight: 600-700. Clean, futuristic, professional.</p>
                  </div>
                  <div className="bg-card/80 border border-border rounded-lg p-4">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Body Text</p>
                    <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>Inter</p>
                    <p className="text-xs text-muted-foreground mt-1">Weight: 400-500. Highly readable at all sizes.</p>
                  </div>
                  <div className="bg-card/80 border border-border rounded-lg p-4">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Code / Terminal</p>
                    <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>JetBrains</p>
                    <p className="text-xs text-muted-foreground mt-1">Weight: 400-500. Hacker aesthetic.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-amber-400 text-sm">Visual Style Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div className="space-y-2">
                    <p className="text-foreground font-medium">Do:</p>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" /> Dark backgrounds, molten bronze accents</li>
                      <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" /> Terminal/hacker aesthetic for screenshots</li>
                      <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" /> Real investigation screenshots, not stock photos</li>
                      <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" /> Badge/achievement graphics for social sharing</li>
                      <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" /> Subtle scanline overlay for on-brand feel</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-foreground font-medium">Don't:</p>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5 shrink-0">✕</span> Stock photos of people smiling at laptops</li>
                      <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5 shrink-0">✕</span> Green hacker-movie text (no Matrix vibes)</li>
                      <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5 shrink-0">✕</span> Bright white backgrounds or light mode</li>
                      <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5 shrink-0">✕</span> Generic "cybersecurity" imagery (padlocks, shields)</li>
                      <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5 shrink-0">✕</span> Corporate jargon ("synergy", "leverage", "ecosystem")</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
