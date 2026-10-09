import React, { useState } from 'react';
import { Search, Trash2, ArrowUpRight, Download, Filter, FileSpreadsheet } from 'lucide-react';
import { ScanReport, RiskLevel } from '../types/index.ts';
import { getRiskColor, getRiskLabel, getSafetyRating, exportHistoryAsCsv } from '../utils/formatters.ts';

interface HistoryViewProps {
  history: ScanReport[];
  onSelectScan: (report: ScanReport) => void;
  onClearHistory: () => Promise<void>;
  onGoToScanner: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectScan,
  onClearHistory,
  onGoToScanner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | RiskLevel>('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const filteredHistory = history.filter((item) => {
    const matchesFilter = selectedFilter === 'all' || item.riskLevel === selectedFilter;
    const matchesSearch =
      item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.anatomy.hostname.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `truvexa-history-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header and Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Scan Audit Log</h2>
          <p className="text-sm text-slate-400">
            Historical registry of inspected URLs, heuristic scores, and threat classification records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {history.length > 0 && (
            <>
              <button
                onClick={() => exportHistoryAsCsv(history)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download CSV spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleExportJson}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={() => setShowConfirmClear(true)}
                className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-900/60 hover:bg-rose-900/50 text-xs text-rose-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear Log</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Clearing History */}
      {showConfirmClear && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-sm text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <strong className="font-semibold">Confirm Deletion: </strong>
            Are you sure you want to clear all {history.length} audit records from the current session?
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                await onClearHistory();
                setShowConfirmClear(false);
              }}
              className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Yes, Clear All
            </button>
            <button
              onClick={() => setShowConfirmClear(false)}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#0b1120] border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by URL or hostname..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-9 pr-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({history.length})
          </button>
          <button
            onClick={() => setSelectedFilter('low')}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              selectedFilter === 'low'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Low
          </button>
          <button
            onClick={() => setSelectedFilter('medium')}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              selectedFilter === 'medium'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => setSelectedFilter('high')}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              selectedFilter === 'high'
                ? 'bg-orange-500/20 text-orange-300 font-semibold border border-orange-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            High
          </button>
          <button
            onClick={() => setSelectedFilter('critical')}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              selectedFilter === 'critical'
                ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Critical
          </button>
        </div>
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-[#0b1120] rounded-2xl border border-slate-800">
          <Filter className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Audit Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {history.length === 0
              ? 'No URLs have been inspected during this session yet.'
              : 'No scanned URLs match the current search or risk level filter.'}
          </p>
          {history.length === 0 && (
            <button
              onClick={onGoToScanner}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              Analyze a URL Now
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const theme = getRiskColor(item.riskLevel);
            const label = getRiskLabel(item.riskLevel);

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#0b1120] border border-slate-800 card-hover-glow hover:border-cyan-400/80 hover:shadow-[0_0_25px_rgba(34,211,238,0.3),0_0_40px_rgba(168,85,247,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
              >
                {/* Left: Score Badge & Details */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 border ${theme.border} ${theme.bg}`}>
                    <span className="text-base font-bold font-mono tabular-nums text-white">
                      {item.safetyPercentage}%
                    </span>
                    <span className="text-[9px] font-mono uppercase text-slate-400">Safe</span>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSafetyRating(item.safetyPercentage).border} ${getSafetyRating(item.safetyPercentage).bg} text-white`}>
                        {item.safetyPercentage}% Safe
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${theme.border} ${theme.bg} ${theme.text}`}>
                        {label} (Risk: {item.riskScore}%)
                      </span>
                      <span className="text-xs font-mono text-cyan-400 font-semibold">
                        {item.anatomy.hostname}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-slate-200 truncate" title={item.url}>
                      {item.url}
                    </p>

                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                      <span>{item.indicators.length} indicators triggered</span>
                      <span>·</span>
                      <span>Intel: {item.threatIntel.status}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Action */}
                <div className="shrink-0 flex items-center justify-end">
                  <button
                    onClick={() => onSelectScan(item)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs text-cyan-300 font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View Inspection Report</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
