'use client';

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-[var(--astar-bg)] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#0B1120] mb-3">Booking Confirmed!</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Your spot has been reserved and payment received. We'll send a confirmation to your email shortly.
        </p>
        <Link
          href="/tutorials"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#D93025] text-white font-semibold rounded-full shadow-lg shadow-red-500/20 hover:-translate-y-0.5 transition-all text-sm"
        >
          Browse More Tutorials
        </Link>
      </div>
    </div>
  );
}
