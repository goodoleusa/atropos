import QRCode from 'qrcode';

export interface QRPayload {
  type: 'session' | 'clue' | 'quest' | 'secret';
  data: string;
  timestamp: number;
}

export async function generateQRCode(payload: QRPayload): Promise<string> {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
  const qrDataUrl = await QRCode.toDataURL(encoded, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 256,
    color: {
      dark: '#b87333', // Molten bronze
      light: '#0a0500' // Dark background
    }
  });
  return qrDataUrl;
}

export function decodeQRPayload(encoded: string): QRPayload | null {
  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    return JSON.parse(decoded) as QRPayload;
  } catch {
    return null;
  }
}

export async function generateSessionExportCode(sessionToken: string, clues: string[], quests: string[]): Promise<string> {
  const payload: QRPayload = {
    type: 'session',
    data: JSON.stringify({ sessionToken, clues, quests }),
    timestamp: Date.now()
  };
  return generateQRCode(payload);
}

export async function generateSecretCode(secretId: string, hint: string): Promise<string> {
  const payload: QRPayload = {
    type: 'secret',
    data: JSON.stringify({ id: secretId, hint }),
    timestamp: Date.now()
  };
  return generateQRCode(payload);
}
