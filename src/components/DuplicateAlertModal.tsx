import React from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface DuplicateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  duplicateField?: string;
  duplicateValue?: string;
  existingTeamName?: string;
}

export const DuplicateAlertModal: React.FC<DuplicateAlertModalProps> = ({
  isOpen,
  onClose,
  message,
  duplicateField,
  duplicateValue,
  existingTeamName,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    soundEffects.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-[#0f172a] to-[#0b132b] border-2 border-rose-500/80 shadow-2xl shadow-rose-950/60 overflow-hidden">
        {/* Glow lights */}
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 shadow-lg shadow-rose-950/80 mb-4 animate-bounce">
            <ShieldAlert className="w-12 h-12 text-rose-400" />
          </div>

          {/* Core Warning Headline requested */}
          <h2 className="text-xl sm:text-2xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400">
            Data Tim atau NIS ini sudah terdaftar!
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium leading-relaxed">
            Sistem Anti-Duplikasi SOSCOM 2026 mendeteksi benturan data dengan pendaftaran yang sudah ada. Pendaftaran diblokir untuk menjaga integritas kompetisi.
          </p>
        </div>

        {/* Detail Box */}
        <div className="mt-5 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-left">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1.5 text-slate-200">
              <p className="font-semibold text-rose-300">{message}</p>
              {duplicateValue && (
                <p className="font-mono text-xs text-amber-200">
                  Nilai terdeteksi: <strong className="text-white underline">{duplicateValue}</strong>
                </p>
              )}
              {existingTeamName && (
                <p className="text-xs text-slate-400">
                  Tim terdaftar sebelumnya: <span className="text-cyan-300 font-semibold">{existingTeamName}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Resolution Guidance */}
        <div className="mt-4 p-3 rounded-xl bg-slate-800/60 text-slate-400 text-xs">
          💡 <strong className="text-slate-200">Solusi:</strong> Periksa kembali NIS atau nama tim Anda. Jika anggota tersebut sudah bergabung di tim lain, harap ganti dengan peserta lain yang belum terdaftar.
        </div>

        {/* Close Action */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-rose-950/50 transition cursor-pointer"
          >
            Kembali & Perbaiki Data
          </button>
        </div>
      </div>
    </div>
  );
};
