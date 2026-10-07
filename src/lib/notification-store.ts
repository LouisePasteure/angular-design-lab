import { useSyncExternalStore } from "react";
import { INITIAL_NOTIFICATIONS, type PortalNotification } from "./portal-data";

let state: PortalNotification[] = INITIAL_NOTIFICATIONS;
const listeners = new Set<() => void>();

function set(next: PortalNotification[]) {
  state = next;
  listeners.forEach((l) => l());
}

export function useNotifications() {
  const items = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => INITIAL_NOTIFICATIONS,
  );
  return {
    items,
    unread: items.filter((n) => !n.read).length,
    markRead: (id: string) => set(state.map((n) => (n.id === id ? { ...n, read: true } : n))),
    markAllRead: () => set(state.map((n) => ({ ...n, read: true }))),
  };
}
