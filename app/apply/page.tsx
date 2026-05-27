import TutorApplicationForm from "@/components/apply/TutorApplicationForm";

export const metadata = {
  title: "Become a Tutor",
  description:
    "Apply to join A-Star Tutorials as a tutor. Share your expertise, set your own schedule, and help tertiary students achieve academic excellence.",
  alternates: {
    canonical: "https://astartutorials.com/apply",
  },
};

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-transparent pt-24 md:pt-32 pb-14 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <TutorApplicationForm />
      </div>
    </div>
  );
}
