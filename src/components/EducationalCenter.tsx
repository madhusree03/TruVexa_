import React, { useState } from 'react';
import {
  BookOpen,
  Lock,
  Globe,
  AlertTriangle,
  FileCode,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  LifeBuoy,
  Layers,
  Sparkles,
} from 'lucide-react';

export const EducationalCenter: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'basics' | 'homoglyphs' | 'deception' | 'incident'>('basics');

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Header with gentle floating motion */}
      <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl card-hover-glow interactive-float animate-education-drift">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-mono mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>CYBERSECURITY KNOWLEDGE BASE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Educational Security Center
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
          Learn how threat actors design deceptive URLs, bypass traditional mental models, and how to verify authenticity before entering sensitive credentials.
        </p>
      </div>

      {/* Segmented Controls for Sub-topics */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSection('basics')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer glow-complement-click interactive-float ${
            activeSection === 'basics'
              ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          1. Phishing & Quishing Fundamentals
        </button>
        <button
          onClick={() => setActiveSection('deception')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer glow-complement-click interactive-float ${
            activeSection === 'deception'
              ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          2. URL Deception & Attack Vectors
        </button>
        <button
          onClick={() => setActiveSection('homoglyphs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer glow-complement-click interactive-float ${
            activeSection === 'homoglyphs'
              ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          3. Homoglyphs & Lookalike Domains
        </button>
        <button
          onClick={() => setActiveSection('incident')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer glow-complement-click interactive-float ${
            activeSection === 'incident'
              ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          4. Incident Response Checklist
        </button>
      </div>

      {/* Content Section 1: Basics */}
      {activeSection === 'basics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-3 card-hover-glow interactive-float">
            <div className="flex items-center gap-2 text-cyan-400">
              <Lock className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">The Misconception of the HTTPS Lock Icon</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Many users mistakenly believe that a padlock icon in their browser means the website is safe or authentic. In reality, HTTPS simply encrypts traffic between your browser and the remote server.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Today, over 80% of malicious phishing websites use valid, free Let&apos;s Encrypt or Cloudflare TLS certificates. A secure connection to a cybercriminal&apos;s server is still a connection to a cybercriminal.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-3 card-hover-glow interactive-float">
            <div className="flex items-center gap-2 text-purple-400">
              <Globe className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Quishing (QR Code Phishing) Attacks</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              QR codes (Quick Response) are optical barcodes that encode web links. Attackers place malicious stickers over legitimate QR codes on parking meters, restaurant tables, or in phishing emails disguised as Multi-Factor Authentication prompts.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Always use TRUVEXA&apos;s optical QR scanner to decode the embedded destination URL and calculate its safety percentage before opening it on your mobile device.
            </p>
          </div>
        </div>
      )}

      {/* Content Section 2: Deception Vectors */}
      {activeSection === 'deception' && (
        <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-4 card-hover-glow interactive-float animate-fadeIn">
          <h3 className="text-base font-bold text-white">How Threat Actors Manipulate URL Structure</h3>
          <div className="p-4 rounded-xl bg-slate-900 font-mono text-xs sm:text-sm text-cyan-300 border border-slate-800 overflow-x-auto">
            https://<span className="text-amber-400">paypal.com</span>.<span className="text-rose-400">verify-identity.xyz</span>/update
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            In the deceptive URL above, &ldquo;paypal.com&rdquo; is merely a subdomain prefix, not the actual destination. The true host is &ldquo;verify-identity.xyz&rdquo;. Browsers determine destination by reading backwards from the first forward slash: the right-most domain and top-level extension dictate who controls the website.
          </p>
        </div>
      )}

      {/* Content Section 3: Homoglyphs */}
      {activeSection === 'homoglyphs' && (
        <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-4 card-hover-glow interactive-float animate-fadeIn">
          <h3 className="text-base font-bold text-white">Homoglyphs & IDN Homograph Attacks</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Internationalized Domain Names (IDN) permit non-Latin scripts. Attackers substitute Cyrillic or Greek characters that look virtually indistinguishable from Latin characters (e.g. Cyrillic &ldquo;а&rdquo; vs Latin &ldquo;a&rdquo;).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-mono text-emerald-400">Genuine Domain:</span>
              <div className="text-base font-mono text-white font-bold mt-1">apple.com</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-rose-800/60">
              <span className="text-xs font-mono text-rose-400">Spoofed Cyrillic Lookalike:</span>
              <div className="text-base font-mono text-rose-300 font-bold mt-1">xn--pple-43d.com</div>
            </div>
          </div>
        </div>
      )}

      {/* Content Section 4: Incident Response */}
      {activeSection === 'incident' && (
        <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-4 card-hover-glow interactive-float animate-fadeIn">
          <h3 className="text-base font-bold text-white">What To Do If You Clicked a Suspicious Link</h3>
          <ol className="space-y-3 text-xs sm:text-sm text-slate-300 list-decimal pl-5">
            <li><strong>Disconnect immediately:</strong> Close the browser tab and disconnect your device from the internet if a file began downloading.</li>
            <li><strong>Reset account credentials:</strong> If you entered a password, go directly to the official provider from a separate trusted device and change your password.</li>
            <li><strong>Revoke active sessions:</strong> In your security settings, click &ldquo;Sign out of all other sessions&rdquo;.</li>
            <li><strong>Scan for malware:</strong> Run a full system antivirus scan if any executable or archive was downloaded.</li>
          </ol>
        </div>
      )}
    </section>
  );
};
