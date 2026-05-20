'use client';

import { Calendar, Clock } from "lucide-react";
import type { Tutorial } from "@/app/group-tutorials/confirm-booking/page";

interface BookingDetailsProps {
  tutorial: Tutorial | null;
  onNext: () => void;
}

function formatDate(date: string | null) {
  if (!date) return "Date TBD";
  return new Date(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function BookingDetails({ tutorial, onNext }: BookingDetailsProps) {
  return (
    <div className="w-full max-w-2xl pt-8 lg:pt-12 px-0 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Confirm Your Booking</h1>
        <p className="text-gray-500">Please review the tutorial details below.</p>
      </div>

      <div className="space-y-10">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Course</h3>
          <p className="text-2xl font-medium text-gray-900">
            {tutorial ? `${tutorial.code} — ${tutorial.title}` : "—"}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tutor</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-[#D93025] flex items-center justify-center font-bold text-sm">
              {tutorial ? initials(tutorial.teacher) : "—"}
            </div>
            <span className="text-xl font-medium text-gray-900">{tutorial?.teacher ?? "—"}</span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Schedule</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-gray-900">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-lg font-medium">{formatDate(tutorial?.date ?? null)}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-900">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-lg font-medium">{tutorial?.time ?? "—"}</span>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <button
            onClick={onNext}
            className="px-10 py-4 rounded-full bg-[var(--astar-red)] text-white font-bold text-lg shadow-xl shadow-red-500/20 hover:shadow-2xl hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all"
          >
            Continue to Information
          </button>
        </div>
      </div>
    </div>
  );
}
