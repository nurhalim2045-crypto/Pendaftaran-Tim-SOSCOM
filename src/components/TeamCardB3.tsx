import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, Printer, Share2, CheckCircle2, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { TeamRegistration } from '../types';
import { LogoSman1Pangkep, LogoOsis, LogoSalty } from './Logos';
import { soundEffects } from '../utils/audio';

interface TeamCardB3Props {
  team: TeamRegistration;
  onPrintNative?: () => void;
}

export const TeamCardB3: React.FC<TeamCardB3Props> = ({ team }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>('');

  // Generate QR Code containing comprehensive verification data
  useEffect(() => {
    const payload = JSON.stringify({
      event: 'SOSCOM 2026 - Smansa Olympic Science Competition',
      host: 'SMAN 1 Pangkajene dan Kepulauan',
      community: 'SALTY (SMANSA Olympic Community)',
      noPeserta: team.noPeserta,
      namaTim: team.namaTim,
      ketua: `${team.ketua.nama} (${team.ketua.nis})`,
      anggotaCount: team.anggota.length,
      verified: true,
      timestamp: team.timestamp,
    });

    QRCode.toDataURL(
      payload,
      {
        width: 240,
        margin: 1,
        color: {
          dark: '#0b132b',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      },
      (err, url) => {
        if (!err && url) {
          setQrCodeUrl(url);
        }
      }
    );
  }, [team]);

  // Export to high-res PNG via html2canvas
  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    soundEffects.playClick();
    setIsExporting(true);
    setExportMessage('Membuat gambar resolusi tinggi (PNG)...');

    try {
      // Scale 2 for high density crisp rendering without blur
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0b132b',
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `KARTU_PESERTA_${team.noPeserta}_${team.namaTim.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      soundEffects.playSuccess();
      setExportMessage('Kartu berhasil diunduh sebagai PNG!');
      setTimeout(() => setExportMessage(''), 3500);
    } catch (err) {
      console.error('Download PNG failed', err);
      soundEffects.playAlert();
      setExportMessage('Gagal mengunduh kartu. Silakan coba kembali.');
      setTimeout(() => setExportMessage(''), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF via jsPDF with exact B3 dimensions (353mm x 500mm)
  const handleDownloadPdf = async () => {
    if (!cardRef.current) return;
    soundEffects.playClick();
    setIsExporting(true);
    setExportMessage('Menyusun berkas cetak PDF (Standar B3)...');

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0b132b',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');

      // B3 portrait standard dimension: 353mm x 500mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [353, 500],
      });

      // Fit full page
      pdf.addImage(imgData, 'PNG', 0, 0, 353, 500, undefined, 'FAST');
      pdf.save(`KARTU_PESERTA_B3_${team.noPeserta}_${team.namaTim.replace(/\s+/g, '_')}.pdf`);

      soundEffects.playSuccess();
      setExportMessage('Berkas PDF Standar B3 berhasil diunduh!');
      setTimeout(() => setExportMessage(''), 3500);
    } catch (err) {
      console.error('Download PDF failed', err);
      soundEffects.playAlert();
      setExportMessage('Gagal membuat PDF. Silakan coba kembali.');
      setTimeout(() => setExportMessage(''), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  // Direct native print trigger
  const handlePrint = () => {
    soundEffects.playClick();
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      {/* Top Action Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-700/70 shadow-xl backdrop-blur-md print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-white text-sm sm:text-base">
              Kartu Peserta Resmi Standar B3 (353 × 500 mm)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Diterbitkan oleh Panitia SOSCOM 2026 & Komunitas SALTY SMAN 1 Pangkep.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-900/40 transition-all hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Kartu (PNG)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-yellow-900/40 transition-all hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Kartu (PDF)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition cursor-pointer"
            title="Cetak langsung via browser dialog"
          >
            <Share2 className="w-4 h-4" />
            <span>Print Langsung</span>
          </button>
        </div>
      </div>

      {/* Export status notification */}
      {exportMessage && (
        <div className="w-full mb-4 p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs sm:text-sm flex items-center gap-2 animate-pulse print:hidden">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{exportMessage}</span>
        </div>
      )}

      {/* 
        ========================================================================
        KARTU PESERTA TIM SOSCOM 2026 (UKURAN STANDAR B3 VERTIKAL)
        Aspect Ratio: 353mm / 500mm = 0.706 (Width:Height ~ 1 : 1.416)
        Target width on screen: 580px (scalable via CSS container)
        ========================================================================
      */}
      <div className="w-full flex justify-center overflow-x-auto pb-6">
        <div
          ref={cardRef}
          id="printable-b3-card"
          className="relative w-[600px] shrink-0 text-slate-100 p-8 rounded-3xl shadow-2xl overflow-hidden font-sans select-none"
          style={{
            minHeight: '850px',
            aspectRatio: '353 / 500',
            backgroundColor: '#0b132b',
            backgroundImage: `
              radial-gradient(circle at 10% 10%, rgba(0, 240, 255, 0.08) 0%, transparent 40%),
              radial-gradient(circle at 90% 90%, rgba(245, 158, 11, 0.08) 0%, transparent 40%),
              linear-gradient(to right, rgba(0, 240, 255, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 240, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 100% 100%, 30px 30px, 30px 30px',
          }}
        >
          {/* Outer Luxurious Metallic Frame */}
          <div className="absolute inset-3 rounded-2xl border-2 border-amber-400/70 pointer-events-none" />
          <div className="absolute inset-5 rounded-xl border border-cyan-400/40 pointer-events-none" />

          {/* Holographic Geometric Corner Brackets */}
          <div className="absolute top-5 left-5 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl pointer-events-none" />
          <div className="absolute top-5 right-5 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr pointer-events-none" />
          <div className="absolute bottom-5 left-5 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl pointer-events-none" />
          <div className="absolute bottom-5 right-5 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br pointer-events-none" />

          {/* Watermark in background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
            <span className="text-[120px] font-black font-orbitron rotate-[-35deg] tracking-widest text-white">
              SOSCOM
            </span>
          </div>

          {/* CARD HEADER: 3 Logos berdampingan */}
          <div className="relative z-10 flex items-center justify-between border-b border-slate-700/80 pb-4 mb-4 bg-slate-900/60 p-3 rounded-2xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-1 rounded-xl bg-slate-950/60 border border-slate-700/60 shadow flex items-center justify-center">
                <LogoSman1Pangkep size={48} />
              </div>
              <div className="p-1 rounded-xl bg-slate-950/60 border border-slate-700/60 shadow flex items-center justify-center">
                <LogoOsis size={48} />
              </div>
              <div className="p-1 rounded-xl bg-slate-950/60 border border-slate-700/60 shadow flex items-center justify-center">
                <LogoSalty size={48} />
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-950/90 text-cyan-300 border border-cyan-400/50 shadow-sm">
                OFFICIAL TEAM ID
              </span>
              <p className="text-[11px] font-bold text-slate-200 mt-1 font-space">
                UPT SMAN 1 PANGKEP
              </p>
              <p className="text-[9px] text-amber-400 font-medium">
                SALTY Olympic Science
              </p>
            </div>
          </div>

          {/* EVENT & TITLE */}
          <div className="relative z-10 text-center mb-5">
            <p className="text-[11px] font-bold text-amber-400 tracking-[0.25em] uppercase font-space">
              SMANSA OLYMPIC SCIENCE COMPETITION 2026
            </p>
            <h1 className="text-2xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-300 my-0.5">
              KARTU PESERTA TIM SOSCOM 2026
            </h1>
            <p className="text-[11px] italic font-semibold text-cyan-200/90">
              &ldquo;Where Brilliant Mind Rise&rdquo;
            </p>
          </div>

          {/* REGISTRATION NUMBER BADGE (Format: SOSCOM2026-TEAM-XXX) */}
          <div className="relative z-10 flex justify-center mb-5">
            <div className="relative px-6 py-2 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-cyan-400/80 shadow-lg shadow-cyan-950/50 flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                No. Registrasi:
              </span>
              <span className="text-base font-black font-orbitron text-amber-400 tracking-widest">
                {team.noPeserta}
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
          </div>

          {/* TEAM NAME & MOTTO HIGHLIGHT */}
          <div className="relative z-10 p-4 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/80 shadow-inner mb-5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
              Nama Regu / Tim
            </span>
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-wide font-space">
              {team.namaTim}
            </h2>
            <div className="mt-2 pt-2 border-t border-slate-700/50">
              <span className="text-[10px] uppercase font-semibold text-cyan-400/80 block">Motto Tim:</span>
              <p className="text-xs italic text-slate-300 mt-0.5 font-medium px-4">
                &ldquo;{team.mottoTim}&rdquo;
              </p>
            </div>
          </div>

          {/* KETUA TIM SECTION */}
          <div className="relative z-10 p-3.5 rounded-xl bg-slate-900/85 border-l-4 border-amber-400 border-y border-r border-slate-800 shadow-md mb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-400 block">
                  Ketua Tim (Team Leader)
                </span>
                <span className="text-sm font-bold text-white block mt-0.5">
                  {team.ketua.nama}
                </span>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/30">
                  {team.ketua.kelas}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block mt-1">
                  NIS: <strong className="text-slate-200">{team.ketua.nis}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* 5 ANGGOTA TIM TABLE */}
          <div className="relative z-10 rounded-xl bg-slate-900/80 border border-slate-800 p-3 mb-5">
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
                Susunan 5 Orang Anggota Tim
              </span>
              <span className="text-[9px] text-slate-400">Komposisi Penuh</span>
            </div>

            <div className="space-y-1.5">
              {team.anggota.map((ang, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 text-[10px] font-bold flex items-center justify-center border border-cyan-500/40 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-200 truncate max-w-[240px]">
                      {ang.nama}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-700/60 text-slate-300">
                      {ang.kelas}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      NIS: <span className="text-slate-200">{ang.nis}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER: QR CODE + DIGITAL STAMP SALTY + VERIFICATION SIGNATURE */}
          <div className="relative z-10 flex items-center justify-between pt-2 border-t border-slate-700/70 mt-auto">
            {/* Dynamic QR Code */}
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-xl bg-white shadow-lg shadow-cyan-900/30">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="QR Verifikasi Panitia"
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 bg-slate-200 flex items-center justify-center text-[8px] text-slate-700">
                    Loading QR...
                  </div>
                )}
              </div>
              <div className="text-left">
                <span className="text-[9px] font-bold text-cyan-300 block uppercase font-space">
                  Verifikasi Panitia
                </span>
                <span className="text-[8px] text-slate-400 block font-mono">
                  Scan untuk validasi
                </span>
                <span className="text-[8px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
                  <ShieldCheck className="w-3 h-3" /> Status Sah
                </span>
              </div>
            </div>

            {/* Stempel Digital Resmi SALTY (Circular Seal with authentic SALTY logo & stamp border) */}
            <div className="relative group">
              <div className="w-22 h-22 rounded-full border-2 border-dashed border-cyan-400/90 p-1 flex items-center justify-center text-center rotate-[-8deg] shadow-lg shadow-cyan-500/30 bg-cyan-950/60 backdrop-blur-xs">
                <div className="w-full h-full rounded-full border border-amber-400/80 flex flex-col items-center justify-center p-0.5 relative overflow-hidden bg-slate-900/60">
                  <img
                    src="/assets/aistudio/Logo_Salty_32274dc5.png"
                    alt="Cap Stempel SALTY"
                    className="w-10 h-10 object-contain drop-shadow"
                  />
                  <span className="text-[5.5px] font-black text-amber-300 uppercase tracking-tighter leading-tight mt-0.5">
                    ★ SALTY VERIFIED ★
                  </span>
                  <span className="text-[4.5px] font-bold text-cyan-300 uppercase tracking-tighter">
                    SMAN 1 PANGKEP
                  </span>
                </div>
              </div>
            </div>

            {/* Official Signature Section */}
            <div className="text-right">
              <p className="text-[8.5px] text-slate-400">Pangkajene, 2026</p>
              <p className="text-[8.5px] font-semibold text-slate-300">Ketua Panitia SOSCOM,</p>
              <div className="my-1 flex justify-end">
                {/* Stylized digital signature path */}
                <svg width="65" height="22" viewBox="0 0 100 35" fill="none" className="text-cyan-400">
                  <path
                    d="M5 25 Q20 5 35 22 T65 15 T95 20"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M15 30 L45 28 L75 32"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="text-[9px] font-bold text-amber-300 uppercase">
                SALTY ORGANIZING COMMITTEE
              </p>
            </div>
          </div>

          {/* Bottom Barcode Strip */}
          <div className="relative z-10 mt-3 pt-2 border-t border-slate-800 text-center">
            <div className="flex justify-center items-center gap-1 opacity-70 mb-0.5">
              {[...Array(28)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-300 h-3"
                  style={{
                    width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1.5 : 2)}px`,
                  }}
                />
              ))}
            </div>
            <p className="text-[8px] font-mono text-slate-400 tracking-wider">
              SMAN 1 PANGKEP • SOSCOM 2026 • SALTY OFFICIAL DOCUMENT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
