/**
 * Atropos integration: Option A (standalone binary). Spawns the atropos CLI for scans.
 * Option B (embedded library) would swap the implementation behind this same interface
 * (executeScript, listScripts, getScript, checkBinary) without changing callers.
 */
import { execFile, spawn } from 'child_process';
import { promisify } from 'util';
import { nanoid } from 'nanoid';
import path from 'path';
import fs from 'fs/promises';
import { storage } from '../storage';
import type { InsertOsintToolCall } from '@shared/schema';

const execFileAsync = promisify(execFile);

const ALLOWED_SCRIPT_PATTERN = /^[a-zA-Z0-9_-]+\.lua$/;
const SAFE_TARGET_PATTERN = /^[a-zA-Z0-9._@:/-]+$/;

export interface AtroposScanParams {
  scriptPath: string;
  target: string;
  outputPath?: string;
  sessionToken?: string;
  investigationId?: string;
  source?: 'manual' | 'terminal' | 'chat' | 'campaign' | 'report';
}

export interface AtroposScanResult {
  success: boolean;
  scanId?: string;
  data?: any;
  error?: string;
  output?: string;
  latencyMs: number;
}

export interface AtroposScriptInfo {
  scriptId: string;
  name: string;
  description?: string;
  category: 'osint' | 'vulnerability' | 'secret_detection' | 'general';
  path: string;
}

export class AtroposService {
  private binaryPath: string = '';
  private scriptsDir: string;
  
  constructor() {
    this.scriptsDir = process.env.ATROPOS_SCRIPTS_DIR || 
                     path.join(process.cwd(), 'tools', 'atropos', 'examples');
  }
  
  private async resolveBinaryPath(): Promise<string> {
    if (this.binaryPath) return this.binaryPath;
    
    const candidates = [
      process.env.ATROPOS_BINARY_PATH,
      path.join(process.cwd(), 'dist', 'bin', 'atropos'),
      path.join(process.cwd(), 'tools', 'atropos', 'target', 'release', 'atropos'),
      '/usr/local/bin/atropos',
      'atropos'
    ].filter(Boolean) as string[];
    
    for (const candidate of candidates) {
      try {
        await fs.access(candidate, fs.constants.X_OK);
        this.binaryPath = candidate;
        return candidate;
      } catch {
        continue;
      }
    }
    
    this.binaryPath = 'atropos';
    return 'atropos';
  }
  
  private sanitizeTarget(target: string): string {
    if (!SAFE_TARGET_PATTERN.test(target)) {
      throw new Error('Invalid target format: contains unsafe characters');
    }
    return target.slice(0, 500);
  }
  
  private validateScriptPath(scriptPath: string): void {
    const basename = path.basename(scriptPath);
    if (!ALLOWED_SCRIPT_PATTERN.test(basename)) {
      throw new Error('Invalid script path: must be a .lua file with alphanumeric name');
    }
    if (scriptPath.includes('..')) {
      throw new Error('Invalid script path: directory traversal not allowed');
    }
  }
  
  /**
   * Check if atropos binary exists and is executable
   */
  async checkBinary(): Promise<{ available: boolean; path: string; error?: string }> {
    try {
      const binaryPath = await this.resolveBinaryPath();
      const { stdout } = await execFileAsync(binaryPath, ['--version']);
      
      return { available: true, path: binaryPath };
    } catch (error: any) {
      const binaryPath = this.binaryPath || 'atropos';
      return { 
        available: false, 
        path: binaryPath,
        error: 'Atropos binary not found. Build it first with: cd tools/atropos && cargo build --release'
      };
    }
  }
  
  /**
   * Execute an Atropos scan with a Lua script
   */
  async executeScript(params: AtroposScanParams): Promise<AtroposScanResult> {
    const startTime = Date.now();
    const scanId = `scan_${nanoid(12)}`;
    
    try {
      this.validateScriptPath(params.scriptPath);
      const sanitizedTarget = this.sanitizeTarget(params.target);
      
      const scriptPath = path.isAbsolute(params.scriptPath) 
        ? params.scriptPath 
        : path.join(this.scriptsDir, params.scriptPath);
      
      await fs.access(scriptPath);
      
      const binaryCheck = await this.checkBinary();
      if (!binaryCheck.available) {
        return {
          success: false,
          scanId,
          error: binaryCheck.error || 'Atropos binary not available',
          latencyMs: Date.now() - startTime
        };
      }
      
      const outputPath = params.outputPath || path.join(process.cwd(), 'dist', 'atropos-results', `${scanId}.json`);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      
      const binaryPath = await this.resolveBinaryPath();
      const args = ['scan', scriptPath, '-t', sanitizedTarget, '-o', outputPath];
      
      const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        const proc = spawn(binaryPath, args, { timeout: 300000 });
        
        proc.stdout.on('data', (data) => { stdout += data.toString(); });
        proc.stderr.on('data', (data) => { stderr += data.toString(); });
        proc.on('close', (code) => {
          if (code === 0) resolve({ stdout, stderr });
          else reject(new Error(`Process exited with code ${code}: ${stderr}`));
        });
        proc.on('error', reject);
      });
      
