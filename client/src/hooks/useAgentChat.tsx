import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  scanSuggestions?: Array<{ script: string; target: string; match: string }>;
}

interface ChatSession {
  id: number;
  title: string;
  createdAt: string;
  messageCount: number;
}

interface AgentChatState {
  messages: ChatMessage[];
  conversationId: number | null;
  selectedModel: string;
  isOpen: boolean;
  activeCampaignId: string | null;
  activeCampaignName: string | null;
  sessions: ChatSession[];
  loadingSessions: boolean;
}

interface AgentChatContextValue {
  state: AgentChatState;
  setMessages: (msgs: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  setConversationId: (id: number | null) => void;
  setSelectedModel: (model: string) => void;
  setIsOpen: (open: boolean) => void;
  setActiveCampaign: (id: string | null, name: string | null) => void;
  clearChat: () => void;
  loadSession: (sessionId: number) => Promise<void>;
  refreshSessions: () => Promise<void>;
  createNewSession: (title?: string) => Promise<number | null>;
}

const defaultState: AgentChatState = {
  messages: [],
  conversationId: null,
  selectedModel: 'moonshotai/kimi-k2.5',
  isOpen: false,
  activeCampaignId: null,
  activeCampaignName: null,
  sessions: [],
  loadingSessions: false,
};

const AgentChatContext = createContext<AgentChatContextValue | null>(null);

export function AgentChatProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AgentChatState>(defaultState);

  const setMessages = useCallback((msgs: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    setState(prev => ({
      ...prev,
      messages: typeof msgs === 'function' ? msgs(prev.messages) : msgs,
    }));
  }, []);

  const setConversationId = useCallback((id: number | null) => {
    setState(prev => ({ ...prev, conversationId: id }));
  }, []);

  const setSelectedModel = useCallback((model: string) => {
    setState(prev => ({ ...prev, selectedModel: model }));
  }, []);

  const setIsOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, isOpen: open }));
  }, []);

  const setActiveCampaign = useCallback((id: string | null, name: string | null) => {
    setState(prev => ({ ...prev, activeCampaignId: id, activeCampaignName: name }));
  }, []);

  const clearChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      conversationId: null,
      activeCampaignId: null,
      activeCampaignName: null,
    }));
  }, []);

  const refreshSessions = useCallback(async () => {
    setState(prev => ({ ...prev, loadingSessions: true }));
    try {
      const token = localStorage.getItem('APP_ACCESS_TOKEN') || 'sy-corp-dev-token';
      const res = await fetch('/api/conversations', {
        headers: { 'x-access-token': token },
      });
      if (res.ok) {
        const data = await res.json();
        const sessions: ChatSession[] = (data || []).map((c: any) => ({
          id: c.id,
          title: c.title || `Session ${c.id}`,
          createdAt: c.createdAt || c.created_at || new Date().toISOString(),
          messageCount: c.messageCount || 0,
        }));
        setState(prev => ({ ...prev, sessions, loadingSessions: false }));
      } else {
        setState(prev => ({ ...prev, loadingSessions: false }));
      }
    } catch {
      setState(prev => ({ ...prev, loadingSessions: false }));
    }
  }, []);

  const loadSession = useCallback(async (sessionId: number) => {
    try {
      const token = localStorage.getItem('APP_ACCESS_TOKEN') || 'sy-corp-dev-token';
      const res = await fetch(`/api/conversations/${sessionId}/messages`, {
        headers: { 'x-access-token': token },
      });
      if (res.ok) {
        const data = await res.json();
        const messages: ChatMessage[] = (data || []).map((m: any) => ({
          role: m.role as ChatMessage['role'],
          content: m.content,
        }));
        setState(prev => ({
          ...prev,
          messages,
          conversationId: sessionId,
          isOpen: true,
        }));
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  }, []);

  const createNewSession = useCallback(async (title?: string): Promise<number | null> => {
    try {
      const token = localStorage.getItem('APP_ACCESS_TOKEN') || 'sy-corp-dev-token';
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-access-token': token },
        body: JSON.stringify({ title: title || `Session ${Date.now()}` }),
      });
      if (res.ok) {
        const data = await res.json();
        setState(prev => ({
          ...prev,
          messages: [],
          conversationId: data.id,
          activeCampaignId: null,
          activeCampaignName: null,
        }));
        refreshSessions();
        return data.id;
      }
    } catch (err) {
      console.error('Failed to create session:', err);
    }
    return null;
  }, [refreshSessions]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  return (
    <AgentChatContext.Provider value={{
      state, setMessages, setConversationId, setSelectedModel,
      setIsOpen, setActiveCampaign, clearChat, loadSession,
      refreshSessions, createNewSession,
    }}>
      {children}
    </AgentChatContext.Provider>
  );
}

export function useAgentChat() {
  const ctx = useContext(AgentChatContext);
  if (!ctx) throw new Error('useAgentChat must be used within AgentChatProvider');
  return ctx;
}
