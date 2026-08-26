import type { Metadata } from "next";
import BuccLanding from "@/components/bucc/BuccLanding";

export const metadata: Metadata = {
  title: "The BUCC Advantage — Your Blueprint for Thriving in 200 Level",
  description:
    "A free 90-minute academic & mentorship experience for BUCC 200-level students. Honest advice, real study systems and a live Q&A with high-performing Babcock School of Computing students. Friday, 28th August 2026, 7:00 pm.",
  alternates: { canonical: "/bucc" },
  openGraph: {
    title: "The BUCC Advantage | A-Star Tutorials",
    description:
      "100 level got you into BUCC. 200 level is where you build your academic reputation. Free 90-minute webinar — Friday, 28th August 2026, 7:00 pm.",
    url: "https://astartutorials.com/bucc",
    type: "website",
    images: [
      {
        url: "/bucc/og.jpg",
        width: 1200,
        height: 630,
        alt: "The BUCC Advantage — Your Blueprint for Thriving in 200 Level. 28th August 2026 on Google Meet.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The BUCC Advantage | A-Star Tutorials",
    description:
      "100 level got you into BUCC. 200 level is where you build your academic reputation. Free 90-minute webinar — Friday, 28th August 2026, 7:00 pm.",
    images: ["/bucc/og.jpg"],
  },
};

export default function BuccPage() {
  return <BuccLanding />;
}
