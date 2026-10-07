import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Search, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AdminConfirmationDialog } from "@/components/admin/admin-confirmation-dialog";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader, PaymentBadge } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/secure-generators";
import { useAdminStore } from "@/lib/use-admin-store";
import { formatDateTime } from "@/lib/portal-data";

export const Route = createFileRoute("/admin_/pembayaran")({
  head: () => ({ meta: [{ title: "jokitugass" }] }),
  component: PaymentsPage,
});
function PaymentsPage() {
  const { getAssignment, getCurrentWorker, getCustomer, invoices, updateInvoice } = useAdminStore();
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState<{ id: string; action: "Lunas" | "Gagal" } | null>(null);
  const items = invoices.filter((item) => {
    const assignment = getAssignment(item.assignmentId);
    const customer = getCustomer(item.customerId);
    return `${item.id} ${item.assignmentId} ${assignment?.title ?? ""} ${customer?.username ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase());
  });
  const apply = () => {
    if (!confirm) return;
    updateInvoice(
      confirm.id,
      confirm.action === "Lunas"
        ? {
            paymentStatus: "Lunas",
            verifiedAt: new Date().toISOString(),
            verifiedBy: getCurrentWorker()?.fullName ?? "Staff",
          }
        : { paymentStatus: "Gagal" },
    );
    toast.success(confirm.action === "Lunas" ? "Pembayaran diverifikasi" : "Pembayaran ditolak");
  };
  return (
    <AdminShell title="Pembayaran">
      <AdminPageHeader
        eyebrow="Finansial / Mock"
        title="Pembayaran"
        description="Terbitkan, periksa, dan verifikasi tagihan akhir tanpa gateway pembayaran nyata."
      />
      <label className="relative mt-7 block max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Invoice, ID penugasan, judul, atau username"
        />
      </label>
      <div className="mt-5 overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[980px] text-left text-xs">
          <thead className="border-b border-border bg-surface text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              {["Invoice", "Customer", "Penugasan", "Terbit", "Total", "Status", "Aksi"].map(
                (item) => (
                  <th key={item} className="p-3">
                    {item}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="p-3 font-bold text-primary">{item.id}</td>
                <td className="p-3 font-semibold">@{getCustomer(item.customerId)?.username}</td>
                <td className="p-3">
                  <Link
                    to="/admin/penugasan/$id"
                    params={{ id: item.assignmentId }}
                    className="font-bold"
                  >
                    {item.assignmentId}
                  </Link>
                  <p className="mt-1 text-muted-foreground">
                    {getAssignment(item.assignmentId)?.title}
                  </p>
                </td>
                <td className="p-3">{item.issuedAt ? formatDateTime(item.issuedAt) : "—"}</td>
                <td className="p-3 font-bold">{formatRupiah(item.total)}</td>
                <td className="p-3">
                  <PaymentBadge status={item.paymentStatus} />
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={item.paymentStatus === "Lunas"}
                      onClick={() => setConfirm({ id: item.id, action: "Lunas" })}
                    >
                      <CheckCircle2 /> Verifikasi
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={item.paymentStatus === "Lunas"}
                      onClick={() => setConfirm({ id: item.id, action: "Gagal" })}
                    >
                      <XCircle /> Tolak
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminConfirmationDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.action === "Lunas" ? "Verifikasi pembayaran?" : "Tolak pembayaran?"}
        description={
          confirm?.action === "Lunas"
            ? "Status invoice menjadi Lunas. Akses hasil tetap harus dibuka terpisah setelah semua prasyarat terpenuhi."
            : "Status invoice menjadi Gagal dan customer harus menghubungi admin."
        }
        confirmLabel="Konfirmasi"
        destructive={confirm?.action === "Gagal"}
        onConfirm={apply}
      />
    </AdminShell>
  );
}
