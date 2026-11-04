export interface TeamMember {
  nama: string;
  kelas: 'Kelas 10' | 'Kelas 11' | '';
  nis: string;
}

export interface TeamRegistration {
  id: string;
  noPeserta: string; // e.g. SOSCOM2026-TEAM-001
  timestamp: string;
  namaTim: string;
  mottoTim: string;
  ketua: TeamMember;
  anggota: [TeamMember, TeamMember, TeamMember, TeamMember, TeamMember];
  syncedWithSheets?: boolean;
  sheetsError?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  duplicateField?: 'namaTim' | 'nisKetua' | 'nisAnggota' | 'nisInternal';
  duplicateValue?: string;
  existingTeamName?: string;
}

export interface AppSettings {
  webhookUrl: string;
  soundEnabled: boolean;
}
