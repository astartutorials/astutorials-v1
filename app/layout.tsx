import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import ClientFrame from '@/components/shared/ClientFrame'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk' 
})

export const metadata: Metadata = {
  metadataBase: new URL("https://astartutorials.com"),
  title: {
    default: "A-Star Tutorials | Academic Excellence for Tertiary Students",
    template: "%s | A-Star Tutorials",
  },
  description:
    "Personalized one-on-one and group tutoring for tertiary institution students. Book expert tutors at A-Star Tutorials and unlock your academic potential.",
  keywords: [
    "tutoring",
    "tertiary education",
    "Babcock University",
    "academic excellence",
    "private tutor",
    "group tutorials",
    "university tutoring Nigeria",
  ],
  authors: [{ name: "A-Star Tutorials", url: "https://astartutorials.com" }],
  creator: "A-Star Tutorials",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://astartutorials.com",
    siteName: "A-Star Tutorials",
    title: "A-Star Tutorials | Academic Excellence for Tertiary Students",
    description:
      "Personalized one-on-one and group tutoring for tertiary institution students. Book expert tutors and unlock your academic potential.",
    images: [
      {
        url: "/logo.png",
        width: 840,
        height: 840,
        alt: "A-Star Tutorials – Academic Excellence for Tertiary Students",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "A-Star Tutorials | Academic Excellence for Tertiary Students",
    description:
      "Personalized one-on-one and group tutoring for tertiary institution students.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="font-sans antialiased">
        <ClientFrame>{children}</ClientFrame>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

