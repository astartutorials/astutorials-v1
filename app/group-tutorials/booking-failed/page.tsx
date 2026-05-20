'use client';

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function BookingFailedPage() {
  return (
    <div className="min-h-screen bg-[var(--astar-bg)] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#0B1120] mb-3">Payment Failed</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Your payment could not be verified. No charge was made. Please try again or contact us if the issue persists.
        </p>
        <Link
          href="/tutorials"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#D93025] text-white font-semibold rounded-full shadow-lg shadow-red-500/20 hover:-translate-y-0.5 transition-all text-sm"
        >
          Back to Tutorials
        </Link>
      </div>
    </div>
  );
}
