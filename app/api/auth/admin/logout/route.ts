import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';


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
