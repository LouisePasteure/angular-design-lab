import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BrandWordmark } from "@/components/brand-wordmark";
import { BRAND } from "@/config/brand";

export function GuestAssignmentShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <Link to="/" className="text-lg font-extrabold">
            <BrandWordmark />
          </Link>
          <span className="border border-border px-2 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-muted-foreground">
            Akses penugasan terbatas
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1200px] px-4 py-7 sm:px-6 sm:py-10">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:px-6">
          <span>{BRAND.name} · Akses untuk satu penugasan</span>
          <Link to="/cek-penugasan" className="font-semibold text-primary">
            Keluar ke cek penugasan
          </Link>
        </div>
      </footer>
    </div>
  );
}
