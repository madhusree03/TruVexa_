import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  parseAndNormalizeUrl,
  runHeuristicRules,
  generateDefensiveRecommendations,
} from './server/analysisEngine.ts';
import { querySafeBrowsing } from './server/threatIntel.ts';
import { generateAiExplanation } from './server/aiExplainer.ts';
import { ScanReport, ScanStats } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '100kb' }));

// In-memory store for session scans
const scanHistory: ScanReport[] = [];

// API: System Configuration & Health
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    appName: 'TRUVEXA',
    safeBrowsingConfigured: Boolean(
      process.env.GOOGLE_SAFE_BROWSING_API_KEY || process.env.SAFE_BROWSING_API_KEY
    ),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// API: Analyze URL
app.post('/api/analyze', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body as { url?: string };

    if (!url || typeof url !== 'string' || !url.trim()) {
      res.status(400).json({
        success: false,
        error: 'Please enter a valid URL to analyze.',
      });
      return;
    }

    const trimmedUrl = url.trim();
    if (trimmedUrl.length > 2048) {
      res.status(400).json({
        success: false,
        error: 'URL exceeds maximum allowable length of 2048 characters.',
      });
      return;
    }

    // 1. Safe parsing & normalization
    let anatomy;
    try {
      anatomy = parseAndNormalizeUrl(trimmedUrl);
    } catch (parseError: unknown) {
      res.status(400).json({
        success: false,
        error: parseError instanceof Error ? parseError.message : 'Invalid URL structure.',
      });
      return;
    }

    // 2. Local heuristic inspection
    const heuristic = runHeuristicRules(anatomy);
    let finalScore = heuristic.score;
    let finalRiskLevel = heuristic.riskLevel;
    const indicators = [...heuristic.indicators];

    // 3. Query Threat Intelligence (Google Safe Browsing)
    const threatIntel = await querySafeBrowsing(anatomy.normalized);

    // If threat intelligence confirms malicious, elevate score to 100
    if (threatIntel.status === 'threat_found') {
      finalScore = 100;
      finalRiskLevel = 'critical';
      indicators.unshift({
        id: 'threat_intel_match',
        name: 'Verified Threat Intelligence Match',
        category: 'reputation',
        severity: 'critical',
        scoreDelta: 100,
        description: `This URL was explicitly matched in the ${threatIntel.provider} database as known malicious content.`,
        technicalDetails: threatIntel.details,
      });
    }

    // 4. Defensive recommendations
    const recommendations = generateDefensiveRecommendations(indicators, finalRiskLevel);

    // 5. Gemini AI explanation
    const aiExplanation = await generateAiExplanation(
      anatomy,
      indicators,
      finalRiskLevel,
      finalScore
    );

    const safetyPercentage = Math.max(0, Math.min(100, 100 - finalScore));

    const report: ScanReport = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      url: trimmedUrl,
      riskScore: finalScore,
      safetyPercentage,
      riskLevel: finalRiskLevel,
      anatomy,
      indicators,
      threatIntel,
      aiExplanation,
      recommendations,
      isHeuristicOnly: threatIntel.status !== 'threat_found',
    };

    // Store in session scan history (limit to 100 entries)
    scanHistory.unshift(report);
    if (scanHistory.length > 100) {
      scanHistory.pop();
    }

    res.json({
      success: true,
      report,
    });
  } catch (error: unknown) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'An internal error occurred while analyzing the URL.',
    });
  }
});

// API: Get scan history & stats
app.get('/api/history', (_req: Request, res: Response) => {
  const stats: ScanStats = {
    totalScans: scanHistory.length,
    lowRiskCount: scanHistory.filter((s) => s.riskLevel === 'low').length,
    mediumRiskCount: scanHistory.filter((s) => s.riskLevel === 'medium').length,
    highRiskCount: scanHistory.filter((s) => s.riskLevel === 'high').length,
    criticalRiskCount: scanHistory.filter((s) => s.riskLevel === 'critical').length,
    threatIntelDetections: scanHistory.filter((s) => s.threatIntel.status === 'threat_found').length,
  };

  res.json({
    history: scanHistory,
    stats,
  });
});

// API: Clear scan history
app.delete('/api/history', (_req: Request, res: Response) => {
  scanHistory.length = 0;
  res.json({ success: true, message: 'Scan history cleared.' });
});

// Vite Middleware for Full-Stack Development & Static Serving for Production
async function setupServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TRUVEXA] Full-Stack server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to initialize server:', err);
});
