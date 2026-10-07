import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Copy, Eye, EyeOff, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, type Category, type Worker, type WorkerRole } from "@/lib/admin-data";
import { ROLE_LABELS } from "@/lib/admin-selectors";
import {
  generatePassword,
  hashSecret,
  isValidIndonesianWhatsapp,
  normalizeWhatsapp,
  validateUsername,
} from "@/lib/secure-generators";
import { useAdminStore } from "@/lib/use-admin-store";

export const Route = createFileRoute("/admin_/worker/baru")({
  head: () => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex" }],
  }),
  component: NewWorker,
});
const control = "h-10 w-full border border-input bg-background px-3 text-sm";
function NewWorker() {
  const navigate = useNavigate();
  const { createWorker, getCurrentWorker, workers } = useAdminStore();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [role, setRole] = useState<WorkerRole>("Worker");
  const [specialties, setSpecialties] = useState<Category[]>([]);
  const [capacity, setCapacity] = useState(3);
  const [note, setNote] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(true);
  const [createdId, setCreatedId] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const usernameError = validateUsername(username);
    if (
      usernameError ||
      workers.some((item) => item.username === username) ||
      !isValidIndonesianWhatsapp(whatsapp)
    )
      return;
    const raw = generatePassword();
    const timestamp = new Date().toISOString();
    const id = `WK-${String(Math.max(...workers.map((item) => Number(item.id.replace(/\D/g, ""))), 0) + 1).padStart(3, "0")}`;
    const worker: Worker = {
      id,
      fullName,
      username: username.toLowerCase(),
      whatsapp: normalizeWhatsapp(whatsapp),
      role,
      status: "Aktif",
      specialties,
      maxActiveAssignments: role === "Finance" ? 0 : capacity,
      internalNote: note,
      passwordDigest: await hashSecret(raw),
      credentialStatus: "Password Sementara",
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: getCurrentWorker()?.id ?? "Sistem",
    };
    createWorker(worker);
    setPassword(raw);
    setCreatedId(id);
    toast.success("Worker berhasil dibuat");
  };
  return (
    <AdminShell title="Tambah Worker">
      <AdminPageHeader
        eyebrow="Tim / Baru"
        title="Tambah Worker"
        description="Buat akun internal dan atur kapasitas kerja awal."
      />
      <form onSubmit={(e) => void submit(e)} className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="space-y-4 border border-border bg-card p-5">
          <label className="block text-xs font-bold">
            Nama lengkap
            <Input
              required
              className="mt-1"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>
          <label className="block text-xs font-bold">
            Username
            <Input
              required
              className="mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
            />
          </label>
          <label className="block text-xs font-bold">
            WhatsApp
            <Input
              required
              className="mt-1"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </label>
          <label className="block text-xs font-bold">
            Role
            <select
              className={`mt-1 ${control}`}
              value={role}
              onChange={(e) => setRole(e.target.value as WorkerRole)}
            >
              {ROLE_LABELS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-bold">
            Kapasitas aktif
            <Input
              min="0"
              max="20"
              type="number"
              className="mt-1"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </label>
          <label className="block text-xs font-bold">
            Catatan internal
            <Textarea className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
        </section>
        <aside className="border border-border bg-card p-5">
          <h3 className="font-display text-2xl font-semibold">Specialty</h3>
          <div className="mt-4 space-y-2">
            {CATEGORIES.map((item) => (
              <label
                key={item}
                className="flex min-h-11 items-center gap-3 border-b border-border text-sm"
              >
                <input
                  type="checkbox"
                  checked={specialties.includes(item)}
                  onChange={(e) =>
                    setSpecialties((values) =>
                      e.target.checked
                        ? [...values, item]
                        : values.filter((value) => value !== item),
                    )
                  }
                />
                {item}
              </label>
            ))}
          </div>
          <Button className="mt-5 w-full" disabled={Boolean(createdId)}>
            <UserRoundPlus /> Buat Worker
          </Button>
        </aside>
      </form>
      {createdId && (
        <section className="mt-6 border border-primary bg-primary/5 p-5">
          <p className="text-xs font-bold text-primary">Password sementara — tampil satu kali</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">{createdId}</h3>
          <div className="mt-3 flex max-w-xl gap-2">
            <code className="min-w-0 flex-1 border border-border bg-background p-3 text-xs">
              {show ? password : "••••••••••••"}
            </code>
            <Button size="icon" variant="outline" onClick={() => setShow((v) => !v)}>
              {show ? <EyeOff /> : <Eye />}
            </Button>
            <Button
              size="icon"
              onClick={() => {
                void navigator.clipboard.writeText(password);
                toast.success("Password disalin");
              }}
            >
              <Copy />
            </Button>
          </div>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => void navigate({ to: "/admin/worker/$id", params: { id: createdId } })}
          >
            Buka profil worker
          </Button>
        </section>
      )}
    </AdminShell>
  );
}
