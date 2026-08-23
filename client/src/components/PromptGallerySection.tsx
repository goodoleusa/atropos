import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { useGame } from '@/hooks/useGameSession';
import { ArrowRight, Users, Copy, Check, History, AlertTriangle } from 'lucide-react';

interface PromptGalleryEntry {
  id: number;
  title: string;
  description: string;
  prompt: string;
  category: string;
  tool: string;
  tags: string[];
  status: string;
  riskFlags?: string[];
  createdAt?: string;
  username?: string;
}

interface PromptGallerySectionProps {
  defaultPrompt?: string;
  defaultTitle?: string;
}

const CATEGORY_OPTIONS = [
  'atropos',
  'osint',
  'investigation',
  'campaign',
  'story',
  'training',
  'analysis'
];

const TOOL_OPTIONS = ['atropos'];

export function PromptGallerySection({ defaultPrompt = '', defaultTitle = '' }: PromptGallerySectionProps) {
  const { gameState } = useGame();
  const [galleryPrompts, setGalleryPrompts] = useState<PromptGalleryEntry[]>([]);
  const [myPrompts, setMyPrompts] = useState<PromptGalleryEntry[]>([]);
  const [galleryTab, setGalleryTab] = useState<'community' | 'mine'>('community');
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [loadingMine, setLoadingMine] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [submissionNote, setSubmissionNote] = useState<{ type: 'info' | 'warning' | 'success' | 'error'; message: string } | null>(null);
  const [draft, setDraft] = useState({
    title: '',
    description: '',
    prompt: '',
    category: 'atropos',
    tags: '',
    tool: 'atropos'
  });

  useEffect(() => {
    if (defaultPrompt && !draft.prompt.trim()) {
      setDraft((prev) => ({ ...prev, prompt: defaultPrompt }));
    }
  }, [defaultPrompt, draft.prompt]);

  useEffect(() => {
    if (defaultTitle && !draft.title.trim()) {
      setDraft((prev) => ({ ...prev, title: defaultTitle.slice(0, 80) }));
    }
  }, [defaultTitle, draft.title]);

  const fetchGallery = useCallback(async () => {
    setLoadingGallery(true);
    try {
      const res = await fetch('/api/prompts/gallery');
      if (res.ok) {
        const data = await res.json();
        setGalleryPrompts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to load prompt gallery:', error);
    } finally {
      setLoadingGallery(false);
    }
  }, []);

  const fetchMine = useCallback(async (token: string) => {
    setLoadingMine(true);
    try {
      const res = await fetch(`/api/prompts/gallery/mine/${token}`);
      if (res.ok) {
        const data = await res.json();
        setMyPrompts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to load prompt submissions:', error);
    } finally {
      setLoadingMine(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  useEffect(() => {
    if (gameState?.sessionToken) {
      fetchMine(gameState.sessionToken);
    }
  }, [fetchMine, gameState?.sessionToken]);

  const parseTags = (value: string) => {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 12);
  };

  const submitPrompt = async () => {
    if (!draft.title.trim() || !draft.prompt.trim()) {
      toast({
        title: 'Missing required fields',
        description: 'Add a title and prompt before submitting.',
      });
      return;
    }

    setSubmitting(true);
    setSubmissionNote(null);
    try {
      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        prompt: draft.prompt.trim(),
        category: draft.category.trim() || 'general',
        tool: draft.tool.trim() || 'atropos',
        tags: parseTags(draft.tags),
        sessionToken: gameState?.sessionToken,
        username: gameState?.username
      };
      const res = await fetch('/api/prompts/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Submission failed');
      }
      setDraft((prev) => ({
        ...prev,
        title: '',
        description: '',
        tags: '',
        prompt: data.prompt || prev.prompt
      }));
      setSubmissionNote({
        type: data.status === 'pending' ? 'warning' : 'success',
        message: data.status === 'pending'
          ? 'Submitted for review. Prompts with risky commands are held before publishing.'
          : 'Published to the gallery.'
      });
      toast({
        title: 'Prompt submitted',
        description: data.status === 'pending' ? 'Queued for review.' : 'Live in the gallery.'
      });
      fetchGallery();
      if (gameState?.sessionToken) {
        fetchMine(gameState.sessionToken);
      }
    } catch (error: any) {
      setSubmissionNote({
        type: 'error',
        message: error?.message || 'Submission failed. Try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyPrompt = (prompt: string, id: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderPromptCard = (entry: PromptGalleryEntry, showStatus = false) => {
    return (
      <div key={entry.id} className="border border-amber-900/30 rounded-lg p-3 bg-black/40 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-amber-400 text-sm font-bold">{entry.title}</p>
            {entry.description && (
              <p className="text-muted-foreground text-xs mt-1">{entry.description}</p>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="outline" className="text-[9px] border-amber-700 text-amber-500">
                {entry.category}
              </Badge>
              {entry.tags?.map((tag) => (
                <Badge key={`${entry.id}-${tag}`} variant="outline" className="text-[9px] border-border text-muted-foreground">
                  {tag}
                </Badge>
              ))}
              {showStatus && (
                <Badge
                  variant="outline"
                  className={`text-[9px] ${
                    entry.status === 'published'
                      ? 'border-teal-700 text-teal-400'
                      : entry.status === 'pending'
                        ? 'border-amber-700 text-amber-400'
                        : 'border-red-700 text-red-400'
                  }`}
                >
                  {entry.status}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyPrompt(entry.prompt, entry.id)}
            className="text-muted-foreground hover:text-amber-500"
          >
            {copiedId === entry.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <pre className="text-[10px] text-muted-foreground font-mono whitespace-pre-wrap line-clamp-4">
          {entry.prompt}
        </pre>
        {showStatus && entry.riskFlags && entry.riskFlags.length > 0 && (
          <p className="text-[10px] text-amber-500 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Flagged: {entry.riskFlags.join(', ')}
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-black/50 border-amber-900/30">
      <CardHeader>
        <CardTitle className="text-amber-500 flex items-center gap-2">
          <Users className="w-5 h-5" /> Community Prompt Gallery
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Share prompts for Atropos tools. Submissions are sanitized and risky command patterns are reviewed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-4">
          <div className="space-y-3">
            <div>
              <Label className="text-amber-600 text-sm">Title</Label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Atropos Recon Starter"
                className="bg-black/50 border-amber-900/30 text-foreground text-sm"
              />
            </div>
            <div>
              <Label className="text-amber-600 text-sm">Description</Label>
              <Textarea
                value={draft.description}
                onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="What this prompt helps the agent accomplish."
                className="bg-black/50 border-amber-900/30 text-foreground text-xs h-20"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-amber-600 text-sm">Category</Label>
                <Input
                  list="prompt-gallery-categories"
                  value={draft.category}
                  onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
                  className="bg-black/50 border-amber-900/30 text-foreground text-xs"
                />
                <datalist id="prompt-gallery-categories">
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label className="text-amber-600 text-sm">Tool</Label>
                <Input
                  list="prompt-gallery-tools"
                  value={draft.tool}
                  onChange={(e) => setDraft((prev) => ({ ...prev, tool: e.target.value }))}
                  className="bg-black/50 border-amber-900/30 text-foreground text-xs"
                />
                <datalist id="prompt-gallery-tools">
                  {TOOL_OPTIONS.map((tool) => (
                    <option key={tool} value={tool} />
                  ))}
                </datalist>
              </div>
            </div>
            <div>
              <Label className="text-amber-600 text-sm">Tags (comma separated)</Label>
              <Input
                value={draft.tags}
                onChange={(e) => setDraft((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="osint, investigation, workflow"
                className="bg-black/50 border-amber-900/30 text-foreground text-xs"
              />
            </div>
            <div>
              <Label className="text-amber-600 text-sm">Prompt Content</Label>
              <Textarea
                value={draft.prompt}
                onChange={(e) => setDraft((prev) => ({ ...prev, prompt: e.target.value }))}
                placeholder="Paste or generate a prompt to share."
                className="bg-black/50 border-amber-900/30 text-foreground text-xs h-40 font-mono"
              />
            </div>
            <Button
              onClick={submitPrompt}
              disabled={submitting}
              className="bg-amber-700 hover:bg-amber-600 text-black"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit to Gallery'}
            </Button>
            {submissionNote && (
              <div
                className={`text-xs border rounded p-2 ${
                  submissionNote.type === 'success'
                    ? 'border-teal-900/40 text-teal-400 bg-teal-900/10'
                    : submissionNote.type === 'warning'
                      ? 'border-amber-900/40 text-amber-400 bg-amber-900/10'
                      : submissionNote.type === 'error'
                        ? 'border-red-900/40 text-red-400 bg-red-900/10'
                        : 'border-border text-muted-foreground'
                }`}
              >
                {submissionNote.message}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Tabs value={galleryTab} onValueChange={(value) => setGalleryTab(value as 'community' | 'mine')}>
              <TabsList className="bg-[hsl(var(--card))] border border-amber-900/30 w-full justify-start">
                <TabsTrigger value="community" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-500">
                  <Users className="w-3 h-3 mr-1" /> Community
                </TabsTrigger>
                <TabsTrigger value="mine" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-500">
                  <History className="w-3 h-3 mr-1" /> My Submissions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="community" className="mt-3">
                <ScrollArea className="h-[420px] pr-2">
                  {loadingGallery ? (
                    <p className="text-xs text-muted-foreground">Loading gallery...</p>
                  ) : galleryPrompts.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No published prompts yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {galleryPrompts.map((entry) => renderPromptCard(entry))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="mine" className="mt-3">
                <ScrollArea className="h-[420px] pr-2">
                  {loadingMine ? (
                    <p className="text-xs text-muted-foreground">Loading submissions...</p>
                  ) : myPrompts.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No submissions yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {myPrompts.map((entry) => renderPromptCard(entry, true))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
