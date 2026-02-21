'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  GraduationCap, 
  PlusCircle, 
  MessageSquare,
  Briefcase,
  CreditCard, 
  Settings, 
  LogOut 
} from "lucide-react";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter()
  
  async function handleLogout(): Promise<void> {
  try {
    const response = await fetch("/api/auth/admin/logout", {
      method: "POST",
      credentials: "include", // important if using httpOnly cookies
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    // Redirect to admin login page
    router.push("/admin/login");

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Logout error:", error.message);
    } else {
      console.error("Unknown logout error");
    }
  }
}

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Tutorials", href: "/admin/tutorials", icon: GraduationCap },
    { name: "Create Tutorial", href: "/admin/create-tutorial", icon: PlusCircle },
    { name: "Feedback", href: "/admin/feedback", icon: MessageSquare },
    { name: "Careers", href: "/admin/careers", icon: Briefcase },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`w-64 bg-[#1E293B] min-h-screen text-white flex flex-col fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Logo Area */}
        <div className="p-6 flex flex-col items-center border-b border-gray-700/50">
          <div className="text-[var(--astar-red)] text-4xl font-black mb-1 flex items-start">
            A<span className="text-blue-400 text-2xl mt-1">★</span>
          </div>
          <div className="font-bold text-sm tracking-wide">A-Star Tutorials</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive(item.href) 
                  ? "bg-white/10 text-white font-semibold" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={20} />
              <span className="text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700/50">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <LogOut size={20} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
