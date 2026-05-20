"use client";

import { useState } from "react";
import { X, ArrowRight, Loader2 } from "lucide-react";
import { validateBookingForm } from "@/lib/validate";

interface EmailModalProps {
  onClose: () => void;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-800 text-base";

export default function EmailModal({ onClose }: EmailModalProps) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function validate() {
    return validateBookingForm(form);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setApiError("");
    setLoading(true);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          amount: 5075,
          metadata: {
            type: "private",
            full_name: form.fullName,
            phone: form.phone,
            notes: form.notes,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      window.location.href = data.authorization_url;
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl px-8 pt-8 pb-4 border-b border-gray-100 z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <h2 className="text-2xl font-bold text-[var(--astar-navy)]">Request Private Tutorial</h2>
          <p className="text-gray-500 text-sm mt-1">
            Fill in your details and pay ₦5,075 to secure your session. We'll reach out on WhatsApp to discuss course and schedule.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          {/* Full Name */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Full Name <span className="text-[var(--astar-red)]">*</span>
            </label>
            <input type="text" placeholder="Enter your full name" value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)} className={inputClass} />
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                Email <span className="text-[var(--astar-red)]">*</span>
              </label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={(e) => set("email", e.target.value)} className={inputClass} />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                Phone <span className="text-[var(--astar-red)]">*</span>
              </label>
              <input type="tel" placeholder="08012345678" value={form.phone}
                onChange={(e) => set("phone", e.target.value)} className={inputClass} />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Additional Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea rows={3} placeholder="Specific topics or areas you're struggling with..."
              value={form.notes} onChange={(e) => set("notes", e.target.value)}
              className={`${inputClass} resize-none`} />
          </div>

          {apiError && <p className="text-sm text-red-600 font-medium">{apiError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--astar-red)] text-white py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Redirecting to payment…</>
            ) : (
              <>Pay ₦5,075 &amp; Submit Request <ArrowRight size={18} /></>
            )}
          </button>

          <p className="text-center text-[11px] text-gray-400 pb-2">
            Payment secured by Paystack. After paying you'll be connected via WhatsApp.
          </p>
        </form>
      </div>
    </div>
  );
}
