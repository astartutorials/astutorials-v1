"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2, Info } from "lucide-react";

const EDUCATION_LEVELS = ["Secondary", "Undergraduate", "Postgraduate", "PhD", "Professional Certification"];
const LEVELS_CAN_TEACH = [
  "Primary",
  "Junior Secondary",
  "Senior Secondary",
  "100L", "200L", "300L", "400L", "500L", "600L",
];
const YEARS_OPTIONS = ["0-1 years", "1-3 years", "3-5 years", "5+ years"];
const TEACHING_MODES = ["Online", "In-Person", "Both"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES_OF_DAY = ["Morning", "Afternoon", "Evening", "Flexible"];

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-800 bg-white";
const selectClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-gray-800 bg-white appearance-none cursor-pointer";
const textareaClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--astar-red)] focus:ring-4 focus:ring-red-500/10 outline-none transition-all placeholder:text-gray-300 text-gray-800 bg-white resize-none";
const labelClass = "text-sm font-bold text-gray-700";
const sectionHeadingClass = "text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 pt-2";

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 pt-4">
      <div className="flex-1 h-px bg-gray-100" />
      <span className={sectionHeadingClass + " pt-0 mb-0"}>{label}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function ToggleChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 cursor-pointer ${
        selected
          ? "bg-[var(--astar-red)] border-[var(--astar-red)] text-white shadow-sm shadow-red-500/20"
          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  educationLevel: string;
  institution: string;
  fieldOfStudy: string;
  coursesCanTeach: string;
  levelsCanTeach: string[];
  yearsOfExperience: string;
  teachingMode: string;
  hasTutoredBefore: string;
  previousTutoringDescription: string;
  whyAstar: string;
  difficultConceptExplanation: string;
  daysAvailable: string[];
  timeOfDay: string[];
  cvLink: string;
  linkedinPortfolio: string;
}

const initialForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  educationLevel: "",
  institution: "",
  fieldOfStudy: "",
  coursesCanTeach: "",
  levelsCanTeach: [],
  yearsOfExperience: "",
  teachingMode: "",
  hasTutoredBefore: "",
  previousTutoringDescription: "",
  whyAstar: "",
  difficultConceptExplanation: "",
  daysAvailable: [],
  timeOfDay: [],
  cvLink: "",
  linkedinPortfolio: "",
};

