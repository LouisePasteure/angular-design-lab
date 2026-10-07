import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FilterX, Plus, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { AdminConfirmationDialog } from "@/components/admin/admin-confirmation-dialog";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  AccessBadge,
  AdminPageHeader,
  AdminProgress,
  AdminStatusBadge,
  PaymentBadge,
  PriorityBadge,
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  ACCESS_STATUSES,
  CATEGORIES,
  PAYMENT_STATUSES,
  WORK_STATUSES,
  type WorkStatus,
} from "@/lib/admin-data";
import { useAdminStore } from "@/lib/use-admin-store";
import { formatShortDate } from "@/lib/portal-data";

export const Route = createFileRoute("/admin_/penugasan/")({
  head: () => ({ meta: [{ title: "jokitugass" }] }),
  component: AdminAssignmentsPage,
});
const control =
  "h-10 min-w-0 border border-input bg-background px-3 text-xs outline-none focus:border-primary";
const TABS = ["Semua", "Draft", "Aktif", "Menunggu Review", "Selesai"] as const;

function AdminAssignmentsPage() {
  const search = Route.useSearch();
  const {
    assignments,
    getCustomer,
    getInvoiceForAssignment,
    getWorker,
    session,
    updateAssignment,
    workers,
  } = useAdminStore();
  const canManage = session?.role === "admin" && session.permissions.includes("assignment:manage");
  const selectableWorkers = workers.filter((item) => item.status === "Aktif" && !item.archivedAt);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<{ action: string; value?: string } | null>(null);
  const [filters, setFilters] = useState({
    q: search.q ?? "",
    username: "",
    category: "",
    status: search.status ?? "",
    access: search.akses ?? "",
    payment: search.pembayaran ?? "",
    workerId: "",
    priority: "",
    sort: "terbaru",
    tab: "Semua",
  });
  const items = useMemo(
    () =>
      assignments
        .filter(
          (item) =>
            session?.role !== "admin" ||
            session.workerRole === "Super Admin" ||
            session.workerRole === "Admin Operasional" ||
            (session.workerRole === "Worker"
              ? item.primaryWorkerId === session.workerId ||
                item.supportingWorkerIds.includes(session.workerId)
              : session.workerRole === "Reviewer"
                ? item.reviewerWorkerId === session.workerId
                : false),
        )
        .filter((item) => {
          const customer = getCustomer(item.customerId);
          const invoice = getInvoiceForAssignment(item.id);
          const q = filters.q.toLowerCase();
          const matchesTab =
            filters.tab === "Semua" ||
            (filters.tab === "Aktif"
              ? ["Sedang Dikerjakan", "Menunggu Review"].includes(item.workStatus)
              : item.workStatus === filters.tab);
          return (
            (!q ||
              `${item.id} ${item.title} ${customer?.username ?? ""}`.toLowerCase().includes(q)) &&
            matchesTab &&
            (!filters.username ||
              customer?.username.toLowerCase().includes(filters.username.toLowerCase())) &&
            (!filters.category || item.category === filters.category) &&
            (!filters.status || item.workStatus === filters.status) &&
            (!filters.access || item.accessStatus === filters.access) &&
            (!filters.payment ||
              (invoice?.paymentStatus ?? "Belum Ditagihkan") === filters.payment) &&
            (!filters.workerId || item.primaryWorkerId === filters.workerId) &&
            (!filters.priority || item.priority === filters.priority)
          );
        })
        .sort((a, b) =>
          filters.sort === "deadline"
            ? a.deadline.localeCompare(b.deadline)
            : filters.sort === "progress"
              ? b.progress - a.progress
              : b.createdAt.localeCompare(a.createdAt),
        ),
    [assignments, filters, getCustomer, getInvoiceForAssignment, session],
  );

  const reset = () => {
    setFilters({
      q: "",
      username: "",
      category: "",
      status: "",
      access: "",
      payment: "",
      workerId: "",
      priority: "",
      sort: "terbaru",
      tab: "Semua",
    });
    setSelected([]);
  };
  const runBulk = () => {
    if (!confirm) return;
    selected.forEach((id) => {
      if (confirm.action === "Buka akses") updateAssignment(id, { accessStatus: "Dapat Diakses" });
      if (confirm.action === "Kunci hasil") updateAssignment(id, { accessStatus: "Terkunci" });
      if (confirm.action === "Ubah status" && confirm.value)
        updateAssignment(id, { workStatus: confirm.value as WorkStatus });
      if (confirm.action === "Tentukan worker" && confirm.value)
        updateAssignment(
          id,
          { primaryWorkerId: confirm.value, assignedAt: new Date().toISOString() },
          {
            actor: "",
            action: "Mengganti primary worker",
            after: getWorker(confirm.value)?.fullName ?? confirm.value,
            note: "Bulk assignment.",
          },
        );
    });
    toast.success(`${selected.length} penugasan diperbarui`);
    setSelected([]);
  };

  return (
    <AdminShell title="Semua Penugasan">
      <AdminPageHeader
        eyebrow="Operasional / Penugasan"
        title="Semua Penugasan"
        description="Cari, periksa, dan kelola seluruh pekerjaan customer."
        actions={
          canManage ? (
            <Button asChild>
              <Link to="/admin/penugasan/baru">
                <Plus /> Buat Penugasan
              </Link>
            </Button>
          ) : undefined
        }
      />
      <div className="mt-7 overflow-x-auto border-b border-border" role="tablist">
        <div className="flex min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={filters.tab === tab}
              onClick={() => setFilters((value) => ({ ...value, tab }))}
              className={`min-h-11 border-b-2 px-4 text-xs font-bold ${filters.tab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <section className="mt-5 border border-border bg-card p-4" aria-label="Filter penugasan">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <label className="relative sm:col-span-2">
            <span className="sr-only">Cari</span>
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.q}
              onChange={(event) => setFilters((value) => ({ ...value, q: event.target.value }))}
              className="h-10 pl-9"
              placeholder="ID, judul, atau username"
            />
          </label>
          <Input
            value={filters.username}
            onChange={(event) =>
              setFilters((value) => ({ ...value, username: event.target.value }))
            }
            className="h-10"
            placeholder="Username customer"
            aria-label="Username customer"
          />
          <select
            className={control}
            value={filters.category}
            onChange={(event) =>
              setFilters((value) => ({ ...value, category: event.target.value }))
            }
          >
            <option value="">Semua kategori</option>
            {CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            className={control}
            value={filters.status}
            onChange={(event) => setFilters((value) => ({ ...value, status: event.target.value }))}
          >
            <option value="">Semua status kerja</option>
            {WORK_STATUSES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            className={control}
            value={filters.access}
            onChange={(event) => setFilters((value) => ({ ...value, access: event.target.value }))}
          >
            <option value="">Semua akses</option>
            {ACCESS_STATUSES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            className={control}
            value={filters.payment}
            onChange={(event) => setFilters((value) => ({ ...value, payment: event.target.value }))}
          >
            <option value="">Semua pembayaran</option>
            {PAYMENT_STATUSES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            className={control}
            value={filters.workerId}
            onChange={(event) =>
              setFilters((value) => ({ ...value, workerId: event.target.value }))
            }
          >
            <option value="">Semua worker</option>
            {selectableWorkers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.fullName}
              </option>
            ))}
          </select>
          <select
            className={control}
            value={filters.priority}
            onChange={(event) =>
              setFilters((value) => ({ ...value, priority: event.target.value }))
            }
          >
            <option value="">Semua prioritas</option>
            {["Urgent", "Tinggi", "Normal", "Rendah"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            className={control}
            value={filters.sort}
            onChange={(event) => setFilters((value) => ({ ...value, sort: event.target.value }))}
          >
            <option value="terbaru">Terbaru</option>
            <option value="deadline">Deadline terdekat</option>
            <option value="progress">Progress tertinggi</option>
          </select>
          <Button variant="outline" onClick={reset}>
            <FilterX /> Reset
          </Button>
        </div>
      </section>
      {canManage && selected.length > 0 && (
        <div className="sticky top-20 z-20 mt-4 flex flex-wrap items-center gap-2 border border-primary bg-background p-3 shadow-sm">
          <p className="mr-auto text-xs font-bold">{selected.length} dipilih</p>
          <select
            className={control}
            defaultValue=""
            onChange={(event) =>
              event.target.value && setConfirm({ action: "Ubah status", value: event.target.value })
            }
          >
            <option value="">Ubah status…</option>
            {WORK_STATUSES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            className={control}
            defaultValue=""
            onChange={(event) =>
              event.target.value &&
              setConfirm({ action: "Tentukan worker", value: event.target.value })
            }
          >
            <option value="">Tentukan worker…</option>
            {selectableWorkers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.fullName}
              </option>
            ))}
          </select>
          <Button size="sm" variant="outline" onClick={() => setConfirm({ action: "Buka akses" })}>
            Buka akses
          </Button>
          <Button size="sm" variant="outline" onClick={() => setConfirm({ action: "Kunci hasil" })}>
            Kunci hasil
          </Button>
        </div>
      )}
      <div className="mt-5">
        {items.length === 0 ? (
          <div className="border border-dashed border-border py-16 text-center">
            <SlidersHorizontal className="mx-auto size-8 text-muted-foreground" />
            <h3 className="mt-4 font-bold">Tidak ada hasil yang cocok</h3>
            <Button variant="outline" className="mt-5" onClick={reset}>
              Reset filter
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto border border-border bg-card md:block">
              <table className="w-full min-w-[1280px] text-left text-xs">
                <thead className="border-b border-border bg-surface text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="p-3">
                      {canManage && (
                        <Checkbox
                          checked={selected.length === items.length}
                          onCheckedChange={(checked) =>
                            setSelected(checked ? items.map((item) => item.id) : [])
                          }
                          aria-label="Pilih semua"
                        />
                      )}
                    </th>
                    {[
                      "ID",
                      "Customer",
                      "Judul",
                      "Kategori",
                      "Deadline",
                      "Status",
                      "Progress",
                      "Akses",
                      "Pembayaran",
                      "Admin",
                      "Aksi",
                    ].map((head) => (
                      <th key={head} className="p-3">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const customer = getCustomer(item.customerId);
                    const invoice = getInvoiceForAssignment(item.id);
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-border last:border-0 hover:bg-surface"
                      >
                        <td className="p-3">
                          {canManage && (
                            <Checkbox
                              checked={selected.includes(item.id)}
                              onCheckedChange={(checked) =>
                                setSelected((value) =>
                                  checked
                                    ? [...value, item.id]
                                    : value.filter((id) => id !== item.id),
                                )
                              }
                            />
                          )}
                        </td>
                        <td className="p-3 font-bold text-primary">{item.id}</td>
                        <td className="p-3 font-semibold">@{customer?.username}</td>
                        <td className="max-w-52 p-3 font-semibold">{item.title}</td>
                        <td className="p-3">{item.category}</td>
                        <td className="p-3">{formatShortDate(item.deadline)}</td>
                        <td className="p-3">
                          <AdminStatusBadge status={item.workStatus} />
                        </td>
                        <td className="p-3">
                          <AdminProgress value={item.progress} />
                        </td>
                        <td className="p-3">
                          <AccessBadge access={item.accessStatus} />
                        </td>
                        <td className="p-3">
                          <PaymentBadge status={invoice?.paymentStatus ?? "Belum Ditagihkan"} />
                        </td>
                        <td className="p-3">
                          <span className="font-semibold">
                            {item.primaryWorkerId
                              ? (getWorker(item.primaryWorkerId)?.fullName ??
                                "Worker tidak ditemukan")
                              : "Belum ditentukan"}
                          </span>
                          <div className="mt-1">
                            <PriorityBadge priority={item.priority} />
                          </div>
                        </td>
                        <td className="p-3">
                          <Button size="sm" variant="outline" asChild>
                            <Link to="/admin/penugasan/$id" params={{ id: item.id }}>
                              Kelola
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
              {items.map((item) => (
                <article key={item.id} className="border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-primary">
                      {canManage && (
                        <Checkbox
                          checked={selected.includes(item.id)}
                          onCheckedChange={(checked) =>
                            setSelected((value) =>
                              checked ? [...value, item.id] : value.filter((id) => id !== item.id),
                            )
                          }
                        />
                      )}
                      {item.id}
                    </label>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <h3 className="mt-3 font-bold">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    @{getCustomer(item.customerId)?.username} · {item.category}
                  </p>
                  <div className="mt-4">
                    <AdminProgress value={item.progress} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <AdminStatusBadge status={item.workStatus} />
                    <PaymentBadge
                      status={getInvoiceForAssignment(item.id)?.paymentStatus ?? "Belum Ditagihkan"}
                    />
                    <AccessBadge access={item.accessStatus} />
                  </div>
                  <Button className="mt-4 w-full" variant="outline" asChild>
                    <Link to="/admin/penugasan/$id" params={{ id: item.id }}>
                      Kelola Penugasan
                    </Link>
                  </Button>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
      <AdminConfirmationDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={`${confirm?.action ?? "Perbarui"}?`}
        description={`Tindakan diterapkan pada ${selected.length} penugasan.`}
        details={[
          { label: "Tindakan", value: confirm?.action ?? "-" },
          { label: "Nilai baru", value: confirm?.value ?? "Sesuai tindakan" },
        ]}
        confirmLabel="Ya, terapkan"
        destructive={confirm?.action === "Kunci hasil"}
        onConfirm={runBulk}
      />
    </AdminShell>
  );
}
