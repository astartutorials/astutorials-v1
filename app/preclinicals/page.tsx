import type { Metadata } from "next";
import PreClinicalsLanding from "@/components/preclinicals/PreClinicalsLanding";

export const metadata: Metadata = {
  title: "Pre-Clinicals Introductory Online Classes",
  description:
    "Maximise your break and resume pre-clinicals with confidence. Gross Anatomy, Histology, Embryology, Physiology & Biochemistry — tutored by distinction students. 3rd – 30th August 2026. Register for ₦60,000.",
  alternates: { canonical: "/preclinicals" },
  openGraph: {
    title: "Pre-Clinicals Introductory Online Classes | A-Star Tutorials",
    description:
      "Get tutored by distinction students in Anatomy, Histology, Embryology, Physiology & Biochemistry. Daily & weekly quizzes, cash prizes, community. 3rd – 30th August 2026.",
    url: "https://astartutorials.com/preclinicals",
    images: [{ url: "/logo.png", width: 840, height: 840, alt: "A-Star Tutorials Pre-Clinicals Classes" }],
  },
};

export default function PreClinicalsPage() {
  return <PreClinicalsLanding />;
}
