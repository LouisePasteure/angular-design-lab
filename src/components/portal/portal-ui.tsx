import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight, Ban, CheckCircle2, CircleDashed, Clock3, Download, Eye, FileArchive, FileSpreadsheet, FileText,
  Hourglass, Inbox, LoaderCircle, Lock, LockOpen, RotateCcw, SearchX, Unlock,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  type AccessState, type Assignment, type AssignmentStatus, formatDateTime, formatShortDate, timeLeft,
} from "@/lib/portal-data";

/* ---------- Status ---------- */
const STATUS_META: Record<AssignmentStatus, { icon: LucideIcon; cls: string }> = {
  "Menunggu Konfirmasi": { icon: Hourglass, cls: "text-status-neutral border-status-neutral/40 bg-status-neutral/5" },
  "Sedang Dikerjakan": { icon: LoaderCircle, cls: "text-primary border-primary/40 bg-primary/5" },
  "Menunggu Review": { icon: Eye, cls: "text-status-review border-status-review/40 bg-status-review/5" },
  Revisi: { icon: RotateCcw, cls: "text-status-warning border-status-warning/40 bg-status-warning/5" },
  "Revisi Diajukan": { icon: RotateCcw, cls: "text-status-warning border-status-warning/40 bg-status-warning/5" },
  Selesai: { icon: CheckCircle2, cls: "text-success border-success/40 bg-success/5" },
  Dibatalkan: { icon: Ban, cls: "text-destructive border-destructive/40 bg-destructive/5" },
};

export function AssignmentStatusBadge({ status, access }: { status: AssignmentStatus; access?: AccessState }) {
  let meta = STATUS_META[status];
  let label: string = status;
  if (status === "Selesai" && access) {
    meta = access === "Dapat diakses"
      ? { icon: Unlock, cls: STATUS_META.Selesai.cls }
      : { icon: Lock, cls: "text-status-locked border-status-locked/40 bg-status-locked/5" };
    label = access === "Dapat diakses" ? "Selesai · Dapat diakses" : "Selesai · Terkunci";
  }
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap border px-2 py-1 text-[11px] font-bold", meta.cls)}>
      <Icon className="size-3.5" strokeWidth={2} />
      {label}
    </span>
  );
}

export function AccessStatus({ access }: { access: AccessState }) {
  const meta = {
    "Belum tersedia": { icon: CircleDashed, cls: "text-status-neutral" },
    Terkunci: { icon: Lock, cls: "text-status-locked" },
    "Dapat diakses": { icon: LockOpen, cls: "text-success" },
  }[access];
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold", meta.cls)}>
      <Icon className="size-3.5" strokeWidth={1.75} />
      {access}
    </span>
  );
}

export function ProgressBar({ value, className, showLabel = true }: { value: number; className?: string; showLabel?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-1.5 flex-1 bg-border" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className={cn("h-full", value >= 100 ? "bg-success" : "bg-primary")} style={{ width: `${value}%` }} />
      </div>
      {showLabel && <span className="w-9 text-right text-xs font-bold tabular-nums">{value}%</span>}
    </div>
  );
}

/* ---------- Cards ---------- */
export function SummaryCard({ icon: Icon, label, value, active, onClick }: { icon: LucideIcon; label: string; value: number; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between border bg-card px-5 py-4 text-left transition-colors hover:border-foreground/30",
        active ? "border-primary shadow-[inset_0_-2px_0_var(--primary)]" : "border-border",
      )}
    >
      <div>
        <p className="text-3xl font-extrabold tabular-nums">{value}</p>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">{label}</p>
      </div>
      <Icon className={cn("size-6", active ? "text-primary" : "text-muted-foreground")} strokeWidth={1.5} />
    </button>
  );
}

