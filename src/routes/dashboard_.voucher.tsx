import { createFileRoute } from "@tanstack/react-router";
import { BadgePercent, Check, TicketPercent } from "lucide-react";
import { toast } from "sonner";
import { PortalShell } from "@/components/portal/portal-shell";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/portal-data";
import { formatRupiah } from "@/lib/secure-generators";
import { useAdminStore } from "@/lib/use-admin-store";

export const Route = createFileRoute("/dashboard_/voucher")({
  head: () => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex" }],
  }),
  component: VouchersPage,
});

function VouchersPage() {
  const { getCurrentCustomer, updateVoucher, vouchers } = useAdminStore();
  const customer = getCurrentCustomer();
  const today = new Date().toISOString().slice(0, 10);
  const available = vouchers.filter(
    (voucher) =>
      voucher.status === "Aktif" &&
      voucher.validFrom <= today &&
      voucher.validUntil >= today &&
      voucher.usageCount < voucher.usageLimit &&
      (!voucher.assignedCustomerIds.length ||
        voucher.assignedCustomerIds.includes(customer?.id ?? "")),
  );
  const claimed = vouchers.filter((voucher) =>
    voucher.assignedCustomerIds.includes(customer?.id ?? ""),
  );
  const claim = (id: string) => {
    const voucher = vouchers.find((item) => item.id === id);
    if (
      !voucher ||
      !customer ||
      voucher.assignedCustomerIds.includes(customer.id) ||
      voucher.usageCount >= voucher.usageLimit
    )
      return;
    updateVoucher(id, {
      assignedCustomerIds: [...voucher.assignedCustomerIds, customer.id],
      usageCount: voucher.usageCount + 1,
    });
    toast.success("Voucher berhasil diklaim");
  };
  return (
    <PortalShell title="Voucher">
      <header className="border-b border-border pb-8">
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
          Keuntungan customer
        </p>
        <h2 className="mt-3 font-display text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[.94] tracking-[-.06em]">
          Voucher<span className="text-primary">.</span>
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Klaim penawaran yang tersedia untuk akunmu.
        </p>
      </header>
      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <TicketPercent className="size-5 text-primary" />
          <h3 className="font-display text-2xl font-semibold">Tersedia</h3>
        </div>
        {available.length ? (
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 xl:grid-cols-3">
            {available.map((voucher) => (
              <article className="bg-card p-5" key={voucher.id}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {voucher.type}
                </p>
                <h4 className="mt-2 font-display text-2xl font-semibold">{voucher.name}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{voucher.description}</p>
                <p className="mt-4 text-lg font-bold">
                  {voucher.type === "Persentase"
                    ? `${voucher.value}%${voucher.maxDiscount ? ` · maks. ${formatRupiah(voucher.maxDiscount)}` : ""}`
                    : formatRupiah(voucher.value)}
                </p>
                <dl className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Minimum transaksi</dt>
                    <dd className="font-semibold">{formatRupiah(voucher.minimumTransaction)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Berlaku sampai</dt>
                    <dd className="font-semibold">
                      {formatDateTime(`${voucher.validUntil}T23:59:00`)}
                    </dd>
                  </div>
                </dl>
                <Button
                  className="mt-5 w-full"
                  variant={
                    voucher.assignedCustomerIds.includes(customer?.id ?? "") ? "outline" : "default"
                  }
                  disabled={voucher.assignedCustomerIds.includes(customer?.id ?? "")}
                  onClick={() => claim(voucher.id)}
                >
                  {voucher.assignedCustomerIds.includes(customer?.id ?? "") ? (
                    <>
                      <Check /> Sudah diklaim
                    </>
                  ) : (
                    <>
                      <BadgePercent /> Klaim voucher
                    </>
                  )}
                </Button>
              </article>
            ))}
          </div>
        ) : (
          <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Belum ada voucher yang tersedia untuk akunmu.
          </p>
        )}
      </section>
      <section className="mt-9">
        <div className="mb-4 flex items-center gap-2">
          <Check className="size-5 text-success" />
          <h3 className="font-display text-2xl font-semibold">Sudah diklaim</h3>
        </div>
        {claimed.length ? (
          <div className="border-y border-border">
            {claimed.map((voucher) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4 last:border-0"
                key={voucher.id}
              >
                <div>
                  <p className="font-semibold">{voucher.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {voucher.code} · minimum {formatRupiah(voucher.minimumTransaction)}
                  </p>
                </div>
                <span className="border border-border px-2 py-1 text-[10px] font-bold">
                  {voucher.validUntil >= today ? "Dapat digunakan" : "Kedaluwarsa"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Voucher yang kamu klaim akan tersimpan selama sesi browser ini.
          </p>
        )}
      </section>
    </PortalShell>
  );
}
