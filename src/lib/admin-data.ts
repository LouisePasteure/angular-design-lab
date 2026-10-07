// Frontend-only mock domain model. Real authentication, secret hashing, rate limiting,
// authorization, and persistence must be implemented by a trusted backend.
export type AccountStatus = "Aktif" | "Nonaktif" | "Ditangguhkan" | "Terkunci";
export type CredentialStatus = "Password Sementara" | "Aktif" | "Perlu Reset";
export type WorkStatus = "Draft" | "Sedang Dikerjakan" | "Menunggu Review" | "Selesai";
export type PaymentStatus =
  | "Belum Ditagihkan"
  | "Menunggu Pembayaran"
  | "Menunggu Verifikasi"
  | "Lunas"
  | "Gagal"
  | "Kedaluwarsa";
export type AccessStatus = "Belum Tersedia" | "Terkunci" | "Dapat Diakses";
export type AssignmentAccessTokenStatus = "Aktif" | "Dicabut" | "Kedaluwarsa";
export type ActivationStatus = "Belum digunakan" | "Sudah digunakan" | "Kedaluwarsa" | "Dicabut";
export type Priority = "Rendah" | "Normal" | "Tinggi" | "Urgent";
export type ResultFileStatus = "Draft" | "Published";
export type VoucherType = "Persentase" | "Nominal Tetap";
export type VoucherStatus = "Aktif" | "Terjadwal" | "Kedaluwarsa" | "Nonaktif";
export type ModerationStatus = "Menunggu Moderasi" | "Disetujui" | "Ditolak" | "Disembunyikan";
export type PublicIdentityPreference = "Username" | "Inisial username" | "Anonim";
export type RevisionStatus =
  "Baru" | "Ditinjau" | "Dikerjakan" | "Menunggu Review" | "Selesai" | "Ditolak";
export type Category =
  | "Machine Learning / Deep Learning"
  | "Skripsi"
  | "Makalah / Artikel"
  | "Presentasi"
  | "Olah Data"
  | "Lainnya";
export type WorkerRole = "Super Admin" | "Admin Operasional" | "Worker" | "Reviewer" | "Finance";
export type WorkerStatus = "Aktif" | "Nonaktif" | "Ditangguhkan" | "Diarsipkan";
export type Permission =
  | "dashboard:view"
  | "assignment:view"
  | "assignment:manage"
  | "assignment:own"
  | "result:manage"
  | "review:manage"
  | "customer:manage"
  | "worker:manage"
  | "finance:manage"
  | "report:view"
  | "settings:manage"
  | "audit:view";

export type AssignmentFileCategory = "assignment" | "supporting";
export type FileVisibility = "admin_only" | "customer_visible";
export type SocialPlatform =
  "Instagram" | "TikTok" | "WhatsApp" | "YouTube" | "X" | "LinkedIn" | "Email";

export interface Customer {
  id: string;
  username: string;
  whatsapp: string;
  internalNote: string;
  accountStatus: AccountStatus;
  credentialStatus: CredentialStatus;
  activationStatus: ActivationStatus;
  passwordDigest: string;
  activationTokenDigest?: string;
  activationTokenCreatedAt?: string;
  activationTokenExpiresAt?: string;
  activationTokenUsedAt?: string;
  activationTokenRevokedAt?: string;
  forcePasswordChange: boolean;
  createdAt: string;
  activatedAt?: string;
  lastLoginAt?: string;
  lastActiveAt?: string;
  lastSeenRoute?: string;
  loginCount: number;
  archivedAt?: string;
  deletedAt?: string;
  lastReviewedAt?: string;
  usernameChangedAt?: string;
  createdBy: string;
  updatedAt: string;
}

export interface Worker {
  id: string;
  fullName: string;
  username: string;
  whatsapp: string;
  role: WorkerRole;
  status: WorkerStatus;
  specialties: Category[];
  maxActiveAssignments: number;
  internalNote: string;
  passwordDigest: string;
  credentialStatus: CredentialStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastActiveAt?: string;
  createdBy: string;
  archivedAt?: string;
  deletedAt?: string;
}

export interface AssignmentFile {
  id: string;
  assignmentId: string;
  name: string;
  mimeType: string;
  size: string;
  category: AssignmentFileCategory;
  description: string;
  uploadedAt: string;
  uploadedBy: string;
  visibility: FileVisibility;
}

