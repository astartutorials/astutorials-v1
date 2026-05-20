import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import {
  DollarSign,
  Users,
  GraduationCap,
  Star,
  Calendar,
  MessageSquare,
  Briefcase,
  Settings,
} from "lucide-react";

function fmt(n: number) {
  return `₦${n.toLocaleString()}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [
    { data: paidBookings },
    { data: allBookings },
    { count: activeTutorials },
    { data: feedbackRows },
    { data: upcoming },
    { data: recentFeedback },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("amount_paid, tutorials(price)")
      .eq("payment_status", "paid"),
    supabase.from("bookings").select("email"),
    supabase
      .from("tutorials")
      .select("*", { count: "exact", head: true })
      .neq("status", "draft"),
    supabase.from("feedback").select("rating"),
    supabase
      .from("tutorials")
      .select("id, code, title, date, time")
      .gte("date", new Date().toISOString().split("T")[0])
      .neq("status", "draft")
      .order("date", { ascending: true })
      .limit(4),
    supabase
      .from("feedback")
      .select("full_name, rating, created_at, tutorials(title)")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const revenue =
    (paidBookings as any[])?.reduce(
      (sum, b) => sum + (b.amount_paid ?? b.tutorials?.price ?? 0),
      0
    ) ?? 0;
  const uniqueStudents = new Set((allBookings ?? []).map((b) => b.email)).size;
  const avgRating =
    feedbackRows?.length
      ? feedbackRows.reduce((s, f) => s + f.rating, 0) / feedbackRows.length
      : null;

  const stats = [
    {
      label: "Total Revenue",
      value: fmt(revenue),
      icon: DollarSign,
      bg: "bg-red-50",
      color: "text-[#D93025]",
    },
    {
      label: "Students Served",
      value: String(uniqueStudents),
      icon: Users,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      label: "Active Tutorials",
      value: String(activeTutorials ?? 0),
      icon: GraduationCap,
      bg: "bg-red-50",
      color: "text-[#D93025]",
    },
    {
      label: "Avg Rating",
      value: avgRating ? avgRating.toFixed(1) : "—",
      icon: Star,
      bg: "bg-amber-50",
      color: "text-amber-500",
    },
  ];

  const quickActions = [
    {
      name: "Schedule Tutorial",
      href: "/admin/create-tutorial",
      icon: GraduationCap,
      bg: "bg-red-50",
      color: "text-[#D93025]",
    },
    {
      name: "Add Career Role",
      href: "/admin/careers",
      icon: Briefcase,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      name: "View Payments",
      href: "/admin/payments",
      icon: DollarSign,
      bg: "bg-emerald-50",
      color: "text-emerald-600",
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      bg: "bg-gray-100",
      color: "text-gray-500",
    },
  ];

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-[#0B1120]">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Here's what's happening with A-Star Tutorials.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 p-5"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${s.bg}`}
            >
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-[#0B1120]">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {quickActions.map((a) => (
          <Link
            key={a.name}
            href={a.href}
            className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all group"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${a.bg} ${a.color} mb-3 group-hover:scale-110 transition-transform`}
            >
              <a.icon size={20} />
            </div>
            <p className="font-bold text-[#0B1120] text-sm">{a.name}</p>
          </Link>
        ))}
      </div>

      {/* Lower panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming sessions */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0B1120] flex items-center gap-2">
              <Calendar size={17} className="text-[#D93025]" />
              Upcoming Sessions
            </h2>
            <Link
              href="/admin/tutorials"
              className="text-xs font-semibold text-[#D93025] hover:underline"
            >
              View All →
            </Link>
          </div>
          {upcoming && upcoming.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {(upcoming as any[]).map((t) => (
                <div
                  key={t.id}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={18} className="text-[#D93025]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0B1120] text-sm leading-tight">
                      {t.code}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{t.title}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-semibold text-[#D93025] bg-red-50 px-2 py-1 rounded-full">
                      {new Date(t.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1">{t.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-gray-400">No upcoming sessions.</p>
              <Link
                href="/admin/create-tutorial"
                className="text-xs font-semibold text-[#D93025] hover:underline mt-1 inline-block"
              >
                Schedule one →
              </Link>
            </div>
          )}
        </div>

        {/* Recent feedback */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0B1120] flex items-center gap-2">
              <MessageSquare size={17} className="text-[#D93025]" />
              Recent Feedback
            </h2>
            <Link
              href="/admin/feedback"
              className="text-xs font-semibold text-[#D93025] hover:underline"
            >
              View All →
            </Link>
          </div>
          {recentFeedback && recentFeedback.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {(recentFeedback as any[]).map((f, i) => (
                <div
                  key={i}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-600 flex-shrink-0">
                    {f.full_name ? initials(f.full_name) : "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0B1120] text-sm leading-tight">
                      {f.full_name || "Anonymous"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {f.tutorials?.title ?? "—"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          size={12}
                          className={
                            idx < f.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {timeAgo(f.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-gray-400">No feedback received yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
