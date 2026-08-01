"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";

const WHATSAPP_PHONE = "2349160465678";

type Booking = {
  full_name: string;
  email: string;
  phone: string | null;
  course: string | null;
  notes: string | null;
};

function buildWhatsAppUrl(b: Booking, ref: string) {
  const lines = [
    "Hello! I just registered for the Pre-Clinicals Introductory Online Classes (Aug 2026).",
    "",
    `Name: ${b.full_name}`,
    b.phone ? `Phone: ${b.phone}` : "",
    b.notes ? b.notes.replace(/ \| /g, "\n") : "",
    `Payment Reference: ${ref}`,
    "",
    "Please add me to the class community. Thank you!",
  ].filter(Boolean);
  return `https://api.whatsapp.com/send/?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
    lines.join("\n")
  )}&type=phone_number&app_absent=0`;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") ?? "";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loadError, setLoadError] = useState(!ref);

  useEffect(() => {
    if (!ref) return;
    fetch(`/api/bookings/${ref}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setLoadError(true);
          return;
        }
        setBooking(d);
      })
      .catch(() => setLoadError(true));
  }, [ref]);

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--astar-bg)]">
        <div className="text-center">
          <p className="text-gray-500 mb-2">We couldn&apos;t find your registration.</p>
          <a href="/preclinicals" className="text-[var(--astar-red)] font-semibold underline text-sm">
            Back to Pre-Clinicals
          </a>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--astar-bg)]">
        <Loader2 className="animate-spin text-[var(--astar-red)]" size={28} />
      </div>
    );
  }

  const whatsappUrl = buildWhatsAppUrl(booking, ref);

  return (
    <div className="min-h-screen bg-[var(--astar-bg)] flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="bg-[var(--astar-red)] px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="text-white" size={22} />
            <span className="text-white font-bold text-sm uppercase tracking-wide">
              Registration Confirmed
            </span>
          </div>
          <h1 className="text-white text-2xl font-bold">
            You&apos;re in, {booking.full_name.split(" ")[0]}! 🎉
          </h1>
          <p className="text-red-100 text-sm mt-1">
            Your spot in the Pre-Clinicals Introductory Classes (3rd – 30th August 2026) is secured.
          </p>
        </div>

        <div className="px-8 py-7 space-y-5">
          <p className="text-gray-600 text-sm leading-relaxed">
            One last step — tap below to message us on WhatsApp so we can add you to the class
            community and share your schedule, quizzes and resources. A receipt has also been sent to{" "}
            <span className="font-semibold text-gray-800">{booking.email}</span>.
          </p>

          <a
            href={whatsappUrl}
            className="w-full bg-[var(--astar-red)] text-white py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg"
          >
            Continue on WhatsApp <ArrowRight size={18} />
          </a>

          <p className="text-center text-[11px] text-gray-400">
            Reference: <span className="font-mono">{ref}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PreClinicalsSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
