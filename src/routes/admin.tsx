import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CircleDollarSign,
  FileLock2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  AccessBadge,
  AdminPageHeader,
  AdminProgress,
  AdminStatusBadge,
  Metric,
  PaymentBadge,
  PriorityBadge,
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/lib/use-admin-store";
import { formatDateTime, timeLeft } from "@/lib/portal-data";
import { formatRupiah } from "@/lib/secure-generators";
import {
  getPaidRevenue,
  getWorkerStats,
  isAssignmentActive,
  isAssignmentLate,
} from "@/lib/admin-selectors";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const {
    assignments,
    audits,
    customers,
    feedback,
    getCustomer,
    getInvoiceForAssignment,
    getWorker,
    invoices,
    workers,
  } = useAdminStore();
  const deadlineItems = [...assignments]
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 4);
  const counts = {
    draft: assignments.filter((item) => item.workStatus === "Draft").length,
    active: assignments.filter((item) => item.workStatus === "Sedang Dikerjakan").length,
    review: assignments.filter((item) => item.workStatus === "Menunggu Review").length,
    done: assignments.filter((item) => item.workStatus === "Selesai").length,
  };
  const activeWorkers = workers.filter((item) => item.status === "Aktif" && !item.archivedAt);
  const overloadedWorkers = activeWorkers.filter(
    (item) => getWorkerStats(item, assignments, invoices).capacity > 1,
  );
  const unassigned = assignments.filter(
    (item) => isAssignmentActive(item) && !item.primaryWorkerId,
  ).length;
  return (
    <AdminShell title="Ringkasan">
      <AdminPageHeader
        eyebrow="Admin Workspace / 2026"
        title="Pusat Kendali"
        description="Pantau customer, deadline, hasil, pembayaran, dan akses dari satu tempat."
        actions={
          <Button asChild>
            <Link to="/admin/penugasan/baru">
              Buat Penugasan <ArrowRight />
            </Link>
          </Button>
        }
      />

      <section
        className="mt-7 grid grid-cols-2 border-b border-r border-border md:grid-cols-3 xl:grid-cols-6"
        aria-label="Ringkasan metrik"
      >
        <Metric
          label="Total Penugasan"
          value={String(assignments.length)}
          href="/admin/penugasan"
        />
        <Metric label="Customer" value={String(customers.length)} href="/admin/customer" />
        <Metric
          label="Pembayaran Pending"
          value={String(
            invoices.filter((item) => item.paymentStatus === "Menunggu Verifikasi").length,
          )}
          href="/admin/pembayaran"
        />
        <Metric
          label="Hasil Terkunci"
          value={String(assignments.filter((item) => item.accessStatus === "Terkunci").length)}
          href="/admin/penugasan?akses=Terkunci"
        />
        <Metric
          label="Feedback Baru"
          value={String(
            feedback.filter((item) => item.moderationStatus === "Menunggu Moderasi").length,
          )}
          href="/admin/feedback"
        />
        <Metric
          label="Pendapatan"
          value={formatRupiah(getPaidRevenue(invoices))}
          href="/admin/laporan"
        />
        <Metric
          label="Aktif"
          value={String(assignments.filter(isAssignmentActive).length)}
          href="/admin/penugasan?status=Sedang+Dikerjakan"
        />
        <Metric
          label="Menunggu Review"
          value={String(counts.review)}
          href="/admin/penugasan?status=Menunggu+Review"
        />
        <Metric
          label="Terlambat"
          value={String(assignments.filter((item) => isAssignmentLate(item)).length)}
          href="/admin/penugasan?sort=deadline"
        />
        <Metric
          label="Customer Aktif"
          value={String(customers.filter((item) => item.accountStatus === "Aktif").length)}
          href="/admin/customer"
        />
        <Metric label="Worker Aktif" value={String(activeWorkers.length)} href="/admin/worker" />
        <Metric
          label="Over Capacity"
          value={String(overloadedWorkers.length)}
          href="/admin/worker"
        />
      </section>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.05fr_.95fr]" data-admin-reveal>
        <section className="border border-border bg-card">
          <header className="border-b border-border p-5">
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
              Distribusi
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold">Status Penugasan</h3>
          </header>
          <div className="space-y-5 p-5">
            {(
              [
                ["Draft", counts.draft, "bg-muted-foreground"],
                ["Sedang Dikerjakan", counts.active, "bg-primary"],
                ["Menunggu Review", counts.review, "bg-status-review"],
                ["Selesai", counts.done, "bg-success"],
              ] as const
            ).map(([label, value, color]) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold">{label}</span>
                  <span className="font-bold tabular-nums">{value}</span>
                </div>
                <div className="h-2 bg-border">
                  <div
                    data-admin-progress
                    className={`h-full origin-left ${color}`}
                    style={{
                      width: `${Math.max(8, (value / Math.max(1, assignments.length)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="border border-border bg-card">
          <header className="border-b border-border p-5">
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
              Prioritas hari ini
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold">Membutuhkan Tindakan</h3>
          </header>
          <div>
            {(
              [
                [
                  CircleDollarSign,
                  "Pembayaran menunggu verifikasi",
                  `${invoices.filter((item) => item.paymentStatus === "Menunggu Verifikasi").length} transaksi`,
                  "/admin/pembayaran",
                ],
                [
                  FileLock2,
                  "Hasil masih terkunci",
                  `${assignments.filter((item) => item.accessStatus === "Terkunci").length} penugasan`,
                  "/admin/penugasan",
                ],
                [
                  Users,
                  "Akun customer perlu reset",
                  `${customers.filter((item) => item.credentialStatus === "Perlu Reset").length} akun`,
                  "/admin/customer",
                ],
              ] as [
                LucideIcon,
                string,
                string,
                "/admin/pembayaran" | "/admin/penugasan" | "/admin/customer",
              ][]
            ).map(([Icon, label, value, href]) => (
              <Link
                key={String(label)}
                to={String(href)}
                className="group flex min-h-16 items-center gap-3 border-b border-border px-5 last:border-0 hover:bg-surface"
              >
                <Icon className="size-4 text-primary" />
                <span className="flex-1 text-sm font-semibold">{String(label)}</span>
                <span className="text-xs text-muted-foreground">{String(value)}</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_.9fr]" data-admin-reveal>
        <section className="border border-border bg-card">
          <header className="flex items-end justify-between border-b border-border p-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
                Kapasitas tim
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold">Beban Worker</h3>
            </div>
            <Link to="/admin/worker" className="text-xs font-bold text-primary">
              Kelola worker →
            </Link>
          </header>
          <div className="divide-y divide-border">
            {activeWorkers.map((worker) => {
              const stats = getWorkerStats(worker, assignments, invoices);
              return (
                <Link
                  key={worker.id}
                  to="/admin/worker/$id"
                  params={{ id: worker.id }}
                  className="grid gap-3 p-4 hover:bg-surface sm:grid-cols-[1fr_120px_90px] sm:items-center"
                >
                  <div>
                    <p className="text-sm font-bold">{worker.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {worker.role} · {worker.specialties.join(", ") || "General"}
                    </p>
                  </div>
                  <div>
                    <div className="h-1.5 bg-border">
                      <span
                        className={`block h-full ${stats.capacity > 1 ? "bg-destructive" : "bg-primary"}`}
                        style={{ width: `${Math.min(100, stats.capacity * 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {stats.active}/{worker.maxActiveAssignments} aktif
                    </p>
                  </div>
                  <p
                    className={`text-xs font-bold ${stats.capacity > 1 ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {stats.capacity > 1 ? "OVER" : `${Math.round(stats.capacity * 100)}%`}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
        <section className="border border-border bg-card">
          <header className="flex items-end justify-between border-b border-border p-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">Audit</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">Aktivitas Terbaru</h3>
            </div>
            <Link to="/admin/aktivitas" className="text-xs font-bold text-primary">
              Lihat semua →
            </Link>
          </header>
          <div className="divide-y divide-border">
            {audits.slice(0, 6).map((entry) => (
              <div key={entry.id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold">{entry.actor}</p>
                  <time className="text-[10px] text-muted-foreground">
                    {formatDateTime(entry.timestamp)}
                  </time>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.action} · {entry.entityId}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {unassigned > 0 && (
        <div className="mt-6 flex items-center gap-3 border border-status-warning/40 bg-status-warning/5 p-4 text-sm">
          <AlertTriangle className="size-4 text-status-warning" />
          <p>
            <strong>{unassigned} penugasan aktif</strong> belum memiliki primary worker.
          </p>
          <Button size="sm" variant="outline" className="ml-auto" asChild>
            <Link to="/admin/penugasan">Tinjau</Link>
          </Button>
        </div>
      )}

      <section className="mt-8" data-admin-reveal>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
              Waktu kritis
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold">Antrean Deadline</h3>
          </div>
          <AlertTriangle className="size-5 text-status-warning" />
        </div>
        <div className="hidden overflow-x-auto border border-border bg-card md:block">
          <table className="w-full min-w-[800px] text-left text-xs">
            <thead className="border-b border-border bg-surface text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Judul / Customer</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Sisa waktu</th>
                <th className="p-3">Prioritas</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {deadlineItems.map((item) => {
                const left = timeLeft(item.deadline);
                return (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0 hover:bg-surface"
                  >
                    <td className="p-3 font-bold text-primary">{item.id}</td>
                    <td className="p-3">
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-muted-foreground">
                        @{getCustomer(item.customerId)?.username ?? item.customerId}
                      </p>
                    </td>
                    <td className="p-3">{formatDateTime(item.deadline)}</td>
                    <td
                      className={
                        left.urgent ? "p-3 font-bold text-destructive" : "p-3 font-semibold"
                      }
                    >
                      {left.label}
                    </td>
                    <td className="p-3">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/admin/penugasan/$id" params={{ id: item.id }}>
                          Buka
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 md:hidden">
          {deadlineItems.map((item) => (
            <article key={item.id} className="border border-border bg-card p-4">
              <div className="flex justify-between gap-3">
                <p className="text-xs font-bold text-primary">{item.id}</p>
                <PriorityBadge priority={item.priority} />
              </div>
              <h4 className="mt-3 font-bold">{item.title}</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                @{getCustomer(item.customerId)?.username}
              </p>
              <p className="mt-4 text-xs font-semibold">{formatDateTime(item.deadline)}</p>
              <Button className="mt-4 w-full" variant="outline" asChild>
                <Link to="/admin/penugasan/$id" params={{ id: item.id }}>
                  Buka Penugasan
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8" data-admin-reveal>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-2xl font-semibold">Penugasan Terbaru</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/penugasan">
              Lihat semua <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="border-b border-border bg-surface text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">ID / Customer</th>
                <th className="p-3">Judul</th>
                <th className="p-3">Status</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Pembayaran</th>
                <th className="p-3">Akses</th>
                <th className="p-3">Admin</th>
              </tr>
            </thead>
            <tbody>
              {assignments.slice(0, 5).map((item) => {
                const invoice = getInvoiceForAssignment(item.id);
                return (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="p-3">
                      <Link
                        to="/admin/penugasan/$id"
                        params={{ id: item.id }}
                        className="font-bold text-primary"
                      >
                        {item.id}
                      </Link>
                      <p className="mt-1 text-muted-foreground">
                        @{getCustomer(item.customerId)?.username}
                      </p>
                    </td>
                    <td className="max-w-52 p-3 font-semibold">{item.title}</td>
                    <td className="p-3">
                      <AdminStatusBadge status={item.workStatus} />
                    </td>
                    <td className="p-3">
                      <AdminProgress value={item.progress} />
                    </td>
                    <td className="p-3">
                      <PaymentBadge status={invoice?.paymentStatus ?? "Belum Ditagihkan"} />
                    </td>
                    <td className="p-3">
                      <AccessBadge access={item.accessStatus} />
                    </td>
                    <td className="p-3 font-semibold">
                      {item.primaryWorkerId
                        ? (getWorker(item.primaryWorkerId)?.fullName ?? "Tidak ditemukan")
                        : "Belum ditentukan"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
