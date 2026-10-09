import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  Sparkles,
  Download,
  Info,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Globe,
  Radio,
  CheckCircle2,
  XCircle,
  LifeBuoy,
  PhoneCall,
  ArrowRight,
  Lock,
  FileWarning,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { ScanReport } from '../types/index.ts';
import {
  getRiskColor,
  getRiskLabel,
  getSafetyRating,
} from '../utils/formatters.ts';

interface ReportViewProps {
  report: ScanReport;
  onScanAnother: () => void;
  onGoToReportPhishing?: () => void;
  onGoToHelpCenter?: () => void;
}

// Hook to animate numbers smoothly when the component loads
function useAnimatedCounter(targetValue: number, durationMs = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = targetValue;
    if (start === end) {
      setCount(end);
      return;
    }

    const frameRate = 1000 / 60;
    const totalFrames = Math.round(durationMs / frameRate);
    const increment = (end - start) / totalFrames;

    let currentFrame = 0;
    const timer = setInterval(() => {
      currentFrame++;
      start += increment;
      if (currentFrame >= totalFrames) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.round(start));
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [targetValue, durationMs]);

  return count;
}

export const ReportView: React.FC<ReportViewProps> = ({
  report,
  onScanAnother,
  onGoToReportPhishing,
  onGoToHelpCenter,
}) => {
  const [copied, setCopied] = useState(false);
  const [gaugeMode, setGaugeMode] = useState<'safety' | 'risk'>('safety');

  const riskTheme = getRiskColor(report.riskLevel);
  const riskLabel = getRiskLabel(report.riskLevel);
  const safetyRating = getSafetyRating(report.safetyPercentage);

  // Animated numbers
  const animatedSafety = useAnimatedCounter(report.safetyPercentage, 900);
  const animatedRisk = useAnimatedCounter(report.riskScore, 900);

  // Gauge calculation
  const displayedValue = gaugeMode === 'safety' ? animatedSafety : animatedRisk;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayedValue / 100) * circumference;

  const activeGaugeHex =
    gaugeMode === 'safety'
      ? safetyRating.hex
      : report.riskLevel === 'critical'
      ? '#f43f5e'
      : report.riskLevel === 'high'
      ? '#fb923c'
      : report.riskLevel === 'medium'
      ? '#facc15'
      : '#10b981';

  // Analysis of indicators for the right reasons
  const isIp = report.anatomy.isIp || report.indicators.some((i) => i.id === 'ip_address_host');
  const hasExe = report.indicators.some((i) => i.id === 'dangerous_file_extension') ||
    /\.(exe|scr|bat|msi|apk|dmg|iso|vbs|cmd)$/i.test(report.anatomy.pathname);
  const brandSpoof = report.indicators.find((i) => i.id.startsWith('typosquatting') || i.id.startsWith('brand_spoof'));
  const hasKeywords = report.indicators.some((i) => i.id === 'sensitive_keywords');
  const isHttp = report.anatomy.protocol === 'http:' || report.indicators.some((i) => i.id === 'insecure_transport_http');
  const hasHighRiskTld = report.indicators.some((i) => i.id === 'high_risk_tld');
  const hasShortener = report.indicators.some((i) => i.id === 'url_shortener');
  const hasAuth = report.anatomy.hasAuth || report.indicators.some((i) => i.id === 'user_auth_in_url');
  const isThreatIntelMatch = report.indicators.some((i) => i.id === 'threat_intel_match');

  // Compute Right Reasons
  const getStructuredReasons = () => {
    const list: { title: string; explanation: string; severity: 'critical' | 'high' | 'medium' | 'safe' }[] = [];

    if (isThreatIntelMatch) {
      list.push({
        title: 'Global Blacklist & Threat Feed Confirmation',
        explanation: 'This address is confirmed malicious by active global threat intelligence databases (Google Safe Browsing). It has been verified in active phishing or malware dissemination campaigns.',
        severity: 'critical',
      });
    }

    if (hasExe) {
      list.push({
        title: 'Direct Executable File Delivery (.exe / binary)',
        explanation: `The URL links directly to an executable binary file. Legitimate online services do not serve unvetted executables via unsolicited web links. Direct executable payloads are the primary delivery vector for ransomware, trojans, and keyloggers.`,
        severity: 'critical',
      });
    }

    if (isIp) {
      list.push({
        title: `Raw Numerical IP Host (${report.anatomy.hostname})`,
        explanation: `The URL uses a raw IP address instead of a registered domain. Threat actors use direct numerical IPs to bypass domain reputation registries, avoid domain registrar takedowns, and hide WHOIS ownership.`,
        severity: 'high',
      });
    }

    if (brandSpoof) {
      list.push({
        title: `Lookalike Brand Impersonation / Homoglyph (${brandSpoof.name})`,
        explanation: `The domain name uses visual character substitution (such as replacing letters with numbers or adding deceptive hyphenated words) to impersonate a trusted institution and route typed credentials to an attacker server.`,
        severity: 'critical',
      });
    }

    if (hasKeywords) {
      list.push({
        title: 'Credential Harvesting Forms & Traps',
        explanation: 'The URL embeds urgency-driven authentication and verification keywords (e.g. login, verify, banking, passcode) on an untrusted or non-official domain to trick users into revealing secret credentials.',
        severity: 'high',
      });
    }

    if (hasHighRiskTld) {
      list.push({
        title: `Disposable High-Risk Top-Level Domain (.${report.anatomy.tld})`,
        explanation: `Registered under .${report.anatomy.tld}, a cheap or free TLD extension with a statistically high incidence of disposable phishing websites and minimal anti-abuse enforcement.`,
        severity: 'medium',
      });
    }

    if (isHttp) {
      list.push({
        title: 'Insecure Unencrypted Transport (HTTP)',
        explanation: 'Data is transmitted over cleartext HTTP without TLS encryption. Any information or credentials submitted through this link are vulnerable to packet sniffing and interception.',
        severity: 'medium',
      });
    }

    if (hasAuth) {
      list.push({
        title: 'Credential Masking via "@" Syntax',
        explanation: 'The URL uses the "@" character to confuse readers into seeing a trusted domain before the symbol, while the browser actually connects to the server listed after it.',
        severity: 'high',
      });
    }

    if (hasShortener) {
      list.push({
        title: 'Destination Masking via URL Shortener',
        explanation: 'The link conceals its true destination through a redirect service, preventing immediate inspection of the target server.',
        severity: 'medium',
      });
    }

    // If completely clean
    if (list.length === 0 && report.riskLevel === 'low') {
      list.push({
        title: 'Verified Domain & Valid Infrastructure',
        explanation: `Belongs to standard recognized domain infrastructure (${report.anatomy.hostname}). Validated with standard transport encryption (HTTPS), legitimate domain hierarchy, and clean global threat reputation feeds.`,
        severity: 'safe',
      });
      list.push({
        title: 'Zero Phishing Signatures or Payload Traps',
        explanation: 'No homoglyphic substitutions, no credential harvesting forms, no suspicious redirects, and no malicious file downloads were found in the link structure.',
        severity: 'safe',
      });
    }

    return list;
  };

  // Compute Right Next Steps
  const getRightNextSteps = () => {
    if (report.safetyPercentage < 50 || report.riskLevel === 'high' || report.riskLevel === 'critical') {
      return [
        {
          step: '1. Do NOT open, click, or load this link',
          detail: 'Close the browser tab immediately. Do not bypass browser warnings or proceed to the destination.',
          urgent: true,
          badge: 'Immediate Action',
        },
        hasExe
          ? {
              step: '2. Delete downloaded files & run antivirus immediately',
              detail: 'If an executable (.exe, .zip, .dmg, .apk) began downloading, do NOT open or run it. Delete it permanently from your Downloads folder and run a full system scan with Windows Defender or an antivirus.',
              urgent: true,
              badge: 'Malware Defense',
            }
          : {
              step: '2. Never enter passwords, credentials, or bank details',
              detail: 'Attackers create convincing replica login screens to harvest usernames, passcodes, banking logins, and 2FA tokens. Never type sensitive info on this site.',
              urgent: true,
              badge: 'Credential Safety',
            },
        {
          step: '3. If credentials were typed: Change password now',
          detail: 'If you already entered passwords or sensitive information on this page, immediately go to the REAL, official website in a clean tab, reset your password, and enable Multi-Factor Authentication (MFA).',
          urgent: true,
          badge: 'Emergency Remediation',
        },
        {
          step: '4. Dial Cyber Police 1930 & submit report',
          detail: 'Call the National Cyber Financial Fraud Toll-Free Helpline 1930 (available 24x7) if financial details were entered, and submit this link to our official Phishing Bureau for domain takedown.',
          urgent: true,
          badge: 'Report & Protect',
        },
      ];
    } else if (report.safetyPercentage < 80 || report.riskLevel === 'medium') {
      return [
        {
          step: '1. Scrutinize the domain in your browser address bar',
          detail: 'Carefully verify the root domain spelling before interacting. Check for subtle letter replacements, unusual hyphens, or extra words.',
          urgent: false,
          badge: 'Address Verification',
        },
        {
          step: '2. Navigate using official bookmarks, not unsolicited links',
          detail: 'If you received this link via email, SMS, or chat claiming urgent account action, do not click. Navigate to the service directly via your own bookmark or verified search engine.',
          urgent: false,
          badge: 'Safe Navigation',
        },
        {
          step: '3. Verify with the sender through an independent channel',
          detail: 'If this message purported to be from a colleague, bank, or vendor, contact them directly via phone or another verified channel before taking action.',
          urgent: false,
          badge: 'Out-of-Band Check',
        },
        {
          step: '4. Never enter credentials over unencrypted HTTP',
          detail: 'Ensure the padlock icon is present and a valid SSL certificate is issued before submitting any login credentials.',
          urgent: false,
          badge: 'Transport Security',
        },
      ];
    } else {
      return [
        {
          step: '1. Link appears benign, standard vigilance applies',
          detail: 'The URL conforms to verified domain standards with clean reputation feeds. No malicious vectors or brand homoglyphs were identified.',
          urgent: false,
          badge: 'Low Risk',
        },
        {
          step: '2. Check the browser address bar upon arrival',
          detail: 'Always ensure the lock icon is displayed and the domain matches the organization you intended to visit before providing information.',
          urgent: false,
          badge: 'Verification',
        },
        {
          step: '3. Never share 2FA / OTP codes with anyone',
          detail: 'Even on completely authentic and safe websites, never disclose one-time passwords, security PINs, or recovery phrases over call or chat.',
          urgent: false,
          badge: 'Cyber Hygiene',
        },
      ];
    }
  };

  const handleCopyReport = () => {
    const reportText = `[TRUVEXA SECURITY AUDIT REPORT]
Inspected URL: ${report.url}
Safety Rating: ${report.safetyPercentage}% Safe to Visit (${safetyRating.label})
Threat Risk Score: ${report.riskScore}/100 (${riskLabel})
Threat Intelligence: ${report.threatIntel.status.toUpperCase()} (${report.threatIntel.details})
Flags / Indicators Detected: ${report.indicators.length}
Primary Reason Behind Result: ${report.aiExplanation.executiveSummary}
Next Steps To Stay Safe:
${report.recommendations.map((r, i) => ` ${i + 1}. ${r}`).join('\n')}
Audited by TRUVEXA Link Defense System at ${report.timestamp}`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `truvexa-report-${report.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Top Banner Card */}
      <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-2xl relative overflow-hidden card-hover-glow interactive-float">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Cohesive font color and badge with white safety text */}
              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase border flex items-center gap-1.5 shadow-lg ${safetyRating.border} ${safetyRating.bg}`}
              >
                {report.safetyPercentage < 50 ? (
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                ) : report.safetyPercentage < 80 ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="text-white font-extrabold">
                  {animatedSafety}% SAFE — {safetyRating.label.toUpperCase()}
                </span>
              </span>

              <span
                className={`px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase border ${riskTheme.border} ${riskTheme.bg} ${riskTheme.text}`}
              >
                {riskLabel} ({animatedRisk}/100)
              </span>

              <span className="text-xs font-mono text-slate-400 flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {report.timestamp}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Target URL Inspected
              </span>
              <div className="text-sm sm:text-base font-mono text-white font-medium break-all bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 select-all">
                {report.url}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopyReport}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 glow-complement-click interactive-float"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 glow-complement-click interactive-float"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={onScanAnother}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer active:scale-95 btn-glow glow-complement-click interactive-float flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Scan Another</span>
            </button>
          </div>
        </div>
      </div>

      {/* TWO COLUMN ROW: SECTION 1 (METER VIEW MODE) + SECTION 2 (REASON BEHIND THE RESULT) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* SECTION 1: METER VIEW MODE (md:col-span-4) - NO GLOW */}
        <div className="md:col-span-4 p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-md flex flex-col items-center text-center space-y-4 meter-view-card">
          <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Meter View Mode</span>
            </div>
            {/* Toggle between Safety % and Risk Score Gauge */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setGaugeMode('safety')}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  gaugeMode === 'safety' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                Safe %
              </button>
              <button
                type="button"
                onClick={() => setGaugeMode('risk')}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  gaugeMode === 'risk' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400'
                }`}
              >
                Risk
              </button>
            </div>
          </div>

          {/* Radial Safety Gauge Circle - Zero Glow */}
          <div className="relative w-44 h-44 flex items-center justify-center my-2">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-800/80"
                strokeWidth="11"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke={activeGaugeHex}
                strokeWidth="11"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
                style={{
                  filter: 'none',
                }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span
                className="text-4xl font-extrabold font-mono tracking-tight tabular-nums text-white"
              >
                {displayedValue}%
              </span>
              <span
                className="text-[11px] font-mono uppercase tracking-wider font-bold text-white/90"
              >
                {gaugeMode === 'safety' ? safetyRating.label : riskLabel}
              </span>
            </div>
          </div>

          {/* Meter Details Strip */}
          <div className="w-full space-y-2 text-xs border-t border-slate-800/80 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono">Calculated Metric:</span>
              <span className="font-bold font-mono text-sm text-white">
                {animatedSafety}% Safe
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Risk Severity Index:</span>
              <span className={`font-semibold ${riskTheme.text}`}>
                {report.riskScore}/100
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 leading-snug text-left">
              <span className="text-cyan-300 font-bold">Meter Details: </span>
              {gaugeMode === 'safety'
                ? `Calculated based on URL behavioral metrics, security heuristics, threat intelligence feeds, and protocol validation.`
                : `Higher risk percentage indicates observed malicious intent, deceptive keywords, or domain spoofing.`}
            </div>
          </div>
        </div>

        {/* SECTION 2: REASON BEHIND THIS RESULT (md:col-span-8) */}
        <div className="md:col-span-8 p-6 rounded-2xl bg-[#0b1120] border border-cyan-500/30 shadow-2xl space-y-5 card-hover-glow interactive-float">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Reason Behind This Result
              </h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded">
              Verified Technical Rationale
            </span>
          </div>

          {/* Primary Assessment Banner */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Verdict & Executive Summary:</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {report.aiExplanation.executiveSummary}
            </p>
          </div>

          {/* Specific Diagnosed Root Causes (The Right Reasons) */}
          <div className="space-y-3 pt-1">
            <span className="text-xs font-mono uppercase text-slate-400 font-semibold block flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Diagnosed Root Causes & Threat Breakdown:
            </span>

            <div className="space-y-2.5">
              {getStructuredReasons().map((reason, idx) => {
                const borderCls =
                  reason.severity === 'critical'
                    ? 'border-rose-500/40 bg-rose-950/20'
                    : reason.severity === 'high'
                    ? 'border-orange-500/40 bg-orange-950/20'
                    : reason.severity === 'medium'
                    ? 'border-amber-500/40 bg-amber-950/20'
                    : 'border-emerald-500/40 bg-emerald-950/20';

                const badgeCls =
                  reason.severity === 'critical'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : reason.severity === 'high'
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                    : reason.severity === 'medium'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

                return (
                  <div key={idx} className={`p-3.5 rounded-xl border ${borderCls} space-y-1 transition-all`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {reason.severity === 'critical' || reason.severity === 'high' ? (
                          <FileWarning className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : reason.severity === 'medium' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        <h4 className="text-xs font-bold text-white">{reason.title}</h4>
                      </div>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${badgeCls}`}>
                        {reason.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 pl-6 leading-relaxed">
                      {reason.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Threat Intel Status */}
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs flex items-start gap-2.5">
            <Radio className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-slate-200">Global Threat Intelligence Feed Status:</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {report.threatIntel.details}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: WHAT YOU SHOULD DO NEXT TO STAY SAFE (Full Width Prominent Card) */}
      <div className="p-6 rounded-2xl bg-[#0b1120] border border-emerald-500/30 shadow-2xl space-y-5 card-hover-glow interactive-float">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                What You Should Do Next To Stay Safe
              </h3>
              <p className="text-xs text-slate-400">
                Actionable step-by-step guidance tailored to the safety verdict of this URL.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onGoToHelpCenter && (
              <button
                onClick={onGoToHelpCenter}
                className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-semibold hover:border-cyan-400 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cyber Police Hotlines</span>
              </button>
            )}
            <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded">
              Defensive Action Plan
            </span>
          </div>
        </div>

        {/* Action Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getRightNextSteps().map((action, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                action.urgent
                  ? 'bg-slate-900/80 border-cyan-500/40 text-slate-200 hover:border-cyan-400/60'
                  : 'bg-slate-900/70 border-slate-800 text-slate-200 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {action.urgent ? (
                    <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <h4 className={`text-xs font-bold ${action.urgent ? 'text-cyan-300' : 'text-emerald-300'}`}>
                    {action.step}
                  </h4>
                </div>
                {action.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                    action.urgent ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {action.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 pl-6 leading-relaxed">
                {action.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Immediate Escalation & Report Strip */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-300">
            <span className="font-semibold text-emerald-400">Next Action: </span>
            {report.safetyPercentage < 50
              ? 'Dispatch this deceptive link to national cyber authorities to initiate domain takedown, or dial 1930.'
              : 'Keep your browser security shields enabled and verify sender identity before entering credentials.'}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {report.safetyPercentage < 50 && onGoToHelpCenter && (
              <button
                onClick={onGoToHelpCenter}
                className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold hover:border-emerald-400 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Hotline 1930</span>
              </button>
            )}

            {onGoToReportPhishing && (
              <button
                onClick={onGoToReportPhishing}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/40 text-cyan-200 font-bold hover:bg-cyan-600/40 hover:border-cyan-400 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Submit to Phishing Bureau</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Evaluated Security Indicators */}
      <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl space-y-4 card-hover-glow interactive-float">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Evaluated Security Indicators ({report.indicators.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Comprehensive Threat Checks
          </span>
        </div>

        {report.indicators.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-xs">
            No anomalous indicators detected in security analysis.
          </div>
        ) : (
          <div className="space-y-3">
            {report.indicators.map((indicator) => {
              const severityBadge =
                indicator.severity === 'critical'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : indicator.severity === 'high'
                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                  : indicator.severity === 'medium'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';

              return (
                <div
                  key={indicator.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-400 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.7)] transition-all duration-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer glow-complement-click active:scale-[0.99]"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${severityBadge}`}>
                        {indicator.severity}
                      </span>
                      <span className="font-semibold text-sm text-white">{indicator.name}</span>
                      <span className="text-xs font-mono text-cyan-400">
                        +{indicator.scoreDelta} pts
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {indicator.description}
                    </p>

                    {indicator.technicalDetails && (
                      <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800/80 inline-block">
                        Technical Evidence: {indicator.technicalDetails}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Defensive Security Notice */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 leading-relaxed interactive-float">
        <span className="font-semibold text-slate-300">TRUVEXA Security Policy Notice: </span>
        Zero-day credential harvesting links and newly registered malicious domains often evade reputation lists during the initial hours of a campaign. Always confirm domain spellings directly in your browser address bar.
      </div>
    </section>
  );
};
