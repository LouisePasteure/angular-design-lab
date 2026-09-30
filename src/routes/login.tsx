import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Masuk — TemanTugas" },
      { name: "description", content: "Masuk ke akun TemanTugas untuk melanjutkan pendampingan belajar dan pengelolaan pesananmu." },
      { property: "og:title", content: "Masuk — TemanTugas" },
      { property: "og:description", content: "Masuk ke akun TemanTugas untuk melanjutkan pendampingan belajarmu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <AuthShell>
      <h1 className="text-3xl font-extrabold tracking-tight">Selamat datang kembali.</h1>
      <p className="mt-2.5 text-sm text-muted-foreground">Masuk untuk melanjutkan aktivitas belajarmu.</p>

      <form
        className="mt-9 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-xs font-bold">Email</label>
          <Input id="login-email" type="email" required autoComplete="email" placeholder="nama@email.com" className="h-11 bg-surface" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-xs font-bold">Kata sandi</label>
            <button type="button" className="text-xs font-semibold text-primary hover:underline">Lupa kata sandi?</button>
          </div>
          <Input id="login-password" type="password" required autoComplete="current-password" placeholder="Masukkan kata sandi" className="h-11 bg-surface" />
        </div>
        <Button type="submit" className="h-11 w-full text-sm">Masuk <ArrowRight /></Button>
        {submitted && (
          <p className="border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted-foreground">
            Fitur masuk sedang disiapkan. Tampilan ini belum terhubung ke akun.
          </p>
        )}
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />atau<span className="h-px flex-1 bg-border" />
        </div>
        <Button type="button" variant="outline" className="h-11 w-full text-sm">Lanjutkan dengan Google</Button>
      </form>

      <p className="mt-9 border-t border-border pt-6 text-sm text-muted-foreground">
        Belum punya akun? <Link to="/daftar" className="font-bold text-primary hover:underline">Daftar</Link>
      </p>
    </AuthShell>
  );
}
