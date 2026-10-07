import "@tanstack/react-start/server-only";

import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient() {
  const url = process.env["SUPABASE_URL"];
  const secretKey = process.env["SUPABASE_SECRET_KEY"];

  if (!url) {
    throw new Error("Supabase admin client requires SUPABASE_URL.");
  }

  if (!secretKey) {
    throw new Error("Supabase admin client requires SUPABASE_SECRET_KEY.");
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
