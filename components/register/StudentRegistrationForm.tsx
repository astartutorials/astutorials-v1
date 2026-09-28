"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, GraduationCap } from "lucide-react";
import posthog from "posthog-js";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useOpenIntake } from "@/components/shared/useOpenIntake";
import { MONTHS, daysInMonth, type IntakeLevel } from "@/lib/intakes";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-line focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-fg-faint text-fg text-base bg-surface-raised";

const EMPTY_FORM = {
  fullName: "",
  phone: "",
  whatsapp: "",
  email: "",
  courseOfStudy: "",
  instagram: "",
  tiktok: "",
  birthDay: "",
  birthMonth: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
};

type Field = keyof typeof EMPTY_FORM;

/** Names are entered surname first, so the first name is the second word. */
function firstName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[1] ?? parts[0] ?? "friend";
}

function Label({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="text-sm font-semibold text-fg-muted block mb-1.5">
      {children}{" "}
      {optional ? (
        <span className="text-fg-faint font-normal">(optional)</span>
      ) : (
        <span className="text-brand-ink">*</span>
      )}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-red-500">{message}</p> : null;
}

/**
 * The new-student registration form. One component for every level: the level
 * picks the intake, and the intake supplies the session the row counts toward.
 */
export default function StudentRegistrationForm({ level }: { level: IntakeLevel }) {
  const intake = useOpenIntake(level);

  const [form, setForm] = useState(EMPTY_FORM);
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [done, setDone] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const set = (key: Field, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const whatsapp = sameAsPhone ? form.phone : form.whatsapp;

  function validate() {
    const e: Partial<Record<Field, string>> = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!whatsapp.trim()) e.whatsapp = "Required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
    if (!form.courseOfStudy.trim()) e.courseOfStudy = "Required";
    if (!form.birthMonth || !form.birthDay) e.birthDay = "Pick a day and month";
    if (!form.parentName.trim()) e.parentName = "Required";
    if (!form.parentPhone.trim()) e.parentPhone = "Required";
    if (form.parentEmail.trim() && !form.parentEmail.includes("@")) e.parentEmail = "Check this email";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setApiError("");
    setLoading(true);
    try {
      const res = await fetch("/api/student-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, whatsapp, level, turnstileToken }),
      });
      turnstileRef.current?.reset();

      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      posthog.identify(form.email, { name: form.fullName, phone: whatsapp, email: form.email });
      posthog.capture("student_registration_submitted", {
        entry_level: level,
        session: data.session,
        course_of_study: form.courseOfStudy,
      });
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      posthog.captureException(err);
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!intake) {
    return (
      <Shell>
        <div className="p-10 text-center">
          <h1 className="text-2xl font-bold text-fg">Registration is closed</h1>
          <p className="mt-2 text-fg-subtle">
            {level} level registration isn&apos;t open right now. Follow us for the next intake.
          </p>
          <Link href="/" className="mt-6 inline-block text-brand-ink font-semibold underline text-sm">
            Back to home
          </Link>
        </div>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell>
        <div className="p-10 text-center">
          <CheckCircle2 className="mx-auto text-green-600" size={44} />
          <h1 className="mt-4 text-2xl font-bold text-fg">You&apos;re registered!</h1>
          <p className="mt-2 text-fg-subtle leading-relaxed">
            Welcome to A-Star, {firstName(form.fullName)}. We&apos;ve sent a
            confirmation to <span className="font-semibold text-fg">{form.email}</span> and
            we&apos;ll be in touch on WhatsApp.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--astar-red)] px-6 py-3 font-bold text-white text-sm hover:opacity-90 transition-all"
          >
            Back to home <ArrowRight size={16} />
          </Link>
        </div>
      </Shell>
    );
  }

  const maxDay = form.birthMonth ? daysInMonth(parseInt(form.birthMonth, 10)) : 31;

  return (
    <Shell>
      <div className="px-6 sm:px-10 pt-10 pb-6 border-b border-line-subtle">
        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-ink">
          <GraduationCap size={14} /> {intake.session} session
        </span>
        <h1 className="mt-4 text-3xl font-bold text-fg">{level} Level Registration</h1>
        <p className="mt-2 text-fg-subtle leading-relaxed">
          New to university? Register with A-Star so we can support you from your very first
          semester. It takes about two minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 sm:px-10 py-8 space-y-8" noValidate>
        <fieldset className="space-y-4">
          <legend className="text-xs font-bold uppercase tracking-widest text-fg-faint mb-4">
            About you
          </legend>

          <div>
            <Label>Full name (surname first)</Label>
            <input
              type="text"
              autoComplete="name"
              placeholder="e.g. Okonkwo Adaeze Grace"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              className={inputClass}
            />
            <FieldError message={errors.fullName} />
          </div>

          <div>
            <Label>Email address</Label>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass}
            />
            <FieldError message={errors.email} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Phone number (calls)</Label>
              <input
                type="tel"
                autoComplete="tel"
                placeholder="08012345678"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={inputClass}
              />
              <FieldError message={errors.phone} />
            </div>
            <div>
              <Label>WhatsApp number</Label>
              <input
                type="tel"
                placeholder="08012345678"
                value={whatsapp}
                disabled={sameAsPhone}
                onChange={(e) => set("whatsapp", e.target.value)}
                className={`${inputClass} disabled:opacity-60`}
              />
              <label className="mt-2 flex items-center gap-2 text-xs text-fg-subtle cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsPhone}
                  onChange={(e) => {
                    setSameAsPhone(e.target.checked);
                    if (!e.target.checked) set("whatsapp", form.phone);
                  }}
                  className="accent-[var(--astar-red)]"
                />
                Same as my calls number
              </label>
              <FieldError message={errors.whatsapp} />
            </div>
          </div>

          <div>
            <Label>Course of study</Label>
            <input
              type="text"
              placeholder="e.g. Nursing Science"
              value={form.courseOfStudy}
              onChange={(e) => set("courseOfStudy", e.target.value)}
              className={inputClass}
            />
            <FieldError message={errors.courseOfStudy} />
          </div>

          <div>
            <Label>Birthday</Label>
            <div className="grid grid-cols-2 gap-4">
              <select
                aria-label="Birth month"
                value={form.birthMonth}
                onChange={(e) => {
                  set("birthMonth", e.target.value);
                  // 31 → February would otherwise leave an impossible date selected.
                  const max = daysInMonth(parseInt(e.target.value, 10));
                  if (parseInt(form.birthDay, 10) > max) set("birthDay", "");
                }}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="">Month</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                aria-label="Birth day"
                value={form.birthDay}
                onChange={(e) => set("birthDay", e.target.value)}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="">Day</option>
                {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <FieldError message={errors.birthDay} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label optional>Instagram handle</Label>
              <input
                type="text"
                placeholder="@yourhandle"
                value={form.instagram}
                onChange={(e) => set("instagram", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <Label optional>TikTok handle</Label>
              <input
                type="text"
                placeholder="@yourhandle"
                value={form.tiktok}
                onChange={(e) => set("tiktok", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-xs font-bold uppercase tracking-widest text-fg-faint mb-4">
            Parent or guardian
          </legend>

          <div>
            <Label>Full name</Label>
            <input
              type="text"
              placeholder="Parent or guardian's full name"
              value={form.parentName}
              onChange={(e) => set("parentName", e.target.value)}
              className={inputClass}
            />
            <FieldError message={errors.parentName} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Phone number</Label>
              <input
                type="tel"
                placeholder="08012345678"
                value={form.parentPhone}
                onChange={(e) => set("parentPhone", e.target.value)}
                className={inputClass}
              />
              <FieldError message={errors.parentPhone} />
            </div>
            <div>
              <Label optional>Email address</Label>
              <input
                type="email"
                placeholder="parent@example.com"
                value={form.parentEmail}
                onChange={(e) => set("parentEmail", e.target.value)}
                className={inputClass}
              />
              <FieldError message={errors.parentEmail} />
            </div>
          </div>
        </fieldset>

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
          className="w-full bg-[var(--astar-red)] text-white py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Registering…
            </>
          ) : (
            <>
              Complete Registration <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-fg-faint">
          Already registered? Submitting again with the same email updates your details.
        </p>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--astar-bg)] px-4 pt-28 pb-16 md:pt-36">
      <div className="mx-auto w-full max-w-2xl bg-surface-raised rounded-2xl shadow-xl border border-line-subtle overflow-hidden">
        {children}
      </div>
    </div>
  );
}
