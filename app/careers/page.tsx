import { createClient } from "@supabase/supabase-js";
import CareersHero from "@/components/careers/CareersHero";
import CareersList from "@/components/careers/CareersList";
import type { JobPosition } from "@/components/careers/JobCard";

/**
 * Fetched on the server and refreshed at most every 5 minutes, so the
 * positions arrive in the HTML instead of loading in after the page.
 */
export const revalidate = 300;

async function openPositions(): Promise<JobPosition[]> {
    // The publishable key: only what the public may see (active careers, per
    // migration 012), exactly as the browser used to read it.
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        { auth: { persistSession: false } }
    );
    const { data, error } = await supabase
        .from("careers")
        .select("id, title, category, description, type, location, responsibilities, requirements, application_link")
        .eq("status", "active")
        .order("created_at", { ascending: false });
    if (error) console.error("careers: could not load", error.message);
    return (data ?? []).map((d) => ({ ...d, applicationLink: d.application_link })) as JobPosition[];
}

export default async function CareersPage() {
    return (
        <div className="min-h-screen flex flex-col bg-transparent font-sans pt-24 md:pt-32 pb-14 px-4 md:px-8">
            <div className="max-w-5xl mx-auto w-full">
                <CareersHero />
                <CareersList jobs={await openPositions()} />
            </div>
        </div>
    );
}