export interface AdminResultFile {
  id: string;
  name: string;
  format: string;
  size: string;
  uploadedAt: string;
  version: string;
  status: ResultFileStatus;
  description: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  actorId?: string;
  actorRole?: string;
  action: string;
  entityType:
    | "Customer"
    | "Worker"
    | "Assignment"
    | "File"
    | "Result"
    | "Invoice"
    | "Payment"
    | "Voucher"
    | "Feedback"
    | "Activation"
    | "Social"
    | "Login";
  entityId: string;
  before?: string;
  after?: string;
  note?: string;
  timestamp: string;
}

export interface AdminAssignment {
  id: string;
  customerId: string;
  title: string;
  category: Category;
  topic: string;
  description: string;
  educationLevel: string;
  output: string;
  outputFormat: string;
  initialEstimate?: number;
  deadline: string;
  workStatus: WorkStatus;
  progress: number;
  accessStatus: AccessStatus;
  accessReason: string;
  assignmentAccessTokenDigest?: string | undefined;
  assignmentAccessTokenStatus: AssignmentAccessTokenStatus;
  assignmentAccessTokenCreatedAt?: string | undefined;
  assignmentAccessTokenExpiresAt?: string | undefined;
  assignmentAccessTokenLastUsedAt?: string | undefined;
  accessOpenedAt?: string;
  accessOpenedBy?: string;
  primaryWorkerId?: string | undefined;
  supportingWorkerIds: string[];
  reviewerWorkerId?: string | undefined;
  assignedAt?: string;
  assignedBy?: string;
  startedAt?: string;
  reviewStartedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  lastProgressUpdatedAt?: string;
  priority: Priority;
  publicProgressNote: string;
  createdAt: string;
  createdBy: string;
  internalNote: string;
  sourceFiles: AssignmentFile[];
  files: AdminResultFile[];
  audit: AuditEntry[];
}

export interface Invoice {
  id: string;
  assignmentId: string;
  customerId: string;
  subtotal: number;
  voucherId?: string;
  discountAmount: number;
  total: number;
  issuedAt?: string;
  dueAt?: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentReference: string;
  note: string;
  verifiedAt?: string;
  verifiedBy?: string;
  revenueWorkerId?: string;
}

export interface Voucher {
  id: string;
  code: string;
  name: string;
  description: string;
  type: VoucherType;
  value: number;
  maxDiscount?: number;
  minimumTransaction: number;
  validFrom: string;
  validUntil: string;
  assignedCustomerIds: string[];
  usageLimit: number;
  usageCount: number;
  status: VoucherStatus;
  createdBy: string;
  createdAt: string;
  internalNote: string;
}

export interface Feedback {
  id: string;
  assignmentId: string;
  customerId: string;
  rating: number;
  comment: string;
  publicationConsent: boolean;
  publicIdentityPreference: PublicIdentityPreference;
  moderationStatus: ModerationStatus;
  homepageVisible: boolean;
  publicComment: string;
  publicIdentitySnapshot?: string;
  submittedAt: string;
  moderatedAt?: string;
  moderatedBy?: string;
  internalNote: string;
}

export interface SocialLinkSetting {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
  iconKey: SocialPlatform;
  enabled: boolean;
  order: number;
  openInNewTab: boolean;
}

export interface RevisionRequest {
  id: string;
  assignmentId: string;
  customerId: string;
  file: string;
  type: string;
  message: string;
  support: string;
  receivedAt: string;
  deadline: string;
  status: RevisionStatus;
  workerId?: string;
  internalNote: string;
}

