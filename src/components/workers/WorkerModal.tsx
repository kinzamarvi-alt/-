import React, { useState, useEffect } from 'react';
import { useKhata } from '../../context/KhataContext';
import { Worker, WorkerRole, WageType } from '../../types';
import { X, UserPlus, HardHat, DollarSign } from 'lucide-react';

interface WorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerToEdit?: Worker | null;
}

const COMMON_ROLES: WorkerRole[] = [
  'Raj Mistri (Mason)',
  'Mazdoor (Helper)',
  'Barhai (Carpenter)',
  'Electrician',
  'Plumber',
  'Painter',
  'Tile Mistri',
  'Welder',
  'Steel Fixer',
  'Supervisor',
  'Chowkidar',
  'Other'
];

export const WorkerModal: React.FC<WorkerModalProps> = ({
  isOpen,
  onClose,
  workerToEdit,
}) => {
  const { addWorker, updateWorker, sites, settings, t, triggerHaptic } = useKhata();

  const [name, setName] = useState('');
  const [urduName, setUrduName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<string>('Raj Mistri (Mason)');
  const [customRole, setCustomRole] = useState('');
  const [wageType, setWageType] = useState<WageType>('daily');
  const [dailyWage, setDailyWage] = useState<number>(1800);
  const [overtimeHourlyRate, setOvertimeHourlyRate] = useState<number>(225);
  const [siteId, setSiteId] = useState<string>('');
  const [cnicOrId, setCnicOrId] = useState('');
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (workerToEdit) {
      setName(workerToEdit.name);
      setUrduName(workerToEdit.urduName || '');
      setPhone(workerToEdit.phone);
      if (COMMON_ROLES.includes(workerToEdit.role as WorkerRole)) {
        setRole(workerToEdit.role);
        setCustomRole('');
      } else {
        setRole('Other');
        setCustomRole(workerToEdit.role);
      }
      setWageType(workerToEdit.wageType);
      setDailyWage(workerToEdit.dailyWage);
      setOvertimeHourlyRate(workerToEdit.overtimeHourlyRate);
      setSiteId(workerToEdit.siteId || '');
      setCnicOrId(workerToEdit.cnicOrId || '');
      setNotes(workerToEdit.notes || '');
      setActive(workerToEdit.active);
    } else {
      // Defaults for new worker
      setName('');
      setUrduName('');
      setPhone('');
      setRole('Mazdoor (Helper)');
      setCustomRole('');
      setWageType('daily');
      setDailyWage(1500);
      setOvertimeHourlyRate(185);
      setSiteId(sites[0]?.id || '');
      setCnicOrId('');
      setNotes('');
      setActive(true);
    }
  }, [workerToEdit, sites, isOpen]);

  // Auto calculate OT rate when daily wage changes
  const handleDailyWageChange = (val: number) => {
    setDailyWage(val);
    const calculatedOt = Math.round((val / (settings.standardWorkHours || 8)) * (settings.autoOtRateMultiplier || 1.0));
    setOvertimeHourlyRate(calculatedOt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalRole = role === 'Other' && customRole.trim() ? customRole.trim() : role;

    if (workerToEdit) {
      updateWorker({
        ...workerToEdit,
        name: name.trim(),
        urduName: urduName.trim() || undefined,
        phone: phone.trim(),
        role: finalRole,
        wageType,
        dailyWage: Number(dailyWage) || 0,
        overtimeHourlyRate: Number(overtimeHourlyRate) || 0,
        siteId: siteId || undefined,
        cnicOrId: cnicOrId.trim() || undefined,
        notes: notes.trim() || undefined,
        active,
      });
    } else {
      addWorker({
        name: name.trim(),
        urduName: urduName.trim() || undefined,
        phone: phone.trim(),
        role: finalRole,
        wageType,
        dailyWage: Number(dailyWage) || 0,
        overtimeHourlyRate: Number(overtimeHourlyRate) || 0,
        siteId: siteId || undefined,
        cnicOrId: cnicOrId.trim() || undefined,
        notes: notes.trim() || undefined,
        joinDate: new Date().toISOString().split('T')[0],
        active: true,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {workerToEdit ? t('editWorker') : t('addWorker')}
              </h3>
              <p className="text-xs text-slate-400">
                {workerToEdit ? workerToEdit.name : 'Enter worker wage details and role'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Name & Urdu Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Muhammad Aslam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 font-urdu" dir="rtl">
                نام اردو میں (اختیاری)
              </label>
              <input
                type="text"
                dir="rtl"
                placeholder="مثال: محمد اسلم"
                value={urduName}
                onChange={(e) => setUrduName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none font-urdu"
              />
            </div>
          </div>

          {/* Phone & ID / CNIC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('phone')}
              </label>
              <input
                type="tel"
                placeholder="0300-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('cnicOrId')}
              </label>
              <input
                type="text"
                placeholder="35201-1234567-1"
                value={cnicOrId}
                onChange={(e) => setCnicOrId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none font-mono text-xs"
              />
            </div>
          </div>

          {/* Role & Site */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('role')}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
              >
                {COMMON_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {role === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify role..."
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="mt-2 w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('site')}
              </label>
              <select
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
              >
                <option value="">-- No Assigned Site --</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Wage Type & Rates */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Wage Configuration
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setWageType('daily')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                    wageType === 'daily'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('daily')}
                </button>
                <button
                  type="button"
                  onClick={() => setWageType('monthly')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                    wageType === 'monthly'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('monthly')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  {wageType === 'daily' ? t('dailyRate') : t('monthlyRate')} ({settings.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={dailyWage || ''}
                  onChange={(e) => handleDailyWageChange(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-sm font-bold font-mono tabular-nums text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  {t('otRate')} ({settings.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={overtimeHourlyRate || ''}
                  onChange={(e) => setOvertimeHourlyRate(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-sm font-bold font-mono tabular-nums text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('note')}
            </label>
            <input
              type="text"
              placeholder="e.g. Recommended by Master Akram, skilled in tile cutting"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          {/* Active status toggle for existing workers */}
          {workerToEdit && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-semibold text-slate-300">Worker Status</span>
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  active
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {active ? t('active') : t('inactive')}
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
            >
              {workerToEdit ? t('save') : t('addWorker')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
