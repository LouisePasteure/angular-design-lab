import {
  ADMIN_ASSIGNMENTS,
  type AccessStatus,
  type Category,
  type WorkStatus,
} from "@/lib/admin-data";

export type AssignmentStatus = WorkStatus;
export type AccessState = AccessStatus;
export type { Category };

export interface Assignment {
  id: string;
  customerId: string;
  title: string;
  category: Category;
  createdAt: string;
  deadline: string;
  workStatus: WorkStatus;
  progress: number;
  accessStatus: AccessStatus;
}

export const CATEGORIES: Category[] = [
  "Machine Learning / Deep Learning",
  "Skripsi",
  "Makalah / Artikel",
  "Olah Data",
  "Presentasi",
  "Lainnya",
];
export const STATUSES: WorkStatus[] = ["Draft", "Sedang Dikerjakan", "Menunggu Review", "Selesai"];
export const ACCESS_STATES: AccessStatus[] = ["Belum Tersedia", "Terkunci", "Dapat Diakses"];
export const NOW = new Date("2026-10-04T09:00:00+07:00");
export const CURRENT_CUSTOMER_ID = "CU-1001";
export const USER = {
  id: CURRENT_CUSTOMER_ID,
  username: "aditya.p",
  role: "Customer",
  initials: "AP",
  whatsappMasked: "+62 812-****-7890",
};

export const ASSIGNMENTS: Assignment[] = ADMIN_ASSIGNMENTS.map((item) => ({
  id: item.id,
  customerId: item.customerId,
  title: item.title,
  category: item.category,
  createdAt: item.createdAt,
  deadline: item.deadline,
  workStatus: item.workStatus,
  progress: item.progress,
  accessStatus: item.accessStatus,
}));

export const getAssignment = (id: string) => ASSIGNMENTS.find((item) => item.id === id);

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
function wib(iso: string) {
  const value = new Date(new Date(iso).getTime() + 7 * 3600_000);
  return {
    day: value.getUTCDate(),
    month: value.getUTCMonth(),
    year: value.getUTCFullYear(),
    h: value.getUTCHours(),
    m: value.getUTCMinutes(),
  };
}
const pad = (value: number) => String(value).padStart(2, "0");
export const formatDate = (iso: string) => {
  const value = wib(iso);
  return `${value.day} ${MONTHS[value.month]} ${value.year}`;
};
export const formatShortDate = (iso: string) => {
  const value = wib(iso);
  return `${value.day} ${SHORT[value.month]} ${value.year}`;
};
export const formatDateTime = (iso: string) => {
  const value = wib(iso);
  return `${value.day} ${MONTHS[value.month]} ${value.year}, ${pad(value.h)}.${pad(value.m)} WIB`;
};
export const formatTime = (iso: string) => {
  const value = wib(iso);
  return `${pad(value.h)}.${pad(value.m)}`;
};
export function timeLeft(iso: string) {
  const ms = new Date(iso).getTime() - NOW.getTime();
  if (ms <= 0) return { label: "Lewat deadline", urgent: false, past: true };
  const hours = Math.floor(ms / 3600_000);
  const days = Math.floor(hours / 24);
  return {
    label:
      days >= 1
        ? `${days} hari ${hours % 24} jam lagi`
        : `${hours} jam ${Math.floor((ms % 3600_000) / 60000)} menit lagi`,
    urgent: hours < 24,
    past: false,
  };
}
export const isActive = (assignment: Assignment) =>
  ["Sedang Dikerjakan", "Menunggu Review"].includes(assignment.workStatus);
export const ACTIVITIES = [
  { id: 1, title: "Hasil masuk tahap review", ref: "TT-24018", at: "2026-10-03T10:24:00+07:00" },
  {
    id: 2,
    title: "Progress diperbarui menjadi 80%",
    ref: "TT-24018",
    at: "2026-10-02T08:10:00+07:00",
  },
  { id: 3, title: "Tagihan diterbitkan", ref: "INV-260018", at: "2026-10-03T09:00:00+07:00" },
];

export interface PortalNotification {
  id: string;
  title: string;
  assignmentId: string;
  at: string;
  read: boolean;
}
export const INITIAL_NOTIFICATIONS: PortalNotification[] = [
  {
    id: "n1",
    title: "Progress penugasan diperbarui menjadi 80%",
    assignmentId: "TT-24018",
    at: "2026-10-03T10:24:00+07:00",
    read: false,
  },
  {
    id: "n2",
    title: "Tagihan baru telah diterbitkan",
    assignmentId: "TT-24018",
    at: "2026-10-03T09:02:00+07:00",
    read: false,
  },
  {
    id: "n3",
    title: "Hasil masuk tahap pemeriksaan",
    assignmentId: "TT-24018",
    at: "2026-10-02T11:30:00+07:00",
    read: true,
  },
];
