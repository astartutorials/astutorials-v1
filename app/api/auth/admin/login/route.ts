import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getPostHogClient } from '@/lib/posthog-server';


export async function POST(request: NextRequest) {
  try {
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

    const role = data.user.user_metadata?.role;
    if (role !== 'admin' && role !== 'super_admin') {
      await supabase.auth.signOut();
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: data.user.id,
        event: 'admin_login_failed',
        properties: { reason: 'insufficient_role', role: role ?? null },
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
      properties: { email: data.user.email, role, name: data.user.user_metadata?.name ?? data.user.email },
    });
    posthog.capture({
      distinctId: data.user.id,
      event: 'admin_logged_in',
      properties: { role },
    });
    await posthog.shutdown();

    return NextResponse.json({
      admin: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name ?? data.user.email,
        role: data.user.user_metadata?.role,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
