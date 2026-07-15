"use client";

import Link from "next/link";
import { Menu, X, Smartphone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";
import { formatDate } from "@/lib/format";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const today = formatDate(new Date());

  return (
    <header className="sticky top-0 z-40 bg-primary-800 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Smartphone className="h-6 w-6 text-blue-300" />
            <div>
              <h1 className="text-base font-bold leading-tight">Vertex</h1>
              <p className="text-[10px] text-blue-200 leading-tight">
                {t("nav.updated")}: {today}
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-5">
            <Link href="/" className="text-sm text-blue-100 hover:text-white transition-colors">{t("nav.home")}</Link>
            <Link href="/apple" className="text-sm text-blue-100 hover:text-white transition-colors flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 16.97 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.24 4.34 13 3.5Z"/></svg>
              {t("nav.apple")}
            </Link>
            <Link href="/android" className="text-sm text-blue-100 hover:text-white transition-colors flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M6,18c0,0.55 0.45,1 1,1h1v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5V19h2v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5V19h1c0.55,0 1,-0.45 1,-1V8H6V18ZM3.5,8C2.67,8 2,8.67 2,9.5v7c0,0.83 0.67,1.5 1.5,1.5S5,17.33 5,16.5v-7C5,8.67 4.33,8 3.5,8ZM20.5,8c-0.83,0 -1.5,0.67 -1.5,1.5v7c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5v-7c0,-0.83 -0.67,-1.5 -1.5,-1.5ZM15.53,2.16l1.3,-1.3c0.2,-0.2 0.2,-0.51 0,-0.71c-0.2,-0.2 -0.51,-0.2 -0.71,0l-1.48,1.48C13.85,1.23 12.95,1 12,1c-0.96,0 -1.86,0.23 -2.66,0.63L7.85,0.15c-0.2,-0.2 -0.51,-0.2 -0.71,0c-0.2,0.2 -0.2,0.51 0,0.71l1.3,1.3C6.97,3.26 6,5.01 6,7h12c0,-1.99 -0.97,-3.75 -2.47,-4.84Z"/></svg>
              {t("nav.android")}
            </Link>
            <Link href="/search" className="text-sm text-blue-100 hover:text-white transition-colors">{t("nav.search")}</Link>
            <LanguageSwitcher />
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" className="text-white hover:bg-primary-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-primary-700 animate-fade-in">
            <div className="flex flex-col gap-1 pt-3">
              <Link href="/" className="px-3 py-2 text-sm text-blue-100 hover:bg-primary-700 rounded-md" onClick={() => setMobileMenuOpen(false)}>🏠 {t("nav.home")}</Link>
              <Link href="/apple" className="px-3 py-2 text-sm text-blue-100 hover:bg-primary-700 rounded-md flex items-center gap-1.5" onClick={() => setMobileMenuOpen(false)}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 16.97 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.24 4.34 13 3.5Z"/></svg>
                {t("nav.apple")}
              </Link>
              <Link href="/android" className="px-3 py-2 text-sm text-blue-100 hover:bg-primary-700 rounded-md flex items-center gap-1.5" onClick={() => setMobileMenuOpen(false)}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M6,18c0,0.55 0.45,1 1,1h1v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5V19h2v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5V19h1c0.55,0 1,-0.45 1,-1V8H6V18ZM3.5,8C2.67,8 2,8.67 2,9.5v7c0,0.83 0.67,1.5 1.5,1.5S5,17.33 5,16.5v-7C5,8.67 4.33,8 3.5,8ZM20.5,8c-0.83,0 -1.5,0.67 -1.5,1.5v7c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5v-7c0,-0.83 -0.67,-1.5 -1.5,-1.5ZM15.53,2.16l1.3,-1.3c0.2,-0.2 0.2,-0.51 0,-0.71c-0.2,-0.2 -0.51,-0.2 -0.71,0l-1.48,1.48C13.85,1.23 12.95,1 12,1c-0.96,0 -1.86,0.23 -2.66,0.63L7.85,0.15c-0.2,-0.2 -0.51,-0.2 -0.71,0c-0.2,0.2 -0.2,0.51 0,0.71l1.3,1.3C6.97,3.26 6,5.01 6,7h12c0,-1.99 -0.97,-3.75 -2.47,-4.84Z"/></svg>
                {t("nav.android")}
              </Link>
              <Link href="/search" className="px-3 py-2 text-sm text-blue-100 hover:bg-primary-700 rounded-md" onClick={() => setMobileMenuOpen(false)}>🔍 {t("nav.search")}</Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
