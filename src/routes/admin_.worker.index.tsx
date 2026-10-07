import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES, type WorkerRole, type WorkerStatus } from "@/lib/admin-data";
import { getWorkerStats, ROLE_LABELS } from "@/lib/admin-selectors";
import { useAdminStore } from "@/lib/use-admin-store";
import { formatShortDate } from "@/lib/portal-data";

export const Route = createFileRoute("/admin_/worker/")({
  head: () => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex" }],
  }),
  component: WorkerList,
});
const control = "h-10 border border-input bg-background px-3 text-xs";
function capacityLabel(value: number) {
  return value > 1 ? "Overload" : value === 1 ? "Penuh" : value >= 0.75 ? "Hampir penuh" : "Normal";
}

function WorkerList() {
  const { assignments, invoices, workers } = useAdminStore();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [sort, setSort] = useState("beban");
  const items = useMemo(
    () =>
      workers
        .filter(
          (worker) =>
            !worker.deletedAt &&
            `${worker.fullName} ${worker.username}`.toLowerCase().includes(query.toLowerCase()) &&
            (!role || worker.role === role) &&
            (!status || worker.status === status) &&
            (!specialty || worker.specialties.includes(specialty as never)),
        )
        .map((worker) => ({ worker, stats: getWorkerStats(worker, assignments, invoices) }))
        .sort((a, b) =>
          sort === "selesai"
            ? b.stats.completed - a.stats.completed
            : sort === "pemasukan"
              ? b.stats.revenue - a.stats.revenue
              : b.stats.capacity - a.stats.capacity,
        ),
    [assignments, invoices, query, role, sort, specialty, status, workers],
  );
  return (
    <AdminShell title="Worker">
      <AdminPageHeader
        eyebrow="Tim / Worker"
        title="Worker"
        description="Kelola staf internal, specialty, kapasitas, dan penugasan."
        actions={
          <Button asChild>
            <Link to="/admin/worker/baru">
              <Plus /> Tambah Worker
            </Link>
          </Button>
        }
      />
      <section
        className="mt-7 grid gap-3 border border-border bg-card p-4 sm:grid-cols-2 xl:grid-cols-5"
        aria-label="Filter worker"
      >
        <label className="relative sm:col-span-2 xl:col-span-1">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nama atau username"
          />
        </label>
        <select className={control} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Semua role</option>
          {ROLE_LABELS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select className={control} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua status</option>
          {(["Aktif", "Nonaktif", "Ditangguhkan", "Diarsipkan"] as WorkerStatus[]).map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          className={control}
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        >
          <option value="">Semua specialty</option>
          {CATEGORIES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select className={control} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="beban">Beban tertinggi</option>
          <option value="selesai">Penyelesaian</option>
          <option value="pemasukan">Pemasukan</option>
        </select>
      </section>
      {items.length === 0 ? (
        <div className="mt-5 border border-dashed border-border py-16 text-center">
          <Users className="mx-auto size-8 text-muted-foreground" />
          <h3 className="mt-3 font-bold">Worker tidak ditemukan</h3>
        </div>
      ) : (
        <>
          <div className="mt-5 hidden overflow-x-auto border border-border bg-card md:block">
            <table className="w-full min-w-[1050px] text-left text-xs">
              <thead className="border-b border-border bg-surface text-[10px] uppercase tracking-wider">
                <tr>
                  {[
                    "Nama",
                    "Role",
                    "Status",
                    "Specialty",
                    "Aktif",
                    "Kapasitas",
                    "Selesai",
                    "Tepat waktu",
                    "Terakhir aktif",
                    "Aksi",
                  ].map((h) => (
                    <th className="p-3" key={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(({ worker, stats }) => (
                  <tr className="border-b border-border" key={worker.id}>
                    <td className="p-3">
                      <strong>{worker.fullName}</strong>
                      <span className="block text-muted-foreground">@{worker.username}</span>
                    </td>
                    <td className="p-3">{worker.role}</td>
                    <td className="p-3">{worker.status}</td>
                    <td className="max-w-48 p-3">{worker.specialties.join(", ") || "—"}</td>
                    <td className="p-3">{stats.active}</td>
                    <td className="p-3">
                      <strong>
                        {stats.active}/{worker.maxActiveAssignments}
                      </strong>
                      <span className="block text-muted-foreground">
                        {capacityLabel(stats.capacity)}
                      </span>
                    </td>
                    <td className="p-3">{stats.completed}</td>
                    <td className="p-3">{stats.onTimeRate}%</td>
                    <td className="p-3">
                      {worker.lastActiveAt ? formatShortDate(worker.lastActiveAt) : "—"}
                    </td>
                    <td className="p-3">
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/admin/worker/$id" params={{ id: worker.id }}>
                          Buka
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 space-y-3 md:hidden">
            {items.map(({ worker, stats }) => (
              <article className="border border-border bg-card p-4" key={worker.id}>
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-bold">{worker.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      @{worker.username} · {worker.role}
                    </p>
                  </div>
                  <span className="text-xs font-bold">
                    {stats.active}/{worker.maxActiveAssignments}
                  </span>
                </div>
                <p className="mt-3 text-xs">{worker.specialties.join(", ") || "Tanpa specialty"}</p>
                <Button className="mt-4 w-full" variant="outline" asChild>
                  <Link to="/admin/worker/$id" params={{ id: worker.id }}>
                    Buka Worker
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        </>
      )}
    </AdminShell>
  );
}