export const CATEGORIES: Category[] = [
  "Machine Learning / Deep Learning",
  "Skripsi",
  "Makalah / Artikel",
  "Presentasi",
  "Olah Data",
  "Lainnya",
];
export const WORK_STATUSES: WorkStatus[] = [
  "Draft",
  "Sedang Dikerjakan",
  "Menunggu Review",
  "Selesai",
];
export const ACCESS_STATUSES: AccessStatus[] = ["Belum Tersedia", "Terkunci", "Dapat Diakses"];
export const PAYMENT_STATUSES: PaymentStatus[] = [
  "Belum Ditagihkan",
  "Menunggu Pembayaran",
  "Menunggu Verifikasi",
  "Lunas",
  "Gagal",
  "Kedaluwarsa",
];
export const INITIAL_WORKERS: Worker[] = [
  {
    id: "WK-001",
    fullName: "Raka Pradana",
    username: "raka",
    whatsapp: "+6281110001001",
    role: "Super Admin",
    status: "Aktif",
    specialties: ["Machine Learning / Deep Learning", "Olah Data"],
    maxActiveAssignments: 6,
    internalNote: "Pemilik workspace mock.",
    passwordDigest: "cf02b4e5dbfd74aa3d407f80508b0109287c908cfc111f490d5fcfe0c843e0be",
    credentialStatus: "Aktif",
    createdAt: "2026-01-05T09:00:00+07:00",
    updatedAt: "2026-10-04T08:30:00+07:00",
    lastLoginAt: "2026-10-04T08:30:00+07:00",
    lastActiveAt: "2026-10-04T09:00:00+07:00",
    createdBy: "Sistem",
  },
  {
    id: "WK-002",
    fullName: "Dinda Maharani",
    username: "dinda",
    whatsapp: "+6281220002002",
    role: "Admin Operasional",
    status: "Aktif",
    specialties: ["Skripsi", "Presentasi"],
    maxActiveAssignments: 4,
    internalNote: "Koordinator operasional.",
    passwordDigest: "cf02b4e5dbfd74aa3d407f80508b0109287c908cfc111f490d5fcfe0c843e0be",
    credentialStatus: "Aktif",
    createdAt: "2026-02-10T09:00:00+07:00",
    updatedAt: "2026-10-03T14:00:00+07:00",
    lastLoginAt: "2026-10-03T08:00:00+07:00",
    lastActiveAt: "2026-10-03T14:00:00+07:00",
    createdBy: "WK-001",
  },
  {
    id: "WK-003",
    fullName: "Alya Ramadhani",
    username: "alya",
    whatsapp: "+6281330003003",
    role: "Reviewer",
    status: "Aktif",
    specialties: ["Makalah / Artikel", "Skripsi"],
    maxActiveAssignments: 3,
    internalNote: "Reviewer editorial.",
    passwordDigest: "cf02b4e5dbfd74aa3d407f80508b0109287c908cfc111f490d5fcfe0c843e0be",
    credentialStatus: "Aktif",
    createdAt: "2026-03-12T09:00:00+07:00",
    updatedAt: "2026-10-02T12:00:00+07:00",
    lastLoginAt: "2026-10-02T09:00:00+07:00",
    lastActiveAt: "2026-10-02T12:00:00+07:00",
    createdBy: "WK-001",
  },
  {
    id: "WK-004",
    fullName: "Bagas Saputra",
    username: "bagas",
    whatsapp: "+6281440004004",
    role: "Worker",
    status: "Aktif",
    specialties: ["Olah Data", "Machine Learning / Deep Learning"],
    maxActiveAssignments: 2,
    internalNote: "Spesialis pengolahan data.",
    passwordDigest: "cf02b4e5dbfd74aa3d407f80508b0109287c908cfc111f490d5fcfe0c843e0be",
    credentialStatus: "Password Sementara",
    createdAt: "2026-08-01T09:00:00+07:00",
    updatedAt: "2026-10-01T12:00:00+07:00",
    lastActiveAt: "2026-10-01T12:00:00+07:00",
    createdBy: "WK-001",
  },
  {
    id: "WK-005",
    fullName: "Sinta Larasati",
    username: "sinta.finance",
    whatsapp: "+6281550005005",
    role: "Finance",
    status: "Aktif",
    specialties: [],
    maxActiveAssignments: 0,
    internalNote: "Finance workspace.",
    passwordDigest: "cf02b4e5dbfd74aa3d407f80508b0109287c908cfc111f490d5fcfe0c843e0be",
    credentialStatus: "Aktif",
    createdAt: "2026-04-15T09:00:00+07:00",
    updatedAt: "2026-10-03T10:00:00+07:00",
    lastActiveAt: "2026-10-03T10:00:00+07:00",
    createdBy: "WK-001",
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "CU-1001",
    username: "aditya.p",
    whatsapp: "+6281234567890",
    internalNote: "Customer aktif untuk penugasan data science.",
    accountStatus: "Aktif",
    credentialStatus: "Aktif",
    activationStatus: "Sudah digunakan",
    passwordDigest: "c0191c77f008ad1a19941825fe7b9e42b013454b7994f6c9e052f761f6ef429a",
    forcePasswordChange: false,
    createdAt: "2026-09-18T09:00:00+07:00",
    activatedAt: "2026-09-18T10:20:00+07:00",
    lastLoginAt: "2026-10-03T08:15:00+07:00",
    lastActiveAt: "2026-10-04T08:45:00+07:00",
    lastSeenRoute: "/dashboard/penugasan/TT-24018",
    loginCount: 18,
    createdBy: "Raka",
    updatedAt: "2026-10-02T11:42:00+07:00",
  },
  {
    id: "CU-1002",
    username: "nabila.putri",
    whatsapp: "+6281344002211",
    internalNote: "Komunikasi utama melalui WhatsApp.",
    accountStatus: "Nonaktif",
    credentialStatus: "Password Sementara",
    activationStatus: "Belum digunakan",
    passwordDigest: "37dacec40899f64cd5f96af2868d780935051d9ad3b76d9552a051321d414aab",
    activationTokenDigest: "cba1c7a681b3daed23355fa5623abe51494fdd8e00c638162d2679ba5f9d6bf8",
    activationTokenCreatedAt: "2026-09-21T10:15:00+07:00",
    activationTokenExpiresAt: "2026-12-31T23:59:00+07:00",
    forcePasswordChange: true,
    createdAt: "2026-09-21T10:15:00+07:00",
    lastActiveAt: "2026-09-21T10:15:00+07:00",
    lastSeenRoute: "/aktivasi",
    loginCount: 0,
    createdBy: "Dinda",
    updatedAt: "2026-09-25T14:10:00+07:00",
  },
  {
    id: "CU-1003",
    username: "rizky.ananda",
    whatsapp: "+6282177110022",
    internalNote: "",
    accountStatus: "Aktif",
    credentialStatus: "Aktif",
    activationStatus: "Sudah digunakan",
    passwordDigest: "c0191c77f008ad1a19941825fe7b9e42b013454b7994f6c9e052f761f6ef429a",
    forcePasswordChange: false,
    createdAt: "2026-09-12T13:10:00+07:00",
    activatedAt: "2026-09-12T13:40:00+07:00",
    lastLoginAt: "2026-09-20T10:20:00+07:00",
    lastActiveAt: "2026-09-20T10:30:00+07:00",
    lastSeenRoute: "/dashboard",
    loginCount: 9,
    createdBy: "Alya",
    updatedAt: "2026-10-02T09:00:00+07:00",
  },
  {
    id: "CU-1004",
    username: "salsa_r",
    whatsapp: "+6285122007788",
    internalNote: "Akun sempat dikunci setelah percobaan login berulang.",
    accountStatus: "Terkunci",
    credentialStatus: "Perlu Reset",
    activationStatus: "Sudah digunakan",
    passwordDigest: "c0191c77f008ad1a19941825fe7b9e42b013454b7994f6c9e052f761f6ef429a",
    forcePasswordChange: true,
    createdAt: "2026-09-08T08:30:00+07:00",
    activatedAt: "2026-09-08T09:00:00+07:00",
    lastLoginAt: "2026-09-10T12:00:00+07:00",
    lastActiveAt: "2026-09-10T12:30:00+07:00",
    lastSeenRoute: "/dashboard",
    loginCount: 4,
    createdBy: "Raka",
    updatedAt: "2026-10-01T18:20:00+07:00",
  },
  {
    id: "CU-1005",
    username: "dimas-arya",
    whatsapp: "+6287790012244",
    internalNote: "",
    accountStatus: "Aktif",
    credentialStatus: "Aktif",
    activationStatus: "Sudah digunakan",
    passwordDigest: "c0191c77f008ad1a19941825fe7b9e42b013454b7994f6c9e052f761f6ef429a",
    forcePasswordChange: false,
    createdAt: "2026-08-28T16:00:00+07:00",
    activatedAt: "2026-08-28T17:10:00+07:00",
    lastLoginAt: "2026-10-01T12:00:00+07:00",
    lastActiveAt: "2026-10-01T12:15:00+07:00",
    lastSeenRoute: "/dashboard/tagihan",
    loginCount: 22,
    createdBy: "Raka",
    updatedAt: "2026-10-01T12:15:00+07:00",
  },
];

