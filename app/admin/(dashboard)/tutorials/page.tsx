'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, PlusCircle, Eye, Pencil, Trash2, GraduationCap, Loader2, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

type Tutorial = {
  id: string;
  code: string;
  title: string;
  teacher: string;
  date: string | null;
  time: string;
  seats_total: number;
  status: string;
  bookings: { id: string }[];
};

function statusPill(status: string) {
  if (status === "active") return "bg-emerald-50 text-emerald-700";
  if (status === "draft") return "bg-amber-50 text-amber-700";
  if (status === "completed") return "bg-gray-100 text-gray-600";
  return "bg-gray-100 text-gray-500";
}

function seatBarColor(booked: number, total: number) {
  const pct = booked / total;
  if (pct < 0.5) return "bg-emerald-500";
  if (pct < 0.8) return "bg-amber-500";
  return "bg-red-500";
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type SortDir = 'asc' | 'desc';
type TutorialSortKey = 'code' | 'teacher' | 'date' | 'booked' | 'status';

function SortIcon({ field, sortKey, sortDir }: { field: string; sortKey: string; sortDir: SortDir }) {
  if (sortKey !== field) return <ChevronsUpDown size={12} className="opacity-40" />;
  return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
}

export default function AdminTutorialsPage() {
  const router = useRouter();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<TutorialSortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function handleSort(key: TutorialSortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  useEffect(() => {
    fetchTutorials();
  }, []);

  async function fetchTutorials() {
    setLoading(true);
    const res = await fetch("/api/admin/tutorials");
    const data = await res.json();
    setTutorials(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function deleteTutorial(id: string) {
    if (!confirm("Delete this tutorial? This cannot be undone.")) return;
    setDeletingId(id);
    await fetch(`/api/admin/tutorials/${id}`, { method: "DELETE" });
    setTutorials((prev) => prev.filter((t) => t.id !== id));
    setDeletingId(null);
  }

  const filtered = tutorials.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      t.code.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.teacher.toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'booked') {
      return ((a.bookings?.length ?? 0) - (b.bookings?.length ?? 0)) * dir;
    }
    if (sortKey === 'date') {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) * dir;
    }
    const av = (a[sortKey as keyof Tutorial] as string) ?? '';
    const bv = (b[sortKey as keyof Tutorial] as string) ?? '';
    return av.localeCompare(bv) * dir;
  });

  const scheduled = tutorials.filter((t) => t.status === "active").length;
  const drafts = tutorials.filter((t) => t.status === "draft").length;
  const completed = tutorials.filter((t) => t.status === "completed").length;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1120]">Tutorials</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage sessions and track student attendance.
          </p>
        </div>
        <Link
          href="/admin/create-tutorial"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D93025] text-white font-semibold rounded-xl shadow-sm hover:bg-red-700 transition-all text-sm self-start"
        >
          <PlusCircle size={16} />
          Schedule Tutorial
        </Link>
      </div>

      {/* Stats strip */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 flex gap-1 mb-5 w-fit">
        {[
          { label: "All", value: tutorials.length, filter: "all", color: "text-[#0B1120]" },
          { label: "Active", value: scheduled, filter: "active", color: "text-emerald-600" },
          { label: "Drafts", value: drafts, filter: "draft", color: "text-amber-600" },
          { label: "Completed", value: completed, filter: "completed", color: "text-gray-500" },
        ].map((stat, i, arr) => (
          <div key={stat.filter} className="flex items-center">
            <button
              onClick={() => setStatusFilter(stat.filter)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === stat.filter
                  ? "bg-gray-100"
                  : "hover:bg-gray-50"
              }`}
            >
              <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
              <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
            </button>
            {i < arr.length - 1 && <div className="w-px h-4 bg-gray-100 mx-1" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search code, title, tutor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-[#0B1120] bg-white text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-[#0B1120] bg-white text-sm cursor-pointer"
          >
            <option value="all">All Tutorials</option>
            <option value="active">Active</option>
            <option value="draft">Drafts</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {(['code', 'teacher', 'date', 'booked', 'status'] as TutorialSortKey[]).map((key, i) => {
                const labels: Record<TutorialSortKey, string> = { code: 'Course / Title', teacher: 'Tutor', date: 'Date', booked: 'Seats', status: 'Status' };
                const spans = [3, 2, 2, 2, 1];
                return (
                  <button
                    key={key}
                    onClick={() => handleSort(key)}
                    className={`col-span-${spans[i]} flex items-center gap-1 hover:text-gray-600 transition-colors ${sortKey === key ? 'text-[#0B1120]' : ''}`}
                  >
                    {labels[key]}
                    <SortIcon field={key} sortKey={sortKey} sortDir={sortDir} />
                  </button>
                );
              })}
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading tutorials...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">
                {tutorials.length === 0
                  ? "No tutorials yet. Schedule your first one."
                  : "No tutorials match your search."}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {sorted.map((item) => {
                  const booked = item.bookings?.length ?? 0;
                  const pct = Math.round((booked / item.seats_total) * 100);
                  return (
                    <div
                      key={item.id}
                      onClick={() => router.push(`/admin/tutorials/${item.id}`)}
                      className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-gray-50/60 transition-colors cursor-pointer"
                    >
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                          <GraduationCap size={18} className="text-[#D93025]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#0B1120] text-sm leading-tight">{item.code}</p>
                          <p className="text-xs text-gray-500 truncate">{item.title}</p>
                        </div>
                      </div>

                      <div className="col-span-2 text-sm text-gray-700 font-medium">{item.teacher}</div>

                      <div className="col-span-2">
                        <p className="text-sm text-gray-800 font-medium">{formatDate(item.date)}</p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-xs text-gray-600 mb-1 font-medium">{booked}/{item.seats_total}</p>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
                          <div
                            className={`h-full rounded-full ${seatBarColor(booked, item.seats_total)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="col-span-1">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${statusPill(item.status)}`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="col-span-2 flex justify-end items-center gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(`/admin/tutorials/${item.id}`); }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View Attendance"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(`/admin/tutorials/${item.id}/edit`); }}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteTutorial(item.id); }}
                          disabled={deletingId === item.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === item.id
                            ? <Loader2 size={16} className="animate-spin" />
                            : <Trash2 size={16} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-sm text-gray-500">
          Showing <span className="font-bold text-[#0B1120]">{filtered.length}</span> of{" "}
          <span className="font-bold text-[#0B1120]">{tutorials.length}</span> tutorials
        </div>
      </div>
    </div>
  );
}
