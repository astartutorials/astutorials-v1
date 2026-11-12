'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { usePrograms } from "@/components/shared/programmes";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { SEMESTER_PLAN_HREF, SEMESTER_PLAN_NAME } from "@/lib/semester-plan";
import { AMBASSADOR_HREF, AMBASSADOR_COMMISSIONS } from "@/lib/ambassador";

/**
 * A floating pill: inset from the edges, frosted, with a soft border. Links
 * get a highlight that follows the pointer, the current page is marked, and
 * the CTA carries an arrow badge. Inspired by marloden.com (2026-11-12).
 */

const LINKS = [
  { name: "Tutorials", href: "/tutorials" },
  { name: "About", href: "/about" },
  { name: "FAQs", href: "/faq" },
];

/** Ways to work with A-Star, grouped so the row stays short. */
const JOIN_US = [
  { name: "Become a Tutor", href: "/apply", blurb: "Teach the courses you aced, around your timetable." },
  {
    name: "Become an Ambassador",
    href: AMBASSADOR_HREF,
    blurb: `Earn ₦${AMBASSADOR_COMMISSIONS.group.toLocaleString()} to ₦${AMBASSADOR_COMMISSIONS.private.toLocaleString()} for every referral.`,
  },
  { name: "Careers", href: "/careers", blurb: "Open roles on the A-Star team." },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The red CTA with an arrow badge that turns on hover. */
function CtaPill({ href, label, onClick, compact = false }: { href: string; label: string; onClick?: () => void; compact?: boolean }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group inline-flex items-center gap-2 rounded-full bg-[var(--astar-red)] font-semibold text-white shadow-lg shadow-red-500/20 hover:bg-brand-hover transition-colors whitespace-nowrap ${
        compact ? "py-1 pl-3.5 pr-1 text-xs" : "py-1.5 pl-5 pr-1.5 text-sm"
      }`}
    >
      {label}
      <span className={`flex items-center justify-center rounded-full bg-white text-[var(--astar-red)] transition-transform duration-300 group-hover:rotate-45 ${compact ? "h-6 w-6" : "h-7 w-7"}`}>
        <ArrowUpRight size={compact ? 14 : 16} strokeWidth={2.5} />
      </span>
    </Link>
  );
}

/** A dropdown that opens on hover or click and closes on outside click or Escape. */
function Dropdown({ label, badge, children }: { label: string; badge?: ReactNode; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative z-10 flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium text-fg-muted hover:text-fg-strong transition-colors"
      >
        {badge}
        {label}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {/* No gap between trigger and panel: a gap drops the hover on the way down. */}
      <div
        className={`absolute left-1/2 top-full w-[19rem] -translate-x-1/2 pt-3 transition-all duration-200 ${
          open ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-1"
        }`}
      >
        <div className="rounded-2xl border border-[var(--nav-border)] bg-[var(--nav-bg-scrolled)] p-2 shadow-xl backdrop-blur-xl">
          {children(() => setOpen(false))}
        </div>
      </div>
    </div>
  );
}

function MenuItem({ href, name, blurb, tag, muted = false, onClick }: { href: string; name: string; blurb: string; tag?: string; muted?: boolean; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className={`group/item block rounded-xl px-3.5 py-3 transition-colors ${muted ? "hover:bg-surface-sunken" : "hover:bg-brand-soft"}`}>
      <span className="flex items-center justify-between gap-3">
        <span className={`text-sm font-semibold transition-colors ${muted ? "text-fg-muted group-hover/item:text-fg" : "text-fg group-hover/item:text-brand-ink"}`}>{name}</span>
        {tag && (
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${muted ? "border border-line bg-surface-sunken text-fg-faint" : "bg-[var(--astar-red)] text-white"}`}>
            {tag}
          </span>
        )}
      </span>
      <span className={`mt-0.5 block text-xs ${muted ? "text-fg-faint" : "text-fg-subtle"}`}>{blurb}</span>
    </Link>
  );
}

