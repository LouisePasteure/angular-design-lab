import { createFileRoute, Outlet } from "@tanstack/react-router";

type Search = { q?: string; status?: string };

export const Route = createFileRoute("/penugasan")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
    status: typeof s.status === "string" && s.status ? s.status : undefined,
  }),
  component: () => <Outlet />,
});
