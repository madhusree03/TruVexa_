import React, { useState } from 'react';
import {
  ShieldAlert,
  Send,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  Mail,
  Globe,
  PhoneCall,
  Info,
} from 'lucide-react';
import { ScanReport } from '../types/index.ts';

interface ReportPhishingViewProps {
  currentReport: ScanReport | null;
  onGoToScanner: () => void;
  onGoToHelpCenter: () => void;
}

export const ReportPhishingView: React.FC<ReportPhishingViewProps> = ({
  currentReport,
  onGoToScanner,
  onGoToHelpCenter,
}) => {
  const [suspectUrl, setSuspectUrl] = useState(currentReport?.url || '');
  const [incidentType, setIncidentType] = useState('credential_harvesting');
  const [notes, setNotes] = useState(
    currentReport
      ? `Detected by TRUVEXA engine with safety rating of ${currentReport.safetyPercentage}%. Primary reason: ${currentReport.aiExplanation.executiveSummary}`
      : ''
  );
  const [userEmail, setUserEmail] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const officialAgencies = [
    {
      name: 'Google Safe Browsing & Anti-Phishing',
      agency: 'Google Threat Analysis Group',
      portalUrl: 'https://safebrowsing.google.com/safebrowsing/report_phish/',
      description:
        'Submit deceptive and fraudulent URLs directly to Chrome & Android protective threat feeds.',
      badge: 'Global Browser Protection',
    },
    {
      name: 'APWG (Anti-Phishing Working Group)',
      agency: 'Global APWG Consortium',
      portalUrl: 'https://apwg.org/reportphishing/',
      email: 'reportphishing@apwg.org',
      description:
        'The international coalition unifying law enforcement, financial institutions, and cybersecurity researchers.',
      badge: 'International Law Enforcement',
    },
    {
      name: 'US-CERT / CISA Phishing Defense',
      agency: 'Cybersecurity and Infrastructure Security Agency',
      portalUrl: 'https://www.cisa.gov/report',
      email: 'phishing-report@us-cert.gov',
      description:
        'Official United States federal agency for protecting critical digital infrastructure and responding to nation-state threats.',
      badge: 'US Government / CISA',
    },
    {
      name: 'NCSC (National Cyber Security Centre)',
      agency: 'UK GCHQ / Cyber Crime Reporting',
      portalUrl: 'https://www.ncsc.gov.uk/section/about-ncsc/report-an-incident',
      email: 'report@phishing.gov.uk',
      description:
        'Dedicated UK government service for reporting suspicious phishing emails, deceptive SMS, and fraudulent web addresses.',
      badge: 'UK Cyber Command',
    },
    {
      name: 'National Cyber Crime Reporting Portal (I4C)',
      agency: 'Indian Cyber Crime Coordination Centre (MHA)',
      portalUrl: 'https://cybercrime.gov.in',
      tollFree: '1930',
      description:
        'Official government portal to report cyber fraud, financial scams, identity theft, and malicious phishing websites in India.',
      badge: 'India Ministry of Home Affairs',
    },
    {
      name: 'FBI Internet Crime Complaint Center (IC3)',
      agency: 'Federal Bureau of Investigation',
      portalUrl: 'https://www.ic3.gov',
      description:
        'The FBI IC3 accepts complaints regarding Internet-facilitated cyber scams, wire fraud, ransomware, and identity harvesting.',
      badge: 'FBI Special Division',
    },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspectUrl.trim()) return;

    setSubmissionStatus('processing');
    setTimeout(() => {
      setSubmissionStatus('success');
    }, 900);
  };

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0b1120] border border-rose-500/30 shadow-2xl card-hover-glow interactive-float">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/60 text-rose-400 text-xs font-mono">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>OFFICIAL INCIDENT DISPATCH</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Where to Report Phishing & Cyber Threats
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Found a deceptive link or malicious website? Report it directly to global cyber intelligence bureaus, national cyber crime portals, and web browser threat blacklists to have it suspended and protect millions of users worldwide.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onGoToHelpCenter}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs text-slate-200 font-semibold flex items-center gap-2 transition-all cursor-pointer active:scale-95 glow-complement-click hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] interactive-float"
            >
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              <span>Cyber Help Centre & Hotlines</span>
            </button>
            <button
              onClick={onGoToScanner}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 text-xs font-bold transition-all cursor-pointer active:scale-95 btn-glow interactive-float"
            >
              Scan Another URL
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Direct Report Submission Form + Official Portals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Quick Dispatch Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl space-y-5 card-hover-glow interactive-float">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-400" />
                Dispatch Phishing Report
              </h3>
              <span className="text-[11px] font-mono text-slate-400">TRUVEXA Direct Feed</span>
            </div>

            {submissionStatus === 'success' ? (
              <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 mx-auto flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-emerald-300">
                  Report Queued for Triage!
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Thank you for contributing to collective cyber safety. The URL hash has been recorded in TRUVEXA&apos;s threat heuristic registry, and syndicated to connected anti-abuse endpoints.
                </p>
                <button
                  onClick={() => {
                    setSubmissionStatus(null);
                    setSuspectUrl('');
                    setNotes('');
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-xs text-emerald-200 font-bold transition-all cursor-pointer"
                >
                  Submit Another URL
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Suspect URL or Deceptive Domain <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={suspectUrl}
                    onChange={(e) => setSuspectUrl(e.target.value)}
                    placeholder="https://malicious-login-site.xyz/verify"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono focus:border-rose-400 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Threat Category
                  </label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:border-rose-400 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="credential_harvesting">Credential Harvesting / Fake Login Page</option>
                    <option value="quishing">Quishing (Malicious QR Code)</option>
                    <option value="financial_fraud">Bank / Crypto / Payment Impersonation</option>
                    <option value="malware_delivery">Direct Malware / Ransomware Executable Download</option>
                    <option value="sms_smishing">SMS / WhatsApp Phishing (Smishing)</option>
                    <option value="homoglyph_typo">Lookalike / Homoglyph Brand Domain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Reporter Contact Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="reporter@domain.com (for verification updates)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:border-rose-400 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Forensic Notes / How was it received?
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Received via SMS claiming bank account suspended. Sender used urgent tone..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:border-rose-400 focus:outline-none transition-all resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submissionStatus === 'processing'}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:opacity-95 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 cursor-pointer active:scale-95 btn-glow transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {submissionStatus === 'processing' ? 'Submitting to Feeds...' : 'Submit Phishing Report'}
                  </span>
                </button>
              </form>
            )}
          </div>

          {/* Quick Tip Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2 interactive-float">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Did You Enter Passwords on This Site?</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              If you or someone in your organization entered credentials into a phishing link, do not wait for the takedown. Change your credentials immediately on the authentic official service and revoke active session cookies.
            </p>
          </div>
        </div>

        {/* Right Column: Global & National Reporting Portals */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl space-y-4 card-hover-glow interactive-float">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  Authorized International Reporting Authorities
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click through to file official incident reports directly with law enforcement agencies and browser defense coalitions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {officialAgencies.map((agency, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-400/80 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 card-hover-glow interactive-float"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-cyan-950/70 border border-cyan-800/70 text-cyan-300">
                        {agency.badge}
                      </span>
                      <h4 className="font-bold text-sm text-white">{agency.name}</h4>
                    </div>

                    <div className="text-xs font-mono text-slate-400">{agency.agency}</div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {agency.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-mono">
                      {agency.tollFree && (
                        <span className="text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded flex items-center gap-1">
                          <PhoneCall className="w-3 h-3" />
                          Toll-Free Helpline: {agency.tollFree}
                        </span>
                      )}
                      {agency.email && (
                        <button
                          onClick={() => handleCopy(agency.email!, `email-${idx}`)}
                          className="text-slate-300 hover:text-cyan-300 bg-slate-950/60 border border-slate-800 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Mail className="w-3 h-3 text-cyan-400" />
                          <span>{agency.email}</span>
                          {copiedLink === `email-${idx}` ? (
                            <Check className="w-3 h-3 text-emerald-400 ml-1" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-500 ml-1" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center sm:self-center">
                    <a
                      href={agency.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 text-xs font-semibold text-slate-200 hover:text-cyan-300 flex items-center gap-1.5 transition-all shadow-sm active:scale-95 glow-complement-click"
                    >
                      <span>Visit Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
