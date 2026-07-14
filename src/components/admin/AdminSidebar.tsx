"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, DollarSign, Smartphone, Tag, Settings, LogOut, Menu, X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface AdminSidebarProps { userEmail: string; }

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const menuItems = [
    { href: "/admin", label: t("admin.dashboard"), icon: LayoutDashboard },
    { href: "/admin/prices", label: t("admin.prices"), icon: DollarSign },
    { href: "/admin/models", label: t("admin.models"), icon: Smartphone },
    { href: "/admin/brands", label: t("admin.brands"), icon: Tag },
    { href: "/admin/settings", label: t("admin.settings"), icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-primary-900 text-white">
      <div className="flex items-center justify-between p-4 border-b border-primary-800">
        {!collapsed && (
          <div className="overflow-hidden">
            <h2 className="font-bold text-sm whitespace-nowrap">{t("admin.adminPanel")}</h2>
            <p className="text-[10px] text-blue-300 truncate">{userEmail}</p>
          </div>
        )}
        <Button variant="ghost" size="icon" className="text-blue-300 hover:text-white hover:bg-primary-800 hidden md:flex" onClick={() => setCollapsed(!collapsed)}>
          <ChevronLeft size={18} className={cn("transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                isActive ? "bg-primary-700 text-white font-medium" : "text-blue-200 hover:bg-primary-800 hover:text-white")}>
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-2">
        <LanguageSwitcher className="justify-center py-1" />
      </div>

      <div className="p-2 border-t border-primary-800">
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-blue-200 hover:bg-red-800/50 hover:text-red-200 transition-colors">
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">{t("admin.logout")}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Button variant="ghost" size="icon" className="fixed top-3 left-3 z-50 md:hidden bg-primary-800 text-white hover:bg-primary-700 shadow-lg" onClick={() => setMobileOpen(true)}>
        <Menu size={20} />
      </Button>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 shadow-xl">
            <div className="absolute top-3 right-3 z-10"><Button variant="ghost" size="icon" className="text-white hover:bg-primary-800" onClick={() => setMobileOpen(false)}><X size={18} /></Button></div>
            {sidebarContent}
          </div>
        </div>
      )}
      <aside className={cn("hidden md:flex flex-col transition-all duration-300", collapsed ? "w-16" : "w-56")}>
        {sidebarContent}
      </aside>
    </>
  );
}