export function AssignmentCard({ a, detailed = false }: { a: Assignment; detailed?: boolean }) {
  const left = timeLeft(a.deadline);
  return (
    <article className="flex flex-col border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold tracking-wide text-muted-foreground">{a.id}</p>
        <AssignmentStatusBadge status={a.status} access={a.access} />
      </div>
      <h3 className="mt-3 text-base font-bold leading-snug">{a.title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{a.category}{detailed && ` · Dibuat ${formatShortDate(a.createdAt)}`}</p>
      <dl className="mt-4 space-y-1.5 text-xs">
        <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Deadline</dt><dd className="text-right font-semibold">{formatDateTime(a.deadline)}</dd></div>
        {a.status !== "Selesai" && (
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Sisa waktu</dt><dd className={cn("font-semibold", left.urgent && "text-destructive")}>{left.label}</dd></div>
        )}
        {!detailed && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Akses hasil</dt><dd><AccessStatus access={a.access} /></dd></div>}
      </dl>
      <ProgressBar value={a.progress} className="mt-4" />
      <Button asChild variant="outline" size="sm" className="mt-5 w-full">
        <Link to="/penugasan/$id" params={{ id: a.id }}>Lihat Detail <ArrowRight /></Link>
      </Button>
    </article>
  );
}

export function AssignmentTable({ items, compact = false }: { items: Assignment[]; compact?: boolean }) {
  return (
    <div className="overflow-x-auto border border-border bg-card">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="border-b border-border bg-surface text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Nomor</th>
            <th className="px-4 py-3">Judul</th>
            {!compact && <th className="px-4 py-3">Kategori</th>}
            <th className="px-4 py-3">Dibuat</th>
            <th className="px-4 py-3">Deadline</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Progress</th>
            <th className="px-4 py-3">Akses hasil</th>
            <th className="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id} className="border-b border-border last:border-0 hover:bg-surface">
              <td className="whitespace-nowrap px-4 py-3.5 text-xs font-bold text-muted-foreground">{a.id}</td>
              <td className="px-4 py-3.5 font-semibold">{a.title}</td>
              {!compact && <td className="whitespace-nowrap px-4 py-3.5 text-xs">{a.category}</td>}
              <td className="whitespace-nowrap px-4 py-3.5 text-xs">{formatShortDate(a.createdAt)}</td>
              <td className="whitespace-nowrap px-4 py-3.5 text-xs">{formatShortDate(a.deadline)}</td>
              <td className="px-4 py-3.5"><AssignmentStatusBadge status={a.status} access={a.access} /></td>
              <td className="w-36 px-4 py-3.5"><ProgressBar value={a.progress} /></td>
              <td className="px-4 py-3.5"><AccessStatus access={a.access} /></td>
              <td className="px-4 py-3.5 text-right">
                <Button asChild variant="outline" size="sm">
                  <Link to="/penugasan/$id" params={{ id: a.id }}>{compact ? "Lihat" : "Lihat Detail"}</Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Files ---------- */
export function fileIcon(name: string) {
  if (/\.(xlsx|csv|sav)$/i.test(name)) return FileSpreadsheet;
  if (/\.(zip|rar)$/i.test(name)) return FileArchive;
  return FileText;
}

export function FileCard({ name, meta, description, actions }: { name: string; meta: string; description?: string; actions?: ReactNode }) {
  const Icon = fileIcon(name);
  return (
    <div className="flex flex-col gap-3 border border-border bg-card p-4 sm:flex-row sm:items-center">
      <div className="flex size-10 shrink-0 items-center justify-center border border-border bg-surface">
        <Icon className="size-5 text-primary" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
export { Download as DownloadIcon, Eye as EyeIcon };

/* ---------- Timeline ---------- */
export function ActivityTimeline({ items }: { items: { id: string | number; icon?: LucideIcon; title: string; description?: string; time: string; actor?: string }[] }) {
  return (
    <ol className="relative">
      {items.map((it, i) => {
        const Icon = it.icon ?? Clock3;
        return (
          <li key={it.id} className="relative flex gap-4 pb-6 last:pb-0">
            {i < items.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px bg-border" />}
            <span className="flex size-8 shrink-0 items-center justify-center border border-border bg-card">
              <Icon className="size-4 text-primary" strokeWidth={1.5} />
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-sm font-semibold leading-snug">{it.title}</p>
              {it.description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{it.description}</p>}
              <p className="mt-1 text-[11px] text-muted-foreground">
                {it.time}{it.actor && <> · <span className="font-semibold text-foreground/70">{it.actor}</span></>}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- States ---------- */
export function EmptyState({ icon: Icon = Inbox, title, description, action }: { icon?: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center border border-dashed border-border bg-surface px-6 py-14 text-center">
      <Icon className="size-8 text-muted-foreground" strokeWidth={1.25} />
      <p className="mt-4 text-base font-bold">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
export const NoResultIcon = SearchX;

export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border border-border bg-card" aria-busy="true" aria-label="Memuat">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-0">
          <div className="h-3 w-24 animate-pulse bg-muted-foreground/15" />
          <div className="h-3 flex-1 animate-pulse bg-muted-foreground/15" />
          <div className="hidden h-3 w-20 animate-pulse bg-muted-foreground/15 sm:block" />
          <div className="h-6 w-20 animate-pulse bg-muted-foreground/15" />
        </div>
      ))}
    </div>
  );
}

export function SectionCard({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("border border-border bg-card", className)}>
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="text-sm font-bold">{title}</h2>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
