import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  ADMIN_ASSIGNMENTS,
  INITIAL_CUSTOMERS,
  INITIAL_FEEDBACK,
  INITIAL_INVOICES,
  INITIAL_REVISIONS,
  INITIAL_SOCIAL_LINKS,
  INITIAL_VOUCHERS,
  INITIAL_WORKERS,
  type AdminAssignment,
  type AuditEntry,
  type Customer,
  type Feedback,
  type Invoice,
  type RevisionRequest,
  type SocialLinkSetting,
  type Voucher,
  type Worker,
} from "@/lib/admin-data";
import {
  AdminStoreContext,
  type AdminStoreValue,
  type AuthSession,
  type GuestAssignmentSession,
} from "@/lib/admin-store-context";
import {
  hashSecret,
  normalizeUsername,
  RESERVED_USERNAMES,
  validateUsername,
  normalizeWhatsapp,
  generateAssignmentAccessToken,
} from "@/lib/secure-generators";
import { isAssignmentActive } from "@/lib/admin-selectors";

// Keep these storage namespaces stable so the rebrand does not discard saved browser state.
const STORE_KEY = "temantugas-frontend-store-v6";
const LEGACY_STORE_KEYS = [
  "temantugas-frontend-store-v5",
  "temantugas-frontend-store-v4",
  "temantugas-frontend-store-v3",
];
const LEGACY_GRANTS_KEY = "temantugas-token-grants-v3";
const SESSION_KEY = "temantugas-auth-session-v1";
const GUEST_SESSION_KEY = "temantugas-guest-assignment-session-v1";

type Snapshot = {
  customers: Customer[];
  assignments: AdminAssignment[];
  invoices: Invoice[];
  vouchers: Voucher[];
  feedback: Feedback[];
  revisions: RevisionRequest[];
  audits: AuditEntry[];
  socialLinks: SocialLinkSetting[];
  workers: Worker[];
};
const now = () => new Date().toISOString();

function migrateCustomer(item: Partial<Customer>, fallback: Customer): Customer {
  const {
    passwordDigest: _savedPasswordDigest,
    activationTokenDigest: _savedActivationTokenDigest,
    ...safeItem
  } = item;
  const {
    passwordDigest: _fallbackPasswordDigest,
    activationTokenDigest: _fallbackActivationTokenDigest,
    ...safeFallback
  } = fallback;
  void [
    _savedPasswordDigest,
    _savedActivationTokenDigest,
    _fallbackPasswordDigest,
    _fallbackActivationTokenDigest,
  ];
  return {
    ...safeFallback,
    ...safeItem,
    activationStatus:
      item.activationStatus ??
      (item.accountStatus === "Aktif" ? "Sudah digunakan" : "Belum digunakan"),
    passwordDigest: "",
    forcePasswordChange: item.forcePasswordChange ?? false,
    loginCount: item.loginCount ?? 0,
  };
}

