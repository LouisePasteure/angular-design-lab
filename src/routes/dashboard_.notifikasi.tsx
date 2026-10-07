import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CheckCheck } from "lucide-react";
import { PortalShell } from "@/components/portal/portal-shell";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/lib/notification-store";
import { formatShortDate, formatTime } from "@/lib/portal-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard_/notifikasi")({
  head: () => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex" }],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { items, unread, markRead, markAllRead } = useNotifications();

  return (
    <PortalShell title="Notifikasi">
      <header className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            03 / Pembaruan
          </p>
          <h2 className="mt-3 font-display text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
            Notifikasi<span className="text-primary">.</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">{unread} pembaruan belum dibaca.</p>
        </div>
        <Button variant="outline" onClick={markAllRead} disabled={unread === 0}>
          <CheckCheck /> Tandai semua sudah dibaca
        </Button>
      </header>

      <section className="mt-7 border-t border-border" aria-live="polite">
        {items.map((notification) => (
          <article
            key={notification.id}
            className={cn(
              "grid gap-4 border-b border-border py-5 transition-colors sm:grid-cols-[24px_1fr_auto] sm:items-center",
              !notification.read && "bg-primary/[0.035]",
            )}
          >
            <span
              className={cn("ml-1 size-2", notification.read ? "bg-border" : "bg-primary")}
              aria-label={notification.read ? "Sudah dibaca" : "Belum dibaca"}
            />
            <div>
              <p className="text-sm font-bold">{notification.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {notification.assignmentId} · {formatShortDate(notification.at)},{" "}
                {formatTime(notification.at)} WIB
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {!notification.read && (
                <button
                  type="button"
                  onClick={() => markRead(notification.id)}
                  className="min-h-11 border border-border px-3 text-xs font-bold hover:border-primary hover:text-primary"
                >
                  Tandai dibaca
                </button>
              )}
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard/penugasan/$id" params={{ id: notification.assignmentId }}>
                  Lihat penugasan
                </Link>
              </Button>
            </div>
          </article>
        ))}
        {items.length === 0 && (
          <div className="py-20 text-center">
            <Bell className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-4 font-bold">Belum ada notifikasi</p>
          </div>
        )}
      </section>
    </PortalShell>
  );
}
