'use client';

import Link from "next/link";
import Image from "next/image";

export default function BookingNavbar() {
  return (
    <nav className="w-full bg-[#FDFAF6]/95 backdrop-blur-md border-b border-amber-100/60 py-4 px-6 md:px-10 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <Image 
          src="/logo.png" 
          alt="A-Star Logo" 
          width={40} 
          height={40} 
          className="w-8 h-8 md:w-10 md:h-10 object-contain"
        />
        <span className="text-lg md:text-xl font-bold text-[#0B1120]">A-Star Tutorials</span>
      </Link>

      <Link
        href="https://api.whatsapp.com/send/?phone=2349160465678&text=Hi%20Support%2C%20I%20have%20an%20issue%3A%20&type=phone_number&app_absent=0"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:block text-sm font-medium text-gray-500 hover:text-[var(--astar-red)] transition-colors"
      >
        Need help? <span className="text-[var(--astar-red)]">Contact Support</span>
      </Link>
    </nav>
  );
}
