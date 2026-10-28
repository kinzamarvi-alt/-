import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import { Worker } from '../../types';
import { 
  X, 
  Phone, 
  Calendar, 
  WalletCards, 
  Plus, 
  Trash2, 
  Edit, 
  FileText, 
  Clock, 
  Building2, 
  Share2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface WorkerDetailModalProps {
  workerId: string | null;
  onClose: () => void;
  onEditWorker: (worker: Worker) => void;
  onAddTransactionForWorker: (workerId: string, defaultType: 'peshgi' | 'payment') => void;
  onOpenSlip: (workerId: string) => void;
}

export const WorkerDetailModal: React.FC<WorkerDetailModalProps> = ({
  workerId,
  onClose,
  onEditWorker,
  onAddTransactionForWorker,
  onOpenSlip,
}) => {
  const { 
    workers, 
    sites, 
    attendance, 
    transactions, 
    deleteTransaction, 
    deleteWorker, 
    getWorkerSummary, 
    settings, 
    t, 
    triggerHaptic 
  } = useKhata();

  const [activeTab, setActiveTab] = useState<'attendance' | 'ledger'>('attendance');

  if (!workerId) return null;
  const worker = workers.find((w) => w.id === workerId);
  if (!worker) return null;

  const summary = getWorkerSummary(worker.id);
  const assignedSite = sites.find((s) => s.id === worker.siteId);

  // Worker's specific attendance records sorted descending
  const workerAttendance = attendance
    .filter((a) => a.workerId === worker.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Worker's transactions sorted descending
  const workerTransactions = transactions
    .filter((t) => t.workerId === worker.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleDeleteWorker = () => {
    if (confirm(`Are you sure you want to delete ${worker.name}? All attendance and transactions will be deleted.`)) {
      deleteWorker(worker.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl ${worker.avatarColor || 'bg-amber-600'} text-white font-extrabold flex items-center justify-center text-lg shadow-md shrink-0`}
            >
              {worker.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                  {worker.name}
                </h3>
                {worker.urduName && (
                  <span className="text-xs text-amber-400 font-urdu" dir="rtl">
                    {worker.urduName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="text-amber-400 font-medium">{worker.role}</span>
                <span>·</span>
                <span className="font-mono tabular-nums">
                  {settings.currency} {worker.dailyWage.toLocaleString()} / day
                </span>
                {worker.phone && (
                  <>
                    <span>·</span>
                    <a
                      href={`tel:${worker.phone}`}
                      className="flex items-center gap-1 text-slate-300 hover:text-white"
                    >
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>{worker.phone}</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEditWorker(worker)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title={t('editWorker')}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Financial Summary Card */}
          {summary && (
            <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 shadow-sm">
              <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
                <span>{t('balance')} Summary</span>
                {assignedSite && (
                  <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                    <Building2 className="w-3 h-3 text-amber-400" />
                    {assignedSite.name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">{t('totalEarned')}</div>
                  <div className="text-sm sm:text-base font-bold font-mono tabular-nums text-white mt-0.5">
                    {settings.currency} {summary.grossEarned.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800">
                  <div className="text-[10px] text-amber-400 font-medium">{t('totalAdvances')}</div>
                  <div className="text-sm sm:text-base font-bold font-mono tabular-nums text-amber-300 mt-0.5">
                    {settings.currency} {summary.totalPeshgi.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800">
                  <div className="text-[10px] text-blue-400 font-medium">{t('totalPaid')}</div>
                  <div className="text-sm sm:text-base font-bold font-mono tabular-nums text-blue-300 mt-0.5">
                    {settings.currency} {summary.totalPaid.toLocaleString()}
                  </div>
                </div>

                <div
                  className={`rounded-xl p-2.5 border ${
                    summary.netBalance > 0
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : summary.netBalance < 0
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-[10px] font-medium">
                    {summary.netBalance > 0
                      ? t('netPayable')
                      : summary.netBalance < 0
                      ? t('workerOwes')
                      : t('settled')}
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono tabular-nums mt-0.5">
                    {settings.currency} {Math.abs(summary.netBalance).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Attendance metrics strip */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  <strong>{summary.totalPresent}</strong> Present
                </span>
                <span>·</span>
                <span>
                  <strong>{summary.totalHalfDays}</strong> Half Days
                </span>
                <span>·</span>
                <span>
                  <strong>{summary.totalAbsent}</strong> Absent
                </span>
                <span>·</span>
                <span>
                  <strong>{summary.totalOtHours}</strong> hrs OT
                </span>
              </div>
            </div>
          )}

          {/* Quick Transaction Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => onAddTransactionForWorker(worker.id, 'peshgi')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('givePeshgi')}</span>
            </button>

            <button
              onClick={() => onAddTransactionForWorker(worker.id, 'payment')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-bold transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('recordPayment')}</span>
            </button>

            <button
              onClick={() => onOpenSlip(worker.id)}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('generateSlip')}</span>
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                triggerHaptic();
                setActiveTab('attendance');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'attendance'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Attendance History ({workerAttendance.length})</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic();
                setActiveTab('ledger');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'ledger'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <WalletCards className="w-3.5 h-3.5" />
              <span>Khata Transactions ({workerTransactions.length})</span>
            </button>
          </div>

          {/* Tab Content: Attendance History */}
          {activeTab === 'attendance' && (
            <div className="space-y-2">
              {workerAttendance.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No attendance records logged for this worker.
                </div>
              ) : (
                workerAttendance.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-[11px] ${
                          rec.status === 'P'
                            ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                            : rec.status === 'HD'
                            ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {rec.status}
                      </span>
                      <div>
                        <div className="font-semibold text-white">{rec.date}</div>
                        {rec.overtimeHours > 0 && (
                          <div className="text-[11px] text-blue-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>+{rec.overtimeHours} hrs Overtime</span>
                          </div>
                        )}
                        {rec.note && <div className="text-[11px] text-slate-400">{rec.note}</div>}
                      </div>
                    </div>
                    <div className="text-right font-mono tabular-nums font-bold text-amber-400">
                      {settings.currency} {rec.dayWageCalculated.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab Content: Khata Ledger */}
          {activeTab === 'ledger' && (
            <div className="space-y-2">
              {workerTransactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No advance or payment transactions logged.
                </div>
              ) : (
                workerTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-[10px] ${
                          tx.type === 'peshgi'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : tx.type === 'payment'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {tx.type === 'peshgi' ? 'ADV' : 'PAY'}
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {tx.type === 'peshgi' ? t('advancePeshgi') : t('wagePayment')}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {tx.date} · {tx.paymentMethod}
                          {tx.note && ` · ${tx.note}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`font-mono tabular-nums font-bold text-sm ${
                          tx.type === 'peshgi' ? 'text-amber-400' : 'text-blue-400'
                        }`}
                      >
                        {settings.currency} {tx.amount.toLocaleString()}
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Delete this transaction?')) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={handleDeleteWorker}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 py-1.5 px-2.5 rounded-lg hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('delete')} Worker</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
