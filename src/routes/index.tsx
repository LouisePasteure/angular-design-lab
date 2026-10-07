import { createFileRoute, Link } from "@tanstack/react-router";
import {
  type ComponentType,
  type SVGProps,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  FileText,
  Mail,
  Menu,
  MessageCircle,
  ShieldCheck,
  Youtube,
  Linkedin,
  Twitter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAdminStore } from "@/lib/use-admin-store";
import { BRAND } from "@/config/brand";
import { BrandWordmark } from "@/components/brand-wordmark";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "jokitugass" },
      {
        name: "description",
        content: BRAND.description,
      },
      { property: "og:title", content: `${BRAND.name} — Dari brief sampai hasil akhir` },
      { property: "og:site_name", content: BRAND.name },
      {
        property: "og:description",
        content: "Ruang kerja akademik dan digital yang lebih jelas dari awal hingga akhir.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `${BRAND.name} — Dari brief sampai hasil akhir` },
    ],
  }),
  component: Home,
});

const navItems = [
  ["Beranda", "#beranda"],
  ["Kategori", "#kategori"],
  ["Cara Kerja", "#cara-kerja"],
  ["FAQ", "#faq"],
] as const;

const categories = ["Machine Learning / Deep Learning", "Skripsi", "Makalah / Artikel", "Lainnya"];

const steps = [
  { number: "01", title: "Pilih kategori", body: "Tentukan jenis kebutuhanmu." },
  { number: "02", title: "Kirim kebutuhan", body: "Sampaikan brief, file, dan deadline." },
  { number: "03", title: "Pantau progres", body: "Lihat status pengerjaan secara langsung." },
  {
    number: "04",
    title: "Terima hasil",
    body: "Periksa file dan ajukan revisi bila diperlukan.",
  },
];

const benefits = [
  {
    icon: MessageCircle,
    title: "Komunikasi yang jelas",
    body: "Brief, pembaruan, dan masukan tersusun dalam satu alur yang mudah diikuti.",
  },
  {
    icon: FileText,
    title: "Sesuai kebutuhanmu",
    body: "Cakupan pengerjaan menyesuaikan topik, target, dan konteks yang kamu kirimkan.",
  },
  {
    icon: ShieldCheck,
    title: "Dokumen lebih aman",
    body: "Akses file dan informasi pekerjaan dijaga agar tetap terbatas dan terarah.",
  },
  {
    icon: BookOpen,
    title: "Fokus pada proses belajar",
    body: "Setiap hasil tetap memberi ruang untuk kamu meninjau, memahami, dan berkembang.",
  },
];

const faqs = [
  {
    q: "Bagaimana cara mendapatkan akses akun?",
    a: `Akses akun diberikan setelah kebutuhanmu dikonfirmasi oleh tim ${BRAND.name}. Gunakan detail akun tersebut untuk masuk ke portal.`,
  },
  {
    q: "Bagaimana cara melihat progres pengerjaan?",
    a: "Masuk ke portal lalu buka penugasan aktif. Status dan pembaruan terbaru akan tampil pada halaman detail penugasan.",
  },
  {
    q: "Kapan file hasil dapat diunduh?",
    a: "File dapat diunduh setelah tahap hasil tersedia di portal. Kamu akan melihat status terbaru langsung pada penugasan terkait.",
  },
  {
    q: "Bagaimana cara mengajukan revisi?",
    a: "Buka hasil pada portal lalu sampaikan catatan revisi sesuai cakupan yang disepakati. Tim akan memperbarui status setelah catatan diterima.",
  },
  {
    q: "Apakah file dan data saya aman?",
    a: "File dan informasi hanya digunakan untuk kebutuhan pengerjaanmu. Hindari membagikan kata sandi atau data sensitif yang tidak diperlukan.",
  },
];

type SocialIconProps = SVGProps<SVGSVGElement>;

function InstagramIcon(props: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.5" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon(props: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M15.2 3c.35 2.05 1.55 3.25 3.8 3.38v3.07a8.2 8.2 0 0 1-3.76-1.12v6.06a6.14 6.14 0 1 1-5.3-6.08v3.12a3.1 3.1 0 1 0 2.16 2.96V3h3.1Z" />
    </svg>
  );
}

