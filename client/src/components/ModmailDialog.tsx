import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { HelpCircle, Send, CheckCircle, Clock, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGame } from '@/hooks/useGameSession';

const CATEGORIES = [
  { value: 'general', label: 'General Question' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'help', label: 'Need Help' },
  { value: 'question', label: 'Technical Question' }
];

const STATUS_ICONS = {
  open: <Clock className="w-3 h-3 text-amber-500" />,
  in_progress: <MessageCircle className="w-3 h-3 text-blue-500" />,
  resolved: <CheckCircle className="w-3 h-3 text-emerald-500" />,
  closed: <CheckCircle className="w-3 h-3 text-muted-foreground" />
};

export function ModmailDialog() {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [showMyTickets, setShowMyTickets] = useState(false);
  const { toast } = useToast();
  const { gameState } = useGame();
  const sessionToken = gameState.sessionToken;
  const username = gameState.username;
  const queryClient = useQueryClient();

  const { data: myTickets = [] } = useQuery({
    queryKey: ['my-modmail'],
    queryFn: async () => {
      const res = await fetch('/api/modmail/my-tickets', {
        headers: { 'x-session-token': sessionToken }
      });
      if (!res.ok) throw new Error('Failed to fetch tickets');
      return res.json();
    },
    enabled: open && !!sessionToken
  });

  const submitTicket = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/modmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, category, username, sessionToken })
      });
      if (!res.ok) throw new Error('Failed to submit ticket');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Message sent!', description: 'We\'ll get back to you soon.' });
      setSubject('');
      setMessage('');
      setCategory('general');
      queryClient.invalidateQueries({ queryKey: ['my-modmail'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to send message. Please try again.', variant: 'destructive' });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-amber-400/70 hover:text-amber-300 hover:bg-amber-900/20"
          data-testid="button-modmail"
        >
          <HelpCircle className="w-4 h-4 mr-1" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[hsl(var(--card))] border-amber-900/50 text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-500 font-orbitron flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Contact Support
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-3">
          <Button
            variant={!showMyTickets ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowMyTickets(false)}
            className={!showMyTickets ? 'bg-amber-700 hover:bg-amber-600' : 'border-amber-900/50'}
            data-testid="button-new-ticket"
          >
            New Message
          </Button>
          <Button
            variant={showMyTickets ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowMyTickets(true)}
            className={showMyTickets ? 'bg-amber-700 hover:bg-amber-600' : 'border-amber-900/50'}
            data-testid="button-my-tickets"
          >
            My Tickets ({myTickets.length})
          </Button>
        </div>

        {!showMyTickets ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground uppercase">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-black/50 border-border" data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--card))] border-amber-900/50">
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground uppercase">Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your question..."
                className="bg-black/50 border-border"
                maxLength={200}
                data-testid="input-subject"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground uppercase">Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question or issue in detail..."
                className="bg-black/50 border-border min-h-[120px]"
                maxLength={5000}
                data-testid="input-message"
              />
            </div>

            <Button
              onClick={() => submitTicket.mutate()}
              disabled={!subject.trim() || !message.trim() || submitTicket.isPending}
              className="w-full bg-amber-700 hover:bg-amber-600 text-black"
              data-testid="button-submit-ticket"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitTicket.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {myTickets.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No tickets yet</p>
            ) : (
              myTickets.map((ticket: any) => (
                <div
                  key={ticket.ticketId}
                  className="bg-black/30 border border-border rounded-md p-3"
                  data-testid={`ticket-${ticket.ticketId}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-amber-500 font-mono">{ticket.ticketId}</span>
                    <div className="flex items-center gap-1 text-xs">
                      {STATUS_ICONS[ticket.status as keyof typeof STATUS_ICONS]}
                      <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-medium text-foreground">{ticket.subject}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ticket.message}</p>
                  {ticket.adminResponse && (
                    <div className="mt-2 p-2 bg-amber-900/20 rounded border-l-2 border-amber-600">
                      <p className="text-xs text-muted-foreground">
                        <span className="text-amber-400">Admin:</span> {ticket.adminResponse}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}