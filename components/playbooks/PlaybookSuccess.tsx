"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, CalendarDays, Clock, Video } from "lucide-react";
import { playbookHref, type Playbook } from "@/lib/playbooks";

const WHATSAPP_PHONE = "2349160465678";

function whatsAppUrl(playbook: Playbook, name: string) {
  const lines = [
    `Hello! I just registered for ${playbook.name} (${playbook.dateLabel}).`,
    name ? `Name: ${name}` : "",
    "",
    "Please add me to the reminder group. Thank you!",
  ].filter(Boolean);
  return `https://api.whatsapp.com/send/?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
    lines.join("\n")
  )}&type=phone_number&app_absent=0`;
}

function SuccessContent({ playbook }: { playbook: Playbook }) {
  const name = useSearchParams().get("name") ?? "";
  const firstName = name.trim().split(" ")[0];
  const href = playbookHref(playbook.slug);

  return (
    <div
      data-playbook={playbook.accent}
      className="min-h-screen bg-[var(--astar-bg)] flex items-center justify-center px-4 py-16"
    >
      <div className="bg-surface-raised rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="bg-pb-fill px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="text-white" size={22} />
            <span className="text-white font-bold text-sm uppercase tracking-wide">
              Seat Reserved
            </span>
          </div>
          <h1 className="text-white text-2xl font-bold">
            {firstName ? `You're in, ${firstName}! 🎉` : "You're in! 🎉"}
          </h1>
          <p className="text-white/80 text-sm mt-1">
            {playbook.name} — {playbook.promise}
          </p>
        </div>

        <div className="px-8 py-7 space-y-6">
          <div className="rounded-xl border border-line-subtle bg-surface-sunken divide-y divide-line-subtle">
            {[
              [CalendarDays, "Date", playbook.dateLabel],
              [Clock, "Time", playbook.timeLabel],
              [Video, "Where", playbook.platform],
            ].map(([Icon, label, value]) => {
              const I = Icon as typeof CalendarDays;
              return (
                <div key={label as string} className="flex items-center gap-3 px-5 py-3.5">
                  <I size={17} className="text-pb-ink flex-shrink-0" />
                  <span className="text-sm text-fg-faint w-14">{label as string}</span>
                  <span className="text-sm font-semibold text-fg">{value as string}</span>
                </div>
              );
            })}
          </div>

          <p className="text-fg-muted text-sm leading-relaxed">
            {playbook.meetingUrl
              ? "Your confirmation email has the join link — save it now so you don't hunt for it on the night."
              : `We've emailed your confirmation. The ${playbook.platform} link goes out a few hours before we start.`}
          </p>

          {playbook.meetingUrl && (
            <a
              href={playbook.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[var(--astar-navy)] text-white py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            >
              Save the join link <ArrowRight size={18} />
            </a>
          )}

          <a
            href={whatsAppUrl(playbook, name)}
            className="w-full bg-pb-fill text-white py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg"
          >
            Get reminders on WhatsApp <ArrowRight size={18} />
          </a>

          <p className="text-center text-xs text-fg-faint">
            Bring someone from your class — they can register at{" "}
            <a href={href} className="font-semibold text-pb-ink underline">
              astartutorials.com{href}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PlaybookSuccess({ playbook }: { playbook: Playbook }) {
  return (
    <Suspense>
      <SuccessContent playbook={playbook} />
    </Suspense>
  );
}
