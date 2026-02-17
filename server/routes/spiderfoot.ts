import { Router, Request, Response } from "express";
import { spiderfootService, type SpiderFootScanParams } from "../services/spiderfoot";
import fs from "fs/promises";
import path from "path";

const router = Router();

const API_KEYS_FILE = path.resolve(process.cwd(), '.spiderfoot-keys.json');

async function loadApiKeys(): Promise<Record<string, string>> {
  try {
    const data = await fs.readFile(API_KEYS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveApiKeys(keys: Record<string, string>): Promise<void> {
  await fs.writeFile(API_KEYS_FILE, JSON.stringify(keys, null, 2));
}

router.get("/health", async (_req: Request, res: Response) => {
  try {
    const status = await spiderfootService.checkAvailability();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ available: false, error: error.message });
  }
});

router.get("/modules", async (_req: Request, res: Response) => {
  try {
    const modules = await spiderfootService.listModules();
    res.json({ modules, presets: spiderfootService.MODULE_PRESETS });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/event-types", async (_req: Request, res: Response) => {
  try {
    const types = await spiderfootService.listEventTypes();
    res.json({ types });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/presets", (_req: Request, res: Response) => {
  res.json(spiderfootService.MODULE_PRESETS);
});

const scanHistory: Array<{
  scanId: string;
  target: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  resultCount: number;
  modules?: string[];
  useCase?: string;
}> = [];

router.post("/scan", async (req: Request, res: Response) => {
  try {
    const { target, modules, useCase, eventTypes, maxThreads } = req.body;

    if (!target || typeof target !== 'string' || target.trim().length === 0) {
      return res.status(400).json({ error: "Target is required" });
    }

    const apiKeys = await loadApiKeys();

    const params: SpiderFootScanParams = {
      target: target.trim(),
      modules: modules || undefined,
      useCase: useCase || 'passive',
      eventTypes: eventTypes || undefined,
      maxThreads: maxThreads || 3,
    };

    const { scanId, promise } = spiderfootService.runScan(params, apiKeys);

    scanHistory.push({
      scanId,
      target: params.target,
      status: 'running',
      startedAt: new Date().toISOString(),
      resultCount: 0,
      modules: params.modules,
      useCase: params.useCase,
    });

    res.json({ scanId, status: 'running', target: params.target });

    promise.then((result) => {
      const entry = scanHistory.find(h => h.scanId === scanId);
      if (entry) {
        entry.status = result.status;
        entry.completedAt = result.completedAt;
        entry.resultCount = result.resultCount;
      }
      scanResults.set(scanId, result);
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const scanResults = new Map<string, any>();

router.get("/scan/:scanId", async (req: Request, res: Response) => {
  const scanId = req.params.scanId as string;

  const result = scanResults.get(scanId);
  if (result) {
    return res.json(result);
  }

  const partial = spiderfootService.getPartialResults(scanId);
  if (partial) {
    return res.json({
      scanId,
      status: 'running',
      results: partial.results,
      resultCount: partial.results.length,
      progress: partial.progress,
    });
  }

  const activeScans = spiderfootService.getActiveScans();
  if (activeScans.includes(scanId)) {
    return res.json({ scanId, status: 'running', results: [], resultCount: 0 });
  }

  res.status(404).json({ error: "Scan not found" });
});

router.post("/scan/:scanId/cancel", async (req: Request, res: Response) => {
  const scanId = req.params.scanId as string;
  const cancelled = spiderfootService.cancelScan(scanId);
  if (cancelled) {
    const entry = scanHistory.find(h => h.scanId === scanId);
    if (entry) entry.status = 'cancelled';
    res.json({ scanId, status: 'cancelled' });
  } else {
    res.status(404).json({ error: "Scan not found or already completed" });
  }
});

router.get("/history", (_req: Request, res: Response) => {
  res.json(scanHistory.slice(-50).reverse());
});

router.get("/active", (_req: Request, res: Response) => {
  res.json({ scans: spiderfootService.getActiveScans() });
});

router.get("/api-keys", async (_req: Request, res: Response) => {
  try {
    const keys = await loadApiKeys();
    const services = spiderfootService.API_KEY_SERVICES.map(svc => ({
      ...svc,
      configured: !!keys[svc.key] && keys[svc.key].length > 0,
      maskedValue: keys[svc.key] ? keys[svc.key].slice(0, 4) + '****' + keys[svc.key].slice(-4) : null,
    }));
    res.json({ services });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api-keys", async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ error: "key is required" });
    }
    const keys = await loadApiKeys();
    if (value && value.trim().length > 0) {
      keys[key] = value.trim();
    } else {
      delete keys[key];
    }
    await saveApiKeys(keys);
    res.json({ success: true, key, configured: !!value });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api-keys/:key", async (req: Request, res: Response) => {
  try {
    const keyParam = req.params.key as string;
    const keys = await loadApiKeys();
    delete keys[keyParam];
    await saveApiKeys(keys);
    res.json({ success: true, key: keyParam, configured: false });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
