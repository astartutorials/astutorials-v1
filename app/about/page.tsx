import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  Target,
  Award,
  GraduationCap,
  User,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  BadgeCheck,
  Monitor,
} from "lucide-react";
import ProgrammeRecord from "@/components/about/ProgrammeRecord";

/*
 * Every claim on this page is one the site already makes elsewhere (Who We Are,
 * Services, FAQ, Footer, the programmes registry). Nothing here is new copy
 * about the company's history, founders or numbers. Add those once the team
 * confirms them, not before.
 */

export const metadata: Metadata = {
  title: "About Us",
  description:
    "A-Star Tutorials is a student-driven academic support system at Babcock University, offering group and one-on-one tutorials taught by students who aced the course.",
  alternates: {
    canonical: "https://astartutorials.com/about",
  },
};

const values = [
  { icon: Users, title: "Supportive Community", desc: "A welcoming environment where every student matters." },
  { icon: TrendingUp, title: "Growth Mindset", desc: "Fostering continuous learning and improvement." },
  { icon: Target, title: "Student-First Approach", desc: "Tailored approaches for individual success." },
  { icon: Award, title: "Academic Discipline", desc: "Building strong foundations for excellence." },
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
          A-Star Tutorials is a student-driven academic support system built to help tertiary
          institution students excel. We provide structured tutorials, easy-to-understand guidance,
          and a supportive learning community.
        </p>
      </section>

      {/* Values */}
      <section className="max-w-[1100px] mx-auto px-6 mt-16 md:mt-20">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-fg-strong">What we stand for</h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map(({ icon: Icon, title, desc }) => (
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

      {/* Programmes track record */}
      <ProgrammeRecord />

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
