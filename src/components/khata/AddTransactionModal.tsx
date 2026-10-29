import React, { useState, useEffect } from 'react';
import { useKhata } from '../../context/KhataContext';
import { TransactionType } from '../../types';
import { X, Plus, WalletCards, DollarSign, Calendar } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWorkerId?: string | null;
  defaultType?: TransactionType;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  defaultWorkerId,
  defaultType = 'peshgi',
}) => {
  const { workers, addTransaction, settings, t, triggerHaptic } = useKhata();

  const [workerId, setWorkerId] = useState<string>('');
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState<number>(1000);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Easypaisa / JazzCash' | 'Bank Transfer'>('Cash');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (defaultWorkerId) {
      setWorkerId(defaultWorkerId);
    } else if (workers.length > 0 && !workerId) {
      setWorkerId(workers[0].id);
    }
    setType(defaultType);
  }, [defaultWorkerId, defaultType, workers, isOpen]);

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerId || amount <= 0) return;

    addTransaction({
      workerId,
      date,
      type,
      amount: Number(amount),
      paymentMethod,
      note: note.trim() || undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                type === 'peshgi'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              <WalletCards className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {type === 'peshgi' ? t('givePeshgi') : t('recordPayment')}
              </h3>
              <p className="text-xs text-slate-400">Record cash advance or wage payment</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Transaction Type Segmented Toggle */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setType('peshgi');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                type === 'peshgi'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('advancePeshgi')}
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setType('payment');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                type === 'payment'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('wagePayment')}
            </button>
          </div>

          {/* Worker Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Worker *
            </label>
            <select
              required
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.role}) - Rate: {settings.currency} {w.dailyWage}
                </option>
              ))}
            </select>
          </div>

          {/* Amount input & Quick Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('amount')} ({settings.currency}) *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                step="any"
                value={amount || ''}
                onChange={(e) => setAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xl font-extrabold font-mono tabular-nums text-white focus:outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                {settings.currency}
              </span>
            </div>

            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setAmount(q);
                  }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                    amount === q
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  +{settings.currency} {q.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('date')}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('paymentMethod')}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Cash">{t('cash')}</option>
                <option value="Easypaisa / JazzCash">{t('mobileWallet')}</option>
                <option value="Bank Transfer">{t('bank')}</option>
              </select>
            </div>
          </div>

          {/* Note / Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('note')} (e.g. Rashan, Rent, Medical, Clearance)
            </label>
            <input
              type="text"
              placeholder="e.g. Given for family medicine"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

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
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-md ${
                type === 'peshgi'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
              }`}
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
