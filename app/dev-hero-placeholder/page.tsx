import type { Metadata } from "next";
import PlaceholderPreview from "./PlaceholderPreview";

// Temporary: compares hero video placeholders. Never merged.
export const metadata: Metadata = { title: "Hero placeholder preview", robots: { index: false, follow: false } };

export default function Page() {
  return <PlaceholderPreview />;
}
