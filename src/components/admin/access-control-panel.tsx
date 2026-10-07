import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Lock, LockOpen } from "lucide-react";
import { toast } from "sonner";
import { AdminConfirmationDialog } from "@/components/admin/admin-confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import type { AdminAssignment } from "@/lib/admin-data";
import { useAdminStore } from "@/lib/use-admin-store";
import { formatDateTime } from "@/lib/portal-data";

export function AccessControlPanel({ assignment }: { assignment: AdminAssignment }) {
  const { getCurrentWorker, getCustomer, getInvoiceForAssignment, updateAssignment } =
    useAdminStore();
  const currentWorker = getCurrentWorker();
  const invoice = getInvoiceForAssignment(assignment.id);
  const customer = getCustomer(assignment.customerId);
  const [allow, setAllow] = useState(assignment.accessStatus === "Dapat Diakses");
  const [reason, setReason] = useState(assignment.accessReason);
  const [reviewed, setReviewed] = useState(false);
  const [notify, setNotify] = useState(true);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    setAllow(assignment.accessStatus === "Dapat Diakses");
    setReason(assignment.accessReason);
  }, [assignment.accessReason, assignment.accessStatus]);

  const published = assignment.files.some((file) => file.status === "Published");
  const paid = invoice?.paymentStatus === "Lunas";
  const finished = assignment.workStatus === "Selesai";
  const canOpen = published && paid && reviewed && finished;
  const warnings = allow
    ? [
        !finished && "Pekerjaan belum berstatus Selesai.",
        !published && "Belum ada file published.",
        !paid && "Pembayaran belum lunas.",
        !reviewed && "Pemeriksaan file belum dikonfirmasi.",
      ].filter(Boolean)
    : [];

  const apply = () => {
    const next = allow ? "Dapat Diakses" : "Terkunci";
    updateAssignment(
      assignment.id,
      {
        accessStatus: next,
        accessReason: reason,
        ...(allow
          ? {
              accessOpenedAt: new Date().toISOString(),
              accessOpenedBy: currentWorker?.fullName ?? "Staff",
            }
          : {}),
      },
      {
        actor: currentWorker?.fullName ?? "Staff",
        action: allow ? "Membuka akses hasil" : "Mengunci akses hasil",
        before: assignment.accessStatus,
        after: next,
        note: reason || "Status akses diperbarui.",
      },
    );
    toast.success(allow ? "Akses customer berhasil dibuka" : "Akses customer berhasil dikunci", {
      description: notify ? "Notifikasi customer disiapkan." : undefined,
    });
  };

  const open = assignment.accessStatus === "Dapat Diakses";
  return (
    <section className="border border-border bg-card" data-admin-reveal>
      <header
        className={`border-b p-5 ${open ? "border-success/40 bg-success/5" : "border-status-warning/40 bg-status-warning/5"}`}
      >
        <div className="flex items-center gap-3">
          {open ? (
            <LockOpen className="size-7 text-success" />
          ) : (
            <Lock className="size-7 text-status-warning" />
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">
              Kontrol Akses Customer
            </p>
            <h3
              className={`mt-1 font-display text-2xl font-semibold ${open ? "text-success" : "text-status-warning"}`}
            >
              {open ? "HASIL DAPAT DIAKSES" : "HASIL TERKUNCI"}
            </h3>
          </div>
        </div>
      </header>
      <div className="space-y-5 p-5">
        <p className="text-sm leading-6 text-muted-foreground">
          {open
            ? "Customer dapat melihat dan mengunduh file yang dipublikasikan."
            : "Customer tidak dapat melihat atau mengunduh file hasil."}
        </p>
        {open && (
          <dl className="grid gap-3 border border-success/30 p-4 text-xs sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Dibuka pada</dt>
              <dd className="mt-1 font-bold">
                {assignment.accessOpenedAt ? formatDateTime(assignment.accessOpenedAt) : "Sesi ini"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Dibuka oleh</dt>
              <dd className="mt-1 font-bold">{assignment.accessOpenedBy ?? "Belum tercatat"}</dd>
            </div>
          </dl>
        )}
        <label className="flex min-h-14 items-center justify-between gap-4 border border-border p-4 text-sm font-bold">
          <span>Izinkan customer mengakses hasil</span>
          <button
            type="button"
            role="switch"
            aria-checked={allow}
            onClick={() => setAllow((value) => !value)}
            className={`relative h-6 w-11 border transition-colors ${allow ? "border-success bg-success" : "border-border bg-muted"}`}
          >
            <span
              className={`absolute top-0.5 size-4 bg-white transition-transform ${allow ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </button>
        </label>
        <label className="space-y-1.5 text-xs font-bold">
          Alasan penguncian / catatan akses
          <Textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} />
        </label>
        <div className="space-y-3 border border-border p-4 text-xs">
          <p>
            <span className="text-muted-foreground">Status pembayaran:</span>{" "}
            <strong>{invoice?.paymentStatus ?? "Belum Ditagihkan"}</strong>
          </p>
          <label className="flex items-center gap-2 font-semibold">
            <Checkbox checked={reviewed} onCheckedChange={(value) => setReviewed(value === true)} />{" "}
            File telah melalui pemeriksaan
          </label>
          <label className="flex items-center gap-2 font-semibold">
            <Checkbox checked={notify} onCheckedChange={(value) => setNotify(value === true)} />{" "}
            Kirim notifikasi kepada customer
          </label>
        </div>
        {warnings.length > 0 && (
          <div
            role="alert"
            className="flex gap-3 border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive"
          >
            <AlertTriangle className="size-4 shrink-0" />
            <p>
              <strong>Akses belum dapat dibuka.</strong> {warnings.join(" ")}
            </p>
          </div>
        )}
        {canOpen && allow && (
          <p className="flex items-center gap-2 text-xs font-bold text-success">
            <CheckCircle2 className="size-4" /> Semua prasyarat akses terpenuhi.
          </p>
        )}
        <Button className="w-full" disabled={warnings.length > 0} onClick={() => setConfirm(true)}>
          Perbarui Akses
        </Button>
      </div>
      <AdminConfirmationDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={allow ? "Buka akses hasil?" : "Kunci kembali hasil?"}
        description={
          allow
            ? "Customer akan dapat melihat dan mengunduh seluruh file yang telah dipublikasikan."
            : "Customer tidak lagi dapat membuka atau mengunduh file hasil."
        }
        details={[
          { label: "Status lama", value: assignment.accessStatus },
          { label: "Status baru", value: allow ? "Dapat Diakses" : "Terkunci" },
          { label: "Customer", value: customer?.username ?? assignment.customerId },
          { label: "Penugasan", value: assignment.id },
        ]}
        confirmLabel={allow ? "Ya, buka akses" : "Ya, kunci hasil"}
        destructive={!allow}
        onConfirm={apply}
      />
    </section>
  );
}
