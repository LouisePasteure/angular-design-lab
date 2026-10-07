import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Archive,
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AdminConfirmationDialog } from "@/components/admin/admin-confirmation-dialog";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  AccessBadge,
  AdminProgress,
  AdminStatusBadge,
  PaymentBadge,
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import {
  generateActivationToken,
  generatePassword,
  hashSecret,
  maskWhatsapp,
} from "@/lib/secure-generators";
import { useAdminStore } from "@/lib/use-admin-store";
import { formatDateTime } from "@/lib/portal-data";

export const Route = createFileRoute("/admin_/customer/$id")({
  head: ({ params }) => ({ meta: [{ title: "jokitugass" }] }),
  component: CustomerDetail,
});

function CustomerDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const {
    assignments,
    audits,
    customers,
    deleteCustomer,
    feedback,
    getInvoiceForAssignment,
    invoices,
    setCustomerCredentials,
    updateCustomer,
  } = useAdminStore();
  const customer = customers.find((item) => item.id === id);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [activationToken, setActivationToken] = useState("");
  const [confirm, setConfirm] = useState<"reset" | "status" | null>(null);
  if (!customer)
    return (
      <AdminShell title="Customer tidak ditemukan">
        <div className="border border-border bg-card p-10 text-center">
          <h2 className="font-display text-3xl font-semibold">Customer tidak ditemukan.</h2>
          <Button className="mt-5" asChild>
            <Link to="/admin/customer">Kembali</Link>
          </Button>
        </div>
      </AdminShell>
    );
  const customerAssignments = assignments.filter((item) => item.customerId === customer.id);
  const resetPassword = async () => {
    const next = generatePassword();
    setPassword(next);
    setShow(true);
    updateCustomer(
      customer.id,
      {
        credentialStatus: "Password Sementara",
        forcePasswordChange: true,
        passwordDigest: await hashSecret(next),
      },
      "Mereset password customer",
    );
    toast.success("Password sementara baru dibuat");
  };
  const regenerateActivation = async () => {
    const nextPassword = generatePassword();
    const token = generateActivationToken();
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    await Promise.all([hashSecret(nextPassword), hashSecret(token)]).then(
      ([passwordDigest, tokenDigest]) =>
        setCustomerCredentials(customer.id, passwordDigest, tokenDigest, expires.toISOString()),
    );
    setPassword(nextPassword);
    setActivationToken(token);
    setShow(true);
    toast.success("Kredensial aktivasi baru dibuat");
  };
  const wa = customer.whatsapp.replace(/\D/g, "");
  return (
    <AdminShell title="Detail Customer">
      <nav className="text-xs text-muted-foreground">
        <Link to="/admin/customer">
          <ArrowLeft className="mr-1 inline size-3" /> Customer
        </Link>{" "}
        / {customer.id}
      </nav>
      <header className="mt-5 grid gap-5 border-b border-border pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">{customer.id}</p>
          <h2 className="mt-2 font-display text-[clamp(2.6rem,5vw,5rem)] font-semibold leading-none tracking-[-.05em]">
            @{customer.username}
            <span className="text-primary">.</span>
          </h2>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="border border-border px-2 py-1">Akun {customer.accountStatus}</span>
            <span className="border border-border px-2 py-1">{customer.credentialStatus}</span>
            {customer.forcePasswordChange && (
              <span className="border border-status-warning/40 px-2 py-1 text-status-warning">
                Wajib ganti password
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
              <MessageSquare /> WhatsApp
            </a>
          </Button>
          <Button onClick={() => setConfirm("reset")}>
            <KeyRound /> Reset Password
          </Button>
          {customer.activationStatus !== "Sudah digunakan" && (
            <Button variant="outline" onClick={() => void regenerateActivation()}>
              <KeyRound /> Token aktivasi baru
            </Button>
          )}
        </div>
      </header>
      <div className="mt-7 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <section className="border border-border bg-card p-5">
          <h3 className="font-display text-2xl font-semibold">Informasi akun</h3>
          <dl className="mt-5 space-y-4 text-sm">
            {[
              ["Username", `@${customer.username}`],
              ["WhatsApp", customer.whatsapp],
              ["WhatsApp tersamarkan", maskWhatsapp(customer.whatsapp)],
              ["Dibuat", formatDateTime(customer.createdAt)],
              ["Dibuat oleh", customer.createdBy],
              ["Aktivasi", customer.activationStatus],
              [
                "Login terakhir",
                customer.lastLoginAt ? formatDateTime(customer.lastLoginAt) : "Belum pernah",
              ],
              [
                "Aktif terakhir",
                customer.lastActiveAt ? formatDateTime(customer.lastActiveAt) : "Belum pernah",
              ],
              ["Route terakhir", customer.lastSeenRoute ?? "—"],
              ["Jumlah login", String(customer.loginCount)],
              ["Catatan internal", customer.internalNote || "—"],
            ].map(([label, value]) => (
              <div key={label} className="border-t border-border pt-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <Button className="mt-5 w-full" variant="outline" onClick={() => setConfirm("status")}>
            {customer.accountStatus === "Aktif" ? "Nonaktifkan akun" : "Aktifkan akun"}
          </Button>
          <Button
            className="mt-2 w-full"
            variant="outline"
            onClick={() =>
              updateCustomer(
                customer.id,
                { archivedAt: customer.archivedAt ? undefined : new Date().toISOString() } as never,
                customer.archivedAt ? "Memulihkan arsip customer" : "Mengarsipkan customer",
              )
            }
          >
            <Archive /> {customer.archivedAt ? "Pulihkan dari arsip" : "Arsipkan customer"}
          </Button>
          <Button
            className="mt-2 w-full text-destructive"
            variant="outline"
            onClick={() => {
              const typed = window.prompt(
                `Ketik ${customer.username} untuk menghapus permanen akun ini.`,
              );
              if (typed === customer.username) {
                deleteCustomer(customer.id);
                void navigate({ to: "/admin/customer" });
              }
            }}
          >
            <Trash2 /> Hapus permanen
          </Button>
        </section>
        <section className="border border-border bg-card">
          <header className="border-b border-border p-5">
            <h3 className="font-display text-2xl font-semibold">Penugasan customer</h3>
          </header>
          <div className="divide-y divide-border">
            {customerAssignments.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">Belum ada penugasan.</p>
            ) : (
              customerAssignments.map((item) => (
                <article key={item.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        to="/admin/penugasan/$id"
                        params={{ id: item.id }}
                        className="text-xs font-bold text-primary"
                      >
                        {item.id}
                      </Link>
                      <h4 className="mt-2 font-bold">{item.title}</h4>
                    </div>
                    <AccessBadge access={item.accessStatus} />
                  </div>
                  <div className="mt-4">
                    <AdminProgress value={item.progress} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <AdminStatusBadge status={item.workStatus} />
                    <PaymentBadge
                      status={getInvoiceForAssignment(item.id)?.paymentStatus ?? "Belum Ditagihkan"}
                    />
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
      {password && (
        <section className="mt-6 border border-primary bg-primary/5 p-5">
          <p className="text-xs font-bold text-primary">Password sementara — tampil satu kali</p>
          <div className="mt-3 flex max-w-xl gap-2">
            <code className="min-w-0 flex-1 border border-border bg-background px-3 py-2 text-xs">
              {show ? password : "••••••••••••••"}
            </code>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setShow((value) => !value)}
              aria-label="Tampilkan password"
            >
              {show ? <EyeOff /> : <Eye />}
            </Button>
            <Button
              size="icon"
              onClick={() => {
                void navigator.clipboard.writeText(password);
                toast.success("Password disalin");
              }}
              aria-label="Salin password"
            >
              <Copy />
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Password tidak disimpan dan hilang saat halaman dimuat ulang.
          </p>
          {activationToken && (
            <div className="mt-4 border-t border-primary/20 pt-4">
              <p className="text-xs font-bold text-primary">Token aktivasi — tampil satu kali</p>
              <code className="mt-2 block border border-border bg-background px-3 py-2 text-xs">
                {show ? activationToken : "••••-••••-••••"}
              </code>
            </div>
          )}
        </section>
      )}
      <section className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-3">
        <div className="bg-card p-5">
          <p className="text-xs text-muted-foreground">Total tagihan</p>
          <p className="mt-2 font-display text-3xl font-semibold">
            {invoices.filter((item) => item.customerId === customer.id).length}
          </p>
        </div>
        <div className="bg-card p-5">
          <p className="text-xs text-muted-foreground">Feedback</p>
          <p className="mt-2 font-display text-3xl font-semibold">
            {feedback.filter((item) => item.customerId === customer.id).length}
          </p>
        </div>
        <div className="bg-card p-5">
          <p className="text-xs text-muted-foreground">Aktivitas audit</p>
          <p className="mt-2 font-display text-3xl font-semibold">
            {audits.filter((item) => item.entityId === customer.id).length}
          </p>
        </div>
      </section>
      <AdminConfirmationDialog
        open={confirm === "reset"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Reset password customer?"
        description="Password lama akan dianggap tidak berlaku pada simulasi ini. Password baru hanya tampil satu kali."
        confirmLabel="Reset password"
        onConfirm={() => void resetPassword()}
      />
      <AdminConfirmationDialog
        open={confirm === "status"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={customer.accountStatus === "Aktif" ? "Nonaktifkan akun?" : "Aktifkan akun?"}
        description={
          customer.accountStatus === "Aktif"
            ? "Customer tidak dapat menggunakan akun sampai diaktifkan kembali."
            : "Customer kembali dapat menggunakan akun."
        }
        confirmLabel="Konfirmasi"
        destructive={customer.accountStatus === "Aktif"}
        onConfirm={() =>
          updateCustomer(
            customer.id,
            { accountStatus: customer.accountStatus === "Aktif" ? "Nonaktif" : "Aktif" },
            "Mengubah status akun customer",
          )
        }
      />
    </AdminShell>
  );
}
