import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPrivateBookingDetails } from '@/lib/email';

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
      course_of_study: body.courseOfStudy ?? undefined,
      level: body.level ?? undefined,
      preferred_schedule: body.preferredSchedule ?? undefined,
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
    })
    .eq('payment_reference', ref);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send confirmation email for private bookings (tutorial_id is null)
  if (body.preferredSchedule) {
    try {
      const { data: booking } = await supabase
        .from('bookings')
        .select('tutorial_id, email, full_name, course, course_of_study, level, preferred_schedule')
        .eq('payment_reference', ref)
        .single();

      if (booking && !booking.tutorial_id) {
        await sendPrivateBookingDetails({
          to: booking.email,
          fullName: booking.full_name,
          course: booking.course ?? '',
          courseOfStudy: booking.course_of_study ?? '',
          level: booking.level ?? '',
          schedule: booking.preferred_schedule ?? '',
          reference: ref,
        });
      }
    } catch {}
  }

  return NextResponse.json({ ok: true });
}
