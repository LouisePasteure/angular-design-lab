import "@tanstack/react-start/server-only";

import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie, setResponseHeader } from "@tanstack/react-start/server";

export function createSupabaseServerClient() {
  const url = process.env["SUPABASE_URL"];
  const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];

  if (!url) {
    throw new Error("Supabase server client requires SUPABASE_URL.");
  }

  if (!publishableKey) {
    throw new Error("Supabase server client requires SUPABASE_PUBLISHABLE_KEY.");
  }

  const requestCookies = getCookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return Object.entries(requestCookies).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          setCookie(name, value, options);
        }

        setResponseHeader("Cache-Control", "private, no-store");
      },
    },
  });
}
