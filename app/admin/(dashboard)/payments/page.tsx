'use client';

import { useState, useEffect } from "react";
import { Search, Download, TrendingUp, Clock, XCircle, CheckCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";

type Booking = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  course: string | null;
  notes: string | null;
  amount_paid: number | null;
  payment_status: string;
  payment_reference: string | null;
  created_at: string;
  tutorials: { title: string; price: number } | null;
};

function statusPill(status: string) {
  if (status === "paid") return "bg-emerald-50 text-emerald-700";
  if (status === "pending") return "bg-amber-50 text-amber-700";
  if (status === "failed") return "bg-red-50 text-red-700";
  return "bg-gray-100 text-gray-600";
}

function fmt(n: number) {
  return `₦${n.toLocaleString()}`;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

const COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-amber-100 text-amber-600",
  "bg-purple-100 text-purple-600",
  "bg-pink-100 text-pink-600",
  "bg-teal-100 text-teal-600",
];

export default function AdminPaymentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "failed">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/bookings")
      .then((r) => r.json())
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const totalRevenue = bookings
    .filter((b) => b.payment_status === "paid")
    .reduce((s, b) => s + (b.amount_paid ?? b.tutorials?.price ?? 0), 0);
  const pending = bookings.filter((b) => b.payment_status === "pending").length;
  const completed = bookings.filter((b) => b.payment_status === "paid").length;
  const failed = bookings.filter((b) => b.payment_status === "failed").length;

  const filtered = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      b.full_name.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      (b.phone ?? "").toLowerCase().includes(q) ||
      (b.tutorials?.title ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || b.payment_status === statusFilter;
    return matchSearch && matchStatus;
  });

  function exportCSV() {
    const csv = [
      ["Name", "Email", "Phone", "Tutorial", "Amount", "Notes", "Status", "Reference", "Date"].join(","),
      ...filtered.map((b) =>
        [
          `"${b.full_name}"`,
          b.email,
          b.phone ?? "",
          `"${b.tutorials?.title ?? ""}"`,
          b.amount_paid ?? b.tutorials?.price ?? 0,
          `"${b.notes ?? ""}"`,
          b.payment_status,
          b.payment_reference ?? "",
          formatDate(b.created_at),
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments.csv";
    a.click();
  }

  const statCards = [
    { label: "Total Revenue", value: fmt(totalRevenue), icon: TrendingUp, bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Pending", value: String(pending), icon: Clock, bg: "bg-amber-50", color: "text-amber-600" },
    { label: "Completed", value: String(completed), icon: CheckCircle, bg: "bg-blue-50", color: "text-blue-600" },
    { label: "Failed", value: String(failed), icon: XCircle, bg: "bg-red-50", color: "text-red-600" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1120]">Payments</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track tutorial payments and transactions.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.bg}`}>
              <c.icon size={20} className={c.color} />
            </div>
            <p className="text-2xl font-bold text-[#0B1120] mb-0.5">{c.value}</p>
            <p className="text-xs text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search name, email, phone, tutorial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-[#0B1120] bg-white text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-[#0B1120] bg-white text-sm cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
        >
          <Download size={15} />
          Export
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-3">Student</div>
              <div className="col-span-3">Tutorial</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1"></div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading payments...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">
                {bookings.length === 0 ? "No payments recorded yet." : "No payments match your search."}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map((b, i) => (
                  <div key={b.id}>
                    <div
                      className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-gray-50/60 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                    >
                      <div className="col-span-3 flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${COLORS[i % COLORS.length]}`}>
                          {initials(b.full_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#0B1120] text-sm truncate">{b.full_name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{b.email}</p>
                          {b.phone && <p className="text-[10px] text-gray-400 truncate">{b.phone}</p>}
                        </div>
                      </div>

                      <div className="col-span-3 text-sm text-gray-600 truncate">
                        {b.tutorials?.title ?? <span className="italic text-gray-400">Private Session</span>}
                      </div>

                      <div className="col-span-2 font-bold text-[#0B1120] text-sm">
                        {b.amount_paid != null ? fmt(b.amount_paid) : b.tutorials?.price ? fmt(b.tutorials.price) : "—"}
                      </div>

                      <div className="col-span-2">
                        <p className="text-sm text-gray-700">{formatDate(b.created_at)}</p>
                        <p className="text-xs text-gray-400">{formatTime(b.created_at)}</p>
                      </div>

                      <div className="col-span-1">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusPill(b.payment_status)}`}>
                          {b.payment_status}
                        </span>
                      </div>

                      <div className="col-span-1 flex justify-end text-gray-400">
                        {expandedId === b.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {expandedId === b.id && (
                      <div className="px-6 pb-4 bg-gray-50/50 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                          <p className="text-gray-700">{b.phone ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Course</p>
                          <p className="text-gray-700">{b.course ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Reference</p>
                          <p className="text-gray-700 font-mono text-xs break-all">{b.payment_reference ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                          <p className="text-gray-700">{b.notes ?? "—"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-sm text-gray-500">
          Showing <span className="font-bold text-[#0B1120]">{filtered.length}</span> of{" "}
          <span className="font-bold text-[#0B1120]">{bookings.length}</span> transactions
        </div>
      </div>
    </div>
  );
}
