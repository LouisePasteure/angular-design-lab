import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Archive, ArrowLeft, Copy, KeyRound, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES, type Category, type WorkerRole, type WorkerStatus } from "@/lib/admin-data";
import { getWorkerAssignments, getWorkerStats, ROLE_LABELS } from "@/lib/admin-selectors";
import { generatePassword, formatRupiah, hashSecret, maskWhatsapp } from "@/lib/secure-generators";
import { formatDateTime, formatShortDate } from "@/lib/portal-data";
import { useAdminStore } from "@/lib/use-admin-store";

export const Route = createFileRoute("/admin_/worker/$id")({
  head: ({ params }) => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex" }],
  }),
  component: WorkerDetail,
});
function WorkerDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const {
    assignments,
    audits,
    deleteWorker,
    getCustomer,
    getInvoiceForAssignment,
    invoices,
    updateWorker,
    workers,
  } = useAdminStore();
  const worker = workers.find((item) => item.id === id && !item.deletedAt);
  const [role, setRole] = useState<WorkerRole>(worker?.role ?? "Worker");
  const [status, setStatus] = useState<WorkerStatus>(worker?.status ?? "Nonaktif");
  const [capacity, setCapacity] = useState(worker?.maxActiveAssignments ?? 0);
  const [specialties, setSpecialties] = useState<Category[]>(worker?.specialties ?? []);
  const [password, setPassword] = useState("");
  if (!worker)
    return (
      <AdminShell title="Worker tidak ditemukan">
        <div className="border border-border bg-card p-10 text-center">
          <h2 className="font-display text-3xl font-semibold">Worker tidak ditemukan.</h2>
          <Button className="mt-5" asChild>
            <Link to="/admin/worker">Kembali</Link>
          </Button>
        </div>
      </AdminShell>
    );
  const stats = getWorkerStats(worker, assignments, invoices);
  const own = getWorkerAssignments(worker.id, assignments);
  const activity = audits
    .filter((item) => item.actorId === worker.id || item.entityId === worker.id)
    .slice(0, 12);
  const save = () => {
    updateWorker(
      worker.id,
      { role, status, maxActiveAssignments: capacity, specialties },
      "Memperbarui profil worker",
    );
    toast.success("Worker diperbarui");
  };
  const reset = async () => {
    const raw = generatePassword();
    updateWorker(
      worker.id,
      { passwordDigest: await hashSecret(raw), credentialStatus: "Password Sementara" },
      "Mereset password worker",
    );
    setPassword(raw);
    toast.success("Password sementara dibuat");
  };
  const remove = () => {
    const typed = window.prompt(`Ketik ${worker.username} untuk menghapus permanen.`);
    if (typed !== worker.username) return;
    const result = deleteWorker(worker.id);
    if (result === "has_active_assignments") {
      toast.error(
        "Worker masih memiliki penugasan aktif. Pindahkan atau nonaktifkan assignment terlebih dahulu.",
      );
      return;
    }
    void navigate({ to: "/admin/worker" });
  };
  return (
    <AdminShell title="Detail Worker">
      <nav className="text-xs text-muted-foreground">
        <Link to="/admin/worker">
          <ArrowLeft className="mr-1 inline size-3" /> Worker
        </Link>{" "}
        / {worker.id}
      </nav>
      <header className="mt-5 flex flex-col gap-5 border-b border-border pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
            {worker.id} / {worker.role}
          </p>
          <h2 className="mt-2 font-display text-[clamp(2.6rem,5vw,5rem)] font-semibold leading-none tracking-[-.05em]">
            {worker.fullName}
            <span className="text-primary">.</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            @{worker.username} · {maskWhatsapp(worker.whatsapp)} · {worker.status}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void reset()}>
            <KeyRound /> Reset password
          </Button>
          <Button onClick={save}>
            <Save /> Simpan
          </Button>
        </div>
      </header>
      <section className="mt-7 grid gap-px border border-border bg-border sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Total", stats.total],
          ["Aktif", stats.active],
          ["Menunggu review", stats.review],
          ["Selesai", stats.completed],
          ["Terlambat", stats.late],
          ["Completion", `${stats.completionRate}%`],
          ["Tepat waktu", `${stats.onTimeRate}%`],
          ["Rata-rata selesai", `${stats.averageCompletionDays.toFixed(1)} hari`],
          ["Pendapatan", formatRupiah(stats.revenue)],
          ["Invoice belum lunas", formatRupiah(stats.unpaid)],
        ].map(([label, value]) => (
          <div key={label} className="bg-card p-5">
            <p className="font-display text-3xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>
      <div className="mt-6 grid gap-6 xl:grid-cols-[.75fr_1.25fr]">
        <section className="border border-border bg-card p-5">
          <h3 className="font-display text-2xl font-semibold">Pengaturan worker</h3>
          <div className="mt-5 space-y-4">
            <label className="block text-xs font-bold">
              Role
              <select
                className="mt-1 h-10 w-full border border-input bg-background px-3"
                value={role}
                onChange={(e) => setRole(e.target.value as WorkerRole)}
              >
                {ROLE_LABELS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold">
              Status
              <select
                className="mt-1 h-10 w-full border border-input bg-background px-3"
                value={status}
                onChange={(e) => setStatus(e.target.value as WorkerStatus)}
              >
                {["Aktif", "Nonaktif", "Ditangguhkan", "Diarsipkan"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold">
              Kapasitas
              <Input
                className="mt-1"
                type="number"
                min="0"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              />
            </label>
            <div>
              <p className="text-xs font-bold">Specialty</p>
              {CATEGORIES.map((item) => (
                <label key={item} className="mt-2 flex gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={specialties.includes(item)}
                    onChange={(e) =>
                      setSpecialties((values) =>
                        e.target.checked
                          ? [...values, item]
                          : values.filter((value) => value !== item),
                      )
                    }
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
          <Button
            className="mt-5 w-full"
            variant="outline"
            onClick={() =>
              updateWorker(
                worker.id,
                {
                  status: worker.status === "Diarsipkan" ? "Nonaktif" : "Diarsipkan",
                  ...(worker.status === "Diarsipkan"
                    ? {}
                    : { archivedAt: new Date().toISOString() }),
                } as never,
                "Mengubah status arsip worker",
              )
            }
          >
            <Archive /> {worker.status === "Diarsipkan" ? "Pulihkan" : "Arsipkan"}
          </Button>
          <Button className="mt-2 w-full text-destructive" variant="outline" onClick={remove}>
            <Trash2 /> Hapus permanen
          </Button>
        </section>
        <section className="border border-border bg-card">
          <header className="border-b border-border p-5">
            <h3 className="font-display text-2xl font-semibold">Penugasan worker</h3>
          </header>
          {own.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead>
                  <tr>
                    {[
                      "ID",
                      "Customer",
                      "Judul",
                      "Status",
                      "Progress",
                      "Deadline",
                      "Peran",
                      "Invoice",
                    ].map((h) => (
                      <th className="p-3" key={h}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {own.map((item) => {
                    const invoice = getInvoiceForAssignment(item.id);
                    const roleLabel =
                      item.primaryWorkerId === worker.id
                        ? "Primary"
                        : item.reviewerWorkerId === worker.id
                          ? "Reviewer"
                          : "Supporting";
                    return (
                      <tr className="border-t border-border" key={item.id}>
                        <td className="p-3">
                          <Link
                            className="font-bold text-primary"
                            to="/admin/penugasan/$id"
                            params={{ id: item.id }}
                          >
                            {item.id}
                          </Link>
                        </td>
                        <td className="p-3">@{getCustomer(item.customerId)?.username}</td>
                        <td className="p-3 font-semibold">{item.title}</td>
                        <td className="p-3">{item.workStatus}</td>
                        <td className="p-3">{item.progress}%</td>
                        <td className="p-3">{formatShortDate(item.deadline)}</td>
                        <td className="p-3">{roleLabel}</td>
                        <td className="p-3">
                          {invoice
                            ? `${formatRupiah(invoice.total)} · ${invoice.paymentStatus}`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-8 text-sm text-muted-foreground">Belum ada penugasan.</p>
          )}
        </section>
      </div>
      {password && (
        <section className="mt-6 border border-primary bg-primary/5 p-5">
          <p className="text-xs font-bold text-primary">Password sementara — tampil satu kali</p>
          <div className="mt-2 flex max-w-xl gap-2">
            <code className="min-w-0 flex-1 border border-border bg-background p-3 text-xs">
              {password}
            </code>
            <Button
              size="icon"
              onClick={() => {
                void navigator.clipboard.writeText(password);
                toast.success("Password disalin");
              }}
            >
              <Copy />
            </Button>
          </div>
        </section>
      )}
      <section className="mt-6 border border-border bg-card p-5">
        <h3 className="font-display text-2xl font-semibold">Aktivitas worker</h3>
        <div className="mt-4 divide-y divide-border">
          {activity.length ? (
            activity.map((entry) => (
              <div key={entry.id} className="grid gap-1 py-3 text-xs sm:grid-cols-[180px_1fr]">
                <time className="text-muted-foreground">{formatDateTime(entry.timestamp)}</time>
                <p>
                  <strong>{entry.action}</strong> · {entry.entityType} {entry.entityId}
                </p>
              </div>
            ))
          ) : (
            <p className="py-6 text-sm text-muted-foreground">Belum ada aktivitas tercatat.</p>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