const makeAudit = (
  id: string,
  action: string,
  entityId: string,
  timestamp: string,
): AuditEntry => ({ id, actor: "Raka", action, entityType: "Assignment", entityId, timestamp });
export const ADMIN_ASSIGNMENTS: AdminAssignment[] = [
  {
    id: "TT-24018",
    customerId: "CU-1001",
    title: "Analisis Sentimen Menggunakan BERT",
    category: "Machine Learning / Deep Learning",
    topic: "Klasifikasi sentimen komentar publik menggunakan IndoBERT",
    description:
      "Melatih model klasifikasi sentimen positif, netral, dan negatif dengan evaluasi yang dapat direproduksi.",
    educationLevel: "S1",
    output: "Notebook, laporan analisis, dan dataset berlabel",
    outputFormat: "IPYNB, PDF, CSV",
    initialEstimate: 1500000,
    deadline: "2026-10-12T20:00:00+07:00",
    workStatus: "Menunggu Review",
    progress: 80,
    accessStatus: "Terkunci",
    accessReason: "Menunggu pekerjaan selesai dan pembayaran lunas.",
    assignmentAccessTokenStatus: "Dicabut",
    primaryWorkerId: "WK-001",
    supportingWorkerIds: ["WK-004"],
    reviewerWorkerId: "WK-003",
    assignedAt: "2026-09-28T09:10:00+07:00",
    assignedBy: "WK-001",
    startedAt: "2026-09-29T08:30:00+07:00",
    reviewStartedAt: "2026-10-03T10:24:00+07:00",
    lastProgressUpdatedAt: "2026-10-03T10:24:00+07:00",
    priority: "Tinggi",
    publicProgressNote: "Model selesai dilatih dan sedang melalui pemeriksaan hasil.",
    createdAt: "2026-09-28T09:00:00+07:00",
    createdBy: "Raka",
    internalNote: "Periksa konsistensi label sebelum hasil dipublikasikan.",
    sourceFiles: [
      {
        id: "sf-1",
        assignmentId: "TT-24018",
        name: "dataset-komentar.csv",
        mimeType: "text/csv",
        size: "4,8 MB",
        category: "assignment",
        description: "Dataset utama untuk pemodelan.",
        uploadedAt: "2026-09-28T09:05:00+07:00",
        uploadedBy: "Raka",
        visibility: "customer_visible",
      },
      {
        id: "sf-2",
        assignmentId: "TT-24018",
        name: "panduan-penelitian.pdf",
        mimeType: "application/pdf",
        size: "1,2 MB",
        category: "supporting",
        description: "Panduan metode internal.",
        uploadedAt: "2026-09-28T09:08:00+07:00",
        uploadedBy: "Raka",
        visibility: "admin_only",
      },
    ],
    files: [
      {
        id: "rf-1",
        name: "analisis-sentimen-v2.ipynb",
        format: "IPYNB",
        size: "1,8 MB",
        uploadedAt: "2026-10-02T10:30:00+07:00",
        version: "v2",
        status: "Draft",
        description: "Notebook model dan evaluasi akhir.",
      },
    ],
    audit: [makeAudit("a-1", "Penugasan dibuat", "TT-24018", "2026-09-28T09:00:00+07:00")],
  },
  {
    id: "TT-24015",
    customerId: "CU-1002",
    title: "Review Bab 3 Skripsi",
    category: "Skripsi",
    topic: "Metodologi penelitian",
    description: "Review metode, instrumen, dan teknik analisis.",
    educationLevel: "S1",
    output: "Dokumen dengan komentar dan catatan perbaikan",
    outputFormat: "DOCX",
    initialEstimate: 650000,
    deadline: "2026-10-08T10:00:00+07:00",
    workStatus: "Sedang Dikerjakan",
    progress: 62,
    accessStatus: "Belum Tersedia",
    accessReason: "Hasil belum tersedia.",
    assignmentAccessTokenStatus: "Dicabut",
    primaryWorkerId: "WK-002",
    supportingWorkerIds: [],
    assignedAt: "2026-09-25T14:15:00+07:00",
    assignedBy: "WK-001",
    startedAt: "2026-09-26T08:30:00+07:00",
    lastProgressUpdatedAt: "2026-10-03T13:00:00+07:00",
    priority: "Urgent",
    publicProgressNote: "Metodologi sedang diselaraskan dengan instrumen penelitian.",
    createdAt: "2026-09-25T14:10:00+07:00",
    createdBy: "Dinda",
    internalNote: "Konfirmasi variabel operasional.",
    sourceFiles: [],
    files: [],
    audit: [],
  },
  {
    id: "TT-24011",
    customerId: "CU-1003",
    title: "Penyuntingan Artikel Penelitian",
    category: "Makalah / Artikel",
    topic: "Penyuntingan artikel jurnal",
    description: "Penyuntingan struktur dan tata bahasa.",
    educationLevel: "S2",
    output: "DOCX final dan tracked changes",
    outputFormat: "DOCX",
    initialEstimate: 850000,
    deadline: "2026-10-06T17:00:00+07:00",
    workStatus: "Selesai",
    progress: 100,
    accessStatus: "Dapat Diakses",
    accessReason: "Pembayaran lunas dan file telah dipublikasikan.",
    assignmentAccessTokenStatus: "Dicabut",
    accessOpenedAt: "2026-10-02T11:42:00+07:00",
    accessOpenedBy: "Raka",
    primaryWorkerId: "WK-003",
    supportingWorkerIds: [],
    reviewerWorkerId: "WK-001",
    assignedAt: "2026-09-20T10:45:00+07:00",
    assignedBy: "WK-001",
    startedAt: "2026-09-21T08:00:00+07:00",
    reviewStartedAt: "2026-09-30T09:00:00+07:00",
    completedAt: "2026-10-02T09:00:00+07:00",
    lastProgressUpdatedAt: "2026-10-02T09:00:00+07:00",
    priority: "Normal",
    publicProgressNote: "Penyuntingan selesai dan hasil telah dipublikasikan.",
    createdAt: "2026-09-20T10:30:00+07:00",
    createdBy: "Alya",
    internalNote: "Sudah dicek editorial.",
    sourceFiles: [],
    files: [
      {
        id: "rf-2",
        name: "artikel-final.docx",
        format: "DOCX",
        size: "740 KB",
        uploadedAt: "2026-10-02T09:00:00+07:00",
        version: "v2",
        status: "Published",
        description: "Naskah final siap kirim.",
      },
    ],
    audit: [makeAudit("a-2", "Akses hasil dibuka", "TT-24011", "2026-10-02T11:42:00+07:00")],
  },
  {
    id: "TT-24008",
    customerId: "CU-1004",
    title: "Visualisasi Dataset Penjualan",
    category: "Presentasi",
    topic: "Dashboard penjualan regional",
    description: "Visualisasi tren dan performa per wilayah.",
    educationLevel: "Profesional",
    output: "Dashboard dan PDF insight",
    outputFormat: "PDF",
    initialEstimate: 1200000,
    deadline: "2026-10-09T17:00:00+07:00",
    workStatus: "Menunggu Review",
    progress: 90,
    accessStatus: "Terkunci",
    accessReason: "Pembayaran belum lunas.",
    assignmentAccessTokenStatus: "Dicabut",
    primaryWorkerId: "WK-002",
    supportingWorkerIds: ["WK-004"],
    reviewerWorkerId: "WK-003",
    assignedAt: "2026-09-17T09:00:00+07:00",
    assignedBy: "WK-001",
    startedAt: "2026-09-18T08:00:00+07:00",
    reviewStartedAt: "2026-10-01T18:20:00+07:00",
    lastProgressUpdatedAt: "2026-10-01T18:20:00+07:00",
    priority: "Tinggi",
    publicProgressNote: "Visualisasi sedang diperiksa sebelum hasil akhir diterbitkan.",
    createdAt: "2026-09-17T08:45:00+07:00",
    createdBy: "Raka",
    internalNote: "Periksa label sumbu.",
    sourceFiles: [],
    files: [
      {
        id: "rf-3",
        name: "dashboard-penjualan-v1.pdf",
        format: "PDF",
        size: "3,1 MB",
        uploadedAt: "2026-10-01T18:20:00+07:00",
        version: "v1",
        status: "Published",
        description: "Versi hasil pemeriksaan.",
      },
    ],
    audit: [],
  },
  {
    id: "TT-24005",
    customerId: "CU-1005",
    title: "Olah Data Kuesioner Penelitian",
    category: "Olah Data",
    topic: "Uji validitas dan regresi",
    description: "Pengolahan kuesioner dan interpretasi.",
    educationLevel: "S1",
    output: "Excel, output statistik, dan laporan",
    outputFormat: "XLSX, PDF",
    initialEstimate: 950000,
    deadline: "2026-10-02T15:00:00+07:00",
    workStatus: "Selesai",
    progress: 100,
    accessStatus: "Dapat Diakses",
    accessReason: "Pembayaran lunas.",
    assignmentAccessTokenStatus: "Dicabut",
    accessOpenedAt: "2026-10-01T12:15:00+07:00",
    accessOpenedBy: "Raka",
    primaryWorkerId: "WK-001",
    supportingWorkerIds: [],
    reviewerWorkerId: "WK-003",
    assignedAt: "2026-09-12T16:15:00+07:00",
    assignedBy: "WK-001",
    startedAt: "2026-09-13T08:00:00+07:00",
    reviewStartedAt: "2026-09-29T09:00:00+07:00",
    completedAt: "2026-10-01T12:00:00+07:00",
    lastProgressUpdatedAt: "2026-10-01T12:00:00+07:00",
    priority: "Normal",
    publicProgressNote: "Pengolahan selesai dan hasil dapat diakses.",
    createdAt: "2026-09-12T16:00:00+07:00",
    createdBy: "Raka",
    internalNote: "Arsipkan setelah periode feedback.",
    sourceFiles: [],
    files: [
      {
        id: "rf-4",
        name: "hasil-olah-data.xlsx",
        format: "XLSX",
        size: "2,6 MB",
        uploadedAt: "2026-10-01T12:00:00+07:00",
        version: "v3",
        status: "Published",
        description: "Hasil final terverifikasi.",
      },
    ],
    audit: [],
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "INV-260018",
    assignmentId: "TT-24018",
    customerId: "CU-1001",
    subtotal: 1500000,
    voucherId: "VC-001",
    discountAmount: 250000,
    total: 1250000,
    issuedAt: "2026-10-03T09:00:00+07:00",
    dueAt: "2026-10-10T23:59:00+07:00",
    paymentStatus: "Menunggu Pembayaran",
    paymentMethod: "Transfer bank (placeholder)",
    paymentReference: "88081234567890",
    note: "Cantumkan nomor invoice pada berita transfer.",
  },
  {
    id: "INV-260011",
    assignmentId: "TT-24011",
    customerId: "CU-1003",
    subtotal: 850000,
    discountAmount: 0,
    total: 850000,
    issuedAt: "2026-10-01T09:00:00+07:00",
    dueAt: "2026-10-05T23:59:00+07:00",
    paymentStatus: "Lunas",
    paymentMethod: "Transfer bank (placeholder)",
    paymentReference: "88082177110022",
    note: "",
    verifiedAt: "2026-10-02T10:15:00+07:00",
    verifiedBy: "Dinda",
    revenueWorkerId: "WK-003",
  },
  {
    id: "INV-260008",
    assignmentId: "TT-24008",
    customerId: "CU-1004",
    subtotal: 1200000,
    discountAmount: 120000,
    total: 1080000,
    issuedAt: "2026-10-02T08:00:00+07:00",
    dueAt: "2026-10-09T23:59:00+07:00",
    paymentStatus: "Menunggu Verifikasi",
    paymentMethod: "Transfer bank (placeholder)",
    paymentReference: "88085122007788",
    note: "Bukti pembayaran menunggu pemeriksaan.",
  },
  {
    id: "INV-260005",
    assignmentId: "TT-24005",
    customerId: "CU-1005",
    subtotal: 950000,
    discountAmount: 0,
    total: 950000,
    issuedAt: "2026-09-30T08:00:00+07:00",
    dueAt: "2026-10-03T23:59:00+07:00",
    paymentStatus: "Lunas",
    paymentMethod: "Transfer bank (placeholder)",
    paymentReference: "88087790012244",
    note: "",
    verifiedAt: "2026-10-01T11:30:00+07:00",
    verifiedBy: "Raka",
    revenueWorkerId: "WK-001",
  },
];

