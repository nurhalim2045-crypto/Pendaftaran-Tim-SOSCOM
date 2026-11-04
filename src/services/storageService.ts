import { TeamRegistration, ValidationResult, AppSettings } from '../types';

const STORAGE_KEY = 'soscom_2026_registrations';
const SETTINGS_KEY = 'soscom_2026_settings';

// Seed demo teams for immediate testability and realistic verification
const SEED_TEAMS: TeamRegistration[] = [
  {
    id: 'team-demo-001',
    noPeserta: 'SOSCOM2026-TEAM-001',
    timestamp: '2026-11-01 09:15:00',
    namaTim: 'Quantum Pioneers',
    mottoTim: 'Menembus Batas Sains, Meraih Puncak Cakrawala!',
    ketua: {
      nama: 'Muhammad Fadil Ramadhan',
      kelas: 'Kelas 11',
      nis: '21045',
    },
    anggota: [
      { nama: 'Aisyah Nur Salsabila', kelas: 'Kelas 11', nis: '21052' },
      { nama: 'Reza Pratama Putra', kelas: 'Kelas 11', nis: '21063' },
      { nama: 'Nurul Annisa', kelas: 'Kelas 10', nis: '22014' },
      { nama: 'Farhan Maulana', kelas: 'Kelas 10', nis: '22028' },
      { nama: 'Siti Zahra Amalia', kelas: 'Kelas 10', nis: '22045' },
    ],
    syncedWithSheets: true,
  },
  {
    id: 'team-demo-002',
    noPeserta: 'SOSCOM2026-TEAM-002',
    timestamp: '2026-11-02 14:30:00',
    namaTim: 'Cybernetic Helix',
    mottoTim: 'Inovasi Tanpa Batas, Dedikasi untuk Almamater Tercinta.',
    ketua: {
      nama: 'Andi Batara Surya',
      kelas: 'Kelas 11',
      nis: '21077',
    },
    anggota: [
      { nama: 'Dewi Lestari', kelas: 'Kelas 11', nis: '21088' },
      { nama: 'Irfan Hakim', kelas: 'Kelas 10', nis: '22055' },
      { nama: 'Nabila Putri Azzahra', kelas: 'Kelas 10', nis: '22067' },
      { nama: 'Dimas Aditya', kelas: 'Kelas 11', nis: '21099' },
      { nama: 'Kayla Safitri', kelas: 'Kelas 10', nis: '22080' },
    ],
    syncedWithSheets: true,
  },
];

export const getSavedTeams = (): TeamRegistration[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TEAMS));
    return SEED_TEAMS;
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : SEED_TEAMS;
  } catch {
    return SEED_TEAMS;
  }
};

export const saveTeams = (teams: TeamRegistration[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
};

export const getAppSettings = (): AppSettings => {
  if (typeof window === 'undefined') {
    return { webhookUrl: '', soundEnabled: true };
  }
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) {
    const defaults: AppSettings = {
      webhookUrl: 'https://script.google.com/macros/s/AKfycbz_SOSCOM2026_MOCK_DEMO/exec',
      soundEnabled: true,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaults));
    return defaults;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return { webhookUrl: '', soundEnabled: true };
  }
};

export const saveAppSettings = (settings: AppSettings) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

/**
 * Generates the next sequential registration number: SOSCOM2026-TEAM-XXX
 */
export const generateNextTeamNumber = (teams: TeamRegistration[]): string => {
  const count = teams.length + 1;
  const padded = count.toString().padStart(3, '0');
  return `SOSCOM2026-TEAM-${padded}`;
};

/**
 * Validates duplication against existing registrations and within the current team.
 */
