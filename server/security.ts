import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const appAccessGate = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = process.env.APP_ACCESS_TOKEN;
  
  if (!accessToken || process.env.NODE_ENV === 'development') {
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
      maxAge: 24 * 60 * 60 * 1000
    });
    return next();
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
      <title>Access Required</title>
      <style>
        body { 
          background: #0a0500; 
          color: #d97706; 
          font-family: monospace; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          height: 100vh; 
          margin: 0;
        }
        .container { text-align: center; }
        h1 { font-size: 2rem; margin-bottom: 1rem; }
        p { color: #78716c; }
        code { background: #1c1917; padding: 0.25rem 0.5rem; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>ACCESS DENIED</h1>
        <p>This system requires authorization.</p>
        <p>Add <code>?token=YOUR_ACCESS_TOKEN</code> to the URL.</p>
      </div>
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

export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Remove angle brackets to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 10000); // Max length
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
