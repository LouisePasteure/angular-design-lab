import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Bell, CheckCheck, ChevronDown, CircleHelp, LayoutGrid, ListChecks, LogOut, Menu, Search, User, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { USER, formatShortDate, formatTime } from "@/lib/portal-data";
import { useNotifications } from "@/lib/notification-store";

const MENU = [
  { to: "/dashboard", label: "Ringkasan", icon: LayoutGrid },
  { to: "/penugasan", label: "Penugasan Saya", icon: ListChecks },
  { to: "/notifikasi", label: "Notifikasi", icon: Bell },
  { to: "/profil", label: "Profil", icon: User },
  { to: "/bantuan", label: "Bantuan", icon: CircleHelp },
] as const;

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { unread } = useNotifications();
  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link to="/" className="text-lg font-extrabold">
          teman<span className="text-primary">tugas</span><span className="text-primary">.</span>
        </Link>
      </div>
      <p className="px-6 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Area Client</p>
      <nav className="flex-1 space-y-0.5">
        {MENU.map(({ to, label, icon: Icon }) => {
          const active = path === to || path.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 border-l-2 px-6 py-2.5 text-sm font-semibold transition-colors",
                active ? "border-primary bg-accent text-foreground" : "border-transparent text-muted-foreground hover:bg-surface hover:text-foreground",
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} />
              <span className="flex-1">{label}</span>
              {to === "/notifikasi" && unread > 0 && (
                <span className="bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{unread}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <Link to="/login" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-surface hover:text-destructive">
          <LogOut className="size-4" strokeWidth={1.75} /> Keluar
        </Link>
      </div>
    </div>
  );
}

export function NotificationDropdown() {
  const { items, unread, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={`Notifikasi, ${unread} belum dibaca`} className="relative flex size-10 items-center justify-center border border-border hover:bg-surface">
          <Bell className="size-4" strokeWidth={1.75} />
          {unread > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center bg-primary px-1 text-[10px] font-bold text-primary-foreground">{unread}</span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-bold">Notifikasi</p>
          <button type="button" onClick={markAllRead} disabled={!unread} className="flex items-center gap-1 text-xs font-semibold text-primary disabled:text-muted-foreground">
            <CheckCheck className="size-3.5" /> Tandai semua dibaca
          </button>
        </div>
        <div className="max-h-[360px] overflow-y-auto">
          {items.map((n) => (
            <div key={n.id} className={cn("flex gap-3 border-b border-border px-4 py-3 last:border-0", !n.read && "bg-accent/50")}>
              <span className={cn("mt-1.5 size-1.5 shrink-0", n.read ? "bg-transparent" : "bg-primary")} />
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => {
                  markRead(n.id);
                  navigate({ to: "/penugasan/$id", params: { id: n.assignmentId } });
                }}
              >
                <p className="text-sm font-semibold leading-snug">{n.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{n.assignmentId} · {formatShortDate(n.at)}, {formatTime(n.at)}</p>
              </button>
              {!n.read && (
                <button type="button" onClick={() => markRead(n.id)} aria-label="Tandai dibaca" className="self-start p-1 text-muted-foreground hover:text-foreground">
                  <CheckCheck className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <Link to="/notifikasi" className="block border-t border-border px-4 py-2.5 text-center text-xs font-semibold text-primary hover:bg-surface">Lihat semua notifikasi</Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DashboardTopbar({ title, onMenu }: { title: string; onMenu: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background px-4 sm:px-6 lg:px-8">
      <button type="button" onClick={onMenu} aria-label="Buka menu" className="flex size-10 items-center justify-center border border-border lg:hidden">
        <Menu className="size-4" />
      </button>
      <h1 className="truncate text-base font-bold">{title}</h1>
      <form
        className="relative ml-auto hidden w-full max-w-[320px] md:block"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/penugasan", search: { q } });
        }}
      >
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nomor atau judul penugasan" className="h-10 bg-surface pl-9 text-sm" />
      </form>
      <div className="ml-auto flex items-center gap-3 md:ml-0">
        <NotificationDropdown />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex items-center gap-2.5 border border-transparent px-1.5 py-1 hover:border-border">
              <span className="flex size-8 items-center justify-center bg-ink text-xs font-bold text-ink-foreground">{USER.initials}</span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-bold leading-tight">{USER.name}</span>
                <span className="block text-[11px] text-muted-foreground">{USER.role}</span>
              </span>
              <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-bold">{USER.name}</p>
              <p className="text-xs font-normal text-muted-foreground">{USER.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/profil"><User /> Profil</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/bantuan"><CircleHelp /> Bantuan</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/login"><LogOut /> Keluar</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function PortalShell({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border lg:block">
        <DashboardSidebar />
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0 [&>button]:hidden">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <button type="button" onClick={() => setOpen(false)} aria-label="Tutup menu" className="absolute right-3 top-4 z-10 p-2"><X className="size-4" /></button>
          <DashboardSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="lg:pl-64">
        <DashboardTopbar title={title} onMenu={() => setOpen(true)} />
        <main className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
