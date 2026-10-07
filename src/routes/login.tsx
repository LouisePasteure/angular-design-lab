import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, MessageCircle } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/config/brand";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAdminStore } from "@/lib/use-admin-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "jokitugass" },
      {
        name: "description",
        content: `Masuk menggunakan kredensial yang diberikan admin ${BRAND.name}.`,
      },
    ],
  }),
  component: LoginPage,
});
function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { loginCustomer } = useAdminStore();
  useEffect(() => {
    // Preserve the existing key so remembered accounts survive the brand change.
    const saved = window.localStorage.getItem("temantugas-remembered-account");
    if (saved) {
      setIdentifier(saved);
      setRemember(true);
    }
  }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await loginCustomer(identifier, password);
    if (remember) window.localStorage.setItem("temantugas-remembered-account", identifier.trim());
    else window.localStorage.removeItem("temantugas-remembered-account");
    setBusy(false);
    if (result === "success") void navigate({ to: "/dashboard" });
    else if (result === "activation_required") void navigate({ to: "/aktivasi" });
    else
      setError(
        result === "blocked"
          ? "Akun tidak aktif atau sedang dikunci. Hubungi admin."
          : "Username, nomor WhatsApp, atau password tidak sesuai.",
      );
  };
  return (
    <AuthShell>
      <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
        Private workspace
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-.04em]">
        Masuk ke ruang kerja.
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Gunakan username atau nomor WhatsApp dan password yang diberikan admin.
      </p>
      <form className="mt-9 space-y-5" onSubmit={(event) => void submit(event)}>
        <label className="block space-y-2 text-xs font-bold" htmlFor="login-username">
          Username atau nomor WhatsApp
          <Input
            id="login-username"
            required
            autoComplete="username"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="username atau 0812…"
            className="h-11 bg-surface"
          />
        </label>
        <label className="block space-y-2 text-xs font-bold" htmlFor="login-password">
          Password
          <div className="relative">
            <Input
              id="login-password"
              type={show ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan password"
              className="h-11 bg-surface pr-11"
            />
            <button
              type="button"
              className="absolute right-0 top-0 flex size-11 items-center justify-center"
              onClick={() => setShow((value) => !value)}
              aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={remember} onCheckedChange={(value) => setRemember(value === true)} />{" "}
          Ingat akun di perangkat ini
        </label>
        <Button className="h-11 w-full">
          {busy ? "Memeriksa…" : "Masuk"} {!busy && <ArrowRight />}
        </Button>
        {error && (
          <p
            role="alert"
            className="border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive"
          >
            {error}
          </p>
        )}
      </form>
      <div className="mt-8 border-t border-border pt-6">
        <p className="text-sm font-semibold">Belum memiliki akun atau lupa kredensial?</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Akun dibuat oleh admin. Hubungi tim {BRAND.name} untuk mendapatkan akses.
        </p>
        <Button className="mt-4 w-full" variant="outline" asChild>
          <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer">
            <MessageCircle /> Hubungi Admin
          </a>
        </Button>
      </div>
      <div className="mt-6 border border-primary/30 bg-primary/5 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[.14em] text-primary">
          Cek satu penugasan
        </p>
        <p className="mt-2 text-sm font-semibold">
          Tidak perlu login. Gunakan nomor WhatsApp dan token yang diberikan Admin.
        </p>
        <Button className="mt-3 w-full" variant="outline" asChild>
          <Link to="/cek-penugasan">
            Cek Penugasan <ArrowRight />
          </Link>
        </Button>
      </div>
      <p className="mt-6 text-[11px] leading-5 text-muted-foreground">
        Demo customer aktif: <strong>aditya.p</strong> / <strong>DemoCustomer1!</strong>. Akun baru
        akan diarahkan ke aktivasi satu kali.
      </p>
    </AuthShell>
  );
}
