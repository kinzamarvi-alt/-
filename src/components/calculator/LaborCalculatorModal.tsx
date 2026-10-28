import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import { X, Calculator, Users, Clock, Split } from 'lucide-react';

interface LaborCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LaborCalculatorModal: React.FC<LaborCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, t, triggerHaptic } = useKhata();

  const [calcTab, setCalcTab] = useState<'wage' | 'split'>('wage');

  // Wage & OT state
  const [dailyRate, setDailyRate] = useState<number>(1800);
  const [daysWorked, setDaysWorked] = useState<number>(6);
  const [halfDays, setHalfDays] = useState<number>(1);
  const [otHours, setOtHours] = useState<number>(8);
  const [workHoursPerDay, setWorkHoursPerDay] = useState<number>(settings.standardWorkHours || 8);

  // Contract Splitter state
  const [totalContract, setTotalContract] = useState<number>(50000);
  const [numMistris, setNumMistris] = useState<number>(2);
  const [numHelpers, setNumHelpers] = useState<number>(4);
  const [mistriRatio, setMistriRatio] = useState<number>(1.5); // Mistri gets 1.5x of helper

  // Wage calculation
  const hourlyRate = Math.round(dailyRate / (workHoursPerDay || 8));
  const baseEarnings = (daysWorked * dailyRate) + (halfDays * Math.round(dailyRate / 2));
  const otEarnings = otHours * hourlyRate;
  const totalEarned = baseEarnings + otEarnings;

  // Split calculation
  // Total units = (numMistris * mistriRatio) + (numHelpers * 1.0)
  const totalWeight = (numMistris * mistriRatio) + (numHelpers * 1.0);
  const unitShare = totalWeight > 0 ? totalContract / totalWeight : 0;
  const mistriShare = Math.round(unitShare * mistriRatio);
  const helperShare = Math.round(unitShare);
  const totalDistributed = (mistriShare * numMistris) + (helperShare * numHelpers);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('quickCalc')}</h3>
              <p className="text-xs text-slate-400">Tactile wage, OT, and contract split calculations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-5 pt-4">
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                triggerHaptic();
                setCalcTab('wage');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                calcTab === 'wage'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Dihaari &amp; Overtime</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic();
                setCalcTab('split');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                calcTab === 'split'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>Theka (Contract) Splitter</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Wage & Overtime Calculator */}
        {calcTab === 'wage' && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Daily Wage ({settings.currency})
                </label>
                <input
                  type="number"
                  step="50"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Work Hours / Day
                </label>
                <input
                  type="number"
                  value={workHoursPerDay}
                  onChange={(e) => setWorkHoursPerDay(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Days</label>
                <input
                  type="number"
                  value={daysWorked}
                  onChange={(e) => setDaysWorked(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Half Days</label>
                <input
                  type="number"
                  value={halfDays}
                  onChange={(e) => setHalfDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">OT Hours</label>
                <input
                  type="number"
                  value={otHours}
                  onChange={(e) => setOtHours(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-white"
                />
              </div>
            </div>

            {/* Result Breakdown Card */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/90 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Hourly OT Rate:</span>
                <span className="font-mono text-white">
                  {settings.currency} {hourlyRate} / hr
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Base Wage:</span>
                <span className="font-mono text-white">
                  {settings.currency} {baseEarnings.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-blue-400">
                <span>Overtime Pay ({otHours}h):</span>
                <span className="font-mono font-bold">
                  +{settings.currency} {otEarnings.toLocaleString()}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-200">Total Wage:</span>
                <span className="text-2xl font-extrabold font-mono tabular-nums text-amber-400">
                  {settings.currency} {totalEarned.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Contract (Theka) Splitter */}
        {calcTab === 'split' && (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('totalContractAmount')} ({settings.currency})
              </label>
              <input
                type="number"
                step="1000"
                value={totalContract}
                onChange={(e) => setTotalContract(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-lg font-mono font-extrabold text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mistris / Masons Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={numMistris}
                  onChange={(e) => setNumMistris(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Helpers / Mazdoor Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={numHelpers}
                  onChange={(e) => setNumHelpers(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mistri-to-Helper Wage Ratio (Default 1.5x)
              </label>
              <div className="flex items-center gap-2">
                {[1.0, 1.25, 1.5, 1.75, 2.0].map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setMistriRatio(ratio);
                    }}
                    className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                      mistriRatio === ratio
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {ratio}x
                  </button>
                ))}
              </div>
            </div>

            {/* Split Distribution Result */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/90 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-white font-bold block">Each Mistri Share ({numMistris} total):</span>
                  <span className="text-[10px] text-slate-400">Ratio: {mistriRatio}x</span>
                </div>
                <div className="text-base font-extrabold font-mono tabular-nums text-amber-400">
                  {settings.currency} {mistriShare.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <div>
                  <span className="text-white font-bold block">Each Helper Share ({numHelpers} total):</span>
                  <span className="text-[10px] text-slate-400">Ratio: 1.0x</span>
                </div>
                <div className="text-base font-extrabold font-mono tabular-nums text-emerald-400">
                  {settings.currency} {helperShare.toLocaleString()}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                <span>Total Accounted:</span>
                <span className="font-mono text-white font-semibold">
                  {settings.currency} {totalDistributed.toLocaleString()} / {totalContract.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
