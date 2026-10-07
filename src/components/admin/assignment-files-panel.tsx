import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Download, Eye, FileUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { AdminAssignment, AssignmentFileCategory, FileVisibility } from "@/lib/admin-data";
import { useAdminStore } from "@/lib/use-admin-store";
import { formatDateTime } from "@/lib/portal-data";

const MAX_SIZE = 25 * 1024 * 1024;
const ACCEPTED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "image/png",
  "image/jpeg",
  "application/zip",
];

export function AssignmentFilesPanel({ assignment }: { assignment: AdminAssignment }) {
  const { addAssignmentFiles, getCurrentWorker, removeAssignmentFile, updateAssignmentFile } =
    useAdminStore();
  const currentWorker = getCurrentWorker();
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<AssignmentFileCategory>("assignment");
  const [visibility, setVisibility] = useState<FileVisibility>("customer_visible");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const process = (files: FileList | File[]) => {
    const list = Array.from(files);
    const invalid = list.find((file) => file.size > MAX_SIZE || !ACCEPTED.includes(file.type));
    if (invalid) {
      toast.error("File tidak didukung", {
        description: `${invalid.name}: gunakan PDF, DOCX, XLSX, CSV, PNG, JPG, atau ZIP maksimal 25 MB.`,
      });
      return;
    }
    setUploading(true);
    window.setTimeout(() => {
      addAssignmentFiles(
        assignment.id,
        list.map((file) => ({
          id: `SF-${crypto.randomUUID()}`,
          assignmentId: assignment.id,
          name: file.name,
          mimeType: file.type,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          category,
          description,
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentWorker?.fullName ?? "Staff",
          visibility,
        })),
      );
      setUploading(false);
      setDescription("");
      toast.success(`${list.length} file ditambahkan`);
    }, 500);
  };
  const onInput = (event: ChangeEvent<HTMLInputElement>) =>
    event.target.files && process(event.target.files);
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    process(event.dataTransfer.files);
  };
  return (
    <section className="mt-7 border border-border bg-card" data-admin-reveal>
      <header className="border-b border-border p-5">
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
          02 / Source files
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold">File Penugasan & Pendukung</h3>
      </header>
      <div className="grid gap-5 p-5 lg:grid-cols-[.8fr_1.2fr]">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold">
              Kategori
              <select
                className="mt-1 h-10 w-full border border-input bg-background px-3"
                value={category}
                onChange={(event) => setCategory(event.target.value as AssignmentFileCategory)}
              >
                <option value="assignment">File penugasan</option>
                <option value="supporting">File pendukung</option>
              </select>
            </label>
            <label className="text-xs font-bold">
              Visibilitas
              <select
                className="mt-1 h-10 w-full border border-input bg-background px-3"
                value={visibility}
                onChange={(event) => setVisibility(event.target.value as FileVisibility)}
              >
                <option value="customer_visible">Terlihat customer</option>
                <option value="admin_only">Khusus admin</option>
              </select>
            </label>
          </div>
          <label className="block text-xs font-bold">
            Deskripsi
            <input
              className="mt-1 h-10 w-full border border-input bg-background px-3"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className="grid min-h-36 cursor-pointer place-items-center border border-dashed border-primary/50 bg-primary/5 p-5 text-center focus-visible:outline-2 focus-visible:outline-primary"
          >
            <div>
              <FileUp className="mx-auto size-6 text-primary" />
              <p className="mt-2 text-sm font-bold">
                {uploading ? "Mengunggah…" : "Pilih atau jatuhkan file"}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Maks. 25 MB per file</p>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="sr-only"
            accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg,.zip"
            onChange={onInput}
          />
        </div>
        <div className="space-y-3">
          {assignment.sourceFiles.length === 0 ? (
            <p className="border border-dashed border-border p-6 text-sm text-muted-foreground">
              Belum ada file penugasan atau pendukung.
            </p>
          ) : (
            assignment.sourceFiles.map((file) => (
              <article key={file.id} className="border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{file.name}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {file.category === "assignment" ? "Penugasan" : "Pendukung"} · {file.size} ·{" "}
                      {formatDateTime(file.uploadedAt)}
                    </p>
                  </div>
                  <span className="border border-border px-2 py-1 text-[9px] font-bold uppercase">
                    {file.visibility === "customer_visible" ? "Customer" : "Admin only"}
                  </span>
                </div>
                <input
                  aria-label={`Deskripsi ${file.name}`}
                  value={file.description}
                  onChange={(event) =>
                    updateAssignmentFile(assignment.id, file.id, {
                      description: event.target.value,
                    })
                  }
                  className="mt-3 h-9 w-full border border-input bg-background px-3 text-xs"
                />
                <div className="mt-3 flex flex-wrap gap-2">
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
                    onClick={() => toast.success("Unduhan simulasi", { description: file.name })}
                  >
                    <Download /> Unduh
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (window.confirm(`Hapus ${file.name}?`))
                        removeAssignmentFile(assignment.id, file.id);
                    }}
                  >
                    <Trash2 /> Hapus
                  </Button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
