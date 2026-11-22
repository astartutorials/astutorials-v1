import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Tag,
  MessageCircle,
  Gift,
  GraduationCap,
  User,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  BadgeCheck,
  Monitor,
  Briefcase,
} from "lucide-react";
import ProgrammeRecord from "@/components/about/ProgrammeRecord";

/*
 * Order: what students get, who teaches them, track record, then the story and
 * the people behind it. History and team come from Paul's About draft
 * (2026-11-20). Left out on purpose: the "7,000+" figure (WhatsApp group
 * members, with duplicates) and Dr. Ajibade, until he agrees to be named.
 * One team grid: co-founder cards, then wider tinted cards for managers and tutors.
 */

export const metadata: Metadata = {
  title: "About Us",
  description:
    "A-Star Tutorials runs group and one-on-one tutorials at Babcock University, taught by students who aced the course. Started in 2023 as Ad Astra.",
  alternates: {
    canonical: "https://www.astartutorials.com/about",
  },
};

// Promises a student could catch us breaking, not adjectives (picked by the
// user, 2026-11-22). Keep each one true: if one stops being so, change it here.
const promises = [
  {
    icon: Tag,
    title: "The price you see is the price you pay",
    desc: "Every session and plan shows its price before you book.",
  },
  {
    icon: GraduationCap,
    title: "We won't promise you a grade",
    desc: "Nobody can honestly sell you an A. We teach the course properly and help you prepare for it.",
  },
  {
    icon: MessageCircle,
    title: "You can reach a person",
    desc: "Message us on WhatsApp before or after you pay, and someone on the team replies.",
  },
  {
    icon: Gift,
    title: "Some help should be free",
    desc: "The Freshers' Advantage, the BUCC Advantage and the Playbook webinars have all been free to attend.",
  },
];

const cofounders = [
  {
    name: "Paul Olabode Upah",
    role: "Chief Executive Officer",
    photo: "/tfa/panellists/upah.jpg",
    does: "Biochemistry student at Babcock. Leads and manages A-Star's day-to-day operations.",
  },
  {
    name: "Dr. Uchenna Aguocha-Ohiagbaji",
    role: "Chief Financial Officer",
    photo: "/tfa/panellists/aguocha.jpg",
    does: "Medical doctor, Babcock alum and finance coach. Manages A-Star's finances and the finance team.",
  },
  {
    name: "Majuyi O. D. Dunmade",
    role: "Chief Technology Officer",
    photo: "/about/dunmade.jpg",
    does: "Babcock CS grad. Manages A-Star's technology and the technical team.",
  },
];

const groups = [
  {
    icon: Briefcase,
    title: "Managers",
    desc: "Our tutor, resource, finance and media managers keep sessions, materials, payments and socials running.",
    href: "/careers",
    cta: "See open roles",
  },
  {
    icon: GraduationCap,
    title: "Tutors",
    desc: "Students who aced the courses they teach. They're who you'll actually meet.",
    href: "/apply",
    cta: "Become a tutor",
  },
];

