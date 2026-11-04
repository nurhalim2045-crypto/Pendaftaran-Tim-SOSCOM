import { TeamRegistration } from '../types';

export interface WebhookPayload {
  timestamp: string;
  namaTim: string;
  mottoTim: string;
  ketua: {
    nama: string;
    kelas: string;
    nis: string;
  };
  anggota: Array<{
    nama: string;
    kelas: string;
    nis: string;
  }>;
  noPeserta: string;
}

/**
 * Sends registration payload to Google Apps Script Web App
 */
export const sendToGoogleSheets = async (
  team: TeamRegistration,
  webhookUrl: string
): Promise<{ success: boolean; message: string; simulated?: boolean }> => {
  const payload: WebhookPayload = {
    timestamp: team.timestamp,
    namaTim: team.namaTim,
    mottoTim: team.mottoTim,
    ketua: {
      nama: team.ketua.nama,
      kelas: team.ketua.kelas,
      nis: team.ketua.nis,
    },
    anggota: team.anggota.map((a) => ({
      nama: a.nama,
      kelas: a.kelas,
      nis: a.nis,
    })),
    noPeserta: team.noPeserta,
  };

  // If no URL or placeholder/demo URL is provided, simulate a successful sync
  if (!webhookUrl || webhookUrl.includes('MOCK_DEMO')) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      success: true,
      message: 'Tersimpan lokal & sinkronisasi Google Sheets disimulasikan (URL Webhook masih berupa Demo/Default).',
      simulated: true,
    };
  }

  try {
    // Google Apps Script Web Apps require POST with JSON text.
    // Note: Due to Google redirect 302, mode: 'no-cors' ensures the POST request lands on the Apps Script endpoint.
    const response = await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // In 'no-cors' mode, response.type is 'opaque', status is 0, but request is successfully transmitted
    return {
      success: true,
      message: 'Data berhasil dikirim ke Google Sheets (Web App Webhook terpanggil).',
      simulated: false,
    };
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Koneksi gagal';
    console.warn('Webhook Google Sheets error:', error);
    return {
      success: false,
      message: `Gagal mengirim ke Webhook Google Sheets: ${errMessage}. Data tetap aman tersimpan di browser (Lokal).`,
      simulated: false,
    };
  }
};

/**
 * Ready-to-use Google Apps Script code for the panitia to paste into Google Sheets:
 * Extensions > Apps Script > Paste & Deploy as Web App (Anyone)
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * ====================================================================
 * SOSCOM 2026 - GOOGLE APPS SCRIPT WEBHOOK RECEIVER
 * SMAN 1 Pangkajene dan Kepulauan & Komunitas SALTY
 * ====================================================================
 * CARA PEMASANGAN:
 * 1. Buka Google Spreadsheet baru.
 * 2. Beri nama sheet pertama: "Pendaftar_SOSCOM2026"
 * 3. Buka menu Extensions > Apps Script.
 * 4. Hapus isi lama, lalu Paste kode di bawah ini.
 * 5. Klik "Deploy" > "New deployment".
 * 6. Pilih type "Web app".
 * 7. Set "Execute as": Me (email Anda).
 * 8. Set "Who has access": Anyone (PENTING!).
 * 9. Salin URL Web App dan tempelkan pada menu Pengaturan Webhook SOSCOM 2026.
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Pendaftar_SOSCOM2026");
    
    if (!sheet) {
      sheet = ss.insertSheet("Pendaftar_SOSCOM2026");
      // Header tabel otomatis
      sheet.appendRow([
        "Timestamp",
        "No Peserta",
        "Nama Tim",
        "Motto Tim",
        "Ketua (Nama)",
        "Ketua (Kelas)",
        "Ketua (NIS)",
        "Anggota 1 (Nama)", "Anggota 1 (Kelas)", "Anggota 1 (NIS)",
        "Anggota 2 (Nama)", "Anggota 2 (Kelas)", "Anggota 2 (NIS)",
        "Anggota 3 (Nama)", "Anggota 3 (Kelas)", "Anggota 3 (NIS)",
        "Anggota 4 (Nama)", "Anggota 4 (Kelas)", "Anggota 4 (NIS)",
        "Anggota 5 (Nama)", "Anggota 5 (Kelas)", "Anggota 5 (NIS)"
      ]);
      // Format header
      sheet.getRange(1, 1, 1, 22).setBackground("#0b132b").setFontColor("#38bdf8").setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    var data = JSON.parse(e.postData.contents);
    
    var row = [
      data.timestamp || new Date(),
      data.noPeserta,
      data.namaTim,
      data.mottoTim,
      data.ketua ? data.ketua.nama : "",
      data.ketua ? data.ketua.kelas : "",
      data.ketua ? data.ketua.nis : ""
    ];

    if (data.anggota && Array.isArray(data.anggota)) {
      for (var i = 0; i < 5; i++) {
        var m = data.anggota[i] || {};
        row.push(m.nama || "");
        row.push(m.kelas || "");
        row.push(m.nis || "");
      }
    }

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Data tim berhasil dicatat!" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Webhook SOSCOM 2026 Aktif & Siap Menerima Data.");
}
`;
