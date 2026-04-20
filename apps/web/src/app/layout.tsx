import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Süpperajan — Your AI Companion',
  description: 'A realtime AI assistant platform with an expressive 3D robot avatar.',
  keywords: ['AI assistant', 'voice AI', 'robot avatar', 'AI companion'],
  openGraph: {
    title: 'Süpperajan',
    description: 'Your intelligent AI companion.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0C10',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-dvh bg-bg-base text-neutral-50 antialiased">
        {children}
      </body>
    </html>
  );
}
