import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, Search } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { AuditEntry } from "@/lib/admin-data";
import { formatDateTime } from "@/lib/portal-data";
import { useAdminStore } from "@/lib/use-admin-store";

export const Route = createFileRoute("/admin_/aktivitas")({
  head: () => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex" }],
  }),
  component: AuditLog,
});
function AuditLog() {
  const { audits } = useAdminStore();
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState("");
  const [role, setRole] = useState("");
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [active, setActive] = useState<AuditEntry | null>(null);
  const actors = [...new Set(audits.map((item) => item.actor))];
  const roles = [...new Set(audits.map((item) => item.actorRole).filter(Boolean))];
  const entities = [...new Set(audits.map((item) => item.entityType))];
  const actions = [...new Set(audits.map((item) => item.action))];
  const items = audits.filter(
    (item) =>
      `${item.entityId} ${item.action} ${item.note ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!actor || item.actor === actor) &&
      (!role || item.actorRole === role) &&
      (!entity || item.entityType === entity) &&
      (!action || item.action === action) &&
      (!startDate || new Date(item.timestamp) >= new Date(`${startDate}T00:00:00`)) &&
      (!endDate || new Date(item.timestamp) <= new Date(`${endDate}T23:59:59`)),
  );
  return (
    <AdminShell title="Aktivitas">
      <AdminPageHeader
        eyebrow="Audit / Global"
        title="Aktivitas"
        description="Jejak perubahan operasional tanpa menyimpan kredensial, token, atau URL privat."
      />
      <section className="mt-7 grid gap-3 border border-border bg-card p-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="relative">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ID atau deskripsi"
          />
        </label>
        {[
          [actor, setActor, "Semua actor", actors],
          [role, setRole, "Semua role", roles],
          [entity, setEntity, "Semua entity", entities],
        ].map(([value, setter, label, options]) => (
          <select
            key={label as string}
            className="h-10 border border-input bg-background px-3 text-xs"
            value={value as string}
            onChange={(e) => (setter as (value: string) => void)(e.target.value)}
          >
            <option value="">{label as string}</option>
            {(options as string[]).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        ))}
        <select
          className="h-10 border border-input bg-background px-3 text-xs"
          value={action}
          onChange={(event) => setAction(event.target.value)}
        >
          <option value="">Semua jenis aksi</option>
          {actions.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Dari tanggal
          <Input
            className="mt-1"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </label>
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Sampai tanggal
          <Input
            className="mt-1"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </label>
      </section>
      {items.length ? (
        <div className="mt-5 overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead>
              <tr>
                {["Waktu", "Actor", "Role", "Aksi", "Entity", "ID", "Ringkasan", "Detail"].map(
                  (h) => (
                    <th className="p-3" key={h}>
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr className="border-t border-border" key={item.id}>
                  <td className="p-3">{formatDateTime(item.timestamp)}</td>
                  <td className="p-3 font-bold">{item.actor}</td>
                  <td className="p-3">{item.actorRole ?? "—"}</td>
                  <td className="p-3">{item.action}</td>
                  <td className="p-3">{item.entityType}</td>
                  <td className="p-3 font-bold text-primary">{item.entityId}</td>
                  <td className="max-w-64 p-3">
                    {item.note ?? `${item.before ?? "—"} → ${item.after ?? "—"}`}
                  </td>
                  <td className="p-3">
                    <Button size="sm" variant="outline" onClick={() => setActive(item)}>
                      Lihat
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-5 border border-dashed border-border py-16 text-center">
          <Activity className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold">Belum ada aktivitas yang cocok.</p>
        </div>
      )}
      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail aktivitas</DialogTitle>
          </DialogHeader>
          {active && (
            <dl className="space-y-3 text-sm">
              {[
                ["Actor", `${active.actor} · ${active.actorRole ?? "—"}`],
                ["Aksi", active.action],
                ["Entity", `${active.entityType} · ${active.entityId}`],
                ["Before", active.before ?? "—"],
                ["After", active.after ?? "—"],
                ["Catatan", active.note ?? "—"],
                ["IP / Device", "Tersedia setelah integrasi backend"],
              ].map(([label, value]) => (
                <div className="border-t border-border pt-3" key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
