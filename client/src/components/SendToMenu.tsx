import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Send, FileText, Bot, Radar, Briefcase, Check, ExternalLink } from 'lucide-react';
import type { MissionFinding } from '@/hooks/useMissionBus';
import { useUpdateFinding } from '@/hooks/useMissionBus';

interface SendToMenuProps {
  finding: MissionFinding;
  compact?: boolean;
  onSent?: (target: string) => void;
}

const TARGETS = [
  { id: 'report-builder', label: 'Report Builder', icon: FileText, path: '/investigate?tab=reports', color: 'text-amber-400', desc: 'Add as finding' },
  { id: 'nexus', label: 'NEXUS Agent', icon: Bot, path: '/agent', color: 'text-teal-400', desc: 'Analyze further' },
  { id: 'scanner', label: 'Scanner', icon: Radar, path: '/scanner', color: 'text-blue-400', desc: 'Deeper recon' },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase, path: '/investigate?tab=portfolio', color: 'text-purple-400', desc: 'Showcase work' },
] as const;

export function SendToMenu({ finding, compact = false, onSent }: SendToMenuProps) {
  const [, setLocation] = useLocation();
  const updateFinding = useUpdateFinding();

  const handleSend = (targetId: string, path: string) => {
    const newSentTo = Array.from(new Set([...finding.sentTo, targetId]));
    updateFinding.mutate(
      { id: finding.id, status: 'sent', sentTo: newSentTo },
      {
        onSuccess: () => {
          toast({ title: `Sent to ${TARGETS.find(t => t.id === targetId)?.label}`, description: finding.title });
          onSent?.(targetId);

          const params = new URLSearchParams();
          params.set('findingId', String(finding.id));
          params.set('from', 'mission-bus');
          const separator = path.includes('?') ? '&' : '?';
          setLocation(`${path}${separator}${params.toString()}`);
        },
      }
    );
  };

  const alreadySent = finding.sentTo || [];

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-1.5 text-muted-foreground hover:text-amber-400" data-testid={`send-to-trigger-${finding.id}`}>
            <Send className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[hsl(var(--card))] border-amber-900/50 w-48" align="end">
          <DropdownMenuLabel className="text-muted-foreground text-[10px]">PIPE TO</DropdownMenuLabel>
          {TARGETS.map(t => {
            const sent = alreadySent.includes(t.id);
            return (
              <DropdownMenuItem
                key={t.id}
                onClick={() => !sent && handleSend(t.id, t.path)}
                className={`text-xs ${sent ? 'opacity-40' : t.color} cursor-pointer`}
                disabled={sent}
                data-testid={`send-to-${t.id}-${finding.id}`}
              >
                {sent ? <Check className="w-3 h-3 mr-2" /> : <t.icon className="w-3 h-3 mr-2" />}
                {t.label}
                {sent && <Badge variant="outline" className="ml-auto text-[8px] border-border">sent</Badge>}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex gap-1 flex-wrap" data-testid={`send-to-bar-${finding.id}`}>
      {TARGETS.map(t => {
        const sent = alreadySent.includes(t.id);
        return (
          <Button
            key={t.id}
            variant="outline"
            size="sm"
            onClick={() => !sent && handleSend(t.id, t.path)}
            disabled={sent}
            className={`h-6 px-2 text-[10px] border-amber-900/30 ${sent ? 'opacity-40 text-muted-foreground' : t.color}`}
            data-testid={`send-to-${t.id}-${finding.id}`}
          >
            {sent ? <Check className="w-3 h-3 mr-1" /> : <t.icon className="w-3 h-3 mr-1" />}
            {t.label}
          </Button>
        );
      })}
    </div>
  );
}

export function SendToInline({ content, title, source, sourceAgent, type = 'finding', severity }: {
  content: string;
  title: string;
  source: string;
  sourceAgent?: string;
  type?: string;
  severity?: string;
}) {
  const [, setLocation] = useLocation();
  const [sending, setSending] = useState(false);

  const handleSend = async (targetId: string, path: string) => {
    setSending(true);
    try {
      const res = await fetch('/api/mission/findings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, sourceAgent, type, title, content, severity, status: 'sent', sentTo: [targetId], metadata: {} }),
      });
      const finding = await res.json();
      toast({ title: `Sent to ${TARGETS.find(t => t.id === targetId)?.label}`, description: title });

      const params = new URLSearchParams();
      params.set('findingId', String(finding.id));
      params.set('from', 'mission-bus');
      const separator = path.includes('?') ? '&' : '?';
      setLocation(`${path}${separator}${params.toString()}`);
    } catch {
      toast({ title: 'Failed to send', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-5 px-1 text-muted-foreground hover:text-amber-400" disabled={sending} data-testid="send-to-inline">
          <Send className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[hsl(var(--card))] border-amber-900/50 w-44" align="end">
        <DropdownMenuLabel className="text-muted-foreground text-[10px]">PIPE TO</DropdownMenuLabel>
        {TARGETS.map(t => (
          <DropdownMenuItem key={t.id} onClick={() => handleSend(t.id, t.path)} className={`text-xs ${t.color} cursor-pointer`} data-testid={`inline-send-${t.id}`}>
            <t.icon className="w-3 h-3 mr-2" />
            {t.label}
            <span className="ml-auto text-muted-foreground text-[9px]">{t.desc}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
