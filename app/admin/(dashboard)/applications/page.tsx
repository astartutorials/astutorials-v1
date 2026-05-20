'use client';

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Search, ChevronDown, ExternalLink, Mail } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subjects_can_teach: string | null;
  levels_can_teach: string | null;
  years_of_experience: string | null;
  teaching_mode: string | null;
  education_level: string | null;
  institution: string | null;
  field_of_study: string | null;
  has_tutored_before: string | null;
  previous_tutoring_description: string | null;
  why_astar: string | null;
  difficult_concept_explanation: string | null;
  days_available: string | null;
  time_of_day: string | null;
  cv_link: string | null;
  linkedin_portfolio: string | null;
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = ["new", "reviewing", "shortlisted", "rejected"];

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  reviewing: "bg-yellow-50 text-yellow-700",
  shortlisted: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchApplications() {
    setLoading(true);
    const { data } = await supabase
      .from("tutor_applications")
      .select("*")
      .order("created_at", { ascending: false });
    setApplications(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchApplications(); }, []);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    await supabase.from("tutor_applications").update({ status }).eq("id", id);
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    setUpdatingId(null);
  }

  const filtered = applications.filter((a) => {
    const matchesSearch =
      !search ||
      a.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      (a.subjects_can_teach ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0B1120]">Tutor Applications</h1>
        <p className="text-gray-500 text-sm mt-1">{applications.length} total application{applications.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D93025]/20 focus:border-[#D93025]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D93025]/20 focus:border-[#D93025] capitalize"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 text-sm">Loading applications…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <p className="text-gray-400 text-sm">No applications found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Summary row */}
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-full bg-red-50 text-[#D93025] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {app.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{app.full_name}</p>
                  <p className="text-gray-400 text-xs truncate">{app.email}</p>
                </div>

                <div className="hidden sm:block text-sm text-gray-600 min-w-0 flex-shrink-0 w-40 truncate">
                  {app.subjects_can_teach ?? "—"}
                </div>

                <div className="hidden md:block text-xs text-gray-400 flex-shrink-0">
                  {formatDate(app.created_at)}
                </div>

                <div className="flex-shrink-0">
                  <StatusBadge status={app.status} />
                </div>

                <button
                  onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${expanded === app.id ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              {/* Expanded detail */}
              {expanded === app.id && (
                <div className="border-t border-gray-50 px-6 py-5 bg-gray-50/50 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Detail label="Phone" value={app.phone} />
                    <Detail label="Education Level" value={app.education_level} />
                    <Detail label="Institution" value={app.institution} />
                    <Detail label="Field of Study" value={app.field_of_study} />
                    <Detail label="Years of Experience" value={app.years_of_experience} />
                    <Detail label="Teaching Mode" value={app.teaching_mode} />
                    <Detail label="Levels Can Teach" value={app.levels_can_teach} />
                    <Detail label="Days Available" value={app.days_available} />
                    <Detail label="Time of Day" value={app.time_of_day} />
                    <Detail label="Tutored Before?" value={app.has_tutored_before} />
                  </div>

                  {app.previous_tutoring_description && (
                    <LongDetail label="Previous Tutoring" value={app.previous_tutoring_description} />
                  )}
                  {app.why_astar && (
                    <LongDetail label="Why A-Star?" value={app.why_astar} />
                  )}
                  {app.difficult_concept_explanation && (
                    <LongDetail label="Difficult Concept Explanation" value={app.difficult_concept_explanation} />
                  )}

                  {/* Links */}
                  <div className="flex flex-wrap gap-3">
                    {app.cv_link && (
                      <a
                        href={app.cv_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#D93025] hover:underline"
                      >
                        <ExternalLink size={13} /> View CV
                      </a>
                    )}
                    {app.linkedin_portfolio && (
                      <a
                        href={app.linkedin_portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#D93025] hover:underline"
                      >
                        <ExternalLink size={13} /> LinkedIn / Portfolio
                      </a>
                    )}
                    <a
                      href={`mailto:${app.email}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
                    >
                      <Mail size={13} /> Email Applicant
                    </a>
                  </div>

                  {/* Status update */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs text-gray-500 font-medium">Update status:</span>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(app.id, s)}
                          disabled={app.status === s || updatingId === app.id}
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                            app.status === s
                              ? STATUS_STYLES[s] ?? "bg-gray-100 text-gray-600"
                              : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-700">{value || "—"}</p>
    </div>
  );
}

function LongDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-gray-600 leading-relaxed">{value}</p>
    </div>
  );
}
