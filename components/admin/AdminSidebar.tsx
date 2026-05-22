'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  PlusCircle,
  MessageSquare,
  Briefcase,
  CreditCard,
  Users,
  Settings,
  Building2,
  LogOut,
  Loader2,
  X,
} from "lucide-react";
import type { AppRole } from "@/lib/rbac";
import { useAdminUser } from "@/lib/admin-context";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type NavItem = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles: AppRole[];
};

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard",         href: "/admin/dashboard",       icon: LayoutDashboard, roles: ['super_admin', 'org_admin', 'tutor_manager', 'tutor', 'viewer'] },
  { name: "Organisations",     href: "/admin/orgs",            icon: Building2,       roles: ['super_admin'] },
  { name: "Tutorials",         href: "/admin/tutorials",       icon: GraduationCap,   roles: ['super_admin', 'org_admin', 'tutor_manager', 'tutor', 'viewer'] },
  { name: "Schedule Tutorial", href: "/admin/create-tutorial", icon: PlusCircle,      roles: ['super_admin', 'org_admin', 'tutor_manager'] },
  { name: "Feedback",          href: "/admin/feedback",        icon: MessageSquare,   roles: ['super_admin', 'org_admin', 'tutor_manager', 'tutor', 'viewer'] },
  { name: "Careers",           href: "/admin/careers",         icon: Briefcase,       roles: ['super_admin'] },
  { name: "Applications",      href: "/admin/applications",    icon: Users,           roles: ['super_admin'] },
  { name: "Payments",          href: "/admin/payments",        icon: CreditCard,      roles: ['super_admin', 'org_admin', 'tutor_manager', 'viewer'] },
  { name: "Settings",          href: "/admin/settings",        icon: Settings,        roles: ['super_admin', 'org_admin', 'tutor_manager', 'tutor', 'viewer'] },
];

const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  org_admin: 'Org Admin',
  tutor_manager: 'Tutor Manager',
  tutor: 'Tutor',
  viewer: 'Viewer',
};

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { name: adminName, email: adminEmail, role } = useAdminUser();

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  const isActive = (path: string) =>
    pathname === path || pathname?.startsWith(`${path}/`);

  const visibleItems = role
    ? NAV_ITEMS.filter(item => item.roles.includes(role))
    : NAV_ITEMS;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`w-60 bg-[#0F172A] min-h-screen text-white flex flex-col fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo area */}
        <div className="relative px-5 py-5 flex items-center gap-3 border-b border-white/10">
          <div className="w-9 h-9 relative flex-shrink-0">
            <Image src="/logo.png" alt="A-Star Logo" fill className="object-contain" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">A-Star</p>
            <p className="text-white/40 text-[10px] uppercase tracking-widest leading-tight">Admin Panel</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-white/50 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-0.5 overflow-y-auto">
          {visibleItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
                  active
                    ? "bg-white/10 text-white font-semibold"
                    : "text-white/50 hover:text-white/90 hover:bg-white/5"
                }`}
              >
                <item.icon size={18} className="flex-shrink-0" />
                <span className="text-sm">{item.name}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D93025]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user + logout */}
        <div className="border-t border-white/10 p-3 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-[#D93025]/20 text-[#D93025] flex items-center justify-center font-bold text-xs flex-shrink-0">
              {adminName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "AD"}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{adminName}</p>
              {role && <p className="text-white/40 text-[10px] truncate">{ROLE_LABELS[role]}</p>}
              <p className="text-white/40 text-[10px] truncate">{adminEmail}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-white/50 hover:text-white/90 hover:bg-white/5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <Loader2 size={18} className="animate-spin flex-shrink-0" />
            ) : (
              <LogOut size={18} className="flex-shrink-0" />
            )}
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
