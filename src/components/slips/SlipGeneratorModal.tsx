import React, { useState, useMemo } from 'react';
import { useKhata } from '../../context/KhataContext';
import { 
  X, 
  Share2, 
  Printer, 
  Copy, 
  Check, 
  FileText, 
  Calendar, 
  Building2,
  HardHat
} from 'lucide-react';

interface SlipGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWorkerId?: string | null;
}

export const SlipGeneratorModal: React.FC<SlipGeneratorModalProps> = ({
  isOpen,
  onClose,
  defaultWorkerId,
}) => {
  const { workers, sites, getWorkerSummary, settings, t, triggerHaptic } = useKhata();

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(
    defaultWorkerId || (workers[0]?.id || '')
  );

  // Period ranges: This Week, Last Week, This Month, Custom
  const [periodPreset, setPeriodPreset] = useState<'thisWeek' | 'lastWeek' | 'thisMonth' | 'custom'>('thisWeek');
  
  // Helper to compute date ranges
  const dateRanges = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // This week (last 7 days)
    const d7 = new Date();
    d7.setDate(now.getDate() - 6);
    const thisWeekStart = d7.toISOString().split('T')[0];

    // Last week (days 7 to 13 ago)
    const lwEnd = new Date();
    lwEnd.setDate(now.getDate() - 7);
    const lwStart = new Date();
    lwStart.setDate(now.getDate() - 13);

    // This month (from 1st of current month to today)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    return {
      thisWeek: { start: thisWeekStart, end: today },
      lastWeek: { start: lwStart.toISOString().split('T')[0], end: lwEnd.toISOString().split('T')[0] },
      thisMonth: { start: monthStart, end: today },
    };
  }, []);

  const [customStart, setCustomStart] = useState<string>(dateRanges.thisWeek.start);
  const [customEnd, setCustomEnd] = useState<string>(dateRanges.thisWeek.end);
  const [copied, setCopied] = useState(false);

  const activeRange = useMemo(() => {
    if (periodPreset === 'custom') {
      return { start: customStart, end: customEnd };
    }
    return dateRanges[periodPreset];
  }, [periodPreset, customStart, customEnd, dateRanges]);

  const activeWorker = workers.find((w) => w.id === selectedWorkerId);
  const assignedSite = sites.find((s) => s.id === activeWorker?.siteId);
  const summary = activeWorker ? getWorkerSummary(activeWorker.id, activeRange.start, activeRange.end) : null;

  // Generate WhatsApp formatted text
  const generateWhatsAppText = (): string => {
    if (!activeWorker || !summary) return '';

    const lines = [
      `📋 *${settings.businessName || 'مزدور کھاتہ - Mazdoor Khata'}*`,
      `📑 *حساب پرچی (Worker Wage Slip)*`,
      `---------------------------------`,
      `👤 *مزدور کا نام (Name):* ${activeWorker.name} ${activeWorker.urduName ? `(${activeWorker.urduName})` : ''}`,
      `🔨 *ہنر (Role):* ${activeWorker.role}`,
      `💰 *روزانہ دہاڑی (Rate):* ${settings.currency} ${activeWorker.dailyWage}`,
      `📅 *مدت (Period):* ${activeRange.start} تا ${activeRange.end}`,
      assignedSite ? `🏗️ *سائٹ (Site):* ${assignedSite.name}` : '',
      `---------------------------------`,
      `✅ حاضری (Present): ${summary.totalPresent} دن`,
      summary.totalHalfDays > 0 ? `🌓 آدھا دن (Half-Day): ${summary.totalHalfDays} دن` : '',
      summary.totalOtHours > 0 ? `⏱️ اوور ٹائم (Overtime): ${summary.totalOtHours} گھنٹے` : '',
      `💵 *کل اجرت (Gross Wage):* ${settings.currency} ${summary.grossEarned.toLocaleString()}`,
      `➖ *پیشگی / ادھار (Advance):* ${settings.currency} ${summary.totalPeshgi.toLocaleString()}`,
      summary.totalPaid > 0 ? `💳 ادائیگیاں (Paid): ${settings.currency} ${summary.totalPaid.toLocaleString()}` : '',
      `---------------------------------`,
      `💵 *صافی باقی رقم (Net Balance):* ${settings.currency} ${Math.abs(summary.netBalance).toLocaleString()} ${summary.netBalance >= 0 ? '(واجب الادا)' : '(پیشگی باقی ہے)'}`,
      `---------------------------------`,
      settings.supervisorPhone ? `📞 رابطہ: ${settings.supervisorPhone}` : '',
      `_Generated via Mazdoor Khata App_`
    ].filter(Boolean);

    return lines.join('\n');
  };

  const handleShareWhatsApp = () => {
    triggerHaptic();
    const text = generateWhatsAppText();
    const encoded = encodeURIComponent(text);
    const cleanPhone = activeWorker?.phone.replace(/\D/g, '') || '';
    
    let url = `https://wa.me/?text=${encoded}`;
    if (cleanPhone.length >= 10) {
      // Check if starts with 03 (Pakistan format e.g. 03001234567 -> 923001234567)
      const intlPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone;
      url = `https://wa.me/${intlPhone}?text=${encoded}`;
    }
    window.open(url, '_blank');
  };

  const handleCopy = () => {
    triggerHaptic();
    const text = generateWhatsAppText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    triggerHaptic();
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('generateSlip')}</h3>
              <p className="text-xs text-slate-400">Generate printable slip or WhatsApp message</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 space-y-3 no-print">
          {/* Worker Select */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Select Worker
              </label>
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none"
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Period preset buttons */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                {t('period')}
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setPeriodPreset('thisWeek')}
                  className={`py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                    periodPreset === 'thisWeek'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('thisWeek')}
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodPreset('thisMonth')}
                  className={`py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                    periodPreset === 'thisMonth'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('thisMonth')}
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodPreset('custom')}
                  className={`py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                    periodPreset === 'custom'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>
          </div>

          {/* Custom Date Pickers */}
          {periodPreset === 'custom' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">From Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">To Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Printable / Visual Parchi (Receipt) Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeWorker && summary ? (
            <div className="bg-white text-slate-900 rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-300 font-sans print:shadow-none print:border-none print:p-0">
              {/* Slip Header */}
              <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <HardHat className="w-5 h-5 text-amber-600 print:text-black" />
                  <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-slate-950">
                    {settings.businessName || 'MAZDOOR KHATA & PAYROLL'}
                  </h2>
                </div>
                <div className="text-xs font-urdu font-bold text-slate-800" dir="rtl">
                  حساب پرچی و دہاڑی رجسٹر
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Period: <strong>{activeRange.start}</strong> to <strong>{activeRange.end}</strong>
                </div>
              </div>

              {/* Worker & Site Info Box */}
              <div className="grid grid-cols-2 gap-2 text-xs border border-slate-300 rounded-xl p-3 bg-slate-50 mb-4">
                <div>
                  <span className="text-slate-500 block text-[10px]">Worker Name / نام:</span>
                  <strong className="text-sm text-slate-900">{activeWorker.name}</strong>
                  {activeWorker.urduName && (
                    <span className="block text-slate-700 font-urdu text-xs">{activeWorker.urduName}</span>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Trade / Role:</span>
                  <strong className="text-slate-900">{activeWorker.role}</strong>
                  <span className="block text-[11px] text-slate-600">
                    Rate: {settings.currency} {activeWorker.dailyWage} / day
                  </span>
                </div>

                {assignedSite && (
                  <div className="col-span-2 pt-1 border-t border-slate-200">
                    <span className="text-slate-500 text-[10px] mr-1">Site / پراجیکٹ:</span>
                    <strong className="text-slate-900">{assignedSite.name}</strong>
                  </div>
                )}
              </div>

              {/* Attendance & Wage Table */}
              <table className="w-full text-xs text-left mb-4">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-600">
                    <th className="py-1.5 font-bold">Particulars / تفصیل</th>
                    <th className="py-1.5 text-center font-bold">Days / Hrs</th>
                    <th className="py-1.5 text-right font-bold">Amount ({settings.currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 text-slate-800 font-medium">Present Days (حاضری)</td>
                    <td className="py-2 text-center font-mono font-bold">{summary.totalPresent}</td>
                    <td className="py-2 text-right font-mono font-bold">
                      {(summary.totalPresent * activeWorker.dailyWage).toLocaleString()}
                    </td>
                  </tr>

                  {summary.totalHalfDays > 0 && (
                    <tr>
                      <td className="py-2 text-slate-800 font-medium">Half Days (آدھا دن)</td>
                      <td className="py-2 text-center font-mono font-bold">{summary.totalHalfDays}</td>
                      <td className="py-2 text-right font-mono font-bold">
                        {(summary.totalHalfDays * Math.round(activeWorker.dailyWage / 2)).toLocaleString()}
                      </td>
                    </tr>
                  )}

                  {summary.totalOtHours > 0 && (
                    <tr>
                      <td className="py-2 text-slate-800 font-medium">Overtime (اوور ٹائم)</td>
                      <td className="py-2 text-center font-mono font-bold">{summary.totalOtHours} hrs</td>
                      <td className="py-2 text-right font-mono font-bold text-blue-700">
                        {(summary.totalOtHours * activeWorker.overtimeHourlyRate).toLocaleString()}
                      </td>
                    </tr>
                  )}

                  {/* Gross Total */}
                  <tr className="font-bold bg-slate-100/80">
                    <td className="py-2 px-2 text-slate-950 font-extrabold uppercase">
                      Gross Earned (کل دہاڑی)
                    </td>
                    <td className="py-2 text-center font-mono">
                      {summary.totalPresent + (summary.totalHalfDays * 0.5)} days
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-sm text-slate-950">
                      {settings.currency} {summary.grossEarned.toLocaleString()}
                    </td>
                  </tr>

                  {/* Peshgi Deductions */}
                  {summary.totalPeshgi > 0 && (
                    <tr className="text-amber-800 bg-amber-50/50">
                      <td className="py-2 px-2 font-medium">Advance / Peshgi Deducted (منہا پیشگی)</td>
                      <td className="py-2 text-center">-</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-amber-800">
                        - {settings.currency} {summary.totalPeshgi.toLocaleString()}
                      </td>
                    </tr>
                  )}

                  {summary.totalPaid > 0 && (
                    <tr className="text-blue-800">
                      <td className="py-2 px-2 font-medium">Payments Already Made (ادائیگی)</td>
                      <td className="py-2 text-center">-</td>
                      <td className="py-2 px-2 text-right font-mono font-bold">
                        - {settings.currency} {summary.totalPaid.toLocaleString()}
                      </td>
                    </tr>
                  )}

                  {/* Net Payable Final Highlight */}
                  <tr className="border-t-2 border-slate-900 bg-slate-900 text-white font-extrabold text-sm">
                    <td className="py-2.5 px-3 uppercase tracking-wider">
                      Net Cash Payable (صافی باقی)
                    </td>
                    <td className="py-2.5 text-center">-</td>
                    <td className="py-2.5 px-3 text-right font-mono text-base text-amber-300">
                      {settings.currency} {Math.abs(summary.netBalance).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures & Verification */}
              <div className="grid grid-cols-2 gap-6 pt-6 mt-4 border-t border-slate-300 text-center text-[11px] text-slate-600">
                <div className="space-y-4">
                  <div className="h-9 border-b border-dashed border-slate-400"></div>
                  <span>{t('workerSign')}</span>
                </div>

                <div className="space-y-4">
                  <div className="h-9 border-b border-dashed border-slate-400"></div>
                  <span>{t('authorizedSign')}</span>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[10px] text-slate-500">
                Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()} · Mazdoor Khata Digital System
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t('copiedText') : t('copySummary')}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('printSlip')}</span>
            </button>
          </div>

          {/* WhatsApp Primary Button */}
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-transform active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>{t('shareWhatsApp')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
