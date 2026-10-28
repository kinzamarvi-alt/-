import { Worker, Site, AttendanceRecord, Transaction, AppSettings } from '../types';

export const initialSites: Site[] = [
  {
    id: 'site-1',
    name: 'DHA Phase 6 Villa #42',
    location: 'Sector K, DHA Phase 6',
    active: true,
    createdAt: '2026-10-01'
  },
  {
    id: 'site-2',
    name: 'Gulberg Commercial Plaza',
    location: 'Main Boulevard, Gulberg III',
    active: true,
    createdAt: '2026-10-05'
  },
  {
    id: 'site-3',
    name: 'Farmhouse Bahria Enclave',
    location: 'Road 4, Agro Farms',
    active: true,
    createdAt: '2026-10-10'
  }
];

export const initialWorkers: Worker[] = [
  {
    id: 'w-1',
    name: 'Muhammad Aslam',
    urduName: 'محمد اسلم (راج مستری)',
    phone: '0300-8451293',
    role: 'Raj Mistri (Mason)',
    wageType: 'daily',
    dailyWage: 2200,
    overtimeHourlyRate: 275,
    siteId: 'site-1',
    cnicOrId: '35201-1984210-3',
    joinDate: '2026-09-01',
    active: true,
    avatarColor: 'bg-amber-600',
    notes: 'Head mistri for grey structure'
  },
  {
    id: 'w-2',
    name: 'Tariq Mahmood',
    urduName: 'طارق محمود (مزدور)',
    phone: '0312-4591024',
    role: 'Mazdoor (Helper)',
    wageType: 'daily',
    dailyWage: 1400,
    overtimeHourlyRate: 175,
    siteId: 'site-1',
    cnicOrId: '35202-8419201-7',
    joinDate: '2026-09-05',
    active: true,
    avatarColor: 'bg-emerald-600',
    notes: 'Concreting & brick helper'
  },
  {
    id: 'w-3',
    name: 'Rashid Ali',
    urduName: 'راشد علی (بڑھئی)',
    phone: '0345-7819033',
    role: 'Barhai (Carpenter)',
    wageType: 'daily',
    dailyWage: 2000,
    overtimeHourlyRate: 250,
    siteId: 'site-1',
    cnicOrId: '35201-4491023-1',
    joinDate: '2026-09-12',
    active: true,
    avatarColor: 'bg-blue-600',
    notes: 'Shuttering specialist'
  },
  {
    id: 'w-4',
    name: 'Khurram Shehzad',
    urduName: 'خرم شہزاد (الیکٹریشن)',
    phone: '0321-9988112',
    role: 'Electrician',
    wageType: 'daily',
    dailyWage: 2400,
    overtimeHourlyRate: 300,
    siteId: 'site-2',
    cnicOrId: '35202-6638192-5',
    joinDate: '2026-09-15',
    active: true,
    avatarColor: 'bg-indigo-600',
    notes: 'Conduit pipe layout'
  },
  {
    id: 'w-5',
    name: 'Bilal Ahmed',
    urduName: 'بلال احمد (ٹائل مستری)',
    phone: '0333-5182940',
    role: 'Tile Mistri',
    wageType: 'daily',
    dailyWage: 2300,
    overtimeHourlyRate: 280,
    siteId: 'site-2',
    cnicOrId: '35201-7718290-9',
    joinDate: '2026-09-20',
    active: true,
    avatarColor: 'bg-rose-600',
    notes: 'Porcelain & marble flooring'
  },
  {
    id: 'w-6',
    name: 'Ghulam Nabi',
    urduName: 'غلام نبی (مزدور)',
    phone: '0304-1234890',
    role: 'Mazdoor (Helper)',
    wageType: 'daily',
    dailyWage: 1400,
    overtimeHourlyRate: 175,
    siteId: 'site-2',
    cnicOrId: '35202-3349182-1',
    joinDate: '2026-10-01',
    active: true,
    avatarColor: 'bg-teal-600',
    notes: 'Material unloading'
  }
];

