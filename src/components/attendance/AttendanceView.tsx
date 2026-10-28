import React, { useState, useMemo } from 'react';
import { useKhata } from '../../context/KhataContext';
import { AttendanceStatus, Worker } from '../../types';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CheckCheck, 
  Search, 
  Clock, 
  Plus, 
  Minus, 
  X,
  FileText,
  Building2,
  Users
} from 'lucide-react';

interface AttendanceViewProps {
  onOpenWorkerDetails: (workerId: string) => void;
  onOpenSlip: (workerId: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  onOpenWorkerDetails,
  onOpenSlip,
}) => {
  const { 
    workers, 
    sites, 
    attendance, 
    settings, 
    selectedDate, 
    setSelectedDate, 
    selectedSiteId, 
    setSelectedSiteId, 
    setWorkerAttendance, 
    markAllPresentToday,
    t,
    triggerHaptic
  } = useKhata();

  const [searchQuery, setSearchQuery] = useState('');
  const [otModalWorker, setOtModalWorker] = useState<Worker | null>(null);
  const [tempOtHours, setTempOtHours] = useState<number>(1);
  const [tempOtNote, setTempOtNote] = useState<string>('');

  // Shift date by N days
  const shiftDate = (offset: number) => {
    triggerHaptic();
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offset);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  // Filtered workers
  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      if (!worker.active) return false;
      if (selectedSiteId !== 'all' && worker.siteId !== selectedSiteId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = worker.name.toLowerCase().includes(q) || (worker.urduName && worker.urduName.includes(q));
        const matchesPhone = worker.phone.includes(q);
        const matchesRole = worker.role.toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesRole;
      }
      return true;
    });
  }, [workers, selectedSiteId, searchQuery]);

  // Attendance lookup map for selectedDate: workerId -> record
  const attendanceMap = useMemo(() => {
    const map = new Map<string, typeof attendance[0]>();
    attendance.forEach((r) => {
      if (r.date === selectedDate) {
        map.set(r.workerId, r);
      }
    });
    return map;
  }, [attendance, selectedDate]);

  // Daily summary stats
  const dailyStats = useMemo(() => {
    let presentCount = 0;
    let halfDayCount = 0;
    let absentCount = 0;
    let totalOt = 0;
    let totalWages = 0;

    filteredWorkers.forEach((w) => {
      const rec = attendanceMap.get(w.id);
      if (rec) {
        if (rec.status === 'P') presentCount++;
        else if (rec.status === 'HD') halfDayCount++;
        else if (rec.status === 'A') absentCount++;
        totalOt += rec.overtimeHours || 0;
        totalWages += rec.dayWageCalculated || 0;
      }
    });

    return {
      presentCount,
      halfDayCount,
      absentCount,
      totalOt,
      totalWages,
      unmarkedCount: filteredWorkers.length - (presentCount + halfDayCount + absentCount),
    };
  }, [filteredWorkers, attendanceMap]);

  // Open Overtime dialog
  const handleOpenOt = (worker: Worker) => {
    triggerHaptic();
    const existing = attendanceMap.get(worker.id);
    setOtModalWorker(worker);
    setTempOtHours(existing?.overtimeHours || 2);
    setTempOtNote(existing?.note || '');
  };

  const handleSaveOt = () => {
    if (!otModalWorker) return;
    const existing = attendanceMap.get(otModalWorker.id);
    const status: AttendanceStatus = existing ? existing.status : 'P';
    setWorkerAttendance(otModalWorker.id, selectedDate, status, tempOtHours, tempOtNote);
    setOtModalWorker(null);
  };

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-24 md:pb-12">
      {/* Date & Site Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Date Selector with quick steps */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftDate(-1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="relative flex-1 sm:flex-initial">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  triggerHaptic();
                  setSelectedDate(e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              />
            </div>

            <button
              onClick={() => shiftDate(1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {!isToday && (
              <button
                onClick={() => {
                  triggerHaptic();
                  setSelectedDate(todayStr);
                }}
                className="px-2.5 py-2 text-xs font-semibold rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 whitespace-nowrap"
              >
                {t('today')}
              </button>
            )}
          </div>

          {/* Site Selector & Bulk Mark All Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 flex-1 sm:flex-initial">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
              <select
                value={selectedSiteId}
                onChange={(e) => {
                  triggerHaptic();
                  setSelectedSiteId(e.target.value);
                }}
                className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer w-full sm:w-auto"
              >
                <option value="all" className="bg-slate-900 text-white">
                  {t('allSites')} ({workers.length})
                </option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id} className="bg-slate-900 text-white">
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => markAllPresentToday(selectedSiteId)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-transform active:scale-95 whitespace-nowrap shrink-0"
            >
              <CheckCheck className="w-4 h-4" />
              <span>{t('markAllPresent')}</span>
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('searchWorker')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Daily Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-emerald-400 flex items-center justify-between">
            {t('present')}
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
              {dailyStats.presentCount}
            </span>
            <span className="text-[10px] text-slate-400">/ {filteredWorkers.length}</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-amber-400 flex items-center justify-between">
            {t('halfDay')}
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </span>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
              {dailyStats.halfDayCount}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-rose-400 flex items-center justify-between">
            {t('absent')}
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </span>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
              {dailyStats.absentCount}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-blue-400 flex items-center justify-between">
            {t('overtime')}
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </span>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
              {dailyStats.totalOt}
            </span>
            <span className="text-[11px] text-slate-400 ml-1">{t('hoursShort')}</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-amber-300">
            {t('totalTodayWage')}
          </span>
          <div className="mt-1 flex items-baseline">
            <span className="text-xs text-amber-400 mr-1">{settings.currency}</span>
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-amber-300">
              {dailyStats.totalWages.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Worker List Cards */}
      <div className="space-y-2">
        {filteredWorkers.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">{t('noWorkers')}</p>
          </div>
        ) : (
          filteredWorkers.map((worker) => {
            const record = attendanceMap.get(worker.id);
            const currentStatus = record?.status;
            const otHours = record?.overtimeHours || 0;
            const earnedToday = record?.dayWageCalculated || 0;
            const assignedSite = sites.find((s) => s.id === worker.siteId);

            return (
              <div
                key={worker.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3 sm:p-4 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Worker Info (clickable for details) */}
                  <div 
                    onClick={() => onOpenWorkerDetails(worker.id)}
                    className="flex items-center gap-3 cursor-pointer group flex-1"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl ${worker.avatarColor || 'bg-amber-600'} text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0`}
                    >
                      {worker.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                          {worker.name}
                        </h4>
                        {worker.urduName && (
                          <span className="text-xs text-slate-400 font-urdu hidden sm:inline" dir="rtl">
                            {worker.urduName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="text-amber-400/90 font-medium">{worker.role}</span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">
                          {settings.currency} {worker.dailyWage.toLocaleString()}/day
                        </span>
                        {assignedSite && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-[120px] text-slate-400">
                              {assignedSite.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Attendance Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 pt-2 sm:pt-0 border-t border-slate-800/80 sm:border-none">
                    {/* Present (P) */}
                    <button
                      onClick={() => setWorkerAttendance(worker.id, selectedDate, 'P', otHours)}
                      className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1 ${
                        currentStatus === 'P'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                      title="Present (Full Day)"
                    >
                      <span>P</span>
                      <span className="text-[10px] hidden md:inline">({t('present')})</span>
                    </button>

                    {/* Half Day (HD) */}
                    <button
                      onClick={() => setWorkerAttendance(worker.id, selectedDate, 'HD', otHours)}
                      className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1 ${
                        currentStatus === 'HD'
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                      title="Half Day (0.5)"
                    >
                      <span>HD</span>
                      <span className="text-[10px] hidden md:inline">({t('halfDay')})</span>
                    </button>

                    {/* Absent (A) */}
                    <button
                      onClick={() => setWorkerAttendance(worker.id, selectedDate, 'A', 0)}
                      className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1 ${
                        currentStatus === 'A'
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                      title="Absent (0)"
                    >
                      <span>A</span>
                      <span className="text-[10px] hidden md:inline">({t('absent')})</span>
                    </button>

                    {/* Overtime (OT) Dialog Trigger */}
                    <button
                      onClick={() => handleOpenOt(worker)}
                      className={`min-h-[44px] px-2.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center gap-1 border ${
                        otHours > 0
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                      title="Set Overtime Hours"
                    >
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{otHours > 0 ? `+${otHours}h` : 'OT'}</span>
                    </button>

                    {/* Today's Calculated Wage Indicator */}
                    <div className="text-right min-w-[70px] pl-1">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">{t('dayWage')}</div>
                      <div className="text-xs sm:text-sm font-bold font-mono tabular-nums text-amber-400">
                        {settings.currency} {earnedToday.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-note if present */}
                {record?.note && (
                  <div className="mt-2 text-[11px] text-slate-400 bg-slate-950/60 rounded-lg px-2.5 py-1 border border-slate-800/60 flex items-center gap-1.5">
                    <span className="text-amber-400/80 font-medium">{t('note')}:</span>
                    <span>{record.note}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Overtime Modal */}
      {otModalWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  {t('overtime')}
                </h3>
                <p className="text-xs text-slate-400">{otModalWorker.name}</p>
              </div>
              <button
                onClick={() => setOtModalWorker(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hours Stepper */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                {t('overtime')} ({t('hoursShort')})
              </label>
              <div className="flex items-center justify-center gap-4 bg-slate-950 border border-slate-800 rounded-2xl p-3">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setTempOtHours((prev) => Math.max(0, prev - 1));
                  }}
                  className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center active:scale-95"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="text-3xl font-extrabold font-mono tabular-nums text-white min-w-[60px] text-center">
                  {tempOtHours}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setTempOtHours((prev) => prev + 1);
                  }}
                  className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[1, 2, 3, 4].map((hr) => (
                  <button
                    key={hr}
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setTempOtHours(hr);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      tempOtHours === hr
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    +{hr} {t('hoursShort')}
                  </button>
                ))}
              </div>
            </div>

            {/* Overtime Pay Calculation */}
            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>{t('otRate')}:</span>
                <span className="font-mono tabular-nums text-white">
                  {settings.currency} {otModalWorker.overtimeHourlyRate} / hr
                </span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-800 pt-1 text-blue-400">
                <span>Total OT Pay:</span>
                <span className="font-mono tabular-nums">
                  {settings.currency} {(tempOtHours * otModalWorker.overtimeHourlyRate).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Note input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {t('note')} (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 2nd floor lintel casting"
                value={tempOtNote}
                onChange={(e) => setTempOtNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOtModalWorker(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveOt}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/30"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
