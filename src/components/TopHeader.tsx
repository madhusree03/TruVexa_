import React from 'react';
import { Menu, User, UserCheck } from 'lucide-react';
import { NavTab } from './Navbar.tsx';
import { AuthUser } from './LoginView.tsx';

interface TopHeaderProps {
  activeTab: NavTab;
  onOpenMobileMenu: () => void;
  currentUser: AuthUser | null;
  onGoToLogin: () => void;
  safeBrowsingOnline?: boolean;
  geminiOnline?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  currentUser,
  onGoToLogin,
  safeBrowsingOnline,
  geminiOnline,
}) => {
  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'scanner':
        return 'URL & QR Code Scanner';
      case 'report_meter':
        return 'Safety Meter & Threat Rationale';
      case 'report_phishing':
        return 'Where to Report Phishing';
      case 'help_center':
        return 'Cyber Helpline & Emergency Numbers';
      case 'dashboard':
        return 'Central Security Board & Metrics';
      case 'history':
        return 'Scan History & Threat Logs';
      case 'education':
        return 'Cybersecurity Education Center';
      case 'about':
        return 'About TruVexa Link Defense';
      case 'login':
        return 'User Account & Profile';
      default:
        return 'Dashboard Overview';
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile menu button & optional view path (No TruVexa title) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-cyan-400 transition-all cursor-pointer"
          aria-label="Open left dashboard menu"
        >
          <Menu className="w-5 h-5 text-cyan-400" />
        </button>

        {activeTab !== 'scanner' && (
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-semibold">{getTabTitle(activeTab)}</span>
          </div>
        )}
      </div>

      {/* Right: Security Status Badges & User Button */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Threat Engine Online
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            SafeBrowsing Active
          </span>
        </div>

        <button
          type="button"
          onClick={onGoToLogin}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 glow-complement-click hover-move ${
            currentUser
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400'
          }`}
        >
          {currentUser ? (
            <>
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-emerald-200">{currentUser.name}</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">User Login</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
