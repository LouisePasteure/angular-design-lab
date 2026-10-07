import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  FileCheck2,
  FileClock,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  UploadCloud,
  UserRoundCog,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";
import { AdminRouteGuard } from "@/components/auth/route-guards";
import { useAdminStore } from "@/lib/use-admin-store";
import { BrandWordmark } from "@/components/brand-wordmark";
import type { Permission } from "@/lib/admin-data";
import { getWorkerStats, NOW } from "@/lib/admin-selectors";

const MENU: ReadonlyArray<{
  label: string;
  to: string;
  icon: typeof Activity;
  permission?: Permission;
}> = [
  { label: "Ringkasan", to: "/admin", icon: LayoutDashboard, permission: "dashboard:view" },
  {
    label: "Semua Penugasan",
    to: "/admin/penugasan",
    icon: ClipboardList,
    permission: "assignment:view",
  },
  {
    label: "Buat Penugasan",
    to: "/admin/penugasan/baru",
    icon: FileClock,
    permission: "assignment:manage",
  },
  {
    label: "Upload Hasil",
    to: "/admin/penugasan?aksi=upload",
    icon: UploadCloud,
    permission: "result:manage",
  },
  { label: "Worker", to: "/admin/worker", icon: UserCog, permission: "worker:manage" },
  { label: "Customer", to: "/admin/customer", icon: Users, permission: "customer:manage" },
  {
    label: "Pembayaran",
    to: "/admin/pembayaran",
    icon: CircleDollarSign,
    permission: "finance:manage",
  },
  {
    label: "Voucher & Diskon",
    to: "/admin/voucher",
    icon: FileCheck2,
    permission: "finance:manage",
  },
  { label: "Feedback", to: "/admin/feedback", icon: Activity, permission: "customer:manage" },
  { label: "Laporan", to: "/admin/laporan", icon: BarChart3, permission: "report:view" },
  { label: "Aktivitas", to: "/admin/aktivitas", icon: Activity, permission: "audit:view" },
  {
    label: "Pengaturan Sosial",
    to: "/admin/pengaturan",
    icon: Settings,
    permission: "settings:manage",
  },
] as const;

