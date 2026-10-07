import { createFileRoute, Outlet } from "@tanstack/react-router";

type AssignmentSearch = { q?: string | undefined; status?: string | undefined };

export const Route = createFileRoute("/dashboard_/penugasan")({
  validateSearch: (search: Record<string, unknown>): AssignmentSearch => ({
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
    status: typeof search["status"] === "string" && search["status"] ? search["status"] : undefined,
  }),
  component: Outlet,
});