// Helper to format date string YYYY-MM-DD
function getDateString(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const initialAttendance: AttendanceRecord[] = [
  // Today's attendance
  {
    id: 'att-1-0',
    workerId: 'w-1',
    date: getDateString(0),
    status: 'P',
    overtimeHours: 2,
    dayWageCalculated: 2200 + (2 * 275),
    siteId: 'site-1',
    note: 'Slab beam alignment'
  },
  {
    id: 'att-2-0',
    workerId: 'w-2',
    date: getDateString(0),
    status: 'P',
    overtimeHours: 2,
    dayWageCalculated: 1400 + (2 * 175),
    siteId: 'site-1'
  },
  {
    id: 'att-3-0',
    workerId: 'w-3',
    date: getDateString(0),
    status: 'HD',
    overtimeHours: 0,
    dayWageCalculated: 1000,
    siteId: 'site-1',
    note: 'Left after lunch for wood procurement'
  },
  {
    id: 'att-4-0',
    workerId: 'w-4',
    date: getDateString(0),
    status: 'P',
    overtimeHours: 0,
    dayWageCalculated: 2400,
    siteId: 'site-2'
  },
  {
    id: 'att-5-0',
    workerId: 'w-5',
    date: getDateString(0),
    status: 'P',
    overtimeHours: 1,
    dayWageCalculated: 2300 + 280,
    siteId: 'site-2'
  },
  {
    id: 'att-6-0',
    workerId: 'w-6',
    date: getDateString(0),
    status: 'A',
    overtimeHours: 0,
    dayWageCalculated: 0,
    siteId: 'site-2',
    note: 'Family emergency'
  },

  // Yesterday (-1)
  {
    id: 'att-1-1',
    workerId: 'w-1',
    date: getDateString(-1),
    status: 'P',
    overtimeHours: 1,
    dayWageCalculated: 2200 + 275,
    siteId: 'site-1'
  },
  {
    id: 'att-2-1',
    workerId: 'w-2',
    date: getDateString(-1),
    status: 'P',
    overtimeHours: 1,
    dayWageCalculated: 1400 + 175,
    siteId: 'site-1'
  },
  {
    id: 'att-3-1',
    workerId: 'w-3',
    date: getDateString(-1),
    status: 'P',
    overtimeHours: 0,
    dayWageCalculated: 2000,
    siteId: 'site-1'
  },
  {
    id: 'att-4-1',
    workerId: 'w-4',
    date: getDateString(-1),
    status: 'P',
    overtimeHours: 2,
    dayWageCalculated: 2400 + (2 * 300),
    siteId: 'site-2'
  },
  {
    id: 'att-5-1',
    workerId: 'w-5',
    date: getDateString(-1),
    status: 'P',
    overtimeHours: 0,
    dayWageCalculated: 2300,
    siteId: 'site-2'
  },
  {
    id: 'att-6-1',
    workerId: 'w-6',
    date: getDateString(-1),
    status: 'P',
    overtimeHours: 0,
    dayWageCalculated: 1400,
    siteId: 'site-2'
  },

  // 2 days ago (-2)
  {
    id: 'att-1-2',
    workerId: 'w-1',
    date: getDateString(-2),
    status: 'P',
    overtimeHours: 0,
    dayWageCalculated: 2200,
    siteId: 'site-1'
  },
  {
    id: 'att-2-2',
    workerId: 'w-2',
    date: getDateString(-2),
    status: 'P',
    overtimeHours: 0,
    dayWageCalculated: 1400,
    siteId: 'site-1'
  },
  {
    id: 'att-3-2',
    workerId: 'w-3',
    date: getDateString(-2),
    status: 'P',
    overtimeHours: 3,
    dayWageCalculated: 2000 + (3 * 250),
    siteId: 'site-1'
  },
  {
    id: 'att-4-2',
    workerId: 'w-4',
    date: getDateString(-2),
    status: 'HD',
    overtimeHours: 0,
    dayWageCalculated: 1200,
    siteId: 'site-2'
  },
  {
    id: 'att-5-2',
    workerId: 'w-5',
    date: getDateString(-2),
    status: 'P',
    overtimeHours: 0,
    dayWageCalculated: 2300,
    siteId: 'site-2'
  },
  {
    id: 'att-6-2',
    workerId: 'w-6',
    date: getDateString(-2),
    status: 'P',
    overtimeHours: 0,
    dayWageCalculated: 1400,
    siteId: 'site-2'
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    workerId: 'w-1',
    date: getDateString(-3),
    type: 'peshgi',
    amount: 3000,
    paymentMethod: 'Cash',
    note: 'House rent advance',
    siteId: 'site-1'
  },
  {
    id: 'tx-2',
    workerId: 'w-2',
    date: getDateString(-4),
    type: 'peshgi',
    amount: 1500,
    paymentMethod: 'Easypaisa / JazzCash',
    note: 'Rashan peshgi',
    siteId: 'site-1'
  },
  {
    id: 'tx-3',
    workerId: 'w-3',
    date: getDateString(-5),
    type: 'payment',
    amount: 5000,
    paymentMethod: 'Cash',
    note: 'Weekly wage clearance',
    siteId: 'site-1'
  },
  {
    id: 'tx-4',
    workerId: 'w-4',
    date: getDateString(-2),
    type: 'peshgi',
    amount: 2000,
    paymentMethod: 'Cash',
    note: 'Tool repair advance',
    siteId: 'site-2'
  },
  {
    id: 'tx-5',
    workerId: 'w-5',
    date: getDateString(-1),
    type: 'peshgi',
    amount: 1000,
    paymentMethod: 'Cash',
    note: 'Medical medicine',
    siteId: 'site-2'
  }
];

export const initialSettings: AppSettings = {
  language: 'en',
  currency: 'Rs.',
  businessName: 'Al-Madina Builders & Contractors',
  supervisorName: 'Chaudhry Akram (Thekedar)',
  supervisorPhone: '0300-5551234',
  standardWorkHours: 8,
  autoOtRateMultiplier: 1.0,
  vibrationEnabled: true
};
