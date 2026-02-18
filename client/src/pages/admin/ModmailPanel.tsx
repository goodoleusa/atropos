import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";

export function ModmailPanel() {
  const { data: tickets, isLoading, refetch } = useQuery<any[]>({
    queryKey: ['/api/admin/modmail'],
    queryFn: () => fetch('/api/admin/modmail').then(r => r.ok ? r.json() : [])
  });

  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('open');

  const handleRespond = async () => {
    if (!selectedTicket) return;
    
    const res = await fetch(`/api/admin/modmail/${selectedTicket.ticketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminResponse: response,
        status,
        respondedBy: 'Admin'
      })
    });

    if (res.ok) {
      refetch();
      setSelectedTicket(null);
      setResponse('');
    }
  };

  if (isLoading) {
    return <div className="text-stone-500 p-4">Loading modmail...</div>;
  }

  const openTickets = tickets?.filter(t => t.status === 'open' || t.status === 'in_progress') || [];
  const closedTickets = tickets?.filter(t => t.status === 'resolved' || t.status === 'closed') || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-orbitron text-amber-500 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Modmail Inbox
        </h3>
        <div className="flex gap-2">
          <Badge className="bg-amber-900/50 text-amber-400">{openTickets.length} Open</Badge>
          <Badge className="bg-stone-800 text-stone-400">{closedTickets.length} Closed</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-[#0a0500] border-amber-900/30">
          <CardHeader>
            <CardTitle className="text-amber-400 text-sm">Tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
            {tickets?.length === 0 && (
              <p className="text-stone-500 text-sm text-center py-4">No tickets yet</p>
            )}
            {tickets?.map(ticket => (
              <div
                key={ticket.ticketId}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-3 rounded-md cursor-pointer border transition-colors ${
                  selectedTicket?.ticketId === ticket.ticketId
                    ? 'bg-amber-900/30 border-amber-600/50'
                    : 'bg-black/30 border-stone-800 hover:border-stone-700'
                }`}
                data-testid={`admin-ticket-${ticket.ticketId}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-stone-500">{ticket.ticketId}</span>
                  <Badge variant="outline" className={`text-[10px] ${
                    ticket.status === 'open' ? 'border-amber-600 text-amber-400' :
                    ticket.status === 'in_progress' ? 'border-blue-600 text-blue-400' :
                    'border-stone-600 text-stone-400'
                  }`}>
                    {ticket.status}
                  </Badge>
                </div>
                <h4 className="text-sm font-medium text-stone-200 truncate">{ticket.subject}</h4>
                <p className="text-xs text-stone-500">From: {ticket.username}</p>
                <p className="text-[10px] text-stone-600 mt-1">
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-[#0a0500] border-amber-900/30">
          <CardHeader>
            <CardTitle className="text-amber-400 text-sm">
              {selectedTicket ? `Ticket: ${selectedTicket.ticketId}` : 'Select a ticket'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTicket ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-[10px] text-stone-500 uppercase">Subject</Label>
                  <p className="text-sm text-stone-200">{selectedTicket.subject}</p>
                </div>
                <div>
                  <Label className="text-[10px] text-stone-500 uppercase">Message</Label>
                  <p className="text-sm text-stone-300 bg-black/30 p-2 rounded">{selectedTicket.message}</p>
                </div>
                <div>
                  <Label className="text-[10px] text-stone-500 uppercase">Category</Label>
                  <Badge variant="outline" className="ml-2">{selectedTicket.category}</Badge>
                </div>

                <div className="border-t border-stone-800 pt-3">
                  <Label className="text-[10px] text-stone-500 uppercase">Your Response</Label>
                  <Textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response..."
                    className="bg-black/50 border-stone-700 min-h-[80px] mt-1"
                    data-testid="input-admin-response"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-black/50 border border-stone-700 rounded px-2 py-1 text-sm text-stone-300"
                    data-testid="select-ticket-status"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <Button
                    onClick={handleRespond}
                    className="flex-1 bg-amber-700 hover:bg-amber-600"
                    data-testid="button-send-response"
                  >
                    Send Response
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-stone-500 text-sm text-center py-8">
                Click on a ticket to view details and respond
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
