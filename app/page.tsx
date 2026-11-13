import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import TfaCTA from "@/components/home/TfaCTA";
import StudentIntakeCTA from "@/components/home/StudentIntakeCTA";
import AmbassadorCTA from "@/components/home/AmbassadorCTA";
import BuccClassesCTA from "@/components/home/BuccClassesCTA";
import PlaybookSeriesCTA from "@/components/home/PlaybookSeriesCTA";
import BuccCTA from "@/components/home/BuccCTA";
import PreClinicalsCTA from "@/components/home/PreClinicalsCTA";
import WaysToLearn from "@/components/home/WaysToLearn";
import Testimonials from "@/components/home/Testimonials";
import BecomeTutor from "@/components/home/BecomeTutor";
import FAQ from "@/components/home/FAQ";
import ClosingCTA from "@/components/home/ClosingCTA";

export const metadata: Metadata = {
  title: "A-Star Tutorials | Academic Excellence for Tertiary Students",
  description:
    "A-Star Tutorials offers personalized one-on-one and group tutoring for tertiary institution students in Nigeria. Achieve academic excellence with expert tutors.",
  alternates: {
    canonical: "https://astartutorials.com",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--astar-bg)] font-sans selection:bg-[var(--astar-red)] selection:text-white">

      <section className="flex-grow flex flex-col items-center pt-24 md:pt-32 overflow-x-clip">

        <HeroSection />

        <TfaCTA />

        <StudentIntakeCTA />

        <AmbassadorCTA />

        <BuccClassesCTA />

        <PlaybookSeriesCTA />

        <BuccCTA />

        <PreClinicalsCTA />

        <WaysToLearn />

        <Testimonials />

        <BecomeTutor />

        <FAQ />

        <ClosingCTA />

      </section>
    </div>
  );
}