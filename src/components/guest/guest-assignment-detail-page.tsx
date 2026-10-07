import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AssignmentDetailContent } from "@/components/portal/customer-assignment-detail-page";
import { useAdminStore } from "@/lib/use-admin-store";

export function GuestAssignmentDetailPage({ id }: { id: string }) {
  const navigate = useNavigate();
  const {
    assignments,
    clearGuestAssignmentSession,
    getAssignment,
    guestAssignmentSession,
    hydrated,
  } = useAdminStore();
  const validSession =
    guestAssignmentSession &&
    guestAssignmentSession.expiresAt &&
    new Date(guestAssignmentSession.expiresAt).getTime() > Date.now();
  const mismatch = validSession && guestAssignmentSession.assignmentId !== id;
  const assignment = getAssignment(id);
  const tokenValid =
    assignment?.assignmentAccessTokenStatus === "Aktif" &&
    Boolean(assignment.assignmentAccessTokenExpiresAt) &&
    new Date(assignment.assignmentAccessTokenExpiresAt!).getTime() > Date.now();
  useEffect(() => {
    if (!hydrated) return;
    if (!validSession || mismatch || !assignment || !tokenValid) {
      clearGuestAssignmentSession();
      void navigate({ to: "/cek-penugasan", replace: true });
    }
  }, [
    assignment,
    assignments,
    clearGuestAssignmentSession,
    hydrated,
    id,
    mismatch,
    navigate,
    tokenValid,
    validSession,
  ]);
  useEffect(() => {
    if (
      !validSession ||
      !guestAssignmentSession ||
      !tokenValid ||
      !assignment?.assignmentAccessTokenExpiresAt
    )
      return;
    const delay = Math.max(
      0,
      Math.min(
        new Date(guestAssignmentSession.expiresAt).getTime(),
        new Date(assignment.assignmentAccessTokenExpiresAt).getTime(),
      ) - Date.now(),
    );
    const timer = window.setTimeout(() => {
      clearGuestAssignmentSession();
      void navigate({ to: "/cek-penugasan", replace: true });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [
    assignment?.assignmentAccessTokenExpiresAt,
    clearGuestAssignmentSession,
    guestAssignmentSession,
    navigate,
    tokenValid,
    validSession,
  ]);
  if (!hydrated || !validSession || mismatch || !assignment || !tokenValid)
    return (
      <main className="grid min-h-screen place-items-center bg-surface text-sm text-muted-foreground">
        Memeriksa akses penugasan…
      </main>
    );
  return (
    <AssignmentDetailContent
      id={id}
      mode="guest"
      onGuestExit={() => {
        clearGuestAssignmentSession();
        void navigate({ to: "/cek-penugasan" });
      }}
    />
  );
}
