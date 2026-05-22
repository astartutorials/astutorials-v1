'use client';

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  DollarSign, Users, GraduationCap, Star, Calendar,
  MessageSquare, Building2, TrendingUp, Loader2,
} from "lucide-react";
import { useAdminUser } from "@/lib/admin-context";
import { can } from "@/lib/rbac";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";

const ORG_COLORS = ['#D93025', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#14B8A6', '#6366F1'];

const TYPE_LABELS: Record<string, string> = {
  university: 'University',
  secondary: 'Secondary',
  primary: 'Primary',
};

const PERIOD_CONFIG = {
  '1w':  { getStart: () => new Date(Date.now() - 7   * 86400000), granularity: 'day'   as const, label: '1 Week' },
  '2w':  { getStart: () => new Date(Date.now() - 14  * 86400000), granularity: 'day'   as const, label: '2 Weeks' },
  '1m':  { getStart: () => new Date(Date.now() - 30  * 86400000), granularity: 'day'   as const, label: '1 Month' },
  '2m':  { getStart: () => new Date(Date.now() - 60  * 86400000), granularity: 'week'  as const, label: '2 Months' },
  '3m':  { getStart: () => new Date(Date.now() - 90  * 86400000), granularity: 'week'  as const, label: '3 Months' },
  '6m':  { getStart: () => new Date(Date.now() - 180 * 86400000), granularity: 'month' as const, label: '6 Months' },
  'ytd': { getStart: () => new Date(new Date().getFullYear(), 0, 1), granularity: 'month' as const, label: 'Year to Date' },
  '1y':  { getStart: () => new Date(Date.now() - 365 * 86400000), granularity: 'month' as const, label: '1 Year' },
  'all': { getStart: () => new Date(0), granularity: 'month' as const, label: 'All Time' },
};
type TimePeriod = keyof typeof PERIOD_CONFIG;

type OrgStat = {
  orgId: string; orgName: string; type: string;
  revenue: number; students: number; tutorials: number;
  activeTutorials: number; bookings: number;
};

type RawPaid = { created_at: string; amount_paid: number; org_id: string | null };
type RawAll  = { created_at: string; email: string; org_id: string | null };

type DashboardData = {
  totals: { revenue: number; students: number; activeTutorials: number; avgRating: number | null; orgCount: number };
  byOrg: OrgStat[];
  orgNames: string[];
  upcoming: any[];
  recentFeedback: any[];
  rawPaidBookings: RawPaid[];
  rawAllBookings: RawAll[];
};

function fmtFull(n: number) { return `₦${n.toLocaleString()}`; }
function fmt(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${n.toLocaleString()}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function buildTimeSeries(
  paid: RawPaid[],
  granularity: 'day' | 'week' | 'month',
  periodStart: Date,
  orgs: OrgStat[],
  orgNames: string[]
): Record<string, number | string>[] {
  const now = new Date();
  const totalDays = Math.max(1, Math.ceil((now.getTime() - periodStart.getTime()) / 86400000));
  const buckets: { label: string; start: Date; end: Date }[] = [];

  if (granularity === 'day') {
    for (let i = totalDays - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      buckets.push({ label: start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), start, end });
    }
  } else if (granularity === 'week') {
    const numWeeks = Math.ceil(totalDays / 7);
    for (let i = numWeeks - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i + 1) * 7);
      const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
      buckets.push({ label: start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), start, end });
    }
  } else {
    const numMonths = Math.ceil(totalDays / 30);
    for (let i = numMonths - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = `${start.toLocaleString('en-GB', { month: 'short' })} '${String(start.getFullYear()).slice(2)}`;
      buckets.push({ label, start, end });
    }
  }

  return buckets.map(({ label, start, end }) => {
    const point: Record<string, number | string> = { period: label };
    let total = 0;
    orgs.forEach(org => {
      const rev = paid
        .filter(b => b.org_id === org.orgId && new Date(b.created_at) >= start && new Date(b.created_at) < end)
        .reduce((s, b) => s + b.amount_paid, 0);
      point[org.orgName] = rev;
      total += rev;
    });
    point.total = total;
    return point;
  });
}

