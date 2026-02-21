import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Preparation of update data mapping
    const fieldMap: Record<string, string> = {
      jobId: 'job_id',
      roleTitle: 'title',
      department: 'category',
      jobType: 'type',
      location: 'location',
      description: 'description',
      responsibilities: 'responsibilities',
      requirements: 'requirements',
      applicationLink: 'application_link',
      status: 'status'
    };

    const updateData: any = {};
    Object.entries(body).forEach(([key, value]) => {
      const dbKey = fieldMap[key];
      if (dbKey && value !== undefined) {
        updateData[dbKey] = value;
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No valid fields provided for update.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('careers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message },
        { status: 500 }
      );
    }

    const formattedJob = {
      id: data.id,
      jobId: data.job_id,
      title: data.title,
      category: data.category,
      type: data.type,
      location: data.location,
      description: data.description,
      responsibilities: data.responsibilities,
      requirements: data.requirements,
      applicationLink: data.application_link,
      status: data.status,
      createdAt: data.created_at
    };

    return NextResponse.json({ message: 'Career role updated successfully', job: formattedJob });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('careers')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Job role deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
