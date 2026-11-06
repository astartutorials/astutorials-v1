"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Users, CalendarDays, Clock, MapPin, CalendarPlus, Share2, Check } from "lucide-react";
import {
  TFA_EVENT_NAME,
  TFA_THEME,
  TFA_DATE_LABEL,
  TFA_TIME_LABEL,
  TFA_VENUE_SHORT,
  TFA_SHARE_TEXT,
  TFA_WHATSAPP_GROUP_URL,
  tfaGoogleCalendarUrl,
  tfaIcs,
} from "@/lib/tfa";

function downloadIcs() {
  const url = URL.createObjectURL(new Blob([tfaIcs()], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "freshers-advantage-2.ics";
  a.click();
  URL.revokeObjectURL(url);
}

const secondaryBtn =
  "flex-1 border border-line bg-surface-raised text-fg py-3 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 hover:border-[var(--astar-red)] transition-all";

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
  const [shared, setShared] = useState(false);

  // Native share sheet on phones; elsewhere, copy the invite to the clipboard.
  async function share() {
    if (navigator.share) {
      await navigator.share({ text: TFA_SHARE_TEXT }).catch(() => {});
      return;
    }
    await navigator.clipboard?.writeText(TFA_SHARE_TEXT).catch(() => {});
    setShared(true);
  }

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

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-faint mb-2">
              Add to calendar
            </p>
            <div className="flex gap-2">
              <a href={tfaGoogleCalendarUrl()} target="_blank" rel="noopener noreferrer" className={secondaryBtn}>
                <CalendarPlus size={16} /> Google
              </a>
              <button type="button" onClick={downloadIcs} className={secondaryBtn}>
                <CalendarPlus size={16} /> Apple / Outlook
              </button>
            </div>
          </div>

          <button type="button" onClick={share} className={`w-full ${secondaryBtn}`}>
            {shared ? <><Check size={16} /> Invite copied, paste it to a friend</> : <><Share2 size={16} /> Invite a friend</>}
          </button>

          {/* The last step, and the one that matters most after the day itself:
              the 100L group is where updates and the class community live. */}
          <div className="rounded-xl border border-brand-soft-border bg-brand-soft p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-ink">Last step</p>
            <p className="mt-1 text-sm text-fg-muted leading-relaxed">
              Join the main 100L WhatsApp group for event updates and to meet your classmates.
            </p>
            <a
              href={TFA_WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full bg-[var(--astar-red)] text-white py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-brand-hover transition-all shadow-lg"
            >
              <Users size={18} /> Join the 100L WhatsApp group <ArrowRight size={18} />
            </a>
          </div>

          <p className="text-center text-xs text-fg-faint">
            Prefer a direct message?{" "}
            <a href={whatsAppUrl(name)} className="font-semibold text-brand-ink hover:underline">
              Get reminders from us on WhatsApp
            </a>
          </p>

          <p className="text-center text-sm font-bold text-brand-ink">Equipped for Success.</p>
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
