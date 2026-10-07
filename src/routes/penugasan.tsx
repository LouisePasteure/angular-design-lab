import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/penugasan")({
  beforeLoad: () => {
    throw redirect({ to: "/cek-penugasan" });
  },
});
