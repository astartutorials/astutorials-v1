import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import ClientFrame from '@/components/shared/ClientFrame'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk' 
})

export const metadata: Metadata = {
  metadataBase: new URL('https://astartutorials.com'),
  title: {
    default: "A-Star Tutorials | Unlock Your Academic Brilliance",
    template: "%s | A-Star Tutorials"
  },
  description: "Premium personalized tutoring for Babcock University students. Excel in your academics with structured guidance and community support.",
  keywords: ["Babcock University", "Tutoring", "Academic Excellence", "A-Star Tutorials", "Nigeria Education", "Student Support"],
  authors: [{ name: "A-Star Tutorials" }],
  creator: "A-Star Tutorials",
  publisher: "A-Star Tutorials",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "A-Star Tutorials | Unlock Your Academic Brilliance",
    description: "Premium personalized tutoring for Babcock University students.",
    url: 'https://astartutorials.com',
    siteName: 'A-Star Tutorials',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "A-Star Tutorials | Unlock Your Academic Brilliance",
    description: "Premium personalized tutoring for Babcock University students.",
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
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
      </body>
    </html>
  );
}

