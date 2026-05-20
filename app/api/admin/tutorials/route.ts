import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await serviceSupabase
    .from('tutorials')
    .select('id, code, title, teacher, date, time, seats_total, status, location, bookings(id)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      title,
      teacher,
      description,
      date,
      time,
      location,
      capacity,
      price,
      colorScheme,
      status = 'active'
    } = body;

    if (!code || !title) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Course code and title are required.' },
        { status: 400 }
      );
    }
    if (status === 'active' && (!teacher || !capacity)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Tutor name and available seats are required to publish.' },
        { status: 400 }
      );
    }


    const { data, error } = await supabase
      .from('tutorials')
      .insert([
        { 
          code,
          title,
          teacher,
          description,
          date,
          time,
          location,
          seats_total: capacity,
          price,
          color_scheme: colorScheme,
          status
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Tutorial successfully created', tutorial: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