function toggleItem(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export default function TutorApplicationForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [apiError, setApiError] = useState("");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function toggleMulti(key: "levelsCanTeach" | "daysAvailable" | "timeOfDay", value: string) {
    setForm((prev) => ({ ...prev, [key]: toggleItem(prev[key], value) }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (!form.fullName.trim()) next.fullName = "Required";
    if (!form.email.trim()) next.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email";
    if (!form.phone.trim()) next.phone = "Required";
    if (!form.educationLevel) next.educationLevel = "Required";
    if (!form.institution.trim()) next.institution = "Required";
    if (!form.fieldOfStudy.trim()) next.fieldOfStudy = "Required";
    if (!form.coursesCanTeach.trim()) next.coursesCanTeach = "Required";
    if (form.levelsCanTeach.length === 0) next.levelsCanTeach = "Select at least one";
    if (!form.yearsOfExperience) next.yearsOfExperience = "Required";
    if (!form.teachingMode) next.teachingMode = "Required";
    if (!form.hasTutoredBefore) next.hasTutoredBefore = "Required";
    if (form.hasTutoredBefore === "Yes" && !form.previousTutoringDescription.trim())
      next.previousTutoringDescription = "Required";
    if (!form.whyAstar.trim()) next.whyAstar = "Required";
    if (!form.difficultConceptExplanation.trim()) next.difficultConceptExplanation = "Required";
    if (form.daysAvailable.length === 0) next.daysAvailable = "Select at least one";
    if (form.timeOfDay.length === 0) next.timeOfDay = "Select at least one";
    if (!form.cvLink.trim()) next.cvLink = "Required";
    else if (!isValidUrl(form.cvLink)) next.cvLink = "Enter a valid URL";
    if (form.linkedinPortfolio && !isValidUrl(form.linkedinPortfolio))
      next.linkedinPortfolio = "Enter a valid URL";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");
    setApiError("");

    try {
      const res = await fetch("/api/tutor-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Submission failed");
      }

      setStatus("success");
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-20 px-4">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
          Thanks for applying to join A-Star Tutorials. We&apos;ll review your application and be
          in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <span className="text-xs font-bold tracking-widest text-[var(--astar-red)] uppercase mb-3 block">
          Join our team
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          Tutor Application
        </h1>
        <p className="text-gray-500 leading-relaxed">
          Tell us about yourself and we&apos;ll be in touch if you&apos;re a great fit.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        {/* Personal Information */}
        <SectionDivider label="Personal Information" />

        <div className="space-y-2">
          <label className={labelClass}>Full Name</label>
          <input
            type="text"
            placeholder="e.g. Alvan Ikoku"
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            className={inputClass}
          />
          {errors.fullName && <p className="text-xs text-red-500 font-medium">{errors.fullName}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              placeholder="alvan.ikoku@education.ng"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass}
            />
            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Phone Number</label>
            <input
              type="tel"
              placeholder="+234 800 000 0000"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={inputClass}
            />
            {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone}</p>}
          </div>
        </div>

        {/* Education */}
        <SectionDivider label="Education & Background" />

        <div className="space-y-2">
          <label className={labelClass}>Highest Education Level</label>
          <div className="relative">
            <select
              value={form.educationLevel}
              onChange={(e) => set("educationLevel", e.target.value)}
              className={selectClass + (form.educationLevel ? " text-gray-800" : " text-gray-300")}
            >
              <option value="" disabled>Select level</option>
              {EDUCATION_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
          </div>
          {errors.educationLevel && <p className="text-xs text-red-500 font-medium">{errors.educationLevel}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={labelClass}>Institution</label>
            <input
              type="text"
              placeholder="e.g. University of Lagos"
              value={form.institution}
              onChange={(e) => set("institution", e.target.value)}
              className={inputClass}
            />
            {errors.institution && <p className="text-xs text-red-500 font-medium">{errors.institution}</p>}
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Field of Study or Background</label>
            <input
              type="text"
              placeholder="e.g. Mathematics"
              value={form.fieldOfStudy}
              onChange={(e) => set("fieldOfStudy", e.target.value)}
              className={inputClass}
            />
            {errors.fieldOfStudy && <p className="text-xs text-red-500 font-medium">{errors.fieldOfStudy}</p>}
          </div>
        </div>

        {/* Teaching Experience */}
        <SectionDivider label="Teaching Experience" />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className={labelClass}>Courses you can teach</label>
            <div className="group relative flex items-center">
              <Info size={14} className="text-gray-400 cursor-pointer" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center leading-relaxed">
                You must have had an A in the courses you want to teach
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </div>
            </div>
          </div>
          <input
            type="text"
            placeholder="e.g. MTH 101, PHY 102, CSC 201"
            value={form.coursesCanTeach}
            onChange={(e) => set("coursesCanTeach", e.target.value)}
            className={inputClass}
          />
          {errors.coursesCanTeach && <p className="text-xs text-red-500 font-medium">{errors.coursesCanTeach}</p>}
        </div>

        <div className="space-y-3">
          <label className={labelClass}>Levels you can teach</label>
          <div className="flex flex-wrap gap-2">
            {LEVELS_CAN_TEACH.map((level) => (
              <ToggleChip
                key={level}
                label={level}
                selected={form.levelsCanTeach.includes(level)}
                onClick={() => toggleMulti("levelsCanTeach", level)}
              />
            ))}
          </div>
          {errors.levelsCanTeach && <p className="text-xs text-red-500 font-medium">{errors.levelsCanTeach}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={labelClass}>Years of teaching experience</label>
            <div className="relative">
              <select
                value={form.yearsOfExperience}
                onChange={(e) => set("yearsOfExperience", e.target.value)}
                className={selectClass + (form.yearsOfExperience ? " text-gray-800" : " text-gray-300")}
              >
                <option value="" disabled>Select range</option>
                {YEARS_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
            </div>
            {errors.yearsOfExperience && <p className="text-xs text-red-500 font-medium">{errors.yearsOfExperience}</p>}
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Teaching mode</label>
            <div className="relative">
              <select
                value={form.teachingMode}
                onChange={(e) => set("teachingMode", e.target.value)}
                className={selectClass + (form.teachingMode ? " text-gray-800" : " text-gray-300")}
              >
                <option value="" disabled>Select mode</option>
                {TEACHING_MODES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
            </div>
            {errors.teachingMode && <p className="text-xs text-red-500 font-medium">{errors.teachingMode}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Have you tutored before?</label>
          <div className="flex gap-3">
            {["Yes", "No"].map((opt) => (
              <ToggleChip
                key={opt}
                label={opt}
                selected={form.hasTutoredBefore === opt}
                onClick={() => set("hasTutoredBefore", opt)}
              />
            ))}
          </div>
          {errors.hasTutoredBefore && <p className="text-xs text-red-500 font-medium">{errors.hasTutoredBefore}</p>}
        </div>

        {form.hasTutoredBefore === "Yes" && (
          <div className="space-y-2">
            <label className={labelClass}>Describe your previous tutoring experience</label>
            <textarea
              rows={4}
              placeholder="Where, who, what subjects, how long..."
              value={form.previousTutoringDescription}
              onChange={(e) => set("previousTutoringDescription", e.target.value)}
              className={textareaClass}
            />
            {errors.previousTutoringDescription && (
              <p className="text-xs text-red-500 font-medium">{errors.previousTutoringDescription}</p>
            )}
          </div>
        )}

        {/* About You */}
        <SectionDivider label="About You" />

        <div className="space-y-2">
          <label className={labelClass}>Why do you want to tutor with A-Star?</label>
          <textarea
            rows={4}
            placeholder="Tell us what motivates you..."
            value={form.whyAstar}
            onChange={(e) => set("whyAstar", e.target.value)}
            className={textareaClass}
          />
          {errors.whyAstar && <p className="text-xs text-red-500 font-medium">{errors.whyAstar}</p>}
        </div>

        <div className="space-y-2">
          <label className={labelClass}>
            How would you explain a difficult concept to a struggling student?
          </label>
          <textarea
            rows={4}
            placeholder="Walk us through your approach..."
            value={form.difficultConceptExplanation}
            onChange={(e) => set("difficultConceptExplanation", e.target.value)}
            className={textareaClass}
          />
          {errors.difficultConceptExplanation && (
            <p className="text-xs text-red-500 font-medium">{errors.difficultConceptExplanation}</p>
          )}
        </div>

        {/* Availability */}
        <SectionDivider label="Availability" />

        <div className="space-y-3">
          <label className={labelClass}>Days available</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <ToggleChip
                key={day}
                label={day}
                selected={form.daysAvailable.includes(day)}
                onClick={() => toggleMulti("daysAvailable", day)}
              />
            ))}
          </div>
          {errors.daysAvailable && <p className="text-xs text-red-500 font-medium">{errors.daysAvailable}</p>}
        </div>

        <div className="space-y-3">
          <label className={labelClass}>Time of day</label>
          <div className="flex flex-wrap gap-2">
            {TIMES_OF_DAY.map((time) => (
              <ToggleChip
                key={time}
                label={time}
                selected={form.timeOfDay.includes(time)}
                onClick={() => toggleMulti("timeOfDay", time)}
              />
            ))}
          </div>
          {errors.timeOfDay && <p className="text-xs text-red-500 font-medium">{errors.timeOfDay}</p>}
        </div>

        {/* Links */}
        <SectionDivider label="Links" />

        <div className="space-y-2">
          <label className={labelClass}>
            CV / Resume link <span className="text-gray-400 font-normal">(Google Drive, Dropbox, etc.)</span>
          </label>
          <input
            type="url"
            placeholder="https://drive.google.com/..."
            value={form.cvLink}
            onChange={(e) => set("cvLink", e.target.value)}
            className={inputClass}
          />
          {errors.cvLink && <p className="text-xs text-red-500 font-medium">{errors.cvLink}</p>}
        </div>

        <div className="space-y-2">
          <label className={labelClass}>
            LinkedIn or Portfolio link{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="url"
            placeholder="https://linkedin.com/in/..."
            value={form.linkedinPortfolio}
            onChange={(e) => set("linkedinPortfolio", e.target.value)}
            className={inputClass}
          />
          {errors.linkedinPortfolio && (
            <p className="text-xs text-red-500 font-medium">{errors.linkedinPortfolio}</p>
          )}
        </div>

        {status === "error" && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{apiError}</p>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full btn-primary bg-[var(--astar-red)] text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-lg"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                Submit Application
                <Send size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
