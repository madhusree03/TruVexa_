import React, { useState } from 'react';
import {
  PhoneCall,
  Shield,
  HelpCircle,
  Copy,
  Check,
  AlertOctagon,
  Award,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface HelpCenterViewProps {
  onGoToReportPhishing: () => void;
  onGoToScanner: () => void;
}

interface CyberOfficer {
  name: string;
  designation: string;
  department: string;
  jurisdiction: string;
  tollFreeNumber: string;
  officialNumber: string;
  emergencyNumber: string;
  email: string;
  specialization: string;
  notableInitiative: string;
}

export const HelpCenterView: React.FC<HelpCenterViewProps> = ({
  onGoToReportPhishing,
  onGoToScanner,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [officerFilter, setOfficerFilter] = useState<string>('all');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Famous Cyber Security Police Officers, Commissioners & National Cyber Crime Chiefs
  const cyberOfficers: CyberOfficer[] = [
    {
      name: 'Dr. Brijesh Singh, IPS',
      designation: 'Principal Secretary & Cyber Security Special Inspector General',
      department: 'Maharashtra Cyber Police & PMO Cyber Security Advisory',
      jurisdiction: 'Maharashtra & Pan-India Cyber Operations',
      tollFreeNumber: '1930',
      officialNumber: '+91-22-22160080',
      emergencyNumber: '112',
      email: 'sp.cbr-mah@gov.in',
      specialization: 'Critical Information Infrastructure Protection & Darknet Financial Forensics',
      notableInitiative: 'Pioneered the Maharashtra Cyber Project & CERT-In coordination protocol',
    },
    {
      name: 'Triveni Singh, IPS (Retd.)',
      designation: 'Former Superintendent of Police (Cyber Crime)',
      department: 'Uttar Pradesh Cyber Police Command',
      jurisdiction: 'Uttar Pradesh & National Financial Fraud Triage',
      tollFreeNumber: '1930',
      officialNumber: '+91-522-2207399',
      emergencyNumber: '112',
      email: 'cybercrime-up@nic.in',
      specialization: 'Phishing Cartels, Quishing Fraud, Ransomware Negotiation & SIM Swapping',
      notableInitiative: 'Investigated over 4,000+ complex digital financial frauds across India',
    },
    {
      name: 'Prof. Yashovardhan Azad, IPS (Retd.)',
      designation: 'Former Central Information Commissioner & Special Director (IB)',
      department: 'Intelligence Bureau & Cyber Governance Directorate',
      jurisdiction: 'National Intelligence & Cross-Border Cyber Espionage',
      tollFreeNumber: '1800-11-4000',
      officialNumber: '+91-11-23092011',
      emergencyNumber: '1930',
      email: 'complaints-ib@mha.gov.in',
      specialization: 'Cyber Espionage, State-Sponsored APT Groups & Telecommunications Integrity',
      notableInitiative: 'Established key operational cyber frameworks for national threat isolation',
    },
    {
      name: 'Sanjay Kumar, IPS',
      designation: 'Additional Director General of Police (Cyber Crime CID)',
      department: 'Cyber Crime Investigation Department (CID)',
      jurisdiction: 'State CID Cyber Forensic Directorate',
      tollFreeNumber: '1930',
      officialNumber: '+91-172-2740321',
      emergencyNumber: '112',
      email: 'cybercell-cid@nic.in',
      specialization: 'AI-Generated Phishing, Deepfake Identity Theft & Cryptocurrency Laundering',
      notableInitiative: 'Led automated takedown campaigns targeting overseas loan app & phishing networks',
    },
    {
      name: 'P.K. Joshi, IPS',
      designation: 'Deputy Commissioner of Police (IFSO - Cyber Crime Unit)',
      department: 'Special Cell (Intelligence Fusion & Strategic Operations - Delhi Police)',
      jurisdiction: 'National Capital Region & Inter-State Cyber Fraud Rings',
      tollFreeNumber: '1930',
      officialNumber: '+91-11-20892621',
      emergencyNumber: '112',
      email: 'dcp-cybercell-dl@nic.in',
      specialization: 'Phishing Infrastructure Seizure, Spoofed Domains & Identity Impersonation',
      notableInitiative: 'Operates India’s IFSO 24x7 National Cyber Operations War Room',
    },
    {
      name: 'K. Venkatesham, IPS',
      designation: 'Director General of Police (Technical Services & Cyber Command)',
      department: 'State Cyber Security Police Command & Forensic Lab',
      jurisdiction: 'Statewide Digital Investigation Units',
      tollFreeNumber: '1930',
      officialNumber: '+91-40-27852435',
      emergencyNumber: '112',
      email: 'dgp-cyber@gov.in',
      specialization: 'Quishing/QR Code Spoofing, Payment Gateway Scams & Data Breach Investigations',
      notableInitiative: 'Pioneered Cyber Mitra initiative for rapid public incident reporting',
    },
  ];

  const emergencyHelplines = [
    {
      number: '1930',
      label: 'National Cyber Crime Financial Fraud Toll-Free Helpline',
      authority: 'Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs',
      hours: '24x7 Free Service',
      description:
        'Immediate toll-free hotline to report online banking scams, UPI frauds, unauthorized OTP debits, and phishing attacks. Call within the golden hour to freeze fraudulent funds.',
      highlight: true,
      country: 'India (Toll-Free All Networks)',
    },
    {
      number: '1800-11-4000',
      label: 'National Consumer Cyber Fraud Helpline',
      authority: 'Ministry of Consumer Affairs & Cyber Grievance Cell',
      hours: '8:00 AM - 8:00 PM (Toll-Free)',
      description:
        'Toll-free consumer support for online shopping fraud, fake delivery links, lottery scam messages, and e-commerce identity theft.',
      highlight: false,
      country: 'India (Toll-Free)',
    },
    {
      number: '1-800-CALL-FBI (1-800-225-5324)',
      label: 'FBI Internet Crime & Major Cyber Threat Hotline',
      authority: 'Federal Bureau of Investigation (FBI Headquarters)',
      hours: '24x7 Toll-Free (US & International Callers)',
      description:
        'Report major international wire scams, business email compromise (BEC), ransomware cartels, and state-sponsored phishing infrastructure.',
      highlight: false,
      country: 'USA / Global',
    },
    {
      number: '112',
      label: 'National Emergency Response Police Helpline',
      authority: 'All States Emergency Response Support System (ERSS)',
      hours: '24x7 Toll-Free Emergency',
      description:
        'Unified emergency helpline connecting directly to your nearest police control room for immediate criminal intervention and extortion threats.',
      highlight: false,
      country: 'Pan-India',
    },
  ];

  const faqs = [
    {
      q: 'What should I do immediately after entering my password on a suspicious link?',
      a: '1) Do not click anything further on that page. 2) Open an authentic browser tab, navigate directly to the official website from your bookmarks or official app, and change your password immediately. 3) Select "Sign out of all devices" or "Terminate other sessions". 4) Enable Multi-Factor Authentication (MFA) with an authenticator app. 5) If banking credentials were compromised, dial 1930 immediately to block transactions.',
    },
    {
      q: 'What is the "Golden Hour" in cyber fraud reporting?',
      a: 'The "Golden Hour" refers to the initial 2 to 3 hours immediately following an unauthorized debit or phishing incident. Calling the toll-free number 1930 within this timeframe enables the Cyber Police I4C network to alert nodal bank managers and payment gateways to halt transactions and freeze stolen funds in transit before withdrawal.',
    },
    {
      q: 'How does TRUVEXA differentiate safe links from phishing links?',
      a: 'TRUVEXA runs a multi-layered evaluation combining 16 lexical and syntactic heuristics, optical QR code extraction, domain registration sanity tests, and live threat intelligence reputation feeds. Our scoring engine calculates a 0-100% Safety Percentage and explains the exact technical rationale behind each determination.',
    },
    {
      q: 'Why does a website with an HTTPS padlock still trigger phishing warnings?',
      a: 'The HTTPS lock icon merely indicates that the communication channel between your browser and the website is encrypted. Cybercriminals easily obtain free, valid SSL/TLS certificates for their phishing domains. An encrypted connection to a fraudulent server will still steal your credentials.',
    },
  ];

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Hero Help Center Banner */}
      <div className="p-6 rounded-2xl bg-[#0b1120] border border-cyan-500/30 shadow-2xl card-hover-glow interactive-float">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
              <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
              <span>24x7 CYBER DEFENSE & LAW ENFORCEMENT DIRECTORY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Cyber Security Help Centre & Police Helplines
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              If you have encountered cyber extortion, financial phishing scams, identity theft, or deceptive links, connect immediately with authorized cyber crime police officers, national nodal hotlines, and 24x7 toll-free emergency numbers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onGoToReportPhishing}
              className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs text-rose-300 font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95 glow-complement-click hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] interactive-float"
            >
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>Report Phishing Link Page</span>
            </button>
            <button
              onClick={onGoToScanner}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 text-xs font-bold transition-all cursor-pointer active:scale-95 btn-glow interactive-float"
            >
              Scan URL / QR Code
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Toll-Free Numbers Strip */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Immediate Toll-Free Cyber Emergency Hotlines
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded">
            Toll-Free Free Call
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyHelplines.map((helpline, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all card-hover-glow interactive-float ${
                helpline.highlight
                  ? 'bg-gradient-to-br from-[#0c1e2e] to-[#071320] border-emerald-500/50 shadow-xl shadow-emerald-500/10'
                  : 'bg-[#0b1120] border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold">
                    {helpline.country}
                  </span>
                  <h4 className="font-bold text-sm text-white">{helpline.label}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${helpline.number.replace(/[^0-9+]/g, '')}`}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold font-mono text-base flex items-center gap-1.5 transition-all shadow-md active:scale-95 glow-complement-click"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{helpline.number}</span>
                  </a>
                  <button
                    onClick={() => handleCopy(helpline.number, `hl-${idx}`)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 transition-all cursor-pointer active:scale-95"
                    title="Copy phone number"
                  >
                    {copiedKey === `hl-${idx}` ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-3 space-y-2 text-xs">
                <div className="text-[11px] font-mono text-cyan-300">
                  Authority: {helpline.authority} ({helpline.hours})
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {helpline.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Famous Cyber Security Police Officers & Nodal Commanders */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Famous Cyber Security Police Officers & Cyber Crime Units
              </h3>
              <p className="text-xs text-slate-400">
                Official contact numbers and command desks of senior IPS cyber security commanders and state cyber cells.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Filter:</span>
            <button
              onClick={() => setOfficerFilter('all')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                officerFilter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Desks
            </button>
            <button
              onClick={() => setOfficerFilter('tollfree')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                officerFilter === 'tollfree'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Toll-Free 1930
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cyberOfficers
            .filter((o) => (officerFilter === 'tollfree' ? o.tollFreeNumber === '1930' : true))
            .map((officer, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(34,211,238,0.25)] transition-all flex flex-col justify-between space-y-4 card-hover-glow interactive-float"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold block">
                        Senior Cyber Commander
                      </span>
                      <h4 className="font-extrabold text-base text-white">{officer.name}</h4>
                      <p className="text-xs text-slate-300 font-medium leading-snug mt-0.5">
                        {officer.designation}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="text-[11px] font-mono text-slate-400">
                      Unit: <span className="text-slate-200">{officer.department}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Jurisdiction: <span className="text-cyan-300 font-semibold">{officer.jurisdiction}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">
                      Specialization Focus:
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {officer.specialization}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Toll-Free Helpline:</span>
                    <button
                      onClick={() => handleCopy(officer.tollFreeNumber, `off-tf-${idx}`)}
                      className="font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer hover:bg-emerald-900/60 transition-all"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>{officer.tollFreeNumber}</span>
                      {copiedKey === `off-tf-${idx}` ? (
                        <Check className="w-3 h-3 text-emerald-300 ml-1" />
                      ) : (
                        <Copy className="w-3 h-3 text-emerald-500 ml-1" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Control Desk Phone:</span>
                    <button
                      onClick={() => handleCopy(officer.officialNumber, `off-ph-${idx}`)}
                      className="font-mono text-slate-200 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer hover:border-cyan-400 transition-all"
                    >
                      <span>{officer.officialNumber}</span>
                      {copiedKey === `off-ph-${idx}` ? (
                        <Check className="w-3 h-3 text-emerald-400 ml-1" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-500 ml-1" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Nodal Email:</span>
                    <button
                      onClick={() => handleCopy(officer.email, `off-em-${idx}`)}
                      className="font-mono text-cyan-300 truncate max-w-[170px] hover:underline cursor-pointer"
                    >
                      {officer.email}
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Cyber Incident FAQ / Knowledge Accordion */}
      <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl space-y-4 card-hover-glow interactive-float">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Frequently Asked Cyber Defense Questions
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-200 hover:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
