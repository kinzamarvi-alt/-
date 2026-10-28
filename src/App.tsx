import React, { useState } from 'react';
import { KhataProvider, useKhata } from './context/KhataContext';
import { TopNav } from './components/TopNav';
import { BottomTabBar } from './components/BottomTabBar';
import { AttendanceView } from './components/attendance/AttendanceView';
import { WorkersView } from './components/workers/WorkersView';
import { KhataLedgerView } from './components/khata/KhataLedgerView';
import { SitesView } from './components/sites/SitesView';
import { WorkerModal } from './components/workers/WorkerModal';
import { WorkerDetailModal } from './components/workers/WorkerDetailModal';
import { AddTransactionModal } from './components/khata/AddTransactionModal';
import { SlipGeneratorModal } from './components/slips/SlipGeneratorModal';
import { LaborCalculatorModal } from './components/calculator/LaborCalculatorModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner';
import { Worker, TransactionType } from './types';

function MainApp() {
  const { setSelectedSiteId } = useKhata();

  const [activeTab, setActiveTab] = useState<string>('attendance');

  // Modals state
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [workerToEdit, setWorkerToEdit] = useState<Worker | null>(null);

  const [selectedWorkerDetailId, setSelectedWorkerDetailId] = useState<string | null>(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [txDefaultWorkerId, setTxDefaultWorkerId] = useState<string | null>(null);
  const [txDefaultType, setTxDefaultType] = useState<TransactionType>('peshgi');

  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [slipWorkerId, setSlipWorkerId] = useState<string | null>(null);

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Handlers
  const handleOpenAddWorker = () => {
    setWorkerToEdit(null);
    setIsWorkerModalOpen(true);
  };

  const handleOpenEditWorker = (worker: Worker) => {
    setWorkerToEdit(worker);
    setIsWorkerModalOpen(true);
  };

  const handleOpenAddTransaction = (
    workerId?: string,
    type: TransactionType = 'peshgi'
  ) => {
    setTxDefaultWorkerId(workerId || null);
    setTxDefaultType(type);
    setIsTransactionModalOpen(true);
  };

  const handleOpenSlip = (workerId?: string) => {
    setSlipWorkerId(workerId || null);
    setIsSlipModalOpen(true);
  };

  const handleSelectSiteForAttendance = (siteId: string) => {
    setSelectedSiteId(siteId);
    setActiveTab('attendance');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Bar following Top Bar Contract */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* PWA Mobile Installation Banner */}
      <PWAInstallBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {activeTab === 'attendance' && (
          <AttendanceView
            onOpenWorkerDetails={(id) => setSelectedWorkerDetailId(id)}
            onOpenSlip={(id) => handleOpenSlip(id)}
          />
        )}

        {activeTab === 'workers' && (
          <WorkersView
            onAddWorker={handleOpenAddWorker}
            onOpenWorkerDetails={(id) => setSelectedWorkerDetailId(id)}
            onAddTransaction={(id, type) => handleOpenAddTransaction(id, type)}
            onOpenSlip={(id) => handleOpenSlip(id)}
          />
        )}

        {activeTab === 'khata' && (
          <KhataLedgerView
            onOpenAddTransaction={(type) => handleOpenAddTransaction(undefined, type)}
            onOpenWorkerDetails={(id) => setSelectedWorkerDetailId(id)}
          />
        )}

        {activeTab === 'sites' && (
          <SitesView
            onSelectSiteForAttendance={handleSelectSiteForAttendance}
          />
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4 max-w-2xl mx-auto pb-24 md:pb-12 text-center pt-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Mazdoor Wage Slips &amp; WhatsApp Parchis</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
                  Generate official bilingual attendance and wage settlement receipts ready to send directly to workers on WhatsApp or print for signatures.
                </p>
              </div>
              <button
                onClick={() => handleOpenSlip()}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-transform active:scale-95 inline-flex items-center gap-2"
              >
                <span>Generate Wage Slip Now</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals & Dialogs */}
      <WorkerModal
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        workerToEdit={workerToEdit}
      />

      <WorkerDetailModal
        workerId={selectedWorkerDetailId}
        onClose={() => setSelectedWorkerDetailId(null)}
        onEditWorker={(worker) => {
          setSelectedWorkerDetailId(null);
          handleOpenEditWorker(worker);
        }}
        onAddTransactionForWorker={(id, type) => handleOpenAddTransaction(id, type)}
        onOpenSlip={(id) => handleOpenSlip(id)}
      />

      <AddTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        defaultWorkerId={txDefaultWorkerId}
        defaultType={txDefaultType}
      />

      <SlipGeneratorModal
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        defaultWorkerId={slipWorkerId}
      />

      <LaborCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <KhataProvider>
      <MainApp />
    </KhataProvider>
  );
}
