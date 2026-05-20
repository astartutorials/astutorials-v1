'use client';

import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import type { Tutorial } from "@/app/group-tutorials/confirm-booking/page";

interface PersonalInfoFormProps {
  tutorial: Tutorial | null;
}

export default function PersonalInfoForm({ tutorial }: PersonalInfoFormProps) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    course: "",
    matricId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tutorial) return;
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          amount: tutorial.price,
          metadata: {
            tutorial_id: tutorial.id,
            full_name: form.fullName,
            phone: form.phone,
            course: form.course,
            matric_id: form.matricId,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Payment initialisation failed. Please try again.");
        return;
      }

      window.location.href = data.authorization_url;
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-2xl pt-8 lg:pt-12 px-0 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Student Information</h1>
        <p className="text-gray-500">Please fill in your details to complete the booking.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Full Name</label>
          <input
            type="text"
            placeholder="e.g. John Doe"
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-800"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Email Address</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-800"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Phone Number</label>
            <input
              type="tel"
              placeholder="+234 800 000 0000"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Course of Study</label>
            <input
              type="text"
              placeholder="e.g. Computer Science"
              value={form.course}
              onChange={(e) => set("course", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-800"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Student ID</label>
            <input
              type="text"
              placeholder="e.g. 19/1234"
              value={form.matricId}
              onChange={(e) => set("matricId", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-800"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !tutorial}
            className="w-full btn-primary bg-[var(--astar-red)] text-white font-bold text-lg py-4 rounded-xl shadow-xl shadow-red-500/20 hover:shadow-2xl hover:shadow-red-500/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <><Loader2 size={18} className="animate-spin" /> Processing...</>
            ) : (
              <><Lock size={18} /> Pay via Paystack</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
