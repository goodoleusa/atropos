import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const appAccessGate = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = process.env.APP_ACCESS_TOKEN;
  
  if (!accessToken) {
    return next();
  }

  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  if (req.path === '/api/access/verify') {
    return next();
  }
  
  const tokenFromQuery = req.query.token as string;
  const tokenFromCookie = req.cookies?.access_token;
  const tokenFromHeader = req.headers['x-access-token'] as string;
  
  if (tokenFromQuery === accessToken) {
    res.cookie('access_token', accessToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    const url = new URL(req.originalUrl, `http://${req.headers.host}`);
    url.searchParams.delete('token');
    return res.redirect(url.pathname + url.search);
  }
  
  if (tokenFromCookie === accessToken || tokenFromHeader === accessToken) {
    return next();
  }
  
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Valid access token required' });
  }
  
  res.status(401).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>NEXUS - Access Required</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          background: #050200; 
          color: #d97706; 
          font-family: 'Courier New', monospace; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          height: 100vh; 
          padding: 1rem;
        }
        .gate {
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        .logo {
          font-size: 2.5rem;
          font-weight: bold;
          letter-spacing: 0.5rem;
          margin-bottom: 0.5rem;
          text-shadow: 0 0 20px rgba(217,119,6,0.3);
        }
        .subtitle {
          color: #78716c;
          font-size: 0.75rem;
          margin-bottom: 2rem;
          text-transform: uppercase;
          letter-spacing: 0.2rem;
        }
        .form-group {
          position: relative;
          margin-bottom: 1rem;
        }
        input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: #0a0500;
          border: 1px solid #78350f;
          border-radius: 6px;
          color: #fbbf24;
          font-family: 'Courier New', monospace;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
          min-height: 48px;
        }
        input:focus { border-color: #d97706; box-shadow: 0 0 0 2px rgba(217,119,6,0.2); }
        input::placeholder { color: #44403c; }
        button {
          width: 100%;
          padding: 0.875rem;
          background: #78350f;
          border: 1px solid #92400e;
          border-radius: 6px;
          color: #fbbf24;
          font-family: 'Courier New', monospace;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.1rem;
          min-height: 48px;
        }
        button:hover { background: #92400e; }
        button:active { transform: scale(0.98); }
        .error {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.5rem;
          min-height: 1.2em;
        }
        .line {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #78350f, transparent);
          margin: 1.5rem 0;
        }
        .hint {
          color: #57534e;
          font-size: 0.65rem;
        }
      </style>
    </head>
    <body>
      <div class="gate">
        <div class="logo">NEXUS</div>
        <div class="subtitle">Security Investigation Platform</div>
        <div class="line"></div>
        <form id="access-form">
          <div class="form-group">
            <input 
              type="password" 
              id="token-input" 
              placeholder="Enter access token" 
              autocomplete="off"
              autofocus
            />
          </div>
          <button type="submit">Authenticate</button>
          <div class="error" id="error-msg"></div>
        </form>
        <div class="line"></div>
        <div class="hint">Authorized personnel only</div>
      </div>
      <script>
        document.getElementById('access-form').addEventListener('submit', async function(e) {
          e.preventDefault();
          var token = document.getElementById('token-input').value.trim();
          if (!token) return;
          try {
            var res = await fetch('/api/access/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: token })
            });
            if (res.ok) {
              window.location.reload();
            } else {
              document.getElementById('error-msg').textContent = 'Invalid access token';
              document.getElementById('token-input').value = '';
              document.getElementById('token-input').focus();
            }
          } catch(err) {
            document.getElementById('error-msg').textContent = 'Connection error';
          }
        });
      </script>
    </body>
    </html>
  `);
};

export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob: https:; " +
    "connect-src 'self' https://openrouter.ai https://*.openrouter.ai; " +
    "frame-ancestors 'none';"
  );
  next();
};

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const expectedToken = process.env.APP_ACCESS_TOKEN;
  const headerToken = req.headers['x-access-token'] as string;
  const cookieToken = req.cookies?.access_token;
  
  const isDevMode = !expectedToken || process.env.NODE_ENV === 'development';
  const isAuthed = isDevMode || headerToken === expectedToken || cookieToken === expectedToken;
  
  if (!isAuthed) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  next();
};

export const rateLimit = (maxRequests: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const key = `${clientId}:${req.path}`;
    const now = Date.now();
    
    const record = rateLimitStore.get(key);
    
    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (record.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please slow down.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    record.count++;
    next();
  };
};

export const sanitizeInput = (input: string, maxLength = 10000): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Remove angle brackets to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, maxLength); // Max length
};

export const validateSessionToken = (token: unknown): token is string => {
  if (typeof token !== 'string') return false;
  if (token.length < 10 || token.length > 100) return false;
  return /^[a-zA-Z0-9_-]+$/.test(token);
};

export const clueSchema = z.object({
  id: z.string().min(1).max(50).regex(/^[a-z0-9_-]+$/i),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  location: z.string().max(200).optional(),
  hint: z.string().max(500).optional(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'legendary']).optional(),
});

export const questSchema = z.object({
  id: z.string().min(1).max(50).regex(/^[a-z0-9_-]+$/i),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  requiredClues: z.array(z.string()).max(20).optional(),
  reward: z.string().max(200).nullable().optional(),
  unlocks: z.string().max(200).nullable().optional(),
});

export const payloadSchema = z.object({
  type: z.enum(['raw', 'beacon', 'exfil', 'inject', 'phish', 'dropper', 'pivot', 'recon', 'persist', 'crypto']),
  target: z.string().max(200).optional(),
  data: z.any().optional(),
}).passthrough();

export const validatePayload = (payload: unknown): { valid: boolean; parsed?: z.infer<typeof payloadSchema>; error?: string } => {
  try {
    if (typeof payload === 'string') {
      const parsed = JSON.parse(payload);
      const result = payloadSchema.safeParse(parsed);
      if (result.success) {
        return { valid: true, parsed: result.data };
      }
      return { valid: false, error: result.error.message };
    }
    const result = payloadSchema.safeParse(payload);
    if (result.success) {
      return { valid: true, parsed: result.data };
    }
    return { valid: false, error: result.error.message };
  } catch (e) {
    return { valid: false, error: 'Invalid JSON payload' };
  }
};

export const logSecurityEvent = (event: string, details: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  console.log(`[SECURITY] ${timestamp} - ${event}:`, JSON.stringify(details));
};

setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, record] of entries) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);
