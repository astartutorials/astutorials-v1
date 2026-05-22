'use client';

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { AdminProvider } from "@/lib/admin-context";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AdminProvider>
      <div className="min-h-screen bg-[var(--astar-bg)] flex">
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main content — shifted right on desktop */}
        <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
          {/* Mobile top bar */}
          <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Menu size={22} />
            </button>

            <div className="absolute left-1/2 -translate-x-1/2">
              <div className="w-8 h-8 relative">
                <Image src="/logo.png" alt="A-Star" fill className="object-contain" />
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-[#D93025]/15 text-[#D93025] flex items-center justify-center font-bold text-xs">
              AD
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-5 md:p-8">{children}</main>
        </div>
      </div>
    </AdminProvider>
  );
}
