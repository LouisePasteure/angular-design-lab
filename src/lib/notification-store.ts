import { useSyncExternalStore } from "react";
import { INITIAL_NOTIFICATIONS, type PortalNotification } from "./portal-data";

const KEY = "tt-notifications";
let state: PortalNotification[] = INITIAL_NOTIFICATIONS;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
  } catch {
    /* ignore */
  }
}
function set(next: PortalNotification[]) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useNotifications() {
  const items = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      if (!loaded) {
        load();
        queueMicrotask(cb);
      }
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
