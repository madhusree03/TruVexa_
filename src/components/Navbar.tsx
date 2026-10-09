import React, { useState } from 'react';
import {
  Shield,
  Menu,
  X,
  UserCheck,
  Sparkles,
  User,
  Search,
  Activity,
  History,
  BookOpen,
  Info,
  ShieldAlert,
  PhoneCall,
  Gauge,
} from 'lucide-react';
import { AuthUser } from './LoginView.tsx';

export type NavTab =
  | 'scanner'
  | 'report_meter'
  | 'report_phishing'
  | 'help_center'
  | 'dashboard'
  | 'history'
  | 'education'
  | 'about'
  | 'login';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  safeBrowsingOnline: boolean;
  geminiOnline: boolean;
  currentUser: AuthUser | null;
  hasCurrentReport?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  hasCurrentReport,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Main navigation tabs based on user requests
  const navLinks: { id: NavTab; label: string; icon?: React.ReactNode; badge?: string }[] = [
    { id: 'scanner', label: 'URL & QR Scanner', icon: <Search className="w-3.5 h-3.5" /> },
    ...(hasCurrentReport
      ? [
          {
            id: 'report_meter' as NavTab,
            label: 'Meter & Rationale View',
            icon: <Gauge className="w-3.5 h-3.5 text-cyan-400" />,
            badge: 'Active Result',
          },
        ]
      : []),
    {
      id: 'report_phishing',
      label: 'Where to Report Phishing',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
    },
    { id: 'education', label: 'Education Center', icon: <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> },
    { id: 'dashboard', label: 'Security Board', icon: <Activity className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'history', label: 'Scan History', icon: <History className="w-3.5 h-3.5 text-cyan-400" /> },
    {
      id: 'help_center',
      label: 'Help Centre & Police Helplines',
      icon: <PhoneCall className="w-3.5 h-3.5 text-amber-400" />,
      badge: '1930 Free',
    },
    { id: 'about', label: 'About', icon: <Info className="w-3.5 h-3.5 text-blue-400" /> },
  ];

  const handleNavClick = (tab: NavTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Brand Logo & Name */}
          <button
            onClick={() => handleNavClick('scanner')}
            className="flex items-center gap-2.5 text-left text-white hover:opacity-95 transition-all whitespace-nowrap shrink-0 cursor-pointer group active:scale-95 glow-complement-click interactive-float"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 group-hover:shadow-[0_0_25px_rgba(34,211,238,0.7)] group-active:shadow-[0_0_35px_rgba(236,72,153,0.8)] transition-all">
              <Shield className="w-5 h-5 text-cyan-100" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                TRU<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">VEXA</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase font-mono">
                Link Safety & Threat Defense
              </span>
            </div>
          </button>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-3 text-xs font-medium">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative py-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 px-3 rounded-lg hover:bg-slate-900/80 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] active:scale-95 glow-complement-click interactive-float ${
                    isActive
                      ? 'text-cyan-400 font-semibold bg-cyan-950/40 border border-cyan-800/50 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-900/80 text-cyan-300 border border-cyan-700/60">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Login Profile Button */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleNavClick('login')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 glow-complement-click interactive-float ${
                currentUser
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : activeTab === 'login'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]'
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
                  <span>User Login</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="xl:hidden flex items-center gap-2">
            <button
              onClick={() => handleNavClick('login')}
              className="sm:hidden px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-300"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-slate-800 space-y-1">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
                    isActive
                      ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/60'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {link.icon}
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
