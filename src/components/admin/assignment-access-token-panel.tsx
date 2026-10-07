import { useRef, useState } from "react";
import { Copy, KeyRound, Link2, RotateCcw, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { AdminConfirmationDialog } from "@/components/admin/admin-confirmation-dialog";
import { Button } from "@/components/ui/button";
import type { AdminAssignment } from "@/lib/admin-data";
import { formatDateTime } from "@/lib/portal-data";
import { maskWhatsapp } from "@/lib/secure-generators";
import { useAdminStore } from "@/lib/use-admin-store";
import { BRAND } from "@/config/brand";

export function AssignmentAccessTokenPanel({ assignment }: { assignment: AdminAssignment }) {
  const { generateAssignmentAccessToken, getCustomer, revokeAssignmentAccessToken } =
    useAdminStore();
  const customer = getCustomer(assignment.customerId);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [confirm, setConfirm] = useState<"generate" | "rotate" | "revoke" | null>(null);
  const active =
    assignment.assignmentAccessTokenStatus === "Aktif" &&
    Boolean(assignment.assignmentAccessTokenDigest) &&
    Boolean(
      assignment.assignmentAccessTokenExpiresAt &&
      new Date(assignment.assignmentAccessTokenExpiresAt) > new Date(),
    );
  const message = `Halo, penugasan ${BRAND.name} Anda sudah dibuat.\n\nNomor penugasan: ${assignment.id}\nToken akses: ${token}\n\nCek progres tanpa login melalui:\nhttps://domain.com/cek-penugasan\n\nMasukkan nomor WhatsApp yang terdaftar dan token tersebut. Jangan membagikan token kepada orang lain.`;
  const apply = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      if (confirm === "revoke") {
        revokeAssignmentAccessToken(assignment.id);
        setToken("");
        toast.success("Token akses dicabut");
        return;
      }
      const result = await generateAssignmentAccessToken(assignment.id);
      if (!result) {
        toast.error("Penugasan tidak ditemukan");
        return;
      }
      setToken(result.token);
      toast.success(confirm === "rotate" ? "Token berhasil dirotasi" : "Token berhasil dibuat", {
        description:
          "Simpan atau kirim token ini sekarang. Token mentah tidak dapat dilihat kembali.",
      });
    } catch {
      toast.error("Token gagal dibuat. Coba lagi.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  const wa = customer?.whatsapp.replace(/\D/g, "");
  return (
    <section className="mt-7 border border-border bg-card" data-admin-reveal>
      <header className="flex items-center gap-3 border-b border-border p-5">
        <KeyRound className="size-5 text-primary" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.15em] text-primary">
            Akses terbatas
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold">Akses Client Tanpa Login</h3>
        </div>
      </header>
      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`border px-2 py-1 text-xs font-bold ${active ? "border-success/40 bg-success/5 text-success" : "border-border bg-surface text-muted-foreground"}`}
            >
              {active
                ? "TOKEN AKTIF"
                : assignment.assignmentAccessTokenStatus === "Dicabut" &&
                    assignment.assignmentAccessTokenCreatedAt
                  ? "TOKEN DICABUT"
                  : "BELUM AKTIF"}
            </span>
            <span className="text-xs text-muted-foreground">
              WhatsApp {customer ? maskWhatsapp(customer.whatsapp) : "—"}
            </span>
          </div>
          <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Dibuat</dt>
              <dd className="mt-1 font-semibold">
                {assignment.assignmentAccessTokenCreatedAt
                  ? formatDateTime(assignment.assignmentAccessTokenCreatedAt)
                  : "Belum dibuat"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Kedaluwarsa</dt>
              <dd className="mt-1 font-semibold">
                {assignment.assignmentAccessTokenExpiresAt
                  ? formatDateTime(assignment.assignmentAccessTokenExpiresAt)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Terakhir digunakan</dt>
              <dd className="mt-1 font-semibold">
                {assignment.assignmentAccessTokenLastUsedAt
                  ? formatDateTime(assignment.assignmentAccessTokenLastUsedAt)
                  : "Belum pernah"}
              </dd>
            </div>
          </dl>
          {token && (
            <div className="mt-5 border border-primary bg-primary/5 p-4" role="status">
              <p className="text-xs font-bold text-primary">
                Token baru — hanya ditampilkan sekali
              </p>
              <code className="mt-2 block break-all font-mono text-lg font-bold tracking-wider">
                {token}
              </code>
              <p className="mt-2 text-xs text-muted-foreground">
                Salin atau kirim token ini sekarang. Nilai mentah tidak disimpan di browser.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard.writeText(token);
                    toast.success("Token disalin");
                  }}
                >
                  <Copy /> Salin token
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard.writeText(message);
                    toast.success("Pesan WhatsApp disalin");
                  }}
                >
                  <Copy /> Salin pesan WhatsApp
                </Button>
                {wa && (
                  <Button size="sm" asChild>
                    <a
                      href={`https://wa.me/${wa}?text=${encodeURIComponent(message)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Link2 /> Kirim WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:w-56 lg:grid-cols-1">
          <Button disabled={busy} onClick={() => setConfirm(active ? "rotate" : "generate")}>
            <KeyRound /> {active ? "Rotate Token" : "Generate Token"}
          </Button>
          <Button variant="outline" disabled={!active || busy} onClick={() => setConfirm("rotate")}>
            <RotateCcw /> Regenerate
          </Button>
          <Button variant="outline" disabled={!active || busy} onClick={() => setConfirm("revoke")}>
            <ShieldOff /> Cabut Token
          </Button>
        </div>
      </div>
      <AdminConfirmationDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={
          confirm === "revoke"
            ? "Cabut token akses?"
            : confirm === "rotate"
              ? "Rotate token akses?"
              : "Buat token akses?"
        }
        description={
          confirm === "revoke"
            ? "Token saat ini langsung tidak berlaku. Sesi guest yang sudah terbuka berakhir dalam waktu maksimal 30 menit."
            : confirm === "rotate"
              ? "Token lama langsung tidak berlaku. Salinan lama tidak akan dapat membuka assignment."
              : "Token baru berlaku 30 hari dan hanya ditampilkan satu kali."
        }
        details={[
          { label: "Penugasan", value: assignment.id },
          { label: "Customer", value: customer?.username ?? assignment.customerId },
          { label: "Status saat ini", value: assignment.assignmentAccessTokenStatus },
        ]}
        confirmLabel={
          confirm === "revoke"
            ? "Ya, cabut token"
            : confirm === "rotate"
              ? "Ya, rotate token"
              : "Generate token"
        }
        destructive={confirm === "revoke"}
        onConfirm={() => void apply()}
      />
    </section>
  );
}
