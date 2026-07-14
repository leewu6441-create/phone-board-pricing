"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  DollarSign,
  Smartphone,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AdminSidebarProps {
  userEmail: string;
}

const menuItems = [
  { href: "/admin", label: "Bảng điều khiển", icon: LayoutDashboard },
  { href: "/admin/prices", label: "Quản lý giá", icon: DollarSign },
  { href: "/admin/models", label: "Quản lý model", icon: Smartphone },
  { href: "/admin/brands", label: "Quản lý hãng", icon: Tag },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-primary-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary-800">
        {!collapsed && (
          <div className="overflow-hidden">
            <h2 className="font-bold text-sm whitespace-nowrap">Quản Trị</h2>
            <p className="text-[10px] text-blue-300 truncate">{userEmail}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-blue-300 hover:text-white hover:bg-primary-800 hidden md:flex"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          <ChevronLeft
            size={18}
            className={cn(
              "transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-primary-700 text-white font-medium"
                  : "text-blue-200 hover:bg-primary-800 hover:text-white"
              )}
              title={item.label}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-primary-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-blue-200 hover:bg-red-800/50 hover:text-red-200 transition-colors"
          title="Đăng xuất"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Đăng xuất</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden bg-primary-800 text-white hover:bg-primary-700 shadow-lg"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </Button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 shadow-xl">
            <div className="absolute top-3 right-3 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-primary-800"
                onClick={() => setMobileOpen(false)}
              >
                <X size={18} />
              </Button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col transition-all duration-300",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
