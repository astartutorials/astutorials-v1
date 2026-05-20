'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Search, Download, ChevronLeft, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Tutorial = {
  id: string;
  code: string;
  title: string;
  date: string | null;
  time: string;
  seats_total: number;
};

type Booking = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  payment_status: string;
  attended: boolean;
  created_at: string;
};

function paymentPill(status: string) {
  if (status === "paid") return "bg-emerald-50 text-emerald-700";
  if (status === "pending") return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

const COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
  "bg-teal-100 text-teal-600",
  "bg-pink-100 text-pink-600",
  "bg-indigo-100 text-indigo-600",
  "bg-amber-100 text-amber-600",
];

export default function TutorialAttendancePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const perPage = 10;

  useEffect(() => {
    async function load() {
      const [{ data: tut }, { data: bks }] = await Promise.all([
        supabase
          .from("tutorials")
          .select("id, code, title, date, time, seats_total")
          .eq("id", id)
          .single(),
        supabase
          .from("bookings")
          .select("id, full_name, email, phone, payment_status, attended, created_at")
          .eq("tutorial_id", id)
          .order("created_at", { ascending: false }),
      ]);
      setTutorial(tut);
      setBookings(bks ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  async function toggleAttendance(bookingId: string, current: boolean) {
    setTogglingId(bookingId);
    await supabase
      .from("bookings")
      .update({ attended: !current })
      .eq("id", bookingId);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, attended: !current } : b))
    );
    setTogglingId(null);
  }

  const filtered = bookings.filter(
    (b) =>
      b.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.phone ?? "").includes(searchQuery)
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (currentPage - 1) * perPage;
  const current = filtered.slice(start, start + perPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-gray-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="py-24 text-center">
        <p className="text-gray-500 text-sm">Tutorial not found.</p>
        <button onClick={() => router.push("/admin/tutorials")} className="text-xs text-[#D93025] font-semibold mt-2 hover:underline">
          ← Back to Tutorials
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <button
          onClick={() => router.push("/admin/tutorials")}
          className="inline-flex items-center gap-1 hover:text-[#0B1120] transition-colors font-medium"
        >
          <ChevronLeft size={15} />
          Tutorials
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-[#0B1120] font-medium">Attendance</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 bg-[#0B1120] text-white text-xs font-bold rounded-lg tracking-wide">
            {tutorial.code}
          </span>
          <h1 className="text-xl font-bold text-[#0B1120]">{tutorial.title}</h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
            <Clock size={12} />
            {formatDate(tutorial.date)} · {tutorial.time}
          </span>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
            {bookings.length}/{tutorial.seats_total} booked
          </span>
        </div>

        <button
          onClick={() => {
            const csv = [
              ["Name", "Email", "Phone", "Payment", "Attended"].join(","),
              ...bookings.map((b) =>
                [b.full_name, b.email, b.phone ?? "", b.payment_status, b.attended ? "Yes" : "No"].join(",")
              ),
            ].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${tutorial.code}-attendance.csv`;
            a.click();
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D93025] text-white font-semibold rounded-xl shadow-sm hover:bg-red-700 transition-all text-sm self-start"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-bold text-[#0B1120]">Student Attendance</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-[#0B1120] bg-white text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-3">Student</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Phone</div>
              <div className="col-span-2">Payment</div>
              <div className="col-span-2 text-right">Attended</div>
            </div>

            {current.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">
                {bookings.length === 0 ? "No students booked yet." : "No students match your search."}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {current.map((b, i) => (
                  <div
                    key={b.id}
                    className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="col-span-3 flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${COLORS[i % COLORS.length]}`}>
                        {initials(b.full_name)}
                      </div>
                      <span className="font-medium text-[#0B1120] text-sm truncate">{b.full_name}</span>
                    </div>
                    <div className="col-span-3 text-sm text-gray-500 truncate">{b.email}</div>
                    <div className="col-span-2 text-sm text-gray-600">{b.phone ?? "—"}</div>
                    <div className="col-span-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${paymentPill(b.payment_status)}`}>
                        {b.payment_status}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => toggleAttendance(b.id, b.attended)}
                        disabled={togglingId === b.id}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${b.attended ? "bg-emerald-500" : "bg-gray-200"}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${b.attended ? "translate-x-4" : "translate-x-1"}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500">
          <span>
            Showing <span className="font-bold text-[#0B1120]">{start + 1}</span> to{" "}
            <span className="font-bold text-[#0B1120]">{Math.min(start + perPage, filtered.length)}</span> of{" "}
            <span className="font-bold text-[#0B1120]">{filtered.length}</span> students
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
