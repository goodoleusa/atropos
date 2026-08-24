// TEMPLATE: Agent Feedback Parser Hook
// Detects [FEEDBACK:type:priority:title:description] tags in AI responses
// and auto-submits them to the feedback API.
//
// SAFETY GUARDS against infinite loops:
// 1. Session cap: max 20 submissions per chat session
// 2. Per-message cap: max 3 feedback items per response
// 3. Cooldown: 5 seconds between submissions
// 4. Dedup: title-based hash prevents duplicate reports
// 5. Fire-and-forget: failures never break the chat flow

import { useRef, useCallback } from "react";

const MAX_FEEDBACK_PER_SESSION = 20;
const MAX_FEEDBACK_PER_MESSAGE = 3;
const FEEDBACK_COOLDOWN_MS = 5000;

export function useFeedbackParser() {
  const submittedRef = useRef<Set<string>>(new Set());
  const cooldownRef = useRef<number>(0);
  const sessionCountRef = useRef<number>(0);

  const parseAndSubmit = useCallback((message: string, source: string) => {
    // TEMPLATE: Guard 1 — session cap
    if (sessionCountRef.current >= MAX_FEEDBACK_PER_SESSION) return;

    // TEMPLATE: Guard 2 — cooldown
    const now = Date.now();
    if (now - cooldownRef.current < FEEDBACK_COOLDOWN_MS) return;

    // TEMPLATE: Parse feedback tags from message
    const pattern = /\[FEEDBACK:(bug|feature|idea|pain_point):(low|medium|high|critical):([^:]+):([^\]]+)\]/g;
    const items: Array<{ type: string; priority: string; title: string; description: string }> = [];
    let match;
    let count = 0;

    while ((match = pattern.exec(message)) !== null && count < MAX_FEEDBACK_PER_MESSAGE) {
      // TEMPLATE: Guard 3 — dedup by normalized title
      const dedupKey = `${match[1]}:${match[3].trim().toLowerCase().slice(0, 60)}`;
      if (submittedRef.current.has(dedupKey)) continue;

      items.push({
        type: match[1],
        priority: match[2],
        title: match[3].trim().slice(0, 200),
        description: match[4].trim().slice(0, 2000),
      });
      submittedRef.current.add(dedupKey);
      count++;
    }

    if (items.length === 0) return;
    cooldownRef.current = now;

    // TEMPLATE: Guard 4 — fire-and-forget submission, errors silently ignored
    for (const item of items) {
      if (sessionCountRef.current >= MAX_FEEDBACK_PER_SESSION) break;
      sessionCountRef.current++;
      fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          source: `agent:${source}`,
          tags: ["auto-reported", source],
        }),
      }).catch(() => {});
    }
  }, []);

  return { parseAndSubmit };
}