export const checkDuplicate = (
  newTeam: Omit<TeamRegistration, 'id' | 'noPeserta' | 'timestamp'>,
  existingTeams: TeamRegistration[],
  excludeTeamId?: string
): ValidationResult => {
  const normNewName = newTeam.namaTim.trim().toLowerCase();

  // 1. Check duplicate within the current form (internal duplicates among members)
  const currentNisList: { role: string; nis: string; name: string }[] = [];
  const ketuaNis = newTeam.ketua.nis.trim();
  if (ketuaNis) {
    currentNisList.push({ role: 'Ketua', nis: ketuaNis, name: newTeam.ketua.nama.trim() });
  }

  for (let i = 0; i < newTeam.anggota.length; i++) {
    const a = newTeam.anggota[i];
    const nis = a.nis.trim();
    if (nis) {
      const match = currentNisList.find((item) => item.nis === nis);
      if (match) {
        return {
          isValid: false,
          errorMessage: `NIS ${nis} dimasukkan ganda dalam tim yang sama (${match.role} "${match.name}" dan Anggota ${i + 1} "${a.nama}"). Setiap peserta harus memiliki NIS unik!`,
          duplicateField: 'nisInternal',
          duplicateValue: nis,
        };
      }
      currentNisList.push({ role: `Anggota ${i + 1}`, nis, name: a.nama.trim() });
    }
  }

  // Filter out the team being edited if any
  const teamsToCheck = excludeTeamId
    ? existingTeams.filter((t) => t.id !== excludeTeamId)
    : existingTeams;

  // 2. Check duplicate Team Name
  const existingTeamWithSameName = teamsToCheck.find(
    (t) => t.namaTim.trim().toLowerCase() === normNewName
  );
  if (existingTeamWithSameName) {
    return {
      isValid: false,
      errorMessage: `Nama Tim "${newTeam.namaTim.trim()}" sudah pernah didaftarkan sebelumnya oleh Nomor Peserta ${existingTeamWithSameName.noPeserta}! Harap gunakan nama tim lain yang unik.`,
      duplicateField: 'namaTim',
      duplicateValue: newTeam.namaTim,
      existingTeamName: existingTeamWithSameName.namaTim,
    };
  }

  // 3. Check duplicate NIS against all existing registered teams
  for (const team of teamsToCheck) {
    // Check ketua NIS
    if (team.ketua.nis.trim() === ketuaNis) {
      return {
        isValid: false,
        errorMessage: `NIS Ketua (${ketuaNis} - "${newTeam.ketua.nama}") sudah terdaftar sebelumnya di tim "${team.namaTim}" (${team.noPeserta}) sebagai Ketua!`,
        duplicateField: 'nisKetua',
        duplicateValue: ketuaNis,
        existingTeamName: team.namaTim,
      };
    }

    // Check ketua NIS against existing anggota
    const matchKetuaInAnggota = team.anggota.find((a) => a.nis.trim() === ketuaNis);
    if (matchKetuaInAnggota) {
      return {
        isValid: false,
        errorMessage: `NIS Ketua (${ketuaNis} - "${newTeam.ketua.nama}") sudah terdaftar sebelumnya di tim "${team.namaTim}" (${team.noPeserta}) sebagai Anggota ("${matchKetuaInAnggota.nama}")!`,
        duplicateField: 'nisKetua',
        duplicateValue: ketuaNis,
        existingTeamName: team.namaTim,
      };
    }

    // Check each new anggota against existing team members & ketua
    for (let i = 0; i < newTeam.anggota.length; i++) {
      const a = newTeam.anggota[i];
      const angNis = a.nis.trim();

      if (team.ketua.nis.trim() === angNis) {
        return {
          isValid: false,
          errorMessage: `NIS Anggota ${i + 1} (${angNis} - "${a.nama}") sudah terdaftar sebelumnya di tim "${team.namaTim}" (${team.noPeserta}) sebagai Ketua ("${team.ketua.nama}")!`,
          duplicateField: 'nisAnggota',
          duplicateValue: angNis,
          existingTeamName: team.namaTim,
        };
      }

      const matchAnggotaInAnggota = team.anggota.find((exA) => exA.nis.trim() === angNis);
      if (matchAnggotaInAnggota) {
        return {
          isValid: false,
          errorMessage: `NIS Anggota ${i + 1} (${angNis} - "${a.nama}") sudah terdaftar sebelumnya di tim "${team.namaTim}" (${team.noPeserta}) sebagai Anggota ("${matchAnggotaInAnggota.nama}")!`,
          duplicateField: 'nisAnggota',
          duplicateValue: angNis,
          existingTeamName: team.namaTim,
        };
      }
    }
  }

  return { isValid: true };
};
