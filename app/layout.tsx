import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LangProvider } from '@/components/LangProvider';
import { site } from '@/lib/config';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: 'Gharmalak · Homeowners’ club, Nagpur', template: '%s · Gharmalak' },
  description: 'A club of Nagpur homeowners. One group deal a month, a price set by 10 local quotes, and verified vendors who must beat it by 10%. Launch price ₹499 a year (regular ₹1,999).',
  openGraph: { type: 'website', siteName: 'Gharmalak', locale: 'en_IN', images: ['/og.png'] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: '#111214', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600&family=Mukta:wght@400;500&family=Overpass+Mono:wght@400&display=swap" />
      </head>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
