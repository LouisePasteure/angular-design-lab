import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { PortalShell } from "@/components/portal/portal-shell";
import {
  AssignmentCard,
  AssignmentTable,
  EmptyState,
  LoadingSkeleton,
  NoResultIcon,
} from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATUSES, type Assignment } from "@/lib/portal-data";
import { useAdminStore } from "@/lib/use-admin-store";
import { cn } from "@/lib/utils";

type AssignmentSearch = { q?: string | undefined; status?: string | undefined };

export const Route = createFileRoute("/dashboard_/penugasan/")({
  validateSearch: (search: Record<string, unknown>): AssignmentSearch => ({
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
    status: typeof search["status"] === "string" && search["status"] ? search["status"] : undefined,
  }),
  head: () => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex" }],
  }),
  component: AssignmentsPage,
});

const tabs = ["Semua", "Aktif", "Menunggu Review", "Selesai"] as const;
const sorts = ["Tanggal terbaru", "Deadline terdekat"] as const;

function AssignmentsPage() {
  const search = Route.useSearch();
  const { assignments, getCurrentCustomer } = useAdminStore();
  const customerAssignments = assignments.filter(
    (item) => item.customerId === getCurrentCustomer()?.id,
  );
  const [query, setQuery] = useState(search.q ?? "");
  const [status, setStatus] = useState(search.status ?? "");
  const [tab, setTab] = useState<(typeof tabs)[number]>(
    search.status === "Menunggu Review" || search.status === "Selesai" ? search.status : "Semua",
  );
  const [sort, setSort] = useState<(typeof sorts)[number]>("Tanggal terbaru");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setQuery(search.q ?? "");
    setStatus(search.status ?? "");
  }, [search.q, search.status]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("id");
    const active = ["Sedang Dikerjakan", "Menunggu Review"];
    return [...customerAssignments]
      .filter((assignment) => {
        const matchesQuery =
          !term ||
          assignment.id.toLocaleLowerCase("id").includes(term) ||
          assignment.title.toLocaleLowerCase("id").includes(term);
        const matchesStatus = !status || assignment.workStatus === status;
        const matchesTab =
          tab === "Semua" ||
          (tab === "Aktif"
            ? active.includes(assignment.workStatus)
            : assignment.workStatus === tab);
        return matchesQuery && matchesStatus && matchesTab;
      })
      .sort((a, b) =>
        sort === "Deadline terdekat"
          ? a.deadline.localeCompare(b.deadline)
          : b.createdAt.localeCompare(a.createdAt),
      );
  }, [customerAssignments, query, sort, status, tab]);

  const reset = () => {
    setQuery("");
    setStatus("");
    setTab("Semua");
    setSort("Tanggal terbaru");
  };

  return (
    <PortalShell title="Penugasan Saya">
      <nav className="text-xs text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>{" "}
        / Penugasan Saya
      </nav>

      <header className="mt-5 border-b border-border pb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
          02 / Penugasan
        </p>
        <h2 className="mt-3 font-display text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
          Penugasan Saya<span className="text-primary">.</span>
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Semua pekerjaan, progres, dan hasil tersimpan di sini.
        </p>
      </header>

      <section className="mt-6 border-b border-border pb-6">
        <div
          className="flex gap-1 overflow-x-auto pb-2"
          role="tablist"
          aria-label="Filter penugasan"
        >
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              onClick={() => setTab(item)}
              className={cn(
                "min-h-11 shrink-0 border px-4 text-xs font-bold transition-colors",
                tab === item
                  ? "border-ink bg-ink text-white"
                  : "border-border bg-card hover:border-foreground/40",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
          <label className="relative">
            <span className="sr-only">Cari penugasan</span>
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari ID atau judul"
              className="h-11 bg-card pl-9"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter status"
            className="h-11 border border-input bg-card px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary"
          >
            <option value="">Semua status</option>
            {STATUSES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            aria-label="Urutkan penugasan"
            className="h-11 border border-input bg-card px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary"
          >
            {sorts.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <Button
            variant="outline"
            onClick={reset}
            disabled={!query && !status && tab === "Semua" && sort === "Tanggal terbaru"}
          >
            <RotateCcw /> Reset
          </Button>
        </div>
      </section>

      <section className="mt-6" aria-live="polite">
        {loading ? (
          <LoadingSkeleton rows={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={NoResultIcon}
            title="Penugasan tidak ditemukan"
            description="Coba ubah kata kunci atau filter yang digunakan."
            action={
              <Button variant="outline" onClick={reset}>
                Reset filter
              </Button>
            }
          />
        ) : (
          <>
            <div className="hidden md:block">
              <AssignmentTable items={filtered as Assignment[]} />
            </div>
            <div className="grid gap-3 md:hidden">
              {filtered.map((assignment) => (
                <AssignmentCard key={assignment.id} a={assignment} />
              ))}
            </div>
          </>
        )}
      </section>
    </PortalShell>
  );
}
