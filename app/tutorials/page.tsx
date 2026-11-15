import { createClient } from '@supabase/supabase-js';
import TutorialsClient, { type Tutorial } from '@/components/tutorials/TutorialsClient';
import { lagosDate } from '@/lib/semester-plan';

/**
 * Fetched on the server and refreshed at most every 60 seconds, so the cards
 * arrive in the HTML. Seat counts can lag by up to a minute; checkout
 * re-checks seats before taking payment, so a stale count cannot oversell.
 */
export const revalidate = 60;

async function upcomingTutorials(): Promise<Tutorial[]> {
    // The publishable key: this reads only what the public may see (active
    // tutorials, per migration 012), exactly as the browser used to.
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        { auth: { persistSession: false } }
    );
    const { data, error } = await supabase
        .from('tutorials')
        .select('id, code, title, teacher, description, date, time, location, seats_total, seats_booked, price, color_scheme, org_id')
        .eq('status', 'active')
        .gte('date', lagosDate())
        .order('date', { ascending: true });
    if (error) console.error('tutorials: could not load', error.message);
    return (data as Tutorial[]) ?? [];
}

export default async function TutorialsPage() {
    return <TutorialsClient tutorials={await upcomingTutorials()} />;
}
