"use client";

import { Lock } from "lucide-react";

export default function CompletePaymentPanel() {
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
          <span className="text-(--astar-red)">NGN 5,075</span>
        </div>

        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-(--astar-red) px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700">
          Pay Now via Paystack <Lock size={16} />
        </button>
        <div className="mt-3 text-center text-[11px] text-gray-400">
          Payment is processed securely by Paystack
        </div>
      </div>
    </div>
  );
}
