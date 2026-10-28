import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import { Site } from '../../types';
import { Building2, Plus, Users, MapPin, Edit, Trash2, ArrowRight } from 'lucide-react';
import { SiteModal } from './SiteModal';

interface SitesViewProps {
  onSelectSiteForAttendance: (siteId: string) => void;
}

export const SitesView: React.FC<SitesViewProps> = ({ onSelectSiteForAttendance }) => {
  const { sites, workers, getSiteSummary, deleteSite, settings, t, triggerHaptic } = useKhata();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [siteToEdit, setSiteToEdit] = useState<Site | null>(null);

  const handleEdit = (site: Site) => {
    triggerHaptic();
    setSiteToEdit(site);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    triggerHaptic();
    setSiteToEdit(null);
    setIsModalOpen(true);
  };

  const handleDelete = (site: Site) => {
    if (confirm(`Delete "${site.name}"? Workers assigned to this site will remain active.`)) {
      deleteSite(site.id);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-24 md:pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>{t('sites')}</span>
            <span className="text-xs font-normal text-slate-400 font-urdu" dir="rtl">
              (پراجیکٹس اور سائٹس)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize workers, daily wages, and advances by project location.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t('addSite')}</span>
        </button>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sites.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">No sites created yet.</p>
          </div>
        ) : (
          sites.map((site) => {
            const summary = getSiteSummary(site.id);
            const siteWorkers = workers.filter((w) => w.siteId === site.id);

            return (
              <div
                key={site.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-white">{site.name}</h3>
                      {site.location && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{site.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(site)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                        title="Edit site"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(site)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                        title="Delete site"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Strips */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80">
                    <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-medium">Assigned Workers</div>
                      <div className="text-sm font-bold font-mono tabular-nums text-white mt-0.5">
                        {summary.workerCount}
                      </div>
                    </div>

                    <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800">
                      <div className="text-[10px] text-amber-400 font-medium">Today's Wage Bill</div>
                      <div className="text-sm font-bold font-mono tabular-nums text-amber-300 mt-0.5">
                        {settings.currency} {summary.todayWage.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Worker avatars preview */}
                {siteWorkers.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-hidden py-1">
                    {siteWorkers.slice(0, 5).map((w) => (
                      <div
                        key={w.id}
                        title={`${w.name} (${w.role})`}
                        className={`w-7 h-7 rounded-lg ${w.avatarColor || 'bg-amber-600'} text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm`}
                      >
                        {w.name.charAt(0)}
                      </div>
                    ))}
                    {siteWorkers.length > 5 && (
                      <span className="text-[10px] text-slate-400 ml-1">
                        +{siteWorkers.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                {/* Bottom CTA to Jump to Attendance for this Site */}
                <button
                  onClick={() => {
                    triggerHaptic();
                    onSelectSiteForAttendance(site.id);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Mark Site Attendance</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <SiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        siteToEdit={siteToEdit}
      />
    </div>
  );
};
