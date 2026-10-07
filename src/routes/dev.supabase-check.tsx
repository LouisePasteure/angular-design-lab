import { createFileRoute, notFound } from "@tanstack/react-router";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { checkSupabaseConnection } from "@/lib/supabase/check-connection";

export const Route = createFileRoute("/dev/supabase-check")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  loader: () => checkSupabaseConnection(),
  head: () => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: SupabaseCheckPage,
});

function SupabaseCheckPage() {
  const result = Route.useLoaderData();

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-12 text-foreground">
      <section className="w-full max-w-xl border border-border bg-card p-6 sm:p-9">
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
          Development utility
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
          Supabase connection check
        </h1>
        <div
          className={`mt-7 flex items-start gap-3 border p-4 ${result.connected ? "border-success/40 bg-success/5" : "border-status-warning/40 bg-status-warning/5"}`}
          role="status"
          aria-live="polite"
        >
          {result.connected ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
          ) : (
            <CircleAlert
              className="mt-0.5 size-5 shrink-0 text-status-warning"
              aria-hidden="true"
            />
          )}
          <div>
            <p className="font-semibold">{result.connected ? "Tersambung" : "Gagal tersambung"}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{result.message}</p>
          </div>
        </div>
        <p className="mt-5 text-xs leading-5 text-muted-foreground">
          Pemeriksaan menggunakan publishable key dan mengikuti Row Level Security. Halaman ini
          tidak menampilkan credential atau cookie.
        </p>
      </section>
    </main>
  );
}
