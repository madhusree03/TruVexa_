export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type IndicatorSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export type IndicatorCategory =
  | 'transport'
  | 'hostname'
  | 'credentials'
  | 'obfuscation'
  | 'keywords'
  | 'payload'
  | 'reputation';

export interface UrlIndicator {
  id: string;
  name: string;
  category: IndicatorCategory;
  severity: IndicatorSeverity;
  scoreDelta: number;
  description: string;
  technicalDetails?: string;
}

export interface ThreatIntelResult {
  provider: string;
  status: 'clean' | 'threat_found' | 'unconfigured' | 'error' | 'inconclusive';
  threatTypes?: string[];
  details: string;
  checkedAt: string;
}

export interface AiExplanation {
  executiveSummary: string;
  attackTechnique: string;
  recommendations: string[];
  limitations: string;
  isAiGenerated: boolean;
}

export interface UrlAnatomy {
  raw: string;
  normalized: string;
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hasAuth: boolean;
  userInfo: string;
  tld: string;
  subdomains: string[];
  length: number;
  isIp: boolean;
  isPunycode: boolean;
}

export interface ScanReport {
  id: string;
  timestamp: string;
  url: string;
  riskScore: number; // 0 to 100
  safetyPercentage: number; // 0% (dangerous) to 100% (safe)
  riskLevel: RiskLevel;
  anatomy: UrlAnatomy;
  indicators: UrlIndicator[];
  threatIntel: ThreatIntelResult;
  aiExplanation: AiExplanation;
  recommendations: string[];
  isHeuristicOnly: boolean;
}

export interface ScanStats {
  totalScans: number;
  lowRiskCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
  criticalRiskCount: number;
  threatIntelDetections: number;
}
