import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { SpiderFootResult } from './spiderfoot';

// Mirrors flowsearch's leads.jsonl design (scripts/reader/c_scout_server.py:
// spider/leads/promote) so both apps share one raw-investigation/lead-sourcing
// model: a scan's individual findings land here untriaged (status "new")
// instead of being treated as evidence immediately; `promote` is the explicit
// step that marks selected leads as reviewed and worth keeping. Append-only —
// a later record for the same id carries only the fields that changed (e.g. a
// promote update), so the file itself is the audit trail of what got promoted
// and when, same convention as the .spiderfoot-keys.json / scanHistory state
// already living at the repo root.
const LEADS_FILE = path.resolve(process.cwd(), '.spider-leads.jsonl');

export interface SpiderLead {
  id: string;
  ts: string;
  scanId: string;
  target: string;
  status: 'new' | 'promoted';
  type: string;
  data: string;
  module: string;
  source?: string;
  promotedAt?: string;
}

async function appendLines(lines: string[]): Promise<void> {
  await fs.appendFile(LEADS_FILE, lines.map(l => l + '\n').join(''));
}

export async function sourceLeads(scanId: string, target: string, results: SpiderFootResult[]): Promise<SpiderLead[]> {
  const ts = new Date().toISOString();
  const leads: SpiderLead[] = results.map(r => ({
    id: randomUUID().slice(0, 16),
    ts,
    scanId,
    target,
    status: 'new',
    type: r.type,
    data: r.data,
    module: r.module,
    source: r.source,
  }));
  await appendLines(leads.map(l => JSON.stringify(l)));
  return leads;
}

async function readLeadsLog(): Promise<Map<string, SpiderLead>> {
  const byId = new Map<string, SpiderLead>();
  if (!fsSync.existsSync(LEADS_FILE)) return byId;
  const text = await fs.readFile(LEADS_FILE, 'utf-8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const rec = JSON.parse(trimmed) as Partial<SpiderLead> & { id: string };
      const existing = byId.get(rec.id) || ({} as SpiderLead);
      byId.set(rec.id, { ...existing, ...rec } as SpiderLead);
    } catch {
      // skip malformed line rather than fail the whole read
    }
  }
  return byId;
}

export async function listLeads(status?: string): Promise<SpiderLead[]> {
  const byId = await readLeadsLog();
  let leads = Array.from(byId.values());
  if (status) leads = leads.filter(l => l.status === status);
  return leads.sort((a, b) => a.ts.localeCompare(b.ts));
}

export async function promoteLeads(ids: string[]): Promise<{ promoted: SpiderLead[]; skipped: string[] }> {
  const byId = await readLeadsLog();
  const promotable = ids.filter(id => byId.get(id)?.status === 'new');
  const skipped = ids.filter(id => !promotable.includes(id));

  const promotedAt = new Date().toISOString();
  await appendLines(promotable.map(id => JSON.stringify({ id, status: 'promoted', promotedAt })));

  const promoted = promotable.map(id => ({ ...byId.get(id)!, status: 'promoted' as const, promotedAt }));
  return { promoted, skipped };
}
