import React, { useState, useEffect } from 'react';
import { useKhata } from '../../context/KhataContext';
import { Site } from '../../types';
import { X, Building2 } from 'lucide-react';

interface SiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteToEdit?: Site | null;
}

export const SiteModal: React.FC<SiteModalProps> = ({
  isOpen,
  onClose,
  siteToEdit,
}) => {
  const { addSite, updateSite, t } = useKhata();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (siteToEdit) {
      setName(siteToEdit.name);
      setLocation(siteToEdit.location);
    } else {
      setName('');
      setLocation('');
    }
  }, [siteToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (siteToEdit) {
      updateSite({
        ...siteToEdit,
        name: name.trim(),
        location: location.trim(),
      });
    } else {
      addSite({
        name: name.trim(),
        location: location.trim(),
        active: true,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              {siteToEdit ? 'Edit Site' : t('addSite')}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('siteName')} *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bahria Town Sector C Commercial"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('location')}
            </label>
            <input
              type="text"
              placeholder="e.g. Plot 42, Main Commercial Lane"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
