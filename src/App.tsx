import React, { useState, useEffect, useRef } from 'react';
import { NavTab } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { TopHeader } from './components/TopHeader.tsx';
import { HeroScanner } from './components/HeroScanner.tsx';
import { ReportView } from './components/ReportView.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { EducationalCenter } from './components/EducationalCenter.tsx';
import { AboutView } from './components/AboutView.tsx';
import { LoginView, AuthUser } from './components/LoginView.tsx';
import { ReportPhishingView } from './components/ReportPhishingView.tsx';
import { HelpCenterView } from './components/HelpCenterView.tsx';
import { ScanReport, ScanStats } from './types/index.ts';

const LOCAL_STORAGE_KEY = 'truvexa_local_scans_v1';
const AUTH_STORAGE_KEY = 'truvexa_auth_user_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('scanner');
  const [currentReport, setCurrentReport] = useState<ScanReport | null>(null);
  const [history, setHistory] = useState<ScanReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // System capability states
  const [safeBrowsingOnline, setSafeBrowsingOnline] = useState(false);
  const [geminiOnline, setGeminiOnline] = useState(false);

  // Save auth user to localStorage on change
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Auth cache error:', e);
    }
  }, [currentUser]);

  // Load initial status and history
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setSafeBrowsingOnline(Boolean(data.safeBrowsingConfigured));
        setGeminiOnline(Boolean(data.geminiConfigured));
      })
      .catch((err) => {
        console.warn('Could not query /api/status:', err);
      });

    fetch('/api/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.history && Array.isArray(data.history) && data.history.length > 0) {
          setHistory(data.history);
        } else {
          const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed)) {
                setHistory(parsed);
              }
            } catch (e) {
              console.error('Failed to parse cached history:', e);
            }
          }
        }
      })
      .catch((err) => {
        console.warn('History fetch fallback:', err);
      });
  }, []);

  // Save history to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [history]);

  // Handle URL analysis execution
  // USER REQUIREMENT: "after analyzing the url it should switch to a new page showing meter view mode and its details and also reason behind the result and what should we do next"
  const handleAnalyzeUrl = async (targetUrl: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to inspect link. Please ensure it is a valid HTTP or HTTPS URL.');
        setIsLoading(false);
        return;
      }

      const report: ScanReport = data.report;
      setCurrentReport(report);
      setHistory((prev) => [report, ...prev.filter((item) => item.id !== report.id)]);

      // Switch to the dedicated new page showing meter view mode, its details, reason behind the result, and what to do next!
      setActiveTab('report_meter');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      console.error('Scan error:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Network error communicating with TRUVEXA analysis engine.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' });
    } catch (err) {
      console.warn('Server history clear warning:', err);
    }
    setHistory([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  // Compute stats for Security Board
  const stats: ScanStats = {
    totalScans: history.length,
    lowRiskCount: history.filter((s) => s.riskLevel === 'low').length,
    mediumRiskCount: history.filter((s) => s.riskLevel === 'medium').length,
    highRiskCount: history.filter((s) => s.riskLevel === 'high').length,
    criticalRiskCount: history.filter((s) => s.riskLevel === 'critical').length,
    threatIntelDetections: history.filter((s) => s.threatIntel.status === 'threat_found').length,
  };

  // If user is not logged in: display the Login Page FIRST
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <header className="border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md py-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
              <span className="font-extrabold text-lg text-white">T</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
              Tru<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">Vexa</span>
            </span>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 rounded-full">
            Security Gateway
          </span>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <LoginView
            currentUser={null}
            isInitialGate={true}
            onLogin={(user) => {
              setCurrentUser(user);
              setActiveTab('scanner');
            }}
            onLogout={() => setCurrentUser(null)}
            onGoToScanner={() => setActiveTab('scanner')}
          />
        </main>

        <footer className="border-t border-slate-900 bg-[#05080f] py-4 text-xs text-slate-500 font-mono text-center">
          TruVexa · AI Link Safety & Threat Defense Platform
        </footer>
      </div>
    );
  }

  // Once authenticated: Render the full application with Left-Side Dashboard Sidebar
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 
        USER REQUIREMENT:
        "keep the url scanner ,where to report phishing,helpline,education center,about,security board,scan history all as a dash board in the left side of the web page and keep TruVexa as a title"
      */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        hasCurrentReport={Boolean(currentReport)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (Right side) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header with title and mobile menu toggle */}
        <TopHeader
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          currentUser={currentUser}
          onGoToLogin={() => {
            setActiveTab('login');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          safeBrowsingOnline={safeBrowsingOnline}
          geminiOnline={geminiOnline}
        />

        {/* Main View Container */}
        <main className="flex-1 pb-8">
        {/* Unified URL & QR Scanner View */}
        {activeTab === 'scanner' && (
          <HeroScanner
            onAnalyze={handleAnalyzeUrl}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage(null)}
            onGoToDashboard={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* 
          USER REQUIREMENT:
          "after analyzing the url it should switch to a new page showing meter view mode and its details and also reason behind the result and what should we do next"
        */}
        {activeTab === 'report_meter' && (
          <div>
            {currentReport ? (
              <ReportView
                report={currentReport}
                onScanAnother={() => {
                  setActiveTab('scanner');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onGoToReportPhishing={() => {
                  setActiveTab('report_phishing');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onGoToHelpCenter={() => {
                  setActiveTab('help_center');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ) : (
              <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-4">
                <div className="p-8 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-4">
                  <h3 className="text-xl font-bold text-white">No Active Analysis Report</h3>
                  <p className="text-sm text-slate-400">
                    Scan a URL or QR code first to view the interactive meter view mode, threat details, and actionable safety next steps.
                  </p>
                  <button
                    onClick={() => setActiveTab('scanner')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Go to URL & QR Scanner
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 
          USER REQUIREMENT:
          "make where to report phishing as another page"
        */}
        {activeTab === 'report_phishing' && (
          <ReportPhishingView
            currentReport={currentReport}
            onGoToScanner={() => {
              setActiveTab('scanner');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToHelpCenter={() => {
              setActiveTab('help_center');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* 
          USER REQUIREMENT:
          "create a help centre and add some famous cyber security police officers numbers and add toll free number"
        */}
        {activeTab === 'help_center' && (
          <HelpCenterView
            onGoToReportPhishing={() => {
              setActiveTab('report_phishing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToScanner={() => {
              setActiveTab('scanner');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Security Board */}
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            recentScans={history}
            onSelectScan={(report) => {
              setCurrentReport(report);
              setActiveTab('report_meter');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToScanner={() => {
              setActiveTab('scanner');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRefresh={() => {
              fetch('/api/history')
                .then((r) => r.json())
                .then((data) => {
                  if (data.history) setHistory(data.history);
                });
            }}
            onGoToHelpCenter={() => {
              setActiveTab('help_center');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToReportPhishing={() => {
              setActiveTab('report_phishing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Scan History Log */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onSelectScan={(report) => {
              setCurrentReport(report);
              setActiveTab('report_meter');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onClearHistory={handleClearHistory}
            onGoToScanner={() => {
              setActiveTab('scanner');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Educational Center */}
        {activeTab === 'education' && <EducationalCenter />}

        {/* About View */}
        {activeTab === 'about' && (
          <AboutView
            safeBrowsingOnline={safeBrowsingOnline}
            geminiOnline={geminiOnline}
            onGoToScanner={() => {
              setActiveTab('scanner');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* User Login Profile Tab */}
        {activeTab === 'login' && (
          <LoginView
            currentUser={currentUser}
            onLogin={(user) => {
              setCurrentUser(user);
              setActiveTab('scanner');
            }}
            onLogout={() => {
              setCurrentUser(null);
            }}
            onGoToScanner={() => {
              setActiveTab('scanner');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#05080f] py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-extrabold tracking-tight text-sm">TruVexa</span>
            <span>·</span>
            <span>Link Safety & Threat Defense System</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => {
                setActiveTab('report_phishing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-rose-400 transition-colors cursor-pointer"
            >
              Where to Report Phishing
            </button>
            <span>·</span>
            <button
              onClick={() => {
                setActiveTab('help_center');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Help Centre & Toll-Free 1930
            </button>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
