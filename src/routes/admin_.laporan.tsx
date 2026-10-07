import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES, PAYMENT_STATUSES, WORK_STATUSES } from "@/lib/admin-data";
import {
  ROLE_LABELS,
  getPaidRevenue,
  getWorkerStats,
  isAssignmentLate,
  isAssignmentOnTime,
} from "@/lib/admin-selectors";
import { formatRupiah } from "@/lib/secure-generators";
import { useAdminStore } from "@/lib/use-admin-store";

export const Route = createFileRoute("/admin_/laporan")({
  head: () => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex" }],
  }),
  component: Reports,
});
const control = "h-10 border border-input bg-background px-3 text-xs";
function Reports() {
  const { assignments, customers, invoices, workers } = useAdminStore();
  const [days, setDays] = useState("30");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [role, setRole] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [payment, setPayment] = useState("");
  const [timing, setTiming] = useState("");
  const current = new Date();
  const periodStart =
    days === "custom" && fromDate
      ? new Date(`${fromDate}T00:00:00`).getTime()
      : days === "month"
        ? new Date(current.getFullYear(), current.getMonth(), 1).getTime()
        : days === "last_month"
          ? new Date(current.getFullYear(), current.getMonth() - 1, 1).getTime()
          : days === "all"
            ? 0
            : Date.now() - Number(days) * 86_400_000;
  const periodEnd =
    days === "custom" && toDate
      ? new Date(`${toDate}T23:59:59`).getTime()
      : days === "last_month"
        ? new Date(current.getFullYear(), current.getMonth(), 1).getTime() - 1
        : Number.POSITIVE_INFINITY;
  const filtered = useMemo(
    () =>
      assignments.filter(
        (item) =>
          (!periodStart || new Date(item.createdAt).getTime() >= periodStart) &&
          new Date(item.createdAt).getTime() <= periodEnd &&
          (!workerId || item.primaryWorkerId === workerId) &&
          (!role || workers.find((worker) => worker.id === item.primaryWorkerId)?.role === role) &&
          (!category || item.category === category) &&
          (!status || item.workStatus === status) &&
          (!timing || (timing === "on_time" ? isAssignmentOnTime(item) : isAssignmentLate(item))) &&
          (!payment ||
            (invoices.find((invoice) => invoice.assignmentId === item.id)?.paymentStatus ??
              "Belum Ditagihkan") === payment),
      ),
    [
      assignments,
      category,
      invoices,
      payment,
      periodEnd,
      periodStart,
      role,
      status,
      timing,
      workerId,
      workers,
    ],
  );
  const filteredInvoices = invoices.filter((invoice) =>
    filtered.some((item) => item.id === invoice.assignmentId),
  );
  const completed = filtered.filter((item) => item.workStatus === "Selesai");
  const late = filtered.filter((item) => isAssignmentLate(item));
  const revenue = getPaidRevenue(filteredInvoices);
  const unpaidRevenue = filteredInvoices
    .filter((item) => item.paymentStatus !== "Lunas")
    .reduce((sum, item) => sum + item.total, 0);
  const totalInvoice = filteredInvoices.reduce((sum, item) => sum + item.total, 0);
  const discount = filteredInvoices.reduce((sum, item) => sum + item.discountAmount, 0);
  const onTime = completed.filter(isAssignmentOnTime).length;
  const averageCompletionDays = completed
    .filter((item) => item.startedAt && item.completedAt)
    .reduce(
      (sum, item, _, values) =>
        sum +
        (new Date(item.completedAt!).getTime() - new Date(item.startedAt!).getTime()) /
          86_400_000 /
          values.length,
      0,
    );
  const workerRows = workers
    .filter((worker) => !worker.deletedAt)
    .map((worker) => ({ worker, stats: getWorkerStats(worker, filtered, filteredInvoices) }));
  const chartData = ["Draft", "Sedang Dikerjakan", "Menunggu Review", "Selesai"].map((label) => ({
    label,
    jumlah: filtered.filter((item) => item.workStatus === label).length,
  }));
  const revenueData = filteredInvoices.map((invoice) => ({
    label: invoice.issuedAt?.slice(5, 10) ?? invoice.id,
    lunas: invoice.paymentStatus === "Lunas" ? invoice.total : 0,
    belumLunas: invoice.paymentStatus === "Lunas" ? 0 : invoice.total,
  }));
  const exportCsv = () => {
    const rows = [
      [
        "Worker",
        "Diterima",
        "Selesai",
        "Aktif",
        "Terlambat",
        "Completion",
        "On-time",
        "Pendapatan lunas",
        "Belum lunas",
      ],
      ...workerRows.map(({ worker, stats }) => [
        worker.fullName,
        stats.total,
        stats.completed,
        stats.active,
        stats.late,
        `${stats.completionRate}%`,
        `${stats.onTimeRate}%`,
        stats.revenue,
        stats.unpaid,
      ]),
    ];
    const blob = new Blob(
      [
        rows
          .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
          .join("\n"),
      ],
      { type: "text/csv;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "laporan-jokitugass.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <AdminShell title="Laporan">
      <AdminPageHeader
        eyebrow="Analitik / Operasional"
        title="Laporan"
        description="Kinerja operasional dan pendapatan bisnis dari invoice yang telah diverifikasi."
        actions={
          <Button onClick={exportCsv}>
            <Download /> Export CSV
          </Button>
        }
      />
      <section className="mt-7 grid gap-3 border border-border bg-card p-4 sm:grid-cols-2 xl:grid-cols-7">
        <select className={control} value={days} onChange={(e) => setDays(e.target.value)}>
          <option value="1">Hari ini</option>
          <option value="7">7 hari</option>
          <option value="30">30 hari</option>
          <option value="month">Bulan ini</option>
          <option value="last_month">Bulan lalu</option>
          <option value="custom">Custom</option>
          <option value="all">Semua periode</option>
        </select>
        {days === "custom" && (
          <>
            <Input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              aria-label="Tanggal mulai laporan"
            />
            <Input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              aria-label="Tanggal akhir laporan"
            />
          </>
        )}
        <select className={control} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Semua role</option>
          {ROLE_LABELS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select className={control} value={workerId} onChange={(e) => setWorkerId(e.target.value)}>
          <option value="">Semua worker</option>
          {workers.map((item) => (
            <option key={item.id} value={item.id}>
              {item.fullName}
            </option>
          ))}
        </select>
        <select className={control} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Semua kategori</option>
          {CATEGORIES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select className={control} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua status</option>
          {WORK_STATUSES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select className={control} value={payment} onChange={(e) => setPayment(e.target.value)}>
          <option value="">Semua pembayaran</option>
          {PAYMENT_STATUSES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select className={control} value={timing} onChange={(e) => setTiming(e.target.value)}>
          <option value="">Semua ketepatan</option>
          <option value="on_time">Tepat waktu</option>
          <option value="late">Terlambat</option>
        </select>
      </section>
      <section className="mt-6 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4 xl:grid-cols-6">
        {[
          ["Dibuat", filtered.length],
          ["Selesai", completed.length],
          ["Aktif", filtered.length - completed.length],
          ["Terlambat", late.length],
          [
            "Completion",
            `${filtered.length ? Math.round((completed.length / filtered.length) * 100) : 0}%`,
          ],
          ["Pendapatan lunas", formatRupiah(revenue)],
          ["Belum lunas", formatRupiah(unpaidRevenue)],
          ["Nilai invoice", formatRupiah(totalInvoice)],
          ["Total diskon", formatRupiah(discount)],
          [
            "On-time rate",
            `${completed.length ? Math.round((onTime / completed.length) * 100) : 0}%`,
          ],
          ["Rata-rata selesai", `${averageCompletionDays.toFixed(1)} hari`],
          ["Customer aktif", customers.filter((item) => item.accountStatus === "Aktif").length],
        ].map(([label, value]) => (
          <div className="bg-card p-4" key={label}>
            <p className="font-display text-2xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="border border-border bg-card p-5">
          <h3 className="font-display text-2xl font-semibold">Distribusi status</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="jumlah" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="border border-border bg-card p-5">
          <h3 className="font-display text-2xl font-semibold">Tren invoice</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value) => formatRupiah(Number(value))} />
                <Legend />
                <Line dataKey="lunas" stroke="#16a34a" />
                <Line dataKey="belumLunas" stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <section className="mt-6 overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[1050px] text-left text-xs">
          <thead>
            <tr>
              {[
                "Worker",
                "Diterima",
                "Selesai",
                "Aktif",
                "Terlambat",
                "Completion",
                "On-time",
                "Pendapatan",
                "Belum lunas",
                "Kontribusi",
              ].map((h) => (
                <th className="p-3" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workerRows.map(({ worker, stats }) => (
              <tr className="border-t border-border" key={worker.id}>
                <td className="p-3 font-bold">{worker.fullName}</td>
                <td className="p-3">{stats.total}</td>
                <td className="p-3">{stats.completed}</td>
                <td className="p-3">{stats.active}</td>
                <td className="p-3">{stats.late}</td>
                <td className="p-3">{stats.completionRate}%</td>
                <td className="p-3">{stats.onTimeRate}%</td>
                <td className="p-3">{formatRupiah(stats.revenue)}</td>
                <td className="p-3">{formatRupiah(stats.unpaid)}</td>
                <td className="p-3">
                  {revenue ? Math.round((stats.revenue / revenue) * 100) : 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
