import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

const SF_DIR = path.resolve(process.cwd(), 'spiderfoot');
const SF_SCRIPT = path.join(SF_DIR, 'sf.py');

export interface SpiderFootScanParams {
  target: string;
  modules?: string[];
  useCase?: 'all' | 'footprint' | 'investigate' | 'passive';
  eventTypes?: string[];
  maxThreads?: number;
}

export interface SpiderFootResult {
  type: string;
  data: string;
  module: string;
  source?: string;
}

export interface SpiderFootScanResponse {
  scanId: string;
  target: string;
  status: 'running' | 'completed' | 'error';
  results: SpiderFootResult[];
  startedAt: string;
  completedAt?: string;
  error?: string;
  moduleCount: number;
  resultCount: number;
}

const activeScanProcesses = new Map<string, { process: any; abortController: AbortController }>();

async function checkAvailability(): Promise<{ available: boolean; version?: string; error?: string }> {
  try {
    await fs.access(SF_SCRIPT);
    return new Promise((resolve) => {
      const proc = spawn('python3', [SF_SCRIPT, '-V'], { cwd: SF_DIR, timeout: 10000 });
      let output = '';
      proc.stdout.on('data', (d: Buffer) => { output += d.toString(); });
      proc.stderr.on('data', (d: Buffer) => { output += d.toString(); });
      proc.on('close', (code: number) => {
        if (code === 0) {
          resolve({ available: true, version: output.trim() });
        } else {
          resolve({ available: false, error: output.trim() });
        }
      });
      proc.on('error', (err: Error) => resolve({ available: false, error: err.message }));
    });
  } catch {
    return { available: false, error: 'SpiderFoot not found at ' + SF_DIR };
  }
}

