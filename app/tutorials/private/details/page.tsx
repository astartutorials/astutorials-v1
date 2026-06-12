'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const LEVELS = ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', '600 Level', 'Postgraduate'];

const SCHEDULE_OPTIONS = [
  'Weekday Mornings (8am – 12pm)',
  'Weekday Afternoons (12pm – 4pm)',
  'Weekday Evenings (4pm – 8pm)',
  'Saturday',
  'Sunday',
];

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-800 text-base bg-white';

function DetailsForm() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') ?? '';

  const [booking, setBooking] = useState<{ full_name: string; phone: string; course: string } | null>(null);
  const [loadError, setLoadError] = useState(!ref);

  const [form, setForm] = useState({
    courseOfStudy: '',
    level: '',
    schedule: [] as string[],
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ref) return;
    fetch(`/api/bookings/${ref}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setLoadError(true); return; }
        setBooking(d);
      })
      .catch(() => setLoadError(true));
  }, [ref]);

  function toggle(slot: string) {
    setForm((prev) => ({
      ...prev,
      schedule: prev.schedule.includes(slot)
        ? prev.schedule.filter((s) => s !== slot)
        : [...prev.schedule, slot],
    }));
  }

  function validate() {
    const errs: Partial<Record<keyof typeof form, string>> = {};
    if (!form.courseOfStudy.trim()) errs.courseOfStudy = 'Required';
    if (!form.level) errs.level = 'Required';
    if (form.schedule.length === 0) errs.schedule = 'Pick at least one';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);

    await fetch(`/api/bookings/${ref}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseOfStudy: form.courseOfStudy,
        level: form.level,
        preferredSchedule: form.schedule.join(', '),
        notes: form.notes || undefined,
      }),
    });

    const name = booking?.full_name ?? '';
    const phone = booking?.phone ?? '';
    const course = booking?.course ?? '';

    const lines = [
      'Hello! I just paid for a private tutorial session.',
      '',
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Course to be tutored: ${course}`,
      `Course of Study: ${form.courseOfStudy}`,
      `Level: ${form.level}`,
      `Preferred Schedule: ${form.schedule.join(', ')}`,
      form.notes ? `Additional Notes: ${form.notes}` : '',
    ].filter(Boolean);

    const message = lines.join('\n');
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=2349160465678&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
    window.location.href = whatsappUrl;
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--astar-bg)]">
        <div className="text-center">
          <p className="text-gray-500 mb-2">We couldn&apos;t find your booking.</p>
          <a href="/tutorials?type=private" className="text-[var(--astar-red)] font-semibold underline text-sm">
            Back to tutorials
          </a>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--astar-bg)]">
        <Loader2 className="animate-spin text-[var(--astar-red)]" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--astar-bg)] flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--astar-red)] px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="text-white" size={22} />
            <span className="text-white font-bold text-sm uppercase tracking-wide">Payment Confirmed</span>
          </div>
          <h1 className="text-white text-2xl font-bold">One last step, {booking.full_name.split(' ')[0]}!</h1>
          <p className="text-red-100 text-sm mt-1">
            Tell us a bit more so we can match you with the right tutor.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
          {/* Course of Study + Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                Course of Study <span className="text-[var(--astar-red)]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={form.courseOfStudy}
                onChange={(e) => setForm((p) => ({ ...p, courseOfStudy: e.target.value }))}
                className={inputClass}
              />
              {errors.courseOfStudy && <p className="mt-1 text-xs text-red-500">{errors.courseOfStudy}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                Level <span className="text-[var(--astar-red)]">*</span>
              </label>
              <select
                value={form.level}
                onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="">Select level</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              {errors.level && <p className="mt-1 text-xs text-red-500">{errors.level}</p>}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Preferred Schedule <span className="text-[var(--astar-red)]">*</span>
              <span className="ml-1.5 text-gray-400 font-normal text-xs">(select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SCHEDULE_OPTIONS.map((slot) => {
                const active = form.schedule.includes(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => toggle(slot)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      active
                        ? 'bg-[var(--astar-red)] border-[var(--astar-red)] text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-[var(--astar-red)] hover:text-[var(--astar-red)]'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
            {errors.schedule && <p className="mt-1.5 text-xs text-red-500">{errors.schedule}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Additional Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Specific topics, areas you're struggling with, or anything else we should know..."
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className={`${inputClass} resize-none`}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[var(--astar-red)] text-white py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <><Loader2 size={18} className="animate-spin" /> Opening WhatsApp…</>
            ) : (
              <>Connect on WhatsApp <ArrowRight size={18} /></>
            )}
          </button>

          <p className="text-center text-[11px] text-gray-400 pb-1">
            We&apos;ll use this to match you with the best tutor for your needs.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function PrivateDetailsPage() {
  return (
    <Suspense>
      <DetailsForm />
    </Suspense>
  );
}
