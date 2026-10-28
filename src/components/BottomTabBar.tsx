import React from 'react';
import { useKhata } from '../context/KhataContext';
import { CalendarCheck, Users, WalletCards, Building2, FileText } from 'lucide-react';

interface BottomTabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, setActiveTab }) => {
  const { t, triggerHaptic } = useKhata();

  const tabs = [
    { id: 'attendance', label: t('attendance'), icon: CalendarCheck },
    { id: 'workers', label: t('workers'), icon: Users },
    { id: 'khata', label: t('khata'), icon: WalletCards },
    { id: 'sites', label: t('sites'), icon: Building2 },
    { id: 'reports', label: t('reports'), icon: FileText },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 pb-safe shadow-2xl">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic();
                setActiveTab(tab.id);
              }}
              className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center py-1 transition-all active:scale-95"
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'text-amber-400 bg-amber-500/15' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span
                className={`text-[10px] font-semibold tracking-tight mt-0.5 truncate max-w-[64px] ${
                  isActive ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
