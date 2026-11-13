'use client';

import { useState, useEffect, useMemo } from "react";
import { Search, Loader2, Wallet, Link2, Check } from "lucide-react";
import SemesterPlanTabs from "@/components/admin/SemesterPlanTabs";
import { SEMESTER_PLANS, isSemesterPlanId, balancePaymentHref, formatDueDate } from "@/lib/semester-plan";
import type { SemesterPlanPaymentRow } from "@/app/api/admin/semester-plan-payments/route";

type StatusFilter = "all" | "part_paid" | "overdue" | "paid_in_full";

const STATUS_LABEL: Record<SemesterPlanPaymentRow["status"], string> = {
  paid_in_full: "Paid in full",
  part_paid: "Part paid",
  overdue: "Overdue",
};

const STATUS_CLASS: Record<SemesterPlanPaymentRow["status"], string> = {
  paid_in_full: "bg-green-50 text-green-700",
  part_paid: "bg-amber-50 text-amber-700",
  overdue: "bg-red-50 text-[#D93025]",
};

function planLabel(plan: string | null) {
  return plan && isSemesterPlanId(plan) ? SEMESTER_PLANS[plan].name : "Semester Plan";
}

function waLink(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "").replace(/^0/, "234")}`;
}

function naira(n: number) {
  return `₦${n.toLocaleString()}`;
}

/**
 * Full Semester Plan payments: who has paid in full and who is paying in 2,
 * with the second payment's due date and a link to send them.
 */
export default function AdminSemesterPlanPaymentsPage() {
  const [rows, setRows] = useState<SemesterPlanPaymentRow[] | null>(null);
  const [fetchError, setFetchError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/semester-plan-payments")
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
        setFetchError("Failed to load payments. Please refresh the page.");
        setRows([]);
      });
  }, []);

  const all = useMemo(() => rows ?? [], [rows]);
  const counts = useMemo(
    () => ({
      part_paid: all.filter((r) => r.status === "part_paid").length,
      overdue: all.filter((r) => r.status === "overdue").length,
      paid_in_full: all.filter((r) => r.status === "paid_in_full").length,
    }),
    [all]
  );
  const outstanding = useMemo(
    () => all.filter((r) => r.status !== "paid_in_full").reduce((sum, r) => sum + (r.total - r.amountPaid), 0),
    [all]
  );

  const filtered = useMemo(() => {
    const source = filter === "all" ? all : all.filter((r) => r.status === filter);
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter((r) =>
      [r.fullName, r.email, r.phone, r.firstReference].some((f) => (f ?? "").toLowerCase().includes(q))
    );
  }, [all, filter, query]);

  const filters: { id: StatusFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: all.length },
    { id: "part_paid", label: "Part paid", count: counts.part_paid },
    { id: "overdue", label: "Overdue", count: counts.overdue },
    { id: "paid_in_full", label: "Paid in full", count: counts.paid_in_full },
  ];

  async function copyLink(balanceId: string) {
    await navigator.clipboard.writeText(`${window.location.origin}${balancePaymentHref(balanceId)}`);
    setCopied(balanceId);
    setTimeout(() => setCopied((c) => (c === balanceId ? null : c)), 2000);
  }

  return (
    <div>
      <SemesterPlanTabs />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1120]">Semester Plan Payments</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Who has paid in full and who is paying in 2.
          {outstanding > 0 && (
            <> Still to collect: <span className="font-semibold text-[#0B1120]">{naira(outstanding)}</span>.</>
          )}
        </p>
      </div>

      {fetchError && (
        <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
          {fetchError === "Forbidden" ? "Your account doesn't have access to payments." : fetchError}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
              filter === f.id
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
          placeholder="Search name, email, phone or reference..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-[#0B1120] bg-white text-sm"
        />
      </div>

      {rows === null ? (
        <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading payments...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Wallet className="mx-auto text-gray-300 mb-2" size={28} />
          <p className="text-gray-400 text-sm">
            {all.length === 0 ? "No Semester Plan payments yet." : "Nothing matches."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.key} className="bg-white p-5 rounded-2xl border border-gray-100">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-[#0B1120] text-sm">{r.fullName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {planLabel(r.plan)} · {r.option === "split" ? "Paying in 2" : "Paid at once"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_CLASS[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(r.firstPaidAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-500">
                <span>
                  <span className="text-gray-400">Paid:</span>{" "}
                  <span className="font-semibold text-[#0B1120]">{naira(r.amountPaid)}</span>
                  {r.option === "split" && <> of {naira(r.total)}</>}
                </span>
                {r.option === "split" && r.status !== "paid_in_full" && (
                  <span>
                    <span className="text-gray-400">Second payment:</span> {naira(r.total - r.amountPaid)}
                    {r.dueDate ? <> by {formatDueDate(r.dueDate)}</> : <> (no due date on record)</>}
                  </span>
                )}
                <span>
                  <a href={`mailto:${r.email}`} className="hover:text-[#D93025]">{r.email}</a>
                  {r.phone && (
                    <>
                      <span className="text-gray-300 mx-1.5">·</span>
                      <a href={waLink(r.phone)} target="_blank" rel="noopener noreferrer" className="hover:text-[#D93025]">
                        WhatsApp
                      </a>
                    </>
                  )}
                </span>
                <span className="font-mono text-[11px] text-gray-400 truncate">
                  {r.firstReference}
                  {r.secondReference && <> + {r.secondReference}</>}
                </span>
              </div>

              {r.balanceId && r.status !== "paid_in_full" && (
                <button
                  onClick={() => copyLink(r.balanceId!)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B1120] border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-300"
                >
                  {copied === r.balanceId ? <Check size={13} /> : <Link2 size={13} />}
                  {copied === r.balanceId ? "Copied" : "Copy payment link"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
