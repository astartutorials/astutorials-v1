'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Menu items list for cleaner mapping
  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Tutoring', href: '/tutorials' },
    { name: 'About Us', href: '/#about' },
    { name: 'Careers', href: '/careers' },
  ];

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${scrolled || isMobileMenuOpen
        ? 'bg-white/95 backdrop-blur-md border-b border-gray-100/50 shadow-sm'
        : 'bg-white/80 backdrop-blur-sm border-transparent'
        }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between relative">

        {/* --- LOGO AREA --- */}
        <Link 
          href="/" 
          className="flex items-center gap-3 z-50 relative group" 
          onClick={(e) => {
            if (window.location.pathname === '/') {
              scrollToSection(e, 'home');
            }
          }}
        >
          <Image 
            src="/logo.png" 
            alt="A-Star Logo" 
            width={48} 
            height={48} 
            className="w-14 h-14 md:w-16 md:h-16 object-contain"
            priority
          />
        </Link>

        {/* --- DESKTOP MENU --- */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={(e) => {
                if (item.href.startsWith('/#')) {
                  scrollToSection(e, item.href.substring(2));
                }
              }}
              className="nav-link text-sm font-medium text-gray-600 hover:text-black transition-colors relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--astar-red)] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* --- ACTIONS & MOBILE TOGGLE --- */}
        <div className="flex items-center gap-4">
          <Link href="#" className="hidden md:block btn-primary px-6 py-2.5 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-red-500/20 transform hover:-translate-y-0.5 transition-all">
            Get Started
          </Link>

          {/* Mobile "Join" (Visible only when menu is closed) */}


          {/* CUSTOM ANIMATED HAMBURGER */}
          <button
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 z-50 relative p-1 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {/* Top Line */}
            <span className={`block w-6 h-[2px] bg-gray-900 rounded-full transition-all duration-300 ease-out origin-center ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            {/* Middle Line */}
            <span className={`block w-6 h-[2px] bg-gray-900 rounded-full transition-all duration-300 ease-out ${isMobileMenuOpen ? 'opacity-0 -translate-x-2' : 'opacity-100'}`} />
            {/* Bottom Line */}
            <span className={`block w-6 h-[2px] bg-gray-900 rounded-full transition-all duration-300 ease-out origin-center ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* --- MOBILE DROPDOWN MENU (Slide-Down) --- */}
      <div
        className={`
          md:hidden absolute top-[100%] left-0 w-full bg-white/95 backdrop-blur-xl  shadow-xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]
          ${isMobileMenuOpen ? 'max-h-[600px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}
        `}
      >
        <div className="p-6 flex flex-col gap-2">
          {navItems.map((item, idx) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors group"
              onClick={(e) => {
                if (item.href.startsWith('/#')) {
                  scrollToSection(e, item.href.substring(2));
                }
              }}
              style={{ transitionDelay: `${idx * 50}ms` }} // Stagger animation effect
            >
              <span className="text-lg font-semibold text-gray-800 group-hover:text-[var(--astar-red)] transition-colors">{item.name}</span>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-[var(--astar-red)] transition-colors" />
            </Link>
          ))}

          <hr className="my-2 border-gray-100" />

          <div className="flex flex-col gap-4 mt-2 px-2 pb-4">
            <Link href="#" className="flex items-center justify-center w-full py-3.5 rounded-full btn-primary font-bold text-sm shadow-lg shadow-red-500/20">
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}