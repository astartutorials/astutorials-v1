"use client";

import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";

const inputClass =
  "mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--astar-red)] focus:bg-white";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIMES = ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"];

export default function CompletePaymentPanel() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    courseCode: "",
    courseTitle: "",
    preferredDay: "",
    preferredTime: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function validate() {
    const e: Partial<typeof form> = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.courseCode.trim()) e.courseCode = "Required";
    if (!form.courseTitle.trim()) e.courseTitle = "Required";
    if (!form.preferredDay) e.preferredDay = "Required";
    if (!form.preferredTime) e.preferredTime = "Required";
    return e;
  }

  async function handlePay() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setApiError(null);
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
            course_code: form.courseCode,
            course_title: form.courseTitle,
            preferred_day: form.preferredDay,
            preferred_time: form.preferredTime,
            notes: form.notes,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error ?? "Failed to initialise payment. Please try again.");
        return;
      }
      window.location.href = data.authorization_url;
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Request a Private Tutorial</h1>
      <p className="mt-2 text-sm text-gray-500">
        Fill in your details and pay ₦5,075 to secure your session. We'll reach out on WhatsApp to confirm.
      </p>

      <div className="mt-8 space-y-5">
        {/* Personal Info */}
        <div>
          <label className="text-sm font-semibold text-gray-700">Full Name <span className="text-[var(--astar-red)]">*</span></label>
          <input type="text" placeholder="Enter your full name" value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)} className={inputClass} />
          {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-700">Email <span className="text-[var(--astar-red)]">*</span></label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => set("email", e.target.value)} className={inputClass} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Phone <span className="text-[var(--astar-red)]">*</span></label>
            <input type="tel" placeholder="08012345678" value={form.phone}
              onChange={(e) => set("phone", e.target.value)} className={inputClass} />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>
        </div>

        {/* Course Info */}
        <div className="pt-2">
          <p className="text-sm font-semibold text-gray-700 mb-3">Course You Need Help With</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-gray-700">Course Code <span className="text-[var(--astar-red)]">*</span></label>
              <input type="text" placeholder="e.g. COS 201" value={form.courseCode}
                onChange={(e) => set("courseCode", e.target.value)} className={inputClass} />
              {errors.courseCode && <p className="mt-1 text-xs text-red-500">{errors.courseCode}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Course Title <span className="text-[var(--astar-red)]">*</span></label>
              <input type="text" placeholder="e.g. Data Structures" value={form.courseTitle}
                onChange={(e) => set("courseTitle", e.target.value)} className={inputClass} />
              {errors.courseTitle && <p className="mt-1 text-xs text-red-500">{errors.courseTitle}</p>}
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-700">Preferred Day <span className="text-[var(--astar-red)]">*</span></label>
            <select value={form.preferredDay} onChange={(e) => set("preferredDay", e.target.value)} className={inputClass}>
              <option value="">Select day</option>
              {DAYS.map((d) => <option key={d}>{d}</option>)}
            </select>
            {errors.preferredDay && <p className="mt-1 text-xs text-red-500">{errors.preferredDay}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Preferred Time <span className="text-[var(--astar-red)]">*</span></label>
            <select value={form.preferredTime} onChange={(e) => set("preferredTime", e.target.value)} className={inputClass}>
              <option value="">Select time</option>
              {TIMES.map((t) => <option key={t}>{t}</option>)}
            </select>
            {errors.preferredTime && <p className="mt-1 text-xs text-red-500">{errors.preferredTime}</p>}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-semibold text-gray-700">Additional Notes <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea rows={3} placeholder="Specific topics, chapters, or areas you're struggling with..."
            value={form.notes} onChange={(e) => set("notes", e.target.value)}
            className={`${inputClass} resize-none`} />
        </div>

        {/* Price summary */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Session Fee</span><span className="font-semibold text-gray-900">₦5,000</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Processing Fee</span><span className="font-semibold text-gray-900">₦75</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 mt-2">
            <span>Total</span><span className="text-[var(--astar-red)]">₦5,075</span>
          </div>
        </div>

        {apiError && <p className="text-sm text-red-500">{apiError}</p>}

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--astar-red)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Redirecting to Paystack…</>
          ) : (
            <>Pay ₦5,075 &amp; Submit Request <Lock size={16} /></>
          )}
        </button>
        <p className="text-center text-[11px] text-gray-400">
          Payment is processed securely by Paystack. After payment you'll be connected via WhatsApp.
        </p>
      </div>
    </div>
  );
}
