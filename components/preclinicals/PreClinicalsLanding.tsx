"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Stethoscope,
  CheckCircle2,
  Trophy,
  CalendarDays,
  Users,
  Sparkles,
  Video,
  Clock,
  Gift,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import posthog from "posthog-js";
import RegisterModal from "./RegisterModal";

const PRICE = 60000;
const OLD_PRICE = 100000;
const WEBINAR_URL = "https://bit.ly/PCOW2026";

const COURSES = ["Gross Anatomy", "Histology", "Embryology", "Physiology", "Biochemistry"];

const FEATURES = [
  { icon: BadgeCheck, label: "Daily & Weekly quizzes" },
  { icon: Trophy, label: "Cash prizes for top students" },
  { icon: Users, label: "Community interaction" },
];

const SPEAKERS = [
  {
    name: "Oso Ayomikun",
    credential: "Distinction in Anatomy, Physiology & Biochemistry",
    img: "/preclinicals/oso-ayomikun.jpg",
  },
  {
    name: "Uche Favour",
    credential: "Distinction in Anatomy, Physiology & Biochemistry",
    img: "/preclinicals/uche-favour.jpg",
  },
];

const fade = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function PreClinicalsLanding() {
  const [open, setOpen] = useState(false);

  const openModal = (source: string) => {
    posthog.capture("preclinicals_register_clicked", { source });
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--astar-bg)] font-sans selection:bg-[var(--astar-red)] selection:text-white">
      {open && <RegisterModal onClose={() => setOpen(false)} />}

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 md:pt-36 pb-16 md:pb-20">
        {/* graph-paper grid, like the flyer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(53,94,169,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(53,94,169,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 40%, #000 40%, transparent 100%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fade}>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-900/5 border border-blue-900/10 px-4 py-1.5 text-sm font-semibold text-blue-900">
              <CalendarDays size={15} /> 3rd – 30th August 2026
            </span>

            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--astar-red)] leading-[1.05]">
              Pre-Clinicals Introductory
              <br className="hidden sm:block" /> Online Classes
            </h1>

            <p className="mt-6 text-lg md:text-xl text-[var(--astar-navy)] font-medium">
              Maximise your break and resume pre-clinicals with confidence!
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-base md:text-lg text-gray-500">
              <Sparkles size={17} className="text-[var(--astar-red)]" /> Get tutored by distinction
              students!
            </p>

            {/* Pricing + CTA */}
            <div className="mt-9 flex flex-col items-center gap-4">
              <div className="flex items-baseline gap-3">
                <span className="text-gray-400 line-through text-xl">
                  ₦{OLD_PRICE.toLocaleString()}
                </span>
                <span className="text-4xl md:text-5xl font-extrabold text-[var(--astar-navy)]">
                  ₦{PRICE.toLocaleString()}
                </span>
                <span className="text-gray-500 text-lg">only</span>
              </div>
              <button
                onClick={() => openModal("hero")}
                className="group inline-flex items-center gap-2 rounded-full bg-[var(--astar-red)] text-white px-8 py-4 text-base font-bold shadow-lg shadow-red-500/20 hover:bg-red-700 hover:-translate-y-0.5 transition-all"
              >
                Register Now
                <ArrowRight size={19} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-xs text-gray-400">Limited slots · Secure payment via Paystack</p>
            </div>
          </motion.div>
        </div>

        {/* decorative stethoscope */}
        <Stethoscope
          className="pointer-events-none absolute -right-10 top-24 text-blue-900/5 hidden lg:block"
          size={260}
          strokeWidth={1}
        />
      </section>

      {/* ── COURSES + FEATURING ────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Courses card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            className="rounded-3xl bg-blue-900 p-8 md:p-10 text-white shadow-xl"
          >
            <h2 className="text-yellow-300 font-bold tracking-wide text-lg uppercase">Courses</h2>
            <ul className="mt-6 space-y-4">
              {COURSES.map((c) => (
                <li key={c} className="flex items-center gap-3 text-lg md:text-xl font-medium">
                  <CheckCircle2 size={22} className="text-yellow-300 flex-shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Featuring card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            className="rounded-3xl bg-[var(--astar-red)] p-8 md:p-10 text-white shadow-xl"
          >
            <h2 className="text-yellow-300 font-bold tracking-wide text-lg uppercase">Featuring</h2>
            <ul className="mt-6 space-y-5">
              {FEATURES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-lg md:text-xl font-medium">
                  <Icon size={22} className="text-yellow-300 flex-shrink-0" />
                  {label}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-red-100/90 leading-relaxed">
              Learn in a supportive community, stay accountable with regular quizzes, and win cash
              prizes for topping the leaderboard.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FREE ORIENTATION WEBINAR ───────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fade}
          className="rounded-3xl bg-[var(--astar-navy)] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--astar-red)] px-4 py-1.5 text-sm font-bold">
              <Gift size={15} /> Free Orientation Webinar
            </span>
            <h2 className="mt-5 text-2xl md:text-3xl font-bold">
              Pre-Clinicals Orientation Webinar{" "}
              <span className="text-gray-400 font-semibold">(5th Edition)</span>
            </h2>
            <p className="mt-2 text-gray-300 md:text-lg">
              Theme: Simple Strategies for Excelling in Pre-Clinicals MB Exams
            </p>

            {/* Speakers */}
            <div className="mt-4">
              <p className="inline-block rounded-full bg-[var(--astar-red)] px-6 py-1.5 text-lg font-bold">
                Speakers
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6">
              {SPEAKERS.map((s) => (
                <div
                  key={s.name}
                  className="rounded-3xl bg-white p-4 sm:p-5 shadow-lg text-center"
                >
                  <div className="relative mx-auto h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-2xl bg-[var(--astar-red)]">
                    <Image
                      src={s.img}
                      alt={s.name}
                      fill
                      sizes="80px"
                      className="object-cover object-top"
                    />
                  </div>
                  <p className="mt-3 text-base sm:text-lg font-extrabold text-[var(--astar-navy)]">
                    {s.name}
                  </p>
                  <p className="mt-0.5 text-[11px] sm:text-xs font-semibold text-[var(--astar-red)] leading-snug px-1">
                    {s.credential}
                  </p>
                </div>
              ))}
            </div>

            {/* Meta row */}
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm md:text-base">
              <span className="inline-flex items-center gap-2 text-gray-200">
                <Video size={18} className="text-[var(--astar-red)]" /> Google Meet
              </span>
              <span className="inline-flex items-center gap-2 text-gray-200">
                <Clock size={18} className="text-[var(--astar-red)]" /> 3:00 pm
              </span>
              <span className="inline-flex items-center gap-2 text-gray-200">
                <CalendarDays size={18} className="text-[var(--astar-red)]" /> Saturday, 1st August
                2026
              </span>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <a
                href={WEBINAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => posthog.capture("preclinicals_webinar_clicked")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-[var(--astar-navy)] px-7 py-3.5 font-bold hover:bg-gray-100 transition-all"
              >
                Register for the Webinar <ArrowRight size={18} />
              </a>
              <p className="inline-flex items-center gap-2 text-sm text-gray-300">
                <Gift size={16} className="text-[var(--astar-red)]" /> Stand a chance to win a
                ₦10,000 Eduhub &amp; A-Star Tutorials voucher.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 md:pb-28 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fade}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--astar-navy)]">
            Ready to resume with confidence?
          </h2>
          <p className="mt-3 text-gray-500 md:text-lg">
            Secure your spot in the Pre-Clinicals Introductory Classes for{" "}
            <span className="font-semibold text-[var(--astar-navy)]">
              ₦{PRICE.toLocaleString()}
            </span>{" "}
            <span className="line-through text-gray-400">₦{OLD_PRICE.toLocaleString()}</span>.
          </p>
          <button
            onClick={() => openModal("footer")}
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--astar-red)] text-white px-9 py-4 text-base font-bold shadow-lg shadow-red-500/20 hover:bg-red-700 hover:-translate-y-0.5 transition-all"
          >
            Register Now
            <ArrowRight size={19} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </section>
    </div>
  );
}
