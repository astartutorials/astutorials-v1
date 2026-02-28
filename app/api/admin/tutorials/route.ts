import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

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
      capacity, 
      price, 
      colorScheme,
      status = 'active'
    } = body;

    if (!code || !title || !teacher || !capacity) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required fields: code, title, teacher, and capacity are mandatory.' },
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
