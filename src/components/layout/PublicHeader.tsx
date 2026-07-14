"use client";

import Link from "next/link";
import { Menu, X, Smartphone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const today = formatDate(new Date());

  return (
    <header className="sticky top-0 z-40 bg-primary-800 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Smartphone className="h-6 w-6 text-blue-300" />
            <div>
              <h1 className="text-base font-bold leading-tight">{SITE_NAME}</h1>
              <p className="text-[10px] text-blue-200 leading-tight">
                Cập nhật: {today}
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-blue-100 hover:text-white transition-colors"
            >
              Trang chủ
            </Link>
            <Link
              href="/apple"
              className="text-sm text-blue-100 hover:text-white transition-colors"
            >
              🍎 Apple
            </Link>
            <Link
              href="/android"
              className="text-sm text-blue-100 hover:text-white transition-colors"
            >
              🤖 Android
            </Link>
            <Link
              href="/search"
              className="text-sm text-blue-100 hover:text-white transition-colors"
            >
              Tìm kiếm
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-primary-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-primary-700 animate-fade-in">
            <div className="flex flex-col gap-1 pt-3">
              <Link
                href="/"
                className="px-3 py-2 text-sm text-blue-100 hover:bg-primary-700 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                🏠 Trang chủ
              </Link>
              <Link
                href="/apple"
                className="px-3 py-2 text-sm text-blue-100 hover:bg-primary-700 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                🍎 Apple
              </Link>
              <Link
                href="/android"
                className="px-3 py-2 text-sm text-blue-100 hover:bg-primary-700 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                🤖 Android
              </Link>
              <Link
                href="/search"
                className="px-3 py-2 text-sm text-blue-100 hover:bg-primary-700 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                🔍 Tìm kiếm
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
