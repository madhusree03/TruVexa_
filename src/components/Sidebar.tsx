import React from 'react';
import {
  Search,
  ShieldAlert,
  PhoneCall,
  BookOpen,
  Info,
  Activity,
  History,
  Gauge,
  User,
  UserCheck,
  ChevronRight,
  LogOut,
  Shield,
  X,
} from 'lucide-react';
import { NavTab } from './Navbar.tsx';
import { AuthUser } from './LoginView.tsx';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser: AuthUser | null;
  onLogout?: () => void;
  hasCurrentReport?: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  onLogout,
  hasCurrentReport,
  isOpenMobile,
  onCloseMobile,
}) => {
  /*
    USER REQUIREMENT:
    - about as a last tab in the dashboard then helpline
    - line from the dashboard should be complement
    - when placing cursor on tabs, it should glow a little bit brighter with a complement colour excluding green on tab title
    - increase title size of TruVexa
  */
  const navItems: {
    id: NavTab;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    color: string;
    badge?: string;
  }[] = [
    {
      id: 'scanner',
      label: 'URL Scanner',
      sublabel: 'URL & QR code analyzer',
      icon: <Search className="w-4 h-4" />,
      color: 'from-cyan-400 to-blue-500',
    },
    ...(hasCurrentReport
      ? [
          {
            id: 'report_meter' as NavTab,
            label: 'Meter & Rationale',
            sublabel: 'Safety score & next steps',
            icon: <Gauge className="w-4 h-4" />,
            color: 'from-cyan-400 to-purple-500',
            badge: 'Report',
          },
        ]
      : []),
    {
      id: 'report_phishing',
      label: 'Where to Report Phishing',
      sublabel: 'Official cyber crime portals',
      icon: <ShieldAlert className="w-4 h-4" />,
      color: 'from-rose-400 to-red-500',
      badge: 'Report',
    },
    {
      id: 'education',
      label: 'Education Center',
      sublabel: 'Phishing guides & safety tips',
      icon: <BookOpen className="w-4 h-4" />,
      color: 'from-indigo-400 to-blue-500',
    },
    {
      id: 'dashboard',
      label: 'Security Board',
      sublabel: 'Live telemetry & threat intelligence',
      icon: <Activity className="w-4 h-4" />,
      color: 'from-purple-400 to-pink-500',
      badge: 'Live',
    },
    {
      id: 'history',
      label: 'Scan History',
      sublabel: 'Audit log & past detections',
      icon: <History className="w-4 h-4" />,
      color: 'from-amber-400 to-orange-500',
    },
    {
      id: 'help_center',
      label: 'Helpline',
      sublabel: 'Police officers & toll-free 1930',
      icon: <PhoneCall className="w-4 h-4" />,
      color: 'from-amber-400 via-orange-500 to-rose-500',
      badge: '1930 Toll-Free',
    },
    {
      id: 'about',
      label: 'About',
      sublabel: 'Engine specs & security design',
      icon: <Info className="w-4 h-4" />,
      color: 'from-cyan-400 via-blue-400 to-purple-400',
    },
  ];

  const handleSelectTab = (tab: NavTab) => {
    onTabChange(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-[#090e1a]/95 text-slate-100 select-none">
      {/* Top Branding Section: TruVexa as Title with Increased Size (No glow) */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleSelectTab('scanner')}
            className="w-full text-left flex items-center gap-3.5 group cursor-pointer active:scale-95 truvexa-title-clean"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md transition-all shrink-0">
              <Shield className="w-6 h-6 text-cyan-100" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-white flex items-center">
                  Tru<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">Vexa</span>
                </h1>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-800/60">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate tracking-wide">
                Cyber Defense & Link Safety
              </p>
            </div>
          </button>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Dashboard Tag Header */}
        <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="text-cyan-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Dashboard Navigation
          </span>
          <span className="text-slate-500 text-[10px]">v2.6 Live</span>
        </div>
      </div>

      {/* Main Dashboard Navigation Links List */}
      <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5 scrollbar-thin" aria-label="Dashboard navigation">
        <div className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          Dashboard Modules
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectTab(item.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer group active:scale-95 glow-complement-click hover-move sidebar-tab-button ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 via-blue-600/15 to-purple-600/10 border border-cyan-400 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.7)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-cyan-400/70 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.5)]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    isActive
                      ? `bg-gradient-to-tr ${item.color} text-slate-950 font-bold shadow-sm`
                      : 'bg-slate-800/90 text-slate-300 group-hover:text-cyan-200 group-hover:bg-slate-700/90'
                  }`}
                >
                  {item.icon}
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold truncate block transition-all ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-200 group-hover:text-cyan-100'
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full shrink-0 transition-all ${
                          isActive
                            ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/60'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 group-hover:border-cyan-500/50 group-hover:text-cyan-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 truncate block font-mono group-hover:text-slate-300">
                    {item.sublabel}
                  </span>
                </div>
              </div>

              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive
                    ? 'text-cyan-400 translate-x-0.5'
                    : 'text-slate-600 group-hover:text-cyan-300 group-hover:translate-x-0.5'
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* User Session Footer at bottom of Sidebar */}
      <div className="p-4 border-t border-slate-800/80 bg-[#070b14]/80">
        {currentUser ? (
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => handleSelectTab('login')}
              className="flex items-center gap-2.5 min-w-0 text-left flex-1 cursor-pointer group hover-move"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-emerald-300 truncate font-mono">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate font-mono">
                  {currentUser.role === 'admin' ? 'Security Admin' : 'Security Analyst'}
                </div>
              </div>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Log out"
                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 flex items-center justify-center shrink-0 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => handleSelectTab('login')}
            className="w-full py-2.5 px-3 rounded-xl bg-cyan-950/60 border border-cyan-800/60 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 glow-complement-click hover-move"
          >
            <User className="w-4 h-4 text-cyan-400" />
            <span>Login to TruVexa</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left-Side Dashboard Sidebar with Complementary Line */}
      <aside
        className="hidden md:flex w-72 lg:w-80 shrink-0 border-r border-slate-800 bg-[#070b14]/95 flex-col h-screen sticky top-0 z-40 relative"
        aria-label="Desktop Dashboard Navigation"
      >
        {/* COMPLEMENTARY NEON LINE FROM THE DASHBOARD - GLOWS LIKE A PIECE OF LINE */}
        <div className="absolute top-0 right-0 bottom-0 w-[1.5px] bg-gradient-to-b from-cyan-400 via-blue-500 via-purple-500 to-pink-500 shadow-[0_0_2px_rgba(34,211,238,0.8),0_0_1px_rgba(236,72,153,0.8)] pointer-events-none z-50" />
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay with Complementary Line */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 transition-opacity"
            onClick={onCloseMobile}
          />
          <aside
            className="relative w-80 max-w-[85vw] h-full z-10 shadow-xl flex flex-col border-r border-slate-800 bg-[#070b14] animate-fadeIn"
            aria-label="Mobile Dashboard Navigation"
          >
            {/* COMPLEMENTARY NEON LINE FROM THE DASHBOARD - GLOWS LIKE A PIECE OF LINE */}
            <div className="absolute top-0 right-0 bottom-0 w-[1.5px] bg-gradient-to-b from-cyan-400 via-blue-500 via-purple-500 to-pink-500 shadow-[0_0_2px_rgba(34,211,238,0.8),0_0_1px_rgba(236,72,153,0.8)] pointer-events-none z-50" />
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
