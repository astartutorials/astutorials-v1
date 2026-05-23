import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getPostHogClient } from '@/lib/posthog-server';
import { checkLoginRateLimit } from '@/lib/rate-limit';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const { allowed } = await checkLoginRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait 10 minutes and try again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: email,
        event: 'admin_login_failed',
        properties: { reason: 'invalid_credentials' },
      });
      await posthog.shutdown();
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const { getUserRole } = await import('@/lib/rbac');
    const roleCtx = await getUserRole(
      supabase,
      data.user.id,
      data.user.user_metadata as Record<string, unknown>
    );

    const adminRoles = ['super_admin', 'org_admin', 'tutor_manager'];
    if (!roleCtx || !adminRoles.includes(roleCtx.role)) {
      await supabase.auth.signOut();
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: data.user.id,
        event: 'admin_login_failed',
        properties: { reason: 'insufficient_role', role: roleCtx?.role ?? null },
      });
      await posthog.shutdown();
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    const posthog = getPostHogClient();
    posthog.identify({
      distinctId: data.user.id,
      properties: {
        email: data.user.email,
        role: roleCtx.role,
        orgId: roleCtx.orgId,
        name: data.user.user_metadata?.full_name ?? data.user.email,
      },
    });
    posthog.capture({
      distinctId: data.user.id,
      event: 'admin_logged_in',
      properties: { role: roleCtx.role, orgId: roleCtx.orgId },
    });
    await posthog.shutdown();

    await logAuditEvent({
      actorId: data.user.id,
      actorEmail: data.user.email ?? '',
      action: 'admin.login',
      orgId: roleCtx.orgId,
      details: {
        role: roleCtx.role,
        name: data.user.user_metadata?.full_name ?? data.user.email,
      },
    });

    return NextResponse.json({
      admin: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name ?? data.user.email,
        role: roleCtx.role,
        orgId: roleCtx.orgId,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