export const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: "VC-001",
    code: "TEMAN-25-A7K9",
    name: "Joki 250K",
    description: "Potongan khusus customer aktif.",
    type: "Nominal Tetap",
    value: 250000,
    minimumTransaction: 1000000,
    validFrom: "2026-10-01",
    validUntil: "2026-12-31",
    assignedCustomerIds: ["CU-1001"],
    usageLimit: 1,
    usageCount: 1,
    status: "Aktif",
    createdBy: "Raka",
    createdAt: "2026-10-01T08:00:00+07:00",
    internalNote: "Retention customer.",
  },
  {
    id: "VC-002",
    code: "RISET-10-B3P8",
    name: "Diskon Riset",
    description: "Potongan 10% maksimal Rp200.000.",
    type: "Persentase",
    value: 10,
    maxDiscount: 200000,
    minimumTransaction: 750000,
    validFrom: "2026-10-10",
    validUntil: "2026-11-30",
    assignedCustomerIds: [],
    usageLimit: 20,
    usageCount: 0,
    status: "Terjadwal",
    createdBy: "Dinda",
    createdAt: "2026-10-02T09:00:00+07:00",
    internalNote: "",
  },
  {
    id: "VC-003",
    code: "VISUAL-10-X8F2",
    name: "Visualisasi 10%",
    description: "Diskon layanan visualisasi.",
    type: "Persentase",
    value: 10,
    maxDiscount: 150000,
    minimumTransaction: 500000,
    validFrom: "2026-09-01",
    validUntil: "2026-10-31",
    assignedCustomerIds: ["CU-1004"],
    usageLimit: 2,
    usageCount: 1,
    status: "Aktif",
    createdBy: "Alya",
    createdAt: "2026-09-01T08:00:00+07:00",
    internalNote: "",
  },
];

