import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Lock,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileCard, ProgressBar } from "./portal-ui";
import type { AccessState } from "@/lib/portal-data";

/* ---------- Progress tracker ---------- */
export type Step = { name: string; state: "done" | "active" | "todo"; date?: string; note: string };

export function ProgressTracker({ steps, progress }: { steps: Step[]; progress: number }) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-4">
        <span className="text-xs font-semibold text-muted-foreground">Progress keseluruhan</span>
        <ProgressBar value={progress} className="flex-1" />
      </div>
      <ol className="grid gap-0 lg:grid-cols-5 lg:gap-2">
        {steps.map((s, i) => (
          <li
            key={s.name}
            className="relative flex gap-3 pb-5 last:pb-0 lg:flex-col lg:gap-0 lg:pb-0"
          >
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "absolute left-[11px] top-7 h-[calc(100%-1.75rem)] w-px lg:hidden",
                  s.state === "done" ? "bg-primary" : "bg-border",
                )}
              />
            )}
            <div className="flex items-center gap-2 lg:mb-3">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center border text-[10px] font-bold",
                  s.state === "done" && "border-primary bg-primary text-primary-foreground",
                  s.state === "active" && "border-primary bg-background text-primary",
                  s.state === "todo" && "border-border bg-background text-muted-foreground",
                )}
              >
                {s.state === "done" ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden h-0.5 flex-1 lg:block",
                  s.state === "done"
                    ? "bg-primary"
                    : s.state === "active"
                      ? "bg-primary/40"
                      : "bg-border",
                )}
              />
            </div>
            <div className="min-w-0">
              <p className={cn("text-xs font-bold", s.state === "todo" && "text-muted-foreground")}>
                {s.name}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-[11px] font-semibold",
                  s.state === "active" ? "text-primary" : "text-muted-foreground",
                )}
              >
                {s.state === "done"
                  ? "Selesai"
                  : s.state === "active"
                    ? "Sedang berlangsung"
                    : "Belum dimulai"}
                {s.date && ` · ${s.date}`}
              </p>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{s.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- Results ---------- */
const RESULT_FILES = [
  {
    name: "analisis-sentimen-final.ipynb",
    type: "Notebook",
    size: "1,8 MB",
    version: "v3",
    date: "2 Okt 2026",
    desc: "Notebook pemrosesan data dan evaluasi model BERT.",
  },
  {
    name: "laporan-hasil-analisis.pdf",
    type: "PDF",
    size: "2,4 MB",
    version: "v2",
    date: "2 Okt 2026",
    desc: "Laporan metodologi, temuan, dan interpretasi hasil.",
  },
  {
    name: "dataset-hasil.csv",
    type: "CSV",
    size: "6,1 MB",
    version: "v2",
    date: "2 Okt 2026",
    desc: "Dataset berlabel beserta skor prediksi akhir.",
  },
];

function downloadDummy(name: string) {
  const blob = new Blob(
    [`File simulasi untuk ${name}.\nFile asli akan tersedia setelah sistem terhubung.`],
    { type: "text/plain" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name.replace(/\.[^.]+$/, "") + "_simulasi.txt";
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Unduhan simulasi dimulai", { description: name });
}

export function ResultAccessPanel({
  state,
  progress,
  files,
  revisionsLeft,
  confirmed,
  onRevision,
  onConfirm,
  onContact,
}: {
  state: AccessState;
  progress: number;
  files?: typeof RESULT_FILES;
  revisionsLeft: number;
  confirmed: boolean;
  onRevision: () => void;
  onConfirm: () => void;
  onContact: () => void;
}) {
  const [checked, setChecked] = useState(false);
  const visibleFiles = files === undefined ? RESULT_FILES : files;

  if (state === "Belum Tersedia") {
    return (
      <div className="flex flex-col items-center border border-dashed border-border bg-surface px-6 py-10 text-center">
        <FileText className="size-8 text-muted-foreground" strokeWidth={1.25} />
        <p className="mt-4 font-bold">Hasil belum tersedia</p>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          Pengerjaan masih berlangsung. File hasil akan muncul setelah diunggah oleh admin.
        </p>
        <div className="mt-5 w-full max-w-xs">
          <ProgressBar value={progress} />
        </div>
      </div>
    );
  }

  if (state === "Terkunci") {
    return (
      <div>
        <div className="flex items-center gap-2 border border-status-locked/30 bg-status-locked/5 px-4 py-3 text-sm font-bold text-status-locked">
          <Lock className="size-4" /> Hasil masih terkunci
        </div>
        <div className="relative mt-4 overflow-hidden border border-border bg-surface">
          <div className="space-y-2 p-6 opacity-40" aria-hidden="true">
            {[80, 95, 60, 90, 70, 85].map((w, i) => (
              <div key={i} className="h-2.5 bg-muted-foreground/30" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 text-center">
            <span className="flex size-11 items-center justify-center border border-border bg-card">
              <Lock className="size-5" strokeWidth={1.5} />
            </span>
            <p className="mt-3 text-xs font-bold">Pratinjau tidak tersedia</p>
          </div>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Alasan</dt>
            <dd className="font-semibold">Hasil sedang menunggu pemeriksaan akhir oleh admin.</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Estimasi akses</dt>
            <dd className="font-semibold">Diperkirakan tersedia pada 4 Oktober 2026</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button disabled>
            <Download /> Unduh hasil
          </Button>
          <Button variant="outline" onClick={onContact}>
            <MessageSquare /> Hubungi Admin
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 border border-success/30 bg-success/5 px-4 py-3 text-sm font-bold text-success">
        <CheckCircle2 className="size-4" /> Hasil dapat diakses
      </div>
      <div className="mt-4 space-y-3">
        {visibleFiles.map((f) => (
          <FileCard
            key={f.name}
            name={f.name}
            meta={`${f.type} · ${f.size} · ${f.version} · Diunggah ${f.date}`}
            description={f.desc}
            actions={
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toast("Pratinjau simulasi", {
                      description: `${f.name} akan ditampilkan setelah sistem terhubung.`,
                    })
                  }
                >
                  <Eye /> Pratinjau
                </Button>
                <Button size="sm" onClick={() => downloadDummy(f.name)}>
                  <Download /> Unduh
                </Button>
              </>
            }
          />
        ))}
      </div>
      <div className="mt-5 grid gap-3 border border-border bg-surface p-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Batas waktu revisi</p>
          <p className="font-semibold">8 Oktober 2026, 23.59 WIB</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Revisi tersisa</p>
          <p className="font-semibold">{revisionsLeft} dari 2</p>
        </div>
      </div>
      {confirmed ? (
        <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-success">
          <CheckCircle2 className="size-4" /> Hasil telah dikonfirmasi diterima.
        </p>
      ) : (
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} /> Saya
            telah memeriksa hasil
          </label>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onRevision} disabled={revisionsLeft === 0}>
              <RotateCcw /> Ajukan Revisi
            </Button>
            <Button onClick={onConfirm} disabled={!checked}>
              <CheckCircle2 /> Konfirmasi Hasil Diterima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Modals ---------- */
const REVISION_TYPES = [
  "Perbaikan isi",
  "Perbaikan format",
  "Perbaikan data",
  "Penambahan bagian",
  "Lainnya",
];

export function RevisionModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (type: string) => void;
}) {
  const [file, setFile] = useState(RESULT_FILES[0]?.name ?? "");
  const [type, setType] = useState(REVISION_TYPES[0] ?? "");
  const [desc, setDesc] = useState("");
  const [support, setSupport] = useState<File | null>(null);
  const [agree, setAgree] = useState(false);
  const valid = desc.trim().length >= 10 && agree;
  const cls =
    "h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:border-ring";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajukan Revisi</DialogTitle>
          <DialogDescription>
            Jelaskan bagian yang perlu diperbaiki agar admin dapat menindaklanjuti.
          </DialogDescription>
        </DialogHeader>
        <form
          id="revision-form"
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            onSubmit(type);
            setDesc("");
            setSupport(null);
            setAgree(false);
          }}
        >
          <div className="space-y-1.5">
            <label className="text-xs font-bold" htmlFor="rev-file">
              File yang perlu direvisi
            </label>
            <select
              id="rev-file"
              className={cls}
              value={file}
              onChange={(e) => setFile(e.target.value)}
            >
              {RESULT_FILES.map((f) => (
                <option key={f.name}>{f.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold" htmlFor="rev-type">
              Jenis revisi
            </label>
            <select
              id="rev-type"
              className={cls}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {REVISION_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold" htmlFor="rev-desc">
              Deskripsi revisi
            </label>
            <Textarea
              id="rev-desc"
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Contoh: Tabel 4.2 perlu menyertakan nilai signifikansi."
            />
            <p className="text-[11px] text-muted-foreground">Minimal 10 karakter.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold" htmlFor="rev-support">
              File pendukung (opsional)
            </label>
            <input
              id="rev-support"
              type="file"
              onChange={(e) => setSupport(e.target.files?.[0] ?? null)}
              className="block w-full border border-input p-2 text-xs file:mr-3 file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold"
            />
            {support && (
              <p className="text-[11px] text-muted-foreground">
                {support.name} · {(support.size / 1024).toFixed(0)} KB
              </p>
            )}
          </div>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox
              className="mt-0.5"
              checked={agree}
              onCheckedChange={(v) => setAgree(v === true)}
            />{" "}
            Saya memastikan permintaan revisi ini sesuai dengan instruksi awal.
          </label>
        </form>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batalkan
          </Button>
          <Button type="submit" form="revision-form" disabled={!valid}>
            Kirim Permintaan Revisi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batalkan
          </Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
