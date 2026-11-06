import type { Metadata } from "next";
import TfaLanding from "@/components/tfa/TfaLanding";

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
  },
  twitter: {
    card: "summary",
    title: "The Freshers' Advantage 2.0 | A-Star Tutorials",
    description,
  },
};

export default function TfaPage() {
  return <TfaLanding />;
}
