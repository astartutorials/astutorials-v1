'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { usePrograms } from "@/components/shared/programmes";
import ThemeToggle from "@/components/shared/ThemeToggle";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [programmesOpen, setProgrammesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const programmesRef = useRef<HTMLDivElement>(null);
  // Open programmes and past ones both, evaluated against the visitor's clock.
  const programmes = usePrograms();
  const currentProgrammes = programmes.filter((p) => p.open);
  const pastProgrammes = programmes.filter((p) => !p.open);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the dropdown on an outside click or Escape — it opens on hover and on
  // click, so it needs a dismissal path that isn't "move the mouse away".
  useEffect(() => {
    if (!programmesOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!programmesRef.current?.contains(e.target as Node)) setProgrammesOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProgrammesOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [programmesOpen]);

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
        ? 'bg-[var(--nav-bg-scrolled)] backdrop-blur-md border-b border-[var(--nav-border)] shadow-sm'
        : 'bg-[var(--nav-bg)] backdrop-blur-sm border-transparent'
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
        {/* Tight gaps between md and lg — the row carries five links, the
            Programmes menu and the CTA button, and wraps without them. */}
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
              className="nav-link text-sm font-medium text-fg-muted hover:text-fg-strong transition-colors relative group whitespace-nowrap"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--astar-red)] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}

          {/* Time-boxed cohorts and events, grouped so the nav row stays a fixed
              width however many are running. Past programmes stay listed below
              the current ones — the menu doubles as a track record. */}
          {programmes.length > 0 && (
            <div
              ref={programmesRef}
              className="relative"
              onMouseEnter={() => setProgrammesOpen(true)}
              onMouseLeave={() => setProgrammesOpen(false)}
            >
              <button
                onClick={() => setProgrammesOpen((v) => !v)}
                aria-expanded={programmesOpen}
                aria-haspopup="true"
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-brand-soft-border bg-brand-soft px-3.5 py-1.5 text-sm font-semibold text-brand-ink hover:bg-brand-soft-border transition-colors"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-ink opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--astar-red)]" />
                </span>
                Programmes
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${programmesOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* No gap between trigger and panel — a gap drops the hover and
                  closes the menu as the pointer travels down to it. */}
              <div
                className={`absolute right-0 top-full pt-3 w-[19rem] transition-all duration-200 ${
                  programmesOpen
                    ? 'opacity-100 visible translate-y-0'
                    : 'opacity-0 invisible -translate-y-1'
                }`}
              >
                <div className="rounded-2xl border border-[var(--nav-border)] bg-[var(--nav-bg-scrolled)] backdrop-blur-xl shadow-xl p-2">
                  {currentProgrammes.map((p) => (
                    <Link
                      key={p.key}
                      href={p.href}
                      onClick={() => setProgrammesOpen(false)}
                      className="block rounded-xl px-3.5 py-3 hover:bg-brand-soft transition-colors group/item"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-fg group-hover/item:text-brand-ink transition-colors">
                          {p.name}
                        </span>
                        <span className="shrink-0 rounded-full bg-[var(--astar-red)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          {p.tag}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs text-fg-subtle">{p.blurb}</span>
                    </Link>
                  ))}

                  {/* Muted, and below a rule — a finished cohort is a credential,
                      not something to click through and try to register for. */}
                  {pastProgrammes.length > 0 && (
                    <div className={currentProgrammes.length > 0 ? 'mt-2 pt-2 border-t border-[var(--nav-border)]' : ''}>
                      <p className="px-3.5 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-fg-faint">
                        Past programmes
                      </p>
                      {pastProgrammes.map((p) => (
                        <Link
                          key={p.key}
                          href={p.href}
                          onClick={() => setProgrammesOpen(false)}
                          className="block rounded-xl px-3.5 py-2.5 hover:bg-surface-sunken transition-colors group/item"
                        >
                          <span className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-fg-muted group-hover/item:text-fg transition-colors">
                              {p.name}
                            </span>
                            <span className="shrink-0 rounded-full border border-line bg-surface-sunken px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fg-faint">
                              Past
                            </span>
                          </span>
                          <span className="mt-0.5 block text-xs text-fg-faint">{p.pastBlurb}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- ACTIONS & MOBILE TOGGLE --- */}
        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />

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
            <span className={`block w-6 h-[2px] bg-fg rounded-full transition-all duration-300 ease-out origin-center ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            {/* Middle Line */}
            <span className={`block w-6 h-[2px] bg-fg rounded-full transition-all duration-300 ease-out ${isMobileMenuOpen ? 'opacity-0 -translate-x-2' : 'opacity-100'}`} />
            {/* Bottom Line */}
            <span className={`block w-6 h-[2px] bg-fg rounded-full transition-all duration-300 ease-out origin-center ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* --- MOBILE DROPDOWN MENU (Slide-Down) --- */}
      <div
        className={`
          md:hidden absolute top-[100%] left-0 w-full bg-[var(--nav-bg-scrolled)] backdrop-blur-xl shadow-xl overflow-y-auto transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]
          ${isMobileMenuOpen ? 'max-h-[80vh] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}
        `}
      >
        <div className="p-6 flex flex-col gap-2">
          {/* Same Programmes section as desktop, flattened — a nested accordion
              inside a slide-down menu is a tap too many on a phone. */}
          {programmes.length > 0 && (
            <div className="mb-2">
              <p className="px-1 pb-2 text-xs font-bold uppercase tracking-[0.18em] text-fg-faint">
                Programmes
              </p>
              <div className="flex flex-col gap-2">
                {currentProgrammes.map((p) => (
                  <Link
                    key={p.key}
                    href={p.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between gap-3 p-4 rounded-xl border border-brand-soft-border bg-brand-soft active:bg-brand-soft transition-colors"
                  >
                    <span className="min-w-0">
                      <span className="block text-lg font-semibold text-brand-ink">{p.name}</span>
                      <span className="mt-0.5 block text-xs text-fg-subtle">{p.blurb}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-[var(--astar-red)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      {p.tag}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Quieter styling than the live cohorts, but still tappable —
                  these pages are the record of what we've run. */}
              {pastProgrammes.length > 0 && (
                <>
                  <p className="px-1 pt-4 pb-2 text-xs font-bold uppercase tracking-[0.18em] text-fg-faint">
                    Past programmes
                  </p>
                  <div className="flex flex-col gap-2">
                    {pastProgrammes.map((p) => (
                      <Link
                        key={p.key}
                        href={p.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between gap-3 p-4 rounded-xl border border-line-subtle bg-surface-sunken transition-colors"
                      >
                        <span className="min-w-0">
                          <span className="block text-base font-semibold text-fg-muted">{p.name}</span>
                          <span className="mt-0.5 block text-xs text-fg-faint">{p.pastBlurb}</span>
                        </span>
                        <span className="shrink-0 rounded-full border border-line bg-surface-raised px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-fg-faint">
                          Past
                        </span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {navItems.map((item, idx) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-sunken active:bg-surface-inset transition-colors group"
              onClick={(e) => {
                if (window.location.pathname === '/' && item.href.startsWith('/#')) {
                  scrollToSection(e, item.href.substring(2));
                }
                setIsMobileMenuOpen(false);
              }}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              <span className="text-lg font-semibold text-fg group-hover:text-brand-ink transition-colors">{item.name}</span>
            </Link>
          ))}

          <div className="px-1 pt-2">
            <ThemeToggle variant="segmented" />
          </div>

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
