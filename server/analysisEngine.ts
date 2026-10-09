import { UrlAnatomy, UrlIndicator, RiskLevel } from '../src/types/index.ts';

const KNOWN_SHORTENERS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'rebrand.ly',
  'cutt.ly',
  'tiny.cc',
  'shorte.st',
  'bl.ink',
  'adf.ly',
  'qr.ae',
  'v.gd',
  'tr.im',
]);

const HIGH_RISK_TLDS = new Set([
  'xyz',
  'top',
  'tk',
  'ml',
  'ga',
  'cf',
  'gq',
  'buzz',
  'work',
  'fit',
  'rest',
  'icu',
  'vip',
  'wang',
  'click',
  'cam',
  'country',
  'stream',
  'bid',
  'review',
  'trade',
]);

const FAMOUS_BRANDS: Record<string, string[]> = {
  paypal: ['paypal.com'],
  apple: ['apple.com', 'icloud.com'],
  google: ['google.com', 'accounts.google.com'],
  microsoft: ['microsoft.com', 'live.com', 'outlook.com', 'office.com'],
  amazon: ['amazon.com', 'amazon.co.uk'],
  netflix: ['netflix.com'],
  chase: ['chase.com'],
  wellsfargo: ['wellsfargo.com'],
  bankofamerica: ['bankofamerica.com'],
  citibank: ['citi.com', 'citibank.com'],
  facebook: ['facebook.com', 'fb.com'],
  instagram: ['instagram.com'],
  linkedin: ['linkedin.com'],
  github: ['github.com'],
  dropbox: ['dropbox.com'],
  binance: ['binance.com'],
  coinbase: ['coinbase.com'],
  steam: ['steampowered.com', 'steamcommunity.com'],
  adobe: ['adobe.com'],
  walmart: ['walmart.com'],
  fedex: ['fedex.com'],
  dhl: ['dhl.com'],
  ups: ['ups.com'],
};

const SUSPICIOUS_KEYWORDS = [
  'login',
  'signin',
  'log-in',
  'sign-in',
  'verify',
  'verification',
  'update-account',
  'banking',
  'secure-banking',
  'wallet',
  'kyc',
  'authenticate',
  'password-reset',
  'confirm-identity',
  'security-alert',
  'recover',
  'billing',
  'invoice',
  'payment-declined',
  'support-desk',
  're-authenticate',
  'session-expired',
  '2fa',
  'passcode',
  'credential',
];

const DANGEROUS_EXTENSIONS = [
  '.exe',
  '.scr',
  '.bat',
  '.cmd',
  '.msi',
  '.vbs',
  '.apk',
  '.dmg',
  '.iso',
  '.zip',
  '.jar',
  '.ps1',
  '.hta',
  '.sh',
];

export interface AnalysisResult {
  anatomy: UrlAnatomy;
  indicators: UrlIndicator[];
  heuristicRiskScore: number;
  riskLevel: RiskLevel;
}

/**
 * Safely parse and normalize URL, extracting structural anatomy
 */
export function parseAndNormalizeUrl(rawInput: string): UrlAnatomy {
  const trimmed = rawInput.trim();
  let parsed: URL;

  try {
    parsed = new URL(trimmed);
  } catch {
    // If user forgot protocol, try with https:// prefix for parsing
    if (!/^https?:\/\//i.test(trimmed) && trimmed.length > 0) {
      try {
        parsed = new URL(`https://${trimmed}`);
      } catch (err) {
        throw new Error('Invalid URL format: unable to parse structure.');
      }
    } else {
      throw new Error('Invalid URL format: unable to parse structure.');
    }
  }

  // Only accept HTTP and HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Unsupported protocol "${parsed.protocol}". TRUVEXA only analyzes HTTP and HTTPS links.`);
  }

  const hostname = parsed.hostname.toLowerCase();
  const hostParts = hostname.split('.');
  const tld = hostParts.length > 1 ? hostParts[hostParts.length - 1] : '';
  const subdomains = hostParts.length > 2 ? hostParts.slice(0, hostParts.length - 2) : [];

  // Check IPv4 / IPv6
  const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isIpv6 = hostname.startsWith('[') && hostname.endsWith(']');
  const isIp = isIpv4 || isIpv6;

  const isPunycode = hostname.startsWith('xn--') || hostname.includes('.xn--');
  const hasAuth = Boolean(parsed.username || parsed.password || trimmed.includes('@'));
  const userInfo = parsed.username ? `${parsed.username}${parsed.password ? ':***' : ''}` : '';

  return {
    raw: trimmed,
    normalized: parsed.toString(),
    protocol: parsed.protocol.replace(':', ''),
    hostname,
    port: parsed.port || (parsed.protocol === 'https:' ? '443' : '80'),
    pathname: parsed.pathname,
    search: parsed.search,
    hasAuth,
    userInfo,
    tld,
    subdomains,
    length: trimmed.length,
    isIp,
    isPunycode,
  };
}

