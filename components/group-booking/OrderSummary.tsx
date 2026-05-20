'use client';

import { Calendar, Info, Lock } from "lucide-react";
import type { Tutorial } from "@/app/group-tutorials/confirm-booking/page";

interface OrderSummaryProps {
  tutorial: Tutorial | null;
}

function formatDate(date: string | null) {
  if (!date) return "Date TBD";
  return new Date(date).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function fmt(n: number) {
  return `₦${n.toLocaleString()}`;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function OrderSummary({ tutorial }: OrderSummaryProps) {
  return (
    <div className="w-full lg:w-96 pt-12">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="space-y-6">
          <div className="pb-6 border-b border-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Course</p>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">
              {tutorial ? `${tutorial.code} — ${tutorial.title}` : "—"}
            </h3>
          </div>

          <div className="pb-6 border-b border-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tutor</p>
            {tutorial ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-50 text-[#D93025] flex items-center justify-center font-bold text-xs">
                  {initials(tutorial.teacher)}
                </div>
                <span className="font-medium text-gray-700">{tutorial.teacher}</span>
              </div>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </div>

          <div className="pb-6 border-b border-dashed border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Schedule</p>
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Calendar size={16} className="text-gray-400" />
              {tutorial
                ? `${formatDate(tutorial.date)}, ${tutorial.time}`
                : "—"}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-gray-500 font-medium">Total to pay</span>
            <span className="text-2xl font-bold text-[var(--astar-red)]">
              {tutorial ? fmt(tutorial.price) : "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-500 leading-relaxed">
          By proceeding, you agree to our Terms of Service. Your payment is processed securely via Paystack.
        </p>
      </div>
    </div>
  );
}
