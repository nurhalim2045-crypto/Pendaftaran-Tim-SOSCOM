import React, { useState } from 'react';
import { Search, Download, Trash2, Eye, ShieldCheck, FileSpreadsheet, Users, Calendar } from 'lucide-react';
import { TeamRegistration } from '../types';
import { soundEffects } from '../utils/audio';

interface TeamsListProps {
  teams: TeamRegistration[];
  onSelectTeam: (team: TeamRegistration) => void;
  onDeleteTeam: (teamId: string) => void;
}

export const TeamsList: React.FC<TeamsListProps> = ({
  teams,
  onSelectTeam,
  onDeleteTeam,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeams = teams.filter((t) => {
    const term = searchTerm.toLowerCase();
    const matchName = t.namaTim.toLowerCase().includes(term);
    const matchNo = t.noPeserta.toLowerCase().includes(term);
    const matchKetua = t.ketua.nama.toLowerCase().includes(term) || t.ketua.nis.includes(term);
    const matchAnggota = t.anggota.some(
      (a) => a.nama.toLowerCase().includes(term) || a.nis.includes(term)
    );
    return matchName || matchNo || matchKetua || matchAnggota;
  });

  const handleExportCsv = () => {
    soundEffects.playClick();
    if (teams.length === 0) return;

    const headers = [
      'No Peserta',
      'Timestamp',
      'Nama Tim',
      'Motto Tim',
      'Ketua Nama',
      'Ketua Kelas',
      'Ketua NIS',
      'Anggota 1 Nama',
      'Anggota 1 Kelas',
      'Anggota 1 NIS',
      'Anggota 2 Nama',
      'Anggota 2 Kelas',
      'Anggota 2 NIS',
      'Anggota 3 Nama',
      'Anggota 3 Kelas',
      'Anggota 3 NIS',
      'Anggota 4 Nama',
      'Anggota 4 Kelas',
      'Anggota 4 NIS',
      'Anggota 5 Nama',
      'Anggota 5 Kelas',
      'Anggota 5 NIS',
    ];

    const rows = teams.map((t) => [
      `"${t.noPeserta}"`,
      `"${t.timestamp}"`,
      `"${t.namaTim}"`,
      `"${t.mottoTim.replace(/"/g, '""')}"`,
      `"${t.ketua.nama}"`,
      `"${t.ketua.kelas}"`,
      `"${t.ketua.nis}"`,
      ...t.anggota.flatMap((a) => [`"${a.nama}"`, `"${a.kelas}"`, `"${a.nis}"`]),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DATA_PESERTA_SOSCOM2026_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    soundEffects.playSuccess();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama tim, nomor peserta, nama siswa, atau NIS..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400"
          />
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={teams.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-semibold text-xs sm:text-sm shadow-sm transition cursor-pointer disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Ekspor CSV ({teams.length})</span>
        </button>
      </div>

      {/* Teams Grid / List */}
      {filteredTeams.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-300">Belum ada tim yang cocok</h4>
          <p className="text-xs text-slate-500 mt-1">
            Gunakan kotak pencarian atau daftarkan tim baru melalui tab formulir pendaftaran.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTeams.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-slate-900/85 border border-slate-800 hover:border-cyan-500/50 transition-all shadow-lg hover:shadow-cyan-950/30 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-orbitron text-xs font-black px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    {t.noPeserta}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{t.timestamp.slice(0, 16)}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition font-space">
                  {t.namaTim}
                </h3>
                <p className="text-xs italic text-slate-400 mt-1 line-clamp-1">
                  &ldquo;{t.mottoTim}&rdquo;
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-[11px] text-amber-400/90 font-medium">Ketua:</span>
                    <span className="font-semibold">{t.ketua.nama} ({t.ketua.kelas} • NIS {t.ketua.nis})</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Total Peserta:</span>
                    <span>1 Ketua + 5 Anggota (Lengkap)</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    onSelectTeam(t);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 text-xs font-medium border border-cyan-500/40 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat & Cetak Kartu B3</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    if (confirm(`Hapus pendaftaran tim "${t.namaTim}" (${t.noPeserta})?`)) {
                      onDeleteTeam(t.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                  title="Hapus data tim"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
