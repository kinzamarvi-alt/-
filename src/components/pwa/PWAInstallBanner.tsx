import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Smartphone, Download, X, MoreVertical, CheckCircle2 } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed and running inside the standalone app, do not display
  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      {/* Prominent Mobile Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-emerald-500/15 border-b border-amber-500/30 px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm font-bold">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white truncate">
                موبائل ایپ انسٹال کریں
              </span>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-extrabold px-1.5 py-0.2 rounded">
                APK / App
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              بغیر کمپیوٹر کے براہ راست فون میں انسٹال کریں (آف لائن چلے گی)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-transform active:scale-95 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>انسٹال کریں</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step-by-Step Guide Modal for Mobile Users */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    موبائل میں انسٹال کرنے کا طریقہ
                  </h3>
                  <p className="text-xs text-slate-400">کمپیوٹر کے بغیر 2 سیکنڈ میں</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-200">
              <p className="text-slate-300">
                اینڈرائیڈ موبائل فون میں اس ایپ کو بطور اصلی ایپ انسٹال کرنے کے لیے:
              </p>

              <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span>اپنے کروم (Chrome) براؤزر کے اوپر دائیں کونے میں</span>
                    <strong className="text-amber-400 mx-1 flex items-center gap-1 inline-flex">
                      <MoreVertical className="w-3.5 h-3.5 inline" /> تین نقطوں (⋮)
                    </strong>
                    <span>پر کلک کریں۔</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span>مینو میں سے</span>
                    <strong className="text-emerald-400 mx-1">"Install app"</strong>
                    <span>یا</span>
                    <strong className="text-emerald-400 mx-1">"Add to Home screen"</strong>
                    <span>منتخب کریں۔</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span>
                      <strong>"Install"</strong> پر کلک کریں۔ ایپ فوری طور پر آپ کے فون کے مینو میں اصلی ایپ (APK) کی طرح آ جائے گی!
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="text-[11px]">
                  انسٹال ہونے کے بعد یہ بغیر انٹرنیٹ کے (آف لائن) بھی چلے گی اور تمام مزدوروں کا کھاتہ فون میں محفوظ رہے گا!
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
            >
              سمجھ آ گئی (Close)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
