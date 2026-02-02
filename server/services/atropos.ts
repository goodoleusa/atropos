import { exec } from 'child_process';
import { promisify } from 'util';
import { nanoid } from 'nanoid';
import path from 'path';
import fs from 'fs/promises';
import { storage } from '../storage';
import type { InsertOsintToolCall } from '@shared/schema';

const execAsync = promisify(exec);

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
  private binaryPath: string;
  private scriptsDir: string;
  
  constructor() {
    // Try to find atropos binary
    this.binaryPath = process.env.ATROPOS_BINARY_PATH || 
                     path.join(process.cwd(), 'dist', 'bin', 'atropos') ||
                     path.join(process.cwd(), 'tools', 'lotus', 'target', 'release', 'atropos') ||
                     'atropos'; // Fallback to PATH
    
    this.scriptsDir = process.env.ATROPOS_SCRIPTS_DIR || 
                     path.join(process.cwd(), 'tools', 'lotus', 'examples');
  }
  
  /**
   * Check if atropos binary exists and is executable
   */
  async checkBinary(): Promise<{ available: boolean; path: string; error?: string }> {
    try {
      // Try to run atropos --version
      const { stdout } = await execAsync(`${this.binaryPath} --version 2>&1 || echo "NOT_FOUND"`);
      
      if (stdout.includes('NOT_FOUND') || stdout.includes('command not found')) {
        return { 
          available: false, 
          path: this.binaryPath,
          error: 'Atropos binary not found. Build it first with: cd tools/lotus && cargo build --release'
        };
      }
      
      return { available: true, path: this.binaryPath };
    } catch (error: any) {
      return { 
        available: false, 
        path: this.binaryPath,
        error: error.message || 'Unknown error checking binary'
      };
    }
  }
  
  /**
   * Execute an Atropos scan with a Lua script
   */
  async executeScript(params: AtroposScanParams): Promise<AtroposScanResult> {
    const startTime = Date.now();
    const scanId = `scan_${nanoid(12)}`;
    
    // Resolve script path
    const scriptPath = path.isAbsolute(params.scriptPath) 
      ? params.scriptPath 
      : path.join(this.scriptsDir, params.scriptPath);
    
    // Check if script exists
    try {
      await fs.access(scriptPath);
    } catch {
      return {
        success: false,
        scanId,
        error: `Script not found: ${scriptPath}`,
        latencyMs: Date.now() - startTime
      };
    }
    
    // Check binary availability
    const binaryCheck = await this.checkBinary();
    if (!binaryCheck.available) {
      return {
        success: false,
        scanId,
        error: binaryCheck.error || 'Atropos binary not available',
        latencyMs: Date.now() - startTime
      };
    }
    
    // Prepare output path if specified
    const outputPath = params.outputPath || path.join(process.cwd(), 'dist', 'atropos-results', `${scanId}.json`);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    
    // Build command: echo "target" | atropos scan script.lua -o output.json
    const cmd = `echo "${params.target}" | ${this.binaryPath} scan "${scriptPath}" -o "${outputPath}"`;
    
    try {
      // Execute scan
      const { stdout, stderr } = await execAsync(cmd, {
        timeout: 300000, // 5 minute timeout
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
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
