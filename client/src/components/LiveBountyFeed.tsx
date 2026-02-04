import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, ExternalLink, Loader2, RefreshCw, DollarSign, 
  Shield, AlertTriangle, Globe, Gavel, Banknote, Lock
} from 'lucide-react';
import { CYBERCRIME_REWARD_PROGRAMS } from '@/config/bountyConfig';
import { useLocation } from 'wouter';

interface FeedItem {
  title: string | null;
  link: string | null;
  description: string | null;
  pubDate: string | null;
  category: string | null;
}

interface LiveFeedData {
  items: FeedItem[];
  source: string;
  fetchedAt: string;
}

const LIVE_FEEDS = [
  { id: 'cisa', name: 'CISA Alerts', url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml', icon: Shield },
  { id: 'nvd', name: 'NVD CVE', url: 'https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss.xml', icon: AlertTriangle },
  { id: 'exploitdb', name: 'Exploit-DB', url: 'https://www.exploit-db.com/rss.xml', icon: Target },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  cybercrime: <Target className="w-4 h-4" />,
  ransomware: <Lock className="w-4 h-4" />,
  money_laundering: <Banknote className="w-4 h-4" />,
  sanctions: <Gavel className="w-4 h-4" />,
  crypto_fraud: <DollarSign className="w-4 h-4" />,
  crypto_crime: <DollarSign className="w-4 h-4" />,
  financial_crime: <Banknote className="w-4 h-4" />,
  web3: <Globe className="w-4 h-4" />,
  vulnerability: <AlertTriangle className="w-4 h-4" />,
  international: <Globe className="w-4 h-4" />,
};

interface LiveBountyFeedProps {
  onSelectTarget?: (target: string) => void;
  compact?: boolean;
}

export function LiveBountyFeed({ onSelectTarget, compact = false }: LiveBountyFeedProps) {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'bounties' | 'live'>('bounties');
  const [liveFeed, setLiveFeed] = useState<LiveFeedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(LIVE_FEEDS[0]);

  const fetchLiveFeed = async (feedUrl: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bounty-feeds?url=${encodeURIComponent(feedUrl)}`);
      if (res.ok) {
        const data = await res.json();
        setLiveFeed(data);
      }
    } catch (error) {
      console.error('Failed to fetch live feed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'live') {
      fetchLiveFeed(selectedFeed.url);
    }
  }, [activeTab, selectedFeed]);

  const handleInvestigate = (program: typeof CYBERCRIME_REWARD_PROGRAMS[0]) => {
    if (onSelectTarget) {
      onSelectTarget(program.url);
    }
    navigate('/investigate');
  };

  const groupedPrograms = CYBERCRIME_REWARD_PROGRAMS.reduce((acc, program) => {
    const cat = program.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(program);
    return acc;
  }, {} as Record<string, typeof CYBERCRIME_REWARD_PROGRAMS>);

  const categoryLabels: Record<string, string> = {
    cybercrime: 'Cybercrime',
    ransomware: 'Ransomware',
    money_laundering: 'Money Laundering',
    sanctions: 'Sanctions Evasion',
    crypto_fraud: 'Crypto Fraud',
    crypto_crime: 'Crypto Crime',
    financial_crime: 'Financial Crime',
    securities_fraud: 'Securities Fraud',
    web3: 'Web3 / DeFi',
    vulnerability: 'Vulnerabilities',
    international: 'International',
    government: 'Government',
    export_control: 'Export Control'
  };

  if (compact) {
    return (
      <Card className="bg-zinc-900/50 border-amber-900/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-200 flex items-center gap-2 text-sm">
            <Target className="w-4 h-4" /> Active Bounty Programs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {CYBERCRIME_REWARD_PROGRAMS.slice(0, 8).map((program) => (
                <div 
                  key={program.id}
                  className="flex items-center justify-between p-2 rounded bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer transition-colors"
                  onClick={() => handleInvestigate(program)}
                  data-testid={`bounty-${program.id}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{program.icon}</span>
                    <span className="text-xs text-stone-300 truncate max-w-[150px]">{program.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-amber-700/50 text-amber-400">
                    {program.rewards}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/50 border-amber-900/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-amber-200 flex items-center gap-2">
          <Target className="w-5 h-5" /> Investigation Targets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'bounties' | 'live')}>
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800/50">
            <TabsTrigger value="bounties" className="data-[state=active]:bg-amber-900/30">
              <DollarSign className="w-4 h-4 mr-2" /> Bounty Programs
            </TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-amber-900/30">
              <RefreshCw className="w-4 h-4 mr-2" /> Live Feeds
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bounties" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {Object.entries(groupedPrograms).map(([category, programs]) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-2 text-xs text-stone-400 uppercase tracking-wider">
                      {CATEGORY_ICONS[category] || <Target className="w-3 h-3" />}
                      {categoryLabels[category] || category}
                    </div>
                    <div className="space-y-2">
                      {programs.map((program) => (
                        <div
                          key={program.id}
                          className="p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-transparent hover:border-amber-900/50 cursor-pointer transition-all group"
                          onClick={() => handleInvestigate(program)}
                          data-testid={`bounty-program-${program.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{program.icon}</span>
                              <div>
                                <div className="text-sm font-medium text-stone-200 group-hover:text-amber-300 transition-colors">
                                  {program.name}
                                </div>
                                <div className="text-xs text-stone-500">{program.organization}</div>
                              </div>
                            </div>
                            <Badge className="bg-amber-900/30 text-amber-400 border-amber-700/50">
                              {program.rewards}
                            </Badge>
                          </div>
                          <p className="text-xs text-stone-400 mt-2 line-clamp-2">
                            {program.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 text-xs text-teal-400 hover:text-teal-300"
                              onClick={(e) => { e.stopPropagation(); window.open(program.url, '_blank'); }}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" /> View Program
                            </Button>
                            <Button 
                              size="sm" 
                              className="h-6 text-xs bg-amber-700 hover:bg-amber-600"
                              onClick={(e) => { e.stopPropagation(); handleInvestigate(program); }}
                            >
                              Investigate
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="live" className="mt-4">
            <div className="flex gap-2 mb-4 flex-wrap">
              {LIVE_FEEDS.map((feed) => (
                <Button
                  key={feed.id}
                  size="sm"
                  variant={selectedFeed.id === feed.id ? 'default' : 'outline'}
                  className={selectedFeed.id === feed.id ? 'bg-amber-700' : 'border-amber-900/50'}
                  onClick={() => setSelectedFeed(feed)}
                >
                  <feed.icon className="w-3 h-3 mr-1" />
                  {feed.name}
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => fetchLiveFeed(selectedFeed.url)}
                disabled={loading}
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <ScrollArea className="h-[350px]">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                </div>
              ) : liveFeed?.items?.length ? (
                <div className="space-y-2">
                  {liveFeed.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-transparent hover:border-amber-900/50 cursor-pointer transition-all"
                      onClick={() => item.link && window.open(item.link, '_blank')}
                    >
                      <div className="text-sm font-medium text-stone-200 line-clamp-2">
                        {item.title || 'Untitled'}
                      </div>
                      {item.description && (
                        <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                          {item.description.replace(/<[^>]*>/g, '')}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-stone-500">
                        {item.pubDate && <span>{new Date(item.pubDate).toLocaleDateString()}</span>}
                        {item.category && <Badge variant="outline" className="text-[10px]">{item.category}</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-stone-500 py-8">
                  No feed data available. Click refresh to fetch.
                </div>
              )}
            </ScrollArea>
            {liveFeed && (
              <div className="text-[10px] text-stone-600 mt-2 text-right">
                Source: {liveFeed.source} • Updated: {new Date(liveFeed.fetchedAt).toLocaleTimeString()}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default LiveBountyFeed;
