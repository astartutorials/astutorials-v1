import type { Metadata } from "next";
import SemesterPlanLanding from "@/components/semester-plan/SemesterPlanLanding";

export const metadata: Metadata = {
  title: "Full Semester Plan: For Parents",
  description:
    "Give your child a strong start at university. 50 tutorial sessions across the first semester, group (₦75,000) or one-on-one (₦250,000), with experienced tutors.",
  alternates: { canonical: "/semester-plan/parents" },
  openGraph: {
    title: "Full Semester Plan for Parents | A-Star Tutorials",
    description:
      "One payment covers your child's whole first semester of tutorials. Group ₦75,000 or one-on-one ₦250,000.",
    url: "https://astartutorials.com/semester-plan/parents",
    type: "website",
  },
};

export default function SemesterPlanParentsPage() {
  return <SemesterPlanLanding audience="parent" />;
}
