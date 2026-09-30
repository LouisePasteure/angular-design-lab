import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Clock3, FileCheck2, ShieldCheck } from "lucide-react";
import workspace from "@/assets/hero-workspace.jpg";

const highlights = [
  { icon: ShieldCheck, title: "Data terlindungi" },
  { icon: Clock3, title: "Progres terpantau" },
  { icon: FileCheck2, title: "Revisi terarah" },
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <aside className="relative isolate hidden overflow-hidden bg-ink text-ink-foreground lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <img src={workspace} alt="" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/90 to-ink/55" />
        <Link to="/" className="w-fit text-xl font-extrabold">
          teman<span className="text-primary">tugas</span><span className="text-primary">.</span>
        </Link>
        <div>
          <p className="max-w-[420px] text-[32px] font-extrabold leading-[1.2]">
            Belajar lebih terarah, dengan teman yang tepat<span className="text-primary">.</span>
          </p>
          <div className="mt-10 grid grid-cols-3 gap-5 border-t border-line-light pt-7">
            {highlights.map(({ icon: Icon, title }) => (
              <div key={title}>
                <Icon className="size-5 text-primary" strokeWidth={1.5} />
                <p className="mt-3 text-xs font-semibold">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="text-lg font-extrabold lg:invisible">
            teman<span className="text-primary">tugas</span><span className="text-primary">.</span>
          </Link>
          <Link to="/" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
            Kembali ke beranda
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-14 sm:px-8">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
