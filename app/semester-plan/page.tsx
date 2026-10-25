import type { Metadata } from "next";
import SemesterPlanLanding from "@/components/semester-plan/SemesterPlanLanding";

export const metadata: Metadata = {
  title: "Full Semester Plan for 100L Students",
  description:
    "Tutorials for your whole first semester. 50 group sessions for ₦75,000 or 50 one-on-one sessions for ₦250,000, with strong tutors who know your courses.",
  alternates: { canonical: "/semester-plan" },
  openGraph: {
    title: "Full Semester Plan | A-Star Tutorials",
    description:
      "Your whole first semester, sorted. 50 group sessions for ₦75,000 or 50 private sessions for ₦250,000.",
    url: "https://astartutorials.com/semester-plan",
    type: "website",
  },
};

export default function SemesterPlanPage() {
  return <SemesterPlanLanding audience="student" />;
}
