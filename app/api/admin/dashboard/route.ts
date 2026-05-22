import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getUserRole, can } from '@/lib/rbac';

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ctx = await getUserRole(authClient, user.id, user.user_metadata as Record<string, unknown>);
  if (!ctx || !can(ctx.role, 'tutorials:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [
    { data: orgs },
    { data: tutorials },
    { data: paidBookings },
    { data: allBookings },
    { data: feedbackRows },
    { data: upcoming },
    { data: recentFeedback },
  ] = await Promise.all([
    serviceSupabase.from('organisations').select('id, name, type, location').order('created_at'),
    serviceSupabase.from('tutorials').select('id, org_id, status'),
    serviceSupabase.from('bookings').select('id, email, amount_paid, created_at, org_id').eq('payment_status', 'paid'),
    serviceSupabase.from('bookings').select('id, email, org_id'),
    serviceSupabase.from('feedback').select('rating'),
    serviceSupabase
      .from('tutorials')
      .select('id, code, title, date, time, org_id, organisations(name)')
      .gte('date', new Date().toISOString().split('T')[0])
      .neq('status', 'draft')
      .order('date', { ascending: true })
      .limit(5),
    serviceSupabase
      .from('feedback')
      .select('full_name, rating, created_at, tutorials(title, org_id, organisations(name))')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  // Filter by org scope for non-super_admin
  const visibleOrgIds = ctx.role === 'super_admin'
    ? null
    : [ctx.orgId];

  const filteredOrgs = visibleOrgIds
    ? (orgs ?? []).filter(o => visibleOrgIds.includes(o.id))
    : (orgs ?? []);

  // Aggregate per org
  const byOrg = filteredOrgs.map(org => {
    const orgTutorials = (tutorials ?? []).filter(t => t.org_id === org.id);
    const orgPaid = (paidBookings ?? []).filter(b => b.org_id === org.id);
    const orgAll = (allBookings ?? []).filter(b => b.org_id === org.id);

    return {
      orgId: org.id,
      orgName: org.name,
      type: org.type,
      revenue: orgPaid.reduce((sum, b) => sum + (b.amount_paid ?? 0), 0),
      students: new Set(orgAll.map(b => b.email)).size,
      tutorials: orgTutorials.length,
      activeTutorials: orgTutorials.filter(t => t.status === 'active').length,
      bookings: orgAll.length,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Sum ALL paid bookings regardless of org attribution so unattributed private bookings are never lost
  const totalRevenue = ctx.role === 'super_admin'
    ? (paidBookings ?? []).reduce((s, b) => s + (b.amount_paid ?? 0), 0)
    : byOrg.reduce((s, o) => s + o.revenue, 0);
  const totalStudents = ctx.role === 'super_admin'
    ? new Set((allBookings ?? []).map(b => b.email)).size
    : byOrg.reduce((s, o) => s + o.students, 0);
  const totalActiveTutorials = byOrg.reduce((s, o) => s + o.activeTutorials, 0);
  const avgRating = (feedbackRows ?? []).length
    ? (feedbackRows ?? []).reduce((s, f) => s + f.rating, 0) / (feedbackRows ?? []).length
    : null;

  // Revenue over time — last 12 months, one data point per month, one series per org
  const now = new Date();
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.toLocaleString('en-GB', { month: 'short' })} '${String(d.getFullYear()).slice(2)}`);
  }

  const revenueOverTime = months.map(month => {
    const point: Record<string, number | string> = { month };
    let total = 0;
    filteredOrgs.forEach(org => {
      const orgRevenue = (paidBookings ?? [])
        .filter(b => {
          if (b.org_id !== org.id) return false;
          const d = new Date((b as any).created_at);
          const label = `${d.toLocaleString('en-GB', { month: 'short' })} '${String(d.getFullYear()).slice(2)}`;
          return label === month;
        })
        .reduce((s, b) => s + (b.amount_paid ?? 0), 0);
      point[org.name] = orgRevenue;
      total += orgRevenue;
    });
    point.total = total;
    return point;
  });

  return NextResponse.json({
    totals: {
      revenue: totalRevenue,
      students: totalStudents,
      activeTutorials: totalActiveTutorials,
      avgRating,
      orgCount: filteredOrgs.length,
    },
    byOrg,
    revenueOverTime,
    orgNames: filteredOrgs.map(o => o.name),
    upcoming: upcoming ?? [],
    recentFeedback: recentFeedback ?? [],
  });
}
