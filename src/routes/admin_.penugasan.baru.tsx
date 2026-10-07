import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORIES,
  type AdminAssignment,
  type AssignmentFile,
  type Category,
  type Priority,
} from "@/lib/admin-data";
import { useAdminStore } from "@/lib/use-admin-store";
import { getWorkerStats } from "@/lib/admin-selectors";
import { hashSecret } from "@/lib/secure-generators";
import { generateAssignmentAccessToken } from "@/lib/secure-generators";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/admin_/penugasan/baru")({
  head: () => ({ meta: [{ title: "jokitugass" }] }),
  component: CreateAssignment,
});
const control = "h-10 w-full border border-input bg-background px-3 text-sm";

function CreateAssignment() {
  const navigate = useNavigate();
  const {
    assignments,
    createAssignment,
    customers,
    getCurrentWorker,
    invoices,
    recordAudit,
    workers,
  } = useAdminStore();
  const currentWorker = getCurrentWorker();
  const selectableWorkers = workers.filter(
    (item) => item.status === "Aktif" && !item.archivedAt && item.role !== "Finance",
  );
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Skripsi");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [output, setOutput] = useState("");
  const [educationLevel, setEducationLevel] = useState("S1");
  const [outputFormat, setOutputFormat] = useState("PDF");
  const [initialEstimate, setInitialEstimate] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [deadline, setDeadline] = useState("");
  const [primaryWorkerId, setPrimaryWorkerId] = useState(selectableWorkers[0]?.id ?? "");
  const [reviewerWorkerId, setReviewerWorkerId] = useState("");
  const [supportingWorkerIds, setSupportingWorkerIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<Priority>("Normal");
  const [createdId, setCreatedId] = useState("");
  const [createdToken, setCreatedToken] = useState("");
  const [assignmentFiles, setAssignmentFiles] = useState<File[]>([]);
  const [supportingFiles, setSupportingFiles] = useState<File[]>([]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (
      primaryWorkerId &&
      reviewerWorkerId === primaryWorkerId &&
      !window.confirm(
        "Primary worker juga dipilih sebagai reviewer. Lanjutkan penugasan dengan peran ganda?",
      )
    )
      return;
    const now = new Date();
    const sequence =
      Math.max(...assignments.map((item) => Number(item.id.replace(/\D/g, ""))), 24000) + 1;
    const id = `TT-${sequence}`;
    const rawAccessToken = generateAssignmentAccessToken();
    const assignmentAccessTokenDigest = await hashSecret(rawAccessToken);
    const tokenExpiresAt = new Date(Date.now() + 30 * 86_400_000).toISOString();
    const toSourceFile = (file: File, kind: "assignment" | "supporting"): AssignmentFile => ({
      id: `SF-${crypto.randomUUID()}`,
      assignmentId: id,
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      category: kind,
      description:
        kind === "assignment" ? "File kebutuhan penugasan." : "File referensi pendukung.",
      uploadedAt: now.toISOString(),
      uploadedBy: currentWorker?.id ?? "Sistem",
      visibility: "customer_visible",
    });
    const assignment: AdminAssignment = {
      id,
      customerId,
      title,
      category,
      topic,
      description,
      educationLevel,
      output,
      outputFormat,
      ...(initialEstimate ? { initialEstimate: Number(initialEstimate) } : {}),
      deadline: new Date(deadline).toISOString(),
      workStatus: "Draft",
      progress: 0,
      accessStatus: "Belum Tersedia",
      accessReason: "Hasil belum dipublikasikan.",
      assignmentAccessTokenDigest,
      assignmentAccessTokenStatus: "Aktif",
      assignmentAccessTokenCreatedAt: now.toISOString(),
      assignmentAccessTokenExpiresAt: tokenExpiresAt,
      ...(primaryWorkerId
        ? {
            primaryWorkerId,
            assignedAt: now.toISOString(),
            assignedBy: currentWorker?.id ?? "Sistem",
          }
        : {}),
      supportingWorkerIds,
      ...(reviewerWorkerId ? { reviewerWorkerId } : {}),
      priority,
      publicProgressNote: "Penugasan telah dibuat dan menunggu proses pengerjaan.",
      createdAt: now.toISOString(),
      createdBy: currentWorker?.id ?? "Sistem",
      internalNote,
      sourceFiles: [
        ...assignmentFiles.map((file) => toSourceFile(file, "assignment")),
        ...supportingFiles.map((file) => toSourceFile(file, "supporting")),
      ],
      files: [],
      audit: [],
    };
    createAssignment(assignment);
    recordAudit({
      actor: "",
      action: "Membuat token akses penugasan",
      entityType: "Assignment",
      entityId: id,
      after: "Aktif",
      note: "Digest tersimpan; token mentah hanya ditampilkan satu kali.",
    });
    setCreatedId(id);
    setCreatedToken(rawAccessToken);
    toast.success("Penugasan dibuat", {
      description: "Penugasan langsung tersedia pada akun customer.",
    });
  };
  return (
    <AdminShell title="Buat Penugasan">
      <AdminPageHeader
        eyebrow="Operasional / Baru"
        title="Buat Penugasan"
        description="Hubungkan pekerjaan ke akun customer dan atur kebutuhan operasional."
      />
      <form
        className="mt-7 grid gap-6 xl:grid-cols-[1.2fr_.8fr]"
        onSubmit={(event) => void submit(event)}
      >
        <section className="space-y-4 border border-border bg-card p-5">
          <h3 className="font-display text-2xl font-semibold">Brief penugasan</h3>
          <label className="block space-y-1.5 text-xs font-bold">
            Customer
            <select
              required
              className={control}
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
            >
              {customers.map((item) => (
                <option key={item.id} value={item.id}>
                  @{item.username} — {item.id}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-xs font-bold">
            Judul
            <Input required value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 text-xs font-bold">
              Kategori
              <select
                className={control}
                value={category}
                onChange={(event) => setCategory(event.target.value as Category)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5 text-xs font-bold">
              Topik
              <Input required value={topic} onChange={(event) => setTopic(event.target.value)} />
            </label>
          </div>
          <label className="block space-y-1.5 text-xs font-bold">
            Deskripsi kebutuhan
            <Textarea
              required
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <label className="block space-y-1.5 text-xs font-bold">
            Output yang diminta
            <Input required value={output} onChange={(event) => setOutput(event.target.value)} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 text-xs font-bold">
              Jenjang pendidikan
              <Input
                value={educationLevel}
                onChange={(event) => setEducationLevel(event.target.value)}
              />
            </label>
            <label className="block space-y-1.5 text-xs font-bold">
              Format output
              <Input
                value={outputFormat}
                onChange={(event) => setOutputFormat(event.target.value)}
              />
            </label>
          </div>
          <label className="block space-y-1.5 text-xs font-bold">
            Catatan internal
            <Textarea
              value={internalNote}
              onChange={(event) => setInternalNote(event.target.value)}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block border border-dashed border-border p-4 text-xs font-bold">
              File penugasan
              <input
                className="mt-2 block w-full text-xs"
                type="file"
                multiple
                onChange={(event) => setAssignmentFiles(Array.from(event.target.files ?? []))}
              />
              <span className="mt-2 block font-normal text-muted-foreground">
                {assignmentFiles.length} file dipilih
              </span>
            </label>
            <label className="block border border-dashed border-border p-4 text-xs font-bold">
              File pendukung
              <input
                className="mt-2 block w-full text-xs"
                type="file"
                multiple
                onChange={(event) => setSupportingFiles(Array.from(event.target.files ?? []))}
              />
              <span className="mt-2 block font-normal text-muted-foreground">
                {supportingFiles.length} file dipilih
              </span>
            </label>
          </div>
        </section>
        <aside className="space-y-4 border border-border bg-card p-5">
          <h3 className="font-display text-2xl font-semibold">Operasional</h3>
          <label className="block space-y-1.5 text-xs font-bold">
            Deadline
            <Input
              required
              type="datetime-local"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
            />
          </label>
          <label className="block space-y-1.5 text-xs font-bold">
            Penanggung jawab
            <select
              className={control}
              value={primaryWorkerId}
              onChange={(event) => setPrimaryWorkerId(event.target.value)}
            >
              <option value="">Belum ditentukan</option>
              {selectableWorkers.map((item) => {
                const stats = getWorkerStats(item, assignments, invoices);
                return (
                  <option key={item.id} value={item.id}>
                    {item.fullName} · {stats.active}/{item.maxActiveAssignments} aktif
                    {stats.capacity > 1 ? " · OVERLOAD" : ""} ·{" "}
                    {item.specialties.join(", ") || item.role}
                  </option>
                );
              })}
            </select>
          </label>
          <fieldset className="border border-border p-3">
            <legend className="px-1 text-xs font-bold">Supporting worker</legend>
            <div className="mt-2 space-y-2">
              {selectableWorkers
                .filter((item) => item.id !== primaryWorkerId && item.role !== "Reviewer")
                .map((item) => {
                  const stats = getWorkerStats(item, assignments, invoices);
                  return (
                    <label key={item.id} className="flex items-start gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={supportingWorkerIds.includes(item.id)}
                        onChange={(event) =>
                          setSupportingWorkerIds((ids) =>
                            event.target.checked
                              ? [...ids, item.id]
                              : ids.filter((id) => id !== item.id),
                          )
                        }
                      />
                      <span>
                        <strong>{item.fullName}</strong>
                        <span className="block text-muted-foreground">
                          {stats.active}/{item.maxActiveAssignments} aktif ·{" "}
                          {item.specialties.join(", ") || item.role}
                          {stats.capacity > 1 ? " · OVERLOAD" : ""}
                        </span>
                      </span>
                    </label>
                  );
                })}
            </div>
          </fieldset>
          <label className="block space-y-1.5 text-xs font-bold">
            Reviewer
            <select
              className={control}
              value={reviewerWorkerId}
              onChange={(event) => setReviewerWorkerId(event.target.value)}
            >
              <option value="">Belum ditentukan</option>
              {selectableWorkers
                .filter((item) => item.role === "Reviewer" || item.role === "Super Admin")
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.fullName}
                  </option>
                ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-xs font-bold">
            Prioritas
            <select
              className={control}
              value={priority}
              onChange={(event) => setPriority(event.target.value as Priority)}
            >
              {["Rendah", "Normal", "Tinggi", "Urgent"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5 text-xs font-bold">
            Estimasi awal (Rp)
            <Input
              min="0"
              type="number"
              value={initialEstimate}
              onChange={(event) => setInitialEstimate(event.target.value)}
            />
          </label>
          <Button
            className="w-full"
            disabled={!customerId || !title || !deadline || Boolean(createdId)}
          >
            <Sparkles /> Buat Penugasan
          </Button>
          <p className="text-xs leading-5 text-muted-foreground">
            Akses hasil tetap tertutup. Invoice dibuat terpisah ketika pekerjaan selesai.
          </p>
        </aside>
      </form>
      {createdId && (
        <section className="mt-6 border border-primary bg-primary/5 p-5">
          <p className="text-xs font-bold text-primary">Penugasan berhasil dibuat</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">{createdId}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() =>
                void navigate({ to: "/admin/penugasan/$id", params: { id: createdId } })
              }
            >
              Buka Penugasan
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                void navigator.clipboard.writeText(createdToken);
                toast.success("Token disalin");
              }}
            >
              Salin token
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const customer = customers.find((item) => item.id === customerId);
                const message = `Halo, penugasan ${BRAND.name} Anda sudah dibuat.\n\nNomor penugasan: ${createdId}\nToken akses: ${createdToken}\n\nCek progres tanpa login melalui:\nhttps://domain.com/cek-penugasan\n\nMasukkan nomor WhatsApp yang terdaftar dan token tersebut. Jangan membagikan token kepada orang lain.`;
                void navigator.clipboard.writeText(message);
                toast.success(`Pesan WhatsApp untuk @${customer?.username ?? "customer"} disalin`);
              }}
            >
              Salin pesan WhatsApp
            </Button>
            <Button variant="outline" asChild>
              <a
                href={`https://wa.me/${customers.find((item) => item.id === customerId)?.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Halo, penugasan ${BRAND.name} Anda sudah dibuat.\n\nNomor penugasan: ${createdId}\nToken akses: ${createdToken}\n\nCek progres tanpa login melalui:\nhttps://domain.com/cek-penugasan\n\nMasukkan nomor WhatsApp yang terdaftar dan token tersebut. Jangan membagikan token kepada orang lain.`)}`}
                target="_blank"
                rel="noreferrer"
              >
                Kirim melalui WhatsApp
              </a>
            </Button>
            <Button onClick={() => void navigate({ to: "/admin/penugasan" })}>Selesai</Button>
          </div>
        </section>
      )}
    </AdminShell>
  );
}