export const INITIAL_FEEDBACK: Feedback[] = [
  {
    id: "FB-001",
    assignmentId: "TT-24011",
    customerId: "CU-1003",
    rating: 5,
    comment: "Prosesnya jelas dan hasil penyuntingan sangat membantu menyiapkan artikel.",
    publicationConsent: true,
    publicIdentityPreference: "Inisial username",
    moderationStatus: "Disetujui",
    homepageVisible: true,
    publicComment: "Prosesnya jelas dan hasil penyuntingan sangat membantu menyiapkan artikel.",
    publicIdentitySnapshot: "R.",
    submittedAt: "2026-10-03T11:20:00+07:00",
    moderatedAt: "2026-10-03T14:10:00+07:00",
    moderatedBy: "Raka",
    internalNote: "Layak tampil.",
  },
  {
    id: "FB-002",
    assignmentId: "TT-24005",
    customerId: "CU-1005",
    rating: 4,
    comment: "Interpretasi hasil mudah dipahami dan file tertata rapi.",
    publicationConsent: false,
    publicIdentityPreference: "Anonim",
    moderationStatus: "Menunggu Moderasi",
    homepageVisible: false,
    publicComment: "Interpretasi hasil mudah dipahami dan file tertata rapi.",
    submittedAt: "2026-10-03T16:00:00+07:00",
    internalNote: "",
  },
];

