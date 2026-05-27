import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find a Tutor",
  description:
    "Browse and book expert tutors at A-Star Tutorials. Find one-on-one sessions tailored to your course and schedule.",
  alternates: {
    canonical: "https://astartutorials.com/tutorials",
  },
};

export default function TutorialsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
