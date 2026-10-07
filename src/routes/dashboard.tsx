import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Eye,
  FolderKanban,
  LoaderCircle,
} from "lucide-react";
import { PortalShell } from "@/components/portal/portal-shell";
import {
  ActivityTimeline,
  AssignmentCard,
  AssignmentTable,
  SectionCard,
  SummaryCard,
} from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import {
  ACTIVITIES,
  ASSIGNMENTS,
  NOW,
  formatDate,
  formatDateTime,
  formatShortDate,
  formatTime,
  timeLeft,
} from "@/lib/portal-data";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/lib/use-admin-store";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "jokitugass" },
      {
        name: "description",
        content: `Pantau progres, deadline, dan hasil penugasanmu di ${BRAND.name}.`,
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { assignments: adminAssignments, getCurrentCustomer } = useAdminStore();
  const customer = getCurrentCustomer();
  const liveAssignments = adminAssignments
    .filter((item) => item.customerId === customer?.id)
    .map((item) => ({ ...item, created: item.createdAt }));
  const upcoming = liveAssignments
    .filter((assignment) => assignment.workStatus !== "Selesai")
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 3);
  const go = (status?: string) =>
    navigate({ to: "/dashboard/penugasan", search: status ? { status } : {} });

  return (
    <PortalShell title="Ringkasan">
      <section className="flex flex-col gap-7 border-b border-border pb-9 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            Client workspace / 2026
          </p>
          <h2 className="mt-3 font-display text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.065em]">
            Halo, @{customer?.username ?? "customer"}
            <span className="text-primary">.</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Pantau progres dan hasil penugasanmu di satu tempat.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <p className="text-xs font-semibold text-muted-foreground">
            Kamis, {formatDate(NOW.toISOString())}
          </p>
          <Button asChild>
            <Link to="/dashboard/penugasan">
              Lihat Penugasan <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <div className="mt-7 grid grid-cols-2 gap-px border border-border bg-border xl:grid-cols-4">
        <SummaryCard
          icon={FolderKanban}
          label="Total Penugasan"
          value={liveAssignments.length}
          onClick={() => go()}
        />
        <SummaryCard
          icon={LoaderCircle}
          label="Sedang Dikerjakan"
          value={liveAssignments.filter((item) => item.workStatus === "Sedang Dikerjakan").length}
          onClick={() => go("Sedang Dikerjakan")}
        />
        <SummaryCard
          icon={Eye}
          label="Menunggu Review"
          value={liveAssignments.filter((item) => item.workStatus === "Menunggu Review").length}
          onClick={() => go("Menunggu Review")}
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Selesai"
          value={liveAssignments.filter((item) => item.workStatus === "Selesai").length}
          onClick={() => go("Selesai")}
        />
      </div>

      <section className="mt-10" data-portal-reveal>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Penugasan Terbaru</h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/penugasan">
              Lihat Semua <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="hidden md:block">
          <AssignmentTable items={liveAssignments.slice(0, 4)} compact />
        </div>
        <div className="grid gap-3 md:hidden">
          {liveAssignments.slice(0, 4).map((assignment) => (
            <AssignmentCard key={assignment.id} a={assignment} />
          ))}
        </div>
      </section>

      <div className="mt-10 grid gap-5 lg:grid-cols-2" data-portal-reveal>
        <SectionCard title="Deadline Terdekat">
          <ul className="divide-y divide-border">
            {upcoming.map((assignment) => {
              const left = timeLeft(assignment.deadline);
              return (
                <li
                  key={assignment.id}
                  className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <Link
                      to="/dashboard/penugasan/$id"
                      params={{ id: assignment.id }}
                      className="block truncate text-sm font-semibold hover:text-primary"
                    >
                      {assignment.title}
                    </Link>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarClock className="size-3.5" />
                      {formatDateTime(assignment.deadline)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 border px-2 py-1 text-[11px] font-bold",
                      left.urgent
                        ? "border-destructive/40 text-destructive"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {left.urgent && <AlertTriangle className="size-3.5" />}
                    {left.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </SectionCard>
        <SectionCard title="Aktivitas Terbaru">
          <ActivityTimeline
            items={ACTIVITIES.slice(0, 4).map((activity) => ({
              id: activity.id,
              title: activity.title,
              time: `${formatShortDate(activity.at)}, ${formatTime(activity.at)} · ${activity.ref}`,
            }))}
          />
        </SectionCard>
      </div>
    </PortalShell>
  );
}
