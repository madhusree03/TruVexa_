import { ThreatIntelResult } from '../src/types/index.ts';

export async function querySafeBrowsing(targetUrl: string): Promise<ThreatIntelResult> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY || process.env.SAFE_BROWSING_API_KEY;

  if (!apiKey) {
    return {
      provider: 'Google Safe Browsing v4',
      status: 'unconfigured',
      details: 'Live threat intelligence checking is not configured. Local heuristic rules engine is active.',
      checkedAt: new Date().toISOString(),
    };
  }

  try {
    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(apiKey)}`;

    const payload = {
      client: {
        clientId: 'truvexa-cybersecurity-applet',
        clientVersion: '1.0.0',
      },
      threatInfo: {
        threatTypes: [
          'MALWARE',
          'SOCIAL_ENGINEERING',
          'UNWANTED_SOFTWARE',
          'POTENTIALLY_HARMFUL_APPLICATION',
        ],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: [{ url: targetUrl }],
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        provider: 'Google Safe Browsing v4',
        status: 'error',
        details: `Threat intelligence provider returned HTTP ${res.status}. Falling back to local heuristic analysis.`,
        checkedAt: new Date().toISOString(),
      };
    }

    const data = await res.json() as { matches?: Array<{ threatType: string }> };

    if (data.matches && data.matches.length > 0) {
      const threatTypes = Array.from(new Set(data.matches.map((m) => m.threatType)));
      return {
        provider: 'Google Safe Browsing v4',
        status: 'threat_found',
        threatTypes,
        details: `Confirmed malicious URL in Google Safe Browsing database. Threat categories: ${threatTypes.join(', ')}.`,
        checkedAt: new Date().toISOString(),
      };
    }

    return {
      provider: 'Google Safe Browsing v4',
      status: 'clean',
      details: 'No known malicious activity reported in Google Safe Browsing database at time of scan.',
      checkedAt: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network failure';
    return {
      provider: 'Google Safe Browsing v4',
      status: 'error',
      details: `Live lookup could not be completed (${errorMsg}). Relying on heuristic risk scoring.`,
      checkedAt: new Date().toISOString(),
    };
  }
}