function migrateAssignment(
  item: AdminAssignment & Record<string, unknown>,
  fallback?: AdminAssignment,
) {
  const {
    tokenDigest: _a,
    tokenStatus: _b,
    tokenCreatedAt: _c,
    tokenExpiresAt: _d,
    tokenLastUsedAt: _e,
    tokenFailedAttempts: _f,
    assignee: legacyAssignee,
    ...safe
  } = item;
  void [_a, _b, _c, _d, _e, _f];
  const legacyMap: Record<string, string> = {
    Administrator: "WK-001",
    Dinda: "WK-002",
    Alya: "WK-003",
  };
  const primaryWorkerId =
    safe.primaryWorkerId ??
    (typeof legacyAssignee === "string" ? legacyMap[legacyAssignee] : undefined);
  return {
    ...(fallback ?? ADMIN_ASSIGNMENTS[0]!),
    ...safe,
    category: (safe.category as string) === "Visualisasi" ? "Presentasi" : safe.category,
    educationLevel: safe.educationLevel ?? fallback?.educationLevel ?? "S1",
    outputFormat: safe.outputFormat ?? fallback?.outputFormat ?? "Dokumen digital",
    publicProgressNote: safe.publicProgressNote ?? "Progres sedang diperbarui oleh tim.",
    sourceFiles: Array.isArray(safe.sourceFiles) ? safe.sourceFiles : [],
    assignmentAccessTokenStatus: safe.assignmentAccessTokenStatus ?? "Dicabut",
    ...(primaryWorkerId ? { primaryWorkerId } : {}),
    supportingWorkerIds: Array.isArray(safe.supportingWorkerIds) ? safe.supportingWorkerIds : [],
    ...(safe.workStatus === "Sedang Dikerjakan" && !safe.startedAt
      ? { startedAt: safe.createdAt }
      : {}),
    ...(safe.workStatus === "Menunggu Review" && !safe.reviewStartedAt
      ? { reviewStartedAt: safe.createdAt }
      : {}),
    ...(safe.workStatus === "Selesai" && !safe.completedAt ? { completedAt: safe.deadline } : {}),
  } as AdminAssignment;
}

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [assignments, setAssignments] = useState<AdminAssignment[]>(ADMIN_ASSIGNMENTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [feedback, setFeedback] = useState<Feedback[]>(INITIAL_FEEDBACK);
  const [revisions, setRevisions] = useState<RevisionRequest[]>(INITIAL_REVISIONS);
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkSetting[]>(INITIAL_SOCIAL_LINKS);
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);
  const [session, setSession] = useState<AuthSession>(null);
  const [guestAssignmentSession, setGuestAssignmentSession] =
    useState<GuestAssignmentSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const lastActivityWrite = useRef(0);

  useEffect(() => {
    try {
      const raw =
        window.sessionStorage.getItem(STORE_KEY) ??
        LEGACY_STORE_KEYS.map((key) => window.sessionStorage.getItem(key)).find(Boolean);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Snapshot>;
        if (parsed.customers)
          setCustomers(
            parsed.customers.map((item, index) =>
              migrateCustomer(item, INITIAL_CUSTOMERS[index] ?? INITIAL_CUSTOMERS[0]!),
            ),
          );
        if (parsed.assignments)
          setAssignments(
            parsed.assignments.map((item, index) =>
              migrateAssignment(
                item as AdminAssignment & Record<string, unknown>,
                ADMIN_ASSIGNMENTS[index],
              ),
            ),
          );
        if (parsed.invoices)
          setInvoices(
            parsed.invoices.map((invoice) => {
              if (invoice.revenueWorkerId) return invoice;
              const primaryWorkerId = parsed.assignments?.find(
                (item) => item.id === invoice.assignmentId,
              )?.primaryWorkerId;
              return primaryWorkerId ? { ...invoice, revenueWorkerId: primaryWorkerId } : invoice;
            }),
          );
        if (parsed.vouchers) setVouchers(parsed.vouchers);
        if (parsed.feedback) setFeedback(parsed.feedback);
        if (parsed.revisions)
          setRevisions(
            parsed.revisions.map((item) => {
              const legacy = item as RevisionRequest & { assignee?: string };
              const workerId =
                item.workerId ??
                (
                  { Administrator: "WK-001", Dinda: "WK-002", Alya: "WK-003" } as Record<
                    string,
                    string
                  >
                )[legacy.assignee ?? ""];
              const { assignee: _assignee, ...safe } = legacy;
              void _assignee;
              return { ...safe, ...(workerId ? { workerId } : {}) };
            }),
          );
        if (parsed.audits)
          setAudits(parsed.audits.filter((entry) => entry.entityType !== ("Token" as never)));
        if (parsed.socialLinks) setSocialLinks(parsed.socialLinks);
        if (parsed.workers)
          setWorkers(parsed.workers.map((worker) => ({ ...worker, passwordDigest: "" })));
      }
      window.sessionStorage.removeItem(SESSION_KEY);
      setSession(null);
      const guestRaw = window.sessionStorage.getItem(GUEST_SESSION_KEY);
      if (guestRaw) {
        const guest = JSON.parse(guestRaw) as GuestAssignmentSession;
        if (guest.expiresAt && new Date(guest.expiresAt).getTime() > Date.now())
          setGuestAssignmentSession(guest);
        else window.sessionStorage.removeItem(GUEST_SESSION_KEY);
      }
      window.sessionStorage.removeItem(LEGACY_GRANTS_KEY);
      LEGACY_STORE_KEYS.forEach((key) => window.sessionStorage.removeItem(key));
    } catch {
      setSession(null);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.sessionStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        customers,
        assignments,
        invoices,
        vouchers,
        feedback,
        revisions,
        audits,
        socialLinks,
        workers,
      }),
    );
    if (session) window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else window.sessionStorage.removeItem(SESSION_KEY);
    if (guestAssignmentSession)
      window.sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(guestAssignmentSession));
    else window.sessionStorage.removeItem(GUEST_SESSION_KEY);
  }, [
    assignments,
    audits,
    customers,
    feedback,
    hydrated,
    guestAssignmentSession,
    invoices,
    revisions,
    session,
    socialLinks,
    vouchers,
    workers,
  ]);

  const recordAudit = useCallback<AdminStoreValue["recordAudit"]>(
    (entry) => {
      const activeWorker =
        session?.role === "admin"
          ? workers.find((item) => item.id === session.workerId)
          : undefined;
      const activeCustomer =
        session?.role === "customer"
          ? customers.find((item) => item.id === session.customerId)
          : undefined;
      setAudits((items) => [
        {
          ...entry,
          actor: activeWorker?.fullName ?? activeCustomer?.username ?? entry.actor ?? "Sistem",
          ...(activeWorker
            ? { actorId: activeWorker.id, actorRole: activeWorker.role }
            : activeCustomer
              ? { actorId: activeCustomer.id, actorRole: "Customer" }
              : {}),
          id: `AUD-${crypto.randomUUID()}`,
          timestamp: now(),
        },
        ...items,
      ]);
    },
    [customers, session, workers],
  );

  const value = useMemo<AdminStoreValue>(
    () => ({
      customers,
      assignments,
      invoices,
      vouchers,
      feedback,
      revisions,
      audits,
      socialLinks,
      workers,
      session,
      guestAssignmentSession,
      hydrated,
      getCustomer: (id) => customers.find((item) => item.id === id && !item.deletedAt),
      getCurrentCustomer: () =>
        session?.role === "customer"
          ? customers.find((item) => item.id === session.customerId && !item.deletedAt)
          : undefined,
      getAssignment: (id) => assignments.find((item) => item.id === id),
      getWorker: (id) => workers.find((item) => item.id === id && !item.deletedAt),
      getCurrentWorker: () =>
        session?.role === "admin"
          ? workers.find((item) => item.id === session.workerId && !item.deletedAt)
          : undefined,
      getInvoiceForAssignment: (assignmentId) =>
        invoices.find((item) => item.assignmentId === assignmentId),
      loginCustomer: async () => "unavailable",
      loginAdmin: async () => "unavailable",
      verifyAssignmentAccess: async (whatsapp, token) => {
        const normalizedWhatsapp = normalizeWhatsapp(whatsapp).replace(/\D/g, "");
        const digest = await hashSecret(token);
        const matched = assignments.find((item) => item.assignmentAccessTokenDigest === digest);
        if (!matched) return { status: "invalid" };
        if (matched.assignmentAccessTokenStatus === "Dicabut") return { status: "revoked" };
        if (
          matched.assignmentAccessTokenStatus === "Kedaluwarsa" ||
          !matched.assignmentAccessTokenExpiresAt ||
          new Date(matched.assignmentAccessTokenExpiresAt).getTime() <= Date.now()
        )
          return { status: "expired" };
        const customer = customers.find(
          (item) => item.id === matched.customerId && !item.deletedAt,
        );
        if (!customer || customer.archivedAt) return { status: "blocked" };
        if (customer.whatsapp.replace(/\D/g, "") !== normalizedWhatsapp)
          return { status: "invalid" };
        const timestamp = now();
        const guest = {
          assignmentId: matched.id,
          customerId: matched.customerId,
          issuedAt: timestamp,
          expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
        };
        setAssignments((items) =>
          items.map((item) =>
            item.id === matched.id ? { ...item, assignmentAccessTokenLastUsedAt: timestamp } : item,
          ),
        );
        setGuestAssignmentSession(guest);
        recordAudit({
          actor: "Guest",
          action: "Mengakses penugasan dengan token",
          entityType: "Assignment",
          entityId: matched.id,
          note: "Token mentah dan nomor WhatsApp tidak dicatat.",
        });
        return { status: "success", assignmentId: matched.id, customerId: matched.customerId };
      },
      generateAssignmentAccessToken: async (id) => {
        const assignment = assignments.find((item) => item.id === id);
        if (!assignment) return null;
        const token = generateAssignmentAccessToken();
        const digest = await hashSecret(token);
        const timestamp = now();
        const expiresAt = new Date(Date.now() + 30 * 86_400_000).toISOString();
        setAssignments((items) =>
          items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  assignmentAccessTokenDigest: digest,
                  assignmentAccessTokenStatus: "Aktif",
                  assignmentAccessTokenCreatedAt: timestamp,
                  assignmentAccessTokenExpiresAt: expiresAt,
                  assignmentAccessTokenLastUsedAt: undefined,
                }
              : item,
          ),
        );
        recordAudit({
          actor: "",
          action: assignment.assignmentAccessTokenDigest
            ? "Merotasi token akses penugasan"
            : "Membuat token akses penugasan",
          entityType: "Assignment",
          entityId: id,
          before: assignment.assignmentAccessTokenStatus,
          after: "Aktif",
          note: "Digest token disimpan; token mentah ditampilkan satu kali.",
        });
        return { token, expiresAt };
      },
      revokeAssignmentAccessToken: (id) => {
        const assignment = assignments.find((item) => item.id === id);
        if (!assignment?.assignmentAccessTokenDigest) return;
        setAssignments((items) =>
          items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  assignmentAccessTokenDigest: undefined,
                  assignmentAccessTokenStatus: "Dicabut",
                }
              : item,
          ),
        );
        recordAudit({
          actor: "",
          action: "Mencabut token akses penugasan",
          entityType: "Assignment",
          entityId: id,
          before: assignment.assignmentAccessTokenStatus,
          after: "Dicabut",
          note: "Digest token dicabut dan tidak dapat digunakan.",
        });
      },
      clearGuestAssignmentSession: () => setGuestAssignmentSession(null),
      logout: () => setSession(null),
      activateCustomer: async (token, password, confirmation) => {
        if (password !== confirmation) return "password_mismatch";
        if (
          password.length < 10 ||
          !/[A-Z]/.test(password) ||
          !/[a-z]/.test(password) ||
          !/\d/.test(password)
        )
          return "invalid";
        if (session?.role !== "customer" || !session.pendingActivation) return "invalid";
        const customer = customers.find((item) => item.id === session.customerId);
        if (!customer?.activationTokenDigest) return "invalid";
        if (customer.activationStatus === "Sudah digunakan") return "used";
        if (customer.activationStatus === "Dicabut") return "revoked";
        if (
          customer.activationStatus === "Kedaluwarsa" ||
          (customer.activationTokenExpiresAt &&
            new Date(customer.activationTokenExpiresAt) < new Date())
        )
          return "expired";
        if ((await hashSecret(token)) !== customer.activationTokenDigest) return "invalid";
        const timestamp = now();
        const passwordDigest = await hashSecret(password);
        setCustomers((items) =>
          items.map((item) => {
            if (item.id !== customer.id) return item;
            const { activationTokenDigest: _digest, ...safe } = item;
            void _digest;
            return {
              ...safe,
              passwordDigest,
              activationStatus: "Sudah digunakan",
              activationTokenUsedAt: timestamp,
              accountStatus: "Aktif",
              credentialStatus: "Aktif",
              forcePasswordChange: false,
              activatedAt: timestamp,
              lastLoginAt: timestamp,
              lastActiveAt: timestamp,
              loginCount: item.loginCount + 1,
              updatedAt: timestamp,
            };
          }),
        );
        setSession({ role: "customer", customerId: customer.id, pendingActivation: false });
        recordAudit({
          actor: customer.username,
          action: "Mengaktifkan akun",
          entityType: "Activation",
          entityId: customer.id,
          note: "Token sekali pakai digunakan; nilai mentah tidak disimpan.",
        });
        return "success";
      },
      touchCustomer: (route) => {
        if (session?.role !== "customer" || session.pendingActivation) return;
        const current = Date.now();
        if (current - lastActivityWrite.current < 60_000) return;
        lastActivityWrite.current = current;
        setCustomers((items) =>
          items.map((item) =>
            item.id === session.customerId
              ? { ...item, lastActiveAt: new Date(current).toISOString(), lastSeenRoute: route }
              : item,
          ),
        );
      },
      createCustomer: (customer) => {
        setCustomers((items) => [customer, ...items]);
        recordAudit({
          actor: "",
          action: "Membuat akun customer",
          entityType: "Customer",
          entityId: customer.id,
          note: `Username ${customer.username} dibuat; kredensial mentah tidak dicatat.`,
        });
      },
      updateCustomer: (id, patch, action = "Memperbarui customer") => {
        setCustomers((items) =>
          items.map((item) => (item.id === id ? { ...item, ...patch, updatedAt: now() } : item)),
        );
        recordAudit({
          actor: "",
          action,
          entityType: "Customer",
          entityId: id,
          note: "Perubahan administratif dicatat tanpa data rahasia.",
        });
      },
      deleteCustomer: (id) => {
        const target = customers.find((item) => item.id === id);
        setCustomers((items) => items.filter((item) => item.id !== id));
        if (session?.role === "customer" && session.customerId === id) setSession(null);
        recordAudit({
          actor: "",
          action: "Menghapus akun customer",
          entityType: "Customer",
          entityId: id,
          ...(target ? { before: target.username } : {}),
          after: "Dihapus permanen",
          note: "Audit operasional dipertahankan.",
        });
      },
      createWorker: (worker) => {
        setWorkers((items) => [worker, ...items]);
        recordAudit({
          actor: "",
          action: "Membuat worker",
          entityType: "Worker",
          entityId: worker.id,
          after: `${worker.fullName} · ${worker.role}`,
          note: "Password mentah tidak dicatat.",
        });
      },
      updateWorker: (id, patch, action = "Memperbarui worker") => {
        const before = workers.find((item) => item.id === id);
        setWorkers((items) =>
          items.map((item) => (item.id === id ? { ...item, ...patch, updatedAt: now() } : item)),
        );
        recordAudit({
          actor: "",
          action,
          entityType: "Worker",
          entityId: id,
          ...(before ? { before: `${before.fullName} · ${before.role} · ${before.status}` } : {}),
          after: "Data worker diperbarui",
          note: "Kredensial tidak dicatat.",
        });
      },
      deleteWorker: (id) => {
        if (assignments.some((item) => item.primaryWorkerId === id && isAssignmentActive(item)))
          return "has_active_assignments";
        const target = workers.find((item) => item.id === id);
        setWorkers((items) => items.filter((item) => item.id !== id));
        recordAudit({
          actor: "",
          action: "Menghapus worker",
          entityType: "Worker",
          entityId: id,
          ...(target ? { before: target.username } : {}),
          after: "Dihapus permanen",
        });
        return "success";
      },
      changeUsername: async (customerId, nextUsername, currentPassword) => {
        const target = customers.find((item) => item.id === customerId);
        const normalized = normalizeUsername(nextUsername);
        if (!target || (await hashSecret(currentPassword)) !== target.passwordDigest)
          return "invalid_password";
        if (RESERVED_USERNAMES.includes(normalized)) return "reserved";
        if (validateUsername(normalized)) return "invalid";
        if (
          customers.some(
            (item) => item.id !== customerId && normalizeUsername(item.username) === normalized,
          )
        )
          return "duplicate";
        if (
          target.usernameChangedAt &&
          Date.now() - new Date(target.usernameChangedAt).getTime() < 30 * 86_400_000
        )
          return "cooldown";
        setCustomers((items) =>
          items.map((item) =>
            item.id === customerId
              ? { ...item, username: normalized, usernameChangedAt: now(), updatedAt: now() }
              : item,
          ),
        );
        recordAudit({
          actor: target.username,
          action: "Mengubah username",
          entityType: "Customer",
          entityId: customerId,
          before: target.username,
          after: normalized,
        });
        return "success";
      },
      setCustomerCredentials: (id, passwordDigest, activationDigest, expiresAt) => {
        const timestamp = now();
        setCustomers((items) =>
          items.map((item) => {
            if (item.id !== id) return item;
            const { activationTokenUsedAt: _used, ...safe } = item;
            void _used;
            return {
              ...safe,
              passwordDigest,
              activationTokenDigest: activationDigest,
              activationTokenCreatedAt: timestamp,
              activationTokenExpiresAt: expiresAt,
              activationStatus: "Belum digunakan",
              accountStatus: "Nonaktif",
              credentialStatus: "Password Sementara",
              forcePasswordChange: true,
              updatedAt: timestamp,
            };
          }),
        );
        recordAudit({
          actor: "",
          action: "Menerbitkan kredensial aktivasi",
          entityType: "Activation",
          entityId: id,
          note: "Password sementara dan token mentah hanya ditampilkan satu kali.",
        });
      },
      createAssignment: (assignment) => {
        setAssignments((items) => [assignment, ...items]);
        recordAudit({
          actor: "",
          action: "Membuat penugasan",
          entityType: "Assignment",
          entityId: assignment.id,
        });
      },
      updateAssignment: (id, patch, audit) => {
        const current = assignments.find((item) => item.id === id);
        const activeWorker =
          session?.role === "admin"
            ? workers.find((item) => item.id === session.workerId)
            : undefined;
        const timestamp = now();
        const statusTimestamps =
          current && patch.workStatus && patch.workStatus !== current.workStatus
            ? {
                ...(patch.workStatus === "Sedang Dikerjakan" && !current.startedAt
                  ? { startedAt: timestamp }
                  : {}),
                ...(patch.workStatus === "Menunggu Review" && !current.reviewStartedAt
                  ? { reviewStartedAt: timestamp }
                  : {}),
                ...(patch.workStatus === "Selesai" && !current.completedAt
                  ? { completedAt: timestamp }
                  : {}),
              }
            : {};
        const progressTimestamp =
          patch.progress !== undefined && patch.progress !== current?.progress
            ? { lastProgressUpdatedAt: timestamp }
            : {};
        setAssignments((items) =>
          items.map((item) => {
            if (item.id !== id) return item;
            const assignmentAudit = audit
              ? [
                  {
                    ...audit,
                    actor: activeWorker?.fullName ?? audit.actor,
                    ...(activeWorker
                      ? { actorId: activeWorker.id, actorRole: activeWorker.role }
                      : {}),
                    id: `AUD-${crypto.randomUUID()}`,
                    entityType: "Assignment" as const,
                    entityId: id,
                    timestamp: now(),
                  },
                  ...item.audit,
                ]
              : item.audit;
            return {
              ...item,
              ...patch,
              ...statusTimestamps,
              ...progressTimestamp,
              audit: assignmentAudit,
            };
          }),
        );
        if (audit) recordAudit({ ...audit, entityType: "Assignment", entityId: id });
      },
      addFiles: (id, files) => {
        setAssignments((items) =>
          items.map((item) =>
            item.id === id ? { ...item, files: [...files, ...item.files] } : item,
          ),
        );
        recordAudit({
          actor: "",
          action: "Mengunggah file hasil",
          entityType: "Result",
          entityId: id,
          note: `${files.length} file; URL privat tidak dicatat.`,
        });
      },
      updateFile: (assignmentId, fileId, patch) => {
        setAssignments((items) =>
          items.map((item) =>
            item.id === assignmentId
              ? {
                  ...item,
                  files: item.files.map((file) =>
                    file.id === fileId ? { ...file, ...patch } : file,
                  ),
                }
              : item,
          ),
        );
        recordAudit({
          actor: "",
          action:
            patch.status === "Published"
              ? "Mempublikasikan file hasil"
              : "Mengganti metadata file hasil",
          entityType: "Result",
          entityId: assignmentId,
          note: `File ${fileId}; URL privat tidak dicatat.`,
        });
      },
      removeFile: (assignmentId, fileId) => {
        setAssignments((items) =>
          items.map((item) =>
            item.id === assignmentId
              ? { ...item, files: item.files.filter((file) => file.id !== fileId) }
              : item,
          ),
        );
        recordAudit({
          actor: "",
          action: "Menghapus file hasil",
          entityType: "Result",
          entityId: assignmentId,
          note: `File ${fileId}; konten privat tidak dicatat.`,
        });
      },
      addAssignmentFiles: (id, files) => {
        setAssignments((items) =>
          items.map((item) =>
            item.id === id ? { ...item, sourceFiles: [...files, ...item.sourceFiles] } : item,
          ),
        );
        recordAudit({
          actor: "",
          action: "Mengunggah file penugasan",
          entityType: "File",
          entityId: id,
          note: `${files.length} file; URL privat tidak dicatat.`,
        });
      },
      updateAssignmentFile: (assignmentId, fileId, patch) => {
        setAssignments((items) =>
          items.map((item) =>
            item.id === assignmentId
              ? {
                  ...item,
                  sourceFiles: item.sourceFiles.map((file) =>
                    file.id === fileId ? { ...file, ...patch } : file,
                  ),
                }
              : item,
          ),
        );
        recordAudit({
          actor: "",
          action: "Memperbarui file penugasan",
          entityType: "File",
          entityId: assignmentId,
          note: `File ${fileId}; visibilitas atau metadata diperbarui.`,
        });
      },
      removeAssignmentFile: (assignmentId, fileId) => {
        setAssignments((items) =>
          items.map((item) =>
            item.id === assignmentId
              ? { ...item, sourceFiles: item.sourceFiles.filter((file) => file.id !== fileId) }
              : item,
          ),
        );
        recordAudit({
          actor: "",
          action: "Menghapus file penugasan",
          entityType: "File",
          entityId: assignmentId,
          note: `File ${fileId}; konten privat tidak dicatat.`,
        });
      },
      createInvoice: (invoice) => {
        const assignment = assignments.find((item) => item.id === invoice.assignmentId);
        const withRevenue = {
          ...invoice,
          ...(invoice.revenueWorkerId
            ? {}
            : assignment?.primaryWorkerId
              ? { revenueWorkerId: assignment.primaryWorkerId }
              : {}),
        };
        setInvoices((items) => [
          withRevenue,
          ...items.filter((item) => item.assignmentId !== invoice.assignmentId),
        ]);
        recordAudit({
          actor: "",
          action: "Menerbitkan tagihan",
          entityType: "Invoice",
          entityId: invoice.id,
          note: `Total ${invoice.total}.`,
        });
      },
      updateInvoice: (id, patch) => {
        const invoice = invoices.find((item) => item.id === id);
        const assignment = invoice
          ? assignments.find((item) => item.id === invoice.assignmentId)
          : undefined;
        const safePatch =
          patch.paymentStatus === "Lunas" &&
          !invoice?.revenueWorkerId &&
          assignment?.primaryWorkerId
            ? { ...patch, revenueWorkerId: assignment.primaryWorkerId }
            : patch;
        setInvoices((items) =>
          items.map((item) => (item.id === id ? { ...item, ...safePatch } : item)),
        );
        recordAudit({
          actor: "",
          action: "Memperbarui tagihan",
          entityType: "Invoice",
          entityId: id,
        });
      },
      createVoucher: (voucher) => {
        setVouchers((items) => [voucher, ...items]);
        recordAudit({
          actor: "",
          action: "Membuat voucher",
          entityType: "Voucher",
          entityId: voucher.id,
        });
      },
      updateVoucher: (id, patch) => {
        setVouchers((items) =>
          items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        );
        recordAudit({
          actor: "",
          action: "Memperbarui voucher",
          entityType: "Voucher",
          entityId: id,
        });
      },
      submitFeedback: (item) => {
        setFeedback((items) => [
          item,
          ...items.filter((entry) => entry.assignmentId !== item.assignmentId),
        ]);
        recordAudit({
          actor: "Customer",
          action: "Mengirim feedback opsional",
          entityType: "Feedback",
          entityId: item.id,
        });
      },
      updateFeedback: (id, patch) => {
        setFeedback((items) =>
          items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        );
        recordAudit({
          actor: "",
          action: "Memoderasi feedback",
          entityType: "Feedback",
          entityId: id,
          note: "Rating dan komentar asli tidak diubah.",
        });
      },
      updateRevision: (id, patch) => {
        setRevisions((items) =>
          items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        );
        recordAudit({
          actor: "",
          action: "Memperbarui permintaan revisi",
          entityType: "Assignment",
          entityId: id,
          note: "Status atau penanggung jawab revisi diperbarui.",
        });
        toast.success("Riwayat revisi diperbarui");
      },
      createSocialLink: (item) => {
        setSocialLinks((items) => [...items, item]);
        recordAudit({
          actor: "",
          action: "Menambah tautan sosial",
          entityType: "Social",
          entityId: item.id,
        });
      },
      updateSocialLink: (id, patch) => {
        setSocialLinks((items) =>
          items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        );
        recordAudit({
          actor: "",
          action: "Memperbarui tautan sosial",
          entityType: "Social",
          entityId: id,
        });
      },
      deleteSocialLink: (id) => {
        setSocialLinks((items) => items.filter((item) => item.id !== id));
        recordAudit({
          actor: "",
          action: "Menghapus tautan sosial",
          entityType: "Social",
          entityId: id,
        });
      },
      reorderSocialLink: (id, direction) =>
        setSocialLinks((items) => {
          const ordered = [...items].sort((a, b) => a.order - b.order);
          const index = ordered.findIndex((item) => item.id === id);
          const target = index + direction;
          if (index < 0 || target < 0 || target >= ordered.length) return items;
          [ordered[index], ordered[target]] = [ordered[target]!, ordered[index]!];
          return ordered.map((item, order) => ({ ...item, order: order + 1 }));
        }),
      recordAudit,
    }),
    [
      assignments,
      audits,
      customers,
      feedback,
      guestAssignmentSession,
      hydrated,
      invoices,
      recordAudit,
      revisions,
      session,
      socialLinks,
      vouchers,
      workers,
    ],
  );

  return <AdminStoreContext.Provider value={value}>{children}</AdminStoreContext.Provider>;
}
