import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, LogOut } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWorkerStats } from "@/lib/admin-selectors";
import { formatRupiah, hashSecret, maskWhatsapp } from "@/lib/secure-generators";
import { formatDateTime } from "@/lib/portal-data";
import { useAdminStore } from "@/lib/use-admin-store";

export const Route = createFileRoute("/admin_/profil")({
  head: () => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex" }],
  }),
  component: StaffProfile,
});
function StaffProfile() {
  const { assignments, getCurrentWorker, invoices, logout, session, updateWorker } =
    useAdminStore();
  const worker = getCurrentWorker();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  if (!worker)
    return (
      <AdminShell title="Profil">
        <p>Profil staff tidak ditemukan.</p>
      </AdminShell>
    );
  const stats = getWorkerStats(worker, assignments, invoices);
  const canSeeRevenue = session?.role === "admin" && session.permissions.includes("report:view");
  const savePassword = async () => {
    if (password.length < 10 || password !== confirmation) {
      toast.error("Password minimal 10 karakter dan konfirmasi harus sama.");
      return;
    }
    updateWorker(
      worker.id,
      { passwordDigest: await hashSecret(password), credentialStatus: "Aktif" },
      "Mengubah password sendiri",
    );
    setPassword("");
    setConfirmation("");
    toast.success("Password diperbarui untuk sesi mock");
  };
  return (
    <AdminShell title="Profil Staff">
      <AdminPageHeader
        eyebrow="Akun internal"
        title={worker.fullName}
        description={`@${worker.username} · ${worker.role}`}
      />
      <section className="mt-7 grid gap-px border border-border bg-border lg:grid-cols-[.7fr_1.3fr]">
        <div className="bg-card p-6">
          <div className="flex size-16 items-center justify-center bg-ink font-display text-xl font-bold text-white">
            {worker.fullName
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)}
          </div>
          <p className="mt-5 font-bold">{worker.status}</p>
          <p className="mt-1 text-sm text-muted-foreground">{maskWhatsapp(worker.whatsapp)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {worker.specialties.join(", ") || "Tanpa specialty"}
          </p>
        </div>
        <dl className="grid bg-card sm:grid-cols-2">
          {[
            ["Bergabung", formatDateTime(worker.createdAt)],
            ["Login terakhir", worker.lastLoginAt ? formatDateTime(worker.lastLoginAt) : "—"],
            ["Aktif terakhir", worker.lastActiveAt ? formatDateTime(worker.lastActiveAt) : "—"],
            ["Kapasitas", `${stats.active}/${worker.maxActiveAssignments}`],
            ["Penugasan selesai", stats.completed],
            ["Tepat waktu", `${stats.onTimeRate}%`],
            ...(canSeeRevenue ? [["Pendapatan dihasilkan", formatRupiah(stats.revenue)]] : []),
          ].map(([label, value]) => (
            <div className="border-b border-border p-5" key={label}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-1 font-bold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="mt-6 max-w-2xl border border-border bg-card p-5">
        <h3 className="font-display text-2xl font-semibold">Ubah password</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password baru"
          />
          <Input
            type="password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="Konfirmasi"
          />
        </div>
        <Button className="mt-4" onClick={() => void savePassword()}>
          <KeyRound /> Simpan password
        </Button>
      </section>
      <Button className="mt-6" variant="outline" asChild onClick={logout}>
        <Link to="/admin/login">
          <LogOut /> Keluar
        </Link>
      </Button>
    </AdminShell>
  );
}
