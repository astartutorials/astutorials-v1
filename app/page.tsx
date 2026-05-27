import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import WhoWeAre from "@/components/home/WhoWeAre";
import Services from "@/components/home/Services";
import Testimonials from "@/components/home/Testimonials";
import BecomeTutor from "@/components/home/BecomeTutor";
import FAQ from "@/components/home/FAQ";

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

      <section className="flex-grow flex flex-col items-center pt-24 md:pt-32 overflow-hidden">

        <HeroSection />

        <WhoWeAre />

        <Services />

        <Testimonials />

        <BecomeTutor />

        <FAQ />

      </section>
    </div>
  );
}