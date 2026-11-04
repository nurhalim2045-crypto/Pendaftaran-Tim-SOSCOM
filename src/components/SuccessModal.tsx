import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Award, Download, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { TeamRegistration } from '../types';
import { soundEffects } from '../utils/audio';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamRegistration | null;
  onViewCard: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  team,
  onViewCard,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundEffects.playSuccess();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#f59e0b', '#38bdf8', '#fbbf24', '#ffffff'],
        });
      } catch {
        // Ignore confetti error
      }
    }
  }, [isOpen]);

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-[#0f172a] to-[#0b132b] border-2 border-cyan-400/80 shadow-2xl shadow-cyan-950/70 overflow-hidden text-center">
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-cyan-500/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="inline-flex p-4 rounded-3xl bg-cyan-950/80 border-2 border-cyan-400/60 shadow-xl shadow-cyan-500/30 mb-4 animate-bounce">
          <CheckCircle2 className="w-12 h-12 text-cyan-400" />
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono block mb-1">
          REGISTRASI BERHASIL DITERIMA
        </span>

        <h2 className="text-2xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-300 mb-2">
          Selamat Datang di SOSCOM 2026!
        </h2>

        <p className="text-xs sm:text-sm text-slate-300">
          Tim <strong className="text-white underline">{team.namaTim}</strong> telah resmi terdaftar dalam Smansa Olympic Science Competition 2026.
        </p>

        {/* Registration Number Plaque */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/50 shadow-inner">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Nomor Induk Registrasi Tim:
          </span>
          <span className="text-xl sm:text-2xl font-black font-orbitron text-amber-400 tracking-widest block my-1">
            {team.noPeserta}
          </span>
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-medium mt-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Anti-Duplikasi Tervalidasi • Kartu B3 Siap Dicetak</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            type="button"
            onClick={onViewCard}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-950/60 flex items-center justify-center gap-2 cursor-pointer transition hover:scale-102"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>Lihat & Unduh Kartu B3</span>
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm cursor-pointer transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
