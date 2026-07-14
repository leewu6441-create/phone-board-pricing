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
              <h1 className="text-base font-bold leading-tight">Bảng Giá Mainboard</h1>
              <p className="text-[10px] text-blue-200 leading-tight">
                {t("nav.updated")}: {today}
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-5">
            <Link href="/" className="text-sm text-blue-100 hover:text-white transition-colors">{t("nav.home")}</Link>
            <Link href="/apple" className="text-sm text-blue-100 hover:text-white transition-colors">🍎 {t("nav.apple")}</Link>
            <Link href="/android" className="text-sm text-blue-100 hover:text-white transition-colors">🤖 {t("nav.android")}</Link>
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
              <Link href="/apple" className="px-3 py-2 text-sm text-blue-100 hover:bg-primary-700 rounded-md" onClick={() => setMobileMenuOpen(false)}>🍎 {t("nav.apple")}</Link>
              <Link href="/android" className="px-3 py-2 text-sm text-blue-100 hover:bg-primary-700 rounded-md" onClick={() => setMobileMenuOpen(false)}>🤖 {t("nav.android")}</Link>
              <Link href="/search" className="px-3 py-2 text-sm text-blue-100 hover:bg-primary-700 rounded-md" onClick={() => setMobileMenuOpen(false)}>🔍 {t("nav.search")}</Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
