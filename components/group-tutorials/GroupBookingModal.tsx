"use client";

import { useState, useRef } from "react";
import { X, Calendar, Clock, MapPin, Users, ArrowRight, Loader2 } from "lucide-react";
import { validateBookingForm } from "@/lib/validate";
import posthog from "posthog-js";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

interface GroupBookingModalProps {
  tutorial: {
    id: string;
    code: string;
    title: string;
    teacher: string;
    day: string;
    time: string;
    location?: string | null;
    price: number;
    seatsLeft: number;
  };
  onClose: () => void;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-line focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-fg-faint text-fg text-base";

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export default function GroupBookingModal({ tutorial, onClose }: GroupBookingModalProps) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<ReturnType<typeof validateBookingForm>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

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
          amount: tutorial.price,
          turnstileToken,
          metadata: {
            tutorial_id: tutorial.id,
            full_name: form.fullName,
            phone: form.phone,
            notes: form.notes,
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
      posthog.capture("group_booking_initiated", {
        tutorial_id: tutorial.id,
        tutorial_code: tutorial.code,
        tutorial_title: tutorial.title,
        teacher: tutorial.teacher,
        price: tutorial.price,
        seats_left: tutorial.seatsLeft,
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
          <h2 className="text-2xl font-bold text-fg">Reserve Your Spot</h2>
          <p className="text-fg-subtle text-sm mt-1">Complete your details to pay and secure your SPOT.</p>
        </div>

        <div className="px-8 py-6 space-y-5">
          {/* Order summary */}
          <div className="rounded-xl border border-line-subtle bg-surface-sunken p-4 space-y-2.5">
            <p className="font-bold text-fg text-sm">{tutorial.code} — {tutorial.title}</p>
            <p className="text-xs text-fg-subtle">with {tutorial.teacher}</p>
            <div className="border-t border-line pt-2.5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-fg-muted">
                <Calendar size={13} className="text-accent-ink flex-shrink-0" />
                <span>{tutorial.day}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-fg-muted">
                <Clock size={13} className="text-accent-ink flex-shrink-0" />
                <span>{formatTime(tutorial.time)}</span>
              </div>
              {tutorial.location && (
                <div className="flex items-center gap-2 text-xs text-fg-muted">
                  <MapPin size={13} className="text-accent-ink flex-shrink-0" />
                  <span>{tutorial.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-fg-muted">
                <Users size={13} className="text-accent-ink flex-shrink-0" />
                <span>{tutorial.seatsLeft} spot{tutorial.seatsLeft !== 1 ? "s" : ""} remaining</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-line pt-2.5 mt-1">
              <span className="text-sm text-fg-muted">Total</span>
              <span className="text-base font-extrabold text-brand-ink">
                ₦{tutorial.price.toLocaleString()}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                Full Name <span className="text-brand-ink">*</span>
              </label>
              <input type="text" placeholder="Enter your full name" value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)} className={inputClass} />
              {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                  Email <span className="text-brand-ink">*</span>
                </label>
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={(e) => set("email", e.target.value)} className={inputClass} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                  Phone <span className="text-brand-ink">*</span>
                </label>
                <input type="tel" placeholder="08012345678" value={form.phone}
                  onChange={(e) => set("phone", e.target.value)} className={inputClass} />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-semibold text-fg-muted block mb-1.5">
                Additional Notes <span className="text-fg-faint font-normal">(optional)</span>
              </label>
              <textarea rows={3} placeholder="Anything you'd like us to know..."
                value={form.notes} onChange={(e) => set("notes", e.target.value)}
                className={`${inputClass} resize-none`} />
            </div>

            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA'}
              onSuccess={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              options={{ appearance: 'interaction-only' }}
            />

            {apiError && <p className="text-sm text-red-600 dark:text-red-400 font-medium">{apiError}</p>}

            <button
              type="submit"
              disabled={loading || tutorial.seatsLeft <= 0 || !turnstileToken}
              className="w-full bg-[var(--astar-red)] text-white py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-brand-hover transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Redirecting to payment…</>
              ) : (
                <>Pay ₦{tutorial.price.toLocaleString()} &amp; Reserve Spot <ArrowRight size={18} /></>
              )}
            </button>

            <p className="text-center text-[11px] text-fg-faint pb-2">
              Payment secured by Paystack.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
