import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2, KeyRound } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminStore } from "@/lib/use-admin-store";

export const Route = createFileRoute("/aktivasi")({
  head: () => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: ActivationPage,
});

function ActivationPage() {
  const navigate = useNavigate();
  const { activateCustomer, session } = useAdminStore();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await activateCustomer(token, password, confirmation);
    if (result === "success") return void navigate({ to: "/dashboard" });
    const labels = {
      invalid: "Token atau format password tidak valid.",
      expired: "Token aktivasi telah kedaluwarsa.",
      revoked: "Token aktivasi telah dicabut.",
      used: "Token aktivasi sudah pernah digunakan.",
      password_mismatch: "Konfirmasi password tidak sama.",
    } as const;
    setMessage(labels[result]);
  };
  if (session?.role !== "customer" || !session.pendingActivation) {
    return (
      <AuthShell>
        <h1 className="font-display text-4xl font-semibold">Sesi aktivasi tidak tersedia.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Masuk menggunakan password sementara terlebih dahulu.
        </p>
        <Button className="mt-6" onClick={() => void navigate({ to: "/login" })}>
          Kembali ke login
        </Button>
      </AuthShell>
    );
  }
  return (
    <AuthShell>
      <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
        Aktivasi satu kali
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-.04em]">
        Aktifkan akunmu.
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Masukkan token dari admin, lalu buat password pribadi. Token tidak dapat dipakai kembali.
      </p>
      <form className="mt-8 space-y-4" onSubmit={(event) => void submit(event)}>
        <label className="block space-y-2 text-xs font-bold">
          Token aktivasi
          <Input
            required
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="ACT-XXXX-XXXX-XXXX"
          />
        </label>
        <label className="block space-y-2 text-xs font-bold">
          Password baru
          <Input
            required
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label className="block space-y-2 text-xs font-bold">
          Konfirmasi password
          <Input
            required
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </label>
        <div className="border border-border p-3 text-xs text-muted-foreground">
          <CheckCircle2 className="mr-2 inline size-4 text-primary" />
          Minimal 10 karakter, huruf besar, huruf kecil, dan angka.
        </div>
        {message && (
          <p
            role="alert"
            className="border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive"
          >
            {message}
          </p>
        )}
        <Button className="w-full">
          <KeyRound /> Aktifkan Akun
        </Button>
      </form>
    </AuthShell>
  );
}
