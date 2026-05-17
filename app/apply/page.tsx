import TutorApplicationForm from "@/components/apply/TutorApplicationForm";

export const metadata = {
  title: "Apply to Tutor | A-Star Tutorials",
  description: "Join our team of expert tutors at A-Star Tutorials.",
};

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 md:pt-32 pb-14 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <TutorApplicationForm />
      </div>
    </div>
  );
}
