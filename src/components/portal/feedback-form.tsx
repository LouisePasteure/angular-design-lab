import { useState, type FormEvent } from "react";
import { MessageSquareHeart, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import type { AdminAssignment, PublicIdentityPreference } from "@/lib/admin-data";
import { useAdminStore } from "@/lib/use-admin-store";

export function FeedbackForm({ assignment }: { assignment: AdminAssignment }) {
  const { feedback, getCurrentCustomer, getInvoiceForAssignment, submitFeedback } = useAdminStore();
  const existing = feedback.find((item) => item.assignmentId === assignment.id);
  const invoice = getInvoiceForAssignment(assignment.id);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [identity, setIdentity] = useState<PublicIdentityPreference>("Anonim");
  const eligible =
    assignment.workStatus === "Selesai" &&
    invoice?.paymentStatus === "Lunas" &&
    assignment.accessStatus === "Dapat Diakses";
  if (!eligible) return null;
  if (existing)
    return (
      <section className="border border-success/30 bg-success/5 p-5">
        <p className="font-bold text-success">Terima kasih atas feedbackmu.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Feedback bersifat opsional dan sedang dikelola sesuai pilihan publikasi yang kamu berikan.
        </p>
      </section>
    );
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!rating || comment.trim().length < 10) return;
    const username = getCurrentCustomer()?.username ?? "customer";
    submitFeedback({
      id: `FB-${Date.now().toString().slice(-5)}`,
      assignmentId: assignment.id,
      customerId: assignment.customerId,
      rating,
      comment: comment.trim(),
      publicationConsent: consent,
      publicIdentityPreference: identity,
      publicIdentitySnapshot:
        identity === "Anonim"
          ? "Anonim"
          : identity === "Inisial username"
            ? `${username.charAt(0).toUpperCase()}.`
            : `@${username}`,
      moderationStatus: "Menunggu Moderasi",
      homepageVisible: false,
      publicComment: comment.trim(),
      submittedAt: new Date().toISOString(),
      internalNote: "",
    });
    toast.success("Feedback berhasil dikirim");
  };
  return (
    <section className="border border-border bg-card p-5">
      <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">Opsional</p>
      <h3 className="mt-2 font-display text-2xl font-semibold">Bagikan feedback</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Tidak wajib. Rating dan komentar asli tidak dapat diubah admin.
      </p>
      <form className="mt-5 space-y-4" onSubmit={submit}>
        <div>
          <p className="text-xs font-bold">Rating</p>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} bintang`}
                className={`min-h-11 min-w-11 border ${rating >= value ? "border-primary bg-primary text-white" : "border-border"}`}
              >
                <Star className="mx-auto size-4" fill={rating >= value ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>
        <label className="block space-y-1.5 text-xs font-bold">
          Komentar
          <Textarea
            rows={4}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Ceritakan pengalamanmu (minimal 10 karakter)"
          />
        </label>
        <label className="flex items-start gap-2 text-xs leading-5">
          <Checkbox
            className="mt-0.5"
            checked={consent}
            onCheckedChange={(value) => setConsent(value === true)}
          />{" "}
          Saya mengizinkan komentar ini dipertimbangkan untuk tampil di homepage setelah moderasi.
        </label>
        {consent && (
          <label className="block space-y-1.5 text-xs font-bold">
            Identitas publik
            <select
              className="h-10 w-full border border-input bg-background px-3"
              value={identity}
              onChange={(event) => setIdentity(event.target.value as PublicIdentityPreference)}
            >
              <option>Username</option>
              <option>Inisial username</option>
              <option>Anonim</option>
            </select>
          </label>
        )}
        <Button disabled={!rating || comment.trim().length < 10}>
          <MessageSquareHeart /> Kirim Feedback
        </Button>
      </form>
    </section>
  );
}
