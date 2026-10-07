import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Copy, Eye, EyeOff, Plus, Search, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Customer } from "@/lib/admin-data";
import {
  generatePassword,
  generateActivationToken,
  hashSecret,
  isValidIndonesianWhatsapp,
  maskWhatsapp,
  normalizeWhatsapp,
} from "@/lib/secure-generators";
import { useAdminStore } from "@/lib/use-admin-store";
import { formatShortDate } from "@/lib/portal-data";

export const Route = createFileRoute("/admin_/customer/")({
  head: () => ({ meta: [{ title: "jokitugass" }] }),
  component: CustomerList,
});

function CustomerList() {
  const { createCustomer, customers, getCurrentWorker } = useAdminStore();
  const [query, setQuery] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [activationFilter, setActivationFilter] = useState("");
  const [activityFilter, setActivityFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [note, setNote] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [activationToken, setActivationToken] = useState("");
  const [created, setCreated] = useState(false);
  const exists = customers.some(
    (item) => item.username.toLowerCase() === username.trim().toLowerCase(),
  );
  const validUsername = /^[a-z0-9._-]{4,24}$/i.test(username);
  const items = customers.filter((item) => {
    const matchesQuery = `${item.id} ${item.username}`.toLowerCase().includes(query.toLowerCase());
    const ageDays = item.lastActiveAt
      ? (Date.now() - new Date(item.lastActiveAt).getTime()) / 86_400_000
      : Number.POSITIVE_INFINITY;
    const matchesActivity =
      !activityFilter ||
      (activityFilter === "7"
        ? ageDays <= 7
        : activityFilter === "30"
          ? ageDays <= 30
          : ageDays > 30);
    return (
      matchesQuery &&
      (!accountFilter || item.accountStatus === accountFilter) &&
      (!activationFilter || item.activationStatus === activationFilter) &&
      matchesActivity
    );
  });
  const reset = () => {
    setUsername("");
    setWhatsapp("");
    setNote("");
    setPassword("");
    setShow(false);
    setActivationToken("");
    setCreated(false);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validUsername || exists || !isValidIndonesianWhatsapp(whatsapp) || !password) return;
    const now = new Date().toISOString();
    const token = generateActivationToken();
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    const customer: Customer = {
      id: `CU-${1000 + customers.length + 1}`,
      username: username.toLowerCase(),
      whatsapp: normalizeWhatsapp(whatsapp),
      internalNote: note,
      accountStatus: "Nonaktif",
      credentialStatus: "Password Sementara",
      activationStatus: "Belum digunakan",
      passwordDigest: await hashSecret(password),
      activationTokenDigest: await hashSecret(token),
      activationTokenCreatedAt: now,
      activationTokenExpiresAt: expires.toISOString(),
      forcePasswordChange: true,
      createdAt: now,
      lastActiveAt: now,
      lastSeenRoute: "/aktivasi",
      loginCount: 0,
      createdBy: getCurrentWorker()?.fullName ?? "Staff",
      updatedAt: now,
    };
    createCustomer(customer);
    setActivationToken(token);
    setCreated(true);
    toast.success("Akun customer dibuat", {
      description: "Password hanya tampil dalam dialog ini dan tidak disimpan.",
    });
  };
  return (
    <AdminShell title="Customer">
      <AdminPageHeader
        eyebrow="Akun / Customer"
        title="Customer"
        description="Buat kredensial, atur status akun, dan hubungkan penugasan."
        actions={
          <Button
            onClick={() => {
              reset();
              setOpen(true);
            }}
          >
            <Plus /> Tambah Customer
          </Button>
        }
      />
      <label className="relative mt-7 block max-w-xl">
        <span className="sr-only">Cari customer</span>
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari ID atau username"
        />
      </label>
      <div className="mt-3 grid max-w-3xl gap-3 sm:grid-cols-3">
        <label className="text-xs font-bold">
          Status akun
          <select
            className="mt-1 h-10 w-full border border-input bg-background px-3"
            value={accountFilter}
            onChange={(event) => setAccountFilter(event.target.value)}
          >
            <option value="">Semua</option>
            {["Aktif", "Nonaktif", "Ditangguhkan", "Terkunci"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold">
          Aktivasi
          <select
            className="mt-1 h-10 w-full border border-input bg-background px-3"
            value={activationFilter}
            onChange={(event) => setActivationFilter(event.target.value)}
          >
            <option value="">Semua</option>
            {["Belum digunakan", "Sudah digunakan", "Kedaluwarsa", "Dicabut"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold">
          Aktivitas
          <select
            className="mt-1 h-10 w-full border border-input bg-background px-3"
            value={activityFilter}
            onChange={(event) => setActivityFilter(event.target.value)}
          >
            <option value="">Semua</option>
            <option value="7">Aktif 7 hari</option>
            <option value="30">Aktif 30 hari</option>
            <option value="inactive">Tidak aktif &gt;30 hari</option>
          </select>
        </label>
      </div>
      <div className="mt-5 hidden overflow-x-auto border border-border md:block">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-surface text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              {[
                "ID",
                "Username",
                "WhatsApp",
                "Status akun",
                "Aktivasi",
                "Aktif terakhir",
                "Login",
                "Aksi",
              ].map((item) => (
                <th key={item} className="p-3">
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="p-3 font-bold text-primary">{item.id}</td>
                <td className="p-3 font-bold">@{item.username}</td>
                <td className="p-3">{maskWhatsapp(item.whatsapp)}</td>
                <td className="p-3">{item.accountStatus}</td>
                <td className="p-3">{item.activationStatus}</td>
                <td className="p-3">
                  {item.lastActiveAt ? formatShortDate(item.lastActiveAt) : "—"}
                </td>
                <td className="p-3">{item.loginCount}</td>
                <td className="p-3">
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/admin/customer/$id" params={{ id: item.id }}>
                      Buka
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 space-y-3 md:hidden">
        {items.map((item) => (
          <article key={item.id} className="border border-border p-4">
            <p className="text-xs font-bold text-primary">{item.id}</p>
            <h3 className="mt-2 font-bold">@{item.username}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{maskWhatsapp(item.whatsapp)}</p>
            <div className="mt-3 flex gap-2 text-xs">
              <span className="border border-border px-2 py-1">{item.accountStatus}</span>
              <span className="border border-border px-2 py-1">{item.credentialStatus}</span>
            </div>
            <Button className="mt-4 w-full" variant="outline" asChild>
              <Link to="/admin/customer/$id" params={{ id: item.id }}>
                Buka Customer
              </Link>
            </Button>
          </article>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Tambah customer</DialogTitle>
            <DialogDescription>
              Admin membuat username dan password sementara. Tidak ada registrasi publik.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => void submit(event)}>
            <label className="block space-y-1.5 text-xs font-bold">
              Username
              <Input
                value={username}
                onChange={(event) => setUsername(event.target.value.replace(/\s/g, ""))}
                placeholder="contoh: aditya.p"
              />
              {username && (!validUsername || exists) && (
                <span className="block text-destructive">
                  {exists
                    ? "Username sudah digunakan."
                    : "Gunakan 4–24 karakter: huruf, angka, titik, garis bawah, atau tanda hubung."}
                </span>
              )}
            </label>
            <label className="block space-y-1.5 text-xs font-bold">
              WhatsApp
              <Input
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                placeholder="081234567890"
              />
              {whatsapp && !isValidIndonesianWhatsapp(whatsapp) && (
                <span className="block text-destructive">
                  Nomor WhatsApp Indonesia tidak valid.
                </span>
              )}
            </label>
            <label className="block space-y-1.5 text-xs font-bold">
              Catatan internal
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
            </label>
            <div className="border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-primary">Password sementara</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPassword(generatePassword());
                    setShow(true);
                  }}
                >
                  Generate
                </Button>
              </div>
              {password && (
                <div className="mt-3 flex gap-2">
                  <code className="min-w-0 flex-1 border border-border bg-background px-3 py-2 text-xs">
                    {show ? password : "••••••••••••••"}
                  </code>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => setShow((value) => !value)}
                    aria-label="Tampilkan password"
                  >
                    {show ? <EyeOff /> : <Eye />}
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => {
                      void navigator.clipboard.writeText(password);
                      toast.success("Password disalin");
                    }}
                    aria-label="Salin password"
                  >
                    <Copy />
                  </Button>
                </div>
              )}
              {activationToken && (
                <div className="mt-3 border-t border-primary/20 pt-3">
                  <p className="text-xs font-bold text-primary">
                    Token aktivasi — tampil satu kali
                  </p>
                  <div className="mt-2 flex gap-2">
                    <code className="min-w-0 flex-1 border border-border bg-background px-3 py-2 text-xs">
                      {show ? activationToken : "••••-••••-••••"}
                    </code>
                    <Button
                      type="button"
                      size="icon"
                      onClick={() => {
                        void navigator.clipboard.writeText(activationToken);
                        toast.success("Token aktivasi disalin");
                      }}
                      aria-label="Salin token aktivasi"
                    >
                      <Copy />
                    </Button>
                  </div>
                </div>
              )}
              <p className="mt-2 text-[11px] text-muted-foreground">
                12–16 karakter, dibuat dengan Web Crypto. Password tidak dicatat dalam store atau
                audit.
              </p>
            </div>
            <Button
              className="w-full"
              disabled={
                !validUsername ||
                exists ||
                !isValidIndonesianWhatsapp(whatsapp) ||
                !password ||
                created
              }
            >
              <UserRoundPlus /> Buat Akun Customer
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
