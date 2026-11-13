"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminUser } from "@/lib/admin-context";
import { canAccessAdminPath } from "@/lib/admin-routes";

const TABS = [
  { href: "/admin/semester-plan", label: "Enquiries" },
  { href: "/admin/semester-plan/payments", label: "Payments" },
];

/** Enquiries and Payments, showing only the tabs the user's role can open. */
export default function SemesterPlanTabs() {
  const pathname = usePathname();
  const { role } = useAdminUser();
  const tabs = role ? TABS.filter((t) => canAccessAdminPath(role, t.href)) : [];
  if (tabs.length < 2) return null;

  return (
    <div className="flex gap-1 mb-6 border-b border-gray-200">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`px-4 py-2.5 text-sm font-semibold -mb-px border-b-2 transition-colors ${
              active ? "border-[#D93025] text-[#0B1120]" : "border-transparent text-gray-500 hover:text-[#0B1120]"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