function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { logout, session } = useAdminStore();
  const location = useRouterState({ select: (state) => state.location });
  const pathname = location.pathname;
  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link to="/" className="text-lg font-extrabold" onClick={onNavigate}>
          <BrandWordmark />
        </Link>
      </div>
      <div className="px-6 pb-3 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
          Admin Workspace
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Operasional &amp; delivery</p>
      </div>
      <nav className="flex-1 overflow-y-auto pb-4" aria-label="Navigasi admin">
        {MENU.filter(
          (item) =>
            !item.permission ||
            (session?.role === "admin" && session.permissions.includes(item.permission)),
        ).map(({ to, label, icon: Icon }) => {
          const cleanTo = to.split("?")[0] ?? to;
          const query = to.split("?")[1];
          const active = query
            ? pathname === cleanTo &&
              decodeURIComponent(location.searchStr.replaceAll("+", " ")).includes(
                decodeURIComponent(query.replaceAll("+", " ")),
              )
            : cleanTo === "/admin"
              ? pathname === cleanTo
              : label === "Semua Penugasan"
                ? pathname === cleanTo && !location.searchStr
                : pathname.startsWith(cleanTo);
          return (
            <a
              key={label}
              href={to}
              onClick={onNavigate}
              className={cn(
                "flex min-h-11 items-center gap-3 border-l-2 px-6 text-sm font-semibold transition-colors",
                active
                  ? "border-primary bg-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-surface hover:text-foreground",
              )}
            >
              <Icon className="size-4" strokeWidth={1.7} />
              <span>{label}</span>
            </a>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <Link
          to="/admin/login"
          onClick={logout}
          className="flex min-h-11 items-center gap-3 px-3 text-sm font-semibold text-muted-foreground hover:bg-surface hover:text-destructive"
        >
          <LogOut className="size-4" /> Keluar
        </Link>
      </div>
    </div>
  );
}

function AdminTopbar({ title, onMenu }: { title: string; onMenu: () => void }) {
  const { assignments, feedback, getCurrentWorker, invoices, logout, workers } = useAdminStore();
  const [query, setQuery] = useState("");
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const worker = getCurrentWorker();
  const notifications = [
    ...assignments
      .filter(
        (item) =>
          item.workStatus !== "Selesai" &&
          new Date(item.deadline).getTime() - NOW.getTime() < 86_400_000,
      )
      .map((item) => ({
        id: `deadline-${item.id}`,
        label: `${item.id} mendekati atau melewati deadline`,
        to: `/admin/penugasan/${item.id}`,
      })),
    ...assignments
      .filter((item) => !item.primaryWorkerId && item.workStatus !== "Selesai")
      .map((item) => ({
        id: `unassigned-${item.id}`,
        label: `${item.id} belum memiliki primary worker`,
        to: `/admin/penugasan/${item.id}`,
      })),
    ...assignments
      .filter(
        (item) =>
          item.files.some((file) => file.status === "Published") &&
          item.accessStatus === "Terkunci",
      )
      .map((item) => ({
        id: `locked-${item.id}`,
        label: `${item.id} sudah published tetapi masih terkunci`,
        to: `/admin/penugasan/${item.id}`,
      })),
    ...invoices
      .filter((item) => item.paymentStatus === "Menunggu Verifikasi")
      .map((item) => ({
        id: `invoice-${item.id}`,
        label: `${item.id} menunggu verifikasi pembayaran`,
        to: "/admin/pembayaran",
      })),
    ...feedback
      .filter((item) => item.moderationStatus === "Menunggu Moderasi")
      .map((item) => ({
        id: `feedback-${item.id}`,
        label: `${item.id} menunggu moderasi`,
        to: "/admin/feedback",
      })),
    ...workers
      .filter(
        (item) =>
          item.status === "Aktif" && getWorkerStats(item, assignments, invoices).capacity > 1,
      )
      .map((item) => ({
        id: `capacity-${item.id}`,
        label: `${item.fullName} melewati kapasitas aktif`,
        to: `/admin/worker/${item.id}`,
      })),
  ];
  const unread = notifications.filter((item) => !readNotificationIds.includes(item.id)).length;
  const initials =
    worker?.fullName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "AD";
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Buka menu admin"
        className="flex size-10 items-center justify-center border border-border lg:hidden"
      >
        <Menu className="size-4" />
      </button>
      <h1 className="truncate text-sm font-bold sm:text-base">{title}</h1>
      <form
        className="relative ml-auto hidden w-full max-w-[360px] md:block"
        onSubmit={(event) => {
          event.preventDefault();
          void navigate({ to: "/admin/penugasan", search: { q: query } });
        }}
      >
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-10 bg-surface pl-9"
          placeholder="Cari ID, judul, atau client"
          aria-label="Cari penugasan"
        />
      </form>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Notifikasi admin, ${unread} baru`}
            className="relative flex size-10 items-center justify-center border border-border hover:bg-surface"
          >
            <Bell className="size-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 min-w-4 bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                {Math.min(unread, 99)}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="max-h-[70vh] w-[min(360px,calc(100vw-2rem))] overflow-y-auto"
        >
          <DropdownMenuLabel className="flex items-center justify-between gap-3">
            <span>Notifikasi operasional</span>
            <button
              type="button"
              className="text-[10px] font-bold text-primary hover:underline"
              onClick={(event) => {
                event.preventDefault();
                setReadNotificationIds(notifications.map((item) => item.id));
              }}
            >
              Tandai semua dibaca
            </button>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length ? (
            notifications.slice(0, 12).map((item) => (
              <DropdownMenuItem key={item.id} asChild>
                <a
                  href={item.to}
                  onClick={() =>
                    setReadNotificationIds((ids) =>
                      ids.includes(item.id) ? ids : [...ids, item.id],
                    )
                  }
                  className={`cursor-pointer whitespace-normal py-3 text-xs leading-5 ${readNotificationIds.includes(item.id) ? "text-muted-foreground" : "font-semibold"}`}
                >
                  <span
                    className={`mr-2 inline-block size-1.5 ${readNotificationIds.includes(item.id) ? "bg-border" : "bg-primary"}`}
                  />
                  {item.label}
                </a>
              </DropdownMenuItem>
            ))
          ) : (
            <p className="p-4 text-xs text-muted-foreground">Tidak ada tindakan mendesak.</p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 border border-transparent p-1 hover:border-border"
          >
            <span className="flex size-8 items-center justify-center bg-ink text-xs font-bold text-white">
              {initials}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-bold">{worker?.fullName ?? "Admin"}</span>
              <span className="block text-[10px] text-muted-foreground">
                {worker?.role ?? "Staff"}
              </span>
            </span>
            <ChevronDown className="hidden size-3.5 sm:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            {worker?.fullName ?? "Admin"}
            <span className="block text-xs font-normal text-muted-foreground">
              @{worker?.username ?? "admin"} · {worker?.role ?? "Staff"}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/admin/profil">
              <UserRoundCog /> Profil staff
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CheckCircle2 /> Status sistem normal
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/admin/login" onClick={logout}>
              <LogOut /> Keluar
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    let cancelled = false;
    let cleanup = () => {};
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (
          cancelled ||
          !rootRef.current ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        gsap.registerPlugin(ScrollTrigger);
        const context = gsap.context(() => {
          const intro = rootRef.current?.querySelectorAll("[data-admin-intro]") ?? [];
          if (intro.length)
            gsap.from(intro, {
              y: 18,
              opacity: 0,
              duration: 0.5,
              stagger: 0.06,
              ease: "power3.out",
              clearProps: "transform,opacity",
            });
          gsap.utils.toArray<HTMLElement>("[data-admin-reveal]").forEach((element) =>
            gsap.from(element, {
              y: 24,
              opacity: 0,
              duration: 0.55,
              ease: "power3.out",
              scrollTrigger: { trigger: element, start: "top 90%", once: true },
              clearProps: "transform,opacity",
            }),
          );
          gsap.utils.toArray<HTMLElement>("[data-admin-progress]").forEach((element) =>
            gsap.from(element, {
              scaleX: 0,
              duration: 0.65,
              ease: "power3.out",
              scrollTrigger: { trigger: element, start: "top 94%", once: true },
              clearProps: "transform",
            }),
          );
        }, rootRef);
        ScrollTrigger.refresh();
        cleanup = () => {
          context.revert();
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
          rootRef.current
            ?.querySelectorAll<HTMLElement>(
              "[data-admin-intro], [data-admin-reveal], [data-admin-progress]",
            )
            .forEach((element) => element.removeAttribute("style"));
        };
      },
    );
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <AdminRouteGuard>
      <div ref={rootRef} className="admin-root min-h-screen bg-surface">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border lg:block">
          <AdminSidebar />
        </aside>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-72 p-0 [&>button]:hidden">
            <SheetTitle className="sr-only">Menu admin</SheetTitle>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup menu"
              className="absolute right-3 top-4 z-10 p-2"
            >
              <X className="size-4" />
            </button>
            <AdminSidebar onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="lg:pl-64">
          <AdminTopbar title={title} onMenu={() => setOpen(true)} />
          <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
        <Toaster position="top-right" />
      </div>
    </AdminRouteGuard>
  );
}
