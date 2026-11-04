import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Settings, Radio, Sparkles, Database } from 'lucide-react';
import { AppSettings } from '../types';
import { GOOGLE_APPS_SCRIPT_TEMPLATE } from '../services/sheetsService';
import { soundEffects } from '../utils/audio';

interface WebhookSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const WebhookSettingsModal: React.FC<WebhookSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [url, setUrl] = useState(settings.webhookUrl);
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    soundEffects.playClick();
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleTestWebhook = async () => {
    soundEffects.playClick();
    setIsTesting(true);
    setTestStatus('Menguji koneksi ke Webhook Google Apps Script...');

    try {
      if (!url.trim()) {
        setTestStatus('⚠️ Silakan masukkan URL Web App terlebih dahulu.');
        setIsTesting(false);
        return;
      }

      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          message: 'Uji koneksi SOSCOM 2026',
        }),
      });

      setTestStatus('✅ Koneksi Webhook berhasil dipanggil (Request Transmitted)!');
      soundEffects.playSuccess();
    } catch (e) {
      setTestStatus(`❌ Gagal terhubung: ${(e as Error).message}`);
      soundEffects.playAlert();
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    soundEffects.playClick();
    onSave({
      ...settings,
      webhookUrl: url.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl shadow-cyan-950/60">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-orbitron text-white">
              Pengaturan Integrasi Google Sheets Webhook
            </h2>
            <p className="text-xs text-slate-400">
              Sinkronisasi data pendaftar otomatis ke Google Spreadsheet panitia.
            </p>
          </div>
        </div>

        {/* Input URL */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              URL Web App Google Apps Script
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 font-mono"
              />
              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-300 text-xs font-semibold shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isTesting ? 'Menguji...' : 'Uji Webhook'}
              </button>
            </div>
            {testStatus && (
              <p className="text-xs mt-2 p-2 rounded-lg bg-slate-800/80 text-cyan-300 font-mono">
                {testStatus}
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-1.5">
              Biarkan kosong atau default untuk mode simulasi tanpa error. Data selalu tersimpan di browser (localStorage).
            </p>
          </div>

          {/* Apps Script Guide */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Kode Apps Script (Siap Pakai)
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-medium cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              Buat Google Spreadsheet baru &gt; Buka <strong>Extensions &gt; Apps Script</strong> &gt; Tempel kode berikut &gt; Deploy as Web App (Access: Anyone).
            </p>
            <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] max-h-40 overflow-y-auto border border-slate-800 selection:bg-cyan-500 selection:text-black">
              {GOOGLE_APPS_SCRIPT_TEMPLATE}
            </pre>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-950 cursor-pointer"
          >
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};
