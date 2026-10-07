import { createContext } from "react";
import type {
  AdminAssignment,
  AdminResultFile,
  AssignmentFile,
  AuditEntry,
  Customer,
  Feedback,
  Invoice,
  RevisionRequest,
  SocialLinkSetting,
  Voucher,
  Worker,
  WorkerRole,
  Permission,
} from "@/lib/admin-data";

export type AssignmentPatch = Partial<Omit<AdminAssignment, "id">>;
export type AuthSession =
  | { role: "customer"; customerId: string; pendingActivation: boolean }
  | { role: "admin"; workerId: string; workerRole: WorkerRole; permissions: Permission[] }
  | null;
export type LoginResult =
  | "success"
  | "activation_required"
  | "password_change_required"
  | "invalid"
  | "blocked"
  | "unavailable";
export type ActivationResult =
  "success" | "invalid" | "expired" | "revoked" | "used" | "password_mismatch";
export type GuestAssignmentSession = {
  assignmentId: string;
  customerId: string;
  issuedAt: string;
  expiresAt: string;
};
export type AssignmentAccessResult =
  | { status: "success"; assignmentId: string; customerId: string }
  | { status: "invalid" | "revoked" | "expired" | "blocked" };

export interface AdminStoreValue {
  customers: Customer[];
  assignments: AdminAssignment[];
  invoices: Invoice[];
  vouchers: Voucher[];
  feedback: Feedback[];
  revisions: RevisionRequest[];
  audits: AuditEntry[];
  socialLinks: SocialLinkSetting[];
  workers: Worker[];
  session: AuthSession;
  guestAssignmentSession: GuestAssignmentSession | null;
  hydrated: boolean;
  getCustomer: (id: string) => Customer | undefined;
  getCurrentCustomer: () => Customer | undefined;
  getAssignment: (id: string) => AdminAssignment | undefined;
  getWorker: (id: string) => Worker | undefined;
  getCurrentWorker: () => Worker | undefined;
  getInvoiceForAssignment: (assignmentId: string) => Invoice | undefined;
  loginCustomer: (username: string, password: string) => Promise<LoginResult>;
  loginAdmin: (username: string, password: string) => Promise<LoginResult>;
  verifyAssignmentAccess: (whatsapp: string, token: string) => Promise<AssignmentAccessResult>;
  generateAssignmentAccessToken: (
    id: string,
  ) => Promise<{ token: string; expiresAt: string } | null>;
  revokeAssignmentAccessToken: (id: string) => void;
  clearGuestAssignmentSession: () => void;
  logout: () => void;
  activateCustomer: (
    token: string,
    password: string,
    confirmation: string,
  ) => Promise<ActivationResult>;
  touchCustomer: (route: string) => void;
  createCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, patch: Partial<Omit<Customer, "id">>, action?: string) => void;
  deleteCustomer: (id: string) => void;
  createWorker: (worker: Worker) => void;
  updateWorker: (id: string, patch: Partial<Omit<Worker, "id">>, action?: string) => void;
  deleteWorker: (id: string) => "success" | "has_active_assignments";
  changeUsername: (
    customerId: string,
    nextUsername: string,
    currentPassword: string,
  ) => Promise<"success" | "invalid_password" | "duplicate" | "reserved" | "cooldown" | "invalid">;
  setCustomerCredentials: (
    id: string,
    passwordDigest: string,
    activationDigest: string,
    expiresAt: string,
  ) => void;
  createAssignment: (assignment: AdminAssignment) => void;
  updateAssignment: (
    id: string,
    patch: AssignmentPatch,
    audit?: Omit<AuditEntry, "id" | "timestamp" | "entityType" | "entityId">,
  ) => void;
  addFiles: (id: string, files: AdminResultFile[]) => void;
  updateFile: (assignmentId: string, fileId: string, patch: Partial<AdminResultFile>) => void;
  removeFile: (assignmentId: string, fileId: string) => void;
  addAssignmentFiles: (id: string, files: AssignmentFile[]) => void;
  updateAssignmentFile: (
    assignmentId: string,
    fileId: string,
    patch: Partial<AssignmentFile>,
  ) => void;
  removeAssignmentFile: (assignmentId: string, fileId: string) => void;
  createInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, patch: Partial<Omit<Invoice, "id">>) => void;
  createVoucher: (voucher: Voucher) => void;
  updateVoucher: (id: string, patch: Partial<Omit<Voucher, "id">>) => void;
  submitFeedback: (feedback: Feedback) => void;
  updateFeedback: (id: string, patch: Partial<Omit<Feedback, "id" | "rating" | "comment">>) => void;
  updateRevision: (id: string, patch: Partial<RevisionRequest>) => void;
  createSocialLink: (item: SocialLinkSetting) => void;
  updateSocialLink: (id: string, patch: Partial<Omit<SocialLinkSetting, "id">>) => void;
  deleteSocialLink: (id: string) => void;
  reorderSocialLink: (id: string, direction: -1 | 1) => void;
  recordAudit: (entry: Omit<AuditEntry, "id" | "timestamp">) => void;
}

export const AdminStoreContext = createContext<AdminStoreValue | null>(null);
