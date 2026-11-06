"use client";

import { useState, useRef } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import posthog from "posthog-js";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { validateBookingForm } from "@/lib/validate";
import { TFA_ATTENDEE_TYPES, TFA_HEARD_OPTIONS, TFA_QUESTION_TARGETS, TFA_ANY_SPEAKER } from "@/lib/tfa";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-line focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-fg-faint text-fg text-base bg-surface-raised";
const labelClass = "text-sm font-semibold text-fg-muted block mb-1.5";

function Optional() {
  return <span className="text-fg-faint font-normal">(optional)</span>;
}

/** Inline (not a modal): on /tfa the form is the page, most visitors arrive from a link or QR code to register. */
export default function TfaRegisterForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    attendeeType: TFA_ATTENDEE_TYPES[0] as string,
    courseOfStudy: "",
    parentPhone: "",
    question: "",
    questionFor: TFA_ANY_SPEAKER,
    heardVia: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const isParent = form.attendeeType === "Parent / Guardian";

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateBookingForm(form) as Record<string, string>;
    if (!form.attendeeType) errs.attendeeType = "Required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setApiError("");
    setLoading(true);

    try {
      const res = await fetch("/api/tfa-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, parentPhone: isParent ? "" : form.parentPhone, turnstileToken }),
      });
      turnstileRef.current?.reset();

      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      posthog.identify(form.email, { name: form.fullName, phone: form.phone, email: form.email });
      posthog.capture("tfa_registration_submitted", {
        attendee_type: form.attendeeType,
        course_of_study: form.courseOfStudy || null,
        heard_via: form.heardVia || null,
        has_question: !!form.question.trim(),
        question_for: form.question.trim() ? form.questionFor : null,
      });

      window.location.href = `/tfa/success?name=${encodeURIComponent(form.fullName)}`;
    } catch (err) {
      posthog.captureException(err);
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="tfa-name" className={labelClass}>
          Full Name <span className="text-brand-ink">*</span>
        </label>
        <input
          id="tfa-name"
          type="text"
          autoComplete="name"
          placeholder="Enter your full name"
          value={form.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          className={inputClass}
        />
        {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tfa-email" className={labelClass}>
            Email <span className="text-brand-ink">*</span>
          </label>
          <input
            id="tfa-email"
            type="email"
            autoComplete="email"
            placeholder="One you actually open"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputClass}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="tfa-phone" className={labelClass}>
            WhatsApp Number <span className="text-brand-ink">*</span>
          </label>
          <input
            id="tfa-phone"
            type="tel"
            autoComplete="tel"
            placeholder="No spam, promise"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={inputClass}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tfa-type" className={labelClass}>
            I am a <span className="text-brand-ink">*</span>
          </label>
          <select
            id="tfa-type"
            value={form.attendeeType}
            onChange={(e) => set("attendeeType", e.target.value)}
            className={`${inputClass} appearance-none cursor-pointer`}
          >
            {TFA_ATTENDEE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.attendeeType && <p className="mt-1 text-xs text-red-500">{errors.attendeeType}</p>}
        </div>
        <div>
          <label htmlFor="tfa-course" className={labelClass}>
            {isParent ? "Your child's department" : "Department"} <Optional />
          </label>
          <input
            id="tfa-course"
            type="text"
            placeholder="e.g. Law, not 'vibes'"
            value={form.courseOfStudy}
            onChange={(e) => set("courseOfStudy", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {!isParent && (
        <div>
          <label htmlFor="tfa-parent" className={labelClass}>
            Parent&apos;s / Guardian&apos;s Phone Number <Optional />
          </label>
          <input
            id="tfa-parent"
            type="tel"
            placeholder="They'll be proud you came. Trust us."
            value={form.parentPhone}
            onChange={(e) => set("parentPhone", e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label htmlFor="tfa-question" className={labelClass}>
          Got a question for the speakers? <Optional />
        </label>
        <textarea
          id="tfa-question"
          rows={2}
          placeholder="Anything goes. 'How do I survive 7am classes?' counts."
          value={form.question}
          onChange={(e) => set("question", e.target.value)}
          className={`${inputClass} resize-none`}
        />
        {form.question.trim() && (
          <div className="mt-3">
            <label htmlFor="tfa-question-for" className={labelClass}>
              Who is it for?
            </label>
            <select
              id="tfa-question-for"
              value={form.questionFor}
              onChange={(e) => set("questionFor", e.target.value)}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              {TFA_QUESTION_TARGETS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="tfa-heard" className={labelClass}>
          How did you hear about this? <Optional />
        </label>
        <select
          id="tfa-heard"
          value={form.heardVia}
          onChange={(e) => set("heardVia", e.target.value)}
          className={`${inputClass} appearance-none cursor-pointer`}
        >
          <option value="">Go on, who told you?</option>
          {TFA_HEARD_OPTIONS.map((h) => (
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

      {apiError && <p className="text-sm text-red-600 dark:text-red-400 font-medium">{apiError}</p>}

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
            Complete Registration <ArrowRight size={18} />
          </>
        )}
      </button>

      <p className="text-center text-[11px] text-fg-faint">
        We&apos;ll email your confirmation. Registered already? Submit again with the same email to update your details.
      </p>
    </form>
  );
}
