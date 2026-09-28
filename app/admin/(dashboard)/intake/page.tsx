'use client';

import { useState, useEffect, useMemo } from "react";
import { Search, Loader2, Download, Cake, Users } from "lucide-react";
import { INTAKE_SESSIONS, MONTHS, levelInSession, sessionFor } from "@/lib/intakes";

type Registration = {
  id: string;
  session: string;
  entry_level: number;
  full_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  course_of_study: string;
  instagram: string | null;
  tiktok: string | null;
  birth_day: number;
  birth_month: number;
  parent_name: string;
  parent_phone: string;
  parent_email: string | null;
  created_at: string;
};

/** Stable identity, so the memos below don't recompute while a fetch is in flight. */
const EMPTY: Registration[] = [];

function birthday(r: Registration) {
  return `${r.birth_day} ${MONTHS[r.birth_month - 1]?.slice(0, 3) ?? ""}`;
}

function waLink(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "").replace(/^0/, "234")}`;
}

/** RFC-4180 escaping — a comma or newline inside an answer must not shift columns. */
function csvCell(value: string | number | null) {
  const s = value === null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(rows: Registration[], session: string, currentSession: string) {
  const headers = [
    "Full Name", "Entry Level", "Current Level", "Course of Study", "Email", "Phone (Calls)",
    "WhatsApp", "Instagram", "TikTok", "Birthday", "Parent/Guardian Name",
    "Parent/Guardian Phone", "Parent/Guardian Email", "Registered At",
  ];
  const body = rows.map((r) =>
    [
      r.full_name, r.entry_level, levelInSession(r.entry_level, r.session, currentSession),
      r.course_of_study, r.email, r.phone, r.whatsapp, r.instagram, r.tiktok, birthday(r),
      r.parent_name, r.parent_phone, r.parent_email, r.created_at,
    ].map(csvCell).join(",")
  );
  // BOM so Excel opens the names as UTF-8.
  const blob = new Blob(["﻿" + [headers.join(","), ...body].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `student-intake-${session.replace("/", "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * New-student registrations, one academic session at a time.
 *
 * Picking a session is the point: the form is reused every year, and this page
 * never shows every intake as one list. Each student's entry level is shown
 * alongside the level they are in now, so a 2026/2027 fresher reads as 200 level
 * once the 2027/2028 session starts.
 */
export default function AdminIntakePage() {
  const [session, setSession] = useState(INTAKE_SESSIONS[0]);
  const [query, setQuery] = useState("");
  const [birthdaysOnly, setBirthdaysOnly] = useState(false);
  const [result, setResult] = useState<{ session: string; rows: Registration[]; error: string } | null>(null);

  const currentSession = sessionFor();
  const thisMonth = new Date().getMonth() + 1;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/student-registrations?session=${encodeURIComponent(session)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setResult(
          data.error
            ? { session, rows: [], error: data.error }
            : { session, rows: Array.isArray(data) ? data : [], error: "" }
        );
      })
      .catch(() => {
        if (!cancelled) setResult({ session, rows: [], error: "Failed to load registrations. Please refresh the page." });
      });
    // A slow response for the session you just left must not overwrite the one you picked.
    return () => { cancelled = true; };
  }, [session]);

  const loading = result?.session !== session;
  const regs = loading ? EMPTY : result.rows;
  const fetchError = loading ? "" : result.error;

  const birthdaysThisMonth = useMemo(
    () => regs.filter((r) => r.birth_month === thisMonth).sort((a, b) => a.birth_day - b.birth_day),
    [regs, thisMonth]
  );

  const filtered = useMemo(() => {
    const source = birthdaysOnly ? birthdaysThisMonth : regs;
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter((r) =>
      [r.full_name, r.email, r.phone, r.whatsapp, r.course_of_study, r.instagram, r.tiktok, r.parent_name]
        .some((f) => (f ?? "").toLowerCase().includes(q))
    );
  }, [regs, birthdaysThisMonth, birthdaysOnly, query]);

  const courses = useMemo(() => new Set(regs.map((r) => r.course_of_study.trim().toLowerCase())).size, [regs]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1120]">Student Intake</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            New students who registered with A-Star, by the session they joined in.
          </p>
        </div>
        <button
          onClick={() => downloadCsv(filtered, session, currentSession)}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1120] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={15} />
          Export CSV{filtered.length > 0 && ` (${filtered.length})`}
        </button>
      </div>

      {/* Session switcher */}
      <div className="flex flex-wrap gap-2 mb-5">
        {INTAKE_SESSIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setSession(s); setQuery(""); setBirthdaysOnly(false); }}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
              session === s
                ? "bg-[#0B1120] text-white border-[#0B1120]"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {s}{s === currentSession && <span className="ml-1.5 text-xs opacity-60">current</span>}
          </button>
        ))}
      </div>

      {fetchError && (
        <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
          {fetchError === "Forbidden"
            ? "Your account doesn't have access to this page. It's restricted to super admins and org admins."
            : fetchError}
        </div>
      )}

      {/* Stats */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
          <p className="text-xl font-bold text-[#0B1120]">{regs.length}</p>
          <p className="text-xs text-gray-500">Registered in {session}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
          <p className="text-xl font-bold text-[#0B1120]">{courses}</p>
          <p className="text-xs text-gray-500">Courses of study</p>
        </div>
        <button
          onClick={() => setBirthdaysOnly((b) => !b)}
          aria-pressed={birthdaysOnly}
          className={`text-left rounded-xl border px-5 py-4 transition-colors ${
            birthdaysOnly ? "bg-red-50 border-[#D93025]" : "bg-white border-gray-100 hover:border-gray-300"
          }`}
        >
          <p className="text-xl font-bold text-[#0B1120] flex items-center gap-2">
            <Cake size={18} className="text-[#D93025]" /> {birthdaysThisMonth.length}
          </p>
          <p className="text-xs text-gray-500">
            {birthdaysOnly ? "Showing " : ""}Birthdays in {MONTHS[thisMonth - 1]}
          </p>
        </button>
      </div>

      <div className="relative flex-1 max-w-sm mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search name, email, course or handle..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-[#0B1120] bg-white text-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading registrations...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Users className="mx-auto text-gray-300 mb-2" size={28} />
          <p className="text-gray-400 text-sm">
            {regs.length === 0
              ? `No registrations for ${session} yet.`
              : birthdaysOnly && !query
                ? `No birthdays in ${MONTHS[thisMonth - 1]}.`
                : "Nothing matches your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const nowLevel = levelInSession(r.entry_level, r.session, currentSession);
            return (
              <div key={r.id} className="bg-white p-5 rounded-2xl border border-gray-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-[#0B1120] text-sm">{r.full_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{r.course_of_study}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                      Joined {r.entry_level}L
                    </span>
                    {nowLevel !== r.entry_level && (
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                        Now {nowLevel}L
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      r.birth_month === thisMonth ? "bg-red-50 text-[#D93025]" : "bg-gray-50 text-gray-500"
                    }`}>
                      <Cake size={11} /> {birthday(r)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-500">
                  <a href={`mailto:${r.email}`} className="hover:text-[#D93025] truncate">{r.email}</a>
                  <span>
                    <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="hover:text-[#D93025]">{r.phone}</a>
                    <span className="text-gray-300 mx-1.5">·</span>
                    <a href={waLink(r.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:text-[#D93025]">
                      WhatsApp {r.whatsapp}
                    </a>
                  </span>
                  {(r.instagram || r.tiktok) && (
                    <span className="flex gap-3">
                      {r.instagram && (
                        <a href={`https://instagram.com/${encodeURIComponent(r.instagram)}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#D93025]">
                          IG @{r.instagram}
                        </a>
                      )}
                      {r.tiktok && (
                        <a href={`https://tiktok.com/@${encodeURIComponent(r.tiktok)}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#D93025]">
                          TT @{r.tiktok}
                        </a>
                      )}
                    </span>
                  )}
                  <span>
                    <span className="text-gray-400">Parent:</span> {r.parent_name} ·{" "}
                    <a href={`tel:${r.parent_phone.replace(/[^\d+]/g, "")}`} className="hover:text-[#D93025]">{r.parent_phone}</a>
                    {r.parent_email && (
                      <> · <a href={`mailto:${r.parent_email}`} className="hover:text-[#D93025]">{r.parent_email}</a></>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
