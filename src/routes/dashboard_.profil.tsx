import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { CheckCircle2, LogOut, Save, UserRound } from "lucide-react";
import { toast } from "sonner";
import { PortalShell } from "@/components/portal/portal-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminStore } from "@/lib/use-admin-store";
import { formatShortDate } from "@/lib/portal-data";
import { maskWhatsapp, validateUsername } from "@/lib/secure-generators";
import { formatDateTime } from "@/lib/portal-data";
import { getCustomerStats } from "@/lib/admin-selectors";

export const Route = createFileRoute("/dashboard_/profil")({
  head: () => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [saving, setSaving] = useState(false);
  const { assignments, changeUsername, feedback, getCurrentCustomer, invoices, logout } =
    useAdminStore();
  const customer = getCurrentCustomer();
  const [nextUsername, setNextUsername] = useState(customer?.username ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const ownAssignments = assignments.filter((item) => item.customerId === customer?.id);
  const stats = customer
    ? getCustomerStats(
        customer,
        assignments,
        invoices,
        feedback.filter((item) => item.customerId === customer.id).length,
      )
    : null;
  const usernameError = nextUsername === customer?.username ? "" : validateUsername(nextUsername);

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    void changeUsername(customer?.id ?? "", nextUsername, currentPassword).then((result) => {
      setSaving(false);
      if (result === "success") {
        setCurrentPassword("");
        toast.success("Username berhasil diperbarui");
        return;
      }
      const messages = {
        invalid_password: "Password saat ini tidak sesuai.",
        duplicate: "Username sudah digunakan.",
        reserved: "Username tersebut dicadangkan.",
        cooldown: "Username hanya dapat diubah sekali setiap 30 hari.",
        invalid: validateUsername(nextUsername) || "Username tidak valid.",
      };
      toast.error(messages[result]);
    });
  };

  return (
    <PortalShell title="Profil">
      <header className="border-b border-border pb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">04 / Akun</p>
        <h2 className="mt-3 font-display text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
          Profil<span className="text-primary">.</span>
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Lihat ringkasan akun dan perbarui username secara aman.
        </p>
      </header>

      {customer && (
        <section className="mt-8 grid gap-px border border-border bg-border lg:grid-cols-[.7fr_1.3fr]">
          <div className="bg-card p-6">
            <div className="flex size-16 items-center justify-center bg-ink font-display text-xl font-bold text-white">
              {customer.username.slice(0, 2).toUpperCase()}
            </div>
            <h3 className="mt-5 font-display text-3xl font-semibold">@{customer.username}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{customer.id} · Customer</p>
            <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-bold uppercase">
              <span className="border border-border px-2 py-1">{customer.accountStatus}</span>
              <span className="border border-border px-2 py-1">{customer.activationStatus}</span>
            </div>
          </div>
          <dl className="grid bg-card sm:grid-cols-2">
            {[
              ["WhatsApp", maskWhatsapp(customer.whatsapp)],
              ["Akun dibuat", formatDateTime(customer.createdAt)],
              ["Diaktifkan", customer.activatedAt ? formatDateTime(customer.activatedAt) : "Belum"],
              [
                "Login terakhir",
                customer.lastLoginAt ? formatDateTime(customer.lastLoginAt) : "Belum pernah",
              ],
              [
                "Aktif terakhir",
                customer.lastActiveAt ? formatDateTime(customer.lastActiveAt) : "Belum pernah",
              ],
              ["Lama akun aktif", `${stats?.activeDays ?? 0} hari`],
            ].map(([label, value]) => (
              <div key={label} className="border-b border-border p-5 sm:border-r">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-2 text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {stats && (
        <section className="mt-8">
          <h3 className="font-display text-2xl font-semibold">Statistik customer</h3>
          <div className="mt-4 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
            {[
              ["Total", stats.total],
              ["Aktif", stats.active],
              ["Menunggu review", stats.review],
              ["Selesai", stats.completed],
              ["Terlambat", stats.late],
              ["Bayar pending", stats.paymentPending],
              ["Tagihan lunas", stats.paid],
              ["Hasil dapat diakses", stats.accessible],
              ["Feedback", stats.feedback],
              ["Hari aktif", stats.activeDays],
            ].map(([label, value]) => (
              <div key={label} className="bg-card p-4">
                <p className="font-display text-3xl font-semibold">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
          {ownAssignments.length === 0 && (
            <div className="mt-4 border border-dashed border-border p-8 text-center">
              <UserRound className="mx-auto size-7 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">Belum ada penugasan yang terhubung.</p>
            </div>
          )}
        </section>
      )}

      <form onSubmit={save} className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <h3 className="font-display text-2xl font-semibold">Informasi akun</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-bold">Username saat ini</span>
              <Input className="h-11 bg-surface" value={customer?.username ?? ""} readOnly />
              <span className="block pt-2 text-xs font-bold">Username baru</span>
              <Input
                id="profile-username"
                className="h-11 bg-card"
                value={nextUsername}
                onChange={(event) =>
                  setNextUsername(event.target.value.toLowerCase().replace(/\s/g, ""))
                }
              />
              <span
                className={`block text-[11px] ${usernameError ? "text-destructive" : "text-success"}`}
              >
                {usernameError ||
                  (nextUsername === customer?.username
                    ? "Masukkan username baru."
                    : "Format username tersedia untuk diperiksa.")}
              </span>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold">Nomor WhatsApp</span>
              <Input
                className="h-11 bg-card"
                value={customer ? maskWhatsapp(customer.whatsapp) : "—"}
                readOnly
              />
            </label>
          </div>

          <div className="mt-10 border-t border-border pt-8">
            <h3 className="font-display text-2xl font-semibold">Konfirmasi perubahan</h3>
            <label className="mt-5 block max-w-md space-y-2">
              <span className="text-xs font-bold">Password saat ini</span>
              <Input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </label>
            <p className="mt-3 text-xs text-muted-foreground">
              4–24 karakter; huruf kecil, angka, titik, underscore, atau tanda hubung. Perubahan
              dibatasi 30 hari sekali.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Perubahan terakhir:{" "}
              {customer?.usernameChangedAt
                ? formatDateTime(customer.usernameChangedAt)
                : "Belum pernah"}
              .
            </p>
          </div>
        </div>

        <aside>
          <h3 className="font-display text-2xl font-semibold">Ringkasan akun</h3>
          <dl className="mt-5 border-t border-border text-sm">
            {[
              ["Total penugasan", ownAssignments.length],
              ["Selesai", ownAssignments.filter((item) => item.workStatus === "Selesai").length],
              ["Tagihan lunas", stats?.paid ?? 0],
              ["Feedback", stats?.feedback ?? 0],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-border py-3">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-bold">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="size-4 text-primary" /> Aktif sejak{" "}
            {customer?.activatedAt ? formatShortDate(customer.activatedAt) : "—"}
          </p>
          <Button type="submit" className="mt-6 w-full" disabled={saving}>
            <Save />
            {saving ? "Menyimpan…" : "Simpan perubahan"}
          </Button>
          <Button asChild type="button" variant="outline" className="mt-3 w-full" onClick={logout}>
            <Link to="/login">
              <LogOut /> Keluar
            </Link>
          </Button>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Demo frontend: perubahan tidak dikirim ke server dan tidak disimpan permanen.
          </p>
        </aside>
      </form>
    </PortalShell>
  );
}
