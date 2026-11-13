import type { Metadata } from "next";
import TfaLanding from "@/components/tfa/TfaLanding";
import { TFA_FLYER, TFA_EVENT_NAME, TFA_STARTS_AT, TFA_ENDS_AT, TFA_VENUE_SHORT } from "@/lib/tfa";
import { EventJsonLd } from "@/lib/event-jsonld";

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
  return (
    <>
      <EventJsonLd
        event={{
          name: TFA_EVENT_NAME,
          description,
          path: "/tfa",
          start: TFA_STARTS_AT,
          end: TFA_ENDS_AT,
          images: [TFA_FLYER.src],
          online: false,
          venue: TFA_VENUE_SHORT,
          address: "Babcock University Teaching Hospital (BUTH)",
        }}
      />
      <TfaLanding />
    </>
  );
}
