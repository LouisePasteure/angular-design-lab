import { useRef, useState, type DragEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FilePlus2,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AdminConfirmationDialog } from "@/components/admin/admin-confirmation-dialog";
import { FileStateBadge } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminAssignment, AdminResultFile } from "@/lib/admin-data";
import { useAdminStore } from "@/lib/use-admin-store";
import { formatDateTime } from "@/lib/portal-data";

type UploadState = "idle" | "selected" | "uploading" | "success" | "error";

export function ResultUploadPanel({ assignment }: { assignment: AdminAssignment }) {
  const { addFiles, session, updateFile, removeFile } = useAdminStore();
  const canPublish = session?.role === "admin" && session.permissions.includes("assignment:manage");
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<File[]>([]);
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [version, setVersion] = useState("v3");
  const [description, setDescription] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [clientMessage, setClientMessage] = useState("");
  const [revisionDeadline, setRevisionDeadline] = useState("2026-10-10");
  const [notify, setNotify] = useState(true);
  const [demoError, setDemoError] = useState(false);
  const [confirm, setConfirm] = useState<{ type: "publish" | "delete"; fileId?: string } | null>(
    null,
  );

  const choose = (files: File[]) => {
    if (!files.length) return;
    setSelected(files);
    setState("selected");
    setProgress(0);
  };
  const upload = (publish: boolean) => {
    if (!selected.length) {
      toast.error("Pilih minimal satu file");
      return;
    }
    setState("uploading");
    setProgress(8);
    const timer = window.setInterval(
      () =>
        setProgress((current) => {
          const next = Math.min(current + 18, 100);
          if (next === 100) {
            window.clearInterval(timer);
            if (demoError) {
              setState("error");
              return next;
            }
            const files: AdminResultFile[] = selected.map((file, index) => ({
              id: `result-${Date.now()}-${index}`,
              name: file.name,
              format: file.name.split(".").pop()?.toUpperCase() ?? "FILE",
              size: `${Math.max(file.size / 1024 / 1024, 0.1).toFixed(1)} MB`,
              uploadedAt: new Date().toISOString(),
              version,
              status: publish ? "Published" : "Draft",
              description: description || "File hasil penugasan.",
            }));
            addFiles(assignment.id, files);
            setState("success");
            setSelected([]);
            toast.success(publish ? "Hasil berhasil dipublikasikan" : "Draft hasil tersimpan", {
              description: notify ? "Notifikasi client disiapkan." : undefined,
            });
          }
          return next;
        }),
      180,
    );
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    choose(Array.from(event.dataTransfer.files));
  };
  return (
    <section className="border border-border bg-card" data-admin-reveal>
      <header className="border-b border-border p-5">
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
          Result Management
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold">Upload &amp; Publikasi Hasil</h3>
      </header>
      <div className="space-y-6 p-5">
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(event) =>
            (event.key === "Enter" || event.key === " ") && inputRef.current?.click()
          }
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          className="flex min-h-40 cursor-pointer flex-col items-center justify-center border border-dashed border-primary/50 bg-primary/[.025] p-6 text-center outline-none transition-colors hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary"
        >
          <UploadCloud className="size-8 text-primary" strokeWidth={1.4} />
          <p className="mt-3 text-sm font-bold">Tarik file ke sini atau pilih dari perangkat</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Mendukung banyak file · Maksimum simulasi 25 MB
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="sr-only"
            onChange={(event) => choose(Array.from(event.target.files ?? []))}
            aria-label="Pilih file hasil"
          />
        </div>
        {selected.length > 0 && (
          <div aria-live="polite" className="space-y-2">
            {selected.map((file) => (
              <div
                key={`${file.name}-${file.size}`}
                className="flex items-center gap-3 border border-border p-3"
              >
                <FilePlus2 className="size-4 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected((items) => items.filter((item) => item !== file))}
                  aria-label={`Hapus ${file.name}`}
                  className="p-2 hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {(state === "uploading" || state === "success" || state === "error") && (
          <div aria-live="polite">
            <div className="mb-2 flex justify-between text-xs font-bold">
              <span>
                {state === "uploading"
                  ? "Mengunggah…"
                  : state === "success"
                    ? "Upload selesai"
                    : "Upload gagal"}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden bg-border">
              <div
                className={`h-full origin-left transition-[width] duration-300 ${state === "error" ? "bg-destructive" : state === "success" ? "bg-success" : "bg-primary"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            {state === "error" && (
              <div className="mt-3 flex items-center justify-between border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                <span className="flex items-center gap-2">
                  <AlertCircle className="size-4" /> Koneksi simulasi terputus.
                </span>
                <Button size="sm" variant="outline" onClick={() => upload(false)}>
                  <RefreshCw /> Coba lagi
                </Button>
              </div>
            )}
            {state === "success" && (
              <p className="mt-3 flex items-center gap-2 text-xs font-bold text-success">
                <CheckCircle2 className="size-4" /> File berhasil diproses.
              </p>
            )}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-xs font-bold">
            Nomor versi
            <Input value={version} onChange={(e) => setVersion(e.target.value)} />
          </label>
          <label className="space-y-1.5 text-xs font-bold">
            Deadline revisi
            <Input
              type="date"
              value={revisionDeadline}
              onChange={(e) => setRevisionDeadline(e.target.value)}
            />
          </label>
          <label className="space-y-1.5 text-xs font-bold sm:col-span-2">
            Deskripsi file
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Jelaskan isi dan perubahan versi ini."
            />
          </label>
          <label className="space-y-1.5 text-xs font-bold">
            Catatan internal <span className="font-normal text-muted-foreground">— admin saja</span>
            <Textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              rows={3}
            />
          </label>
          <label className="space-y-1.5 text-xs font-bold">
            Pesan untuk client
            <Textarea
              value={clientMessage}
              onChange={(e) => setClientMessage(e.target.value)}
              rows={3}
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-2 text-xs font-semibold">
            <Checkbox checked={notify} onCheckedChange={(v) => setNotify(v === true)} /> Kirim
            notifikasi kepada client
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox checked={demoError} onCheckedChange={(v) => setDemoError(v === true)} /> Demo
            upload error
          </label>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {canPublish && (
            <Button
              variant="outline"
              disabled={!selected.length || state === "uploading"}
              onClick={() => upload(false)}
              className="sm:flex-1"
            >
              Simpan Draft Hasil
            </Button>
          )}
          <Button
            disabled={!selected.length || state === "uploading"}
            onClick={() => setConfirm({ type: "publish" })}
            className="sm:flex-1"
          >
            <UploadCloud /> Publikasikan Hasil
          </Button>
        </div>

        <div className="border-t border-border pt-6">
          <h4 className="text-sm font-bold">File hasil</h4>
          <div className="mt-3 space-y-3">
            {assignment.files.length === 0 ? (
              <p className="border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                Belum ada file hasil.
              </p>
            ) : (
              assignment.files.map((file) => (
                <article key={file.id} className="border border-border p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-bold">{file.name}</p>
                        <FileStateBadge status={file.status} />
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {file.format} · {file.size} · {file.version} ·{" "}
                        {formatDateTime(file.uploadedAt)}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">{file.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast("Pratinjau simulasi", { description: file.name })}
                      >
                        <Eye /> Pratinjau
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast("Pilih file pengganti melalui area upload.")}
                      >
                        <RefreshCw /> Ganti
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label={`Hapus ${file.name}`}
                        onClick={() => setConfirm({ type: "delete", fileId: file.id })}
                      >
                        <Trash2 />
                      </Button>
                      {canPublish && file.status === "Draft" && (
                        <Button
                          size="sm"
                          onClick={() => setConfirm({ type: "publish", fileId: file.id })}
                        >
                          Publikasikan
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
        <div className="border-t border-border pt-6">
          <h4 className="text-sm font-bold">Riwayat versi</h4>
          <ol className="mt-3 grid gap-2 sm:grid-cols-3">
            <li className="border border-border p-3 text-xs">
              <strong>v1</strong>
              <span className="mt-1 block text-muted-foreground">Draft · 30 Sep</span>
            </li>
            <li className="border border-success/30 p-3 text-xs">
              <strong>v2</strong>
              <span className="mt-1 block text-success">Published · 1 Okt</span>
            </li>
            <li className="border border-status-warning/30 p-3 text-xs">
              <strong>v3</strong>
              <span className="mt-1 block text-status-warning">Revision · 2 Okt</span>
            </li>
          </ol>
        </div>
      </div>
      <AdminConfirmationDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.type === "delete" ? "Hapus file hasil?" : "Publikasikan hasil?"}
        description={
          confirm?.type === "delete"
            ? "File akan dihapus dari daftar hasil sesi ini."
            : "File published dapat dilihat client setelah akses dibuka."
        }
        confirmLabel={confirm?.type === "delete" ? "Ya, hapus" : "Ya, publikasikan"}
        destructive={confirm?.type === "delete"}
        onConfirm={() => {
          if (confirm?.type === "delete" && confirm.fileId) {
            removeFile(assignment.id, confirm.fileId);
            toast.success("File dihapus");
          } else if (confirm?.fileId) {
            updateFile(assignment.id, confirm.fileId, { status: "Published" });
            toast.success("File dipublikasikan");
          } else upload(true);
        }}
      />
    </section>
  );
}
