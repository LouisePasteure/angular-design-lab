import type { Permission, WorkerRole } from "@/lib/admin-data";

export const ROLE_PERMISSIONS: Record<WorkerRole, Permission[]> = {
  "Super Admin": [
    "dashboard:view",
    "assignment:view",
    "assignment:manage",
    "assignment:own",
    "result:manage",
    "review:manage",
    "customer:manage",
    "worker:manage",
    "finance:manage",
    "report:view",
    "settings:manage",
    "audit:view",
  ],
  "Admin Operasional": [
    "dashboard:view",
    "assignment:view",
    "assignment:manage",
    "result:manage",
    "customer:manage",
  ],
  Worker: ["dashboard:view", "assignment:view", "assignment:own", "result:manage"],
  Reviewer: ["dashboard:view", "assignment:view", "review:manage"],
  Finance: ["dashboard:view", "finance:manage", "report:view"],
};
export const permissionsForRole = (role: WorkerRole) => ROLE_PERMISSIONS[role];
export const hasPermission = (permissions: Permission[], permission: Permission) =>
  permissions.includes(permission);

export interface AdminRepository {
  listAssignments(): Promise<unknown[]>;
  listWorkers(): Promise<unknown[]>;
  listInvoices(): Promise<unknown[]>;
}

// Frontend mock adapter boundary. A backend repository can replace the store without changing UI selectors.
export const mockRepositoryContract: AdminRepository = {
  async listAssignments() {
    return [];
  },
  async listWorkers() {
    return [];
  },
  async listInvoices() {
    return [];
  },
};
