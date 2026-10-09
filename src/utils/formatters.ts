import { RiskLevel, ScanReport } from '../types/index.ts';

export function getRiskColor(level: RiskLevel): {
  text: string;
  bg: string;
  border: string;
  glow: string;
  hex: string;
} {
  switch (level) {
    case 'low':
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        glow: 'rgba(16, 185, 129, 0.25)',
        hex: '#10b981',
      };
    case 'medium':
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        glow: 'rgba(245, 158, 11, 0.25)',
        hex: '#f59e0b',
      };
    case 'high':
      return {
        text: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        glow: 'rgba(249, 115, 22, 0.25)',
        hex: '#f97316',
      };
    case 'critical':
      return {
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        glow: 'rgba(244, 63, 94, 0.25)',
        hex: '#f43f5e',
      };
  }
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'Low Observed Risk';
    case 'medium':
      return 'Medium Observed Risk';
    case 'high':
      return 'High Observed Risk';
    case 'critical':
      return 'Critical Phishing Risk';
  }
}

export function getSafetyRating(percentage: number): {
  label: string;
  badge: string;
  color: string;
  bg: string;
  border: string;
  hex: string;
} {
  if (percentage >= 80) {
    return {
      label: 'High Confidence Safe',
      badge: `${percentage}% Safe`,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      hex: '#10b981',
    };
  }
  if (percentage >= 55) {
    return {
      label: 'Moderate Safety (Proceed with Caution)',
      badge: `${percentage}% Safe`,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      hex: '#f59e0b',
    };
  }
  if (percentage >= 30) {
    return {
      label: 'Low Safety (Elevated Phishing Risk)',
      badge: `${percentage}% Safe`,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      hex: '#f97316',
    };
  }
  return {
    label: 'Critical Danger (Do Not Open)',
    badge: `${percentage}% Safe`,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    hex: '#f43f5e',
  };
}

export function formatReportAsText(report: ScanReport): string {
  const safetyRating = getSafetyRating(report.safetyPercentage);
  const lines: string[] = [
    '==================================================',
    '           TRUVEXA LINK SAFETY & SCAN REPORT      ',
    '==================================================',
    `Timestamp: ${new Date(report.timestamp).toUTCString()}`,
    `Submitted URL: ${report.url}`,
    `Normalized: ${report.anatomy.normalized}`,
    `Hostname: ${report.anatomy.hostname}`,
    `Protocol: ${report.anatomy.protocol.toUpperCase()}`,
    `Safety Rating: ${report.safetyPercentage}% SAFE [${safetyRating.label.toUpperCase()}]`,
    `Risk Score: ${report.riskScore}/100 [${getRiskLabel(report.riskLevel).toUpperCase()}]`,
    `Threat Intel: ${report.threatIntel.status.toUpperCase()} (${report.threatIntel.provider})`,
    '--------------------------------------------------',
    'DETECTED SECURITY INDICATORS:',
  ];

  if (report.indicators.length === 0) {
    lines.push('  None detected (Standard benign structural profile)');
  } else {
    report.indicators.forEach((ind, idx) => {
      lines.push(`  ${idx + 1}. [${ind.severity.toUpperCase()}] ${ind.name} (+${ind.scoreDelta} pts)`);
      lines.push(`     Description: ${ind.description}`);
      if (ind.technicalDetails) {
        lines.push(`     Details: ${ind.technicalDetails}`);
      }
    });
  }

  lines.push('--------------------------------------------------');
  lines.push('EXECUTIVE SUMMARY & ANALYSIS:');
  lines.push(`  ${report.aiExplanation.executiveSummary}`);
  lines.push('');
  lines.push('DEFENSIVE RECOMMENDATIONS:');
  report.recommendations.forEach((rec, idx) => {
    lines.push(`  ${idx + 1}. ${rec}`);
  });
  lines.push('==================================================');
  lines.push('TRUVEXA: Verify Before You Click');

  return lines.join('\n');
}

export function exportHistoryAsCsv(history: ScanReport[]): void {
  const headers = ['Timestamp', 'URL', 'Hostname', 'Safety Percentage', 'Risk Score', 'Risk Level', 'Threat Intel Status', 'Indicators Count'];
  const rows = history.map((item) => [
    `"${new Date(item.timestamp).toISOString()}"`,
    `"${item.url.replace(/"/g, '""')}"`,
    `"${item.anatomy.hostname}"`,
    `${item.safetyPercentage}%`,
    item.riskScore,
    `"${item.riskLevel}"`,
    `"${item.threatIntel.status}"`,
    item.indicators.length,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `truvexa-scans-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
