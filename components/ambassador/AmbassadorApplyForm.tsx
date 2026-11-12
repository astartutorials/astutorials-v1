"use client";

import { useState, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import posthog from "posthog-js";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { validateBookingForm } from "@/lib/validate";
import { AMBASSADOR_LEVELS, AMBASSADOR_HEARD_OPTIONS, AMBASSADOR_INSTITUTIONS } from "@/lib/ambassador";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-line focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-fg-faint text-fg text-base bg-surface-raised";
const labelClass = "text-sm font-semibold text-fg-muted block mb-1.5";

type Form = {
  fullName: string;
  institution: string;
  matricNumber: string;
  email: string;
  phone: string;
  callPhone: string;
  courseOfStudy: string;
  level: string;
  instagramHandle: string;
  tiktokHandle: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  motivation: string;
  heardVia: string;
};

function Field({ id, label, optional, error, children }: { id: string; label: string; optional?: boolean; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}{" "}
        {optional ? <span className="text-fg-faint font-normal">(optional)</span> : <span className="text-brand-ink">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-xs font-bold uppercase tracking-wider text-fg-faint">{title}</legend>
      {note}
      {children}
    </fieldset>
  );
}

/** Uche's sign-up form (2026-11-12), grouped so fifteen fields don't feel like one long list. */
export default function AmbassadorApplyForm() {
  const router = useRouter();
  const [form, setForm] = useState<Form>({
    fullName: "",
    institution: AMBASSADOR_INSTITUTIONS[0],
    matricNumber: "",
    email: "",
    phone: "",
    callPhone: "",
    courseOfStudy: "",
    level: "",
    instagramHandle: "",
    tiktokHandle: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    motivation: "",
    heardVia: "",
  });
  const [sameAsWhatsApp, setSameAsWhatsApp] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const set = (key: keyof Form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const callPhone = sameAsWhatsApp ? form.phone : form.callPhone;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateBookingForm(form) as Partial<Record<keyof Form, string>>;
    const required: (keyof Form)[] = ["institution", "matricNumber", "courseOfStudy", "level", "bankName", "bankAccountName", "motivation"];
    for (const key of required) if (!form[key].trim()) errs[key] = "Required";
    if (!callPhone.trim()) errs.callPhone = "Required";
    if (!/^\d{10}$/.test(form.bankAccountNumber.replace(/[\s-]/g, ""))) errs.bankAccountNumber = "10 digits";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setApiError("");
    setLoading(true);
    try {
      const res = await fetch("/api/ambassador-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, callPhone, turnstileToken }),
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
    <form onSubmit={handleSubmit} className="space-y-7" noValidate>
      <Section title="About you">
        <Field id="amb-name" label="Full Name" error={errors.fullName}>
          <input id="amb-name" type="text" autoComplete="name" placeholder="Enter your full name"
            value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className={inputClass} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="amb-institution" label="Institution" error={errors.institution}>
            <input id="amb-institution" type="text" list="amb-institutions"
              value={form.institution} onChange={(e) => set("institution", e.target.value)} className={inputClass} />
            <datalist id="amb-institutions">
              {AMBASSADOR_INSTITUTIONS.map((i) => <option key={i} value={i} />)}
            </datalist>
          </Field>
          <Field id="amb-matric" label="Matric Number" error={errors.matricNumber}>
            <input id="amb-matric" type="text" placeholder="e.g. 22/1234"
              value={form.matricNumber} onChange={(e) => set("matricNumber", e.target.value)} className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_8rem] gap-4">
          <Field id="amb-course" label="Department / Course of Study" error={errors.courseOfStudy}>
            <input id="amb-course" type="text" placeholder="e.g. Medicine & Surgery"
              value={form.courseOfStudy} onChange={(e) => set("courseOfStudy", e.target.value)} className={inputClass} />
          </Field>
          <Field id="amb-level" label="Level" error={errors.level}>
            <select id="amb-level" value={form.level} onChange={(e) => set("level", e.target.value)} className={inputClass}>
              <option value="">Select</option>
              {AMBASSADOR_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Contact">
        <Field id="amb-email" label="Email Address" error={errors.email}>
          <input id="amb-email" type="email" autoComplete="email" placeholder="you@example.com"
            value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClass} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="amb-phone" label="WhatsApp Number" error={errors.phone}>
            <input id="amb-phone" type="tel" autoComplete="tel" placeholder="08012345678"
              value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
          </Field>
          <Field id="amb-call" label="Calling Number" error={errors.callPhone}>
            <input id="amb-call" type="tel" placeholder="08012345678" disabled={sameAsWhatsApp}
              value={callPhone} onChange={(e) => set("callPhone", e.target.value)} className={`${inputClass} disabled:opacity-60`} />
            <label className="mt-1.5 flex items-center gap-2 text-xs text-fg-subtle">
              <input type="checkbox" checked={sameAsWhatsApp} onChange={(e) => setSameAsWhatsApp(e.target.checked)} />
              Same as WhatsApp
            </label>
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="amb-ig" label="Instagram" optional>
            <input id="amb-ig" type="text" placeholder="@yourhandle"
              value={form.instagramHandle} onChange={(e) => set("instagramHandle", e.target.value)} className={inputClass} />
          </Field>
          <Field id="amb-tt" label="TikTok" optional>
            <input id="amb-tt" type="text" placeholder="@yourhandle"
              value={form.tiktokHandle} onChange={(e) => set("tiktokHandle", e.target.value)} className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section
        title="Where we pay your commission"
        note={
          <p className="flex items-start gap-2 text-xs text-fg-subtle">
            <Lock size={13} className="mt-0.5 shrink-0" />
            Only used to pay you. Kept private and seen only by the A-Star team.
          </p>
        }
      >
        <Field id="amb-bank" label="Bank Name" error={errors.bankName}>
          <input id="amb-bank" type="text" placeholder="e.g. Zenith Bank"
            value={form.bankName} onChange={(e) => set("bankName", e.target.value)} className={inputClass} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="amb-acct" label="Account Number" error={errors.bankAccountNumber}>
            <input id="amb-acct" type="text" inputMode="numeric" maxLength={13} placeholder="1234567890"
              value={form.bankAccountNumber} onChange={(e) => set("bankAccountNumber", e.target.value)} className={inputClass} />
          </Field>
          <Field id="amb-acct-name" label="Account Name" error={errors.bankAccountName}>
            <input id="amb-acct-name" type="text" placeholder="As it appears at your bank"
              value={form.bankAccountName} onChange={(e) => set("bankAccountName", e.target.value)} className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title="Tell us">
        <Field id="amb-motivation" label="How would you spread the word about A-Star Tutorials?" error={errors.motivation}>
          <textarea id="amb-motivation" rows={3}
            placeholder="Your department groups, hostel, fellowship, socials…"
            value={form.motivation} onChange={(e) => set("motivation", e.target.value)}
            className={`${inputClass} resize-none`} />
        </Field>
        <Field id="amb-heard" label="How did you hear about A-Star Tutorials?" optional>
          <select id="amb-heard" value={form.heardVia} onChange={(e) => set("heardVia", e.target.value)} className={inputClass}>
            <option value="">Select</option>
            {AMBASSADOR_HEARD_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
      </Section>

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
