import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, CircleDashed, Lock, LockOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AccessStatus,
  PaymentStatus,
  Priority,
  ResultFileStatus,
  WorkStatus,
} from "@/lib/admin-data";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header
      data-admin-intro
      className="grid gap-5 border-b border-border pb-7 lg:grid-cols-[1fr_auto] lg:items-end"
    >
      <div>
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-2 font-display text-[clamp(2.5rem,5vw,5.5rem)] font-semibold leading-[.92] tracking-[-.055em]">
          {title}
          <span className="text-primary">.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

const statusClass: Record<WorkStatus, string> = {
  Draft: "border-border bg-surface text-muted-foreground",
  "Sedang Dikerjakan": "border-primary/40 bg-primary/5 text-primary",
  "Menunggu Review": "border-status-review/40 bg-status-review/5 text-status-review",
  Selesai: "border-success/40 bg-success/5 text-success",
};

export function AdminStatusBadge({ status }: { status: WorkStatus }) {
  return (
    <span className={cn("inline-flex border px-2 py-1 text-[10px] font-bold", statusClass[status])}>
      {status}
    </span>
  );
}
export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const cls =
    status === "Lunas"
      ? "border-success/40 text-success"
      : status === "Gagal" || status === "Kedaluwarsa"
        ? "border-destructive/40 text-destructive"
        : "border-status-warning/40 text-status-warning";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border bg-card px-2 py-1 text-[10px] font-bold",
        cls,
      )}
    >
      {status === "Lunas" ? (
        <CheckCircle2 className="size-3" />
      ) : (
        <CircleDashed className="size-3" />
      )}
      {status}
    </span>
  );
}
export function AccessBadge({ access }: { access: AccessStatus }) {
  const open = access === "Dapat Diakses";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-bold",
        open
          ? "text-success"
          : access === "Terkunci"
            ? "text-status-locked"
            : "text-muted-foreground",
      )}
    >
      {open ? <LockOpen className="size-3.5" /> : <Lock className="size-3.5" />}
      {access}
    </span>
  );
}
export function PriorityBadge({ priority }: { priority: Priority }) {
  const cls =
    priority === "Urgent"
      ? "bg-destructive text-white"
      : priority === "Tinggi"
        ? "border-status-warning/50 text-status-warning"
        : "border-border text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex border px-2 py-1 text-[9px] font-bold uppercase tracking-wide",
        cls,
      )}
    >
      {priority === "Urgent" && <AlertTriangle className="mr-1 size-3" />}
      {priority}
    </span>
  );
}
export function FileStateBadge({ status }: { status: ResultFileStatus }) {
  return (
    <span
      className={cn(
        "border px-2 py-1 text-[9px] font-bold uppercase tracking-wide",
        status === "Published"
          ? "border-success/40 text-success"
          : "border-border text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}

export function AdminProgress({ value }: { value: number }) {
  return (
    <div className="flex min-w-28 items-center gap-2">
      <div
        className="h-1.5 flex-1 overflow-hidden bg-border"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <div
          data-admin-progress
          className={cn("h-full origin-left", value === 100 ? "bg-success" : "bg-primary")}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[10px] font-bold tabular-nums">{value}%</span>
    </div>
  );
}

export function Metric({
  label,
  value,
  meta,
  href,
}: {
  label: string;
  value: string;
  meta?: string;
  href?: string;
}) {
  const body = (
    <>
      <p
        className={cn(
          "whitespace-nowrap font-display font-semibold tracking-[-.05em]",
          value.length > 6 ? "text-[clamp(1.65rem,2.1vw,2.7rem)]" : "text-[clamp(2rem,3.4vw,4rem)]",
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-xs font-bold">{label}</p>
      {meta && <p className="mt-1 text-[10px] text-muted-foreground">{meta}</p>}
    </>
  );
  return href ? (
    <a
      href={href}
      data-admin-intro
      className="group border-l border-t border-border p-5 transition-colors hover:bg-card hover:text-primary"
    >
      {body}
    </a>
  ) : (
    <div data-admin-intro className="border-l border-t border-border p-5">
      {body}
    </div>
  );
}
