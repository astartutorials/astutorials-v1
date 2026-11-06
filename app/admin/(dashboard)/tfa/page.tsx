'use client';

import { useState, useEffect, useMemo } from "react";
import { Search, Loader2, Download, Ticket } from "lucide-react";
import { TFA_EVENT_NAME, TFA_ATTENDEE_TYPES } from "@/lib/tfa";

type Registration = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  call_phone: string | null;
  attendee_type: string;
  course_of_study: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  question: string | null;
  question_for: string | null;
  heard_via: string | null;
  created_at: string;
};

function waLink(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "").replace(/^0/, "234")}`;
}

/** RFC-4180 escaping: a comma or newline inside an answer must not shift columns. */
function csvCell(value: string | null) {
  const s = value ?? "";
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(rows: Registration[]) {
  const headers = [
    "Full Name", "Email", "WhatsApp", "Phone (Calls)", "Attendee Type", "Course of Study",
    "Parent/Guardian Name", "Parent/Guardian Phone", "Question", "Question For", "Heard Via", "Registered At",
  ];
  const body = rows.map((r) =>
    [
      r.full_name, r.email, r.phone, r.call_phone, r.attendee_type, r.course_of_study,
      r.parent_name, r.parent_phone, r.question, r.question_for, r.heard_via, r.created_at,
    ].map(csvCell).join(",")
  );
  // BOM so Excel opens the names as UTF-8.
  const blob = new Blob(["﻿" + [headers.join(","), ...body].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tfa-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Registrations for The Freshers' Advantage (/tfa): the guest list and follow-up list. */
export default function AdminTfaPage() {
  const [rows, setRows] = useState<Registration[] | null>(null);
  const [fetchError, setFetchError] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/admin/tfa-registrations")
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
        setFetchError("Failed to load registrations. Please refresh the page.");
        setRows([]);
      });
  }, []);

  const all = useMemo(() => rows ?? [], [rows]);

  const filtered = useMemo(() => {
    const source = typeFilter === "all" ? all : all.filter((r) => r.attendee_type === typeFilter);
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter((r) =>
      [r.full_name, r.email, r.phone, r.call_phone, r.course_of_study, r.parent_name, r.parent_phone]
        .some((f) => (f ?? "").toLowerCase().includes(q))
    );
  }, [all, typeFilter, query]);

  const filters = [
    { id: "all", label: "All", count: all.length },
    ...TFA_ATTENDEE_TYPES.map((t) => ({
      id: t as string,
      label: t,
      count: all.filter((r) => r.attendee_type === t).length,
    })),
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1120]">Freshers&apos; Advantage</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Everyone who registered for {TFA_EVENT_NAME} at astartutorials.com/tfa.
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
            onClick={() => setTypeFilter(f.id)}
            aria-pressed={typeFilter === f.id}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
              typeFilter === f.id
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
          placeholder="Search name, email, phone or course..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-[#0B1120] bg-white text-sm"
        />
      </div>

      {rows === null ? (
        <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading registrations...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Ticket className="mx-auto text-gray-300 mb-2" size={28} />
          <p className="text-gray-400 text-sm">
            {all.length === 0 ? "No registrations yet." : "Nothing matches your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white p-5 rounded-2xl border border-gray-100">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-[#0B1120] text-sm">{r.full_name}</p>
                  {r.course_of_study && <p className="text-xs text-gray-500 mt-0.5">{r.course_of_study}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 text-[#D93025]">
                    {r.attendee_type}
                  </span>
                  {r.heard_via && (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-50 text-gray-500">
                      via {r.heard_via}
                    </span>
                  )}
                  <span className="text-[11px] text-gray-400">
                    {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-gray-500">
                <span>
                  <a href={waLink(r.phone)} target="_blank" rel="noopener noreferrer" className="hover:text-[#D93025]">
                    <span className="text-gray-400">WhatsApp:</span> {r.phone}
                  </a>
                  <span className="text-gray-300 mx-1.5">·</span>
                  {(() => {
                    // Older rows have no calls number; the WhatsApp line is the best fallback.
                    const call = r.call_phone ?? r.phone;
                    return (
                      <a href={`tel:${call.replace(/[^\d+]/g, "")}`} className="hover:text-[#D93025]">
                        <span className="text-gray-400">Calls:</span> {call}
                      </a>
                    );
                  })()}
                  <span className="text-gray-300 mx-1.5">·</span>
                  <a href={`mailto:${r.email}`} className="hover:text-[#D93025]">{r.email}</a>
                </span>
                {(r.parent_name || r.parent_phone) && (
                  <span>
                    <span className="text-gray-400">Parent:</span> {r.parent_name}
                    {r.parent_name && r.parent_phone && <span className="text-gray-300 mx-1.5">·</span>}
                    {r.parent_phone && (
                      <a href={`tel:${r.parent_phone.replace(/[^\d+]/g, "")}`} className="hover:text-[#D93025]">{r.parent_phone}</a>
                    )}
                  </span>
                )}
              </div>
              {r.question && (
                <p className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-gray-400">Question{r.question_for ? ` for ${r.question_for}` : ""}:</span> {r.question}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
