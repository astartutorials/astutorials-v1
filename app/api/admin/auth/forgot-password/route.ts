import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const { email } = await request.json().catch(() => ({}));

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/reset-password`;

  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  // Always return success — don't reveal whether the email exists.
  return NextResponse.json({ ok: true });
}
