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

  const visibleOrgIds = ctx.role === 'super_admin' ? null : (ctx.orgId ? [ctx.orgId] : []);

  let upcomingQuery = serviceSupabase
    .from('tutorials')
    .select('id, code, title, date, time, org_id, organisations(name)')
    .gte('date', new Date().toISOString().split('T')[0])
    .neq('status', 'draft')
    .order('date', { ascending: true })
    .limit(5);
  if (visibleOrgIds) upcomingQuery = (upcomingQuery as any).in('org_id', visibleOrgIds);

  let feedbackQuery = serviceSupabase
    .from('feedback')
    .select('full_name, rating, created_at, tutorials(title, org_id, organisations(name))')
    .order('created_at', { ascending: false })
    .limit(5);

  let recentPaymentsQuery = serviceSupabase
    .from('bookings')
    .select('id, full_name, email, amount_paid, payment_reference, created_at, org_id, tutorials(title)')
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: false })
    .limit(8);
  if (visibleOrgIds) recentPaymentsQuery = (recentPaymentsQuery as any).in('org_id', visibleOrgIds);

  const [
    { data: orgs },
    { data: tutorials },
    { data: paidBookings },
    { data: allBookings },
    { data: feedbackRows },
    { data: upcoming },
    { data: recentFeedbackRaw },
    { data: recentPaymentsRaw },
  ] = await Promise.all([
    serviceSupabase.from('organisations').select('id, name, type, location').order('created_at'),
    serviceSupabase.from('tutorials').select('id, org_id, status'),
    serviceSupabase.from('bookings').select('id, email, amount_paid, created_at, org_id').eq('payment_status', 'paid'),
    serviceSupabase.from('bookings').select('id, email, org_id, created_at'),
    serviceSupabase.from('feedback').select('rating, tutorials(org_id)'),
    upcomingQuery,
    feedbackQuery,
    recentPaymentsQuery,
  ]);

  const recentFeedback = visibleOrgIds
    ? (recentFeedbackRaw ?? []).filter((f: any) => visibleOrgIds.includes(f.tutorials?.org_id))
    : recentFeedbackRaw;

  const filteredOrgs = visibleOrgIds
    ? (orgs ?? []).filter(o => visibleOrgIds.includes(o.id))
    : (orgs ?? []);

  const filteredPaid = visibleOrgIds
    ? (paidBookings ?? []).filter(b => b.org_id && visibleOrgIds.includes(b.org_id))
    : (paidBookings ?? []);

  const filteredAll = visibleOrgIds
    ? (allBookings ?? []).filter(b => b.org_id && visibleOrgIds.includes(b.org_id))
    : (allBookings ?? []);

  // All-time per-org aggregates (used for stat cards)
  const byOrg = filteredOrgs.map(org => {
    const orgTutorials = (tutorials ?? []).filter(t => t.org_id === org.id);
    const orgPaid = filteredPaid.filter(b => b.org_id === org.id);
    const orgAll = filteredAll.filter(b => b.org_id === org.id);
    return {
      orgId: org.id,
      orgName: org.name,
      type: org.type,
      revenue: orgPaid.reduce((s, b) => s + (b.amount_paid ?? 0), 0),
      students: new Set(orgAll.map(b => b.email)).size,
      tutorials: orgTutorials.length,
      activeTutorials: orgTutorials.filter(t => t.status === 'active').length,
      bookings: orgAll.length,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // All paid bookings count for super_admin total (includes unattributed)
  const totalRevenue = ctx.role === 'super_admin'
    ? (paidBookings ?? []).reduce((s, b) => s + (b.amount_paid ?? 0), 0)
    : byOrg.reduce((s, o) => s + o.revenue, 0);
  const totalStudents = ctx.role === 'super_admin'
    ? new Set((allBookings ?? []).map(b => b.email)).size
    : byOrg.reduce((s, o) => s + o.students, 0);
  const totalActiveTutorials = byOrg.reduce((s, o) => s + o.activeTutorials, 0);
  const filteredFeedbackRows = visibleOrgIds
    ? (feedbackRows ?? []).filter((f: any) => visibleOrgIds.includes(f.tutorials?.org_id))
    : (feedbackRows ?? []);
  const avgRating = filteredFeedbackRows.length
    ? filteredFeedbackRows.reduce((s, f) => s + f.rating, 0) / filteredFeedbackRows.length
    : null;

  return NextResponse.json({
    totals: { revenue: totalRevenue, students: totalStudents, activeTutorials: totalActiveTutorials, avgRating, orgCount: filteredOrgs.length },
    byOrg,
    orgNames: filteredOrgs.map(o => o.name),
    upcoming: upcoming ?? [],
    recentFeedback: recentFeedback ?? [],
    recentPayments: recentPaymentsRaw ?? [],
    // Raw booking streams — client aggregates these for time-period chart views
    rawPaidBookings: filteredPaid.map(b => ({ created_at: b.created_at, amount_paid: b.amount_paid ?? 0, org_id: b.org_id })),
    rawAllBookings: filteredAll.map(b => ({ created_at: b.created_at, email: b.email, org_id: b.org_id })),
  });
}
