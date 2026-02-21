import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('careers')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Database Error', message: error.message },
        { status: 500 }
      );
    }


    const careers = data.map(job => ({
      id: job.id,
      jobId: job.job_id,
      title: job.title,
      category: job.category,
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      type: job.type,
      location: job.location,
      applicationLink: job.application_link,
      status: job.status,
      createdAt: job.created_at
    }));

    return NextResponse.json({ jobs: careers });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
