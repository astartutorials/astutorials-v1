'use client';

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";

const MESSAGES: Record<string, { heading: string; body: string }> = {
  full: {
    heading: "Tutorial Fully Booked",
    body: "Someone else took the last spot just before your payment completed. You have not been charged. Please choose another tutorial or check back later.",
  },
  server: {
    heading: "Something Went Wrong",
    body: "Your payment was received but we couldn't save your booking. Please contact us on WhatsApp with your payment reference so we can sort it out.",
  },
  payment: {
    heading: "Payment Failed",
    body: "Your payment could not be verified. No charge was made. Please try again — if the problem persists, contact your bank or reach out to us.",
  },
};

const DEFAULT = {
  heading: "Payment Failed",
  body: "Your payment could not be verified. No charge was made. Please try again or contact us if the issue persists.",
};

function FailedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? "";
  const { heading, body } = MESSAGES[reason] ?? DEFAULT;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <XCircle className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-[#0B1120] mb-3">{heading}</h1>
      <p className="text-gray-500 text-sm leading-relaxed mb-8">{body}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/tutorials"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D93025] text-white font-semibold rounded-full shadow-lg shadow-red-500/20 hover:-translate-y-0.5 transition-all text-sm"
        >
          Browse Tutorials
        </Link>
        <a
          href="https://api.whatsapp.com/send/?phone=2349160465678&type=phone_number&app_absent=0"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-full hover:border-gray-300 hover:-translate-y-0.5 transition-all text-sm"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}

export default function BookingFailedPage() {
  return (
    <div className="min-h-screen bg-[var(--astar-bg)] flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-[#0B1120] mb-3">{DEFAULT.heading}</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">{DEFAULT.body}</p>
            <Link
              href="/tutorials"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D93025] text-white font-semibold rounded-full shadow-lg shadow-red-500/20 hover:-translate-y-0.5 transition-all text-sm"
            >
              Browse Tutorials
            </Link>
          </div>
        }
      >
        <FailedContent />
      </Suspense>
    </div>
  );
}
