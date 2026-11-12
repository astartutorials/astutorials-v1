"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import posthog from "posthog-js";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { validateBookingForm } from "@/lib/validate";
import { AMBASSADOR_LEVELS, AMBASSADOR_HEARD_OPTIONS } from "@/lib/ambassador";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-line focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-fg-faint text-fg text-base bg-surface-raised";
const labelClass = "text-sm font-semibold text-fg-muted block mb-1.5";

function Req() {
  return <span className="text-brand-ink">*</span>;
}

function Optional() {
  return <span className="text-fg-faint font-normal">(optional)</span>;
}

function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-xs text-red-500">{msg}</p> : null;
}

export default function AmbassadorApplyForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    courseOfStudy: "",
    level: "",
    socialHandle: "",
    motivation: "",
    heardVia: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const set = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateBookingForm(form) as Record<string, string>;
    if (!form.courseOfStudy.trim()) errs.courseOfStudy = "Required";
    if (!form.level) errs.level = "Required";
    if (!form.motivation.trim()) errs.motivation = "Required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setApiError("");
    setLoading(true);
    try {
      const res = await fetch("/api/ambassador-applications", {
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

      posthog.identify(form.email, { name: form.fullName, phone: form.phone, email: form.email });
      posthog.capture("ambassador_application_submitted", {
        level: form.level,
        course_of_study: form.courseOfStudy,
        heard_via: form.heardVia || null,
      });
      router.push(`/ambassador/success?name=${encodeURIComponent(form.fullName)}`);
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
        <label htmlFor="amb-name" className={labelClass}>Full Name <Req /></label>
        <input id="amb-name" type="text" autoComplete="name" placeholder="Enter your full name"
          value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className={inputClass} />
        <FieldError msg={errors.fullName} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amb-email" className={labelClass}>Email Address <Req /></label>
          <input id="amb-email" type="email" autoComplete="email" placeholder="you@example.com"
            value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClass} />
          <FieldError msg={errors.email} />
        </div>
        <div>
          <label htmlFor="amb-phone" className={labelClass}>WhatsApp Number <Req /></label>
          <input id="amb-phone" type="tel" autoComplete="tel" placeholder="08012345678"
            value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
          <FieldError msg={errors.phone} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_8rem] gap-4">
        <div>
          <label htmlFor="amb-course" className={labelClass}>Department <Req /></label>
          <input id="amb-course" type="text" placeholder="e.g. Nursing Science"
            value={form.courseOfStudy} onChange={(e) => set("courseOfStudy", e.target.value)} className={inputClass} />
          <FieldError msg={errors.courseOfStudy} />
        </div>
        <div>
          <label htmlFor="amb-level" className={labelClass}>Level <Req /></label>
          <select id="amb-level" value={form.level} onChange={(e) => set("level", e.target.value)} className={inputClass}>
            <option value="">Select</option>
            {AMBASSADOR_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <FieldError msg={errors.level} />
        </div>
      </div>

      <div>
        <label htmlFor="amb-motivation" className={labelClass}>How would you spread the word about A-Star? <Req /></label>
        <textarea id="amb-motivation" rows={3}
          placeholder="Your department groups, hostel, fellowship, socials…"
          value={form.motivation} onChange={(e) => set("motivation", e.target.value)}
          className={`${inputClass} resize-none`} />
        <FieldError msg={errors.motivation} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amb-social" className={labelClass}>Instagram or TikTok <Optional /></label>
          <input id="amb-social" type="text" placeholder="@yourhandle"
            value={form.socialHandle} onChange={(e) => set("socialHandle", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="amb-heard" className={labelClass}>How did you hear about us? <Optional /></label>
          <select id="amb-heard" value={form.heardVia} onChange={(e) => set("heardVia", e.target.value)} className={inputClass}>
            <option value="">Select</option>
            {AMBASSADOR_HEARD_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
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
        {loading ? (<><Loader2 size={18} className="animate-spin" /> Submitting…</>) : (<>Apply now <ArrowRight size={18} /></>)}
      </button>
    </form>
  );
}
