import type { Metadata } from "next";
import HomePreview from "@/components/home/preview/HomePreview";

// Temporary: a preview of the home page rework for the user to choose from.
// Never merged; delete with the branch.
export const metadata: Metadata = {
  title: "Home page preview",
  robots: { index: false, follow: false },
};

export default function HomePreviewPage() {
  return <HomePreview />;
}
