"use client";

import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";

export default function CompletePaymentPanel() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount: 5075,
          metadata: { type: "private" },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to initialise payment. Please try again.");
        return;
      }
      window.location.href = data.authorization_url;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
      <p className="mt-2 text-sm text-gray-500">
        Pay NGN 5,000 to request your private tutorial session.
      </p>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-[#F8FAFC] p-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 text-sm text-gray-600">
          <span>Session Fee</span>
          <span className="font-semibold text-gray-900">NGN 5,000</span>
        </div>
        <div className="flex items-center justify-between border-b border-gray-200 py-4 text-sm text-gray-600">
          <span>Processing Fee</span>
          <span className="font-semibold text-gray-900">NGN 75</span>
        </div>
        <div className="flex items-center justify-between pt-4 text-sm font-semibold text-gray-900">
          <span>Total</span>
          <span className="text-[var(--astar-red)]">NGN 5,075</span>
        </div>

        <div className="mt-6">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-gray-800 bg-white text-sm"
          />
        </div>

        {error && (
          <p className="mt-3 text-xs text-red-500">{error}</p>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--astar-red)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Redirecting to Paystack…</>
          ) : (
            <>Pay Now via Paystack <Lock size={16} /></>
          )}
        </button>
        <div className="mt-3 text-center text-[11px] text-gray-400">
          Payment is processed securely by Paystack
        </div>
      </div>
    </div>
  );
}
