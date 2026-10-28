import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Worker, 
  Site, 
  AttendanceRecord, 
  Transaction, 
  AppSettings, 
  WorkerSummary, 
  AttendanceStatus 
} from '../types';
import { 
  initialWorkers, 
  initialSites, 
  initialAttendance, 
  initialTransactions, 
  initialSettings 
} from '../data/initialData';
import { translations, TranslationKey } from '../data/translations';

interface KhataContextType {
  workers: Worker[];
  sites: Site[];
  attendance: AttendanceRecord[];
  transactions: Transaction[];
  settings: AppSettings;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedSiteId: string;
  setSelectedSiteId: (siteId: string) => void;
  
  // Actions
  addWorker: (worker: Omit<Worker, 'id'>) => void;
  updateWorker: (worker: Worker) => void;
  deleteWorker: (id: string) => void;
  
  setWorkerAttendance: (
    workerId: string, 
    date: string, 
    status: AttendanceStatus, 
    overtimeHours?: number, 
    note?: string
  ) => void;
  markAllPresentToday: (siteId?: string) => void;
  
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  
  addSite: (site: Omit<Site, 'id' | 'createdAt'>) => void;
  updateSite: (site: Site) => void;
  deleteSite: (id: string) => void;
  
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  getWorkerSummary: (workerId: string, startDate?: string, endDate?: string) => WorkerSummary | null;
  getSiteSummary: (siteId: string) => { workerCount: number; todayWage: number; totalAdvances: number };
  
  resetToDemoData: () => void;
  exportBackupJson: () => string;
  importBackupJson: (jsonData: string) => boolean;
  exportCsvSummary: () => void;
  
  // Translation & feedback
  t: (key: TranslationKey) => string;
  triggerHaptic: () => void;
}

const KhataContext = createContext<KhataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WORKERS: 'mazdoor_khata_workers_v1',
  SITES: 'mazdoor_khata_sites_v1',
  ATTENDANCE: 'mazdoor_khata_attendance_v1',
  TRANSACTIONS: 'mazdoor_khata_transactions_v1',
  SETTINGS: 'mazdoor_khata_settings_v1',
};

