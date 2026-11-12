import type { Metadata } from "next";
import AmbassadorLanding from "@/components/ambassador/AmbassadorLanding";
import { AMBASSADOR_COMMISSIONS } from "@/lib/ambassador";

const description = `Become an A-Star Ambassador. Tell students about A-Star Tutorials and earn ₦${AMBASSADOR_COMMISSIONS.group.toLocaleString()}–₦${AMBASSADOR_COMMISSIONS.private.toLocaleString()} for every Semester Plan bought with your code. Apply now.`;

export const metadata: Metadata = {
  title: "Become an A-Star Ambassador",
  description,
  alternates: { canonical: "/ambassador" },
  openGraph: {
    title: "Become an A-Star Ambassador | A-Star Tutorials",
    description,
    url: "https://astartutorials.com/ambassador",
    type: "website",
  },
};

export default function AmbassadorPage() {
  return <AmbassadorLanding />;
}
