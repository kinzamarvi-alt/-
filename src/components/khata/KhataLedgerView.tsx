import React, { useState, useMemo } from 'react';
import { useKhata } from '../../context/KhataContext';
import { TransactionType } from '../../types';
import { 
  WalletCards, 
  Plus, 
  Search, 
  Trash2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Building2,
  Calendar,
  Filter
} from 'lucide-react';

interface KhataLedgerViewProps {
  onOpenAddTransaction: (defaultType?: TransactionType) => void;
  onOpenWorkerDetails: (workerId: string) => void;
}

export const KhataLedgerView: React.FC<KhataLedgerViewProps> = ({
  onOpenAddTransaction,
  onOpenWorkerDetails,
}) => {
  const { workers, transactions, deleteTransaction, settings, t, triggerHaptic } = useKhata();

  const [typeFilter, setTypeFilter] = useState<'all' | 'peshgi' | 'payment'>('all');
  const [selectedWorkerFilter, setSelectedWorkerFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered transactions sorted descending by date
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        if (selectedWorkerFilter !== 'all' && tx.workerId !== selectedWorkerFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const worker = workers.find((w) => w.id === tx.workerId);
          const workerName = worker ? worker.name.toLowerCase() : '';
          const noteMatch = tx.note ? tx.note.toLowerCase().includes(q) : false;
          return workerName.includes(q) || noteMatch;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, typeFilter, selectedWorkerFilter, searchQuery, workers]);

  // Aggregate totals
  const totals = useMemo(() => {
    let totalPeshgi = 0;
    let totalPaid = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'peshgi') totalPeshgi += tx.amount;
      else if (tx.type === 'payment') totalPaid += tx.amount;
    });

    return { totalPeshgi, totalPaid, totalAll: totalPeshgi + totalPaid };
  }, [transactions]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-24 md:pb-12">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <WalletCards className="w-5 h-5 text-amber-400" />
              <span>{t('khata')}</span>
              <span className="text-xs font-normal text-slate-400 font-urdu" dir="rtl">
                (پیشگی اور ادائیگیاں)
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Record worker cash advances (Peshgi), wage settlements, and track balance ledgers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic();
                onOpenAddTransaction('peshgi');
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t('givePeshgi')}</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic();
                onOpenAddTransaction('payment');
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t('recordPayment')}</span>
            </button>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] text-amber-400 uppercase tracking-wider font-medium">
              {t('totalAdvances')} (Peshgi)
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-amber-300 mt-0.5">
              {settings.currency} {totals.totalPeshgi.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] text-blue-400 uppercase tracking-wider font-medium">
              {t('totalPaid')} (Wage Paid)
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-blue-300 mt-0.5">
              {settings.currency} {totals.totalPaid.toLocaleString()}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-slate-950/70 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
              Total Cash Disbursed
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-white mt-0.5">
              {settings.currency} {totals.totalAll.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80">
          {/* Segmented Type selector */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                triggerHaptic();
                setTypeFilter('all');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                typeFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => {
                triggerHaptic();
                setTypeFilter('peshgi');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                typeFilter === 'peshgi' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('advancePeshgi')}
            </button>
            <button
              onClick={() => {
                triggerHaptic();
                setTypeFilter('payment');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                typeFilter === 'payment' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('wagePayment')}
            </button>
          </div>

          {/* Worker Filter */}
          <div>
            <select
              value={selectedWorkerFilter}
              onChange={(e) => setSelectedWorkerFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Workers ({workers.length})</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by worker name or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
            <WalletCards className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">{t('noTransactions')}</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const worker = workers.find((w) => w.id === tx.workerId);
            const isPeshgi = tx.type === 'peshgi';

            return (
              <div
                key={tx.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3.5 sm:p-4 transition-all shadow-sm flex items-center justify-between gap-3"
              >
                {/* Left: Icon & Worker info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isPeshgi
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {isPeshgi ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => worker && onOpenWorkerDetails(worker.id)}
                        className="text-sm font-bold text-white hover:text-amber-400 transition-colors truncate"
                      >
                        {worker ? worker.name : 'Unknown Worker'}
                      </button>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isPeshgi
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {isPeshgi ? t('advancePeshgi') : t('wagePayment')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="font-mono text-[11px] text-slate-300">{tx.date}</span>
                      <span>·</span>
                      <span>{tx.paymentMethod}</span>
                      {tx.note && (
                        <>
                          <span>·</span>
                          <span className="italic truncate max-w-[150px] sm:max-w-xs text-slate-300">
                            "{tx.note}"
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Delete button */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-base sm:text-lg font-extrabold font-mono tabular-nums ${
                        isPeshgi ? 'text-amber-400' : 'text-blue-400'
                      }`}
                    >
                      {settings.currency} {tx.amount.toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Delete this transaction?')) {
                        deleteTransaction(tx.id);
                      }
                    }}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
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