function CustomTooltip({ active, payload, formatter }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="font-bold text-[#0B1120]">{name}</p>
      <p className="text-gray-600">{formatter ? formatter(value) : value}</p>
    </div>
  );
}

function DonutChart({ data, formatter, centerLabel }: {
  data: { name: string; value: number }[];
  formatter?: (v: number) => string;
  centerLabel?: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const displayValue = active !== null ? data[active]?.value : total;
  const displayLabel = active !== null ? data[active]?.name : centerLabel;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data} cx="50%" cy="50%" innerRadius={68} outerRadius={95}
            paddingAngle={2} dataKey="value"
            onMouseEnter={(_, idx) => setActive(idx)}
            onMouseLeave={() => setActive(null)}
            strokeWidth={0}
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={ORG_COLORS[idx % ORG_COLORS.length]}
                opacity={active === null || active === idx ? 1 : 0.4}
                style={{ cursor: 'pointer', outline: 'none' }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip formatter={formatter} />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-base font-bold text-[#0B1120] leading-tight">
          {formatter ? formatter(displayValue) : displayValue}
        </p>
        {displayLabel && (
          <p className="text-[10px] text-gray-400 mt-0.5 max-w-[80px] text-center leading-tight">{displayLabel}</p>
        )}
      </div>
    </div>
  );
}

function PeriodSelector({ value, onChange }: { value: TimePeriod; onChange: (p: TimePeriod) => void }) {
  return (
    <div className="flex gap-0.5 bg-gray-100 rounded-xl p-1">
      {(Object.keys(PERIOD_CONFIG) as TimePeriod[]).map(p => (
        <button key={p} onClick={() => onChange(p)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            value === p ? 'bg-white shadow-sm text-[#0B1120]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {p === '1w' ? '1W' : p === '2w' ? '2W' : p === '1m' ? '1M' : p === '2m' ? '2M' : p === '3m' ? '3M' : p === '6m' ? '6M' : p === 'ytd' ? 'YTD' : p === '1y' ? '1Y' : 'All'}
        </button>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { role, loading: roleLoading } = useAdminUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>('1y');

  const isSuperAdmin = role === 'super_admin';
  const showRevenue     = role ? can(role, 'payments:read')  : false;
  const showFeedback    = role ? can(role, 'feedback:read')  : false;
  const showOrgBreakdown = isSuperAdmin;

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d); })
      .finally(() => setLoading(false));
  }, []);

  const periodData = useMemo(() => {
    if (!data) return null;
    const { rawPaidBookings, rawAllBookings, byOrg: allTimeByOrg, orgNames } = data;
    const { getStart, granularity } = PERIOD_CONFIG[period];
    const cutoff = period === 'all' && rawPaidBookings.length > 0
      ? new Date(Math.min(...rawPaidBookings.map(b => new Date(b.created_at).getTime())))
      : getStart();

    const paidIn  = rawPaidBookings.filter(b => new Date(b.created_at) >= cutoff);
    const allIn   = rawAllBookings.filter(b => new Date(b.created_at) >= cutoff);

    const filteredByOrg = allTimeByOrg.map(org => ({
      ...org,
      revenue:  paidIn.filter(b => b.org_id === org.orgId).reduce((s, b) => s + b.amount_paid, 0),
      students: new Set(allIn.filter(b => b.org_id === org.orgId).map(b => b.email)).size,
      bookings: allIn.filter(b => b.org_id === org.orgId).length,
    }));

    const periodRevenue  = paidIn.reduce((s, b) => s + b.amount_paid, 0);
    const periodStudents = new Set(allIn.map(b => b.email)).size;
    const timeSeries = buildTimeSeries(paidIn, granularity, cutoff, allTimeByOrg, orgNames);

    return { filteredByOrg, timeSeries, periodRevenue, periodStudents };
  }, [data, period]);

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-gray-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading dashboard...</span>
      </div>
    );
  }

  if (!data || !periodData) return null;

  const { totals, byOrg, orgNames, upcoming, recentFeedback } = data;
  const { filteredByOrg, timeSeries, periodRevenue, periodStudents } = periodData;

  const revenueChartData  = filteredByOrg.map(o => ({ name: o.orgName, value: o.revenue }));
  const studentsChartData = filteredByOrg.map(o => ({ name: o.orgName, value: o.students }));

  const orgName = byOrg[0]?.orgName ?? 'Dashboard';
  const pageTitle    = isSuperAdmin ? 'Platform Overview' : orgName;
  const pageSubtitle = isSuperAdmin ? 'Live metrics across all organisations.' : 'Your organisation at a glance.';

  // Build stat cards based on permissions
  const statCards = [
    showRevenue ? { label: 'Total Revenue',    value: fmtFull(totals.revenue),        icon: DollarSign,    bg: 'bg-red-50',     color: 'text-[#D93025]' } : null,
                  { label: 'Students Served',  value: String(totals.students),        icon: Users,         bg: 'bg-blue-50',    color: 'text-blue-600'  },
                  { label: 'Active Tutorials', value: String(totals.activeTutorials), icon: GraduationCap, bg: 'bg-purple-50',  color: 'text-purple-600' },
    showFeedback ? { label: 'Avg Rating', value: totals.avgRating ? totals.avgRating.toFixed(1) : '—', icon: Star, bg: 'bg-amber-50', color: 'text-amber-500' } : null,
    isSuperAdmin  ? { label: 'Organisations', value: String(totals.orgCount), icon: Building2, bg: 'bg-emerald-50', color: 'text-emerald-600' } : null,
  ].filter((c): c is NonNullable<typeof c> => c !== null);

  const statGridClass = `grid-cols-2 ${
    statCards.length >= 5 ? 'lg:grid-cols-5' :
    statCards.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
  }`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1120]">{pageTitle}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{pageSubtitle}</p>
      </div>

      {/* Stat cards */}
      <div className={`grid ${statGridClass} gap-4`}>
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${s.bg}`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-[#0B1120]">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts — only for roles with payments:read */}
      {showRevenue && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">
              Charts — <span className="text-[#0B1120]">{PERIOD_CONFIG[period].label}</span>
            </p>
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>

          {/* Org breakdown donuts — super_admin only */}
          {showOrgBreakdown && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={16} className="text-[#D93025]" />
                  <h2 className="font-bold text-[#0B1120]">Revenue by Organisation</h2>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  {PERIOD_CONFIG[period].label}: <span className="font-semibold text-gray-600">{fmtFull(periodRevenue)}</span>
                </p>
                {revenueChartData.every(d => d.value === 0) ? (
                  <div className="flex items-center justify-center h-[220px] text-sm text-gray-400">No revenue in this period.</div>
                ) : (
                  <DonutChart data={revenueChartData} formatter={v => fmt(v)} centerLabel="Revenue" />
                )}
                <div className="mt-3 space-y-2">
                  {filteredByOrg.map((o, idx) => (
                    <div key={o.orgId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ORG_COLORS[idx % ORG_COLORS.length] }} />
                        <Link href={`/admin/orgs/${o.orgId}`} className="text-gray-700 font-medium truncate max-w-[160px] hover:text-[#D93025] hover:underline transition-colors">
                          {o.orgName}
                        </Link>
                        <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full">{TYPE_LABELS[o.type] ?? o.type}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-bold text-[#0B1120]">{fmtFull(o.revenue)}</span>
                        {periodRevenue > 0 && (
                          <span className="text-xs text-gray-400 w-8 text-right">
                            {Math.round((o.revenue / periodRevenue) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Users size={16} className="text-blue-600" />
                  <h2 className="font-bold text-[#0B1120]">Students by Organisation</h2>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  {PERIOD_CONFIG[period].label}: <span className="font-semibold text-gray-600">{periodStudents} unique students</span>
                </p>
                {studentsChartData.every(d => d.value === 0) ? (
                  <div className="flex items-center justify-center h-[220px] text-sm text-gray-400">No student data in this period.</div>
                ) : (
                  <DonutChart data={studentsChartData} formatter={v => `${v} students`} centerLabel="Students" />
                )}
                <div className="mt-3 space-y-2">
                  {filteredByOrg.map((o, idx) => (
                    <div key={o.orgId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ORG_COLORS[idx % ORG_COLORS.length] }} />
                        <Link href={`/admin/orgs/${o.orgId}`} className="text-gray-700 font-medium truncate max-w-[160px] hover:text-[#D93025] hover:underline transition-colors">
                          {o.orgName}
                        </Link>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 text-xs text-gray-500">
                        <span><span className="font-bold text-[#0B1120]">{o.students}</span> students</span>
                        <span><span className="font-bold text-[#0B1120]">{o.bookings}</span> bookings</span>
                        <span><span className="font-bold text-[#0B1120]">{o.activeTutorials}</span> sessions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Revenue over time */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-[#D93025]" />
              <h2 className="font-bold text-[#0B1120]">Revenue Over Time</h2>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              {PERIOD_CONFIG[period].label} — {PERIOD_CONFIG[period].granularity === 'day' ? 'daily' : PERIOD_CONFIG[period].granularity === 'week' ? 'weekly' : 'monthly'} breakdown
            </p>
            {orgNames.length > 1 && (
              <div className="flex flex-wrap gap-4 mb-4">
                {orgNames.map((name, idx) => (
                  <div key={name} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: ORG_COLORS[idx % ORG_COLORS.length] }} />
                    {name}
                  </div>
                ))}
              </div>
            )}
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={timeSeries} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis
                  tickFormatter={v => v >= 1000 ? `₦${(v / 1000).toFixed(0)}k` : `₦${v}`}
                  tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={52}
                />
                <Tooltip
                  formatter={(value, name) => [fmtFull(Number(value ?? 0)), String(name)]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: 12 }}
                  labelStyle={{ fontWeight: 700, color: '#0B1120' }}
                />
                {orgNames.length > 1 ? (
                  orgNames.map((name, idx) => (
                    <Line key={name} type="monotone" dataKey={name}
                      stroke={ORG_COLORS[idx % ORG_COLORS.length]}
                      strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  ))
                ) : (
                  <Line type="monotone" dataKey="total" stroke="#D93025"
                    strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: '#D93025' }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Upcoming + Feedback */}
      <div className={showFeedback ? 'grid grid-cols-1 lg:grid-cols-2 gap-5' : ''}>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0B1120] flex items-center gap-2">
              <Calendar size={16} className="text-[#D93025]" />
              Upcoming Sessions
            </h2>
            <Link href="/admin/tutorials" className="text-xs font-semibold text-[#D93025] hover:underline">View All →</Link>
          </div>
          {upcoming.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {upcoming.map((t: any) => (
                <Link key={t.id} href={`/admin/tutorials/${t.id}`}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/60 transition-colors block"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={18} className="text-[#D93025]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0B1120] text-sm leading-tight">{t.code}</p>
                    <p className="text-xs text-gray-500 truncate">{t.title}</p>
                    {isSuperAdmin && t.organisations?.name && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{t.organisations.name}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-semibold text-[#D93025] bg-red-50 px-2 py-1 rounded-full">
                      {new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1">{t.time}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-gray-400">No upcoming sessions.</p>
              {role && can(role, 'tutorials:create') && (
                <Link href="/admin/create-tutorial" className="text-xs font-semibold text-[#D93025] hover:underline mt-1 inline-block">Schedule one →</Link>
              )}
            </div>
          )}
        </div>

        {showFeedback && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0B1120] flex items-center gap-2">
                <MessageSquare size={16} className="text-[#D93025]" />
                Recent Feedback
              </h2>
              <Link href="/admin/feedback" className="text-xs font-semibold text-[#D93025] hover:underline">View All →</Link>
            </div>
            {recentFeedback.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {recentFeedback.map((f: any, i: number) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-600 flex-shrink-0">
                      {f.full_name ? initials(f.full_name) : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0B1120] text-sm leading-tight">{f.full_name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500 truncate">{f.tutorials?.title ?? '—'}</p>
                      {isSuperAdmin && f.tutorials?.organisations?.name && (
                        <p className="text-[10px] text-gray-400 mt-0.5">{f.tutorials.organisations.name}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} size={12} className={idx < f.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400">{timeAgo(f.created_at)}</span>
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
        )}
      </div>
    </div>
  );
}
