'use client';

import { useState, useEffect } from "react";
import { Search, Star, MessageCircle, Loader2 } from "lucide-react";

type Feedback = {
  id: string;
  full_name: string | null;
  email: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  tutorials: { title: string } | null;
};

function renderStars(rating: number) {
  return Array.from({ length: 5 }).map((_, i) => (
    <Star
      key={i}
      size={14}
      className={i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}
    />
  ));
}

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

function initials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-amber-100 text-amber-600",
  "bg-purple-100 text-purple-600",
  "bg-pink-100 text-pink-600",
];

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState<number>(0);

  useEffect(() => {
    async function load() {
      const data = await fetch("/api/admin/feedback").then((r) => r.json());
      setFeedback(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    load();
  }, []);

  const avgRating =
    feedback.length
      ? feedback.reduce((s, f) => s + f.rating, 0) / feedback.length
      : 0;

  const filtered = feedback.filter((f) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      (f.full_name ?? "").toLowerCase().includes(q) ||
      (f.tutorials?.title ?? "").toLowerCase().includes(q) ||
      (f.comment ?? "").toLowerCase().includes(q);
    const matchRating = f.rating >= minRating;
    return matchSearch && matchRating;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1120]">Feedback</h1>
        <p className="text-sm text-gray-500 mt-0.5">Student reviews for tutorials.</p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4">
          <div className="flex gap-0.5">{renderStars(Math.round(avgRating))}</div>
          <div>
            <p className="text-xl font-bold text-[#0B1120]">
              {avgRating ? avgRating.toFixed(1) : "—"}
            </p>
            <p className="text-xs text-gray-500">Avg Rating</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
          <p className="text-xl font-bold text-[#0B1120]">{feedback.length}</p>
          <p className="text-xs text-gray-500">Total Reviews</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
          <p className="text-xl font-bold text-[#0B1120]">
            {feedback.filter((f) => f.rating >= 4).length}
          </p>
          <p className="text-xs text-gray-500">4★ or above</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by student, tutorial, or comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-[#0B1120] bg-white text-sm"
          />
        </div>
        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D93025] focus:ring-2 focus:ring-red-500/10 outline-none transition-all text-[#0B1120] bg-white text-sm cursor-pointer"
        >
          <option value={0}>All Ratings</option>
          <option value={5}>5 Stars</option>
          <option value={4}>4+ Stars</option>
          <option value={3}>3+ Stars</option>
        </select>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading feedback...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">
            {feedback.length === 0
              ? "No feedback submitted yet."
              : "No feedback matches your filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item, i) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-gray-100"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${COLORS[i % COLORS.length]}`}>
                    {initials(item.full_name)}
                  </div>
                  <div>
                    <p className="font-bold text-[#0B1120] text-sm">
                      {item.full_name || "Anonymous"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.tutorials?.title ?? "General Feedback"}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-gray-400 flex-shrink-0">
                  {timeAgo(item.created_at)}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-0.5">{renderStars(item.rating)}</div>
                <span className="text-sm font-bold text-[#0B1120]">{item.rating}.0</span>
              </div>

              {item.comment && (
                <p className="text-gray-600 text-sm leading-relaxed italic mb-4">
                  "{item.comment}"
                </p>
              )}

              {item.email && (
                <div className="flex justify-end">
                  <a
                    href={`mailto:${item.email}?subject=Re: Your feedback on ${item.tutorials?.title ?? "A-Star Tutorials"}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B1120] hover:text-[#D93025] transition-colors"
                  >
                    <MessageCircle size={13} />
                    Reply to {item.full_name?.split(" ")[0] ?? "Student"}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