export const KhataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initial defaults
  const [workers, setWorkers] = useState<Worker[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WORKERS);
      return saved ? JSON.parse(saved) : initialWorkers;
    } catch {
      return initialWorkers;
    }
  });

  const [sites, setSites] = useState<Site[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SITES);
      return saved ? JSON.parse(saved) : initialSites;
    } catch {
      return initialSites;
    }
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return saved ? JSON.parse(saved) : initialAttendance;
    } catch {
      return initialAttendance;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...initialSettings, ...JSON.parse(saved) } : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(sites));
  }, [sites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Haptic feedback function for mobile apps
  const triggerHaptic = () => {
    if (settings.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch {
        // ignore if not permitted
      }
    }
  };

  // Translation helper
  const t = (key: TranslationKey): string => {
    const lang = settings.language || 'en';
    const dict = translations[lang] || translations.en;
    return dict[key] || translations.en[key] || key;
  };

  // Calculate day wage based on status & overtime
  const calculateDayWage = (worker: Worker, status: AttendanceStatus, otHours: number = 0): number => {
    let base = 0;
    if (status === 'P' || status === 'HL') {
      base = worker.dailyWage;
    } else if (status === 'HD') {
      base = Math.round(worker.dailyWage / 2);
    } else {
      base = 0;
    }
    const otWage = (otHours || 0) * (worker.overtimeHourlyRate || 0);
    return base + otWage;
  };

  // Mark/update attendance
  const setWorkerAttendance = (
    workerId: string, 
    date: string, 
    status: AttendanceStatus, 
    overtimeHours: number = 0, 
    note?: string
  ) => {
    triggerHaptic();
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return;

    const dayWage = calculateDayWage(worker, status, overtimeHours);

    setAttendance(prev => {
      const existingIndex = prev.findIndex(a => a.workerId === workerId && a.date === date);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status,
          overtimeHours,
          dayWageCalculated: dayWage,
          siteId: worker.siteId,
          note: note !== undefined ? note : updated[existingIndex].note
        };
        return updated;
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          workerId,
          date,
          status,
          overtimeHours,
          dayWageCalculated: dayWage,
          siteId: worker.siteId,
          note
        };
        return [newRecord, ...prev];
      }
    });
  };

  // Mark all active workers present for the chosen date
  const markAllPresentToday = (siteId?: string) => {
    triggerHaptic();
    const targetWorkers = workers.filter(w => {
      if (!w.active) return false;
      if (siteId && siteId !== 'all') {
        return w.siteId === siteId;
      }
      return true;
    });

    setAttendance(prev => {
      const newMap = new Map<string, AttendanceRecord>();
      prev.forEach(r => newMap.set(`${r.workerId}_${r.date}`, r));

      targetWorkers.forEach(worker => {
        const key = `${worker.id}_${selectedDate}`;
        const existing = newMap.get(key);
        const otHours = existing ? existing.overtimeHours : 0;
        const dayWage = calculateDayWage(worker, 'P', otHours);

        newMap.set(key, {
          id: existing ? existing.id : `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          workerId: worker.id,
          date: selectedDate,
          status: 'P',
          overtimeHours: otHours,
          dayWageCalculated: dayWage,
          siteId: worker.siteId,
          note: existing?.note
        });
      });

      return Array.from(newMap.values());
    });
  };

  // Worker CRUD
  const addWorker = (workerData: Omit<Worker, 'id'>) => {
    triggerHaptic();
    const colors = [
      'bg-amber-600', 'bg-emerald-600', 'bg-blue-600', 
      'bg-indigo-600', 'bg-rose-600', 'bg-teal-600', 
      'bg-cyan-600', 'bg-violet-600'
    ];
    const newWorker: Worker = {
      ...workerData,
      id: `w-${Date.now()}`,
      avatarColor: workerData.avatarColor || colors[Math.floor(Math.random() * colors.length)]
    };
    setWorkers(prev => [newWorker, ...prev]);
  };

  const updateWorker = (updated: Worker) => {
    triggerHaptic();
    setWorkers(prev => prev.map(w => w.id === updated.id ? updated : w));
  };

  const deleteWorker = (id: string) => {
    triggerHaptic();
    setWorkers(prev => prev.filter(w => w.id !== id));
    setAttendance(prev => prev.filter(a => a.workerId !== id));
    setTransactions(prev => prev.filter(t => t.workerId !== id));
  };

  // Transaction CRUD
  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    triggerHaptic();
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    triggerHaptic();
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Site CRUD
  const addSite = (siteData: Omit<Site, 'id' | 'createdAt'>) => {
    triggerHaptic();
    const newSite: Site = {
      ...siteData,
      id: `site-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSites(prev => [...prev, newSite]);
  };

  const updateSite = (updated: Site) => {
    triggerHaptic();
    setSites(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const deleteSite = (id: string) => {
    triggerHaptic();
    setSites(prev => prev.filter(s => s.id !== id));
    // Unassign workers from this site
    setWorkers(prev => prev.map(w => w.siteId === id ? { ...w, siteId: undefined } : w));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    triggerHaptic();
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Worker Financial & Attendance Summary
  const getWorkerSummary = (workerId: string, startDate?: string, endDate?: string): WorkerSummary | null => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return null;

    let workerAtt = attendance.filter(a => a.workerId === workerId);
    let workerTxs = transactions.filter(t => t.workerId === workerId);

    if (startDate) {
      workerAtt = workerAtt.filter(a => a.date >= startDate);
      workerTxs = workerTxs.filter(t => t.date >= startDate);
    }
    if (endDate) {
      workerAtt = workerAtt.filter(a => a.date <= endDate);
      workerTxs = workerTxs.filter(t => t.date <= endDate);
    }

    let totalPresent = 0;
    let totalHalfDays = 0;
    let totalAbsent = 0;
    let totalHolidays = 0;
    let totalOtHours = 0;
    let grossEarned = 0;

    workerAtt.forEach(att => {
      if (att.status === 'P') totalPresent += 1;
      else if (att.status === 'HD') totalHalfDays += 1;
      else if (att.status === 'A') totalAbsent += 1;
      else if (att.status === 'HL') totalHolidays += 1;

      totalOtHours += (att.overtimeHours || 0);
      grossEarned += (att.dayWageCalculated || 0);
    });

    let totalPeshgi = 0;
    let totalPaid = 0;

    workerTxs.forEach(tx => {
      if (tx.type === 'peshgi') {
        totalPeshgi += tx.amount;
      } else if (tx.type === 'payment') {
        totalPaid += tx.amount;
      } else if (tx.type === 'bonus') {
        grossEarned += tx.amount;
      } else if (tx.type === 'deduction') {
        totalPeshgi += tx.amount; // acts as deduction from payable
      }
    });

    const netBalance = grossEarned - (totalPeshgi + totalPaid);

    return {
      worker,
      totalPresent,
      totalHalfDays,
      totalAbsent,
      totalHolidays,
      totalOtHours,
      grossEarned,
      totalPeshgi,
      totalPaid,
      netBalance
    };
  };

  const getSiteSummary = (siteId: string) => {
    const siteWorkers = workers.filter(w => w.siteId === siteId);
    const todayAtt = attendance.filter(a => {
      if (a.date !== selectedDate) return false;
      const worker = workers.find(w => w.id === a.workerId);
      return worker?.siteId === siteId;
    });

    const todayWage = todayAtt.reduce((sum, a) => sum + (a.dayWageCalculated || 0), 0);
    const siteTxs = transactions.filter(t => {
      const worker = workers.find(w => w.id === t.workerId);
      return worker?.siteId === siteId && t.type === 'peshgi';
    });
    const totalAdvances = siteTxs.reduce((sum, t) => sum + t.amount, 0);

    return {
      workerCount: siteWorkers.length,
      todayWage,
      totalAdvances
    };
  };

  // Reset to initial demo data
  const resetToDemoData = () => {
    triggerHaptic();
    setWorkers(initialWorkers);
    setSites(initialSites);
    setAttendance(initialAttendance);
    setTransactions(initialTransactions);
    setSettings(initialSettings);
  };

  // Backup & Restore
  const exportBackupJson = (): string => {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      workers,
      sites,
      attendance,
      transactions,
      settings
    };
    return JSON.stringify(data, null, 2);
  };

  const importBackupJson = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data && Array.isArray(data.workers)) {
        setWorkers(data.workers);
        if (Array.isArray(data.sites)) setSites(data.sites);
        if (Array.isArray(data.attendance)) setAttendance(data.attendance);
        if (Array.isArray(data.transactions)) setTransactions(data.transactions);
        if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
        triggerHaptic();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const exportCsvSummary = () => {
    triggerHaptic();
    const rows = [
      ['Worker ID', 'Name', 'Role', 'Phone', 'Wage Type', 'Daily Rate', 'Presents', 'Half Days', 'Absent', 'OT Hours', 'Gross Earned', 'Peshgi Taken', 'Paid Out', 'Net Balance']
    ];

    workers.forEach(w => {
      const sum = getWorkerSummary(w.id);
      if (sum) {
        rows.push([
          w.id,
          w.name,
          w.role,
          w.phone,
          w.wageType,
          w.dailyWage.toString(),
          sum.totalPresent.toString(),
          sum.totalHalfDays.toString(),
          sum.totalAbsent.toString(),
          sum.totalOtHours.toString(),
          sum.grossEarned.toString(),
          sum.totalPeshgi.toString(),
          sum.totalPaid.toString(),
          sum.netBalance.toString()
        ]);
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mazdoor_khata_summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <KhataContext.Provider
      value={{
        workers,
        sites,
        attendance,
        transactions,
        settings,
        selectedDate,
        setSelectedDate,
        selectedSiteId,
        setSelectedSiteId,
        addWorker,
        updateWorker,
        deleteWorker,
        setWorkerAttendance,
        markAllPresentToday,
        addTransaction,
        deleteTransaction,
        addSite,
        updateSite,
        deleteSite,
        updateSettings,
        getWorkerSummary,
        getSiteSummary,
        resetToDemoData,
        exportBackupJson,
        importBackupJson,
        exportCsvSummary,
        t,
        triggerHaptic
      }}
    >
      {children}
    </KhataContext.Provider>
  );
};

export const useKhata = () => {
  const context = useContext(KhataContext);
  if (!context) {
    throw new Error('useKhata must be used within a KhataProvider');
  }
  return context;
};
