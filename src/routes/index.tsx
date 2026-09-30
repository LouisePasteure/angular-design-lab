import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Clock3, FileCheck2, FileText, GraduationCap, LockKeyhole, Menu, MessageCircle, Search, ShieldCheck, Sparkles, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import hero from "@/assets/hero-workspace.jpg";
import consultation from "@/assets/service-consultation.jpg";
import editing from "@/assets/service-editing.jpg";
import presentation from "@/assets/service-presentation.jpg";
import dataImage from "@/assets/service-data.jpg";
import review from "@/assets/service-review.jpg";
import infographic from "@/assets/service-infographic.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TemanTugas — Pendampingan belajar dan dokumen yang terarah" },
      { name: "description", content: "Temukan layanan konsultasi, penyuntingan, presentasi, olah data, dan review dokumen untuk mendukung proses belajarmu." },
      { property: "og:title", content: "TemanTugas — Pendampingan belajar dan dokumen yang terarah" },
      { property: "og:description", content: "Layanan konsultasi, penyuntingan, presentasi, olah data, dan review dokumen untuk proses belajar yang lebih terarah." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const services = [
  { title: "Konsultasi Tugas", category: "Konsultasi", description: "Diskusikan ide, materi, dan langkah pengerjaan bersama pendamping.", duration: "Sesi terjadwal", image: consultation, alt: "Dua mahasiswa berdiskusi di meja belajar", tag: "Paling dicari" },
  { title: "Penyuntingan Makalah", category: "Makalah & Artikel", description: "Rapikan bahasa, struktur, dan keterbacaan tulisanmu.", duration: "Estimasi 2–3 hari", image: editing, alt: "Dokumen akademik sedang disunting", tag: "" },
  { title: "Desain Presentasi", category: "Presentasi", description: "Susun materi menjadi slide yang jelas dan enak dilihat.", duration: "Estimasi 2–4 hari", image: presentation, alt: "Presentasi visual pada layar laptop", tag: "" },
  { title: "Olah Data", category: "Olah Data", description: "Pahami data dan pilih pendekatan analisis yang tepat.", duration: "Sesuai cakupan", image: dataImage, alt: "Analisis data pada layar laptop", tag: "" },
  { title: "Review Skripsi", category: "Proofreading", description: "Dapatkan masukan pada alur, argumen, dan penulisan naskah.", duration: "Estimasi 3–5 hari", image: review, alt: "Mentor dan mahasiswa meninjau dokumen", tag: "" },
  { title: "Pembuatan Infografis", category: "Desain", description: "Ubah informasi kompleks menjadi visual yang mudah dipahami.", duration: "Estimasi 2–4 hari", image: infographic, alt: "Rancangan infografis pada tablet", tag: "" },
];

const categories = ["Semua Layanan", "Makalah & Artikel", "Presentasi", "Olah Data", "Desain", "Konsultasi", "Proofreading", "Lainnya"];

function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua Layanan");
  const [selected, setSelected] = useState<(typeof services)[number] | null>(null);
  const [notice, setNotice] = useState<"order" | "login" | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const visible = useMemo(() => services.filter((service) => {
    const matchesCategory = category === "Semua Layanan" || service.category === category;
    const matchesQuery = `${service.title} ${service.category} ${service.description}`.toLocaleLowerCase("id").includes(query.toLocaleLowerCase("id").trim());
    return matchesCategory && matchesQuery;
  }), [category, query]);

  const jumpToServices = () => document.getElementById("layanan")?.scrollIntoView({ behavior: "smooth" });
  const chooseCategory = (value: string) => { setCategory(value); setMobileMenu(false); jumpToServices(); };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-ink text-ink-foreground">
        <div className="mx-auto flex min-h-9 max-w-[1200px] items-center justify-center gap-3 px-5 text-[10px] font-medium sm:gap-7 sm:text-[11px]">
          <span className="flex items-center gap-1.5"><CalendarDays className="size-3" />Pengerjaan terjadwal</span><span className="text-line-light">|</span>
          <span className="flex items-center gap-1.5"><FileCheck2 className="size-3" />Revisi sesuai paket</span><span className="hidden text-line-light sm:inline">|</span>
          <span className="hidden items-center gap-1.5 sm:flex"><ShieldCheck className="size-3" />Data dan file terlindungi</span>
        </div>
      </div>

      <header className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-5 gap-y-4 px-5 py-4 lg:grid-cols-[auto_minmax(260px,1fr)_auto] lg:py-5">
          <a href="#beranda" aria-label="TemanTugas, kembali ke beranda" className="flex w-fit min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center bg-ink text-base font-extrabold text-ink-foreground">T<span className="text-primary">.</span></span>
            <span className="text-lg font-extrabold tracking-normal">teman<span className="text-primary">tugas</span><span className="text-primary">.</span></span>
          </a>
          <form className="order-3 col-span-2 flex h-11 min-w-0 items-center border border-border bg-surface lg:order-none lg:col-span-1 lg:mx-auto lg:w-full lg:max-w-[445px]" onSubmit={(event) => { event.preventDefault(); jumpToServices(); }}>
            <Search className="ml-4 size-4 shrink-0 text-muted-foreground" />
            <input className="h-full min-w-0 flex-1 bg-transparent px-3 text-xs outline-none placeholder:text-muted-foreground sm:text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari layanan yang kamu butuhkan" aria-label="Cari layanan" />
            {query && <Button type="button" size="icon" variant="ghost" aria-label="Hapus pencarian" onClick={() => setQuery("")}><X /></Button>}
            <Button type="submit" className="h-full px-4" aria-label="Cari"><ArrowRight /></Button>
          </form>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="ghost" asChild className="hidden px-3 text-xs sm:inline-flex"><Link to="/login">Masuk</Link></Button>
            <Button asChild className="hidden h-10 px-5 text-xs sm:inline-flex"><Link to="/daftar">Daftar</Link></Button>
            <Button variant="outline" asChild className="h-9 px-3 text-xs sm:hidden"><Link to="/login">Masuk</Link></Button>
            <Button asChild className="h-9 px-3 text-xs sm:hidden"><Link to="/daftar">Daftar</Link></Button>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label={mobileMenu ? "Tutup menu" : "Buka menu"} onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X /> : <Menu />}</Button>
          </div>
        </div>
        <nav className="hidden border-t border-border lg:block" aria-label="Navigasi utama">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 text-xs font-semibold">
            <div className="flex items-center gap-9"><a className="border-b-2 border-primary py-4 text-primary" href="#beranda">Beranda</a><a className="py-4 hover:text-primary" href="#layanan">Layanan</a><a className="py-4 hover:text-primary" href="#cara-kerja">Cara Kerja</a><a className="py-4 hover:text-primary" href="#faq">FAQ</a></div>
            <span className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="size-4 text-primary" /> Belajar lebih percaya diri, dengan caramu sendiri.</span>
          </div>
        </nav>
        {mobileMenu && <nav className="border-t border-border px-5 py-3 lg:hidden" aria-label="Navigasi seluler"><div className="mx-auto flex max-w-[1200px] flex-col text-sm font-semibold">{[["Beranda", "#beranda"], ["Layanan", "#layanan"], ["Cara Kerja", "#cara-kerja"], ["FAQ", "#faq"]].map(([label, href]) => <a onClick={() => setMobileMenu(false)} className="border-b border-border py-3" href={href} key={label}>{label}</a>)}<div className="mt-4 flex gap-2"><Button variant="outline" className="flex-1" asChild><Link to="/login" onClick={() => setMobileMenu(false)}>Masuk</Link></Button><Button className="flex-1" asChild><Link to="/daftar" onClick={() => setMobileMenu(false)}>Daftar</Link></Button></div></div></nav>}
      </header>

      <nav className="border-b border-border" aria-label="Kategori layanan"><div className="mx-auto flex max-w-[1200px] items-center gap-6 overflow-x-auto px-5 py-3 whitespace-nowrap text-[11px] font-semibold text-muted-foreground [scrollbar-width:none] sm:gap-8 sm:text-xs"><span className="hidden shrink-0 items-center gap-2 text-foreground sm:flex"><Menu className="size-3.5" /> KATEGORI</span><span className="hidden h-4 w-px bg-border sm:block" />{categories.slice(1).map((item) => <Button key={item} variant="ghost" className="h-auto shrink-0 p-0 text-[11px] font-semibold text-muted-foreground hover:bg-transparent hover:text-primary sm:text-xs" onClick={() => chooseCategory(item)}>{item}</Button>)}</div></nav>

      <main id="beranda">
        <section className="relative isolate min-h-[500px] overflow-hidden bg-surface sm:min-h-[560px] lg:min-h-[570px]">
          <img src={hero} alt="Mahasiswa belajar dengan laptop di ruang studi" className="absolute inset-0 -z-10 h-full w-full object-cover object-[58%_center] max-lg:opacity-45 lg:object-center" width={1600} height={850} fetchPriority="high" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/95 to-transparent lg:via-background/80" />
          <div className="mx-auto flex min-h-[500px] max-w-[1200px] items-center px-5 py-12 sm:min-h-[560px] lg:min-h-[570px]">
            <div className="max-w-[590px]"><div className="mb-6 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary"><span className="h-px w-6 bg-primary" /> BELAJAR LEBIH TERARAH</div>
              <h1 className="max-w-[590px] text-[38px] leading-[1.17] font-extrabold sm:text-[50px] lg:text-[58px]">Pendampingan tugas yang lebih praktis dan terarah<span className="text-primary">.</span></h1>
              <p className="mt-6 max-w-[500px] text-sm leading-7 text-muted-foreground sm:text-base">Dari konsultasi, penyuntingan, hingga olah data dan presentasi — temukan dukungan yang tepat untuk setiap tahap belajarmu.</p>
              <div className="mt-8 flex flex-wrap gap-3"><Button size="lg" onClick={() => setNotice("order")}>Mulai Pesanan <ArrowUpRight /></Button><Button size="lg" variant="editorial" asChild><a href="#cara-kerja">Lihat Cara Kerja <ArrowRight /></a></Button></div>
              <p className="mt-9 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-foreground sm:text-xs"><ShieldCheck className="size-4 text-primary" />Proses transparan <span className="text-muted-foreground">•</span> Deadline terpantau <span className="text-muted-foreground">•</span> File aman</p>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-ink text-ink-foreground"><div className="mx-auto grid max-w-[1200px] grid-cols-1 divide-y divide-line-light px-5 py-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:py-7"><div className="flex items-center gap-4 py-3 sm:pr-7"><BookOpen className="size-7 shrink-0 text-primary" strokeWidth={1.5}/><div><p className="text-sm font-bold">Belajar, bukan jalan pintas</p><p className="mt-1 text-xs text-ink-foreground/60">Dukungan untuk memahami prosesnya.</p></div></div><div className="flex items-center gap-4 py-3 sm:px-7"><Clock3 className="size-7 shrink-0 text-primary" strokeWidth={1.5}/><div><p className="text-sm font-bold">Waktu lebih tertata</p><p className="mt-1 text-xs text-ink-foreground/60">Rencana pengerjaan yang jelas.</p></div></div><div className="flex items-center gap-4 py-3 sm:pl-7"><LockKeyhole className="size-7 shrink-0 text-primary" strokeWidth={1.5}/><div><p className="text-sm font-bold">Privasi tetap terjaga</p><p className="mt-1 text-xs text-ink-foreground/60">Dokumenmu ditangani dengan hati-hati.</p></div></div></div></section>

        <section id="layanan" className="scroll-mt-6 py-18 sm:py-24"><div className="mx-auto max-w-[1200px] px-5"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">LAYANAN PILIHAN</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Temukan bantuan yang tepat.</h2><p className="mt-3 max-w-[550px] text-sm leading-7 text-muted-foreground">Setiap kebutuhan punya pendekatannya sendiri. Jelajahi layanan yang dirancang untuk membantumu melangkah lebih jauh.</p></div><span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-muted-foreground">{visible.length} layanan ditampilkan <ArrowRight className="size-4" /></span></div>
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">{categories.map((item) => <Button key={item} variant={category === item ? "dark" : "outline"} size="sm" className="shrink-0 px-4" onClick={() => setCategory(item)}>{item}</Button>)}</div>
          {visible.length ? <div className="mt-7 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{visible.map((service) => <article key={service.title} className="group min-w-0"><div className="relative aspect-[1.45] overflow-hidden bg-muted"><img src={service.image} alt={service.alt} width={800} height={640} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />{service.tag && <span className="absolute left-0 top-4 bg-ink px-3 py-2 text-[10px] font-bold uppercase text-ink-foreground">{service.tag}</span>}</div><div className="border-x border-b border-border px-5 pb-5 pt-4"><div className="flex items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary">{service.category}</span><span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Star className="size-3" /> Ulasan segera hadir</span></div><h3 className="mt-3 text-lg font-bold">{service.title}</h3><p className="mt-2 min-h-12 text-xs leading-6 text-muted-foreground">{service.description}</p><div className="mt-4 flex items-center justify-between border-t border-border pt-4"><div><p className="text-[11px] text-muted-foreground">{service.duration}</p><p className="mt-1 text-xs font-bold">Harga sesuai kebutuhan</p></div><Button variant="outline" size="sm" onClick={() => setSelected(service)}>Lihat Detail <ArrowUpRight /></Button></div></div></article>)}</div> : <div className="mt-7 border border-border px-6 py-14 text-center"><Search className="mx-auto size-7 text-muted-foreground"/><h3 className="mt-4 font-bold">Layanan tidak ditemukan</h3><p className="mt-2 text-sm text-muted-foreground">Coba kata kunci atau kategori lain.</p><Button className="mt-5" variant="outline" onClick={() => { setQuery(""); setCategory("Semua Layanan"); }}>Lihat semua layanan</Button></div>}
        </div></section>

        <section id="cara-kerja" className="scroll-mt-6 bg-surface py-18 sm:py-24"><div className="mx-auto max-w-[1200px] px-5"><div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">LANGKAH DEMI LANGKAH</p><h2 className="mt-3 max-w-[480px] text-3xl font-bold leading-tight sm:text-4xl">Bagaimana cara kerjanya?</h2></div><p className="max-w-[450px] text-sm leading-7 text-muted-foreground">Alur yang sederhana membuatmu tahu apa yang dibutuhkan, apa yang sedang berjalan, dan apa yang akan kamu terima.</p></div><div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">{[{n:"01",title:"Pilih layanan",body:"Cari dukungan yang sesuai dengan kebutuhan belajarmu."},{n:"02",title:"Jelaskan kebutuhan",body:"Bagikan konteks, tujuan, dan tenggat yang kamu miliki."},{n:"03",title:"Pantau progres",body:"Ikuti tahapan pengerjaan secara lebih transparan."},{n:"04",title:"Unduh hasil",body:"Tinjau materi pendukung dan berikan masukan bila perlu."}].map((step) => <div className="border-t-2 border-foreground pt-5" key={step.n}><span className="text-4xl font-extrabold text-primary">{step.n}</span><h3 className="mt-7 text-base font-bold">{step.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{step.body}</p></div>)}</div></div></section>

        <section className="py-18 sm:py-24"><div className="mx-auto grid max-w-[1200px] gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">KENAPA TEMANTUGAS?</p><h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Dukungan yang terasa lebih jelas, dari awal hingga akhir.</h2><p className="mt-5 text-sm leading-7 text-muted-foreground">Bukan sekadar hasil akhir. Kami percaya proses yang tertata membantu kamu memahami pekerjaanmu sendiri dengan lebih baik.</p><Button variant="editorial" size="lg" className="mt-7" asChild><a href="#faq">Pertanyaan umum <ArrowUpRight /></a></Button></div><div className="grid gap-0 sm:grid-cols-2">{[{icon:MessageCircle,title:"Komunikasi yang jelas",body:"Sampaikan kebutuhan dan tetap tahu arah pengerjaan."},{icon:FileText,title:"Sesuai kebutuhanmu",body:"Dukungan disesuaikan dengan topik dan cakupan yang kamu pilih."},{icon:ShieldCheck,title:"Dokumen lebih aman",body:"Privasi file dan informasi menjadi bagian dari prioritas kami."},{icon:Sparkles,title:"Fokus pada proses belajar",body:"Masukan yang membantu kamu berkembang, bukan menggantikan peranmu."}].map(({icon:Icon,title,body}) => <div className="border-b border-border py-6 sm:border-l sm:px-7" key={title}><Icon className="size-6 text-primary" strokeWidth={1.5}/><h3 className="mt-5 text-sm font-bold">{title}</h3><p className="mt-2 text-xs leading-6 text-muted-foreground">{body}</p></div>)}</div></div></section>

        <section className="bg-primary py-12 text-primary-foreground"><div className="mx-auto grid max-w-[1200px] gap-6 px-5 sm:grid-cols-3 sm:gap-0"><div className="sm:border-r sm:border-primary-foreground/30 sm:pr-8"><p className="text-4xl font-extrabold">06</p><p className="mt-2 text-sm">pilihan layanan untuk dijelajahi</p></div><div className="sm:border-r sm:border-primary-foreground/30 sm:px-8"><p className="text-4xl font-extrabold">04</p><p className="mt-2 text-sm">langkah alur pendampingan</p></div><div className="sm:pl-8"><p className="text-4xl font-extrabold">01</p><p className="mt-2 text-sm">tujuan: proses belajar yang lebih baik</p></div></div></section>

        <section className="py-18 sm:py-24"><div className="mx-auto max-w-[1200px] px-5"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">CERITA PENGGUNA</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Ruang untuk pendapatmu.</h2></div><span className="text-xs text-muted-foreground">Ulasan asli akan tampil saat layanan tersedia.</span></div><div className="mt-8 grid gap-5 md:grid-cols-2"><div className="flex min-h-44 flex-col justify-between border border-border p-7"><p className="text-base font-semibold leading-7">“Setelah sesi konsultasi, saya jadi lebih paham bagaimana menyusun langkah penelitian saya sendiri.”</p><p className="mt-8 text-xs text-muted-foreground">Contoh ilustrasi ulasan • Konsultasi Tugas</p></div><div className="flex min-h-44 flex-col justify-between border border-border p-7"><p className="text-base font-semibold leading-7">“Masukan pada struktur tulisan membantu saya memperbaiki naskah dengan lebih percaya diri.”</p><p className="mt-8 text-xs text-muted-foreground">Contoh ilustrasi ulasan • Penyuntingan Makalah</p></div></div></div></section>

        <section id="faq" className="scroll-mt-6 border-t border-border bg-surface py-18 sm:py-24"><div className="mx-auto grid max-w-[1200px] gap-9 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"><div><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">FAQ</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Pertanyaan yang sering diajukan.</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">Hal-hal penting yang perlu kamu tahu sebelum memilih layanan.</p></div><Accordion type="single" collapsible className="border-t border-border">{[{q:"Layanan apa saja yang tersedia?",a:"TemanTugas menampilkan konsultasi, penyuntingan, desain presentasi, pendampingan olah data, review skripsi, dan desain infografis."},{q:"Apakah TemanTugas mengerjakan ujian atau tugas atas nama saya?",a:"Tidak. Layanan kami berfokus pada bimbingan, masukan, dan dukungan dokumen. Tanggung jawab akademik dan keputusan akhir tetap berada pada kamu."},{q:"Bagaimana estimasi waktu pengerjaan ditentukan?",a:"Estimasi bergantung pada jenis layanan, cakupan kebutuhan, dan jadwal yang disepakati. Waktu yang terlihat pada kartu layanan adalah gambaran awal."},{q:"Apakah saya dapat meminta revisi?",a:"Ruang lingkup revisi akan mengikuti paket layanan yang dipilih. Rincian paket dan ketentuan akan ditampilkan saat pemesanan tersedia."},{q:"Bagaimana keamanan file saya?",a:"Privasi dan keamanan dokumen menjadi prioritas dalam rancangan layanan. Ketentuan penyimpanan dan akses akan dijelaskan sebelum fitur pengiriman file diluncurkan."}].map(({q,a}) => <AccordionItem value={q} key={q}><AccordionTrigger className="py-5 text-left text-sm font-bold hover:no-underline">{q}</AccordionTrigger><AccordionContent className="max-w-[560px] text-sm leading-7 text-muted-foreground">{a}</AccordionContent></AccordionItem>)}</Accordion></div></section>

        <section className="border-y border-border py-10"><div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-5 sm:flex-row sm:items-center sm:gap-7"><div className="grid size-12 shrink-0 place-items-center border border-primary text-primary"><GraduationCap className="size-6"/></div><div><h2 className="text-base font-bold">Komitmen pada integritas akademik</h2><p className="mt-2 text-xs leading-6 text-muted-foreground">TemanTugas mendukung proses belajar melalui konsultasi, penyuntingan, dan panduan. Kami tidak menyediakan layanan joki ujian, penyamaran identitas, atau kecurangan akademik.</p></div></div></section>
      </main>

      <footer className="bg-ink text-ink-foreground"><div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]"><div><div className="text-xl font-extrabold">teman<span className="text-primary">tugas</span>.</div><p className="mt-5 max-w-[300px] text-xs leading-6 text-ink-foreground/60">Ruang pendampingan untuk belajar, berkarya, dan menyusun ide dengan lebih percaya diri.</p></div><div><h3 className="text-xs font-bold uppercase">Jelajahi</h3><div className="mt-5 flex flex-col gap-3 text-xs text-ink-foreground/60"><a href="#layanan" className="hover:text-ink-foreground">Layanan</a><a href="#cara-kerja" className="hover:text-ink-foreground">Cara Kerja</a><a href="#faq" className="hover:text-ink-foreground">FAQ</a></div></div><div><h3 className="text-xs font-bold uppercase">Bantuan & kebijakan</h3><div className="mt-5 flex flex-col gap-3 text-xs text-ink-foreground/60"><a href="#faq" className="hover:text-ink-foreground">Pusat bantuan</a><a href="#faq" className="hover:text-ink-foreground">Privasi & ketentuan</a><a href="#faq" className="hover:text-ink-foreground">Integritas akademik</a></div></div><div><h3 className="text-xs font-bold uppercase">Terhubung</h3><p className="mt-5 text-xs leading-6 text-ink-foreground/60">Informasi kontak dan media sosial akan diumumkan saat layanan diluncurkan.</p></div></div><div className="border-t border-line-light"><div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-2 px-5 py-6 text-[11px] text-ink-foreground/50 sm:flex-row"><span>© 2026 TemanTugas. Semua hak dilindungi.</span><span>Dirancang untuk mendukung proses belajar yang bertanggung jawab.</span></div></div></footer>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}><DialogContent className="max-w-xl rounded-none border-border p-0"><DialogHeader className="p-6 pb-0"><DialogTitle className="text-xl">{selected?.title}</DialogTitle><DialogDescription>{selected?.category}</DialogDescription></DialogHeader>{selected && <div className="px-6 pb-6"><img src={selected.image} alt={selected.alt} className="mt-5 aspect-[2.3] w-full object-cover"/><p className="mt-5 text-sm leading-7 text-muted-foreground">{selected.description} Pendampingan ini dirancang untuk membantumu memahami dan menyempurnakan pekerjaanmu sendiri.</p><div className="mt-5 grid grid-cols-2 gap-4 border-y border-border py-4 text-xs"><span><Clock3 className="mb-2 size-4 text-primary"/>{selected.duration}</span><span><FileCheck2 className="mb-2 size-4 text-primary"/>Harga sesuai kebutuhan</span></div><Button className="mt-6 w-full" onClick={() => { setSelected(null); setNotice("order"); }}>Mulai Pesanan <ArrowRight /></Button></div>}</DialogContent></Dialog>
      <Dialog open={!!notice} onOpenChange={(open) => { if (!open) setNotice(null); }}><DialogContent className="max-w-md rounded-none border-border"><DialogHeader><DialogTitle className="text-xl">{notice === "login" ? "Akun TemanTugas" : "Pemesanan segera hadir"}</DialogTitle><DialogDescription className="pt-3 leading-6">{notice === "login" ? "Fitur masuk dan akun sedang disiapkan. Untuk sekarang, kamu dapat menjelajahi layanan dan cara kerjanya di beranda." : "Alur pemesanan masih dalam tahap perancangan. Sementara itu, jelajahi layanan yang tersedia untuk melihat dukungan yang paling sesuai."}</DialogDescription></DialogHeader><Button className="mt-3 w-full" onClick={() => { setNotice(null); jumpToServices(); }}>Jelajahi layanan <ArrowRight /></Button></DialogContent></Dialog>
    </div>
  );
}