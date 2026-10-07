import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, MessageCircle, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { PortalShell } from "@/components/portal/portal-shell";
import { PaymentBadge } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/secure-generators";
import { formatDateTime } from "@/lib/portal-data";
import { useAdminStore } from "@/lib/use-admin-store";

export const Route = createFileRoute("/dashboard_/tagihan")({
  head: () => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex" }],
  }),
  component: BillingPage,
});
function BillingPage() {
  const { getAssignment, getCurrentCustomer, invoices } = useAdminStore();
  const items = invoices.filter((item) => item.customerId === getCurrentCustomer()?.id);
  return (
    <PortalShell title="Tagihan">
      <header className="border-b border-border pb-8">
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
          Finansial / Customer
        </p>
        <h2 className="mt-3 font-display text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[.94] tracking-[-.06em]">
          Tagihan<span className="text-primary">.</span>
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Lihat tagihan akhir dan status pembayaran setiap penugasan.
        </p>
      </header>
      <div className="mt-7 space-y-4">
        {items.length === 0 ? (
          <div className="border border-dashed border-border py-16 text-center">
            <ReceiptText className="mx-auto size-8 text-muted-foreground" />
            <h3 className="mt-4 font-bold">Belum ada tagihan</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Admin menerbitkan tagihan setelah pekerjaan selesai.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <article key={item.id} className="border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-primary">{item.id}</p>
                  <Link
                    to="/dashboard/penugasan/$id"
                    params={{ id: item.assignmentId }}
                    className="mt-2 block font-bold hover:text-primary"
                  >
                    {getAssignment(item.assignmentId)?.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">{item.assignmentId}</p>
                </div>
                <PaymentBadge status={item.paymentStatus} />
              </div>
              <dl className="mt-5 grid gap-3 border-y border-border py-4 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Subtotal</dt>
                  <dd className="mt-1 font-bold">{formatRupiah(item.subtotal)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Diskon</dt>
                  <dd className="mt-1 font-bold">-{formatRupiah(item.discountAmount)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Total</dt>
                  <dd className="mt-1 font-bold text-primary">{formatRupiah(item.total)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Jatuh tempo</dt>
                  <dd className="mt-1 font-bold">
                    {item.dueAt ? formatDateTime(item.dueAt) : "—"}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">
                Metode: {item.paymentMethod} · Referensi: {item.paymentReference}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toast("Invoice simulasi", {
                      description: "PDF tersedia setelah backend terhubung.",
                    })
                  }
                >
                  <Download /> Unduh invoice
                </Button>
                {item.paymentStatus !== "Lunas" && (
                  <Button size="sm" asChild>
                    <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer">
                      <MessageCircle /> Konfirmasi pembayaran
                    </a>
                  </Button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
      <p className="mt-6 text-xs leading-5 text-muted-foreground">
        Pembayaran pada prototipe ini tidak nyata dan tidak terhubung ke gateway.
      </p>
    </PortalShell>
  );
}
