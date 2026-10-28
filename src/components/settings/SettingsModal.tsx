import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import { 
  X, 
  Settings, 
  Globe, 
  Download, 
  Upload, 
  RotateCcw, 
  FileSpreadsheet, 
  Smartphone,
  HardHat,
  Check
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    settings, 
    updateSettings, 
    resetToDemoData, 
    exportBackupJson, 
    importBackupJson, 
    exportCsvSummary,
    t,
    triggerHaptic 
  } = useKhata();

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [supervisorName, setSupervisorName] = useState(settings.supervisorName);
  const [supervisorPhone, setSupervisorPhone] = useState(settings.supervisorPhone);
  const [currency, setCurrency] = useState(settings.currency);
  const [language, setLanguage] = useState(settings.language);
  const [standardWorkHours, setStandardWorkHours] = useState(settings.standardWorkHours);
  const [vibrationEnabled, setVibrationEnabled] = useState(settings.vibrationEnabled);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName: businessName.trim(),
      supervisorName: supervisorName.trim(),
      supervisorPhone: supervisorPhone.trim(),
      currency,
      language,
      standardWorkHours: Number(standardWorkHours) || 8,
      vibrationEnabled,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDownloadBackup = () => {
    triggerHaptic();
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mazdoor_khata_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJson(content);
      if (success) {
        alert('Backup restored successfully!');
        onClose();
      } else {
        alert('Failed to parse backup JSON. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Reset everything back to the initial sample contractor data?')) {
      resetToDemoData();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('settings')}</h3>
              <p className="text-xs text-slate-400">Language, currency, business profile, and backups</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Language Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('language')} (زبان)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'en', label: 'English' },
                { id: 'ur', label: 'اردو (Urdu)' },
                { id: 'roman', label: 'Roman Urdu' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setLanguage(lang.id as any);
                  }}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-colors ${
                    language === lang.id
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Business & Contractor Info */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('businessDetails')}
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Al-Madina Builders & Contractors"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supervisor / Thekedar Name
                </label>
                <input
                  type="text"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  placeholder="e.g. Master Akram"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contact Phone for Wage Slips
                </label>
                <input
                  type="tel"
                  value={supervisorPhone}
                  onChange={(e) => setSupervisorPhone(e.target.value)}
                  placeholder="0300-5551234"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Currency & Work Day Hours */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('currency')} Symbol
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Rs.">Rs. (Rupees)</option>
                <option value="PKR">PKR (Pakistani Rupee)</option>
                <option value="INR">INR (Indian Rupee)</option>
                <option value="AED">AED (Dirham)</option>
                <option value="SAR">SAR (Riyal)</option>
                <option value="$">$ (USD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Standard Day Hours
              </label>
              <input
                type="number"
                min="4"
                max="16"
                value={standardWorkHours}
                onChange={(e) => setStandardWorkHours(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Mobile Haptic Vibration Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs font-semibold text-slate-300 block">
                  Haptic Touch Feedback
                </span>
                <span className="text-[10px] text-slate-500">
                  Vibrate on marking attendance and saving records
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setVibrationEnabled(!vibrationEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                vibrationEnabled ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  vibrationEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Backup & Export Controls */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
              Data Management &amp; Backup
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>JSON Backup</span>
              </button>

              <button
                type="button"
                onClick={exportCsvSummary}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Excel / CSV</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <label className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-slate-500 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>Restore JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-medium text-rose-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-3 border-t border-slate-800">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t('savedSuccessfully')}</span>
                </>
              ) : (
                <span>{t('save')} Settings</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
