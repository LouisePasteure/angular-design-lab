import { createServerFn } from "@tanstack/react-start";

export type SupabaseConnectionStatus = {
  connected: boolean;
  message: string;
};

export const checkSupabaseConnection = createServerFn({ method: "GET" }).handler(
  async (): Promise<SupabaseConnectionStatus> => {
    if (!import.meta.env.DEV) {
      return { connected: false, message: "Pemeriksaan hanya tersedia di development." };
    }

    try {
      const { createSupabaseServerClient } = await import("./server");
      const supabase = createSupabaseServerClient();
      const { error } = await supabase.from("connection_check").select("id").limit(1);

      if (error) {
        return {
          connected: false,
          message:
            "Koneksi gagal. Pastikan tabel connection_check tersedia dan dapat dibaca oleh RLS.",
        };
      }

      return {
        connected: true,
        message: "Supabase tersambung dan tabel connection_check dapat diakses.",
      };
    } catch {
      return {
        connected: false,
        message: "Koneksi Supabase belum dapat dibuat. Periksa konfigurasi server secara lokal.",
      };
    }
  },
);
