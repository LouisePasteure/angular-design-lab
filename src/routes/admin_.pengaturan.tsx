import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import type { SocialPlatform } from "@/lib/admin-data";
import { isSafeSocialUrl, normalizeSocialUrl } from "@/lib/secure-generators";
import { useAdminStore } from "@/lib/use-admin-store";

export const Route = createFileRoute("/admin_/pengaturan")({
  head: () => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: SocialSettings,
});
const platforms: SocialPlatform[] = [
  "Instagram",
  "TikTok",
  "WhatsApp",
  "YouTube",
  "X",
  "LinkedIn",
  "Email",
];

function SocialSettings() {
  const { createSocialLink, deleteSocialLink, reorderSocialLink, socialLinks, updateSocialLink } =
    useAdminStore();
  const add = () =>
    createSocialLink({
      id: `SOC-${crypto.randomUUID()}`,
      platform: "Instagram",
      iconKey: "Instagram",
      label: "Instagram",
      url: "https://instagram.com/",
      enabled: false,
      order: socialLinks.length + 1,
      openInNewTab: true,
    });
  return (
    <AdminShell title="Pengaturan Sosial">
      <AdminPageHeader
        eyebrow="Homepage / Footer"
        title="Tautan Sosial"
        description="Atur ikon yang muncul pada footer homepage. Perubahan berlaku selama sesi browser."
        actions={
          <Button onClick={add}>
            <Plus /> Tambah tautan
          </Button>
        }
      />
      <div className="mt-7 space-y-3">
        {[...socialLinks]
          .sort((a, b) => a.order - b.order)
          .map((item, index) => (
            <article
              key={item.id}
              className="grid gap-3 border border-border bg-card p-4 lg:grid-cols-[170px_1fr_140px_auto] lg:items-end"
            >
              <label className="text-xs font-bold">
                Platform
                <select
                  className="mt-1 h-10 w-full border border-input bg-background px-3"
                  value={item.platform}
                  onChange={(event) => {
                    const platform = event.target.value as SocialPlatform;
                    updateSocialLink(item.id, { platform, iconKey: platform, label: platform });
                  }}
                >
                  {platforms.map((platform) => (
                    <option key={platform}>{platform}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold">
                URL
                <input
                  className="mt-1 h-10 w-full border border-input bg-background px-3"
                  value={item.url}
                  onChange={(event) => updateSocialLink(item.id, { url: event.target.value })}
                  onBlur={(event) => {
                    const url = normalizeSocialUrl(item.platform, event.target.value);
                    if (!isSafeSocialUrl(item.platform, url))
                      toast.error("URL tidak valid atau protokol tidak aman.");
                    else updateSocialLink(item.id, { url });
                  }}
                />
              </label>
              <label className="flex h-10 items-center gap-2 border border-input px-3 text-xs font-bold">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(event) => updateSocialLink(item.id, { enabled: event.target.checked })}
                />{" "}
                Aktif
              </label>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  disabled={index === 0}
                  onClick={() => reorderSocialLink(item.id, -1)}
                  aria-label="Naikkan urutan"
                >
                  <ArrowUp />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  disabled={index === socialLinks.length - 1}
                  onClick={() => reorderSocialLink(item.id, 1)}
                  aria-label="Turunkan urutan"
                >
                  <ArrowDown />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
                  aria-label="Uji tautan"
                >
                  <ExternalLink />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    if (window.confirm(`Hapus ${item.label}?`)) deleteSocialLink(item.id);
                  }}
                  aria-label="Hapus tautan"
                >
                  <Trash2 />
                </Button>
              </div>
            </article>
          ))}
      </div>
    </AdminShell>
  );
}
