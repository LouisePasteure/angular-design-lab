import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, Eye, FolderKanban, LoaderCircle } from "lucide-react";
import { PortalShell } from "@/components/portal/portal-shell";
import { ActivityTimeline, AssignmentCard, AssignmentTable, SectionCard, SummaryCard } from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import { ACTIVITIES, ASSIGNMENTS, NOW, USER, formatDate, formatDateTime, formatShortDate, formatTime, isActive, timeLeft } from "@/lib/portal-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Ringkasan — TemanTugas" },
      { name: "description", content: "Pantau progres, deadline, dan hasil penugasanmu di TemanTugas." },
      { property: "og:title", content: "Ringkasan — TemanTugas" },
      { property: "og:description", content: "Pantau progres dan akses hasil pengerjaanmu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const active = ASSIGNMENTS.filter(isActive).slice(0, 3);
  const upcoming = ASSIGNMENTS.filter((a) => a.status !== "Selesai" && a.status !== "Dibatalkan")
    .sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 4);
  const go = (status?: string) => navigate({ to: "/penugasan", search: status ? { status } : {} });

  return (
    <PortalShell title="Ringkasan">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Selamat datang kembali, {USER.firstName}<span className="text-primary">.</span></h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Pantau progres dan akses hasil pengerjaanmu di sini.</p>
        </div>
        <p className="text-xs font-semibold text-muted-foreground">Kamis, {formatDate(NOW.toISOString())}</p>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryCard icon={FolderKanban} label="Total Penugasan" value={8} onClick={() => go()} />
        <SummaryCard icon={LoaderCircle} label="Sedang Dikerjakan" value={3} onClick={() => go("Sedang Dikerjakan")} />
        <SummaryCard icon={Eye} label="Menunggu Review" value={2} onClick={() => go("Menunggu Review")} />
        <SummaryCard icon={CheckCircle2} label="Selesai" value={3} onClick={() => go("Selesai")} />
      </div>

      <section className="mt-9">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Penugasan Aktif</h2>
          <Link to="/penugasan" className="text-xs font-semibold text-primary hover:underline">Lihat semua</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {active.map((a) => <AssignmentCard key={a.id} a={a} detailed />)}
        </div>
      </section>

      <div className="mt-9 grid gap-5 lg:grid-cols-2">
        <SectionCard title="Deadline Terdekat">
          <ul className="divide-y divide-border">
            {upcoming.map((a) => {
              const left = timeLeft(a.deadline);
              return (
                <li key={a.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link to="/penugasan/$id" params={{ id: a.id }} className="block truncate text-sm font-semibold hover:text-primary">{a.title}</Link>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarClock className="size-3.5" />{formatDateTime(a.deadline)}</p>
                  </div>
                  <span className={cn("inline-flex shrink-0 items-center gap-1 border px-2 py-1 text-[11px] font-bold",
                    left.urgent ? "border-destructive/40 bg-destructive/5 text-destructive" : "border-border text-muted-foreground")}>
                    {left.urgent && <AlertTriangle className="size-3.5" />}
                    {left.urgent ? `Mendesak · ${left.label}` : left.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </SectionCard>
        <SectionCard title="Aktivitas Terbaru">
          <ActivityTimeline items={ACTIVITIES.map((x) => ({ id: x.id, title: x.title, time: `${formatShortDate(x.at)}, ${formatTime(x.at)} · ${x.ref}` }))} />
        </SectionCard>
      </div>

      <section className="mt-9">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Penugasan Terbaru</h2>
          <Button asChild variant="outline" size="sm"><Link to="/penugasan">Lihat Semua Penugasan <ArrowRight /></Link></Button>
        </div>
        <div className="hidden md:block"><AssignmentTable items={ASSIGNMENTS.slice(0, 5)} compact /></div>
        <div className="grid gap-3 md:hidden">{ASSIGNMENTS.slice(0, 5).map((a) => <AssignmentCard key={a.id} a={a} />)}</div>
      </section>
    </PortalShell>
  );
}
