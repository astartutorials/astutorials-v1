'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePreClinicalsOpen } from "@/components/shared/usePreClinicalsOpen";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Retires itself when the cohort ends, without needing a redeploy.
  const preClinicalsOpen = usePreClinicalsOpen();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Tutorials', href: '/tutorials' },
    { name: 'About', href: '/#about' },
    { name: 'Join the Team', href: '/careers' },
    { name: 'Become a Tutor', href: '/apply' },
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
        ? 'bg-[#FDFAF6]/95 backdrop-blur-md border-b border-amber-100/60 shadow-sm'
        : 'bg-[#FDFAF6]/70 backdrop-blur-sm border-transparent'
        }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 py-2 flex items-center justify-between relative">

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
            width={120}
            height={132}
            className="h-10 md:h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* --- DESKTOP MENU --- */}
        {/* Tight gaps between md and lg — the row carries five links, the promo
            pill and the CTA button, and wraps without them. */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={(e) => {
                if (window.location.pathname === '/' && item.href.startsWith('/#')) {
                  scrollToSection(e, item.href.substring(2));
                }
              }}
              className="nav-link text-sm font-medium text-gray-600 hover:text-black transition-colors relative group whitespace-nowrap"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--astar-red)] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}

          {/* Time-boxed cohort — styled apart from the standing nav items so it
              reads as an announcement rather than another section. */}
          {preClinicalsOpen && (
            <Link
              href="/preclinicals"
              className="flex items-center gap-2 whitespace-nowrap rounded-full border border-red-200 bg-red-50/80 px-3.5 py-1.5 text-sm font-semibold text-[var(--astar-red)] hover:bg-red-100 transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--astar-red)]" />
              </span>
              Pre-Clinicals
            </Link>
          )}
        </div>

        {/* --- ACTIONS & MOBILE TOGGLE --- */}
        <div className="flex items-center gap-4">
          <Link href="/tutorials" className="hidden md:block btn-primary px-5 lg:px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap hover:shadow-lg hover:shadow-red-500/20 transform hover:-translate-y-0.5 transition-all">
            Book a Tutorial
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
          md:hidden absolute top-[100%] left-0 w-full bg-[#FDFAF6]/95 backdrop-blur-xl shadow-xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]
          ${isMobileMenuOpen ? 'max-h-[600px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}
        `}
      >
        <div className="p-6 flex flex-col gap-2">
          {preClinicalsOpen && (
            <Link
              href="/preclinicals"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between gap-3 p-4 rounded-xl border border-red-200 bg-red-50 active:bg-red-100 transition-colors"
            >
              <span className="text-lg font-semibold text-[var(--astar-red)]">Pre-Clinicals Classes</span>
              <span className="rounded-full bg-[var(--astar-red)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Now running
              </span>
            </Link>
          )}

          {navItems.map((item, idx) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors group"
              onClick={(e) => {
                if (window.location.pathname === '/' && item.href.startsWith('/#')) {
                  scrollToSection(e, item.href.substring(2));
                }
                setIsMobileMenuOpen(false);
              }}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              <span className="text-lg font-semibold text-gray-800 group-hover:text-[var(--astar-red)] transition-colors">{item.name}</span>
            </Link>
          ))}

          <div className="pt-2 pb-2">
            <Link
              href="/tutorials"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full btn-primary text-center px-6 py-3.5 rounded-full text-base font-semibold hover:shadow-lg hover:shadow-red-500/20 transition-all"
            >
              Book a Tutorial
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}