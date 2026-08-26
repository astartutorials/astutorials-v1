"use client";

import { useState, useRef } from "react";
import { X, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { validateBookingForm } from "@/lib/validate";
import posthog from "posthog-js";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

import {
  BUCC_EVENT_NAME,
  BUCC_DATE_LABEL,
  BUCC_TIME_LABEL,
  BUCC_LEVELS,
  BUCC_PROGRAMMES,
  BUCC_HEARD_OPTIONS,
} from "@/lib/bucc";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-line focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-fg-faint text-fg text-base bg-surface-raised";

export default function RegisterModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    level: "200 Level",
    programme: "",
    concern: "",
    question: "",
    heardVia: "",
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
    if (!form.level) base.level = "Required";
    if (!form.programme) base.programme = "Required";
    return base;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setApiError("");
    setLoading(true);

    try {
      const res = await fetch("/api/bucc-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken }),
      });
      turnstileRef.current?.reset();

      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      posthog.identify(form.email, {
        name: form.fullName,
        phone: form.phone,
        email: form.email,
      });
      posthog.capture("bucc_registration_submitted", {
        level: form.level,
        programme: form.programme,
        heard_via: form.heardVia || null,
        has_question: !!form.question.trim(),
      });

      window.location.href = `/bucc/success?name=${encodeURIComponent(form.fullName)}`;
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
            <Sparkles className="text-brand-ink" size={22} />
            <h2 className="text-2xl font-bold text-fg">Claim Your Seat</h2>
          </div>
          <p className="text-fg-subtle text-sm">
            {BUCC_EVENT_NAME} · {BUCC_DATE_LABEL} · {BUCC_TIME_LABEL}
          </p>
        </div>

        <div className="px-8 py-6 space-y-5">
          <div className="rounded-xl border border-line-subtle bg-surface-sunken p-4 text-center">
            <p className="text-sm text-fg-muted">
              Free to attend — <span className="font-semibold text-fg">seats are limited</span>
            </p>
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

            {/* Email + WhatsApp */}
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
                  WhatsApp Number <span className="text-brand-ink">*</span>
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

            {/* Level + Programme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                  Level <span className="text-brand-ink">*</span>
                </label>
                <select
                  value={form.level}
                  onChange={(e) => set("level", e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="">Select level</option>
                  {BUCC_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                {errors.level && <p className="mt-1 text-xs text-red-500">{errors.level}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                  Programme <span className="text-brand-ink">*</span>
                </label>
                <select
                  value={form.programme}
                  onChange={(e) => set("programme", e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="">Select programme</option>
                  {BUCC_PROGRAMMES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {errors.programme && <p className="mt-1 text-xs text-red-500">{errors.programme}</p>}
              </div>
            </div>

            {/* The two questions the whole funnel exists for. */}
            <div>
              <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                What worries you most about 200 level?{" "}
                <span className="text-fg-faint font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Be honest — this shapes what we cover on the night."
                value={form.concern}
                onChange={(e) => set("concern", e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                Ask a senior one question{" "}
                <span className="text-fg-faint font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="The best questions get answered live during Ask the Seniors."
                value={form.question}
                onChange={(e) => set("question", e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* How they heard */}
            <div>
              <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                How did you hear about this?{" "}
                <span className="text-fg-faint font-normal">(optional)</span>
              </label>
              <select
                value={form.heardVia}
                onChange={(e) => set("heardVia", e.target.value)}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="">Select an option</option>
                {BUCC_HEARD_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA"}
              onSuccess={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              options={{ appearance: "interaction-only" }}
            />

            {apiError && (
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{apiError}</p>
            )}

            <button
              type="submit"
              disabled={loading || !turnstileToken}
              className="w-full bg-[var(--astar-red)] text-white py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-brand-hover transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Saving your seat…
                </>
              ) : (
                <>
                  Reserve My Free Seat <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-fg-faint pb-2">
              We&apos;ll email you the link. No spam, ever.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
