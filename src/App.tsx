import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ClipboardList,
  Award,
  Users,
  Settings,
  Volume2,
  VolumeX,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Calendar,
  MapPin,
  Flame,
  ArrowRight
} from 'lucide-react';
import { TeamRegistration, AppSettings, ValidationResult } from './types';
import { TripleLogoHeader, LogoSman1Pangkep, LogoOsis, LogoSalty } from './components/Logos';
import { RegistrationForm } from './components/RegistrationForm';
import { TeamCardB3 } from './components/TeamCardB3';
import { TeamsList } from './components/TeamsList';
import { DuplicateAlertModal } from './components/DuplicateAlertModal';
import { WebhookSettingsModal } from './components/WebhookSettingsModal';
import { SuccessModal } from './components/SuccessModal';
import {
  getSavedTeams,
  saveTeams,
  getAppSettings,
  saveAppSettings,
  generateNextTeamNumber,
  checkDuplicate,
} from './services/storageService';
import { sendToGoogleSheets, GOOGLE_APPS_SCRIPT_TEMPLATE } from './services/sheetsService';
import { soundEffects } from './utils/audio';

export default function App() {
  const [teams, setTeams] = useState<TeamRegistration[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    webhookUrl: '',
    soundEnabled: true,
  });

  const [activeTab, setActiveTab] = useState<'form' | 'card' | 'list' | 'guide'>('form');
  const [activeTeamForCard, setActiveTeamForCard] = useState<TeamRegistration | null>(null);

  // Modals state
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateModalInfo, setDuplicateModalInfo] = useState<{
    message: string;
    field?: string;
    value?: string;
    existingTeam?: string;
  }>({ message: '' });

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [recentlyRegisteredTeam, setRecentlyRegisteredTeam] = useState<TeamRegistration | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize data from local storage
  useEffect(() => {
    const loadedTeams = getSavedTeams();
    setTeams(loadedTeams);
    if (loadedTeams.length > 0) {
      setActiveTeamForCard(loadedTeams[0]);
    }

    const loadedSettings = getAppSettings();
    setSettings(loadedSettings);
    soundEffects.setEnabled(loadedSettings.soundEnabled);
  }, []);

  const handleToggleSound = () => {
    const nextVal = !settings.soundEnabled;
    const updated = { ...settings, soundEnabled: nextVal };
    setSettings(updated);
    saveAppSettings(updated);
    soundEffects.setEnabled(nextVal);
    if (nextVal) {
      soundEffects.playClick();
    }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveAppSettings(newSettings);
    soundEffects.setEnabled(newSettings.soundEnabled);
  };

  // Handle Form Submission with Strict Anti-Duplication
  const handleFormSubmit = async (
    formData: Omit<TeamRegistration, 'id' | 'noPeserta' | 'timestamp'>
  ) => {
    setIsSubmitting(true);

    // 1. Check Anti-Duplication against all stored records and within current form
    const validation: ValidationResult = checkDuplicate(formData, teams);

    if (!validation.isValid) {
      setIsSubmitting(false);
      soundEffects.playAlert();
      setDuplicateModalInfo({
        message: validation.errorMessage || 'Data Tim atau NIS ini sudah terdaftar!',
        field: validation.duplicateField,
        value: validation.duplicateValue,
        existingTeam: validation.existingTeamName,
      });
      setIsDuplicateModalOpen(true);
      return;
    }

    // 2. Data is clean & unique! Generate official registration number & timestamp
    const nextNoPeserta = generateNextTeamNumber(teams);
    const now = new Date();
    const formattedTimestamp = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('id-ID', { hour12: false })}`;

    const newTeam: TeamRegistration = {
      ...formData,
      id: `team-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      noPeserta: nextNoPeserta,
      timestamp: formattedTimestamp,
      syncedWithSheets: false,
    };

    // 3. Send async to Google Sheets Webhook
    try {
      const sheetsResult = await sendToGoogleSheets(newTeam, settings.webhookUrl);
      newTeam.syncedWithSheets = sheetsResult.success;
      if (!sheetsResult.success) {
        newTeam.sheetsError = sheetsResult.message;
      }
    } catch {
      newTeam.syncedWithSheets = false;
    }

    // 4. Save to state & localStorage
    const updatedTeams = [newTeam, ...teams];
    setTeams(updatedTeams);
    saveTeams(updatedTeams);

    // 5. Success flow
    setIsSubmitting(false);
    setActiveTeamForCard(newTeam);
    setRecentlyRegisteredTeam(newTeam);
    setIsSuccessModalOpen(true);
  };

  const handleDeleteTeam = (id: string) => {
    const updated = teams.filter((t) => t.id !== id);
    setTeams(updated);
    saveTeams(updated);
    if (activeTeamForCard?.id === id) {
      setActiveTeamForCard(updated.length > 0 ? updated[0] : null);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 selection:bg-cyan-500 selection:text-black flex flex-col relative cyber-grid">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-cyan-600/15 via-blue-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[300px] bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* HEADER SECTION (Deep Navy #0b132b, Cyan, Gold & 3 Official Logos) */}
      <header className="relative z-20 bg-[#0b132b]/95 border-b border-cyan-500/30 backdrop-blur-md shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {/* Top row: School Identity & Quick Controls */}
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block mr-1" />
              <span>UPT SMAN 1 Pangkajene dan Kepulauan</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-amber-400 font-bold hidden sm:inline">Kab. Pangkep, Sul-Sel</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSound}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-300 transition cursor-pointer text-xs flex items-center gap-1.5"
                title={settings.soundEnabled ? 'Matikan Suara FX' : 'Aktifkan Suara FX'}
              >
                {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span className="hidden sm:inline">{settings.soundEnabled ? 'FX Aktif' : 'Mute'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setIsSettingsModalOpen(true);
                }}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-300 transition cursor-pointer text-xs flex items-center gap-1.5"
                title="Pengaturan Google Sheets Webhook"
              >
                <Settings className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Webhook</span>
              </button>
            </div>
          </div>

          {/* MAIN HEADER: 3 Official Logos + Event Branding */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* 3 Logos Side-by-Side as required */}
            <TripleLogoHeader />

            {/* Event Titles */}
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[11px] font-bold tracking-widest uppercase mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>KOMPETISI SAINS BEREGU TAHUNAN</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-orbitron tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-amber-300">
                SOSCOM 2026
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-cyan-300/90 font-space tracking-wide mt-0.5">
                Smansa Olympic Science Competition
              </p>
              <p className="text-xs italic font-bold text-amber-400/90 mt-1">
                &ldquo;Where Brilliant Mind Rise&rdquo;
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Diselenggarakan oleh: <strong className="text-slate-200">SALTY</strong> (SMANSA Olympic Community)
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
          <nav className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto border-t border-slate-800/80 pt-2 pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('form');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'form'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/60 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Formulir Pendaftaran</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('card');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'card'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 shadow-lg shadow-yellow-950/60 border border-amber-400/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Kartu Peserta (Ukuran B3)</span>
              {activeTeamForCard && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ml-0.5 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('list');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/60 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Daftar Tim Terdaftar</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-900 border border-slate-700 text-cyan-300">
                {teams.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('guide');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'guide'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/60 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Panduan & Webhook</span>
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* TAB 1: FORMULIR PENDAFTARAN */}
        {activeTab === 'form' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Quick Hero Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0b132b] via-[#111e42] to-[#0b132b] border border-cyan-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-400 font-mono">
                  SISTEM ANTI-DUPLIKASI & GENERATOR KARTU B3 RESMI
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white">
                  Registrasi Regu Kompetisi Sains SOSCOM 2026
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Lengkapi data tim: <strong>1 Ketua + 5 Anggota</strong> (Kelas 10 & 11 SMAN 1 Pangkep). Setiap NIS dan Nama Tim akan diverifikasi secara otomatis dari duplikasi.
                </p>
              </div>

              <div className="flex sm:flex-col items-center gap-2 shrink-0">
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/40 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                    Tim Terdaftar
                  </span>
                  <span className="text-2xl font-black font-orbitron text-amber-400">
                    {teams.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Registration Form Component */}
            <RegistrationForm
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {/* TAB 2: KARTU PESERTA TIM (UKURAN B3) */}
        {activeTab === 'card' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {activeTeamForCard ? (
              <TeamCardB3 team={activeTeamForCard} />
            ) : (
              <div className="p-12 rounded-3xl bg-slate-900/80 border border-slate-800 text-center max-w-xl mx-auto">
                <Award className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white font-orbitron">
                  Belum Ada Kartu yang Dipilih
                </h3>
                <p className="text-xs text-slate-400 mt-2">
                  Daftarkan tim baru atau pilih salah satu tim dari tab Daftar Tim Terdaftar untuk melihat dan mencetak Kartu Peserta B3.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-cyan-950"
                >
                  Buka Formulir Pendaftaran
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DAFTAR TIM TERDAFTAR */}
        {activeTab === 'list' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold font-orbitron text-white">
                  Database Tim Terdaftar SOSCOM 2026
                </h2>
                <p className="text-xs text-slate-400">
                  Semua tim telah lolos validasi Anti-Duplikasi NIS dan Nama Tim.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow cursor-pointer"
              >
                + Tambah Tim Baru
              </button>
            </div>

            <TeamsList
              teams={teams}
              onSelectTeam={(team) => {
                setActiveTeamForCard(team);
                setActiveTab('card');
              }}
              onDeleteTeam={handleDeleteTeam}
            />
          </div>
        )}

        {/* TAB 4: PANDUAN & WEBHOOK */}
        {activeTab === 'guide' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Guide Cards */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl">
              <h2 className="text-xl font-bold font-orbitron text-amber-400 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                Panduan Kompetisi SOSCOM 2026
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <h4 className="font-bold text-cyan-300 text-sm mb-1">
                    1. Ketentuan Regu & Anggota
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>Setiap tim terdiri dari <strong>1 orang Ketua</strong> dan <strong>5 orang Anggota</strong> (total 6 peserta).</li>
                    <li>Peserta merupakan siswa aktif <strong>Kelas 10 atau Kelas 11</strong> SMAN 1 Pangkajene dan Kepulauan.</li>
                    <li>Siswa hanya diperbolehkan terdaftar pada 1 regu saja (Anti-Duplikasi NIS aktif).</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <h4 className="font-bold text-amber-300 text-sm mb-1">
                    2. Spesifikasi Kartu Peserta Tim (Standar B3)
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>Ukuran standar cetak B3 Portrait: <strong>353 mm × 500 mm</strong>.</li>
                    <li>Memuat 3 logo resmi berdampingan: <strong>SMAN 1 Pangkep, OSIS, dan SALTY</strong>.</li>
                    <li>Memuat Nomor Registrasi Unik <code>SOSCOM2026-TEAM-XXX</code> dan QR Code verifikasi.</li>
                    <li>Dapat diunduh sebagai gambar high-res (PNG) atau dokumen siap cetak (PDF).</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-emerald-300 text-sm">
                      3. Integrasi Google Sheets Webhook Panitia
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsSettingsModalOpen(true)}
                      className="px-3 py-1 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-semibold cursor-pointer"
                    >
                      Buka Pengaturan Webhook
                    </button>
                  </div>
                  <p className="text-slate-300 mb-2">
                    Data tim otomatis dikirim ke Google Apps Script Web App dengan payload:
                  </p>
                  <pre className="p-3 rounded-xl bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
{`{
  "timestamp": "2026-11-04 14:00:00",
  "noPeserta": "SOSCOM2026-TEAM-003",
  "namaTim": "Quantum Leap",
  "mottoTim": "Where Brilliant Mind Rise",
  "ketua": { "nama": "...", "kelas": "Kelas 11", "nis": "21045" },
  "anggota": [
    { "nama": "...", "kelas": "Kelas 10", "nis": "22011" },
    ... 5 anggota ...
  ]
}`}
                  </pre>
                </div>

                {/* Section 4: 24/7 Online Deployment Guide */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-cyan-950/70 border border-cyan-500/50 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-xs">ONLINE 24/7</span>
                    <h4 className="font-bold text-white text-sm sm:text-base">
                      4. Panduan Publikasi Agar Dapat Digunakan Kapan Saja & Di Mana Saja
                    </h4>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <strong className="text-cyan-300 block mb-1">
                        Metode 1: Gunakan URL Shared Cloud Langsung (Paling Cepat & Gratis)
                      </strong>
                      <p className="text-slate-400 mb-2">
                        Aplikasi ini sudah aktif di cloud server Google AI Studio dan bisa langsung disebarkan ke siswa/guru melalui tautan:
                      </p>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-cyan-500/40 font-mono text-cyan-300 text-xs overflow-x-auto select-all">
                        <span>https://ais-pre-5qwuiynjup2c6mfkohbu74-997644981304.asia-east1.run.app</span>
                      </div>
                      <p className="text-[11px] text-amber-300/90 mt-1.5">
                        💡 Anda juga dapat mengklik tombol <strong>Share / Publish</strong> di bagian kanan atas layar Google AI Studio untuk membagikan tautan permanen.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <strong className="text-amber-300 block mb-1">
                        Metode 2: Pasang Domain Sekolah / Hosting Mandiri (Vercel / Netlify / GitHub Pages)
                      </strong>
                      <ol className="list-decimal list-inside space-y-1 text-slate-300 text-xs">
                        <li>Unduh atau push source code proyek ini ke repository <strong>GitHub</strong> sekolah.</li>
                        <li>Buka layanan hosting gratis seperti <strong className="text-white">Vercel.com</strong> atau <strong className="text-white">Netlify.com</strong>.</li>
                        <li>Impor repository GitHub Anda, pilih framework <strong>Vite</strong>.</li>
                        <li>Build command: <code>npm run build</code> dan Output directory: <code>dist</code>.</li>
                        <li>Klik <strong>Deploy</strong>. Web akan aktif selamanya dengan URL kustom Anda (misalnya: <code>soscom.sman1pangkep.sch.id</code> atau <code>soscom2026.vercel.app</code>).</li>
                      </ol>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <strong className="text-emerald-300 block mb-1">
                        PENTING: Hubungkan Google Sheets Sekolah Sebagai Database Utama
                      </strong>
                      <p className="text-slate-400 text-xs">
                        Pastikan Panitia telah memasukkan URL Web App Google Apps Script pada menu <strong>Pengaturan Webhook</strong>. Dengan demikian, setiap siswa yang mendaftar dari HP mereka di rumah akan langsung otomatis masuk ke 1 spreadsheet Google Drive sekolah yang sama secara real-time!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 bg-[#070b19] border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <LogoSman1Pangkep size={24} />
              <LogoOsis size={24} />
              <LogoSalty size={24} />
            </div>
            <span className="font-semibold text-slate-300 font-orbitron text-xs">
              SOSCOM 2026 • SALTY SMAN 1 PANGKEP
            </span>
          </div>

          <p className="text-slate-400">
            Smansa Olympic Science Competition • &ldquo;Where Brilliant Mind Rise&rdquo;
          </p>

          <p className="text-slate-500 font-mono text-[11px]">
            UPT SMAN 1 Pangkajene dan Kepulauan
          </p>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Anti-Duplication Warning Modal */}
      <DuplicateAlertModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        message={duplicateModalInfo.message}
        duplicateField={duplicateModalInfo.field}
        duplicateValue={duplicateModalInfo.value}
        existingTeamName={duplicateModalInfo.existingTeam}
      />

      {/* 2. Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        team={recentlyRegisteredTeam}
        onViewCard={() => {
          setIsSuccessModalOpen(false);
          setActiveTab('card');
        }}
      />

      {/* 3. Google Sheets Webhook Settings Modal */}
      <WebhookSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
