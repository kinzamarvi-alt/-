import React from 'react';
import { useKhata } from '../context/KhataContext';
import { Calculator, Settings, Download, Globe, HardHat } from 'lucide-react';

interface TopNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCalculator: () => void;
  onOpenSettings: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenCalculator,
  onOpenSettings,
}) => {
  const { settings, updateSettings, t, triggerHaptic } = useKhata();

  const cycleLanguage = () => {
    triggerHaptic();
    const nextLang = settings.language === 'en' ? 'ur' : settings.language === 'ur' ? 'roman' : 'en';
    updateSettings({ language: nextLang });
  };

  const getLangBadge = () => {
    if (settings.language === 'ur') return 'اردو';
    if (settings.language === 'roman') return 'Roman';
    return 'EN';
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                Mazdoor Khata
              </span>
              <span className="text-xs text-amber-400/90 font-medium font-urdu" dir="rtl">
                مزدور کھاتہ
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-xs">
              {settings.businessName || 'Contractor Labor & Attendance Ledger'}
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {[
            { id: 'attendance', label: t('attendance') },
            { id: 'workers', label: t('workers') },
            { id: 'khata', label: t('khata') },
            { id: 'sites', label: t('sites') },
            { id: 'reports', label: t('reports') },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  triggerHaptic();
                  setActiveTab(item.id);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Quick utilities (Language toggle, Calculator, Settings) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 1-tap Language Switcher */}
          <button
            onClick={cycleLanguage}
            title="Switch Language: English / اردو / Roman"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 transition-colors shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-[11px]">{getLangBadge()}</span>
          </button>

          {/* Quick Labor Calculator */}
          <button
            onClick={() => {
              triggerHaptic();
              onOpenCalculator();
            }}
            title={t('calculator')}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
          >
            <Calculator className="w-4 h-4 text-amber-400" />
          </button>

          {/* Settings Modal */}
          <button
            onClick={() => {
              triggerHaptic();
              onOpenSettings();
            }}
            title={t('settings')}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
