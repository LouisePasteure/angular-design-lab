// Dummy data for the client portal (frontend-only phase).
export type AssignmentStatus =
  | "Menunggu Konfirmasi"
  | "Sedang Dikerjakan"
  | "Menunggu Review"
  | "Revisi"
  | "Revisi Diajukan"
  | "Selesai"
  | "Dibatalkan";

export type AccessState = "Belum tersedia" | "Terkunci" | "Dapat diakses";

export type Category = "Olah Data" | "Penyuntingan" | "Presentasi" | "Review Dokumen" | "Infografis" | "Konsultasi";

export interface Assignment {
  id: string;
  title: string;
  category: Category;
  createdAt: string; // ISO
  deadline: string; // ISO
  status: AssignmentStatus;
  progress: number;
  access: AccessState;
}

export const CATEGORIES: Category[] = ["Olah Data", "Penyuntingan", "Presentasi", "Review Dokumen", "Infografis", "Konsultasi"];
export const STATUSES: AssignmentStatus[] = ["Menunggu Konfirmasi", "Sedang Dikerjakan", "Menunggu Review", "Revisi", "Selesai", "Dibatalkan"];
export const ACCESS_STATES: AccessState[] = ["Belum tersedia", "Terkunci", "Dapat diakses"];

/** Fixed "now" so dummy countdowns are deterministic (and SSR-safe). */
export const NOW = new Date("2026-10-01T13:00:00+07:00");

export const USER = { name: "Muhammad Firdaus", firstName: "Firdaus", role: "Client", email: "firdaus@example.com", initials: "MF" };

export const ASSIGNMENTS: Assignment[] = [
  { id: "TT-2026-00124", title: "Analisis Data Penelitian", category: "Olah Data", createdAt: "2026-09-28T09:00:00+07:00", deadline: "2026-10-04T20:00:00+07:00", status: "Sedang Dikerjakan", progress: 60, access: "Belum tersedia" },
  { id: "TT-2026-00122", title: "Infografis Hasil Survei Kepuasan", category: "Infografis", createdAt: "2026-09-27T14:10:00+07:00", deadline: "2026-10-06T12:00:00+07:00", status: "Sedang Dikerjakan", progress: 35, access: "Belum tersedia" },
  { id: "TT-2026-00121", title: "Review Dokumen Laporan Magang", category: "Review Dokumen", createdAt: "2026-09-26T10:30:00+07:00", deadline: "2026-10-08T17:00:00+07:00", status: "Sedang Dikerjakan", progress: 20, access: "Belum tersedia" },
  { id: "TT-2026-00119", title: "Penyuntingan Proposal Penelitian", category: "Penyuntingan", createdAt: "2026-09-25T08:45:00+07:00", deadline: "2026-10-02T17:00:00+07:00", status: "Menunggu Review", progress: 85, access: "Terkunci" },
  { id: "TT-2026-00117", title: "Desain Presentasi Seminar", category: "Presentasi", createdAt: "2026-09-23T16:00:00+07:00", deadline: "2026-10-01T15:00:00+07:00", status: "Revisi", progress: 90, access: "Terkunci" },
  { id: "TT-2026-00112", title: "Konsultasi Metodologi Skripsi", category: "Konsultasi", createdAt: "2026-09-18T11:00:00+07:00", deadline: "2026-09-24T19:00:00+07:00", status: "Selesai", progress: 100, access: "Dapat diakses" },
  { id: "TT-2026-00108", title: "Olah Data Kuesioner SPSS", category: "Olah Data", createdAt: "2026-09-12T13:20:00+07:00", deadline: "2026-09-19T20:00:00+07:00", status: "Selesai", progress: 100, access: "Dapat diakses" },
  { id: "TT-2026-00103", title: "Penyuntingan Artikel Jurnal", category: "Penyuntingan", createdAt: "2026-09-05T09:15:00+07:00", deadline: "2026-09-12T17:00:00+07:00", status: "Selesai", progress: 100, access: "Terkunci" },
];

export const getAssignment = (id: string) => ASSIGNMENTS.find((a) => a.id === id);

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// Format in WIB regardless of the viewer's timezone.
function wib(iso: string) {
  const d = new Date(new Date(iso).getTime() + 7 * 3600_000);
  return { day: d.getUTCDate(), month: d.getUTCMonth(), year: d.getUTCFullYear(), h: d.getUTCHours(), m: d.getUTCMinutes() };
}
const pad = (n: number) => String(n).padStart(2, "0");

export const formatDate = (iso: string) => {
  const d = wib(iso);
  return `${d.day} ${MONTHS[d.month]} ${d.year}`;
};
export const formatShortDate = (iso: string) => {
  const d = wib(iso);
  return `${d.day} ${SHORT[d.month]} ${d.year}`;
};
export const formatDateTime = (iso: string) => {
  const d = wib(iso);
  return `${d.day} ${MONTHS[d.month]} ${d.year}, ${pad(d.h)}.${pad(d.m)} WIB`;
};
export const formatTime = (iso: string) => {
  const d = wib(iso);
  return `${pad(d.h)}.${pad(d.m)}`;
};

export function timeLeft(iso: string) {
  const ms = new Date(iso).getTime() - NOW.getTime();
  if (ms <= 0) return { label: "Lewat deadline", urgent: false, past: true };
  const hours = Math.floor(ms / 3600_000);
  const days = Math.floor(hours / 24);
  const label = days >= 1 ? `${days} hari ${hours % 24} jam lagi` : `${hours} jam ${Math.floor((ms % 3600_000) / 60000)} menit lagi`;
  return { label, urgent: hours < 24, past: false };
}

export const isActive = (a: Assignment) => ["Sedang Dikerjakan", "Menunggu Review", "Revisi", "Revisi Diajukan"].includes(a.status);

export const ACTIVITIES = [
  { id: 1, title: "Admin memperbarui progres menjadi 60%", ref: "TT-2026-00124", at: "2026-10-01T10:24:00+07:00" },
  { id: 2, title: "File referensi telah diperiksa", ref: "TT-2026-00122", at: "2026-10-01T08:10:00+07:00" },
  { id: 3, title: "Penugasan masuk tahap review", ref: "TT-2026-00119", at: "2026-09-30T16:45:00+07:00" },
  { id: 4, title: "Hasil versi pertama telah diunggah", ref: "TT-2026-00117", at: "2026-09-30T11:30:00+07:00" },
  { id: 5, title: "Permintaan revisi diterima", ref: "TT-2026-00117", at: "2026-09-29T19:05:00+07:00" },
];

export interface PortalNotification {
  id: string;
  title: string;
  assignmentId: string;
  at: string;
  read: boolean;
}

export const INITIAL_NOTIFICATIONS: PortalNotification[] = [
  { id: "n1", title: "Progress penugasan diperbarui menjadi 60%", assignmentId: "TT-2026-00124", at: "2026-10-01T10:24:00+07:00", read: false },
  { id: "n2", title: "Admin menambahkan catatan baru", assignmentId: "TT-2026-00124", at: "2026-10-01T09:02:00+07:00", read: false },
  { id: "n3", title: "Hasil pengerjaan telah diunggah", assignmentId: "TT-2026-00117", at: "2026-09-30T11:30:00+07:00", read: false },
  { id: "n4", title: "Akses hasil telah dibuka", assignmentId: "TT-2026-00112", at: "2026-09-24T20:15:00+07:00", read: true },
  { id: "n5", title: "Permintaan revisi telah diterima", assignmentId: "TT-2026-00117", at: "2026-09-29T19:05:00+07:00", read: true },
];
