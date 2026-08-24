"use client";

import { useState, useRef } from "react";
import { X, ArrowRight, Loader2, GraduationCap } from "lucide-react";
import { validateBookingForm } from "@/lib/validate";
import posthog from "posthog-js";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

import {
  PRECLINICALS_PRICE as PRICE,
  PRECLINICALS_OLD_PRICE as OLD_PRICE,
  PRECLINICALS_COURSE_LABEL as COURSE_LABEL,
} from "@/lib/preclinicals";

const LEVELS = ["100 Level", "200 Level", "300 Level", "Other / Direct Entry"];

const HEARD_OPTIONS = [
  "Instagram",
  "TikTok",
  "WhatsApp",
  "A friend / coursemate",
  "Orientation webinar",
  "Other",
];

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-line focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-fg-faint text-fg text-base bg-surface-raised";

export default function RegisterModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    school: "",
    level: "",
    heard: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function validate() {
    const base = validateBookingForm(form) as Record<string, string>;
    if (!form.school.trim()) base.school = "Required";
    if (!form.level) base.level = "Required";
    return base;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setApiError("");
    setLoading(true);

    const notes = [
      `School: ${form.school}`,
      `Level: ${form.level}`,
      form.heard ? `Heard via: ${form.heard}` : "",
      form.notes ? `Notes: ${form.notes}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          amount: PRICE,
          turnstileToken,
          metadata: {
            type: "preclinicals",
            full_name: form.fullName,
            phone: form.phone,
            course: COURSE_LABEL,
            notes,
          },
        }),
      });
      turnstileRef.current?.reset();

      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      posthog.identify(form.email, { name: form.fullName, phone: form.phone, email: form.email });
      posthog.capture("preclinicals_registration_initiated", {
        school: form.school,
        level: form.level,
        heard: form.heard || null,
        price: PRICE,
      });
      window.location.href = data.authorization_url;
    } catch (err) {
      posthog.captureException(err);
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
        className="bg-surface-raised rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-raised rounded-t-2xl px-8 pt-8 pb-4 border-b border-line-subtle z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-fg-faint hover:text-fg-muted transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="text-brand-ink" size={22} />
            <h2 className="text-2xl font-bold text-fg">Reserve Your Spot</h2>
          </div>
          <p className="text-fg-subtle text-sm">
            Pre-Clinicals Introductory Online Classes · 3rd – 30th August 2026
          </p>
        </div>

        <div className="px-8 py-6 space-y-5">
          {/* Order summary */}
          <div className="rounded-xl border border-line-subtle bg-surface-sunken p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-fg-muted">Registration Fee</span>
              <span className="flex items-baseline gap-2">
                <span className="text-sm text-fg-faint line-through">
                  ₦{OLD_PRICE.toLocaleString()}
                </span>
                <span className="text-lg font-extrabold text-brand-ink">
                  ₦{PRICE.toLocaleString()}
                </span>
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                Full Name <span className="text-brand-ink">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                className={inputClass}
              />
              {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                  Email <span className="text-brand-ink">*</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputClass}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                  Phone (WhatsApp) <span className="text-brand-ink">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="08012345678"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputClass}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>
            </div>

            {/* School + Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                  University / School <span className="text-brand-ink">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. University of Ibadan"
                  value={form.school}
                  onChange={(e) => set("school", e.target.value)}
                  className={inputClass}
                />
                {errors.school && <p className="mt-1 text-xs text-red-500">{errors.school}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                  Level / Year <span className="text-brand-ink">*</span>
                </label>
                <select
                  value={form.level}
                  onChange={(e) => set("level", e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="">Select level</option>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                {errors.level && <p className="mt-1 text-xs text-red-500">{errors.level}</p>}
              </div>
            </div>

            {/* How they heard */}
            <div>
              <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                How did you hear about us? <span className="text-fg-faint font-normal">(optional)</span>
              </label>
              <select
                value={form.heard}
                onChange={(e) => set("heard", e.target.value)}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="">Select an option</option>
                {HEARD_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                Anything else? <span className="text-fg-faint font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Questions, special requests, or anything we should know..."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>

            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA"}
              onSuccess={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              options={{ appearance: "interaction-only" }}
            />

            {apiError && <p className="text-sm text-red-600 dark:text-red-400 font-medium">{apiError}</p>}

            <button
              type="submit"
              disabled={loading || !turnstileToken}
              className="w-full bg-[var(--astar-red)] text-white py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-brand-hover transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Redirecting to payment…
                </>
              ) : (
                <>
                  Pay ₦{PRICE.toLocaleString()} &amp; Register <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-fg-faint pb-2">Payment secured by Paystack.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
