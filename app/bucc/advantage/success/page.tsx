"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, CalendarDays, Clock, Video } from "lucide-react";
import {
  BUCC_EVENT_NAME,
  BUCC_TAGLINE,
  BUCC_DATE_LABEL,
  BUCC_TIME_LABEL,
  BUCC_PLATFORM,
  BUCC_MEETING_URL,
} from "@/lib/bucc";

const WHATSAPP_PHONE = "2349160465678";

function whatsAppUrl(name: string) {
  const lines = [
    `Hello! I just registered for ${BUCC_EVENT_NAME} (${BUCC_DATE_LABEL}).`,
    name ? `Name: ${name}` : "",
    "",
    "Please add me to the reminder group. Thank you!",
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
              Seat Reserved
            </span>
          </div>
          <h1 className="text-white text-2xl font-bold">
            {firstName ? `You're in, ${firstName}! 🎉` : "You're in! 🎉"}
          </h1>
          <p className="text-red-100 text-sm mt-1">
            {BUCC_EVENT_NAME} — {BUCC_TAGLINE}
          </p>
        </div>

        <div className="px-8 py-7 space-y-6">
          <div className="rounded-xl border border-line-subtle bg-surface-sunken divide-y divide-line-subtle">
            {[
              [CalendarDays, "Date", BUCC_DATE_LABEL],
              [Clock, "Time", BUCC_TIME_LABEL],
              [Video, "Where", BUCC_PLATFORM],
            ].map(([Icon, label, value]) => {
              const I = Icon as typeof CalendarDays;
              return (
                <div key={label as string} className="flex items-center gap-3 px-5 py-3.5">
                  <I size={17} className="text-brand-ink flex-shrink-0" />
                  <span className="text-sm text-fg-faint w-14">{label as string}</span>
                  <span className="text-sm font-semibold text-fg">{value as string}</span>
                </div>
              );
            })}
          </div>

          <p className="text-fg-muted text-sm leading-relaxed">
            {BUCC_MEETING_URL
              ? "Your confirmation email has the join link — save it now so you don't hunt for it on the night."
              : `We've emailed your confirmation. The ${BUCC_PLATFORM} link goes out a few hours before we start.`}
          </p>

          {BUCC_MEETING_URL && (
            <a
              href={BUCC_MEETING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[var(--astar-navy)] text-white py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            >
              Save the join link <ArrowRight size={18} />
            </a>
          )}

          <a
            href={whatsAppUrl(name)}
            className="w-full bg-[var(--astar-red)] text-white py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-brand-hover transition-all shadow-lg"
          >
            Get reminders on WhatsApp <ArrowRight size={18} />
          </a>

          <p className="text-center text-xs text-fg-faint">
            Bring a friend from your class — they can register at{" "}
            <a href="/bucc/advantage" className="font-semibold text-brand-ink underline">
              astartutorials.com/bucc/advantage
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BuccSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
