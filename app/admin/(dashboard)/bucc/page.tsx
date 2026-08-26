'use client';

import { useState, useEffect, useMemo } from "react";
import { Search, Loader2, Download, MessageCircleQuestion, AlertCircle, Users, HelpCircle } from "lucide-react";

type Registration = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  level: string | null;
  programme: string | null;
  concern: string | null;
  question: string | null;
  heard_via: string | null;
  created_at: string;
};

type Tab = 'questions' | 'concerns' | 'all';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-amber-100 text-amber-600",
  "bg-purple-100 text-purple-600",
  "bg-pink-100 text-pink-600",
];

/** RFC-4180 escaping — a comma or newline inside a free-text answer must not shift columns. */
function csvCell(value: string | null) {
  const s = value === null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(rows: Registration[]) {
  const headers = [
    "Full Name", "Email", "WhatsApp", "Level", "Programme",
    "Biggest Concern", "Question for a Senior", "Heard Via", "Registered At",
  ];
  const body = rows.map((r) =>
    [
      r.full_name, r.email, r.phone, r.level, r.programme,
      r.concern, r.question, r.heard_via, r.created_at,
    ].map(csvCell).join(",")
  );
  // BOM so Excel opens the Nigerian names and curly quotes as UTF-8.
  const blob = new Blob(["﻿" + [headers.join(","), ...body].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bucc-advantage-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const TABS: { id: Tab; label: string; icon: typeof HelpCircle }[] = [
  { id: 'questions', label: "Questions for Seniors", icon: MessageCircleQuestion },
  { id: 'concerns',  label: "Concerns",              icon: AlertCircle },
  { id: 'all',       label: "All Registrations",     icon: Users },
];

export default function AdminBuccPage() {
  const [regs, setRegs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [query, setQuery] = useState("");
  // Defaults to the questions tab: prepping "Ask the Seniors" is the reason
  // this page exists, not browsing the contact list.
  const [tab, setTab] = useState<Tab>('questions');

  useEffect(() => {
    fetch("/api/admin/bucc-registrations")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setFetchError(data.error); return; }
        setRegs(Array.isArray(data) ? data : []);
      })
      .catch(() => setFetchError("Failed to load registrations. Please refresh the page."))
      .finally(() => setLoading(false));
  }, []);

  const withQuestion = useMemo(() => regs.filter((r) => r.question?.trim()), [regs]);
  const withConcern  = useMemo(() => regs.filter((r) => r.concern?.trim()), [regs]);

  const source = tab === 'questions' ? withQuestion : tab === 'concerns' ? withConcern : regs;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter((r) =>
      [r.full_name, r.email, r.programme, r.level, r.concern, r.question]
        .some((f) => (f ?? "").toLowerCase().includes(q))
    );
  }, [source, query]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1120]">The BUCC Advantage</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Webinar registrations — Friday, 28th August 2026, 7:00 pm.
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
            ? "Your account doesn't have access to this page. It's restricted to super admins."
            : fetchError}
        </div>
      )}

      {/* Stats */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
          <p className="text-xl font-bold text-[#0B1120]">{regs.length}</p>
          <p className="text-xs text-gray-500">Registered</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
          <p className="text-xl font-bold text-[#0B1120]">{withQuestion.length}</p>
          <p className="text-xs text-gray-500">Asked a question</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
          <p className="text-xl font-bold text-[#0B1120]">{withConcern.length}</p>
          <p className="text-xs text-gray-500">Shared a concern</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const count = id === 'questions' ? withQuestion.length : id === 'concerns' ? withConcern.length : regs.length;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                tab === id
                  ? "bg-[#D93025] text-white border-[#D93025]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              <Icon size={15} />
              {label}
              <span className={tab === id ? "text-red-100" : "text-gray-400"}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-sm mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search name, email, programme or answer..."
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
          <p className="text-gray-400 text-sm">
            {regs.length === 0
              ? "No registrations yet."
              : query
                ? "Nothing matches your search."
                : tab === 'questions'
                  ? "Nobody has asked a question yet."
                  : "Nobody has shared a concern yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <div key={r.id} className="bg-white p-5 rounded-2xl border border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${COLORS[i % COLORS.length]}`}>
                    {initials(r.full_name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#0B1120] text-sm truncate">{r.full_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {[r.level, r.programme].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-gray-400 flex-shrink-0">
                  {timeAgo(r.created_at)}
                </span>
              </div>

              {/* On the focused tabs, lead with the answer that tab is about. */}
              {(tab === 'questions' || tab === 'all') && r.question && (
                <div className="mt-4 rounded-xl bg-red-50/60 border border-red-100 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#D93025]">
                    Question for a senior
                  </p>
                  <p className="mt-1 text-sm text-gray-700 leading-relaxed">{r.question}</p>
                </div>
              )}

              {(tab === 'concerns' || tab === 'all') && r.concern && (
                <div className="mt-3 rounded-xl bg-amber-50/60 border border-amber-100 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    Biggest concern
                  </p>
                  <p className="mt-1 text-sm text-gray-700 leading-relaxed">{r.concern}</p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                <a href={`mailto:${r.email}`} className="hover:text-[#D93025] transition-colors">
                  {r.email}
                </a>
                <a
                  href={`https://wa.me/${r.phone.replace(/\D/g, "").replace(/^0/, "234")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D93025] transition-colors"
                >
                  {r.phone}
                </a>
                {r.heard_via && <span className="text-gray-400">via {r.heard_via}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
