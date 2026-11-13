import type { MetadataRoute } from "next";

/** What the site looks like when saved to a phone's home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "A-Star Tutorials",
    short_name: "A-Star",
    description: "Group and private tutorials for university students.",
    start_url: "/",
    display: "standalone",
    background_color: "#FDFAF6",
    theme_color: "#FDFAF6",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
