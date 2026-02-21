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
      roleTitle, 
      department, 
      jobType, 
      location, 
      description, 
      responsibilities, 
      requirements, 
      applicationLink,
      status = 'active'
    } = body;

    if (!roleTitle || !department || !jobType || !applicationLink) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required fields: roleTitle, department, jobType, and applicationLink are mandatory.' },
        { status: 400 }
      );
    }

    // Generate unique jobId if not provided (e.g., #DEV-123)
    const prefix = department.substring(0, 3).toUpperCase();
    const randomNumber = Math.floor(100 + Math.random() * 900);
    const jobId = `#${prefix}-${randomNumber}`;

    const { data, error } = await supabase
      .from('careers')
      .insert([
        { 
          job_id: jobId,
          title: roleTitle, 
          category: department, 
          type: jobType, 
          location, 
          description, 
          responsibilities, 
          requirements, 
          application_link: applicationLink,
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

    return NextResponse.json({ message: 'Career role created successfully', job: formattedJob }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