/**
 * Executes deterministic heuristic inspection rules
 */
export function runHeuristicRules(anatomy: UrlAnatomy): { indicators: UrlIndicator[]; score: number; riskLevel: RiskLevel } {
  const indicators: UrlIndicator[] = [];
  let score = 0;

  // 1. Insecure HTTP Protocol
  if (anatomy.protocol === 'http') {
    indicators.push({
      id: 'insecure_transport_http',
      name: 'Unencrypted HTTP Protocol',
      category: 'transport',
      severity: 'medium',
      scoreDelta: 15,
      description: 'The URL uses plain unencrypted HTTP instead of HTTPS. All data transmitted is vulnerable to eavesdropping and man-in-the-middle attacks.',
      technicalDetails: 'Protocol is "http:". Modern reputable services handling accounts or user data strictly mandate TLS (HTTPS).',
    });
    score += 15;
  }

  // 2. IP Address as Hostname
  if (anatomy.isIp) {
    // Check if doc range (RFC 5737: 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24)
    const isDocIp =
      anatomy.hostname.startsWith('192.0.2.') ||
      anatomy.hostname.startsWith('198.51.100.') ||
      anatomy.hostname.startsWith('203.0.113.');

    indicators.push({
      id: 'ip_hostname',
      name: 'Direct IP Address Hostname',
      category: 'hostname',
      severity: 'high',
      scoreDelta: 30,
      description: 'The link directs to a raw numerical IP address instead of a registered domain name. Threat actors frequently host phishing portals on raw IPs to evade domain reputation filters.',
      technicalDetails: `Direct IP hostname detected: ${anatomy.hostname}${isDocIp ? ' (Documentation test block RFC 5737)' : ''}`,
    });
    score += 30;
  }

  // 3. Known URL Shortener
  if (KNOWN_SHORTENERS.has(anatomy.hostname)) {
    indicators.push({
      id: 'url_shortener',
      name: 'Known URL Shortening Service',
      category: 'obfuscation',
      severity: 'medium',
      scoreDelta: 20,
      description: 'The domain is a URL shortener that masks the real destination. Attackers frequently use shorteners in SMS (smishing) and spear-phishing emails to bypass automated gateways.',
      technicalDetails: `Shortener provider: ${anatomy.hostname}`,
    });
    score += 20;
  }

  // 4. Embedded Credentials / Misleading @ Symbol
  if (anatomy.hasAuth) {
    indicators.push({
      id: 'credential_at_symbol',
      name: 'Misleading @ Symbol / Embedded User Authentication',
      category: 'credentials',
      severity: 'critical',
      scoreDelta: 35,
      description: 'The URL contains an "@" symbol or userinfo authentication prefix. In web URLs, the browser treats text before "@" as login credentials and connects directly to the domain AFTER the "@", effectively spoofing the real host.',
      technicalDetails: `UserInfo detected. Real destination host resolved to: ${anatomy.hostname}`,
    });
    score += 35;
  }

  // 5. Punycode / IDN Homograph Attack
  if (anatomy.isPunycode) {
    indicators.push({
      id: 'punycode_homograph',
      name: 'Punycode / Internationalized Domain Name (IDN)',
      category: 'hostname',
      severity: 'high',
      scoreDelta: 30,
      description: 'The hostname uses the "xn--" prefix representing encoded Unicode characters. Attackers use visually identical Cyrillic or Greek glyphs (e.g., Cyrillic "а" instead of Latin "a") to imitate legitimate brands.',
      technicalDetails: `Punycode domain: ${anatomy.hostname}`,
    });
    score += 30;
  }

  // 6. Excessive Subdomain Depth
  if (anatomy.subdomains.length >= 3) {
    indicators.push({
      id: 'excessive_subdomains',
      name: 'Excessive Subdomain Stacking',
      category: 'hostname',
      severity: 'medium',
      scoreDelta: 25,
      description: `The URL contains ${anatomy.subdomains.length} subdomain levels. Deep subdomain chains are frequently used in phishing kits to mimic official portal hierarchies (e.g., secure.login.bank.attacker.com).`,
      technicalDetails: `Subdomains: ${anatomy.subdomains.join('.')}`,
    });
    score += 25;
  }

  // 7. Unusually Long URL and Hostname
  if (anatomy.length > 140) {
    indicators.push({
      id: 'extremely_long_url',
      name: 'Unusually Long URL Length',
      category: 'obfuscation',
      severity: 'medium',
      scoreDelta: 20,
      description: `The URL is ${anatomy.length} characters long. Extreme length is commonly employed in phishing attacks to push suspicious domains out of visible browser address bars and mobile screens.`,
      technicalDetails: `Total length: ${anatomy.length} characters (Standard benign threshold: < 75 chars)`,
    });
    score += 20;
  } else if (anatomy.length > 80) {
    indicators.push({
      id: 'long_url',
      name: 'Elevated URL Length',
      category: 'obfuscation',
      severity: 'low',
      scoreDelta: 10,
      description: `The URL length is ${anatomy.length} characters, slightly higher than standard navigation links.`,
      technicalDetails: `Total length: ${anatomy.length} characters`,
    });
    score += 10;
  }

  if (anatomy.hostname.length > 30) {
    indicators.push({
      id: 'long_hostname',
      name: 'Unusually Long Hostname',
      category: 'hostname',
      severity: 'low',
      scoreDelta: 15,
      description: `The hostname itself is ${anatomy.hostname.length} characters long, often indicating deliberate word-stuffing to look official.`,
      technicalDetails: `Hostname: ${anatomy.hostname} (${anatomy.hostname.length} chars)`,
    });
    score += 15;
  }

  // 8. Suspicious URL Encoding / Null Byte / Directory Traversal
  const rawLower = anatomy.raw.toLowerCase();
  const doubleEncoding = rawLower.includes('%25') || rawLower.includes('%2e%2e') || rawLower.includes('%00');
  const hexDensity = (rawLower.match(/%[0-9a-f]{2}/g) || []).length;

  if (doubleEncoding || hexDensity > 4) {
    indicators.push({
      id: 'suspicious_encoding',
      name: 'Suspicious Character Percent-Encoding',
      category: 'obfuscation',
      severity: 'high',
      scoreDelta: 20,
      description: 'The URL uses double encoding (%25), null byte injections (%00), or excessive hex percent-encoding to evade web application firewalls and email scanners.',
      technicalDetails: doubleEncoding ? 'Detected double-encoding / traversal tokens' : `High hex encoding density: ${hexDensity} tokens`,
    });
    score += 20;
  }

  // 9. Non-Standard Port
  if (anatomy.port !== '80' && anatomy.port !== '443') {
    indicators.push({
      id: 'non_standard_port',
      name: 'Non-Standard Web Port',
      category: 'transport',
      severity: 'medium',
      scoreDelta: 15,
      description: `The URL specifies port :${anatomy.port} instead of standard web ports (80 HTTP / 443 HTTPS). Legitimate public consumer portals rarely run on custom ports.`,
      technicalDetails: `Port: ${anatomy.port}`,
    });
    score += 15;
  }

  // 10. Dangerous Executable / Script Payloads
  const pathLower = anatomy.pathname.toLowerCase();
  const matchedExt = DANGEROUS_EXTENSIONS.find((ext) => pathLower.endsWith(ext) || pathLower.includes(`${ext}?`));
  if (matchedExt) {
    indicators.push({
      id: 'executable_payload',
      name: 'Direct Executable or Script File Extension',
      category: 'payload',
      severity: 'critical',
      scoreDelta: 40,
      description: `The URL points directly to an executable, installer, or script payload (${matchedExt}). Drive-by phishing links often distribute malware masquerading as critical updates.`,
      technicalDetails: `Detected file extension: ${matchedExt} in path "${anatomy.pathname}"`,
    });
    score += 40;
  }

  // 11. Brand Impersonation / Subdomain Spoofing
  let brandImpersonated: string | null = null;
  const fullUrlLower = (anatomy.hostname + anatomy.pathname).toLowerCase();

  for (const [brand, officialDomains] of Object.entries(FAMOUS_BRANDS)) {
    // Check if brand appears in hostname or path
    const brandInHost = anatomy.hostname.includes(brand);
    const brandInPath = pathLower.includes(brand);

    if (brandInHost || brandInPath) {
      // Check if actual registrable domain is official
      const isOfficial = officialDomains.some((dom) => anatomy.hostname === dom || anatomy.hostname.endsWith(`.${dom}`));
      if (!isOfficial) {
        brandImpersonated = brand;
        indicators.push({
          id: `brand_spoof_${brand}`,
          name: `Suspected Brand Impersonation: ${brand.toUpperCase()}`,
          category: 'hostname',
          severity: 'critical',
          scoreDelta: 40,
          description: `The URL references the well-known brand "${brand}", but the hosting domain ("${anatomy.hostname}") is NOT an official domain registered to that company.`,
          technicalDetails: `Target brand: ${brand}. Expected official domains: ${officialDomains.join(', ')}. Actual host: ${anatomy.hostname}`,
        });
        score += 40;
        break;
      }
    }
  }

  // Lookalike character typosquatting (e.g. g00gle, micros0ft, amaz0n, netfl1x)
  if (!brandImpersonated) {
    const typoPatterns = [
      { regex: /g[0o]{2}gle/i, brand: 'Google' },
      { regex: /micr[0o]s[0o]ft/i, brand: 'Microsoft' },
      { regex: /am[a4]z[0o]n/i, brand: 'Amazon' },
      { regex: /netfl[1i]x/i, brand: 'Netflix' },
      { regex: /p[a4]yp[a4]l/i, brand: 'PayPal' },
      { regex: /ch[a4]se-b[a4]nk/i, brand: 'Chase' },
    ];

    for (const item of typoPatterns) {
      if (item.regex.test(anatomy.hostname) && !anatomy.hostname.includes(item.brand.toLowerCase())) {
        indicators.push({
          id: 'typosquatting_lookalike',
          name: `Typosquatting / Character Substitution (${item.brand})`,
          category: 'hostname',
          severity: 'high',
          scoreDelta: 35,
          description: `The hostname contains visual character substitutions (leetspeak or homoglyph numbers) designed to mimic "${item.brand}".`,
          technicalDetails: `Pattern match on hostname: ${anatomy.hostname}`,
        });
        score += 35;
        break;
      }
    }
  }

  // 12. Suspicious Security & Credential Keywords
  const matchedKeywords = SUSPICIOUS_KEYWORDS.filter(
    (kw) => anatomy.hostname.includes(kw) || pathLower.includes(kw) || anatomy.search.toLowerCase().includes(kw)
  );

  if (matchedKeywords.length > 0) {
    // Only flag if not on recognized major top sites
    const isMajorCleanDomain = ['google.com', 'microsoft.com', 'apple.com', 'github.com', 'amazon.com'].some(
      (d) => anatomy.hostname === d || anatomy.hostname.endsWith(`.${d}`)
    );

    if (!isMajorCleanDomain) {
      const kwWeight = Math.min(25, 10 + matchedKeywords.length * 5);
      indicators.push({
        id: 'sensitive_keywords',
        name: 'Credential Harvesting Keywords Detected',
        category: 'keywords',
        severity: matchedKeywords.length >= 2 ? 'high' : 'medium',
        scoreDelta: kwWeight,
        description: `The URL contains keywords strongly correlated with credential harvesting: [${matchedKeywords.slice(0, 4).join(', ')}]. Note: Individual keywords are not conclusive proof, but warrant heightened caution.`,
        technicalDetails: `Found tokens: ${matchedKeywords.join(', ')}`,
      });
      score += kwWeight;
    }
  }

  // 13. High-Risk / Abused TLD
  if (HIGH_RISK_TLDS.has(anatomy.tld.toLowerCase())) {
    indicators.push({
      id: 'high_risk_tld',
      name: `High-Risk Top-Level Domain (.${anatomy.tld})`,
      category: 'hostname',
      severity: 'medium',
      scoreDelta: 15,
      description: `The domain uses the .${anatomy.tld} extension. This TLD has a statistically high correlation with disposable domains and malicious spam campaigns due to cheap or zero-cost registration.`,
      technicalDetails: `TLD: .${anatomy.tld}`,
    });
    score += 15;
  }

  // 14. Excessive Hyphens in Hostname
  const hyphenCount = (anatomy.hostname.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    indicators.push({
      id: 'excessive_hyphens',
      name: 'Excessive Hyphenation in Domain',
      category: 'hostname',
      severity: 'medium',
      scoreDelta: 20,
      description: `The hostname contains ${hyphenCount} hyphens. Phishers frequently combine words with hyphens (e.g. login-account-verify-secure) to evade simple brand string filters.`,
      technicalDetails: `Hyphens count: ${hyphenCount}`,
    });
    score += 20;
  }

  // 15. Open Redirect Parameters
  const redirectParams = ['redirect', 'url', 'next', 'dest', 'r', 'return', 'target', 'link'];
  const hasRedirectParam = redirectParams.some((param) => {
    return anatomy.search.toLowerCase().includes(`${param}=http`) || anatomy.search.toLowerCase().includes(`${param}=%2f`);
  });

  if (hasRedirectParam) {
    indicators.push({
      id: 'open_redirect_parameter',
      name: 'Potential Open Redirect Target Parameter',
      category: 'obfuscation',
      severity: 'medium',
      scoreDelta: 15,
      description: 'The query string contains a parameter specifying an external URL destination. Attackers use open redirects on legitimate sites to bounce users to phishing portals.',
      technicalDetails: `Query string contains redirect target in: ${anatomy.search}`,
    });
    score += 15;
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  let riskLevel: RiskLevel = 'low';
  if (finalScore >= 75) {
    riskLevel = 'critical';
  } else if (finalScore >= 50) {
    riskLevel = 'high';
  } else if (finalScore >= 25) {
    riskLevel = 'medium';
  }

  return {
    indicators,
    score: finalScore,
    riskLevel,
  };
}

export function generateDefensiveRecommendations(indicators: UrlIndicator[], riskLevel: RiskLevel): string[] {
  const recs: string[] = [];

  if (riskLevel === 'critical' || riskLevel === 'high') {
    recs.push('Do NOT open this link or enter any personal credentials or passwords.');
    recs.push('If this link was received via email or text message, mark it as phishing/spam and delete it immediately.');
    recs.push('Never download or execute files delivered directly through this link.');
  } else if (riskLevel === 'medium') {
    recs.push('Exercise caution before proceeding. Manually verify the domain identity.');
    recs.push('Instead of clicking the link, navigate to the organization’s official bookmark or type their known URL directly.');
  } else {
    recs.push('No obvious phishing signatures were found in this URL structure.');
    recs.push('Remember: Low heuristic risk does NOT guarantee absolute safety. Always verify the address bar before entering credentials.');
  }

  const hasHttp = indicators.some((i) => i.id === 'insecure_transport_http');
  if (hasHttp) {
    recs.push('Never submit sensitive financial, login, or personal information across plain HTTP.');
  }

  const hasShortener = indicators.some((i) => i.id === 'url_shortener');
  if (hasShortener) {
    recs.push('Use a link expander tool or check the destination preview before following shortened links.');
  }

  const hasBrandSpoof = indicators.some((i) => i.id.startsWith('brand_spoof_'));
  if (hasBrandSpoof) {
    recs.push('If you already visited this site and provided login details, change your real account password immediately and enable Multi-Factor Authentication (MFA).');
  }

  return recs;
}
