"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { SEMESTER_PLAN_NAME, SEMESTER_PLAN_TERM } from "@/lib/semester-plan";

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
    `Hello! We just paid for the ${SEMESTER_PLAN_NAME} (${SEMESTER_PLAN_TERM}).`,
    "",
    `Student: ${b.full_name}`,
    b.phone ? `Phone: ${b.phone}` : "",
    b.notes ? b.notes.replace(/ \| /g, "\n") : "",
    `Payment Reference: ${ref}`,
    "",
    "Please help us confirm the courses and get the student matched with a tutor. Thank you!",
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
          <p className="text-fg-subtle mb-2">We couldn&apos;t find your payment.</p>
          <a href="/semester-plan" className="text-brand-ink font-semibold underline text-sm">
            Back to the Full Semester Plan
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
              Payment Confirmed
            </span>
          </div>
          <h1 className="text-white text-2xl font-bold">
            {booking.full_name.split(" ")[0]}&apos;s semester is sorted! 🎉
          </h1>
          <p className="text-red-100 text-sm mt-1">
            {booking.course ?? SEMESTER_PLAN_NAME}
          </p>
        </div>

        <div className="px-8 py-7 space-y-5">
          <p className="text-fg-muted text-sm leading-relaxed">
            One last step: tap below to message us on WhatsApp so we can confirm the courses, match
            a tutor and share the timetable. A receipt has also been sent to{" "}
            <span className="font-semibold text-fg">{booking.email}</span>.
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

export default function SemesterPlanSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
