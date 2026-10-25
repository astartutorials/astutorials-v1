'use client';

import { useState, useEffect, useMemo } from "react";
import { Search, Loader2, Download, PhoneCall } from "lucide-react";
import { SEMESTER_PLANS, isSemesterPlanId } from "@/lib/semester-plan";

type Enquiry = {
  id: string;
  session: string;
  plan: string;
  submitted_by: "student" | "parent";
  student_name: string;
  student_phone: string;
  student_email: string | null;
  course_of_study: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string | null;
  notes: string | null;
  created_at: string;
};

type PlanFilter = "all" | "group" | "private" | "undecided";

function planLabel(plan: string) {
  return isSemesterPlanId(plan) ? SEMESTER_PLANS[plan].name : "Undecided";
}

function waLink(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "").replace(/^0/, "234")}`;
}

/** RFC-4180 escaping — a comma or newline inside an answer must not shift columns. */
function csvCell(value: string | null) {
  const s = value ?? "";
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(rows: Enquiry[]) {
  const headers = [
    "Plan", "Submitted By", "Student Name", "Student Phone", "Student Email", "Course of Study",
    "Parent/Guardian Name", "Parent/Guardian Phone", "Parent/Guardian Email", "Notes", "Received At",
  ];
  const body = rows.map((r) =>
    [
      planLabel(r.plan), r.submitted_by, r.student_name, r.student_phone, r.student_email,
      r.course_of_study, r.parent_name, r.parent_phone, r.parent_email, r.notes, r.created_at,
    ].map(csvCell).join(",")
  );
  // BOM so Excel opens the names as UTF-8.
  const blob = new Blob(["﻿" + [headers.join(","), ...body].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `semester-plan-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Full Semester Plan enquiries: students or parents who left details instead of
 * paying. Paid plans are bookings and show under Payments.
 */
export default function AdminSemesterPlanPage() {
  const [rows, setRows] = useState<Enquiry[] | null>(null);
  const [fetchError, setFetchError] = useState("");
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");

  useEffect(() => {
    fetch("/api/admin/semester-plan-enquiries")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setFetchError(data.error);
          setRows([]);
        } else {
          setRows(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        setFetchError("Failed to load enquiries. Please refresh the page.");
        setRows([]);
      });
  }, []);

  const all = useMemo(() => rows ?? [], [rows]);
  const counts = useMemo(
    () => ({
      group: all.filter((r) => r.plan === "group").length,
      private: all.filter((r) => r.plan === "private").length,
      undecided: all.filter((r) => r.plan === "undecided").length,
    }),
    [all]
  );

  const filtered = useMemo(() => {
    const source = planFilter === "all" ? all : all.filter((r) => r.plan === planFilter);
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter((r) =>
      [r.student_name, r.student_phone, r.student_email, r.course_of_study, r.parent_name, r.parent_phone]
        .some((f) => (f ?? "").toLowerCase().includes(q))
    );
  }, [all, planFilter, query]);

  const filters: { id: PlanFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: all.length },
    { id: "group", label: "Group", count: counts.group },
    { id: "private", label: "Private", count: counts.private },
    { id: "undecided", label: "Undecided", count: counts.undecided },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1120]">Semester Plan Enquiries</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Students and parents who asked to be contacted about the Full Semester Plan. Paid plans are under Payments.
          </p>
        </div>
        <button
          onClick={() => downloadCsv(filtered)}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1120] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={15} />
          Export CSV{filtered.length > 0 && ` (${filtered.length})`}
        </button>
      </div>

      {fetchError && (
        <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
          {fetchError === "Forbidden"
            ? "Your account doesn't have access to this page. It's restricted to super admins and org admins."
            : fetchError}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setPlanFilter(f.id)}
            aria-pressed={planFilter === f.id}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
              planFilter === f.id
                ? "bg-[#0B1120] text-white border-[#0B1120]"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {f.label} <span className="ml-1 text-xs opacity-60">{f.count}</span>
          </button>
        ))}
      </div>

      <div className="relative flex-1 max-w-sm mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search student, parent, phone or course..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-[#0B1120] bg-white text-sm"
        />
      </div>

      {rows === null ? (
        <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading enquiries...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <PhoneCall className="mx-auto text-gray-300 mb-2" size={28} />
          <p className="text-gray-400 text-sm">
            {all.length === 0 ? "No enquiries yet." : "Nothing matches your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white p-5 rounded-2xl border border-gray-100">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-[#0B1120] text-sm">{r.student_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.course_of_study}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    r.plan === "private" ? "bg-indigo-50 text-indigo-700" : r.plan === "group" ? "bg-red-50 text-[#D93025]" : "bg-gray-100 text-gray-600"
                  }`}>
                    {planLabel(r.plan)}
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-50 text-gray-500">
                    From {r.submitted_by === "parent" ? "parent" : "student"}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-500">
                <span>
                  <span className="text-gray-400">Student:</span>{" "}
                  <a href={`tel:${r.student_phone.replace(/[^\d+]/g, "")}`} className="hover:text-[#D93025]">{r.student_phone}</a>
                  <span className="text-gray-300 mx-1.5">·</span>
                  <a href={waLink(r.student_phone)} target="_blank" rel="noopener noreferrer" className="hover:text-[#D93025]">WhatsApp</a>
                  {r.student_email && (
                    <> · <a href={`mailto:${r.student_email}`} className="hover:text-[#D93025]">{r.student_email}</a></>
                  )}
                </span>
                <span>
                  <span className="text-gray-400">Parent:</span> {r.parent_name} ·{" "}
                  <a href={`tel:${r.parent_phone.replace(/[^\d+]/g, "")}`} className="hover:text-[#D93025]">{r.parent_phone}</a>
                  <span className="text-gray-300 mx-1.5">·</span>
                  <a href={waLink(r.parent_phone)} target="_blank" rel="noopener noreferrer" className="hover:text-[#D93025]">WhatsApp</a>
                  {r.parent_email && (
                    <> · <a href={`mailto:${r.parent_email}`} className="hover:text-[#D93025]">{r.parent_email}</a></>
                  )}
                </span>
              </div>
              {r.notes && <p className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{r.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