export const INITIAL_REVISIONS: RevisionRequest[] = [
  {
    id: "RV-1042",
    assignmentId: "TT-24008",
    customerId: "CU-1004",
    file: "dashboard-penjualan-v1.pdf",
    type: "Perbaikan visual",
    message: "Perbaikan label sumbu dicatat admin dari percakapan WhatsApp.",
    support: "catatan-revisi.pdf",
    receivedAt: "2026-10-02T08:45:00+07:00",
    deadline: "2026-10-05T17:00:00+07:00",
    status: "Dikerjakan",
    workerId: "WK-002",
    internalNote: "Riwayat internal, read-only untuk customer.",
  },
];

export const INITIAL_SOCIAL_LINKS: SocialLinkSetting[] = [
  // Keep existing destinations until the new official social handles and email are confirmed.
  {
    id: "social-1",
    platform: "Instagram",
    label: "Instagram",
    url: "https://www.instagram.com/temantugas",
    iconKey: "Instagram",
    enabled: true,
    order: 1,
    openInNewTab: true,
  },
  {
    id: "social-2",
    platform: "TikTok",
    label: "TikTok",
    url: "https://www.tiktok.com/@temantugas",
    iconKey: "TikTok",
    enabled: true,
    order: 2,
    openInNewTab: true,
  },
  {
    id: "social-3",
    platform: "WhatsApp",
    label: "WhatsApp",
    url: "https://wa.me/6281234567890",
    iconKey: "WhatsApp",
    enabled: true,
    order: 3,
    openInNewTab: true,
  },
  {
    id: "social-4",
    platform: "Email",
    label: "Email",
    url: "mailto:halo@temantugas.id",
    iconKey: "Email",
    enabled: true,
    order: 4,
    openInNewTab: false,
  },
];
