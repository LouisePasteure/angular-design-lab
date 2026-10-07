import { Link } from "@tanstack/react-router";
import { Download, Eye, Headphones, Lock } from "lucide-react";
import { toast } from "sonner";
import { FeedbackForm } from "@/components/portal/feedback-form";
import { PortalShell } from "@/components/portal/portal-shell";
import {
  AccessStatus,
  ActivityTimeline,
  AssignmentStatusBadge,
  FileCard,
  ProgressBar,
  SectionCard,
} from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/lib/use-admin-store";
import { formatDateTime } from "@/lib/portal-data";
import { GuestAssignmentShell } from "@/components/guest/guest-assignment-shell";

export function CustomerAssignmentDetailPage({ id }: { id: string }) {
  return <AssignmentDetailContent id={id} mode="authenticated" />;
}

export function AssignmentDetailContent({
  id,
  mode,
  onGuestExit,
}: {
  id: string;
  mode: "authenticated" | "guest";
  onGuestExit?: () => void;
}) {
  const { getAssignment, getCurrentCustomer, getInvoiceForAssignment, revisions } = useAdminStore();
  const assignment = getAssignment(id);
  const currentCustomer = getCurrentCustomer();
  if (
    !assignment ||
    (mode === "authenticated" && (!currentCustomer || assignment.customerId !== currentCustomer.id))
  ) {
    const fallback = (
      <div className="border border-destructive/30 bg-destructive/5 p-8 text-center">
        <Lock className="mx-auto size-8 text-destructive" />
        <h2 className="mt-4 font-display text-2xl font-semibold">Penugasan tidak tersedia</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Akses ini tidak terhubung ke penugasan aktif.
        </p>
        <Button className="mt-5" variant="outline" asChild>
          <Link to={mode === "guest" ? "/cek-penugasan" : "/dashboard/penugasan"}>Kembali</Link>
        </Button>
      </div>
    );
    if (mode === "guest") return <GuestAssignmentShell>{fallback}</GuestAssignmentShell>;
    return <PortalShell title="Penugasan">{fallback}</PortalShell>;
  }
  const invoice = getInvoiceForAssignment(assignment.id);
  const published = assignment.files.filter((file) => file.status === "Published");
  const visibleSourceFiles = assignment.sourceFiles.filter(
    (file) => file.visibility === "customer_visible",
  );
  const resultsAvailable =
    assignment.accessStatus === "Dapat Diakses" && invoice?.paymentStatus === "Lunas";
  const history = revisions.filter((item) => item.assignmentId === assignment.id);
  const content = (
    <>
      <nav className="text-xs text-muted-foreground">
        {mode === "authenticated" ? (
          <>
            <Link to="/dashboard">Dashboard</Link> /{" "}
            <Link to="/dashboard/penugasan">Penugasan Saya</Link>
          </>
        ) : (
          <>
            <Link to="/cek-penugasan">Cek Penugasan</Link>
            <span className="px-2">/</span>Akses terbatas
          </>
        )}{" "}
        / {assignment.id}
      </nav>
      <header className="mt-5 grid gap-7 border-b border-border pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
              {assignment.id}
            </p>
            <AssignmentStatusBadge
              status={assignment.workStatus}
              access={assignment.accessStatus}
            />
          </div>
          <h2 className="mt-4 max-w-4xl font-display text-[clamp(2.4rem,5vw,5rem)] font-semibold leading-[.95] tracking-[-.06em]">
            {assignment.title}
            <span className="text-primary">.</span>
          </h2>
          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-xs">
            <p>
              <span className="text-muted-foreground">Deadline</span> ·{" "}
              {formatDateTime(assignment.deadline)}
            </p>
            <p>
              <span className="text-muted-foreground">Progress</span> · {assignment.progress}%
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer">
            <Headphones /> Hubungi Admin
          </a>
        </Button>
      </header>
      <section className="mt-9">
        <div className="space-y-8">
          <section className="border-b border-border pb-9">
            <h3 className="font-display text-2xl font-semibold">Progress pengerjaan</h3>
            <div className="mt-5">
              <ProgressBar value={assignment.progress} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Status saat ini: <strong className="text-foreground">{assignment.workStatus}</strong>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{assignment.publicProgressNote}</p>
          </section>
          <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
            <SectionCard title="Informasi Penugasan">
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {[
                  ["Kategori", assignment.category],
                  ["Topik", assignment.topic],
                  ["Output", assignment.output],
                  ["Deadline", formatDateTime(assignment.deadline)],
                  ["Deskripsi kebutuhan", assignment.description],
                ].map(([label, value]) => (
                  <div key={label} className="border-t border-border pt-3">
                    <dt className="text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="mt-2 text-sm leading-6">{value}</dd>
                  </div>
                ))}
              </dl>
            </SectionCard>
            <SectionCard title="Status pembayaran">
              <p className="text-2xl font-bold">{invoice?.paymentStatus ?? "Belum Ditagihkan"}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tagihan diterbitkan admin setelah pekerjaan selesai.
              </p>
              {invoice && mode === "authenticated" && (
                <Button className="mt-4" variant="outline" asChild>
                  <Link to="/dashboard/tagihan">Lihat Tagihan</Link>
                </Button>
              )}
            </SectionCard>
          </div>
          <section>
            <h3 className="font-display text-2xl font-semibold">File penugasan & pendukung</h3>
            <div className="mt-4 space-y-3">
              {visibleSourceFiles.length ? (
                visibleSourceFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    name={file.name}
                    meta={`${file.category === "assignment" ? "File penugasan" : "File pendukung"} · ${file.size} · ${formatDateTime(file.uploadedAt)}`}
                    description={file.description}
                    actions={
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast("Pratinjau simulasi", { description: file.name })}
                        >
                          <Eye /> Pratinjau
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            toast.success("Unduhan simulasi dimulai", { description: file.name })
                          }
                        >
                          <Download /> Unduh
                        </Button>
                      </>
                    }
                  />
                ))
              ) : (
                <p className="border border-dashed border-border p-5 text-sm text-muted-foreground">
                  Belum ada file yang dibagikan admin.
                </p>
              )}
            </div>
          </section>
          <section>
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
                  Hasil / akses
                </p>
                <h3 className="mt-2 font-display text-3xl font-semibold">
                  Hasil pengerjaan<span className="text-primary">.</span>
                </h3>
              </div>
              {assignment.accessStatus !== "Dapat Diakses" && (
                <Lock className="size-6 text-status-locked" />
              )}
            </div>
            <div className="mb-4">
              <AccessStatus access={assignment.accessStatus} />
            </div>
            {resultsAvailable ? (
              <div className="space-y-3">
                {published.length === 0 ? (
                  <p className="border border-dashed border-border p-6 text-sm text-muted-foreground">
                    Belum ada file published.
                  </p>
                ) : (
                  published.map((file) => (
                    <FileCard
                      key={file.id}
                      name={file.name}
                      meta={`${file.format} · ${file.size} · ${file.version} · ${formatDateTime(file.uploadedAt)}`}
                      description={file.description}
                      actions={
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast("Pratinjau simulasi", { description: file.name })}
                          >
                            <Eye /> Pratinjau
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              toast.success("Unduhan simulasi dimulai", {
                                description: file.name,
                              })
                            }
                          >
                            <Download /> Unduh
                          </Button>
                        </>
                      }
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="border border-status-locked/30 bg-status-locked/5 p-5">
                <p className="font-bold">Hasil belum dapat diakses</p>
                <p className="mt-2 text-sm text-muted-foreground">{assignment.accessReason}</p>
                <Button className="mt-4" disabled>
                  <Download /> Unduh hasil
                </Button>
              </div>
            )}
          </section>
          <section className="border-t border-border pt-8">
            <h3 className="font-display text-2xl font-semibold">Riwayat revisi</h3>
            {mode === "authenticated" && (
              <p className="mt-2 text-sm text-muted-foreground">
                Pengajuan revisi dikelola admin melalui komunikasi langsung. Area customer bersifat
                read-only.
              </p>
            )}
            {history.length ? (
              <ActivityTimeline
                items={history.map((item) => ({
                  id: item.id,
                  title: `${item.type} — ${item.status}`,
                  time: `${formatDateTime(item.receivedAt)} · ${item.message}`,
                }))}
              />
            ) : (
              <p className="mt-4 border border-dashed border-border p-5 text-sm text-muted-foreground">
                Belum ada riwayat revisi.
              </p>
            )}
          </section>
          {mode === "authenticated" && <FeedbackForm assignment={assignment} />}
        </div>
      </section>
      {mode === "guest" && (
        <Button className="mt-8" variant="outline" onClick={onGuestExit}>
          Keluar dari Akses Penugasan
        </Button>
      )}
    </>
  );
  if (mode === "guest") return <GuestAssignmentShell>{content}</GuestAssignmentShell>;
  return <PortalShell title="Detail Penugasan">{content}</PortalShell>;
}
