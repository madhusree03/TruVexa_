import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Activity,
  RefreshCw,
  Search,
  ArrowUpRight,
  TrendingUp,
  Radio,
  FileCheck,
  Shield,
  Layers,
  ArrowRight,
  PhoneCall,
} from 'lucide-react';
import { ScanReport, ScanStats } from '../types/index.ts';
import { getRiskColor, getRiskLabel, getSafetyRating } from '../utils/formatters.ts';

interface DashboardViewProps {
  stats: ScanStats;
  recentScans: ScanReport[];
  onSelectScan: (report: ScanReport) => void;
  onGoToScanner: () => void;
  onRefresh: () => void;
  onGoToHelpCenter?: () => void;
  onGoToReportPhishing?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  recentScans,
  onSelectScan,
  onGoToScanner,
  onRefresh,
  onGoToHelpCenter,
  onGoToReportPhishing,
}) => {
  const total = stats.totalScans;

  const lowPercent = total > 0 ? Math.round((stats.lowRiskCount / total) * 100) : 0;
  const medPercent = total > 0 ? Math.round((stats.mediumRiskCount / total) * 100) : 0;
  const highPercent = total > 0 ? Math.round((stats.highRiskCount / total) * 100) : 0;
  const critPercent = total > 0 ? Math.round((stats.criticalRiskCount / total) * 100) : 0;

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Static line from starting to ending (flowing animation stopped as requested) */}
      <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500/70 via-blue-500/70 to-purple-500/70 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.25)]" />

      {/* Top Banner */}
      <div className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-xl card-hover-glow interactive-float">

        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>LIVE SECURITY BOARD & TELEMETRY</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Security Intelligence Board</h2>
          <p className="text-sm text-slate-400">
            Real-time session analytics, heuristic distribution, and threat classification metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 glow-complement-click interactive-float"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Telemetry</span>
          </button>

          {onGoToHelpCenter && (
            <button
              onClick={onGoToHelpCenter}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs text-cyan-300 font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 glow-complement-click interactive-float"
            >
              <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cyber Help Centre</span>
            </button>
          )}

          <button
            onClick={onGoToScanner}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer active:scale-95 btn-glow glow-complement-click interactive-float"
          >
            New URL / QR Scan
          </button>
        </div>
      </div>

      {/* Traversal Status Indicator Bar */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-slate-300">Continuous Security Pipeline Scanning:</span>
          <span className="text-cyan-400 font-bold">Active Line Traversal (0% ➔ 100%)</span>
        </div>
        <div className="hidden sm:block text-[11px] text-slate-500">
          Zero-Lag Dynamic Telemetry
        </div>
      </div>

      {/* KPI Cards Strip with interactive floating motion */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total URLs */}
        <div className="p-4 rounded-xl bg-[#0b1120] border border-slate-800 space-y-1 card-hover-glow cursor-pointer interactive-float animate-board-float">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Total Inspected</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {stats.totalScans}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Current session</div>
        </div>

        {/* Low Risk */}
        <div className="p-4 rounded-xl bg-[#0b1120] border border-slate-800 space-y-1 card-hover-glow cursor-pointer interactive-float animate-board-float" style={{ animationDelay: '0.6s' }}>
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 flex items-center justify-between">
            <span>Low Risk (Safe)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
            {stats.lowRiskCount}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">{lowPercent}% of scans</div>
        </div>

        {/* Medium Risk */}
        <div className="p-4 rounded-xl bg-[#0b1120] border border-slate-800 space-y-1 card-hover-glow cursor-pointer interactive-float animate-board-float" style={{ animationDelay: '1.2s' }}>
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 flex items-center justify-between">
            <span>Medium Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
            {stats.mediumRiskCount}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">{medPercent}% of scans</div>
        </div>

        {/* High Risk */}
        <div className="p-4 rounded-xl bg-[#0b1120] border border-slate-800 space-y-1 card-hover-glow cursor-pointer interactive-float animate-board-float" style={{ animationDelay: '1.8s' }}>
          <div className="text-[11px] font-mono uppercase tracking-wider text-orange-400 flex items-center justify-between">
            <span>High Risk</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-extrabold text-orange-400 font-mono tabular-nums">
            {stats.highRiskCount}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">{highPercent}% of scans</div>
        </div>

        {/* Critical Risk */}
        <div className="p-4 rounded-xl bg-[#0b1120] border border-slate-800 space-y-1 card-hover-glow cursor-pointer interactive-float animate-board-float" style={{ animationDelay: '2.4s' }}>
          <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 flex items-center justify-between">
            <span>Critical Threat</span>
            <Shield className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400 font-mono tabular-nums">
            {stats.criticalRiskCount}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">{critPercent}% of scans</div>
        </div>
      </div>

      {/* Main Charts & Breakdown Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Breakdown */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-5 card-hover-glow interactive-float">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Risk Level Distribution
            </h3>
            <span className="text-xs font-mono text-slate-400">Total: {total}</span>
          </div>

          {/* Visual Percentage Stacked Bar */}
          <div className="h-4 w-full rounded-full bg-slate-900 overflow-hidden flex shadow-inner">
            <div style={{ width: `${lowPercent}%` }} className="bg-emerald-500 transition-all duration-500" title={`Low: ${lowPercent}%`} />
            <div style={{ width: `${medPercent}%` }} className="bg-amber-500 transition-all duration-500" title={`Medium: ${medPercent}%`} />
            <div style={{ width: `${highPercent}%` }} className="bg-orange-500 transition-all duration-500" title={`High: ${highPercent}%`} />
            <div style={{ width: `${critPercent}%` }} className="bg-rose-500 transition-all duration-500" title={`Critical: ${critPercent}%`} />
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Low Risk (Safe)</span>
              </span>
              <span className="font-mono font-semibold text-emerald-400">
                {stats.lowRiskCount} scans ({lowPercent}%)
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Medium Risk</span>
              </span>
              <span className="font-mono font-semibold text-amber-400">
                {stats.mediumRiskCount} scans ({medPercent}%)
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                <span>High Risk</span>
              </span>
              <span className="font-mono font-semibold text-orange-400">
                {stats.highRiskCount} scans ({highPercent}%)
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span>Critical Threats</span>
              </span>
              <span className="font-mono font-semibold text-rose-400">
                {stats.criticalRiskCount} scans ({critPercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Security Health & Threat Intelligence Status */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-5 card-hover-glow interactive-float">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Engine Telemetry & Health
            </h3>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400">Threat Feed Matches</span>
              <div className="text-xl font-bold font-mono text-rose-400">
                {stats.threatIntelDetections}
              </div>
              <p className="text-[10px] text-slate-500">Reputation blacklist flags</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400">Detection Rate</span>
              <div className="text-xl font-bold font-mono text-cyan-400">
                {total > 0 ? `${Math.round(((stats.highRiskCount + stats.criticalRiskCount) / total) * 100)}%` : '0%'}
              </div>
              <p className="text-[10px] text-slate-500">Flagged suspicious ratio</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Multi-Layer Defense Architecture Active</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Every analyzed target passes through 16 static lexical heuristics, optical QR code extraction, domain age sanity models, and real-time threat intelligence lookup.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="p-6 rounded-2xl bg-[#0b1120] border border-slate-800 space-y-4 card-hover-glow interactive-float">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-base font-bold text-white tracking-tight">Recent Scan Activity</h3>
          <span className="text-xs font-mono text-slate-400">{recentScans.length} recorded</span>
        </div>

        {recentScans.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No links have been inspected yet. Use the URL or QR scanner above to run an analysis.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800/80">
                <tr>
                  <th className="pb-3 font-semibold">Inspected Link</th>
                  <th className="pb-3 font-semibold">Safety Rating</th>
                  <th className="pb-3 font-semibold">Risk Level</th>
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentScans.slice(0, 8).map((scan) => {
                  const safety = getSafetyRating(scan.safetyPercentage);
                  const risk = getRiskColor(scan.riskLevel);
                  return (
                    <tr
                      key={scan.id}
                      onClick={() => onSelectScan(scan)}
                      className="hover:bg-slate-900/60 cursor-pointer transition-all duration-200 group glow-complement-click hover-move"
                    >
                      <td className="py-3 pr-4 max-w-xs sm:max-w-md truncate font-mono text-white group-hover:text-cyan-300">
                        {scan.url}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${safety.border} ${safety.bg} text-white`}>
                          {scan.safetyPercentage}% Safe
                        </span>
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase font-semibold border ${risk.border} ${risk.bg} ${risk.text}`}>
                          {scan.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-400 font-mono whitespace-nowrap text-[11px]">
                        {scan.timestamp}
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <span className="text-cyan-400 text-xs font-semibold group-hover:underline flex items-center justify-end gap-1">
                          View Meter & Rationale
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
