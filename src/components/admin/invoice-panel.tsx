import { useMemo, useState } from "react";
import { Banknote, CheckCircle2, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminAssignment, Invoice } from "@/lib/admin-data";
import { calculateDiscount, formatRupiah } from "@/lib/secure-generators";
import { useAdminStore } from "@/lib/use-admin-store";

export function InvoicePanel({ assignment }: { assignment: AdminAssignment }) {
  const { createInvoice, getCurrentWorker, getInvoiceForAssignment, updateInvoice, vouchers } =
    useAdminStore();
  const invoice = getInvoiceForAssignment(assignment.id);
  const [subtotal, setSubtotal] = useState(invoice?.subtotal ?? 0);
  const [voucherId, setVoucherId] = useState(invoice?.voucherId ?? "");
  const voucher = vouchers.find((item) => item.id === voucherId && item.status === "Aktif");
  const discount = useMemo(
    () =>
      voucher && subtotal >= voucher.minimumTransaction
        ? calculateDiscount(subtotal, voucher.type, voucher.value, voucher.maxDiscount)
        : 0,
    [subtotal, voucher],
  );
  const total = Math.max(0, subtotal - discount);
  const issue = () => {
    if (subtotal <= 0) {
      toast.error("Masukkan nominal tagihan");
      return;
    }
    const due = new Date();
    due.setDate(due.getDate() + 7);
    const next: Invoice = {
      id: invoice?.id ?? `INV-${Date.now().toString().slice(-6)}`,
      assignmentId: assignment.id,
      customerId: assignment.customerId,
      subtotal,
      ...(voucher ? { voucherId: voucher.id } : {}),
      discountAmount: discount,
      total,
      issuedAt: new Date().toISOString(),
      dueAt: due.toISOString(),
      paymentStatus: "Menunggu Pembayaran",
      paymentMethod: "Transfer bank (placeholder)",
      paymentReference: `8808${Date.now().toString().slice(-10)}`,
      note: "Cantumkan nomor invoice pada berita transfer.",
    };
    createInvoice(next);
    toast.success("Tagihan diterbitkan");
  };
  return (
    <section className="border border-border bg-card" data-admin-reveal>
      <header className="border-b border-border p-5">
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
          Setelah pekerjaan selesai
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold">Tagihan</h3>
      </header>
      <div className="space-y-4 p-5">
        {invoice && (
          <div className="flex items-start justify-between gap-4 border border-border p-4">
            <div>
              <p className="text-xs text-muted-foreground">{invoice.id}</p>
              <p className="mt-1 text-2xl font-bold">{formatRupiah(invoice.total)}</p>
            </div>
            <span className="border border-border px-2 py-1 text-xs font-bold">
              {invoice.paymentStatus}
            </span>
          </div>
        )}
        <label className="block space-y-1.5 text-xs font-bold">
          Subtotal
          <Input
            type="number"
            min="0"
            value={subtotal || ""}
            onChange={(event) => setSubtotal(Number(event.target.value))}
            placeholder="1500000"
          />
        </label>
        <label className="block space-y-1.5 text-xs font-bold">
          Voucher
          <select
            className="h-10 w-full border border-input bg-background px-3"
            value={voucherId}
            onChange={(event) => setVoucherId(event.target.value)}
          >
            <option value="">Tanpa voucher</option>
            {vouchers
              .filter((item) => item.status === "Aktif")
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} — {item.name}
                </option>
              ))}
          </select>
        </label>
        <dl className="space-y-2 border-y border-border py-4 text-sm">
          <div className="flex justify-between">
            <dt>Diskon</dt>
            <dd>-{formatRupiah(discount)}</dd>
          </div>
          <div className="flex justify-between font-bold">
            <dt>Total</dt>
            <dd>{formatRupiah(total)}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2">
          <Button onClick={issue}>
            <ReceiptText /> {invoice ? "Terbitkan Ulang" : "Terbitkan Tagihan"}
          </Button>
          {invoice?.paymentStatus === "Menunggu Verifikasi" && (
            <Button
              variant="outline"
              onClick={() => {
                updateInvoice(invoice.id, {
                  paymentStatus: "Lunas",
                  verifiedAt: new Date().toISOString(),
                  verifiedBy: getCurrentWorker()?.fullName ?? "Staff",
                });
                toast.success("Pembayaran diverifikasi");
              }}
            >
              <CheckCircle2 /> Verifikasi Lunas
            </Button>
          )}
        </div>
        <p className="flex gap-2 text-xs leading-5 text-muted-foreground">
          <Banknote className="mt-0.5 size-4 shrink-0" /> Pembayaran bersifat simulasi frontend.
          Tidak ada gateway atau transaksi nyata.
        </p>
      </div>
    </section>
  );
}