const services = [
  {
    icon: GraduationCap,
    title: "Group Tutorials",
    desc: "Interactive sessions with coursemates, working through the hard topics together.",
    href: "/tutorials",
  },
  {
    icon: User,
    title: "Private 1-on-1 Tutorials",
    desc: "A tutor's full attention on your weak spots, at your pace.",
    href: "/tutorials?type=private",
  },
  {
    icon: BookOpen,
    title: "Exam Mock Sessions",
    desc: "Intensive revision before exams, built around what actually gets tested.",
    href: "/tutorials",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--astar-bg)] font-sans pt-24 md:pt-32 pb-16">
      {/* Intro */}
      <section className="max-w-[1100px] mx-auto px-6">
        <span className="text-xs font-bold tracking-widest uppercase text-brand-ink">About Us</span>
        <h1 className="mt-3 text-4xl md:text-6xl font-bold tracking-tight text-fg-strong max-w-3xl">
          Tutorials by students who&apos;ve already passed the course.
        </h1>
        <p className="mt-6 text-lg text-fg-muted leading-relaxed max-w-2xl">
          A-Star Tutorials runs group tutorials, one-on-one sessions and exam mocks for Babcock
          University students, taught by students who earned an A in the course.
        </p>
      </section>

      {/* Services */}
      <section className="max-w-[1100px] mx-auto px-6 mt-16 md:mt-20">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-fg-strong">What we offer</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {services.map(({ icon: Icon, title, desc, href }) => (
            <Link
              key={title}
              href={href}
              className="group p-6 rounded-2xl bg-surface-raised border border-line-subtle hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <Icon className="w-6 h-6 text-brand-ink mb-4" />
              <h3 className="font-bold text-fg-strong mb-2">{title}</h3>
              <p className="text-sm text-fg-subtle leading-relaxed mb-5">{desc}</p>
              <span className="inline-flex items-center text-xs font-bold tracking-widest uppercase text-brand-ink">
                Learn more
                <ArrowRight className="w-3 h-3 ml-2 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Tutors */}
      <section className="max-w-[1100px] mx-auto px-6 mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-fg-strong">Who teaches you</h2>
          <p className="mt-4 text-fg-muted leading-relaxed">
            Every A-Star tutor is a high-performing student who earned an A in the exact course they
            teach, and passed our vetting before taking a single session. They know the course
            outline, the lecturers and the topics that come up, because they sat the same exams
            not long ago.
          </p>
        </div>
        <ul className="space-y-4">
          <li className="flex gap-4 p-5 rounded-2xl bg-surface-raised border border-line-subtle">
            <BadgeCheck className="w-6 h-6 text-brand-ink shrink-0" />
            <div>
              <p className="font-semibold text-fg-strong">An A in the course, then vetting</p>
              <p className="text-sm text-fg-subtle mt-1">Tutors only teach courses they&apos;ve aced.</p>
            </div>
          </li>
          <li className="flex gap-4 p-5 rounded-2xl bg-surface-raised border border-line-subtle">
            <Monitor className="w-6 h-6 text-brand-ink shrink-0" />
            <div>
              <p className="font-semibold text-fg-strong">In person or online</p>
              <p className="text-sm text-fg-subtle mt-1">Meet on campus, or join on Zoom or Google Meet.</p>
            </div>
          </li>
        </ul>
      </section>

      {/* Programmes track record */}
      <ProgrammeRecord />

      {/* Story */}
      <section className="max-w-[1100px] mx-auto px-6 mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-10 items-start">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-fg-strong">How it started</h2>
        <div className="space-y-4 text-fg-muted leading-relaxed">
          <p>
            We started A-Star in November 2023 as Ad Astra, Latin for &ldquo;to the stars&rdquo;, a
            tutorial initiative at Babcock. The aim was simple: too many capable students were
            underperforming, and good academic help was hard to find.
          </p>
          <p>
            We started with a handful of courses and a few students who needed help. Today we
            support students across several departments, and in October 2025 Ad Astra became
            A-Star Tutorials.
          </p>
        </div>
      </section>

      {/* Team: co-founders, managers and tutors, one grid */}
      <section className="max-w-[1100px] mx-auto px-6 mt-16 md:mt-20">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-fg-strong">The team</h2>
        <p className="mt-3 text-fg-muted max-w-2xl">
          The people who co-founded and built A-Star, and the managers and tutors who run it with them.
        </p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
          {cofounders.map(({ name, role, photo, does }) => (
            <div
              key={name}
              className="lg:col-span-2 flex flex-col items-center text-center p-6 rounded-2xl bg-surface-raised border border-line-subtle"
            >
              <Image src={photo} alt={name} width={160} height={160} className="w-20 h-20 rounded-full object-cover mb-5" />
              <h3 className="font-bold text-fg-strong">{name}</h3>
              <p className="text-xs font-bold tracking-widest uppercase text-brand-ink mt-1">{role}</p>
              <p className="text-sm text-fg-subtle leading-relaxed mt-3">{does}</p>
            </div>
          ))}
          {groups.map(({ icon: Icon, title, desc, href, cta }) => (
            <Link
              key={title}
              href={href}
              className="group lg:col-span-3 flex items-start gap-5 p-6 rounded-2xl bg-brand-soft border border-line-subtle hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-surface-raised flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-brand-ink" />
              </div>
              <div>
                <h3 className="font-bold text-fg-strong">{title}</h3>
                <p className="text-sm text-fg-muted leading-relaxed mt-1.5">{desc}</p>
                <span className="mt-3 inline-flex items-center text-xs font-bold tracking-widest uppercase text-brand-ink">
                  {cta}
                  <ArrowRight className="w-3 h-3 ml-2 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Promises */}
      <section className="max-w-[1100px] mx-auto px-6 mt-16 md:mt-20">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-fg-strong">What you can hold us to</h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {promises.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-2xl bg-surface-raised border border-line-subtle">
              <div className="w-11 h-11 rounded-full bg-brand-soft flex items-center justify-center mb-5">
                <Icon className="w-5 h-5 text-brand-ink" />
              </div>
              <h3 className="font-bold text-fg-strong mb-2">{title}</h3>
              <p className="text-sm text-fg-subtle leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-[1100px] mx-auto px-6 mt-16 md:mt-20">
        <div className="rounded-3xl bg-surface-raised border border-line-subtle p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-fg-strong">Where to find us</h2>
            <ul className="mt-6 space-y-4 text-fg-muted">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-ink shrink-0 mt-0.5" />
                <span>Babcock University, Ilishan-Remo, Ogun State</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-ink shrink-0" />
                <a href="tel:+2349160465678" className="hover:text-fg-strong transition-colors">+234 916 046 5678</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-ink shrink-0" />
                <a href="mailto:support@astartutorials.com" className="hover:text-fg-strong transition-colors">
                  support@astartutorials.com
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 md:justify-self-end">
            <Link
              href="/tutorials"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--astar-red)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Book a Tutorial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line-subtle px-6 py-3 text-sm font-semibold text-fg-strong hover:bg-surface-sunken transition-colors"
            >
              Become a Tutor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
