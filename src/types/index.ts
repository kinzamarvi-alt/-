export type WageType = 'daily' | 'monthly' | 'piece_rate';

export type AttendanceStatus = 'P' | 'A' | 'HD' | 'HL'; // Present, Absent, Half-Day, Holiday/Leave

export type WorkerRole = 
  | 'Raj Mistri (Mason)'
  | 'Mazdoor (Helper)'
  | 'Barhai (Carpenter)'
  | 'Electrician'
  | 'Plumber'
  | 'Painter'
  | 'Welder'
  | 'Tile Mistri'
  | 'Steel Fixer'
  | 'Supervisor'
  | 'Chowkidar'
  | 'Other';

export interface Worker {
  id: string;
  name: string;
  urduName?: string;
  phone: string;
  role: WorkerRole | string;
  wageType: WageType;
  dailyWage: number; // in currency (e.g. 1500)
  overtimeHourlyRate: number; // e.g. 200
  siteId?: string;
  cnicOrId?: string;
  joinDate: string;
  active: boolean;
  avatarColor?: string;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  overtimeHours: number; // 0, 1, 2...
  dayWageCalculated: number; // calculated day earnings
  siteId?: string;
  note?: string;
}

export type TransactionType = 'peshgi' | 'payment' | 'bonus' | 'deduction';

export interface Transaction {
  id: string;
  workerId: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  paymentMethod: 'Cash' | 'Easypaisa / JazzCash' | 'Bank Transfer';
  note?: string;
  siteId?: string;
}

export interface Site {
  id: string;
  name: string;
  location: string;
  active: boolean;
  createdAt: string;
}

export interface AppSettings {
  language: 'en' | 'ur' | 'roman';
  currency: string;
  businessName: string;
  supervisorName: string;
  supervisorPhone: string;
  standardWorkHours: number;
  autoOtRateMultiplier: number; // e.g. 1.25 or 1.0 (wage / 8 * multiplier)
  vibrationEnabled: boolean;
}

export interface WorkerSummary {
  worker: Worker;
  totalPresent: number;
  totalHalfDays: number;
  totalAbsent: number;
  totalHolidays: number;
  totalOtHours: number;
  grossEarned: number;
  totalPeshgi: number;
  totalPaid: number;
  netBalance: number; // grossEarned - (totalPeshgi + totalPaid)
}
