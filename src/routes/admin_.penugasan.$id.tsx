import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MessageSquare, Save } from "lucide-react";
import { toast } from "sonner";
import { AccessControlPanel } from "@/components/admin/access-control-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  AccessBadge,
  AdminProgress,
  AdminStatusBadge,
  PaymentBadge,
  PriorityBadge,
} from "@/components/admin/admin-ui";
import { InvoicePanel } from "@/components/admin/invoice-panel";
import { ResultUploadPanel } from "@/components/admin/result-upload-panel";
import { AssignmentFilesPanel } from "@/components/admin/assignment-files-panel";
import { AssignmentAccessTokenPanel } from "@/components/admin/assignment-access-token-panel";
import { PermissionGuard } from "@/components/auth/route-guards";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WORK_STATUSES, type WorkStatus } from "@/lib/admin-data";
import { useAdminStore } from "@/lib/use-admin-store";
import { formatDateTime, timeLeft } from "@/lib/portal-data";
import { getWorkerStats } from "@/lib/admin-selectors";

export const Route = createFileRoute("/admin_/penugasan/$id")({
  head: ({ params }) => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminAssignmentDetail,
});

function AdminAssignmentDetail() {
  const { id } = Route.useParams();
  const {
    assignments,
    getAssignment,
    getCustomer,
    getCurrentWorker,
    getInvoiceForAssignment,
    getWorker,
    invoices,
    session,
    updateAssignment,
    workers,
  } = useAdminStore();
  const assignment = getAssignment(id);
  const customer = assignment ? getCustomer(assignment.customerId) : undefined;
  const invoice = assignment ? getInvoiceForAssignment(assignment.id) : undefined;
  const [status, setStatus] = useState<WorkStatus>(assignment?.workStatus ?? "Draft");
  const [progress, setProgress] = useState(assignment?.progress ?? 0);
  const [note, setNote] = useState(assignment?.internalNote ?? "");
  const [replacementReason, setReplacementReason] = useState("");
  useEffect(() => {
    if (!assignment) return;
    setStatus(assignment.workStatus);
    setProgress(assignment.progress);
    setNote(assignment.internalNote);
  }, [assignment]);
  if (!assignment)
    return (
      <AdminShell title="Penugasan tidak ditemukan">
        <div className="border border-border bg-card p-10 text-center">
          <h2 className="font-display text-3xl font-semibold">Penugasan tidak ditemukan.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ID {id} tidak tersedia atau sudah dihapus.
          </p>
          <Button className="mt-5" asChild>
            <Link to="/admin/penugasan">Kembali ke daftar</Link>
          </Button>
        </div>
      </AdminShell>
    );
  const left = timeLeft(assignment.deadline);
  const saveOverview = () => {
    updateAssignment(
      assignment.id,
      { workStatus: status, progress, internalNote: note },
      {
        actor: "",
        action: "Memperbarui penugasan",
        before: `${assignment.workStatus} · ${assignment.progress}%`,
        after: `${status} · ${progress}%`,
        note: "Status, progres, atau catatan internal diperbarui.",
      },
    );
    toast.success("Informasi penugasan diperbarui");
  };
  const wa = customer?.whatsapp.replace(/\D/g, "") ?? "";
  const currentPrimary = assignment.primaryWorkerId
    ? getWorker(assignment.primaryWorkerId)
    : undefined;
  const currentCapacity = currentPrimary
    ? getWorkerStats(currentPrimary, assignments, invoices)
    : undefined;
  const canManage = session?.role === "admin" && session.permissions.includes("assignment:manage");
  return (
    <AdminShell title="Detail Penugasan">
      <nav className="text-xs text-muted-foreground">
        <Link to="/admin">Admin</Link> / <Link to="/admin/penugasan">Semua Penugasan</Link> /{" "}
        {assignment.id}
      </nav>
      <header data-admin-intro className="mt-5 border-b border-border pb-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-[.15em] text-primary">
            {assignment.id}
          </span>
          <AdminStatusBadge status={assignment.workStatus} />
          <PaymentBadge status={invoice?.paymentStatus ?? "Belum Ditagihkan"} />
          <AccessBadge access={assignment.accessStatus} />
          <PriorityBadge priority={assignment.priority} />
        </div>
        <div className="mt-4 grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            <h2 className="max-w-5xl font-display text-[clamp(2.4rem,5vw,5rem)] font-semibold leading-[.94] tracking-[-.055em]">
              {assignment.title}
              <span className="text-primary">.</span>
            </h2>
            <p className="mt-4 text-sm font-semibold">
              @{customer?.username ?? assignment.customerId}{" "}
              <span className="font-normal text-muted-foreground">· {customer?.id}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2 text-xs">
              <p>
                <span className="text-muted-foreground">Deadline</span> ·{" "}
                {formatDateTime(assignment.deadline)}
              </p>
              <p className={left.urgent ? "font-bold text-destructive" : "font-semibold"}>
                {left.label}
              </p>
              <p>
                <span className="text-muted-foreground">Primary worker</span> ·{" "}
                {assignment.primaryWorkerId
                  ? (getWorker(assignment.primaryWorkerId)?.fullName ?? "Tidak ditemukan")
                  : "Belum ditentukan"}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
            <Button variant="outline" asChild>
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
                <MessageSquare /> Hubungi customer
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/penugasan">
                <ArrowLeft /> Semua penugasan
              </Link>
            </Button>
          </div>
        </div>
        {canManage && (
          <div className="mt-7 grid gap-3 border border-border bg-card p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
            <label className="space-y-1.5 text-xs font-bold">
              Ubah status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as WorkStatus)}
                className="h-10 w-full border border-input bg-background px-3"
              >
                {WORK_STATUSES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-bold">
              Reviewer
              <select
                value={assignment.reviewerWorkerId ?? ""}
                onChange={(event) => {
                  const next = event.target.value;
                  if (
                    next &&
                    next === assignment.primaryWorkerId &&
                    !window.confirm(
                      "Primary worker juga akan menjadi reviewer. Lanjutkan dengan peran ganda?",
                    )
                  )
                    return;
                  updateAssignment(
                    assignment.id,
                    { reviewerWorkerId: next || undefined },
                    {
                      actor: "",
                      action: "Mengganti reviewer",
                      before: assignment.reviewerWorkerId
                        ? (getWorker(assignment.reviewerWorkerId)?.fullName ??
                          assignment.reviewerWorkerId)
                        : "Belum ditentukan",
                      after: next ? (getWorker(next)?.fullName ?? next) : "Belum ditentukan",
                      note: replacementReason || "Perubahan tim penugasan.",
                    },
                  );
                }}
                className="h-10 w-full border border-input bg-background px-3"
              >
                <option value="">Belum ditentukan</option>
                {workers
                  .filter(
                    (item) =>
                      item.status === "Aktif" &&
                      !item.archivedAt &&
                      (item.role === "Reviewer" || item.role === "Super Admin"),
                  )
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.fullName} · {item.specialties.join(", ") || item.role}
                    </option>
                  ))}
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-bold">
              Progress: {progress}%
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(event) => setProgress(Number(event.target.value))}
                className="h-10 w-full accent-primary"
              />
            </label>
            <label className="space-y-1.5 text-xs font-bold">
              Penanggung jawab
              <select
                value={assignment.primaryWorkerId ?? ""}
                onChange={(event) => {
                  const next = event.target.value;
                  const previous = assignment.primaryWorkerId;
                  updateAssignment(
                    assignment.id,
                    next
                      ? {
                          primaryWorkerId: next,
                          assignedAt: new Date().toISOString(),
                          assignedBy: getCurrentWorker()?.id ?? "Sistem",
                        }
                      : { primaryWorkerId: undefined },
                    {
                      actor: "",
                      action: "Mengganti primary worker",
                      before: previous
                        ? (getWorker(previous)?.fullName ?? previous)
                        : "Belum ditentukan",
                      after: next ? (getWorker(next)?.fullName ?? next) : "Belum ditentukan",
                      note: replacementReason || "Pergantian dari halaman detail.",
                    },
                  );
                }}
                className="h-10 w-full border border-input bg-background px-3"
              >
                <option value="">Belum ditentukan</option>
                {workers
                  .filter(
                    (item) =>
                      item.status === "Aktif" && !item.archivedAt && item.role !== "Finance",
                  )
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.fullName} · {item.specialties.join(", ") || item.role}
                    </option>
                  ))}
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-bold">
              Alasan pergantian
              <input
                className="h-10 w-full border border-input bg-background px-3"
                value={replacementReason}
                onChange={(event) => setReplacementReason(event.target.value)}
                placeholder="Opsional"
              />
            </label>
            <Button onClick={saveOverview}>
              <Save /> Simpan
            </Button>
            <fieldset className="border border-border p-3 md:col-span-4">
              <legend className="px-1 text-xs font-bold">Supporting worker</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {workers
                  .filter(
                    (item) =>
                      item.status === "Aktif" &&
                      !item.archivedAt &&
                      item.role !== "Finance" &&
                      item.id !== assignment.primaryWorkerId,
                  )
                  .map((item) => {
                    const stats = getWorkerStats(item, assignments, invoices);
                    const selected = assignment.supportingWorkerIds.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className="flex items-start gap-2 border border-border p-3 text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(event) => {
                            const nextIds = event.target.checked
                              ? [...assignment.supportingWorkerIds, item.id]
                              : assignment.supportingWorkerIds.filter(
                                  (workerId) => workerId !== item.id,
                                );
                            updateAssignment(
                              assignment.id,
                              { supportingWorkerIds: nextIds },
                              {
                                actor: "",
                                action: event.target.checked
                                  ? "Menambahkan supporting worker"
                                  : "Menghapus supporting worker",
                                before:
                                  assignment.supportingWorkerIds
                                    .map((workerId) => getWorker(workerId)?.fullName ?? workerId)
                                    .join(", ") || "Tidak ada",
                                after:
                                  nextIds
                                    .map((workerId) => getWorker(workerId)?.fullName ?? workerId)
                                    .join(", ") || "Tidak ada",
                                note: replacementReason || "Perubahan tim penugasan.",
                              },
                            );
                          }}
                        />
                        <span>
                          <strong>{item.fullName}</strong>
                          <span className="block text-muted-foreground">
                            {stats.active}/{item.maxActiveAssignments} aktif ·{" "}
                            {item.specialties.join(", ") || item.role}
                            {stats.capacity > 1 ? " · OVERLOAD" : ""}
                          </span>
                        </span>
                      </label>
                    );
                  })}
              </div>
            </fieldset>
          </div>
        )}
        {!canManage && session?.role === "admin" && session.workerRole === "Worker" && (
          <div className="mt-7 grid gap-3 border border-border bg-card p-4 md:grid-cols-[1fr_2fr_auto] md:items-end">
            <label className="space-y-1.5 text-xs font-bold">
              Progress: {progress}%
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(event) => setProgress(Number(event.target.value))}
                className="h-10 w-full accent-primary"
              />
            </label>
            <label className="space-y-1.5 text-xs font-bold">
              Catatan internal
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} />
            </label>
            <Button
              onClick={() => {
                updateAssignment(
                  assignment.id,
                  { progress, internalNote: note },
                  {
                    actor: "",
                    action: "Memperbarui progres sendiri",
                    before: `${assignment.progress}%`,
                    after: `${progress}%`,
                    note: "Pembaruan oleh worker yang ditugaskan.",
                  },
                );
                toast.success("Progress diperbarui");
              }}
            >
              <Save /> Simpan progress
            </Button>
          </div>
        )}
        {!canManage && session?.role === "admin" && session.workerRole === "Reviewer" && (
          <div className="mt-7 grid gap-3 border border-border bg-card p-4 md:grid-cols-[1fr_2fr_auto] md:items-end">
            <label className="space-y-1.5 text-xs font-bold">
              Status review
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as WorkStatus)}
                className="h-10 w-full border border-input bg-background px-3"
              >
                <option>Menunggu Review</option>
                <option>Dalam Revisi</option>
                <option>Selesai</option>
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-bold">
              Catatan review
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} />
            </label>
            <Button
              onClick={() => {
                updateAssignment(
                  assignment.id,
                  { workStatus: status, internalNote: note },
                  {
                    actor: "",
                    action: "Memperbarui review",
                    before: assignment.workStatus,
                    after: status,
                    note: "Pembaruan oleh reviewer yang ditugaskan.",
                  },
                );
                toast.success("Review diperbarui");
              }}
            >
              <Save /> Simpan review
            </Button>
          </div>
        )}
        {currentCapacity && currentCapacity.capacity > 1 && (
          <p className="mt-3 border border-destructive/40 bg-destructive/5 p-3 text-xs font-semibold text-destructive">
            Peringatan: {currentPrimary?.fullName} menangani {currentCapacity.active} penugasan
            aktif dari kapasitas {currentPrimary?.maxActiveAssignments}. Pertimbangkan redistribusi.
          </p>
        )}
      </header>

      <section className="mt-7 border border-border bg-card" data-admin-reveal>
        <header className="border-b border-border p-5">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
            01 / Informasi
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold">Informasi Penugasan</h3>
        </header>
        <div className="grid gap-7 p-5 xl:grid-cols-[1fr_.9fr]">
          <div>
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ["Customer", `@${customer?.username ?? "—"}`],
                ["WhatsApp", customer?.whatsapp ?? "—"],
                ["Kategori", assignment.category],
                ["Topik", assignment.topic],
                ["Output diminta", assignment.output],
                ["Deadline", formatDateTime(assignment.deadline)],
              ].map(([label, value]) => (
                <div key={label} className="border-t border-border pt-3">
                  <dt className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-2 text-sm leading-6">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 border-t border-border pt-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                Deskripsi kebutuhan
              </p>
              <p className="mt-2 text-sm leading-6">{assignment.description}</p>
            </div>
          </div>
          <div>
            <label className="block border border-status-warning/30 bg-status-warning/5 p-4 text-xs font-bold">
              Internal note
              <span className="block pt-1 font-normal text-status-warning">
                Hanya dapat dilihat admin.
              </span>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={5}
                className="mt-3 bg-background"
                disabled={!canManage}
              />
            </label>
            <div className="mt-5">
              <h4 className="text-xs font-bold">Progress timeline</h4>
              <div className="mt-3">
                <AdminProgress value={progress} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <PermissionGuard permission="result:manage">
        <AssignmentFilesPanel assignment={assignment} />

        <PermissionGuard permission="assignment:manage">
          <AssignmentAccessTokenPanel assignment={assignment} />
        </PermissionGuard>
      </PermissionGuard>

      <div className="mt-7 grid items-start gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <PermissionGuard permission="result:manage">
          <ResultUploadPanel assignment={assignment} />
        </PermissionGuard>
        <div className="space-y-6">
          <PermissionGuard permission="assignment:manage">
            <AccessControlPanel assignment={assignment} />
          </PermissionGuard>
          <PermissionGuard permission="finance:manage">
            <InvoicePanel assignment={assignment} />
          </PermissionGuard>
        </div>
      </div>

      <section className="mt-7 border border-border bg-card" data-admin-reveal>
        <header className="border-b border-border p-5">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
            04 / Audit
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold">Audit Trail</h3>
        </header>
        <ol className="p-5">
          {assignment.audit.length === 0 ? (
            <li className="py-6 text-center text-xs text-muted-foreground">
              Belum ada aktivitas audit.
            </li>
          ) : (
            assignment.audit.map((entry) => (
              <li
                key={entry.id}
                className="relative grid gap-2 border-l border-border pb-7 pl-6 last:pb-0 sm:grid-cols-[150px_1fr_auto]"
              >
                <span className="absolute -left-1.5 top-1 size-3 border border-primary bg-background" />
                <div>
                  <p className="text-xs font-bold">{entry.actor}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">Administrator</p>
                </div>
                <div>
                  <p className="text-xs font-semibold">{entry.action}</p>
                  {(entry.before || entry.after) && (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {entry.before ?? "—"} → {entry.after ?? "—"}
                    </p>
                  )}
                  {entry.note && <p className="mt-1 text-xs text-muted-foreground">{entry.note}</p>}
                </div>
                <time className="text-[10px] text-muted-foreground">
                  {formatDateTime(entry.timestamp)}
                </time>
              </li>
            ))
          )}
        </ol>
      </section>
    </AdminShell>
  );
}
