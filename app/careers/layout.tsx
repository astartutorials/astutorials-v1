import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join the A-Star Tutorials team. Explore open roles and help us empower tertiary students across Nigeria to achieve academic excellence.",
  alternates: {
    canonical: "https://astartutorials.com/careers",
  },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
