import { useEffect, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAdminStore } from "@/lib/use-admin-store";
import type { Permission } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";

function GuardLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-surface text-sm text-muted-foreground">
      Memeriksa sesi…
    </main>
  );
}

export function AdminRouteGuard({ children }: { children: ReactNode }) {
  const { getAssignment, getCurrentWorker, hydrated, session } = useAdminStore();
  const navigate = useNavigate();
  const path = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => {
    if (!hydrated || session?.role === "admin") return;
    void navigate({
      to: session?.role === "customer" ? "/dashboard" : "/admin/login",
      replace: true,
    });
  }, [hydrated, navigate, session]);
  if (!hydrated || session?.role !== "admin") return <GuardLoading />;
  const currentWorker = getCurrentWorker();
  if (currentWorker?.credentialStatus === "Password Sementara" && path !== "/admin/profil")
    return (
      <main className="grid min-h-screen place-items-center bg-surface p-5">
        <div className="max-w-lg border border-border bg-card p-8 text-center">
          <h1 className="font-display text-3xl font-semibold">Password perlu diperbarui.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Akun menggunakan password sementara. Buat password baru sebelum membuka workspace.
          </p>
          <Button className="mt-5" asChild>
            <Link to="/admin/profil">Buka profil staff</Link>
          </Button>
        </div>
      </main>
    );
  const rules: Array<[RegExp, Permission]> = [
    [/^\/admin\/worker/, "worker:manage"],
    [/^\/admin\/customer/, "customer:manage"],
    [/^\/admin\/pembayaran/, "finance:manage"],
    [/^\/admin\/voucher/, "finance:manage"],
    [/^\/admin\/laporan/, "report:view"],
    [/^\/admin\/aktivitas/, "audit:view"],
    [/^\/admin\/pengaturan/, "settings:manage"],
    [/^\/admin\/penugasan\/baru/, "assignment:manage"],
    [/^\/admin\/penugasan/, "assignment:view"],
  ];
  const needed = rules.find(([pattern]) => pattern.test(path))?.[1];
  const detailId = path.match(/^\/admin\/penugasan\/(TT-[^/]+)$/)?.[1];
  const assignment = detailId ? getAssignment(detailId) : undefined;
  const restrictedAssignment =
    detailId &&
    session.workerRole === "Worker" &&
    assignment &&
    assignment.primaryWorkerId !== session.workerId &&
    !assignment.supportingWorkerIds.includes(session.workerId);
  const restrictedReview =
    detailId &&
    session.workerRole === "Reviewer" &&
    assignment?.reviewerWorkerId !== session.workerId;
  if ((needed && !session.permissions.includes(needed)) || restrictedAssignment || restrictedReview)
    return (
      <main className="grid min-h-screen place-items-center bg-surface p-5">
        <div className="max-w-lg border border-border bg-card p-8 text-center">
          <h1 className="font-display text-3xl font-semibold">Akses dibatasi.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Role {session.workerRole} tidak memiliki permission untuk halaman atau data ini.
          </p>
          <Button className="mt-5" asChild>
            <Link to="/admin">Kembali ke ringkasan</Link>
          </Button>
        </div>
      </main>
    );
  return children;
}

export function PermissionGuard({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const { session } = useAdminStore();
  if (session?.role !== "admin" || !session.permissions.includes(permission)) return null;
  return children;
}

export function CustomerRouteGuard({ children }: { children: ReactNode }) {
  const { hydrated, session } = useAdminStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!hydrated || (session?.role === "customer" && !session.pendingActivation)) return;
    const target =
      session?.role === "admin" ? "/admin" : session?.role === "customer" ? "/aktivasi" : "/login";
    void navigate({ to: target, replace: true });
  }, [hydrated, navigate, session]);
  if (!hydrated || session?.role !== "customer" || session.pendingActivation)
    return <GuardLoading />;
  return children;
}
