'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign, Users, GraduationCap, Star, Calendar,
  MessageSquare, Building2, TrendingUp, Loader2,
} from "lucide-react";
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

type OrgStat = {
  orgId: string;
  orgName: string;
  type: string;
  revenue: number;
  students: number;
  tutorials: number;
  activeTutorials: number;
  bookings: number;
};

type DashboardData = {
  totals: {
    revenue: number;
    students: number;
    activeTutorials: number;
    avgRating: number | null;
    orgCount: number;
  };
  byOrg: OrgStat[];
  revenueOverTime: Record<string, number | string>[];
  orgNames: string[];
  upcoming: any[];
  recentFeedback: any[];
};

function fmt(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${n.toLocaleString()}`;
}

function fmtFull(n: number) {
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

function DonutChart({
  data, formatter, centerLabel,
}: {
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
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={95}
            paddingAngle={2}
            dataKey="value"
            onMouseEnter={(_, idx) => setActive(idx)}
            onMouseLeave={() => setActive(null)}
            strokeWidth={0}
          >
            {data.map((_, idx) => (
              <Cell
                key={idx}
                fill={ORG_COLORS[idx % ORG_COLORS.length]}
                opacity={active === null || active === idx ? 1 : 0.4}
                style={{ cursor: 'pointer', outline: 'none' }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip formatter={formatter} />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-lg font-bold text-[#0B1120] leading-tight">
          {formatter ? formatter(displayValue) : displayValue}
        </p>
        {displayLabel && (
          <p className="text-[10px] text-gray-400 mt-0.5 max-w-[80px] text-center leading-tight">{displayLabel}</p>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-gray-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading dashboard...</span>
      </div>
    );
  }

  if (!data) return null;

  const { totals, byOrg, revenueOverTime, orgNames, upcoming, recentFeedback } = data;

  const revenueChartData = byOrg.map(o => ({ name: o.orgName, value: o.revenue }));
  const studentsChartData = byOrg.map(o => ({ name: o.orgName, value: o.students }));
  const totalRevenue = byOrg.reduce((s, o) => s + o.revenue, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1120]">Platform Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Live metrics across all organisations.</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Revenue',    value: fmt(totals.revenue),             icon: DollarSign,   bg: 'bg-red-50',     color: 'text-[#D93025]' },
          { label: 'Students Served',  value: String(totals.students),         icon: Users,        bg: 'bg-blue-50',    color: 'text-blue-600' },
          { label: 'Active Tutorials', value: String(totals.activeTutorials),  icon: GraduationCap,bg: 'bg-purple-50',  color: 'text-purple-600' },
          { label: 'Avg Rating',       value: totals.avgRating ? totals.avgRating.toFixed(1) : '—', icon: Star, bg: 'bg-amber-50', color: 'text-amber-500' },
          { label: 'Organisations',    value: String(totals.orgCount),         icon: Building2,    bg: 'bg-emerald-50', color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${s.bg}`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-[#0B1120]">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue donut */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-[#D93025]" />
            <h2 className="font-bold text-[#0B1120]">Revenue by Organisation</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">Total: {fmtFull(totals.revenue)}</p>

          {revenueChartData.every(d => d.value === 0) ? (
            <div className="flex items-center justify-center h-[220px] text-sm text-gray-400">No revenue data yet.</div>
          ) : (
            <DonutChart
              data={revenueChartData}
              formatter={v => fmt(v)}
              centerLabel="Total revenue"
            />
          )}

          {/* Legend */}
          <div className="mt-3 space-y-2">
            {byOrg.map((o, idx) => (
              <div key={o.orgId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ORG_COLORS[idx % ORG_COLORS.length] }} />
                  <span className="text-gray-700 font-medium truncate max-w-[160px]">{o.orgName}</span>
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full">{TYPE_LABELS[o.type] ?? o.type}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-bold text-[#0B1120]">{fmt(o.revenue)}</span>
                  {totalRevenue > 0 && (
                    <span className="text-xs text-gray-400 w-8 text-right">
                      {Math.round((o.revenue / totalRevenue) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Students donut */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-blue-600" />
            <h2 className="font-bold text-[#0B1120]">Students by Organisation</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">Total: {totals.students} unique students</p>

          {studentsChartData.every(d => d.value === 0) ? (
            <div className="flex items-center justify-center h-[220px] text-sm text-gray-400">No student data yet.</div>
          ) : (
            <DonutChart
              data={studentsChartData}
              formatter={v => `${v} students`}
              centerLabel="Total students"
            />
          )}

          {/* Org breakdown table */}
          <div className="mt-3 space-y-2">
            {byOrg.map((o, idx) => (
              <div key={o.orgId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ORG_COLORS[idx % ORG_COLORS.length] }} />
                  <span className="text-gray-700 font-medium truncate max-w-[160px]">{o.orgName}</span>
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

      {/* Revenue over time */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={16} className="text-[#D93025]" />
          <h2 className="font-bold text-[#0B1120]">Revenue Over Time</h2>
        </div>
        <p className="text-xs text-gray-400 mb-5">Monthly revenue — last 12 months</p>

        {/* Org colour legend */}
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
          <LineChart data={revenueOverTime} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => v >= 1000 ? `₦${(v / 1000).toFixed(0)}k` : `₦${v}`}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip
              formatter={(value, name) => [fmtFull(Number(value ?? 0)), String(name)]}
              contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: 12 }}
              labelStyle={{ fontWeight: 700, color: '#0B1120' }}
            />
            {orgNames.length > 1 ? (
              orgNames.map((name, idx) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={ORG_COLORS[idx % ORG_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              ))
            ) : (
              <Line
                type="monotone"
                dataKey="total"
                stroke="#D93025"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: '#D93025' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Upcoming + Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
                <div key={t.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={18} className="text-[#D93025]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0B1120] text-sm leading-tight">{t.code}</p>
                    <p className="text-xs text-gray-500 truncate">{t.title}</p>
                    {t.organisations?.name && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{t.organisations.name}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-semibold text-[#D93025] bg-red-50 px-2 py-1 rounded-full">
                      {new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1">{t.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-gray-400">No upcoming sessions.</p>
              <Link href="/admin/create-tutorial" className="text-xs font-semibold text-[#D93025] hover:underline mt-1 inline-block">Schedule one →</Link>
            </div>
          )}
        </div>

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
                    {f.tutorials?.organisations?.name && (
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
      </div>
    </div>
  );
}
