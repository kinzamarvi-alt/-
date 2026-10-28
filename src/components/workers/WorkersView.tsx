import React, { useState, useMemo } from 'react';
import { useKhata } from '../../context/KhataContext';
import { Worker } from '../../types';
import { 
  Plus, 
  Search, 
  Phone, 
  Building2, 
  WalletCards, 
  FileText, 
  Users, 
  ArrowUpRight,
  Filter,
  DollarSign
} from 'lucide-react';

interface WorkersViewProps {
  onAddWorker: () => void;
  onOpenWorkerDetails: (workerId: string) => void;
  onAddTransaction: (workerId: string, defaultType: 'peshgi' | 'payment') => void;
  onOpenSlip: (workerId: string) => void;
}

export const WorkersView: React.FC<WorkersViewProps> = ({
  onAddWorker,
  onOpenWorkerDetails,
  onAddTransaction,
  onOpenSlip,
}) => {
  const { workers, sites, getWorkerSummary, settings, t, triggerHaptic } = useKhata();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('all');

  // Extract unique roles
  const roles = useMemo(() => {
    const set = new Set<string>();
    workers.forEach((w) => set.add(w.role));
    return Array.from(set);
  }, [workers]);

  // Filtered workers list
  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      if (selectedRole !== 'all' && worker.role !== selectedRole) return false;
      if (selectedSiteFilter !== 'all' && worker.siteId !== selectedSiteFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = worker.name.toLowerCase().includes(q) || (worker.urduName && worker.urduName.includes(q));
        const matchesPhone = worker.phone.includes(q);
        const matchesRole = worker.role.toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesRole;
      }
      return true;
    });
  }, [workers, selectedRole, selectedSiteFilter, searchQuery]);

  // Overall totals across filtered workers
  const overallFinancials = useMemo(() => {
    let totalGross = 0;
    let totalPeshgi = 0;
    let totalPaid = 0;
    let totalNetPayable = 0;

    workers.forEach((w) => {
      const s = getWorkerSummary(w.id);
      if (s) {
        totalGross += s.grossEarned;
        totalPeshgi += s.totalPeshgi;
        totalPaid += s.totalPaid;
        if (s.netBalance > 0) totalNetPayable += s.netBalance;
      }
    });

    return { totalGross, totalPeshgi, totalPaid, totalNetPayable };
  }, [workers, getWorkerSummary]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-24 md:pb-12">
      {/* Top Header & Overview Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>{t('workers')}</span>
              <span className="text-xs font-normal text-slate-400 font-urdu" dir="rtl">
                (مزدور و کاریگر)
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage profiles, daily rates, advances, and overall ledger balances.
            </p>
          </div>

          <button
            onClick={() => {
              triggerHaptic();
              onAddWorker();
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 transition-transform active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t('addWorker')}</span>
          </button>
        </div>

        {/* Global Financial Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t('totalWorkers')}</div>
            <div className="text-lg font-bold font-mono tabular-nums text-white mt-0.5">
              {workers.length}
            </div>
          </div>

          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t('totalEarned')}</div>
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
              {settings.currency} {overallFinancials.totalGross.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] text-amber-400 uppercase tracking-wider">{t('totalAdvances')}</div>
            <div className="text-lg font-bold font-mono tabular-nums text-amber-300 mt-0.5">
              {settings.currency} {overallFinancials.totalPeshgi.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] text-emerald-400 uppercase tracking-wider">{t('netPayable')}</div>
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-300 mt-0.5">
              {settings.currency} {overallFinancials.totalNetPayable.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchWorker')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Roles &amp; Trades</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedSiteFilter}
              onChange={(e) => setSelectedSiteFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">{t('allSites')}</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredWorkers.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">{t('noWorkers')}</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Add your masons, carpenters, and helpers to record attendance and keep track of daily wages.
            </p>
            <button
              onClick={onAddWorker}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-sm"
            >
              {t('addWorker')}
            </button>
          </div>
        ) : (
          filteredWorkers.map((worker) => {
            const summary = getWorkerSummary(worker.id);
            const assignedSite = sites.find((s) => s.id === worker.siteId);

            return (
              <div
                key={worker.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all shadow-sm flex flex-col justify-between space-y-3"
              >
                {/* Worker Top Details */}
                <div
                  onClick={() => onOpenWorkerDetails(worker.id)}
                  className="cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl ${worker.avatarColor || 'bg-amber-600'} text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0`}
                      >
                        {worker.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors truncate max-w-[170px]">
                            {worker.name}
                          </h4>
                          {!worker.active && (
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-amber-400/90 font-medium">
                          {worker.role}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t('dailyRate')}</div>
                      <div className="text-sm font-bold font-mono tabular-nums text-white">
                        {settings.currency} {worker.dailyWage.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Urdu name & assigned site */}
                  <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{assignedSite ? assignedSite.name : 'No Site'}</span>
                    </div>
                    {worker.phone && (
                      <span className="text-[11px] font-mono text-slate-300 shrink-0">
                        {worker.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Financial Balance Strip */}
                {summary && (
                  <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between mb-1 text-[11px]">
                      <span className="text-slate-400">{t('totalAdvances')}:</span>
                      <span className="font-mono tabular-nums text-amber-400 font-semibold">
                        {settings.currency} {summary.totalPeshgi.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                      <span className="text-slate-300 font-medium">{t('balance')}:</span>
                      <span
                        className={`font-mono tabular-nums font-bold text-xs ${
                          summary.netBalance > 0
                            ? 'text-emerald-400'
                            : summary.netBalance < 0
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {summary.netBalance > 0 ? '+' : ''}
                        {settings.currency} {summary.netBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Worker Quick Action Buttons */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    onClick={() => onAddTransaction(worker.id, 'peshgi')}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-amber-300 transition-colors text-center"
                    title={t('givePeshgi')}
                  >
                    + {t('advancePeshgi')}
                  </button>

                  <button
                    onClick={() => onAddTransaction(worker.id, 'payment')}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-blue-300 transition-colors text-center"
                    title={t('recordPayment')}
                  >
                    + {t('wagePayment')}
                  </button>

                  <button
                    onClick={() => onOpenSlip(worker.id)}
                    className="py-1.5 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-[11px] font-bold text-emerald-300 transition-colors flex items-center justify-center gap-1"
                    title={t('generateSlip')}
                  >
                    <FileText className="w-3 h-3" />
                    <span>Parchi</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