const LiveDot = (
  <span className="relative flex h-2 w-2">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-ink opacity-75" />
    <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--astar-red)]" />
  </span>
);

export default function Navbar() {
  const pathname = usePathname() ?? "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePastOpen, setMobilePastOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const programmes = usePrograms();
  const currentProgrammes = programmes.filter((p) => p.open);
  const pastProgrammes = programmes.filter((p) => !p.open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setMobileOpen(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6">
      <div
        className={`relative mx-auto flex max-w-6xl items-center justify-between rounded-full border py-1.5 pl-4 pr-1.5 backdrop-blur-xl transition-all duration-300 md:pl-5 ${
          scrolled || mobileOpen
            ? "border-[var(--nav-border)] bg-[var(--nav-bg-scrolled)] shadow-lg shadow-black/5"
            : "border-[var(--nav-border)] bg-[var(--nav-bg)] shadow-sm"
        }`}
      >
        {/* Mark + wordmark side by side, so the name is legible at nav size
            (the stacked logo's name came out too small). Phones get a smaller
            mark so the wordmark fits beside the CTA; tablets drop the wordmark
            because the links need the room; very narrow phones (<360px) show
            the mark only. Traced SVGs cropped to the artwork (2026-11-12). */}
        <Link href="/" className="relative z-10 flex shrink-0 items-center gap-2 lg:gap-2.5" aria-label="A-Star Tutorials home">
          {/* Dark mode swaps in lighter versions: deep red reads poorly on navy. */}
          <Image src="/brand/astar-mark.svg" alt="" width={1706} height={1425} unoptimized priority className="h-6 w-auto md:h-8 dark:hidden" />
          <Image src="/brand/astar-mark-on-dark.svg" alt="" width={1706} height={1425} unoptimized priority className="hidden h-6 w-auto md:h-8 dark:block" />
          <Image src="/brand/astar-wordmark.svg" alt="A-Star Tutorials" width={4230} height={475} unoptimized priority className="hidden h-[11px] w-auto min-[360px]:block md:hidden lg:block lg:h-[15px] dark:hidden" />
          <Image src="/brand/astar-wordmark-on-dark.svg" alt="A-Star Tutorials" width={4230} height={475} unoptimized priority className="hidden h-[11px] w-auto lg:h-[15px] dark:min-[360px]:block dark:md:hidden dark:lg:block" />
        </Link>

        {/* --- DESKTOP LINKS --- */}
        <div className="hidden items-center md:flex" onMouseLeave={() => setHovered(null)}>
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => setHovered(link.href)}
                aria-current={active ? "page" : undefined}
                className={`relative whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  active ? "text-fg-strong" : "text-fg-muted hover:text-fg-strong"
                }`}
              >
                {/* One highlight that slides between links as the pointer moves. */}
                {hovered === link.href && (
                  <motion.span
                    layoutId="nav-hover"
                    className="absolute inset-0 rounded-full bg-[var(--astar-navy)]/[0.07] dark:bg-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{link.name}</span>
                {active && <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--astar-red)]" />}
              </Link>
            );
          })}

          <div onMouseEnter={() => setHovered(null)}>
            <Dropdown label="Join us">
              {(closeMenu) => JOIN_US.map((j) => <MenuItem key={j.href} {...j} onClick={closeMenu} />)}
            </Dropdown>
          </div>

          {programmes.length > 0 && (
            <div onMouseEnter={() => setHovered(null)}>
              <Dropdown label="Programmes" badge={currentProgrammes.length > 0 ? LiveDot : undefined}>
                {(closeMenu) => (
                  <>
                    {currentProgrammes.map((p) => (
                      <MenuItem key={p.key} href={p.href} name={p.name} blurb={p.blurb} tag={p.tag} onClick={closeMenu} />
                    ))}
                    {pastProgrammes.length > 0 && (
                      <div className={currentProgrammes.length > 0 ? "mt-2 border-t border-[var(--nav-border)] pt-2" : ""}>
                        <p className="px-3.5 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-fg-faint">Past programmes</p>
                        {pastProgrammes.map((p) => (
                          <MenuItem key={p.key} href={p.href} name={p.name} blurb={p.pastBlurb} tag="Past" muted onClick={closeMenu} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </Dropdown>
            </div>
          )}
        </div>

        {/* --- ACTIONS --- */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          {/* The Semester Plan leads everywhere (Uche, 2026-11-12). */}
          {/* The full label needs the room only large screens have. */}
          <span className="hidden lg:inline-flex">
            <CtaPill href={SEMESTER_PLAN_HREF} label={SEMESTER_PLAN_NAME} />
          </span>
          <span className="lg:hidden">
            <CtaPill href={SEMESTER_PLAN_HREF} label="Semester Plan" compact />
          </span>
          <button
            className="relative flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-full border border-[var(--nav-border)] bg-surface-raised md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span className={`block h-[1.5px] w-4 rounded-full bg-fg transition-all duration-300 ${mobileOpen ? "translate-y-[6.5px] rotate-45" : ""}`} />
            <span className={`block h-[1.5px] w-4 rounded-full bg-fg transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block h-[1.5px] w-4 rounded-full bg-fg transition-all duration-300 ${mobileOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU: a floating card under the pill --- */}
      <div
        className={`mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl border border-[var(--nav-border)] bg-[var(--nav-bg-scrolled)] shadow-xl backdrop-blur-xl transition-all duration-300 md:hidden ${
          mobileOpen ? "visible max-h-[80vh] overflow-y-auto opacity-100" : "invisible max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 p-4">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              className={`rounded-2xl px-4 py-3 text-lg font-semibold transition-colors hover:bg-surface-sunken ${
                isActive(pathname, link.href) ? "text-brand-ink" : "text-fg"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <p className="px-4 pb-1 pt-4 text-xs font-bold uppercase tracking-[0.18em] text-fg-faint">Join us</p>
          {JOIN_US.map((j) => <MenuItem key={j.href} {...j} onClick={close} />)}

          {programmes.length > 0 && (
            <>
              <p className="px-4 pb-1 pt-4 text-xs font-bold uppercase tracking-[0.18em] text-fg-faint">Programmes</p>
              {currentProgrammes.map((p) => (
                <MenuItem key={p.key} href={p.href} name={p.name} blurb={p.blurb} tag={p.tag} onClick={close} />
              ))}
              {/* Collapsed by default: the live cohorts are what a phone visitor came for. */}
              {pastProgrammes.length > 0 && (
                <>
                  <button
                    onClick={() => setMobilePastOpen((v) => !v)}
                    aria-expanded={mobilePastOpen}
                    className="flex items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-fg-faint"
                  >
                    Past programmes ({pastProgrammes.length})
                    <ChevronDown size={14} className={`transition-transform duration-200 ${mobilePastOpen ? "rotate-180" : ""}`} />
                  </button>
                  {mobilePastOpen &&
                    pastProgrammes.map((p) => (
                      <MenuItem key={p.key} href={p.href} name={p.name} blurb={p.pastBlurb} tag="Past" muted onClick={close} />
                    ))}
                </>
              )}
            </>
          )}

          <div className="px-2 pt-4">
            <ThemeToggle variant="segmented" />
          </div>
          <div className="flex flex-col gap-2 px-2 pb-2 pt-3">
            <Link
              href={SEMESTER_PLAN_HREF}
              onClick={close}
              className="block w-full rounded-full bg-[var(--astar-red)] px-6 py-3.5 text-center text-base font-semibold text-white"
            >
              {SEMESTER_PLAN_NAME}
            </Link>
            <Link
              href="/tutorials"
              onClick={close}
              className="block w-full rounded-full border border-line px-6 py-3.5 text-center text-base font-semibold text-fg"
            >
              Book a Tutorial
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
