"use client";

import { useState, useRef } from "react";
import { X, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { validateBookingForm } from "@/lib/validate";
import posthog from "posthog-js";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import type { Playbook } from "@/lib/playbooks";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-line focus:border-pb-fill focus:ring-4 focus:ring-pb-soft-border outline-none transition-all placeholder:text-fg-faint text-fg text-base bg-surface-raised";

/**
 * One registration form for all three Playbooks.
 *
 * The discipline field is the only structural difference: Engineering asks for
 * a discipline, Health Sciences for a department, and Law has neither — so the
 * whole field is dropped when `form.disciplineLabel` is empty rather than shown
 * as an awkward "N/A" select.
 */
export default function RegisterModal({
  playbook,
  onClose,
}: {
  playbook: Playbook;
  onClose: () => void;
}) {
  const { form: cfg } = playbook;
  const asksDiscipline = cfg.disciplineLabel !== "" && cfg.disciplines.length > 0;

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    parentPhone: "",
    university: "",
    level: "",
    discipline: "",
    challengeAcademic: "",
    challengeOther: "",
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
    if (!form.university.trim()) base.university = "Required";
    if (!form.level) base.level = "Required";
    if (asksDiscipline && !form.discipline) base.discipline = "Required";
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
      const res = await fetch("/api/playbook-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, playbook: playbook.slug, turnstileToken }),
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
      posthog.capture("playbook_registration_submitted", {
        playbook: playbook.slug,
        university: form.university,
        level: form.level,
        discipline: form.discipline || null,
        heard_via: form.heardVia || null,
        has_question: !!form.question.trim(),
        has_parent_phone: !!form.parentPhone.trim(),
      });

      window.location.href = `/playbooks/${playbook.slug}/success?name=${encodeURIComponent(
        form.fullName
      )}`;
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
            <Sparkles className="text-pb-ink" size={22} />
            <h2 className="text-2xl font-bold text-fg">Claim Your Seat</h2>
          </div>
          <p className="text-fg-subtle text-sm">
            {playbook.name} · {playbook.dateLabel} · {playbook.timeLabel}
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
                Full Name <span className="text-pb-ink">*</span>
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
                  Email <span className="text-pb-ink">*</span>
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
                  WhatsApp Number <span className="text-pb-ink">*</span>
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

            {/* Parent or guardian. Optional — a student who doesn't want to give
                it must still be able to finish the form. */}
            <div>
              <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                Parent&apos;s / Guardian&apos;s Phone Number{" "}
                <span className="text-fg-faint font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                placeholder="Either parent works — e.g. 08012345678"
                value={form.parentPhone}
                onChange={(e) => set("parentPhone", e.target.value)}
                className={inputClass}
              />
            </div>

            {/* University */}
            <div>
              <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                University <span className="text-pb-ink">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Babcock University"
                value={form.university}
                onChange={(e) => set("university", e.target.value)}
                className={inputClass}
              />
              {errors.university && (
                <p className="mt-1 text-xs text-red-500">{errors.university}</p>
              )}
            </div>

            {/* Level + discipline. Full width when there is no discipline to ask
                about, so Law doesn't ship a half-empty row. */}
            <div className={`grid grid-cols-1 gap-4 ${asksDiscipline ? "sm:grid-cols-2" : ""}`}>
              <div>
                <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                  Level <span className="text-pb-ink">*</span>
                </label>
                <select
                  value={form.level}
                  onChange={(e) => set("level", e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="">Select level</option>
                  {cfg.levels.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                {errors.level && <p className="mt-1 text-xs text-red-500">{errors.level}</p>}
              </div>

              {asksDiscipline && (
                <div>
                  <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                    {cfg.disciplineLabel} <span className="text-pb-ink">*</span>
                  </label>
                  <select
                    value={form.discipline}
                    onChange={(e) => set("discipline", e.target.value)}
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    <option value="">Select one</option>
                    {cfg.disciplines.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {errors.discipline && (
                    <p className="mt-1 text-xs text-red-500">{errors.discipline}</p>
                  )}
                </div>
              )}
            </div>

            {/* The three free-text answers the whole funnel exists for: two
                shape the run of show, the third feeds the live Q&A. */}
            <div>
              <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                {cfg.academicChallengeLabel}{" "}
                <span className="text-fg-faint font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder={cfg.academicChallengePlaceholder}
                value={form.challengeAcademic}
                onChange={(e) => set("challengeAcademic", e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                {cfg.otherChallengeLabel}{" "}
                <span className="text-fg-faint font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder={cfg.otherChallengePlaceholder}
                value={form.challengeOther}
                onChange={(e) => set("challengeOther", e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                {cfg.questionLabel}{" "}
                <span className="text-fg-faint font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder={cfg.questionPlaceholder}
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
                {cfg.heardOptions.map((h) => (
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
              className="w-full bg-pb-fill text-white py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
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
