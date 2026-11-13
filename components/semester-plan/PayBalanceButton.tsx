"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import posthog from "@/lib/analytics";

export default function PayBalanceButton({ balanceId, amount }: { balanceId: string; amount: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/semester-plan/balances/${balanceId}/pay`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      posthog.capture("semester_plan_balance_checkout_initiated", { amount });
      window.location.href = data.authorization_url;
    } catch (err) {
      posthog.captureException(err);
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={pay}
        disabled={loading}
        className="w-full bg-[var(--astar-red)] text-white py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-brand-hover transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Redirecting to payment…
          </>
        ) : (
          <>
            Pay ₦{amount.toLocaleString()} <ArrowRight size={18} />
          </>
        )}
      </button>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>}
    </div>
  );
}
