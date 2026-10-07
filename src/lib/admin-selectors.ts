import type { AdminAssignment, Customer, Invoice, Worker, WorkerRole } from "@/lib/admin-data";

export const NOW = new Date("2026-10-05T09:00:00+07:00");
export const isAssignmentActive = (item: AdminAssignment) =>
  item.workStatus === "Sedang Dikerjakan" || item.workStatus === "Menunggu Review";
export const isAssignmentLate = (item: AdminAssignment, reference = NOW) =>
  item.completedAt
    ? new Date(item.completedAt) > new Date(item.deadline)
    : new Date(item.deadline) < reference;
export const isAssignmentOnTime = (item: AdminAssignment) =>
  Boolean(item.completedAt && new Date(item.completedAt) <= new Date(item.deadline));

export function getCustomerStats(
  customer: Customer,
  assignments: AdminAssignment[],
  invoices: Invoice[],
  feedbackCount: number,
) {
  const own = assignments.filter((item) => item.customerId === customer.id);
  const bills = invoices.filter((item) => item.customerId === customer.id);
  return {
    total: own.length,
    active: own.filter(isAssignmentActive).length,
    review: own.filter((item) => item.workStatus === "Menunggu Review").length,
    completed: own.filter((item) => item.workStatus === "Selesai").length,
    late: own.filter((item) => isAssignmentLate(item)).length,
    paymentPending: bills.filter(
      (item) => !["Lunas", "Belum Ditagihkan"].includes(item.paymentStatus),
    ).length,
    paid: bills.filter((item) => item.paymentStatus === "Lunas").length,
    accessible: own.filter((item) => item.accessStatus === "Dapat Diakses").length,
    feedback: feedbackCount,
    activeDays: customer.activatedAt
      ? Math.max(
          1,
          Math.floor((NOW.getTime() - new Date(customer.activatedAt).getTime()) / 86_400_000),
        )
      : 0,
  };
}

export function getWorkerAssignments(workerId: string, assignments: AdminAssignment[]) {
  return assignments.filter(
    (item) =>
      item.primaryWorkerId === workerId ||
      item.reviewerWorkerId === workerId ||
      item.supportingWorkerIds.includes(workerId),
  );
}

export function getWorkerStats(
  worker: Worker,
  assignments: AdminAssignment[],
  invoices: Invoice[],
) {
  const own = getWorkerAssignments(worker.id, assignments);
  const primary = own.filter((item) => item.primaryWorkerId === worker.id);
  const completed = primary.filter((item) => item.workStatus === "Selesai");
  const active = primary.filter(isAssignmentActive);
  const onTime = completed.filter(isAssignmentOnTime).length;
  const withDuration = completed.filter((item) => item.startedAt && item.completedAt);
  const revenueInvoices = invoices.filter((invoice) => invoice.revenueWorkerId === worker.id);
  return {
    total: primary.length,
    active: active.length,
    review: primary.filter((item) => item.workStatus === "Menunggu Review").length,
    completed: completed.length,
    late: primary.filter((item) => isAssignmentLate(item)).length,
    completionRate: primary.length ? Math.round((completed.length / primary.length) * 100) : 0,
    onTimeRate: completed.length ? Math.round((onTime / completed.length) * 100) : 0,
    averageCompletionDays: withDuration.length
      ? withDuration.reduce(
          (sum, item) =>
            sum +
            (new Date(item.completedAt!).getTime() - new Date(item.startedAt!).getTime()) /
              86_400_000,
          0,
        ) / withDuration.length
      : 0,
    revenue: revenueInvoices
      .filter((item) => item.paymentStatus === "Lunas")
      .reduce((sum, item) => sum + item.total, 0),
    unpaid: revenueInvoices
      .filter((item) => item.paymentStatus !== "Lunas")
      .reduce((sum, item) => sum + item.total, 0),
    capacity: worker.maxActiveAssignments ? active.length / worker.maxActiveAssignments : 0,
  };
}

export const getPaidRevenue = (invoices: Invoice[]) =>
  invoices
    .filter((item) => item.paymentStatus === "Lunas")
    .reduce((sum, item) => sum + item.total, 0);

export const ROLE_LABELS: WorkerRole[] = [
  "Super Admin",
  "Admin Operasional",
  "Worker",
  "Reviewer",
  "Finance",
];