      const latencyMs = Date.now() - startTime;
      
      // Try to read results
      let data: any = null;
      try {
        const resultContent = await fs.readFile(outputPath, 'utf-8');
        data = JSON.parse(resultContent);
      } catch (parseError) {
        // Results might not be JSON, that's okay
        data = { raw: stdout, stderr };
      }
      
      // Log tool call if session provided
      if (params.sessionToken) {
        await this.logToolCall({
          sessionToken: params.sessionToken,
          investigationId: params.investigationId,
          scanId,
          scriptPath: params.scriptPath,
          target: params.target,
          status: 'success',
          data,
          source: params.source || 'manual',
          latencyMs
        });
      }
      
      return {
        success: true,
        scanId,
        data,
        output: stdout,
        latencyMs
      };
      
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      
      // Log failed tool call
      if (params.sessionToken) {
        await this.logToolCall({
          sessionToken: params.sessionToken,
          investigationId: params.investigationId,
          scanId,
          scriptPath: params.scriptPath,
          target: params.target,
          status: 'error',
          error: error.message,
          source: params.source || 'manual',
          latencyMs
        });
      }
      
      return {
        success: false,
        scanId,
        error: error.message || 'Unknown error executing scan',
        latencyMs
      };
    }
  }
  
  /**
   * List available Lua scripts
   */
  async listScripts(): Promise<AtroposScriptInfo[]> {
    try {
      const files = await fs.readdir(this.scriptsDir);
      const scripts: AtroposScriptInfo[] = [];
      
      for (const file of files) {
        if (file.endsWith('.lua')) {
          const scriptPath = path.join(this.scriptsDir, file);
          const name = path.basename(file, '.lua');
          
          // Try to read script to extract description
          let description: string | undefined;
          try {
            const content = await fs.readFile(scriptPath, 'utf-8');
            // Look for description in comments
            const descMatch = content.match(/--\s*description[:\s]+(.+)/i);
            if (descMatch) {
              description = descMatch[1].trim();
            }
          } catch {
            // Ignore read errors
          }
          
          // Determine category from filename
          let category: AtroposScriptInfo['category'] = 'general';
          if (file.includes('osint') || file.includes('bbot') || file.includes('amass')) {
            category = 'osint';
          } else if (file.includes('vuln') || file.includes('sqli') || file.includes('xss') || file.includes('nuclei')) {
            category = 'vulnerability';
          } else if (file.includes('secret') || file.includes('gitleaks') || file.includes('truffle')) {
            category = 'secret_detection';
          }
          
          scripts.push({
            scriptId: name,
            name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description,
            category,
            path: file // Relative path
          });
        }
      }
      
      return scripts.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error: any) {
      console.error('[Atropos] Error listing scripts:', error);
      return [];
    }
  }
  
  /**
   * Get script content
   */
  async getScript(scriptPath: string): Promise<{ content: string } | { error: string }> {
    try {
      const fullPath = path.isAbsolute(scriptPath) 
        ? scriptPath 
        : path.join(this.scriptsDir, scriptPath);
      
      const content = await fs.readFile(fullPath, 'utf-8');
      return { content };
    } catch (error: any) {
      return { error: error.message || 'Script not found' };
    }
  }
  
  /**
   * Log tool call to database (using existing osintToolCalls table)
   */
  private async logToolCall(params: {
    sessionToken: string;
    investigationId?: string;
    scanId: string;
    scriptPath: string;
    target: string;
    status: 'success' | 'error';
    data?: any;
    error?: string;
    source: string;
    latencyMs: number;
  }): Promise<void> {
    try {
      await storage.logToolCall({
        sessionToken: params.sessionToken,
        toolKey: 'atropos',
        targetType: this.inferTargetType(params.target),
        targetValue: params.target,
        request: {
          scriptPath: params.scriptPath,
          scanId: params.scanId
        },
        response: params.status === 'success' ? params.data : { error: params.error },
        status: params.status === 'success' ? 'success' : 'error',
        errorMessage: params.error,
        latencyMs: params.latencyMs,
        source: params.source as any,
        investigationId: params.investigationId
      });
    } catch (error) {
      console.error('[Atropos] Failed to log tool call:', error);
    }
  }
  
  /**
   * Infer target type from target string
   */
  private inferTargetType(target: string): 'domain' | 'ip' | 'hash' | 'url' | 'email' {
    if (target.startsWith('http://') || target.startsWith('https://')) {
      return 'url';
    }
    if (target.includes('@')) {
      return 'email';
    }
    if (/^[0-9a-f]{32,}$/i.test(target) || /^[0-9a-f]{40,}$/i.test(target) || /^[0-9a-f]{64,}$/i.test(target)) {
      return 'hash';
    }
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(target)) {
      return 'ip';
    }
    return 'domain';
  }
}

// Singleton instance
export const atroposService = new AtroposService();
