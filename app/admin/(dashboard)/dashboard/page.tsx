'use client';

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle, ArrowRight, ArrowUpRight, ArrowDownRight, Calendar, CalendarClock,
  CheckCircle2, GraduationCap, Loader2, Megaphone, MessageSquare, Users,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useAdminUser } from "@/lib/admin-context";
import { can } from "@/lib/rbac";
import { formatDueDate } from "@/lib/semester-plan";
import type { DashboardResponse, MonthFigure } from "@/app/api/admin/dashboard/route";

// ─── formatting ──────────────────────────────────────────────────────────────

const naira = (n: number) => `₦${n.toLocaleString()}`;
const nairaShort = (n: number) =>
  n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `₦${Math.round(n / 1_000)}k` : `₦${n}`;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 60) return `${Math.max(mins, 0)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function lagosNow() {
  return new Date(Date.now() + 60 * 60 * 1000);
}

function greeting() {
  const h = lagosNow().getUTCHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

// ─── revenue chart ───────────────────────────────────────────────────────────

const PERIODS = {
  "3m":  { label: "3M",  months: 3,  weekly: true  },
  "6m":  { label: "6M",  months: 6,  weekly: false },
  "1y":  { label: "1Y",  months: 12, weekly: false },
  "all": { label: "All", months: 0,  weekly: false },
} as const;
type Period = keyof typeof PERIODS;

function buildSeries(rows: DashboardResponse["revenueSeries"], period: Period) {
  const now = new Date();
  const { months, weekly } = PERIODS[period];
  const earliest = rows.length ? new Date(rows[rows.length - 1].created_at) : now;

  const buckets: { label: string; start: Date; end: Date }[] = [];
  if (weekly) {
    for (let i = 12; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i + 1) * 7);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
      buckets.push({ label: end.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), start, end });
    }
  } else {
    const count = months || Math.max(
      1,
      (now.getFullYear() - earliest.getFullYear()) * 12 + now.getMonth() - earliest.getMonth() + 1
    );
    for (let i = count - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      buckets.push({
        // The current month is part done: say so, or its dip reads as a fall.
        label: `${start.toLocaleString("en-GB", { month: "short" })} '${String(start.getFullYear()).slice(2)}${i === 0 ? " (so far)" : ""}`,
        start,
        end,
      });
    }
  }

  return buckets.map(({ label, start, end }) => ({
    label,
    revenue: rows
      .filter((r) => { const at = new Date(r.created_at); return at >= start && at < end; })
      .reduce((s, r) => s + r.amount_paid, 0),
  }));
}

