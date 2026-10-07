import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, KeyRound, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuestAssignmentShell } from "@/components/guest/guest-assignment-shell";
import { useAdminStore } from "@/lib/use-admin-store";

// Keep existing attempt counts during the brand change.
const LIMIT_KEY = "temantugas-assignment-check-attempts-v1";
const ERROR_MESSAGE = "Nomor WhatsApp atau token tidak sesuai.";
type AttemptState = { failed: number; lockedUntil: number };
function readAttempts(): AttemptState {
  try {
    const data = JSON.parse(sessionStorage.getItem(LIMIT_KEY) ?? "{}") as Partial<AttemptState>;
    const failed = Number(data.failed) || 0;
    const lockedUntil = Number(data.lockedUntil) || 0;
    if (lockedUntil > 0 && lockedUntil <= Date.now()) return { failed: 0, lockedUntil: 0 };
    return { failed, lockedUntil };
  } catch {
    return { failed: 0, lockedUntil: 0 };
  }
}

export const Route = createFileRoute("/cek-penugasan")({
  head: () => ({
    meta: [
      { title: "jokitugass" },
      {
        name: "description",
        content: "Lihat progres satu penugasan dengan nomor WhatsApp dan token akses.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AssignmentCheck,
});

function AssignmentCheck() {
  const navigate = useNavigate();
  const { verifyAssignmentAccess } = useAdminStore();
  const [whatsapp, setWhatsapp] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState<AttemptState>({ failed: 0, lockedUntil: 0 });
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    setAttempts(readAttempts());
  }, []);
  useEffect(() => {
    if (!attempts.lockedUntil) return;
    const timer = window.setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (attempts.lockedUntil <= currentTime) {
        sessionStorage.removeItem(LIMIT_KEY);
        setAttempts({ failed: 0, lockedUntil: 0 });
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [attempts.lockedUntil]);
  const locked = attempts.lockedUntil > now;
  const remaining = Math.ceil(Math.max(0, attempts.lockedUntil - now) / 60_000);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (locked || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await verifyAssignmentAccess(whatsapp, token);
      if (result.status === "success") {
        sessionStorage.removeItem(LIMIT_KEY);
        setAttempts({ failed: 0, lockedUntil: 0 });
        void navigate({ to: "/cek-penugasan/$id", params: { id: result.assignmentId } });
        return;
      }
      const nextFailed = attempts.failed + 1;
      const next =
        nextFailed >= 5
          ? { failed: nextFailed, lockedUntil: Date.now() + 15 * 60_000 }
          : { failed: nextFailed, lockedUntil: 0 };
      sessionStorage.setItem(LIMIT_KEY, JSON.stringify(next));
      setAttempts(next);
      setError(ERROR_MESSAGE);
    } catch {
      setError("Pengecekan belum berhasil. Silakan coba kembali.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <GuestAssignmentShell>
      <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
            Akses satu penugasan
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.7rem,6vw,5rem)] font-semibold leading-[.94] tracking-[-.06em]">
            Cek progres<span className="text-primary">.</span>
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            Masukkan nomor WhatsApp terdaftar dan token yang diberikan admin. Login tidak
            diperlukan.
          </p>
          <div className="mt-8 flex flex-col gap-3 text-sm">
            <Link className="font-semibold text-primary underline underline-offset-4" to="/login">
              Masuk ke Akun <ArrowRight className="ml-1 inline size-4" />
            </Link>
            <a
              className="font-semibold text-muted-foreground underline underline-offset-4"
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noreferrer"
            >
              Butuh bantuan WhatsApp ↗
            </a>
          </div>
        </div>
        <form
          className="border border-border bg-card p-5 sm:p-7"
          onSubmit={(event) => void submit(event)}
        >
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <KeyRound className="size-5 text-primary" />
            <div>
              <h2 className="font-display text-xl font-semibold">Lihat Penugasan</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Akses ini hanya membuka satu penugasan.
              </p>
            </div>
          </div>
          <label className="mt-5 block space-y-2 text-xs font-bold">
            <span>Nomor WhatsApp</span>
            <Input
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="08xx atau +62xx"
              value={whatsapp}
              onChange={(event) => setWhatsapp(event.target.value)}
              disabled={locked || busy}
            />
          </label>
          <label className="mt-4 block space-y-2 text-xs font-bold">
            <span>Token penugasan</span>
            <Input
              required
              autoComplete="off"
              spellCheck={false}
              placeholder="TGS-XXXX-XXXX-XXXX"
              value={token}
              onChange={(event) => setToken(event.target.value.toUpperCase())}
              disabled={locked || busy}
            />
          </label>
          {error && (
            <p
              role="alert"
              className="mt-4 border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          {locked && (
            <p
              role="status"
              className="mt-4 flex gap-2 border border-status-warning/40 bg-status-warning/5 p-3 text-xs"
            >
              <LockKeyhole className="size-4 shrink-0" />
              Terlalu banyak percobaan. Form dapat digunakan kembali dalam sekitar {remaining}{" "}
              menit.
            </p>
          )}
          <Button type="submit" className="mt-5 min-h-11 w-full" disabled={locked || busy}>
            {busy ? "Memeriksa…" : "Lihat Penugasan"}
            <ArrowRight />
          </Button>
          <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
            Jangan bagikan token kepada orang lain. Akses sementara akan berakhir setelah 30 menit.
          </p>
        </form>
      </div>
    </GuestAssignmentShell>
  );
}
