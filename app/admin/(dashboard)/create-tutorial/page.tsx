'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Eye, Loader2, MapPin, Building2 } from "lucide-react";
import { useAdminUser } from "@/lib/admin-context";

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-[#0B1120] bg-white text-sm";

type Org = { id: string; name: string };

export default function CreateTutorialPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    code: "",
    title: "",
    teacher: "",
    description: "",
    date: "",
    time: "",
    location: "",
    capacity: "",
    price: "",
  });
  const [orgId, setOrgId] = useState("");
  const [visible, setVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orgs, setOrgs] = useState<Org[]>([]);
  const { role } = useAdminUser();

  useEffect(() => {
    if (role === 'super_admin') {
      fetch("/api/admin/orgs").then(r => r.json()).then(data => {
        if (Array.isArray(data)) setOrgs(data);
      }).catch(() => {});
    }
  }, [role]);

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(status: "active" | "draft") {
    setError("");
    if (!form.code || !form.title) {
      setError("Course code and title are required.");
      return;
    }
    if (status === "active" && (!form.teacher || !form.capacity)) {
      setError("Tutor name and available seats are required to publish.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/tutorials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          title: form.title,
          teacher: form.teacher,
          description: form.description,
          date: form.date || null,
          time: form.time,
          location: form.location || null,
          capacity: form.capacity ? Number(form.capacity) : 30,
          price: form.price ? Number(form.price) : 0,
          status,
          ...(role === 'super_admin' && orgId ? { orgId } : {}),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message ?? "Failed to create tutorial.");
        return;
      }
      router.push("/admin/tutorials");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-[#0B1120]">Schedule Tutorial</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Set up a new group session for students.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
        {role === 'super_admin' && orgs.length > 0 && (
          <div className="mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={16} className="text-[#D93025]" />
              <h3 className="font-bold text-[#D93025] text-sm">Organisation</h3>
            </div>
            <select
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-[#0B1120] bg-white text-sm"
            >
              <option value="">Select organisation...</option>
              {orgs.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left — General Info */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="w-5 h-5 rounded-full bg-[#D93025] text-white text-[10px] font-bold flex items-center justify-center">i</span>
              <h3 className="font-bold text-[#D93025] text-sm">General Info</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Course Code</label>
                <input
                  type="text"
                  placeholder="e.g. MATH101"
                  value={form.code}
                  onChange={(e) => set("code", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Tutorial Title</label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Calculus Review"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Topics to be Covered</label>
              <textarea
                rows={7}
                placeholder="List the main topics that will be discussed in this session..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                maxLength={500}
                className={`${inputClass} resize-none`}
              />
              <div className="text-right text-[10px] text-gray-400 font-medium">
                {form.description.length}/500 characters
              </div>
            </div>
          </div>

          {/* Right — Schedule & Capacity */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Calendar size={16} className="text-[#D93025]" />
              <h3 className="font-bold text-[#D93025] text-sm">Schedule & Capacity</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Date</label>
                <div className="relative group">
                  <Calendar
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                    size={15}
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector("input");
                      if (input) input.showPicker();
                    }}
                  />
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => set("date", e.target.value)}
                    className={`${inputClass} pl-10 [appearance:none] [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer`}
                    onClick={(e) => e.currentTarget.showPicker()}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Time</label>
                <div className="relative group">
                  <Clock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                    size={15}
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector("input");
                      if (input) input.showPicker();
                    }}
                  />
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => set("time", e.target.value)}
                    className={`${inputClass} pl-10 [appearance:none] [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer`}
                    onClick={(e) => e.currentTarget.showPicker()}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Available Slots</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="30"
                    value={form.capacity}
                    onChange={(e) => set("capacity", e.target.value)}
                    className={inputClass}
                    min={1}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-medium">
                    students
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Price per Student</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-sm font-semibold">₦</span>
                  <input
                    type="number"
                    placeholder="1000"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    className={`${inputClass} pl-7`}
                    min={0}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Tutor Name</label>
              <input
                type="text"
                placeholder="Enter tutor name..."
                value={form.teacher}
                onChange={(e) => set("teacher", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="text"
                  placeholder="e.g. Room 201, Faculty of Science or Online"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Visibility toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  <Eye size={15} />
                </div>
                <div>
                  <p className="font-bold text-[#0B1120] text-sm">Visible to students</p>
                  <p className="text-[10px] text-gray-500">
                    Tutorial will appear on the booking page immediately.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${visible ? "bg-[#0B1120]" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${visible ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : null}
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("active")}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D93025] text-white font-semibold rounded-xl shadow-sm hover:bg-red-700 transition-all text-sm disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : null}
            Publish Tutorial
          </button>
        </div>
      </div>
    </div>
  );
}
