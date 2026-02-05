'use client';

import { useState } from "react";
import { Menu } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-white z-40 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-600">
            <Menu size={24} />
          </button>
          <span className="font-bold text-gray-900">A-Star Admin</span>
        </div>
      </div>

      {/* Main Content Area - Shifted right by sidebar width on desktop */}
      <div className="flex-1 w-full lg:ml-64 min-h-screen p-4 pt-20 lg:p-8 lg:pt-8 transition-all">
        {children}
      </div>
    </div>
  );
}
