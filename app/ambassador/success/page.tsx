"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { AMBASSADOR_PROGRAMME_NAME } from "@/lib/ambassador";

function SuccessContent() {
  const name = useSearchParams().get("name") ?? "";
  const firstName = name.trim().split(" ")[0];

  return (
    <div className="min-h-screen bg-[var(--astar-bg)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl bg-surface-raised border border-line-subtle shadow-xl p-8 text-center">
        <CheckCircle2 className="mx-auto text-green-600" size={48} />
        <h1 className="mt-4 text-2xl font-bold text-fg">
          Application sent{firstName ? `, ${firstName}` : ""}!
        </h1>
        <p className="mt-3 text-sm text-fg-muted leading-relaxed">
          Thanks for applying to the {AMBASSADOR_PROGRAMME_NAME}. We&apos;ll review your application and,
          once you&apos;re approved, email you your personal referral code.
        </p>
        <Link
          href="/"
          className="mt-8 w-full bg-[var(--astar-red)] text-white py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-brand-hover transition-all"
        >
          Back to A-Star <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

export default function AmbassadorSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