async function listModules(): Promise<Array<{ id: string; name: string; description: string }>> {
  return new Promise((resolve) => {
    const proc = spawn('python3', [SF_SCRIPT, '-M'], { cwd: SF_DIR, timeout: 15000 });
    let output = '';
    proc.stdout.on('data', (d: Buffer) => { output += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { output += d.toString(); });
    proc.on('close', () => {
      const modules = output.split('\n')
        .filter(line => line.trim().startsWith('sfp_'))
        .map(line => {
          const parts = line.trim().split(/\s+/);
          const id = parts[0];
          const desc = parts.slice(1).join(' ');
          return { id, name: id.replace('sfp_', '').replace(/_/g, ' '), description: desc || id };
        });
      resolve(modules);
    });
    proc.on('error', () => resolve([]));
  });
}

async function listEventTypes(): Promise<string[]> {
  return new Promise((resolve) => {
    const proc = spawn('python3', [SF_SCRIPT, '-T'], { cwd: SF_DIR, timeout: 15000 });
    let output = '';
    proc.stdout.on('data', (d: Buffer) => { output += d.toString(); });
    proc.on('close', () => {
      const types = output.split('\n')
        .map(l => l.trim())
        .filter(l => l && l === l.toUpperCase() && l.length > 2 && !l.startsWith('-'));
      resolve(types);
    });
    proc.on('error', () => resolve([]));
  });
}

function runScan(params: SpiderFootScanParams, apiKeys?: Record<string, string>): { scanId: string; promise: Promise<SpiderFootScanResponse> } {
  const scanId = `sf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = new Date().toISOString();
  const abortController = new AbortController();

  const args: string[] = [SF_SCRIPT, '-s', params.target, '-o', 'json', '-q'];

  if (params.modules && params.modules.length > 0) {
    args.push('-m', params.modules.join(','));
  } else if (params.useCase) {
    args.push('-u', params.useCase);
  } else {
    args.push('-u', 'passive');
  }

  if (params.eventTypes && params.eventTypes.length > 0) {
    args.push('-t', params.eventTypes.join(','));
  }

  if (!args.includes('-max-threads')) {
    args.push('-max-threads', String(params.maxThreads || 3));
  }

  const env = { ...process.env };
  if (apiKeys) {
    Object.entries(apiKeys).forEach(([key, value]) => {
      if (value) env[`SF_${key.toUpperCase()}`] = value;
    });
  }

  const promise = new Promise<SpiderFootScanResponse>((resolve) => {
    const proc = spawn('python3', args, {
      cwd: SF_DIR,
      timeout: 300000,
      env,
      signal: abortController.signal,
    });

    activeScanProcesses.set(scanId, { process: proc, abortController });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });

    proc.on('close', (code: number | null) => {
      activeScanProcesses.delete(scanId);

      if (code !== 0 && !stdout.trim()) {
        resolve({
          scanId,
          target: params.target,
          status: 'error',
          results: [],
          startedAt,
          completedAt: new Date().toISOString(),
          error: stderr || `Process exited with code ${code}`,
          moduleCount: params.modules?.length || 0,
          resultCount: 0,
        });
        return;
      }

      let results: SpiderFootResult[] = [];
      const trimmed = stdout.trim();

      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          results = parsed.map((item: any) => ({
            type: item.type || 'UNKNOWN',
            data: item.data || '',
            module: item.module || 'unknown',
            source: item.source || undefined,
          }));
        }
      } catch {
        const lines = trimmed.split('\n').filter((l: string) => l.trim());
        for (const line of lines) {
          try {
            const item = JSON.parse(line);
            if (item.type && item.data) {
              results.push({
                type: item.type,
                data: item.data,
                module: item.module || 'unknown',
                source: item.source || undefined,
              });
            }
          } catch {
            const parts = line.split('\t');
            if (parts.length >= 3) {
              results.push({
                type: parts[0],
                data: parts[1],
                module: parts[2],
                source: parts[3],
              });
            }
          }
        }
      }

      resolve({
        scanId,
        target: params.target,
        status: 'completed',
        results,
        startedAt,
        completedAt: new Date().toISOString(),
        moduleCount: params.modules?.length || 0,
        resultCount: results.length,
      });
    });

    proc.on('error', (err: Error) => {
      activeScanProcesses.delete(scanId);
      resolve({
        scanId,
        target: params.target,
        status: 'error',
        results: [],
        startedAt,
        completedAt: new Date().toISOString(),
        error: err.message,
        moduleCount: 0,
        resultCount: 0,
      });
    });
  });

  return { scanId, promise };
}

function cancelScan(scanId: string): boolean {
  const entry = activeScanProcesses.get(scanId);
  if (entry) {
    entry.abortController.abort();
    activeScanProcesses.delete(scanId);
    return true;
  }
  return false;
}

function getActiveScans(): string[] {
  return Array.from(activeScanProcesses.keys());
}

const MODULE_PRESETS: Record<string, string[]> = {
  all: [],
  full_passive: ['sfp_dnsresolve', 'sfp_crt', 'sfp_certspotter', 'sfp_dnsdumpster', 'sfp_hackertarget', 'sfp_shodan', 'sfp_virustotal', 'sfp_email', 'sfp_accounts', 'sfp_whois', 'sfp_spider', 'sfp_httpheaders', 'sfp_webanalytics', 'sfp_abusech', 'sfp_abuseipdb', 'sfp_alienvault'],
  dns_basic: ['sfp_dnsresolve', 'sfp_dnsbrute', 'sfp_dnszonexfer', 'sfp_dnscommonsrv', 'sfp_dnsdumpster'],
  email_harvest: ['sfp_email', 'sfp_emailformat', 'sfp_hunter', 'sfp_skymem', 'sfp_snov'],
  subdomain_enum: ['sfp_crt', 'sfp_certspotter', 'sfp_dnsdumpster', 'sfp_hackertarget', 'sfp_subdomainfinder', 'sfp_sublist3r'],
  threat_intel: ['sfp_abusech', 'sfp_abuseipdb', 'sfp_alienvault', 'sfp_blocklistde', 'sfp_cinsscore', 'sfp_cleantalk'],
  social_media: ['sfp_accounts', 'sfp_instagram', 'sfp_twitter', 'sfp_linkedin', 'sfp_skymem'],
  web_recon: ['sfp_spider', 'sfp_cookie', 'sfp_websvr', 'sfp_httpheaders', 'sfp_webanalytics', 'sfp_builtwith'],
};

const API_KEY_SERVICES = [
  { key: 'SHODAN_API', service: 'Shodan', description: 'Device/port scanning & IoT search', url: 'https://shodan.io', free: true },
  { key: 'VIRUSTOTAL_API', service: 'VirusTotal', description: 'Malware analysis & file scanning', url: 'https://virustotal.com', free: true },
  { key: 'SECURITYTRAILS_API', service: 'SecurityTrails', description: 'DNS history & subdomain data', url: 'https://securitytrails.com', free: true },
  { key: 'CENSYS_API', service: 'Censys', description: 'Internet-wide scanning data', url: 'https://censys.io', free: true },
  { key: 'BINARYEDGE_API', service: 'BinaryEdge', description: 'Threat intelligence & scanning', url: 'https://binaryedge.io', free: true },
  { key: 'HUNTER_API', service: 'Hunter.io', description: 'Email finder & verifier', url: 'https://hunter.io', free: true },
  { key: 'FULLCONTACT_API', service: 'FullContact', description: 'Person/company enrichment', url: 'https://fullcontact.com', free: false },
  { key: 'ABUSEIPDB_API', service: 'AbuseIPDB', description: 'IP address abuse reports', url: 'https://abuseipdb.com', free: true },
  { key: 'ALIENVAULT_API', service: 'AlienVault OTX', description: 'Open threat exchange', url: 'https://otx.alienvault.com', free: true },
  { key: 'IPINFO_API', service: 'IPInfo', description: 'IP geolocation & ASN data', url: 'https://ipinfo.io', free: true },
  { key: 'GREYNOISE_API', service: 'GreyNoise', description: 'Internet noise & scanner data', url: 'https://greynoise.io', free: true },
  { key: 'HAVEIBEENPWNED_API', service: 'HaveIBeenPwned', description: 'Data breach search', url: 'https://haveibeenpwned.com', free: false },
];

export const spiderfootService = {
  checkAvailability,
  listModules,
  listEventTypes,
  runScan,
  cancelScan,
  getActiveScans,
  MODULE_PRESETS,
  API_KEY_SERVICES,
};
