import { createFileRoute } from "@tanstack/react-router";
import { Check, Eye, EyeOff, Search, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminStore } from "@/lib/use-admin-store";
import { formatDateTime } from "@/lib/portal-data";

export const Route = createFileRoute("/admin_/feedback")({
  head: () => ({ meta: [{ title: "jokitugass" }] }),
  component: FeedbackPage,
});
function FeedbackPage() {
  const { feedback, getAssignment, getCurrentWorker, getCustomer, updateFeedback } =
    useAdminStore();
  const [query, setQuery] = useState("");
  const items = feedback.filter((item) =>
    `${item.id} ${item.assignmentId} ${item.comment} ${getCustomer(item.customerId)?.username ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const patch = (id: string, values: Parameters<typeof updateFeedback>[1], message: string) => {
    updateFeedback(id, {
      ...values,
      moderatedAt: new Date().toISOString(),
      moderatedBy: getCurrentWorker()?.fullName ?? "Staff",
    });
    toast.success(message);
  };
  return (
    <AdminShell title="Feedback">
      <AdminPageHeader
        eyebrow="Customer Voice / Moderasi"
        title="Feedback"
        description="Tinjau feedback opsional. Komentar asli dan rating tidak dapat diedit oleh admin."
      />
      <label className="relative mt-7 block max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari ID, username, penugasan, atau isi feedback"
        />
      </label>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-primary">
                  {item.id} · {item.assignmentId}
                </p>
                <h3 className="mt-2 font-bold">@{getCustomer(item.customerId)?.username}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {getAssignment(item.assignmentId)?.title}
                </p>
              </div>
              <span className="border border-border px-2 py-1 text-xs font-bold">
                {item.moderationStatus}
              </span>
            </div>
            <div className="mt-4 text-primary" aria-label={`${item.rating} dari 5 bintang`}>
              {"★".repeat(item.rating)}
              {"☆".repeat(5 - item.rating)}
            </div>
            <blockquote className="mt-3 border-l-2 border-primary pl-4 text-sm leading-6">
              “{item.comment}”
            </blockquote>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-muted-foreground">Izin publikasi</dt>
                <dd className="mt-1 font-bold">
                  {item.publicationConsent ? "Diberikan" : "Tidak diberikan"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Identitas</dt>
                <dd className="mt-1 font-bold">{item.publicIdentityPreference}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Dikirim</dt>
                <dd className="mt-1 font-bold">{formatDateTime(item.submittedAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Homepage</dt>
                <dd className="mt-1 font-bold">
                  {item.homepageVisible ? "Tampil" : "Tidak tampil"}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() =>
                  patch(
                    item.id,
                    { moderationStatus: "Disetujui", homepageVisible: item.publicationConsent },
                    "Feedback disetujui",
                  )
                }
              >
                <Check /> Setujui
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  patch(
                    item.id,
                    { moderationStatus: "Ditolak", homepageVisible: false },
                    "Feedback ditolak",
                  )
                }
              >
                <X /> Tolak
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!item.publicationConsent || item.moderationStatus !== "Disetujui"}
                onClick={() =>
                  patch(
                    item.id,
                    { homepageVisible: !item.homepageVisible },
                    item.homepageVisible ? "Feedback disembunyikan" : "Feedback ditampilkan",
                  )
                }
              >
                {item.homepageVisible ? <EyeOff /> : <Eye />}{" "}
                {item.homepageVisible ? "Sembunyikan" : "Tampilkan"}
              </Button>
            </div>
            <p className="mt-4 flex gap-2 text-[11px] leading-5 text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0" /> Hanya feedback berizin, disetujui, dan
              bertanda tampil yang dapat muncul di homepage.
            </p>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