function WhatsAppIcon(props: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" {...props}>
      <path d="M20.2 11.6a8.2 8.2 0 0 1-12.1 7.2L3.5 20l1.2-4.4A8.2 8.2 0 1 1 20.2 11.6Z" />
      <path d="M8.4 7.6c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.5l.8 2c.1.3 0 .5-.2.7l-.6.7c-.2.2-.1.4 0 .6.5 1 1.4 1.9 2.4 2.5.2.1.4.2.6 0l.8-1c.2-.2.4-.3.7-.2l2 .9c.3.1.4.3.4.5 0 .5-.3 1.5-.8 2-.5.5-1.2.8-2 .8-1.1 0-2.7-.6-4.7-2.3-1.7-1.5-2.9-3.4-3.2-4.6-.3-1.1 0-2 .4-2.5l.7-.8Z" />
    </svg>
  );
}

const socialIcons: Record<string, ComponentType<SocialIconProps>> = {
  Instagram: InstagramIcon,
  TikTok: TikTokIcon,
  WhatsApp: WhatsAppIcon,
  YouTube: Youtube,
  X: Twitter,
  LinkedIn: Linkedin,
  Email: Mail,
};

function Home() {
  const { feedback, getCustomer, socialLinks } = useAdminStore();
  const enabledSocialLinks = socialLinks
    .filter((item) => item.enabled)
    .sort((a, b) => a.order - b.order);
  const publicFeedback = feedback.filter(
    (item) =>
      item.publicationConsent && item.moderationStatus === "Disetujui" && item.homepageVisible,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const closeMenu = () => setMobileMenu(false);
    window.addEventListener("resize", closeMenu);
    return () => window.removeEventListener("resize", closeMenu);
  }, []);

  useLayoutEffect(() => {
    let cancelled = false;
    let cleanup = () => {};

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled || !rootRef.current) return;

        gsap.registerPlugin(ScrollTrigger);
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const scope = rootRef.current;

        if (reduceMotion) {
          gsap.set(scope.querySelectorAll("[data-animate]"), {
            clearProps: "all",
            opacity: 1,
          });
          return;
        }

        const context = gsap.context(() => {
          const loadTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
          loadTimeline
            .from("[data-header-logo]", { y: -16, opacity: 0, duration: 0.55 })
            .from(
              "[data-header-nav] > *",
              { y: -12, opacity: 0, duration: 0.45, stagger: 0.055 },
              "<0.05",
            )
            .from("[data-hero-kicker]", { y: 16, opacity: 0, duration: 0.5 }, "-=0.15")
            .from(".hero-line > span", { yPercent: 110, duration: 0.85, stagger: 0.09 }, "-=0.2")
            .from("[data-hero-copy]", { y: 20, opacity: 0, duration: 0.55 }, "-=0.42")
            .from("[data-hero-actions]", { y: 16, opacity: 0, duration: 0.5 }, "-=0.32")
            .from("[data-scroll-indicator]", { opacity: 0, duration: 0.5 }, "-=0.25");

          gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((section) => {
            const items = section.querySelectorAll<HTMLElement>("[data-reveal]");
            if (!items.length) return;
            gsap.from(items, {
              y: 42,
              opacity: 0,
              duration: 0.85,
              stagger: 0.09,
              ease: "power3.out",
              scrollTrigger: { trigger: section, start: "top 78%", once: true },
            });
          });

          gsap.from("[data-category-row]", {
            y: 40,
            opacity: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: "#kategori", start: "top 68%", once: true },
          });

          const stepItems = gsap.utils.toArray<HTMLElement>("[data-step]");
          gsap.from(stepItems, {
            y: 38,
            opacity: 0.25,
            duration: 0.7,
            stagger: 0.13,
            ease: "power3.out",
            scrollTrigger: { trigger: "#cara-kerja", start: "top 65%", once: true },
          });

          const desktop = window.matchMedia("(min-width: 901px)").matches;
          gsap.fromTo(
            desktop ? "[data-step-line-horizontal]" : "[data-step-line-vertical]",
            desktop ? { scaleX: 0 } : { scaleY: 0 },
            {
              ...(desktop ? { scaleX: 1 } : { scaleY: 1 }),
              ease: "none",
              scrollTrigger: {
                trigger: "#cara-kerja",
                start: "top 70%",
                end: "bottom 75%",
                scrub: 0.6,
              },
            },
          );

          const footerTimeline = gsap.timeline({
            scrollTrigger: { trigger: ".social-footer", start: "top 88%", once: true },
            defaults: { ease: "power3.out" },
          });
          footerTimeline
            .from("[data-footer-brand]", { y: 16, opacity: 0, duration: 0.5 })
            .from(
              "[data-footer-icon]",
              { y: 16, opacity: 0, duration: 0.45, stagger: 0.07 },
              "-=0.25",
            )
            .from("[data-footer-copyright]", { y: 10, opacity: 0, duration: 0.4 }, "-=0.2");
        }, scope);

        cleanup = () => context.revert();
      },
    );

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="homepage min-h-screen overflow-x-clip bg-background text-foreground"
    >
      <header className={`site-header ${isScrolled ? "site-header--scrolled" : ""}`}>
        <div className="page-grid header-inner">
          <a
            href="#beranda"
            aria-label={`${BRAND.name}, kembali ke beranda`}
            className="brand-mark"
            data-header-logo
          >
            <span className="brand-symbol" aria-hidden="true">
              J<span>.</span>
            </span>
            <span>
              <BrandWordmark />
            </span>
          </a>

          <nav className="desktop-nav" aria-label="Navigasi utama" data-header-nav>
            {navItems.map(([label, href]) => (
              <a key={label} href={href}>
                {label}
              </a>
            ))}
          </nav>

          <div className="header-actions" data-header-nav>
            <Button variant="ghost" asChild className="header-login hidden sm:inline-flex">
              <Link to="/login">Masuk</Link>
            </Button>
            <Button asChild className="header-register hidden sm:inline-flex">
              <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer">
                Hubungi Admin <ArrowUpRight />
              </a>
            </Button>
            <Button variant="ghost" asChild className="sm:hidden">
              <Link to="/login">Masuk</Link>
            </Button>
            <button
              type="button"
              className="mobile-menu-button"
              aria-label={mobileMenu ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileMenu}
              aria-controls="mobile-navigation"
              onClick={() => setMobileMenu((open) => !open)}
            >
              {mobileMenu ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        <nav
          id="mobile-navigation"
          className={`mobile-navigation ${mobileMenu ? "mobile-navigation--open" : ""}`}
          aria-label="Navigasi seluler"
        >
          {navItems.map(([label, href], index) => (
            <a key={label} href={href} onClick={() => setMobileMenu(false)}>
              <span>0{index + 1}</span>
              {label}
            </a>
          ))}
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noreferrer"
            onClick={() => setMobileMenu(false)}
          >
            <span>→</span>Hubungi Admin
          </a>
        </nav>
      </header>

      <main>
        <section id="beranda" className="hero-section">
          <div className="page-grid hero-grid">
            <div className="hero-coordinate" aria-hidden="true">
              01 / HOME
            </div>
            <div className="hero-content">
              <p className="hero-kicker" data-hero-kicker>
                ACADEMIC &amp; DIGITAL WORKSPACE — 2026
              </p>
              <h1 className="hero-title" aria-label="Dari brief sampai hasil akhir.">
                <span className="hero-line">
                  <span>Dari brief</span>
                </span>
                <span className="hero-line">
                  <span>sampai hasil</span>
                </span>
                <span className="hero-line">
                  <span>
                    akhir<span className="text-primary">.</span>
                  </span>
                </span>
              </h1>
              <p className="hero-copy" data-hero-copy>
                Pantau pengerjaan, terima hasil, dan kelola revisi dalam satu ruang.
              </p>
              <div className="hero-actions" data-hero-actions>
                <Button asChild size="lg" className="hero-primary-cta">
                  <Link to="/login">
                    Masuk ke Akun <ArrowUpRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="hero-secondary-cta">
                  <Link to="/cek-penugasan">
                    Cek Penugasan <ArrowRight />
                  </Link>
                </Button>
                <a href="#cara-kerja" className="text-link">
                  Lihat cara kerja <ArrowRight />
                </a>
              </div>
            </div>
            <div className="scroll-cue" data-scroll-indicator>
              <span>SCROLL TO EXPLORE</span>
              <i aria-hidden="true" />
            </div>
          </div>
        </section>

        <section id="kategori" className="section-shell category-section" data-reveal-group>
          <div className="page-grid">
            <div className="section-heading-row">
              <p className="section-label" data-reveal>
                02 / KATEGORI
              </p>
              <h2 className="section-title" data-reveal>
                Kategori pengerjaan<span className="text-primary">.</span>
              </h2>
            </div>
            <div className="category-list">
              {categories.map((category, index) => (
                <button
                  key={category}
                  type="button"
                  className="category-row"
                  data-category-row
                  aria-label={`${category}. Halaman kategori akan segera tersedia.`}
                >
                  <span className="category-number">0{index + 1}</span>
                  <span className="category-name">{category}</span>
                  <ArrowUpRight className="category-arrow" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="cara-kerja" className="section-shell process-section" data-reveal-group>
          <div className="page-grid">
            <div className="process-intro">
              <p className="section-label section-label--light" data-reveal>
                03 / PROSES
              </p>
              <h2 className="process-title" data-reveal>
                Langkah demi
                <br />
                langkah<span className="text-primary">.</span>
              </h2>
              <p className="process-note" data-reveal>
                Satu alur yang jelas dari kebutuhan pertama sampai file siap ditinjau.
              </p>
            </div>
            <div className="steps-wrap">
              <div className="step-line-base" aria-hidden="true" />
              <div className="step-line-progress" data-step-line-horizontal aria-hidden="true" />
              <div
                className="step-line-progress-mobile"
                data-step-line-vertical
                aria-hidden="true"
              />
              <div className="steps-grid">
                {steps.map((step) => (
                  <article className="step-item" key={step.number} data-step>
                    <span className="step-number">{step.number}</span>
                    <span className="step-dot" aria-hidden="true" />
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell why-section" data-reveal-group>
          <div className="page-grid why-grid">
            <div className="why-intro">
              <p className="section-label" data-reveal>
                04 / KENAPA {BRAND.name.toUpperCase()}
              </p>
              <h2 className="section-title why-title" data-reveal>
                Kerja yang terasa
                <br />
                lebih jelas<span className="text-primary">.</span>
              </h2>
              <p data-reveal>
                Bukan sekadar hasil akhir. Setiap tahap dibuat agar kamu tetap memahami apa yang
                sedang berjalan.
              </p>
            </div>
            <div className="benefit-list">
              {benefits.map(({ icon: Icon, title, body }, index) => (
                <article className="benefit-item" key={title} data-reveal>
                  <span className="benefit-index">0{index + 1}</span>
                  <Icon aria-hidden="true" />
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {publicFeedback.length > 0 && (
          <section className="section-shell border-y border-border bg-surface" data-reveal-group>
            <div className="page-grid py-16 lg:py-24">
              <p className="section-label" data-reveal>
                05 / CUSTOMER VOICE
              </p>
              <div className="mt-8 grid gap-px border border-border bg-border lg:grid-cols-2">
                {publicFeedback.map((item) => {
                  const username = getCustomer(item.customerId)?.username ?? "customer";
                  const identity =
                    item.publicIdentitySnapshot ??
                    (item.publicIdentityPreference === "Anonim"
                      ? "Anonim"
                      : item.publicIdentityPreference === "Inisial username"
                        ? `${username.slice(0, 1).toUpperCase()}.`
                        : `@${username}`);
                  return (
                    <article key={item.id} className="bg-background p-6 lg:p-9" data-reveal>
                      <p className="text-primary" aria-label={`${item.rating} dari 5 bintang`}>
                        {"★".repeat(item.rating)}
                      </p>
                      <blockquote className="mt-6 font-display text-2xl font-medium leading-tight tracking-[-.03em]">
                        “{item.publicComment}”
                      </blockquote>
                      <p className="mt-8 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">
                        {identity} / Verified customer
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section id="faq" className="section-shell faq-section" data-reveal-group>
          <div className="page-grid faq-grid">
            <div className="faq-intro">
              <p className="section-label" data-reveal>
                06 / FAQ
              </p>
              <h2 className="section-title" data-reveal>
                Pertanyaan yang
                <br />
                sering diajukan<span className="text-primary">.</span>
              </h2>
            </div>
            <Accordion type="single" collapsible className="faq-list" data-reveal>
              {faqs.map(({ q, a }, index) => (
                <AccordionItem value={`faq-${index}`} key={q} className="faq-item">
                  <AccordionTrigger className="faq-trigger">
                    <span className="faq-number">0{index + 1}</span>
                    <span>{q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="faq-answer">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <footer id="social" className="social-footer">
        <div className="page-grid footer-inner">
          <a
            href="#beranda"
            className="footer-brand"
            aria-label={`${BRAND.name}, kembali ke atas`}
            data-footer-brand
          >
            <BrandWordmark accentClassName="" />
          </a>
          <nav className="social-links" aria-label={`Media sosial ${BRAND.name}`}>
            {enabledSocialLinks.map((item) => {
              const Icon = socialIcons[item.iconKey] ?? Mail;
              return (
                <a
                  key={item.id}
                  href={item.url}
                  aria-label={item.label}
                  title={item.label}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                  data-footer-icon
                >
                  <Icon className="social-icon" aria-hidden="true" />
                </a>
              );
            })}
          </nav>
          <p className="footer-copyright" data-footer-copyright>
            © 2026 {BRAND.name}.
          </p>
        </div>
      </footer>
    </div>
  );
}
