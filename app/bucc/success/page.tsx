"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import {
  BUCC_CLASSES_NAME,
  BUCC_CLASSES_DATE_RANGE,
} from "@/lib/bucc-classes";

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
    `Hello! I just registered for the ${BUCC_CLASSES_NAME} (${BUCC_CLASSES_DATE_RANGE}).`,
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
          <p className="text-fg-subtle mb-2">We couldn&apos;t find your registration.</p>
          <a href="/bucc" className="text-brand-ink font-semibold underline text-sm">
            Back to BUCC 200L Classes
          </a>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--astar-bg)]">
        <Loader2 className="animate-spin text-brand-ink" size={28} />
      </div>
    );
  }

  const whatsappUrl = buildWhatsAppUrl(booking, ref);

  return (
    <div className="min-h-screen bg-[var(--astar-bg)] flex items-center justify-center px-4 py-16">
      <div className="bg-surface-raised rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
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
            Your spot in the {BUCC_CLASSES_NAME} ({BUCC_CLASSES_DATE_RANGE}) is secured.
          </p>
        </div>

        <div className="px-8 py-7 space-y-5">
          <p className="text-fg-muted text-sm leading-relaxed">
            One last step — tap below to message us on WhatsApp so we can add you to the class
            community and share your timetable, quizzes and materials. A receipt has also been sent
            to <span className="font-semibold text-fg">{booking.email}</span>.
          </p>

          <a
            href={whatsappUrl}
            className="w-full bg-[var(--astar-red)] text-white py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-brand-hover transition-all shadow-lg"
          >
            Continue on WhatsApp <ArrowRight size={18} />
          </a>

          <p className="text-center text-[11px] text-fg-faint">
            Reference: <span className="font-mono">{ref}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BuccClassesSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
