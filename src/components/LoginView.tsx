import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  Fingerprint,
  UserCheck,
  LogOut,
  Sparkles,
  ArrowRight,
  AlertCircle,
  User,
} from 'lucide-react';

export interface AuthUser {
  email: string;
  name: string;
  role: string;
  clearanceLevel: string;
  token: string;
  loginTime: string;
}

interface LoginViewProps {
  currentUser: AuthUser | null;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
  onGoToScanner: () => void;
  isInitialGate?: boolean; // When rendered as the first-page gate before entering the platform
}

export const LoginView: React.FC<LoginViewProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onGoToScanner,
  isInitialGate = false,
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('analyst@truvexa.sec');
  const [password, setPassword] = useState('CyberGuard#2026');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'Tier-1 Triage' | 'Tier-2 SOC Analyst' | 'SecOps Forensics Lead'>('Tier-2 SOC Analyst');
  const [rememberMe, setRememberMe] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStepMessage, setAuthStepMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim()) {
      setErrorMessage('Please enter a username or security email.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your security password.');
      return;
    }
    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }

    setErrorMessage(null);
    setIsAuthenticating(true);
    setAuthStepMessage('Verifying credentials with TRUVEXA Security Gateway...');

    // Realistic cryptographic login animation sequence
    setTimeout(() => {
      setAuthStepMessage('Validating access token & analyst permissions...');
      setTimeout(() => {
        setAuthStepMessage('Establishing TLS 1.3 encrypted analyst session...');
        setTimeout(() => {
          setIsAuthenticating(false);
          setAuthStepMessage(null);

          const rawInput = usernameOrEmail.trim();
          const namePart = rawInput.includes('@') ? rawInput.split('@')[0] : rawInput;
          const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

          onLogin({
            email: rawInput.includes('@') ? rawInput : `${rawInput.toLowerCase()}@truvexa.sec`,
            name: formattedName.includes('.') ? formattedName.replace('.', ' ') : formattedName,
            role,
            clearanceLevel:
              role === 'SecOps Forensics Lead'
                ? 'Level 4 (Top Secret)'
                : role === 'Tier-2 SOC Analyst'
                ? 'Level 3 (Secret)'
                : 'Level 2 (Restricted)',
            token: `trvx-jwt-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`,
            loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        }, 550);
      }, 550);
    }, 600);
  };

  const handleDemoFill = (demoRole: 'Tier-2 SOC Analyst' | 'SecOps Forensics Lead') => {
    if (demoRole === 'Tier-2 SOC Analyst') {
      setUsernameOrEmail('analyst.chen@truvexa.sec');
      setPassword('CyberGuard#2026');
      setRole('Tier-2 SOC Analyst');
    } else {
      setUsernameOrEmail('lead.marquez@truvexa.sec');
      setPassword('ThreatIntel#Lead2026');
      setRole('SecOps Forensics Lead');
    }
    setErrorMessage(null);
  };

  // If already logged in and NOT an initial barrier, show profile view
  if (currentUser && !isInitialGate) {
    return (
      <section className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
        <div className="p-8 rounded-2xl bg-[#0b1120] border border-cyan-500/40 shadow-2xl relative overflow-hidden card-hover-glow interactive-float">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                <UserCheck className="w-8 h-8 text-white" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Authenticated Session Active</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{currentUser.name}</h2>
                <p className="text-xs font-mono text-slate-400">{currentUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onGoToScanner}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] active:scale-95 transition cursor-pointer btn-glow"
              >
                Launch URL & QR Scanner
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500/60 hover:text-rose-300 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 glow-complement-click"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800/80 pt-6">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 interactive-float">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Assigned Role</span>
              <div className="text-sm font-bold text-cyan-300 mt-1">{currentUser.role}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 interactive-float">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Security Clearance</span>
              <div className="text-sm font-bold text-emerald-400 mt-1">{currentUser.clearanceLevel}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 interactive-float">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Session Token</span>
              <div className="text-xs font-mono text-purple-300 truncate mt-1">{currentUser.token}</div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs space-y-2">
            <div className="font-bold text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Full Access to TRUVEXA Threat Intelligence Suite</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              You have full clearance to scan links, verify QR quishing codes, explore the dynamic live dashboard, audit telemetry logs, and consult defensive security playbooks.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Login Portal View (Gatekeeper or standalone login page)
  return (
    <section className="py-12 max-w-xl mx-auto px-4 sm:px-6 space-y-8 animate-fadeIn">
      <div className="p-8 sm:p-10 rounded-3xl bg-[#0b1120] border border-slate-800 shadow-2xl relative overflow-hidden card-hover-glow interactive-float">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Card Header */}
        <div className="text-center space-y-3 relative z-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30 interactive-float">
            <ShieldCheck className="w-9 h-9 text-cyan-100" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span>TRUVEXA SECURITY GATEWAY</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            User Sign In
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Please sign in with your user name and password to access the TRUVEXA link scanner, QR scanner, and security board.
          </p>
        </div>

        {/* Demo One-Click Fill */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Quick Fill Demo Credentials:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('Tier-2 SOC Analyst')}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-cyan-500/30 hover:border-cyan-400 text-left transition cursor-pointer active:scale-95 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] glow-complement-click interactive-float"
            >
              <div className="text-xs font-bold text-cyan-300">SOC Analyst</div>
              <div className="text-[10px] font-mono text-slate-400">analyst.chen@truvexa.sec</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('SecOps Forensics Lead')}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-purple-500/30 hover:border-purple-400 text-left transition cursor-pointer active:scale-95 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] glow-complement-click interactive-float"
            >
              <div className="text-xs font-bold text-purple-300">Forensics Lead</div>
              <div className="text-[10px] font-mono text-slate-400">lead.marquez@truvexa.sec</div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* User Name / Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-medium text-slate-300">
              User Name or Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-hover:text-cyan-400 transition-colors">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Enter user name or email (e.g. analyst or user@truvexa.sec)"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all font-mono"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-medium text-slate-300">
                Password
              </label>
              <span className="text-[11px] text-cyan-400 font-mono">Min 4 chars</span>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-hover:text-cyan-400 transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-10 pr-12 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-medium text-slate-300">
              Access Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Tier-1 Triage', 'Tier-2 SOC Analyst', 'SecOps Forensics Lead'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-2 text-center rounded-lg border text-[11px] font-medium transition cursor-pointer active:scale-95 ${
                    role === r
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-cyan-500 focus:ring-offset-0"
              />
              <span>Keep workstation logged in</span>
            </label>
            <span className="text-slate-500 font-mono text-[11px]">Encrypted Session</span>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Authenticating Loading Feedback */}
          {isAuthenticating && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-xs space-y-2 text-center animate-pulse">
              <div className="flex items-center justify-center gap-2 text-cyan-400 font-semibold font-mono">
                <Fingerprint className="w-5 h-5 animate-spin" />
                <span>Authenticating User Credentials</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {authStepMessage}
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:via-blue-400 hover:to-purple-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.7),0_0_50px_rgba(168,85,247,0.5)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 btn-glow glow-complement-click interactive-float"
          >
            {isAuthenticating ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Sign In to TRUVEXA</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] font-mono text-slate-500">
          TRUVEXA Link Defense System · Secure User Access Gateway
        </div>
      </div>
    </section>
  );
};
