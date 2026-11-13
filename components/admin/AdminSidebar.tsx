'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  MessageSquare,
  Briefcase,
  CreditCard,
  Users,
  Settings,
  Building2,
  LogOut,
  Loader2,
  X,
  BarChart2,
  ClipboardList,
  Sparkles,
  BookOpen,
  UserPlus,
  CalendarRange,
  Ticket,
  Megaphone,
} from "lucide-react";
import type { AppRole } from "@/lib/rbac";
import { ADMIN_ROUTES } from "@/lib/admin-routes";
import { useAdminUser } from "@/lib/admin-context";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type NavMeta = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  /** Other paths that should light this entry up (pages with no link of their own). */
  alsoActive?: string[];
};

type NavItem = NavMeta & { roles: AppRole[] };

/**
 * Label, icon and grouping only — who may see each entry comes from
 * ADMIN_ROUTES, the same map the middleware gates on, so the sidebar can no
 * longer offer a link that redirects (or hide one that is actually reachable).
 *
 * Schedule Tutorial has no entry: it is a button on the Tutorials page and the
 * dashboard, and lights up Tutorials. Settings lives in the footer.
 */
const NAV_GROUPS: { label: string | null; items: NavMeta[] }[] = [
  {
    label: null,
    items: [{ name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Tutorials",
    items: [
      { name: "Tutorials", href: "/admin/tutorials", icon: GraduationCap, alsoActive: ["/admin/create-tutorial"] },
      { name: "Feedback",  href: "/admin/feedback",  icon: MessageSquare },
    ],
  },
  {
    label: "Programmes",
    items: [
      { name: "Semester Plan",       href: "/admin/semester-plan", icon: CalendarRange },
      { name: "Freshers' Advantage", href: "/admin/tfa",           icon: Ticket        },
      { name: "BUCC Advantage",      href: "/admin/bucc",          icon: Sparkles      },
      { name: "Playbook Series",     href: "/admin/playbooks",     icon: BookOpen      },
      { name: "Student Intake",      href: "/admin/intake",        icon: UserPlus      },
    ],
  },
  {
    label: "People",
    items: [
      { name: "Ambassadors",        href: "/admin/ambassadors",  icon: Megaphone },
      { name: "Tutor Applications", href: "/admin/applications", icon: Users     },
      { name: "Careers",            href: "/admin/careers",      icon: Briefcase },
    ],
  },
  {
    label: "Admin",
    items: [
      { name: "Payments",      href: "/admin/payments",   icon: CreditCard    },
      { name: "Organisations", href: "/admin/orgs",       icon: Building2     },
      { name: "Activity Log",  href: "/admin/audit-logs", icon: ClipboardList },
    ],
  },
];

const withRoles = (item: NavMeta): NavItem => ({
  ...item,
  roles: ADMIN_ROUTES.find((r) => r.href === item.href)?.roles ?? [],
});

const GROUPS = NAV_GROUPS.map((g) => ({ ...g, items: g.items.map(withRoles) }));
const SETTINGS = withRoles({ name: "Settings", href: "/admin/settings", icon: Settings });

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

  const canSee = (item: NavItem) => !role || item.roles.includes(role);
  const itemActive = (item: NavItem) =>
    isActive(item.href) || (item.alsoActive ?? []).some(isActive);

  // Groups a role can't see anything in disappear, label and all.
  const visibleGroups = GROUPS
    .map((g) => ({ ...g, items: g.items.filter(canSee) }))
    .filter((g) => g.items.length > 0);

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
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {visibleGroups.map((group) => (
            <div key={group.label ?? "top"} className={group.label ? "mt-5" : undefined}>
              {group.label && (
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = itemActive(item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        active
                          ? "bg-white/10 text-white font-semibold"
                          : "text-white/50 hover:text-white/90 hover:bg-white/5"
                      }`}
                    >
                      <item.icon size={16} className="flex-shrink-0" />
                      <span className="text-sm">{item.name}</span>
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D93025]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
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

          <div className="flex items-center gap-1">
            {canSee(SETTINGS) && (
              <Link
                href={SETTINGS.href}
                onClick={onClose}
                aria-current={itemActive(SETTINGS) ? "page" : undefined}
                className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-xs transition-all ${
                  itemActive(SETTINGS)
                    ? "bg-white/10 text-white font-semibold"
                    : "text-white/50 hover:text-white/90 hover:bg-white/5"
                }`}
              >
                <Settings size={15} className="flex-shrink-0" />
                <span>Settings</span>
              </Link>
            )}

            {/* PostHog analytics link — super_admin only */}
            {role === 'super_admin' && (
              <a
                href="https://app.posthog.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Analytics (PostHog)"
                aria-label="Analytics (opens PostHog)"
                className="flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-xs transition-all text-white/50 hover:text-white/90 hover:bg-white/5"
              >
                <BarChart2 size={15} className="flex-shrink-0" />
                <span>Analytics</span>
              </a>
            )}

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Log out"
              aria-label="Log out"
              className="flex items-center justify-center px-2.5 py-2 rounded-lg text-white/50 hover:text-white/90 hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <Loader2 size={15} className="animate-spin flex-shrink-0" />
              ) : (
                <LogOut size={15} className="flex-shrink-0" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
