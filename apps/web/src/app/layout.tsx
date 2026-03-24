import type { Metadata } from 'next'
import { Space_Grotesk, Hind_Siliguri } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-bangla',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'BanglaAIHub - বাংলায় সেরা AI টুলস ডিরেক্টরি',
    template: '%s | BanglaAIHub',
  },
  description: 'বাংলায় সবচেয়ে trusted AI tools directory, guide, comparison এবং money-making resource platform। ফ্রি ও পেইড AI টুলস রিভিউ, তুলনা এবং গাইড।',
  keywords: ['AI tools', 'বাংলা AI', 'AI টুলস বাংলা', 'artificial intelligence', 'ChatGPT বাংলা', 'AI গাইড'],
  authors: [{ name: 'BanglaAIHub' }],
  creator: 'BanglaAIHub',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://banglaAIhub.com'),
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'BanglaAIHub',
    title: 'BanglaAIHub - বাংলায় সেরা AI টুলস ডিরেক্টরি',
    description: 'বাংলায় সবচেয়ে trusted AI tools directory এবং guide platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BanglaAIHub',
    description: 'বাংলায় সেরা AI টুলস ডিরেক্টরি',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const theme = localStorage.getItem('theme') || 'light';
              document.documentElement.classList.toggle('dark', theme === 'dark');
            } catch {}
          `
        }} />
      </head>
      <body className={`${spaceGrotesk.variable} ${hindSiliguri.variable} font-bangla bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
