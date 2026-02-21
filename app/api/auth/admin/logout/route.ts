import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * POST /api/auth/admin/logout
 *
 * Signs the current admin out of Supabase and clears the session cookie.
 *
 * Response 200: { message: "Logged out successfully" }
 * Response 500: { error: "Failed to log out" }
 */
export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to log out. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Logged out successfully.' });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
