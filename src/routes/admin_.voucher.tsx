import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Copy, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Voucher, VoucherType } from "@/lib/admin-data";
import { formatRupiah, generateVoucherCode } from "@/lib/secure-generators";
import { useAdminStore } from "@/lib/use-admin-store";

export const Route = createFileRoute("/admin_/voucher")({
  head: () => ({ meta: [{ title: "jokitugass" }] }),
  component: VoucherPage,
});
function VoucherPage() {
  const { createVoucher, getCurrentWorker, vouchers } = useAdminStore();
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    type: "Persentase" as VoucherType,
    value: 10,
    maxDiscount: 200000,
    minimum: 500000,
    validFrom: "2026-10-04",
    validUntil: "2026-12-31",
    limit: 10,
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.code || !form.name || form.value <= 0 || form.validUntil < form.validFrom) {
      toast.error("Periksa kembali data voucher");
      return;
    }
    const item: Voucher = {
      id: `VC-${String(vouchers.length + 1).padStart(3, "0")}`,
      code: form.code.toUpperCase(),
      name: form.name,
      description: form.description,
      type: form.type,
      value: form.value,
      ...(form.type === "Persentase" ? { maxDiscount: form.maxDiscount } : {}),
      minimumTransaction: form.minimum,
      validFrom: form.validFrom,
      validUntil: form.validUntil,
      assignedCustomerIds: [],
      usageLimit: form.limit,
      usageCount: 0,
      status: new Date(form.validFrom) > new Date() ? "Terjadwal" : "Aktif",
      createdBy: getCurrentWorker()?.fullName ?? "Staff",
      createdAt: new Date().toISOString(),
      internalNote: "",
    };
    createVoucher(item);
    toast.success("Voucher dibuat");
  };
  return (
    <AdminShell title="Voucher & Diskon">
      <AdminPageHeader
        eyebrow="Finansial / Promo"
        title="Voucher & Diskon"
        description="Kelola potongan yang diterapkan admin pada invoice akhir."
      />
      <div className="mt-7 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <form className="space-y-4 border border-border bg-card p-5" onSubmit={submit}>
          <h3 className="font-display text-2xl font-semibold">Buat voucher</h3>
          <label className="block space-y-1.5 text-xs font-bold">
            Kode
            <div className="flex gap-2">
              <Input
                value={form.code}
                onChange={(event) => setForm((value) => ({ ...value, code: event.target.value }))}
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() =>
                  setForm((value) => ({ ...value, code: generateVoucherCode(value.name) }))
                }
                aria-label="Generate kode"
              >
                <Sparkles />
              </Button>
            </div>
          </label>
          <label className="block space-y-1.5 text-xs font-bold">
            Nama
            <Input
              required
              value={form.name}
              onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
            />
          </label>
          <label className="block space-y-1.5 text-xs font-bold">
            Deskripsi
            <Textarea
              rows={2}
              value={form.description}
              onChange={(event) =>
                setForm((value) => ({ ...value, description: event.target.value }))
              }
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5 text-xs font-bold">
              Tipe
              <select
                className="h-10 w-full border border-input bg-background px-3"
                value={form.type}
                onChange={(event) =>
                  setForm((value) => ({ ...value, type: event.target.value as VoucherType }))
                }
              >
                <option>Persentase</option>
                <option>Nominal Tetap</option>
              </select>
            </label>
            <label className="block space-y-1.5 text-xs font-bold">
              Nilai
              <Input
                type="number"
                min="1"
                value={form.value}
                onChange={(event) =>
                  setForm((value) => ({ ...value, value: Number(event.target.value) }))
                }
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5 text-xs font-bold">
              Mulai
              <Input
                type="date"
                value={form.validFrom}
                onChange={(event) =>
                  setForm((value) => ({ ...value, validFrom: event.target.value }))
                }
              />
            </label>
            <label className="block space-y-1.5 text-xs font-bold">
              Berakhir
              <Input
                type="date"
                value={form.validUntil}
                onChange={(event) =>
                  setForm((value) => ({ ...value, validUntil: event.target.value }))
                }
              />
            </label>
          </div>
          <Button className="w-full">
            <Plus /> Buat Voucher
          </Button>
        </form>
        <section className="border border-border bg-card">
          <header className="border-b border-border p-5">
            <h3 className="font-display text-2xl font-semibold">Voucher tersedia</h3>
          </header>
          <div className="divide-y divide-border">
            {vouchers.map((item) => (
              <article key={item.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-primary">{item.code}</p>
                    <h4 className="mt-2 font-bold">{item.name}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <span className="border border-border px-2 py-1 text-xs font-bold">
                    {item.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground">Nilai</p>
                    <p className="mt-1 font-bold">
                      {item.type === "Persentase" ? `${item.value}%` : formatRupiah(item.value)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Minimum</p>
                    <p className="mt-1 font-bold">{formatRupiah(item.minimumTransaction)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Periode</p>
                    <p className="mt-1 font-bold">
                      {item.validFrom}—{item.validUntil}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pemakaian</p>
                    <p className="mt-1 font-bold">
                      {item.usageCount}/{item.usageLimit}
                    </p>
                  </div>
                </div>
                <Button
                  className="mt-4"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard.writeText(item.code);
                    toast.success("Kode voucher disalin");
                  }}
                >
                  <Copy /> Salin kode
                </Button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
