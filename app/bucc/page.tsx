import type { Metadata } from "next";
import BuccClassesLanding from "@/components/bucc-classes/BuccClassesLanding";

export const metadata: Metadata = {
  title: "BUCC 200L Preparatory Online Classes",
  description:
    "Maximise your break and resume 200 level with confidence. SEN 201, MTH 201, COS 201 & IFT 211 — tutored by distinction students. 7th September – 4th October 2026. Register for ₦60,000.",
  alternates: { canonical: "/bucc" },
  openGraph: {
    title: "BUCC 200L Preparatory Online Classes | A-Star Tutorials",
    description:
      "Get tutored by distinction students in SEN 201, MTH 201, COS 201 & IFT 211. Daily & weekly quizzes, cash prizes, community. 7th September – 4th October 2026.",
    url: "https://astartutorials.com/bucc",
    type: "website",
    images: [
      {
        url: "/bucc-classes/flyer.jpg",
        width: 1080,
        height: 1255,
        alt: "A-Star Tutorials — BUCC 200L Preparatory Online Classes, 7th September – 4th October 2026. SEN 201, MTH 201, COS 201, IFT 211. Registration ₦60,000.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BUCC 200L Preparatory Online Classes | A-Star Tutorials",
    description:
      "Maximise your break and resume 200 level with confidence. Tutored by distinction students. 7th September – 4th October 2026.",
    images: ["/bucc-classes/flyer.jpg"],
  },
};

export default function BuccClassesPage() {
  return <BuccClassesLanding />;
}
