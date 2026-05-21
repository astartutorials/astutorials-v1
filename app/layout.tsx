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
  title: "A-Star | Unlock Your Academic Brilliance",
  description: "Personalized tutoring designed specifically for Tertiary Institutions.",
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

