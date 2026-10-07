import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileUp, Search, X } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type RevisionRequest, type RevisionStatus } from "@/lib/admin-data";
import { useAdminStore } from "@/lib/use-admin-store";
import { formatDateTime } from "@/lib/portal-data";

export const Route = createFileRoute("/admin_/revisi")({
  head: () => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminRevisionPage,
});

const STATUSES: RevisionStatus[] = [
  "Baru",
  "Ditinjau",
  "Dikerjakan",
  "Menunggu Review",
  "Selesai",
  "Ditolak",
];
const control =
  "h-10 border border-input bg-background px-3 text-xs outline-none focus:border-primary";

function RevisionDetail({
  item,
  open,
  onOpenChange,
}: {
  item: RevisionRequest | null;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const { getCustomer, updateRevision, workers } = useAdminStore();
  const [status, setStatus] = useState<RevisionStatus>(item?.status ?? "Baru");
  const [workerId, setWorkerId] = useState(item?.workerId ?? "");
  const [note, setNote] = useState(item?.internalNote ?? "");
  const [file, setFile] = useState<File | null>(null);
  if (!item) return null;
  const save = () => {
    updateRevision(item.id, { status, workerId, internalNote: note });
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
            {item.id} / {item.assignmentId}
          </p>
          <DialogTitle className="font-display text-3xl">Detail Permintaan Revisi</DialogTitle>
          <DialogDescription>
            Periksa kebutuhan client dan perbarui tindak lanjut tim.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 sm:grid-cols-2">
          <dl className="space-y-4 text-xs">
            <div>
              <dt className="text-muted-foreground">Client</dt>
              <dd className="mt-1 font-bold">@{getCustomer(item.customerId)?.username}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">File yang direvisi</dt>
              <dd className="mt-1 font-bold">{item.file}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Jenis revisi</dt>
              <dd className="mt-1 font-bold">{item.type}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tanggal masuk</dt>
              <dd className="mt-1 font-bold">{formatDateTime(item.receivedAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Batas waktu</dt>
              <dd className="mt-1 font-bold text-status-warning">
                {formatDateTime(item.deadline)}
              </dd>
            </div>
          </dl>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold">Pesan client</p>
              <p className="mt-2 border border-border bg-surface p-3 text-xs leading-5">
                {item.message}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold">File pendukung</p>
              <Button variant="outline" size="sm" className="mt-2">
                {item.support}
              </Button>
            </div>
          </div>
        </div>
        <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
          <label className="space-y-1.5 text-xs font-bold">
            Status
            <select
              className={`${control} w-full`}
              value={status}
              onChange={(e) => setStatus(e.target.value as RevisionStatus)}
            >
              {STATUSES.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-bold">
            Penanggung jawab
            <select
              className={`${control} w-full`}
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
            >
              <option value="">Belum ditentukan</option>
              {workers
                .filter((worker) => worker.status === "Aktif")
                .map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.fullName}
                  </option>
                ))}
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-bold sm:col-span-2">
            Internal note <span className="font-normal text-muted-foreground">— admin saja</span>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <label className="space-y-1.5 text-xs font-bold sm:col-span-2">
            Upload file revisi
            <input
              type="file"
              className="block min-h-11 w-full border border-input p-2 text-xs"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && (
              <span className="flex items-center gap-2 text-success">
                <FileUp className="size-3.5" /> {file.name}
              </span>
            )}
          </label>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              updateRevision(item.id, { status: "Ditolak" });
              onOpenChange(false);
            }}
          >
            Tolak Revisi
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              updateRevision(item.id, { status: "Dikerjakan" });
              onOpenChange(false);
            }}
          >
            Terima &amp; Kerjakan
          </Button>
          <Button onClick={save}>Simpan Perubahan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdminRevisionPage() {
  const { getCustomer, getWorker, revisions } = useAdminStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("terbaru");
  const [active, setActive] = useState<RevisionRequest | null>(null);
  const items = useMemo(
    () =>
      revisions
        .filter(
          (item) =>
            (!query ||
              `${item.id} ${item.assignmentId} ${getCustomer(item.customerId)?.username ?? ""} ${item.message}`
                .toLowerCase()
                .includes(query.toLowerCase())) &&
            (!status || item.status === status),
        )
        .sort((a, b) =>
          sort === "deadline"
            ? a.deadline.localeCompare(b.deadline)
            : b.receivedAt.localeCompare(a.receivedAt),
        ),
    [getCustomer, revisions, query, status, sort],
  );
  return (
    <AdminShell title="Permintaan Revisi">
      <AdminPageHeader
        eyebrow="Operasional / Revisi"
        title="Permintaan Revisi"
        description="Tinjau pesan client, tentukan penanggung jawab, dan pantau penyelesaian revisi."
      />
      <div
        className="mt-6 grid gap-3 border border-border bg-card p-4 sm:grid-cols-[1fr_180px_180px_auto]"
        data-admin-intro
      >
        <label className="relative">
          <span className="sr-only">Cari revisi</span>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 pl-9"
            placeholder="Cari ID, client, atau pesan"
          />
        </label>
        <select
          className={control}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter status"
        >
          <option value="">Semua status</option>
          {STATUSES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          className={control}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Urutkan"
        >
          <option value="terbaru">Terbaru</option>
          <option value="deadline">Deadline terdekat</option>
        </select>
        <Button
          variant="outline"
          onClick={() => {
            setQuery("");
            setStatus("");
          }}
        >
          <X /> Reset
        </Button>
      </div>
      <div className="mt-5 hidden overflow-x-auto border border-border bg-card md:block">
        <table className="w-full min-w-[1200px] text-left text-xs">
          <thead className="border-b border-border bg-surface text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              {[
                "ID Revisi",
                "Penugasan",
                "Client",
                "File / Jenis",
                "Pesan",
                "File pendukung",
                "Tanggal masuk",
                "Batas waktu",
                "Status",
                "Penanggung jawab",
                "Aksi",
              ].map((head) => (
                <th key={head} className="p-3">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0 hover:bg-surface">
                <td className="p-3 font-bold text-primary">{item.id}</td>
                <td className="p-3">
                  <Link
                    to="/admin/penugasan/$id"
                    params={{ id: item.assignmentId }}
                    className="font-bold"
                  >
                    {item.assignmentId}
                  </Link>
                </td>
                <td className="p-3 font-semibold">@{getCustomer(item.customerId)?.username}</td>
                <td className="p-3">
                  <p className="max-w-40 truncate font-semibold">{item.file}</p>
                  <p className="mt-1 text-muted-foreground">{item.type}</p>
                </td>
                <td className="max-w-56 p-3">
                  <p className="line-clamp-2">{item.message}</p>
                </td>
                <td className="p-3">{item.support}</td>
                <td className="p-3">{formatDateTime(item.receivedAt)}</td>
                <td className="p-3 font-semibold text-status-warning">
                  {formatDateTime(item.deadline)}
                </td>
                <td className="p-3">
                  <span className="border border-primary/30 px-2 py-1 font-bold text-primary">
                    {item.status}
                  </span>
                </td>
                <td className="p-3 font-semibold">
                  {item.workerId
                    ? (getWorker(item.workerId)?.fullName ?? "Tidak ditemukan")
                    : "Belum ditentukan"}
                </td>
                <td className="p-3">
                  <Button size="sm" variant="outline" onClick={() => setActive(item)}>
                    Tinjau
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 space-y-3 md:hidden">
        {items.map((item) => (
          <article key={item.id} className="border border-border bg-card p-4">
            <div className="flex justify-between gap-3">
              <p className="text-xs font-bold text-primary">{item.id}</p>
              <span className="border border-primary/30 px-2 py-1 text-[10px] font-bold text-primary">
                {item.status}
              </span>
            </div>
            <h3 className="mt-3 font-bold">@{getCustomer(item.customerId)?.username}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.assignmentId} · {item.file}
            </p>
            <p className="mt-4 text-xs leading-5">{item.message}</p>
            <p className="mt-3 text-xs font-semibold text-status-warning">
              Batas: {formatDateTime(item.deadline)}
            </p>
            <Button className="mt-4 w-full" variant="outline" onClick={() => setActive(item)}>
              Tinjau Permintaan
            </Button>
          </article>
        ))}
      </div>
      {items.length === 0 && (
        <div className="mt-5 border border-dashed border-border py-16 text-center">
          <h3 className="font-bold">Tidak ada permintaan revisi</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Tidak ada data yang cocok dengan filter saat ini.
          </p>
        </div>
      )}
      <RevisionDetail
        key={active?.id ?? "none"}
        item={active}
        open={Boolean(active)}
        onOpenChange={(value) => !value && setActive(null)}
      />
    </AdminShell>
  );
}
