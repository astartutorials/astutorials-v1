import type { Metadata } from "next";
import TfaLanding from "@/components/tfa/TfaLanding";
import { TFA_FLYER } from "@/lib/tfa";

const description =
  "A free event for Babcock freshers. Theme: Equipped for Success. Sunday, 8th November 2026, 10:00 AM at the 600-Seater Auditorium, BUTH. Register now.";

export const metadata: Metadata = {
  title: "The Freshers' Advantage 2.0 — Equipped for Success",
  description,
  alternates: { canonical: "/tfa" },
  openGraph: {
    title: "The Freshers' Advantage 2.0 | A-Star Tutorials",
    description,
    url: "https://astartutorials.com/tfa",
    type: "website",
    images: [{ url: TFA_FLYER.src, width: TFA_FLYER.width, height: TFA_FLYER.height, alt: TFA_FLYER.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Freshers' Advantage 2.0 | A-Star Tutorials",
    description,
    images: [TFA_FLYER.src],
  },
};

export default function TfaPage() {
  return <TfaLanding />;
}
