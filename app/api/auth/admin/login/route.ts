import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * POST /api/auth/admin/login
 *
 * Authenticates an admin user using Supabase Auth.
 * Checks that the user has { role: "admin" } in their user_metadata.
 * Session is stored in an HttpOnly cookie by @supabase/ssr automatically.
 *
 * Request body: { email: string, password: string }
 * Response 200: { admin: { id, email, name, role } }
 * Response 400: { error: "Missing credentials" }
 * Response 401: { error: "Invalid email or password" }
 * Response 403: { error: "Access denied. Admin privileges required." }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Check that the user has admin privileges via user_metadata
    const role = data.user.user_metadata?.role;
    if (role !== 'admin' && role !== 'super_admin') {
      // Sign out immediately — they have no admin access
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Return admin info (never return the full session/token to the client)
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
