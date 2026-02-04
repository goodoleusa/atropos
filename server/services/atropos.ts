/**
 * Atropos integration: Option A (standalone binary). Spawns the atropos CLI for scans.
 * Option B (embedded library) would swap the implementation behind this same interface
 * (executeScript, listScripts, getScript, checkBinary) without changing callers.
 */
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { nanoid } from 'nanoid';
import path from 'path';
import fs from 'fs/promises';
import { storage } from '../storage';
import type { InsertOsintToolCall } from '@shared/schema';

const execAsync = promisify(exec);

const VERBOSE = process.env.ATROPOS_VERBOSE === 'true' || process.env.NODE_ENV === 'development';

function log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [Atropos:${level.toUpperCase()}]`;
  
  if (level === 'debug' && !VERBOSE) return;
  
  const logData = data ? ` :: ${JSON.stringify(data, null, 2)}` : '';
  
  switch (level) {
    case 'error':
      console.error(`${prefix} ${message}${logData}`);
      break;
    case 'warn':
      console.warn(`${prefix} ${message}${logData}`);
      break;
    case 'debug':
      console.log(`${prefix} ${message}${logData}`);
      break;
    default:
      console.log(`${prefix} ${message}${logData}`);
  }
}

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

export interface AtroposDiagnostics {
  binaryExists: boolean;
  binaryPath: string;
  binaryVersion?: string;
  rustInstalled: boolean;
  rustVersion?: string;
  cargoInstalled: boolean;
  cargoVersion?: string;
  sourceExists: boolean;
  sourcePath: string;
  scriptsDir: string;
  scriptsCount: number;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface AtroposBuildResult {
  success: boolean;
  duration: number;
  stdout: string;
  stderr: string;
  error?: string;
  binaryPath?: string;
}

export class AtroposService {
  private binaryPath: string;
  private scriptsDir: string;
  private sourcePath: string;
  
  constructor() {
    this.sourcePath = path.join(process.cwd(), 'tools', 'atropos');
    
    // Try multiple locations for the binary
    const possiblePaths = [
      process.env.ATROPOS_BINARY_PATH,
      path.join(this.sourcePath, 'target', 'release', 'atropos'),
      path.join(this.sourcePath, 'target', 'debug', 'atropos'),
      path.join(process.cwd(), 'dist', 'bin', 'atropos'),
      'atropos' // Fallback to PATH
    ].filter(Boolean) as string[];
    
    this.binaryPath = possiblePaths[0];
    
    // Check which path actually exists
    for (const p of possiblePaths) {
      try {
        require('fs').accessSync(p, require('fs').constants.X_OK);
        this.binaryPath = p;
        log('info', `Found Atropos binary at: ${p}`);
        break;
      } catch {
        // Continue checking
      }
    }
    
    this.scriptsDir = process.env.ATROPOS_SCRIPTS_DIR || 
                     path.join(this.sourcePath, 'examples');
    
    log('debug', 'AtroposService initialized', {
      binaryPath: this.binaryPath,
      scriptsDir: this.scriptsDir,
      sourcePath: this.sourcePath
    });
  }
  
  /**
   * Run comprehensive diagnostics on Atropos installation
   */
  async diagnose(): Promise<AtroposDiagnostics> {
    log('info', 'Running Atropos diagnostics...');
    
    const diagnostics: AtroposDiagnostics = {
      binaryExists: false,
      binaryPath: this.binaryPath,
      rustInstalled: false,
      cargoInstalled: false,
      sourceExists: false,
      sourcePath: this.sourcePath,
      scriptsDir: this.scriptsDir,
      scriptsCount: 0,
      errors: [],
      warnings: [],
      suggestions: []
    };
    
    // Check if source directory exists
    try {
      await fs.access(this.sourcePath);
      diagnostics.sourceExists = true;
      
      // Check for Cargo.toml
      try {
        await fs.access(path.join(this.sourcePath, 'Cargo.toml'));
        log('debug', 'Found Cargo.toml');
      } catch {
        diagnostics.errors.push('Cargo.toml not found in source directory');
        diagnostics.suggestions.push('Ensure Atropos source code is properly cloned to tools/atropos/');
      }
    } catch {
      diagnostics.errors.push(`Source directory not found: ${this.sourcePath}`);
      diagnostics.suggestions.push('Clone Atropos: git clone https://github.com/your-org/atropos tools/atropos');
    }
    
    // Check Rust/Cargo installation
    try {
      const { stdout: rustVersion } = await execAsync('rustc --version 2>&1');
      diagnostics.rustInstalled = true;
      diagnostics.rustVersion = rustVersion.trim();
      log('debug', `Rust version: ${rustVersion.trim()}`);
    } catch (e: any) {
      diagnostics.errors.push('Rust compiler (rustc) not found');
      diagnostics.suggestions.push('Install Rust: curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh');
      log('warn', 'Rust not installed', { error: e.message });
    }
    
    try {
      const { stdout: cargoVersion } = await execAsync('cargo --version 2>&1');
      diagnostics.cargoInstalled = true;
      diagnostics.cargoVersion = cargoVersion.trim();
      log('debug', `Cargo version: ${cargoVersion.trim()}`);
    } catch (e: any) {
      diagnostics.errors.push('Cargo (Rust package manager) not found');
      log('warn', 'Cargo not installed', { error: e.message });
    }
    
    // Check if binary exists and get version
    try {
      await fs.access(this.binaryPath);
      diagnostics.binaryExists = true;
      
      try {
        const { stdout } = await execAsync(`${this.binaryPath} --version 2>&1`);
        diagnostics.binaryVersion = stdout.trim();
        log('info', `Atropos binary version: ${stdout.trim()}`);
      } catch (e: any) {
        diagnostics.warnings.push(`Binary exists but --version failed: ${e.message}`);
      }
    } catch {
      diagnostics.binaryExists = false;
      diagnostics.errors.push(`Binary not found at: ${this.binaryPath}`);
      
      if (diagnostics.rustInstalled && diagnostics.cargoInstalled && diagnostics.sourceExists) {
        diagnostics.suggestions.push('Build Atropos: cd tools/atropos && cargo build --release');
      }
    }
    
    // Count available scripts
    try {
      const files = await fs.readdir(this.scriptsDir);
      diagnostics.scriptsCount = files.filter(f => f.endsWith('.lua')).length;
      log('debug', `Found ${diagnostics.scriptsCount} Lua scripts`);
    } catch {
      diagnostics.warnings.push(`Scripts directory not accessible: ${this.scriptsDir}`);
    }
    
    // Summary logging
    if (diagnostics.errors.length === 0) {
      log('info', 'Diagnostics complete: Atropos is ready', {
        version: diagnostics.binaryVersion,
        scripts: diagnostics.scriptsCount
      });
    } else {
      log('error', 'Diagnostics complete: Issues found', {
        errors: diagnostics.errors,
        suggestions: diagnostics.suggestions
      });
    }
    
    return diagnostics;
  }
  
  /**
   * Attempt to build Atropos binary from source with verbose logging
   */
  async buildBinary(options: { release?: boolean; verbose?: boolean } = {}): Promise<AtroposBuildResult> {
    const release = options.release ?? true;
    const verbose = options.verbose ?? true;
    const startTime = Date.now();
    
    log('info', `Starting Atropos build (release=${release}, verbose=${verbose})`);
    
    // Check prerequisites
    const diag = await this.diagnose();
    if (!diag.sourceExists) {
      return {
        success: false,
        duration: Date.now() - startTime,
        stdout: '',
        stderr: '',
        error: `Source directory not found: ${this.sourcePath}. ${diag.suggestions.join(' ')}`
      };
    }
    
    if (!diag.cargoInstalled) {
      return {
        success: false,
        duration: Date.now() - startTime,
        stdout: '',
        stderr: '',
        error: `Cargo not installed. Install Rust first: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
      };
    }
    
    // Build the command
    const args = ['build'];
    if (release) args.push('--release');
    if (verbose) args.push('--verbose');
    
    const buildCmd = `cargo ${args.join(' ')}`;
    log('info', `Executing: ${buildCmd} in ${this.sourcePath}`);
    
    return new Promise((resolve) => {
      const child = spawn('cargo', args, {
        cwd: this.sourcePath,
        env: { ...process.env, RUST_BACKTRACE: '1' }
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        if (verbose) {
          process.stdout.write(`[Atropos:BUILD] ${chunk}`);
        }
      });
      
      child.stderr.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;
        // Cargo outputs progress to stderr, so log it appropriately
        if (verbose) {
          process.stderr.write(`[Atropos:BUILD] ${chunk}`);
        }
      });
      
      child.on('error', (error) => {
        log('error', 'Build process failed to start', { error: error.message });
        resolve({
          success: false,
          duration: Date.now() - startTime,
          stdout,
          stderr,
          error: `Failed to start build: ${error.message}`
        });
      });
      
      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        const success = code === 0;
        
        if (success) {
          const binaryPath = path.join(this.sourcePath, 'target', release ? 'release' : 'debug', 'atropos');
          this.binaryPath = binaryPath;
          
          log('info', `Build succeeded in ${duration}ms`, { binaryPath });
          
          resolve({
            success: true,
            duration,
            stdout,
            stderr,
            binaryPath
          });
        } else {
          log('error', `Build failed with code ${code} after ${duration}ms`);
          
          // Parse common errors for better messages
          let errorSummary = `Build failed with exit code ${code}`;
          
          if (stderr.includes('could not find native static library')) {
            errorSummary += '. Missing native library - check system dependencies.';
          }
          if (stderr.includes('linker `cc` not found')) {
            errorSummary += '. C compiler not installed. Install build-essential or gcc.';
          }
          if (stderr.includes('error[E')) {
            const errorMatches = stderr.match(/error\[E\d+\]:[^\n]+/g);
            if (errorMatches) {
              errorSummary += ` Compiler errors: ${errorMatches.slice(0, 3).join('; ')}`;
            }
          }
          if (stderr.includes('Blocking waiting for file lock')) {
            errorSummary = 'Another cargo process is running. Wait for it to finish or run: rm -rf tools/atropos/target/.cargo-lock';
          }
          
          resolve({
            success: false,
            duration,
            stdout,
            stderr,
            error: errorSummary
          });
        }
      });
    });
  }
  
  /**
   * Ensure binary is available, building if necessary
   */
  async ensureBinary(): Promise<{ available: boolean; path: string; built?: boolean; error?: string }> {
    const check = await this.checkBinary();
    
    if (check.available) {
      return { available: true, path: check.path };
    }
    
    log('info', 'Binary not found, attempting to build...');
    
    const buildResult = await this.buildBinary({ release: true, verbose: true });
    
    if (buildResult.success && buildResult.binaryPath) {
      return { available: true, path: buildResult.binaryPath, built: true };
    }
    
    return {
      available: false,
      path: this.binaryPath,
      error: buildResult.error || 'Build failed for unknown reason. Check logs for details.'
    };
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
          error: 'Atropos binary not found. Build it first with: cd tools/atropos && cargo build --release'
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
