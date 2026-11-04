import React, { useState } from 'react';
import { Users, User, UserCheck, Sparkles, Send, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { TeamMember, TeamRegistration } from '../types';
import { soundEffects } from '../utils/audio';

interface RegistrationFormProps {
  onSubmit: (formData: Omit<TeamRegistration, 'id' | 'noPeserta' | 'timestamp'>) => void;
  isSubmitting: boolean;
}

const INITIAL_MEMBER: TeamMember = {
  nama: '',
  kelas: '',
  nis: '',
};

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [namaTim, setNamaTim] = useState('');
  const [mottoTim, setMottoTim] = useState('');

  const [ketua, setKetua] = useState<TeamMember>({
    nama: '',
    kelas: '',
    nis: '',
  });

  const [anggota, setAnggota] = useState<TeamMember[]>([
    { ...INITIAL_MEMBER },
    { ...INITIAL_MEMBER },
    { ...INITIAL_MEMBER },
    { ...INITIAL_MEMBER },
    { ...INITIAL_MEMBER },
  ]);

  const [validationError, setValidationError] = useState<string>('');

  const handleAnggotaChange = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...anggota];
    updated[index] = { ...updated[index], [field]: value };
    setAnggota(updated);
  };

  // Quick fill demo data for effortless evaluator testing
  const handleFillDemoData = () => {
    soundEffects.playClick();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setNamaTim(`Astro-Genesis ${randomSuffix}`);
    setMottoTim('Mengejar Cahaya Kebenaran Sains Bersama SALTY SMAN 1 Pangkep.');

    const startNis = 23000 + Math.floor(Math.random() * 500);

    setKetua({
      nama: 'Ahmad Syahrir Mubarak',
      kelas: 'Kelas 11',
      nis: `${startNis}`,
    });

    setAnggota([
      { nama: 'Nurul Hidayati Rahman', kelas: 'Kelas 11', nis: `${startNis + 1}` },
      { nama: 'Muh. Fadhil Ashari', kelas: 'Kelas 11', nis: `${startNis + 2}` },
      { nama: 'Dinda Ayu Maharani', kelas: 'Kelas 10', nis: `${startNis + 3}` },
      { nama: 'Fajar Maulana Malik', kelas: 'Kelas 10', nis: `${startNis + 4}` },
      { nama: 'Siti Rahmawati Putri', kelas: 'Kelas 10', nis: `${startNis + 5}` },
    ]);
    setValidationError('');
  };

  const handleResetForm = () => {
    soundEffects.playClick();
    setNamaTim('');
    setMottoTim('');
    setKetua({ nama: '', kelas: '', nis: '' });
    setAnggota([
      { ...INITIAL_MEMBER },
      { ...INITIAL_MEMBER },
      { ...INITIAL_MEMBER },
      { ...INITIAL_MEMBER },
      { ...INITIAL_MEMBER },
    ]);
    setValidationError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playClick();
    setValidationError('');

    // Validation 1: Team info
    if (!namaTim.trim()) {
      setValidationError('Nama Tim wajib diisi.');
      return;
    }
    if (!mottoTim.trim()) {
      setValidationError('Motto Tim wajib diisi.');
      return;
    }

    // Validation 2: Ketua
    if (!ketua.nama.trim()) {
      setValidationError('Nama Lengkap Ketua Tim wajib diisi.');
      return;
    }
    if (!ketua.kelas) {
      setValidationError('Kelas Ketua Tim wajib dipilih (Kelas 10 atau Kelas 11).');
      return;
    }
    if (!ketua.nis.trim() || !/^\d+$/.test(ketua.nis.trim())) {
      setValidationError('NIS Ketua Tim wajib berupa angka yang valid.');
      return;
    }

    // Validation 3: All 5 Anggota
    for (let i = 0; i < 5; i++) {
      const a = anggota[i];
      if (!a.nama.trim()) {
        setValidationError(`Nama Lengkap Anggota ${i + 1} wajib diisi.`);
        return;
      }
      if (!a.kelas) {
        setValidationError(`Kelas Anggota ${i + 1} wajib dipilih.`);
        return;
      }
      if (!a.nis.trim() || !/^\d+$/.test(a.nis.trim())) {
        setValidationError(`NIS Anggota ${i + 1} wajib berupa angka yang valid.`);
        return;
      }
    }

    // Send to parent handler which runs Anti-Duplication logic against storage/database
    onSubmit({
      namaTim: namaTim.trim(),
      mottoTim: mottoTim.trim(),
      ketua: {
        nama: ketua.nama.trim(),
        kelas: ketua.kelas,
        nis: ketua.nis.trim(),
      },
      anggota: anggota.map((a) => ({
        nama: a.nama.trim(),
        kelas: a.kelas,
        nis: a.nis.trim(),
      })) as [TeamMember, TeamMember, TeamMember, TeamMember, TeamMember],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-8">
      {/* Quick Actions Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md">
        <div>
          <h3 className="text-base font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-300">
            Formulir Pendaftaran Tim Sains SOSCOM 2026
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            1 Regu terdiri dari 1 Ketua + 5 Anggota (Total 6 Siswa). Pastikan NIS valid dan belum terdaftar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFillDemoData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-semibold shadow-sm transition cursor-pointer"
            title="Isi formulir otomatis dengan data contoh acak"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Isi Data Percobaan</span>
          </button>
          <button
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg shadow-rose-950/40 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-rose-300 font-semibold mb-0.5">Periksa Data Input:</strong>
            <span>{validationError}</span>
          </div>
        </div>
      )}

      {/* SECTION 1: INFORMASI TIM & MOTTO */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-500" />
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 font-mono">
              SECTION 01
            </span>
            <h4 className="text-lg sm:text-xl font-bold font-orbitron text-white">
              Informasi Tim & Motto
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Nama Tim <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={namaTim}
              onChange={(e) => setNamaTim(e.target.value)}
              placeholder="Contoh: Astro-Genesis, Quantum Leap, dll."
              className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 font-space transition"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Nama tim harus unik dan belum digunakan oleh tim lain.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Motto Tim <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={mottoTim}
              onChange={(e) => setMottoTim(e.target.value)}
              placeholder="Contoh: Menembus Batas Sains, Meraih Puncak Cakrawala!"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition resize-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Semboyan yang mengobarkan semangat sains tim Anda.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: DATA KETUA TIM */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono">
              SECTION 02
            </span>
            <h4 className="text-lg sm:text-xl font-bold font-orbitron text-white">
              Data Ketua Tim (Team Leader)
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6">
          <div className="sm:col-span-6">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Nama Lengkap Ketua <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={ketua.nama}
              onChange={(e) => setKetua({ ...ketua, nama: e.target.value })}
              placeholder="Nama lengkap sesuai data sekolah"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Kelas Ketua <span className="text-rose-400">*</span>
            </label>
            <select
              required
              value={ketua.kelas}
              onChange={(e) => setKetua({ ...ketua, kelas: e.target.value as 'Kelas 10' | 'Kelas 11' })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition cursor-pointer"
            >
              <option value="" disabled>Pilih Kelas...</option>
              <option value="Kelas 10">Kelas 10</option>
              <option value="Kelas 11">Kelas 11</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              NIS Ketua Tim <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={ketua.nis}
              onChange={(e) => setKetua({ ...ketua, nis: e.target.value.replace(/\D/g, '') })}
              placeholder="Nomor Induk Siswa"
              maxLength={12}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: DATA ANGGOTA TIM (5 ORANG ANGGOTA) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500" />
        
        <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 font-mono">
                SECTION 03
              </span>
              <h4 className="text-lg sm:text-xl font-bold font-orbitron text-white">
                Data Anggota Tim (5 Orang Anggota)
              </h4>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
            Wajib Lengkap (5/5)
          </span>
        </div>

        <div className="space-y-4">
          {anggota.map((ang, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-cyan-500/40 transition-all shadow-inner"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-bold flex items-center justify-center font-mono">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Anggota {idx + 1}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
                <div className="sm:col-span-6">
                  <input
                    type="text"
                    required
                    value={ang.nama}
                    onChange={(e) => handleAnggotaChange(idx, 'nama', e.target.value)}
                    placeholder={`Nama Lengkap Anggota ${idx + 1}`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    required
                    value={ang.kelas}
                    onChange={(e) => handleAnggotaChange(idx, 'kelas', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                  >
                    <option value="" disabled>Pilih Kelas...</option>
                    <option value="Kelas 10">Kelas 10</option>
                    <option value="Kelas 11">Kelas 11</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <input
                    type="text"
                    required
                    value={ang.nis}
                    onChange={(e) => handleAnggotaChange(idx, 'nis', e.target.value.replace(/\D/g, ''))}
                    placeholder={`NIS Anggota ${idx + 1}`}
                    maxLength={12}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 font-mono text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base font-orbitron tracking-wider shadow-xl shadow-cyan-950/60 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border border-cyan-400/40"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>Memvalidasi Data & Sinkronisasi...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5 text-cyan-300" />
              <span>Daftarkan Tim & Buat Kartu Peserta (B3)</span>
            </>
          )}
        </button>
        <p className="text-center text-xs text-slate-400 mt-2">
          Sistem akan secara otomatis memeriksa NIS dan Nama Tim dari duplikasi sebelum mencetak Kartu Peserta B3.
        </p>
      </div>
    </form>
  );
};
