import { createFileRoute, Outlet } from "@tanstack/react-router";

export interface AdminAssignmentSearch {
  q?: string | undefined;
  status?: string | undefined;
  akses?: string | undefined;
  pembayaran?: string | undefined;
  deadline?: string | undefined;
  aksi?: string | undefined;
}

export const Route = createFileRoute("/admin_/penugasan")({
  validateSearch: (search: Record<string, unknown>): AdminAssignmentSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    status: typeof search["status"] === "string" ? search["status"] : undefined,
    akses: typeof search["akses"] === "string" ? search["akses"] : undefined,
    pembayaran: typeof search["pembayaran"] === "string" ? search["pembayaran"] : undefined,
    deadline: typeof search["deadline"] === "string" ? search["deadline"] : undefined,
    aksi: typeof search["aksi"] === "string" ? search["aksi"] : undefined,
  }),
  component: Outlet,
});
