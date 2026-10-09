import React from 'react';
import { Shield, Award, CheckCircle2, QrCode, Lock, Sparkles, Layers } from 'lucide-react';

interface AboutViewProps {
  safeBrowsingOnline: boolean;
  geminiOnline: boolean;
  onGoToScanner: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onGoToScanner,
}) => {
  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Hero Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-3 card-hover-glow interactive-float">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-mono">
          <Award className="w-3.5 h-3.5 text-cyan-400" />
          <span>CYBERSECURITY LINK SAFETY & THREAT VERIFICATION</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          About TRUVEXA
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          TRUVEXA is an advanced link defense platform engineered to safeguard users against credential harvesting, phishing, lookalike homoglyphs, and quishing (QR code deception). It delivers instant safety percentage calculations, in-depth behavioral explanations, and clear defensive action steps.
        </p>
      </div>

      {/* Feature Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-[#0b1120] border border-slate-800 space-y-3 card-hover-glow interactive-float">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Precise Safety Percentage</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Evaluates 16 structural heuristics and threat intelligence feeds to compute the exact percentage a link is safe to visit.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0b1120] border border-slate-800 space-y-3 card-hover-glow interactive-float">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Unified URL & QR Scanner</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Scan web URLs and decode QR codes via webcam or image upload in a single, convenient page.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#0b1120] border border-slate-800 space-y-3 card-hover-glow interactive-float">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Reason & Next Steps</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Never leaves you guessing. Every analysis explains why the score occurred and provides concrete next steps to stay safe.
          </p>
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={onGoToScanner}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/30 hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] active:scale-95 transition cursor-pointer btn-glow glow-complement-click interactive-float"
        >
          Launch URL & QR Scanner
        </button>
      </div>
    </section>
  );
};
