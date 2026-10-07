import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { createSupabaseServerClient } = await import("@/lib/supabase/server");
          const supabase = createSupabaseServerClient();
          const { error } = await supabase.from("connection_check").select("id").limit(1);

          if (error) {
            const safeCode = /^[A-Z0-9]{1,12}$/.test(error.code ?? "") ? error.code : "UNKNOWN";
            console.error(`[health] Supabase check failed (${safeCode}).`);
            return Response.json(
              { status: "error", database: "unreachable" },
              { status: 503, headers: { "Cache-Control": "no-store" } },
            );
          }

          return Response.json(
            { status: "ok", database: "reachable" },
            { status: 200, headers: { "Cache-Control": "no-store" } },
          );
        } catch {
          console.error("[health] Supabase check could not be initialized.");
          return Response.json(
            { status: "error", database: "unreachable" },
            { status: 503, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
