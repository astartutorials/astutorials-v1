"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import {
  TFA_EVENT_NAME,
  TFA_THEME,
  TFA_DATE_LABEL,
  TFA_TIME_LABEL,
  TFA_VENUE_SHORT,
} from "@/lib/tfa";

const WHATSAPP_PHONE = "2349160465678";

function whatsAppUrl(name: string) {
  const lines = [
    `Hello! I just registered for ${TFA_EVENT_NAME} (${TFA_DATE_LABEL}).`,
    name ? `Name: ${name}` : "",
    "",
    "Please send me reminders. Thank you!",
  ].filter(Boolean);
  return `https://api.whatsapp.com/send/?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
    lines.join("\n")
  )}&type=phone_number&app_absent=0`;
}

function SuccessContent() {
  const name = useSearchParams().get("name") ?? "";
  const firstName = name.trim().split(" ")[0];

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
            {firstName ? `You're in, ${firstName}! 🎉` : "You're in! 🎉"}
          </h1>
          <p className="text-red-100 text-sm mt-1">
            {TFA_EVENT_NAME} · {TFA_THEME}
          </p>
        </div>

        <div className="px-8 py-7 space-y-6">
          <div className="rounded-xl border border-line-subtle bg-surface-sunken divide-y divide-line-subtle">
            {(
              [
                [CalendarDays, "Date", TFA_DATE_LABEL],
                [Clock, "Time", TFA_TIME_LABEL],
                [MapPin, "Venue", TFA_VENUE_SHORT],
              ] as const
            ).map(([Icon, label, value]) => (
              <div key={label} className="flex items-center gap-3 px-5 py-3.5">
                <Icon size={17} className="text-brand-ink flex-shrink-0" />
                <span className="text-sm text-fg-faint w-14">{label}</span>
                <span className="text-sm font-semibold text-fg">{value}</span>
              </div>
            ))}
          </div>

          <p className="text-fg-muted text-sm leading-relaxed">
            We&apos;ve emailed your confirmation. Arrival and registration start at 10:00 AM, so
            come early to get a good seat.
          </p>

          <a
            href={whatsAppUrl(name)}
            className="w-full bg-[var(--astar-red)] text-white py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-brand-hover transition-all shadow-lg"
          >
            Get reminders on WhatsApp <ArrowRight size={18} />
          </a>

          <p className="text-center text-xs text-fg-faint">
            Bring a friend. They can register at{" "}
            <a href="/tfa" className="font-semibold text-brand-ink underline">
              astartutorials.com/tfa
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TfaSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
