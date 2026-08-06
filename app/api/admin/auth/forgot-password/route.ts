import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { checkPasswordResetRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const { email } = await request.json().catch(() => ({}));

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  // Unauthenticated, and sends mail to an address the caller chooses. Throttled
  // on both the caller and the target so it cannot be used to flood someone's
  // inbox or burn the mail quota.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const { allowed } = await checkPasswordResetRateLimit(ip, String(email));
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many reset requests. Please wait 10 minutes and try again.' },
      { status: 429 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/reset-password`;

  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  // Always return success — don't reveal whether the email exists.
  return NextResponse.json({ ok: true });
}
