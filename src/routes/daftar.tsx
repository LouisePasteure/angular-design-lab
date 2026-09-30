import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/daftar")({
  head: () => ({
    meta: [
      { title: "Daftar — TemanTugas" },
      { name: "description", content: "Buat akun TemanTugas untuk mulai mendampingi proses belajar dan dokumenmu." },
      { property: "og:title", content: "Daftar — TemanTugas" },
      { property: "og:description", content: "Buat akun TemanTugas dan mulai pendampingan belajarmu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <AuthShell>
      <h1 className="text-3xl font-extrabold tracking-tight">Buat akunmu.</h1>
      <p className="mt-2.5 text-sm text-muted-foreground">Satu akun untuk semua kebutuhan belajarmu.</p>

      <form
        className="mt-9 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <div className="space-y-2">
          <label htmlFor="register-name" className="text-xs font-bold">Nama lengkap</label>
          <Input id="register-name" type="text" required autoComplete="name" placeholder="Nama kamu" className="h-11 bg-surface" />
        </div>
        <div className="space-y-2">
          <label htmlFor="register-email" className="text-xs font-bold">Email</label>
          <Input id="register-email" type="email" required autoComplete="email" placeholder="nama@email.com" className="h-11 bg-surface" />
        </div>
        <div className="space-y-2">
          <label htmlFor="register-password" className="text-xs font-bold">Kata sandi</label>
          <Input id="register-password" type="password" required minLength={8} autoComplete="new-password" placeholder="Minimal 8 karakter" className="h-11 bg-surface" />
        </div>
        <Button type="submit" className="h-11 w-full text-sm">Daftar <ArrowRight /></Button>
        {submitted && (
          <p className="border border-border bg-surface px-4 py-3 text-xs leading-5 text-muted-foreground">
            Pendaftaran akan aktif setelah backend terhubung. Tampilan ini masih tahap awal.
          </p>
        )}
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />atau<span className="h-px flex-1 bg-border" />
        </div>
        <Button type="button" variant="outline" className="h-11 w-full text-sm">Lanjutkan dengan Google</Button>
      </form>

      <p className="mt-9 border-t border-border pt-6 text-sm text-muted-foreground">
        Sudah punya akun? <Link to="/login" className="font-bold text-primary hover:underline">Masuk</Link>
      </p>
   </AuthShell>
  );
}
