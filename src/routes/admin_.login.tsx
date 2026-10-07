import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminStore } from "@/lib/use-admin-store";
import { BrandWordmark } from "@/components/brand-wordmark";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin } = useAdminStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await loginAdmin(username, password);
    if (result === "success") void navigate({ to: "/admin" });
    else if (result === "password_change_required") void navigate({ to: "/admin/profil" });
    else if (result === "unavailable") setError("Autentikasi admin belum tersedia.");
    else setError("Kredensial administrator tidak sesuai.");
  };
  return (
    <main className="grid min-h-screen bg-ink text-white lg:grid-cols-[.8fr_1.2fr]">
      <aside className="hidden border-r border-white/15 p-12 lg:flex lg:flex-col lg:justify-between">
        <a href="/" className="text-xl font-extrabold">
          <BrandWordmark />
        </a>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">
            Restricted workspace
          </p>
          <h1 className="mt-4 font-display text-6xl font-semibold leading-[.9] tracking-[-.06em]">
            Kontrol
            <br />
            operasional.
          </h1>
        </div>
        <p className="text-xs text-white/50">Akses khusus administrator.</p>
      </aside>
      <section className="grid place-items-center bg-background p-5 text-foreground">
        <div className="w-full max-w-md border border-border bg-card p-6 sm:p-9">
          <ShieldCheck className="size-7 text-primary" />
          <h2 className="mt-5 font-display text-4xl font-semibold">Admin masuk.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Gunakan kredensial workspace administrator.
          </p>
          <form className="mt-8 space-y-4" onSubmit={(event) => void submit(event)}>
            <label className="block space-y-2 text-xs font-bold">
              Username
              <Input
                required
                autoComplete="username"
                placeholder="Masukkan username admin"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
            <label className="block space-y-2 text-xs font-bold">
              Password
              <Input
                required
                type="password"
                autoComplete="current-password"
                placeholder="Masukkan password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {error && (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}
            <Button className="w-full">
              Masuk ke Admin <ArrowRight />
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
