import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;

  const { data, error } = await supabase
    .from('bookings')
    .select('full_name, email, phone, course, notes')
    .eq('payment_reference', ref)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;
  const body = await request.json();

  const { error } = await supabase
    .from('bookings')
    .update({
      course: body.course ?? undefined,
      course_of_study: body.courseOfStudy ?? undefined,
      level: body.level ?? undefined,
      preferred_schedule: body.preferredSchedule ?? undefined,
    })
    .eq('payment_reference', ref);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
