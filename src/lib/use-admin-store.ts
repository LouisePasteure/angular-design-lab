import { useContext } from "react";
import { AdminStoreContext } from "@/lib/admin-store-context";

export function useAdminStore() {
  const value = useContext(AdminStoreContext);
  if (!value) throw new Error("useAdminStore harus digunakan di dalam AdminStoreProvider");
  return value;
}
