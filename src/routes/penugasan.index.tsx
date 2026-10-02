import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, Rows3, RotateCcw, Search, ServerCrash } from "lucide-react";
import { PortalShell } from "@/components/portal/portal-shell";
import { AssignmentCard, AssignmentTable, EmptyState, LoadingSkeleton, NoResultIcon } from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ACCESS_STATES, ASSIGNMENTS, CATEGORIES, STATUSES, type Assignment } from "@/lib/portal-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/penugasan/")({
  head: () => ({
    meta: [
      { title: "Penugasan Saya — TemanTugas" },
      { name: "description", content: "Lihat progres, deadline, dan hasil seluruh penugasanmu di TemanTugas." },
      { property: "og:title", content: "Penugasan Saya — TemanTugas" },
      { property: "og:description", content: "Lihat progres, deadline, dan hasil seluruh penugasanmu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AssignmentsPage,
});

const SORTS = ["Terbaru", "Terlama", "Deadline terdekat", "Progress tertinggi", "Progress terendah"] as const;
const PAGE_SIZE = 5;
type Demo = "Normal" | "Memuat" | "Kosong" | "Error";

const selectCls = "h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:border-ring";

function AssignmentsPage() {
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q ?? "");
  const [status, setStatus] = useState(search.status ?? "");
  const [category, setCategory] = useState("");
  const [access, setAccess] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Terbaru");
  const [view, setView] = useState<"table" | "card">("table");
  const [page, setPage] = useState(1);
  const [demo, setDemo] = useState<Demo>("Normal");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQ(search.q ?? "");
    setStatus(search.status ?? "");
  }, [search.q, search.status]);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => setPage(1), [q, status, category, access, from, to, sort]);

  const source: Assignment[] = demo === "Kosong" ? [] : ASSIGNMENTS;
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = source.filter((a) =>
      (!term || a.id.toLowerCase().includes(term) || a.title.toLowerCase().includes(term)) &&
      (!status || a.status === status) &&
      (!category || a.category === category) &&
      (!access || a.access === access) &&
      (!from || a.createdAt.slice(0, 10) >= from) &&
      (!to || a.createdAt.slice(0, 10) <= to));
    const by: Record<string, (a: Assignment, b: Assignment) => number> = {
      Terbaru: (a, b) => b.createdAt.localeCompare(a.createdAt),
      Terlama: (a, b) => a.createdAt.localeCompare(b.createdAt),
      "Deadline terdekat": (a, b) => a.deadline.localeCompare(b.deadline),
      "Progress tertinggi": (a, b) => b.progress - a.progress,
      "Progress terendah": (a, b) => a.progress - b.progress,
    };
    return [...list].sort(by[sort]);
  }, [source, q, status, category, access, from, to, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilter = !!(q || status || category || access || from || to);
  const reset = () => { setQ(""); setStatus(""); setCategory(""); setAccess(""); setFrom(""); setTo(""); setSort("Terbaru"); };

  const isLoading = loading || demo === "Memuat";

  return (
    <PortalShell title="Penugasan Saya">
      <nav className="text-xs text-muted-foreground"><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link> / <span className="text-foreground">Penugasan Saya</span></nav>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Penugasan Saya</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Lihat progres, deadline, dan hasil seluruh penugasanmu.</p>
        </div>
        <p className="border border-border bg-card px-3 py-2 text-xs font-semibold">{source.length} penugasan</p>
      </div>

      <div className="mt-6 border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nomor atau judul penugasan" className="h-10 pl-9" />
          </div>
          <select aria-label="Filter status" value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
            <option value="">Semua status</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select aria-label="Filter kategori" value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
            <option value="">Semua kategori</option>{CATEGORIES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select aria-label="Filter akses hasil" value={access} onChange={(e) => setAccess(e.target.value)} className={selectCls}>
            <option value="">Semua akses hasil</option>{ACCESS_STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <Input type="date" aria-label="Dari tanggal" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 text-xs" />
            <span className="text-xs text-muted-foreground">–</span>
            <Input type="date" aria-label="Sampai tanggal" value={to} onChange={(e) => setTo(e.target.value)} className="h-10 text-xs" />
          </div>
          <select aria-label="Urutkan" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={selectCls}>
            {SORTS.map((s) => <option key={s} value={s}>Urutkan: {s}</option>)}
          </select>
          <div className="flex gap-2">
            <Button variant="outline" className="h-10 flex-1" onClick={reset} disabled={!hasFilter && sort === "Terbaru"}><RotateCcw /> Reset filter</Button>
            <div className="hidden border border-border md:flex">
              {([["table", Rows3, "Tampilan tabel"], ["card", LayoutGrid, "Tampilan kartu"]] as const).map(([v, Icon, label]) => (
                <button key={v} type="button" aria-label={label} aria-pressed={view === v} onClick={() => setView(v)}
                  className={cn("flex w-10 items-center justify-center", view === v ? "bg-ink text-ink-foreground" : "hover:bg-surface")}>
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        {isLoading ? <LoadingSkeleton /> : demo === "Error" ? (
          <EmptyState icon={ServerCrash} title="Data gagal dimuat" description="Terjadi kendala saat memuat penugasan. Silakan coba lagi beberapa saat." action={<Button variant="outline" onClick={() => setDemo("Normal")}>Coba lagi</Button>} />
        ) : source.length === 0 ? (
          <EmptyState title="Belum ada penugasan" description="Penugasan yang diberikan kepadamu akan tampil di halaman ini." />
        ) : filtered.length === 0 ? (
          <EmptyState icon={NoResultIcon} title="Tidak ada hasil" description="Tidak ada penugasan yang cocok dengan pencarian atau filter yang dipilih." action={<Button variant="outline" onClick={reset}>Reset filter</Button>} />
        ) : (
          <>
            <div className={cn(view === "table" ? "hidden md:block" : "hidden")}><AssignmentTable items={visible} /></div>
            <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", view === "table" && "md:hidden")}>
              {visible.map((a) => <AssignmentCard key={a.id} a={a} />)}
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <p>Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length}</p>
              <div className="flex">
                <button type="button" aria-label="Sebelumnya" disabled={page === 1} onClick={() => setPage(page - 1)} className="flex size-9 items-center justify-center border border-border bg-card disabled:opacity-40"><ChevronLeft className="size-4" /></button>
                {Array.from({ length: pages }).map((_, i) => (
                  <button key={i} type="button" onClick={() => setPage(i + 1)} className={cn("size-9 border border-l-0 border-border text-xs font-bold", page === i + 1 ? "bg-ink text-ink-foreground" : "bg-card")}>{i + 1}</button>
                ))}
                <button type="button" aria-label="Berikutnya" disabled={page === pages} onClick={() => setPage(page + 1)} className="flex size-9 items-center justify-center border border-l-0 border-border bg-card disabled:opacity-40"><ChevronRight className="size-4" /></button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-10 border border-dashed border-border p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">UI Preview Mode · hanya untuk demonstrasi</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["Normal", "Memuat", "Kosong", "Error"] as Demo[]).map((d) => (
            <button key={d} type="button" onClick={() => setDemo(d)} className={cn("border px-3 py-1.5 text-xs font-semibold", demo === d ? "border-foreground bg-foreground text-background" : "border-border bg-card")}>{d}</button>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