function RevenueChart({ rows }: { rows: DashboardResponse["revenueSeries"] }) {
  const [period, setPeriod] = useState<Period>("6m");
  const series = useMemo(() => buildSeries(rows, period), [rows, period]);
  const total = series.reduce((s, p) => s + p.revenue, 0);

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="font-bold text-[#0B1120]">Revenue</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            All tutorials, plans and programmes · <span className="font-semibold text-gray-600">{naira(total)}</span> in this view
          </p>
        </div>
        <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
          {(Object.keys(PERIODS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                period === p ? "bg-white shadow-sm text-[#0B1120]" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {PERIODS[p].label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D93025" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#D93025" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tickFormatter={nairaShort} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={52} />
          <Tooltip
            formatter={(v) => [naira(Number(v ?? 0)), "Revenue"]}
            contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12 }}
            labelStyle={{ fontWeight: 700, color: "#0B1120" }}
          />
          <Area type="monotone" dataKey="revenue" stroke="#D93025" strokeWidth={2.5} fill="url(#revFill)"
            activeDot={{ r: 5, strokeWidth: 0, fill: "#D93025" }} />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}

// ─── needs attention ─────────────────────────────────────────────────────────

type AttentionItem = {
  key: string;
  text: string;
  href: string;
  icon: typeof Users;
  urgent?: boolean;
};

function attentionItems(a: DashboardResponse["attention"]): AttentionItem[] {
  const items: (AttentionItem | null)[] = [
    a.instalmentsOverdue
      ? { key: "overdue", text: `${plural(a.instalmentsOverdue, "second instalment")} overdue`,
          href: "/admin/semester-plan/payments", icon: AlertCircle, urgent: true }
      : null,
    a.instalmentsDueSoon?.count
      ? { key: "due", href: "/admin/semester-plan/payments", icon: CalendarClock,
          text: `${plural(a.instalmentsDueSoon.count, "second instalment")} due${
            a.instalmentsDueSoon.nextDue ? ` from ${formatDueDate(a.instalmentsDueSoon.nextDue)}` : " this week"}` }
      : null,
    a.enquiriesThisWeek
      ? { key: "enquiries", text: `${plural(a.enquiriesThisWeek, "Semester Plan enquiry", "Semester Plan enquiries")} this week`,
          href: "/admin/semester-plan", icon: MessageSquare }
      : null,
    a.applicationsNew
      ? { key: "applications", text: `${plural(a.applicationsNew, "new tutor application")} to review`,
          href: "/admin/applications", icon: Users }
      : null,
    a.ambassadorsPending
      ? { key: "ambassadors", text: `${plural(a.ambassadorsPending, "ambassador application")} to review`,
          href: "/admin/ambassadors", icon: Megaphone }
      : null,
    a.sessionsThisWeek
      ? { key: "sessions", text: `${plural(a.sessionsThisWeek, "session")} in the next 7 days`,
          href: "/admin/tutorials", icon: Calendar }
      : null,
  ];
  return items.filter((i): i is AttentionItem => i !== null);
}

function NeedsAttention({ attention }: { attention: DashboardResponse["attention"] }) {
  const items = attentionItems(attention);
  return (
    <section>
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Needs attention</h2>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {items.length === 0 ? (
          <div className="px-5 py-5 flex items-center gap-3 text-sm text-gray-500">
            <CheckCircle2 size={18} className="text-emerald-500" />
            Nothing needs you right now.
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {items.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="group flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition-colors">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.urgent ? "bg-red-50 text-[#D93025]" : "bg-gray-50 text-gray-500"
                  }`}>
                    <item.icon size={16} />
                  </span>
                  <span className={`text-sm flex-1 ${item.urgent ? "font-semibold text-[#D93025]" : "text-[#0B1120]"}`}>
                    {item.text}
                  </span>
                  <ArrowRight size={15} className="text-gray-300 group-hover:text-[#0B1120] group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

// ─── this month ──────────────────────────────────────────────────────────────

function Delta({ figure }: { figure: MonthFigure }) {
  const { current, previous } = figure;
  if (previous === 0 && current === 0) return <span className="text-gray-400">No change</span>;
  if (previous === 0) return <span className="text-gray-400">None last month</span>;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return <span className="text-gray-400">Same as last month</span>;
  const up = pct > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 ${up ? "text-emerald-600" : "text-gray-500"}`}>
      <Icon size={13} />
      {Math.abs(pct)}% vs last month
    </span>
  );
}

function Stat({ label, value, foot }: { label: string; value: string; foot: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-[#0B1120] mt-1 tabular-nums">{value}</p>
      <p className="text-[11px] mt-1">{foot}</p>
    </div>
  );
}

function ThisMonth({ month }: { month: DashboardResponse["month"] }) {
  const monthName = lagosNow().toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
  const stats = [
    month.revenue && { label: "Revenue", value: naira(month.revenue.current), foot: <Delta figure={month.revenue} /> },
    { label: "Paying students", value: String(month.students.current), foot: <Delta figure={month.students} /> },
    month.plansSold && { label: "Semester Plans sold", value: String(month.plansSold.current), foot: <Delta figure={month.plansSold} /> },
    month.registrations && { label: "Registered students", value: String(month.registrations.current), foot: <Delta figure={month.registrations} /> },
    month.rating && {
      label: "Average rating",
      value: month.rating.average ? month.rating.average.toFixed(1) : "—",
      foot: <span className="text-gray-400">{plural(month.rating.count, "review")}</span>,
    },
  ].filter(Boolean) as { label: string; value: string; foot: React.ReactNode }[];

  const cols = stats.length >= 5 ? "lg:grid-cols-5" : stats.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <section>
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">This month · {monthName}</h2>
      <div className={`grid grid-cols-2 ${cols} gap-3`}>
        {stats.map((s) => <Stat key={s.label} {...s} />)}
      </div>
    </section>
  );
}

// ─── lists ───────────────────────────────────────────────────────────────────

function Panel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-bold text-[#0B1120] text-sm">{title}</h2>
        <Link href={href} className="text-xs font-semibold text-[#D93025] hover:underline">View all →</Link>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-10 text-center text-sm text-gray-400">{children}</div>;
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { name, role, loading: roleLoading } = useAdminUser();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setData(d); })
      .finally(() => setLoading(false));
  }, []);

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-gray-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading dashboard...</span>
      </div>
    );
  }
  if (!data) return null;

  const showMoney = role ? can(role, "payments:read") : false;
  const canSchedule = role ? can(role, "tutorials:create") : false;
  const firstName = name && name !== "Admin" ? name.split(" ")[0] : null;
  const today = lagosNow().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

  return (
    <div className="space-y-7 max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1120]">{greeting()}{firstName ? `, ${firstName}` : ""}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{today}</p>
        </div>
        {canSchedule && (
          <Link href="/admin/create-tutorial"
            className="inline-flex items-center gap-1.5 bg-[#D93025] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#c0281f] transition-colors">
            <GraduationCap size={16} /> Schedule tutorial
          </Link>
        )}
      </header>

      <NeedsAttention attention={data.attention} />
      <ThisMonth month={data.month} />
      {showMoney && <RevenueChart rows={data.revenueSeries} />}

      <div className={showMoney ? "grid grid-cols-1 lg:grid-cols-2 gap-5" : ""}>
        <Panel title="Upcoming sessions" href="/admin/tutorials">
          {data.upcoming.length ? (
            <ul className="divide-y divide-gray-50">
              {data.upcoming.map((t) => (
                <li key={t.id}>
                  <Link href={`/admin/tutorials/${t.id}`} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/60 transition-colors">
                    <div className="w-11 text-center flex-shrink-0">
                      <p className="text-[10px] font-semibold uppercase text-[#D93025]">
                        {new Date(t.date).toLocaleDateString("en-GB", { month: "short" })}
                      </p>
                      <p className="text-lg font-bold text-[#0B1120] leading-none">{new Date(t.date).getDate()}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0B1120] text-sm truncate">{t.code} · {t.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {t.time}{role === "super_admin" && t.organisations?.name ? ` · ${t.organisations.name}` : ""}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>
              No upcoming sessions.
              {canSchedule && (
                <Link href="/admin/create-tutorial" className="block text-xs font-semibold text-[#D93025] hover:underline mt-1">Schedule one →</Link>
              )}
            </Empty>
          )}
        </Panel>

        {showMoney && (
          <Panel title="Recent payments" href="/admin/payments">
            {data.recentPayments.length ? (
              <ul className="divide-y divide-gray-50">
                {data.recentPayments.map((p) => (
                  <li key={p.id} className="px-5 py-3.5 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0B1120] text-sm truncate">{p.full_name}</p>
                      <p className="text-xs text-gray-400 truncate">{p.title}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[#0B1120] tabular-nums">{naira(p.amount_paid)}</p>
                      <p className="text-[10px] text-gray-400">{timeAgo(p.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No payments yet.</Empty>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
}
