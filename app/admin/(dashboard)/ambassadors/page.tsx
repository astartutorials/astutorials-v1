'use client';

import { useState, useEffect, useMemo } from "react";
import { Search, Loader2, Megaphone, Check, X, Copy } from "lucide-react";
import { useAdminUser } from "@/lib/admin-context";
import { can } from "@/lib/rbac";
import type { AmbassadorStatus } from "@/lib/ambassador";

type Application = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  course_of_study: string;
  level: string;
  social_handle: string | null;
  motivation: string;
  heard_via: string | null;
  status: AmbassadorStatus;
  referral_code: string | null;
  reviewed_at: string | null;
  created_at: string;
};

const STATUS_STYLES: Record<AmbassadorStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-gray-100 text-gray-500",
};

function waLink(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "").replace(/^0/, "234")}`;
}

/** Ambassador applications (/ambassador): review them and assign referral codes. */
export default function AdminAmbassadorsPage() {
  const { role } = useAdminUser();
  const canManage = !!role && can(role, "ambassadors:manage");

  const [rows, setRows] = useState<Application[] | null>(null);
  const [fetchError, setFetchError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AmbassadorStatus | "all">("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/ambassadors")
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
        setFetchError("Failed to load applications. Please refresh the page.");
        setRows([]);
      });
  }, []);

  const all = useMemo(() => rows ?? [], [rows]);

  const filtered = useMemo(() => {
    const source = statusFilter === "all" ? all : all.filter((r) => r.status === statusFilter);
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter((r) =>
      [r.full_name, r.email, r.phone, r.course_of_study, r.referral_code]
        .some((f) => (f ?? "").toLowerCase().includes(q))
    );
  }, [all, statusFilter, query]);

  const filters: { id: AmbassadorStatus | "all"; label: string }[] = [
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Ambassadors" },
    { id: "rejected", label: "Rejected" },
    { id: "all", label: "All" },
  ];
  const countFor = (id: AmbassadorStatus | "all") =>
    id === "all" ? all.length : all.filter((r) => r.status === id).length;

  async function review(app: Application, action: "approve" | "reject") {
    if (action === "reject" && !confirm(`Reject ${app.full_name}'s application?`)) return;
    setActionError("");
    setBusyId(app.id);
    try {
      const res = await fetch(`/api/admin/ambassadors/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Something went wrong.");
        return;
      }
      setRows((prev) =>
        (prev ?? []).map((r) =>
          r.id === app.id
            ? { ...r, status: data.status, referral_code: data.referralCode ?? null, reviewed_at: new Date().toISOString() }
            : r
        )
      );
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function copyCode(code: string) {
    await navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1120]">Ambassadors</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Applications from astartutorials.com/ambassador. Approving one assigns a referral code and emails it.
        </p>
      </div>

      {fetchError && (
        <div className="mb-5 bg-red-50 border border-red-100 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
          {fetchError === "Forbidden"
            ? "Your account doesn't have access to this page. It's restricted to super admins and org admins."
            : fetchError}
        </div>
      )}
      {actionError && (
        <div className="mb-5 bg-red-50 border border-red-100 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
          {actionError}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            aria-pressed={statusFilter === f.id}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
              statusFilter === f.id
                ? "bg-[#0B1120] text-white border-[#0B1120]"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {f.label} <span className="ml-1 text-xs opacity-60">{countFor(f.id)}</span>
          </button>
        ))}
      </div>

      <div className="relative flex-1 max-w-sm mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search name, email, phone, course or code..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-[#0B1120] bg-white text-sm"
        />
      </div>

      {rows === null ? (
        <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading applications...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Megaphone className="mx-auto text-gray-300 mb-2" size={28} />
          <p className="text-gray-400 text-sm">
            {all.length === 0 ? "No applications yet." : "Nothing here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white p-5 rounded-2xl border border-gray-100">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-[#0B1120] text-sm">{r.full_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.course_of_study} · {r.level}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[r.status]}`}>
                    {r.status}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-gray-500">
                <a href={waLink(r.phone)} target="_blank" rel="noopener noreferrer" className="hover:text-[#D93025]">
                  <span className="text-gray-400">WhatsApp:</span> {r.phone}
                </a>
                <a href={`mailto:${r.email}`} className="hover:text-[#D93025]">{r.email}</a>
                {r.social_handle && <span><span className="text-gray-400">Socials:</span> {r.social_handle}</span>}
                {r.heard_via && <span><span className="text-gray-400">Heard via:</span> {r.heard_via}</span>}
              </div>

              <p className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 whitespace-pre-line">
                <span className="text-gray-400">How they&apos;d spread the word:</span> {r.motivation}
              </p>

              {(r.referral_code || (canManage && r.status !== "approved")) && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {r.referral_code && (
                    <button
                      onClick={() => copyCode(r.referral_code!)}
                      className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#D93025] px-3 py-1.5 font-mono text-sm font-bold text-[#0B1120] hover:bg-red-50"
                      title="Copy code"
                    >
                      {r.referral_code}
                      {copied === r.referral_code ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-400" />}
                    </button>
                  )}
                  {canManage && r.status !== "approved" && (
                    <>
                      <button
                        onClick={() => review(r, "approve")}
                        disabled={busyId === r.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1120] px-3.5 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                      >
                        {busyId === r.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        Approve &amp; send code
                      </button>
                      {r.status === "pending" && (
                        <button
                          onClick={() => review(r, "reject")}
                          disabled={busyId === r.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-600 hover:border-gray-300 disabled:opacity-50"
                        >
                          <X size={14} /> Reject
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
