import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | undefined;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const url = import.meta.env["VITE_SUPABASE_URL"];
  const publishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

  if (!url) {
    throw new Error("Supabase browser client requires VITE_SUPABASE_URL.");
  }

  if (!publishableKey) {
    throw new Error("Supabase browser client requires VITE_SUPABASE_PUBLISHABLE_KEY.");
  }

  browserClient = createBrowserClient(url, publishableKey);
  return browserClient;
}
