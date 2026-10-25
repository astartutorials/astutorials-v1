"use client";

import { useState, useRef } from "react";
import { X, ArrowRight, Loader2, CalendarRange, CheckCircle2 } from "lucide-react";
import posthog from "posthog-js";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import {
  SEMESTER_PLANS,
  SEMESTER_PLAN_IDS,
  SEMESTER_PLAN_TERM,
  semesterPlanCourseLabel,
  type SemesterPlanId,
} from "@/lib/semester-plan";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-line focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-fg-faint text-fg text-base bg-surface-raised";

export type PlanModalMode = "pay" | "enquire";
export type Audience = "student" | "parent";

type Form = {
  studentName: string;
  studentPhone: string;
  studentEmail: string;
  courseOfStudy: string;
  matric: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  notes: string;
};

function Field({
  label,
  optional,
  error,
  children,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-fg-muted block mb-1.5">
        {label}{" "}
        {optional ? (
          <span className="text-fg-faint font-normal">(optional)</span>
        ) : (
          <span className="text-brand-ink">*</span>
        )}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/**
 * One form, two exits: pay the full plan now on Paystack, or leave details and
 * have the team call. Either the student or a parent may fill it in, and the
 * labels follow whoever is filling it.
 */
export default function PlanModal({
  initialPlan,
  initialMode,
  audience,
  onClose,
}: {
  initialPlan: SemesterPlanId;
  initialMode: PlanModalMode;
  audience: Audience;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<PlanModalMode>(initialMode);
  const [plan, setPlan] = useState<SemesterPlanId | "undecided">(initialPlan);
  const [submittedBy, setSubmittedBy] = useState<Audience>(audience);
  const [form, setForm] = useState<Form>({
    studentName: "",
    studentPhone: "",
    studentEmail: "",
    courseOfStudy: "",
    matric: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [sent, setSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const set = (key: keyof Form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  // "Undecided" only makes sense when we are about to call; paying needs a plan.
  const payPlan: SemesterPlanId = plan === "undecided" ? "group" : plan;
  const selected = SEMESTER_PLANS[payPlan];
  const isParent = submittedBy === "parent";
  // The receipt goes to whoever pays.
  const receiptEmail = isParent ? form.parentEmail : form.studentEmail;

  function switchMode(next: PlanModalMode) {
    setMode(next);
    setApiError("");
    setErrors({});
    if (next === "pay" && plan === "undecided") setPlan("group");
  }

  function validate() {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!form.studentName.trim()) e.studentName = "Required";
    if (!form.studentPhone.trim()) e.studentPhone = "Required";
    if (!form.courseOfStudy.trim()) e.courseOfStudy = "Required";
    if (!form.parentName.trim()) e.parentName = "Required";
    if (!form.parentPhone.trim()) e.parentPhone = "Required";
    for (const key of ["studentEmail", "parentEmail"] as const) {
      if (form[key].trim() && !form[key].includes("@")) e[key] = "Valid email required";
    }
    // Paystack needs an email to send the receipt to.
    if (mode === "pay") {
      const key = isParent ? "parentEmail" : "studentEmail";
      if (!form[key].trim() || !form[key].includes("@")) e[key] = "Needed for your receipt";
    }
    return e;
  }

  async function pay() {
    const notes = [
      `Plan: ${selected.name}`,
      `Paid by: ${isParent ? "Parent/guardian" : "Student"}`,
      `Course of study: ${form.courseOfStudy}`,
      form.matric ? `Matric: ${form.matric}` : "",
      `Parent: ${form.parentName} (${form.parentPhone}${form.parentEmail ? `, ${form.parentEmail}` : ""})`,
      form.studentEmail ? `Student email: ${form.studentEmail}` : "",
      form.notes ? `Notes: ${form.notes}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const res = await fetch("/api/paystack/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: receiptEmail,
        amount: selected.price,
        turnstileToken,
        metadata: {
          type: "semester-plan",
          plan: payPlan,
          full_name: form.studentName,
          phone: form.studentPhone,
          course: semesterPlanCourseLabel(payPlan),
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
    posthog.identify(receiptEmail, { name: isParent ? form.parentName : form.studentName, email: receiptEmail });
    posthog.capture("semester_plan_checkout_initiated", {
      plan: payPlan,
      paid_by: submittedBy,
      price: selected.price,
    });
    window.location.href = data.authorization_url;
  }

  async function enquire() {
    const res = await fetch("/api/semester-plan-enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, plan, submittedBy, turnstileToken }),
    });
    turnstileRef.current?.reset();

    const data = await res.json();
    if (!res.ok) {
      setApiError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    posthog.capture("semester_plan_enquiry_submitted", { plan, submitted_by: submittedBy });
    setSent(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setApiError("");
    setLoading(true);
    try {
      await (mode === "pay" ? pay() : enquire());
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="semester-plan-modal-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-raised rounded-t-2xl px-6 sm:px-8 pt-8 pb-4 border-b border-line-subtle z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-fg-faint hover:text-fg-muted transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <CalendarRange className="text-brand-ink" size={22} />
            <h2 id="semester-plan-modal-title" className="text-2xl font-bold text-fg">
              {sent ? "We'll be in touch" : mode === "pay" ? "Secure the Semester" : "Talk to Us First"}
            </h2>
          </div>
          <p className="text-fg-subtle text-sm">Full Semester Plan · {SEMESTER_PLAN_TERM}</p>
        </div>

        {sent ? (
          <div className="px-6 sm:px-8 py-8 text-center space-y-4">
            <CheckCircle2 className="mx-auto text-green-600" size={40} />
            <p className="text-fg-muted text-sm leading-relaxed">
              Thanks! Someone from A-Star will reach out on WhatsApp or by phone soon to answer
              questions and help you get started.
            </p>
            <button
              onClick={onClose}
              className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-fg hover:bg-surface-sunken transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="px-6 sm:px-8 py-6 space-y-5">
            {/* Pay now / Call me first */}
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-sunken p-1" role="tablist">
              {([
                ["pay", "Pay now"],
                ["enquire", "Call me first"],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={mode === id}
                  onClick={() => switchMode(id)}
                  className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                    mode === id ? "bg-surface-raised text-fg shadow-sm" : "text-fg-subtle hover:text-fg"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Plan picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SEMESTER_PLAN_IDS.map((id) => {
                const p = SEMESTER_PLANS[id];
                const active = plan === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPlan(id)}
                    aria-pressed={active}
                    className={`text-left rounded-xl border px-4 py-3 transition-all ${
                      active
                        ? "border-[var(--astar-red)] bg-brand-soft"
                        : "border-line-subtle hover:border-line"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-fg">{p.name}</span>
                    <span className="block text-lg font-extrabold text-brand-ink">
                      ₦{p.price.toLocaleString()}
                    </span>
                    <span className="block text-xs text-fg-faint">{p.sessions} sessions</span>
                  </button>
                );
              })}
              {mode === "enquire" && (
                <button
                  type="button"
                  onClick={() => setPlan("undecided")}
                  aria-pressed={plan === "undecided"}
                  className={`sm:col-span-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                    plan === "undecided"
                      ? "border-[var(--astar-red)] bg-brand-soft text-fg"
                      : "border-line-subtle text-fg-subtle hover:border-line"
                  }`}
                >
                  Not sure yet, help me choose
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Who's filling it in */}
              <div>
                <p className="text-sm font-semibold text-fg-muted mb-1.5">I am the…</p>
                <div className="flex gap-2">
                  {([
                    ["student", "Student"],
                    ["parent", "Parent / guardian"],
                  ] as const).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSubmittedBy(id)}
                      aria-pressed={submittedBy === id}
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                        submittedBy === id
                          ? "border-[var(--astar-red)] bg-brand-soft text-fg"
                          : "border-line-subtle text-fg-subtle hover:border-line"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student */}
              <fieldset className="space-y-4">
                <legend className="text-xs font-bold uppercase tracking-wider text-fg-faint mb-1">
                  {isParent ? "Your child" : "You"}
                </legend>
                <Field label={isParent ? "Student's full name" : "Full name"} error={errors.studentName}>
                  <input
                    type="text"
                    placeholder="Surname first"
                    value={form.studentName}
                    onChange={(e) => set("studentName", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={isParent ? "Student's WhatsApp" : "WhatsApp number"} error={errors.studentPhone}>
                    <input
                      type="tel"
                      placeholder="08012345678"
                      value={form.studentPhone}
                      onChange={(e) => set("studentPhone", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field
                    label={isParent ? "Student's email" : "Email"}
                    optional={mode === "enquire" || isParent}
                    error={errors.studentEmail}
                  >
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.studentEmail}
                      onChange={(e) => set("studentEmail", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Course of study" error={errors.courseOfStudy}>
                    <input
                      type="text"
                      placeholder="e.g. Nursing Science"
                      value={form.courseOfStudy}
                      onChange={(e) => set("courseOfStudy", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  {mode === "pay" && (
                    <Field label="Matric number" optional>
                      <input
                        type="text"
                        placeholder="e.g. 26/1234"
                        value={form.matric}
                        onChange={(e) => set("matric", e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                  )}
                </div>
              </fieldset>

              {/* Parent */}
              <fieldset className="space-y-4">
                <legend className="text-xs font-bold uppercase tracking-wider text-fg-faint mb-1">
                  {isParent ? "You" : "Your parent / guardian"}
                </legend>
                <Field label={isParent ? "Your full name" : "Parent/guardian's name"} error={errors.parentName}>
                  <input
                    type="text"
                    value={form.parentName}
                    onChange={(e) => set("parentName", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={isParent ? "Your phone" : "Their phone"} error={errors.parentPhone}>
                    <input
                      type="tel"
                      placeholder="08012345678"
                      value={form.parentPhone}
                      onChange={(e) => set("parentPhone", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field
                    label={isParent ? "Your email" : "Their email"}
                    optional={mode === "enquire" || !isParent}
                    error={errors.parentEmail}
                  >
                    <input
                      type="email"
                      placeholder="parent@example.com"
                      value={form.parentEmail}
                      onChange={(e) => set("parentEmail", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>
              </fieldset>

              <Field label={mode === "pay" ? "Anything else?" : "Questions for us?"} optional>
                <textarea
                  rows={2}
                  placeholder={mode === "pay" ? "Courses you want help with, scheduling…" : "What would you like to know?"}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  className={`${inputClass} resize-none`}
                />
              </Field>

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
                    <Loader2 size={18} className="animate-spin" />
                    {mode === "pay" ? "Redirecting to payment…" : "Sending…"}
                  </>
                ) : mode === "pay" ? (
                  <>
                    Pay ₦{selected.price.toLocaleString()} <ArrowRight size={18} />
                  </>
                ) : (
                  <>
                    Request a call <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-fg-faint pb-2">
                {mode === "pay"
                  ? "Payment secured by Paystack. The receipt goes to the email of whoever is paying."
                  : "No payment now. We'll only use these details to contact you about the plan."}
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
