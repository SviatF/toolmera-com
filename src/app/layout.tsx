import type { Metadata } from 'next';
import favicon from '@/lib/favcion (1).webp';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://toolmera.com'),
  title: { default: 'Free Online Tools — Every Tool. One Place.', template: '%s | Toolmera' },
  description: 'Fast, private online tools for images, PDFs, calculators, converters, text and developer tasks.',
  icons: { icon: [{ url: favicon.src, type: 'image/webp' }], shortcut: favicon.src },
  openGraph: { title: 'Free Online Tools — Every Tool. One Place.', description: 'Fast, private online tools for everyday work.', url: 'https://toolmera.com', siteName: 'Toolmera', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
