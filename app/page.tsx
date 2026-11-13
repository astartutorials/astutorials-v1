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
import { SUPPORT_EMAIL } from "@/lib/faq";

export const metadata: Metadata = {
  title: "A-Star Tutorials | Academic Excellence for Tertiary Students",
  description:
    "A-Star Tutorials offers personalized one-on-one and group tutoring for tertiary institution students in Nigeria. Achieve academic excellence with expert tutors.",
  alternates: {
    canonical: "https://astartutorials.com",
  },
};

/** Tells search engines who A-Star is: name, logo, contact and social profiles. */
const organisationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "A-Star Tutorials",
  url: "https://astartutorials.com",
  logo: "https://astartutorials.com/brand/icon-512.png",
  email: SUPPORT_EMAIL,
  telephone: "+2349160465678",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Babcock University",
    addressLocality: "Ilishan-Remo",
    addressRegion: "Ogun State",
    addressCountry: "NG",
  },
  sameAs: [
    "https://instagram.com/astartutorialshq",
    "https://tiktok.com/@astartutorialshq",
    "https://linkedin.com/company/astartutorials",
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--astar-bg)] font-sans selection:bg-[var(--astar-red)] selection:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJsonLd) }} />

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