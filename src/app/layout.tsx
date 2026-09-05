import type { Metadata } from 'next';
import favicon from '@/lib/favcion (1).webp';
import './globals.css';
import { GoogleTagManager } from '@/components/GoogleTagManager';
import { PublicAnalyticsEvents } from '@/components/PublicAnalyticsEvents';

export const metadata: Metadata = {
  metadataBase: new URL('https://toolmera.com'),
  title: { default: 'Free Online Tools — Every Tool. One Place.', template: '%s | Toolmera' },
  description: 'Fast, privacy-minded online tools for images, PDFs, calculators, converters, generators, time, text and developer tasks.',
  icons: { icon: [{ url: favicon.src, type: 'image/webp' }], shortcut: favicon.src },
  openGraph: { title: 'Free Online Tools — Every Tool. One Place.', description: 'Fast, privacy-minded online tools for everyday work.', url: 'https://toolmera.com/', siteName: 'Toolmera', type: 'website' },
  twitter: { card: 'summary', title: 'Free Online Tools — Every Tool. One Place.', description: 'Fast, privacy-minded online tools for everyday work.' },
};

const themeInit = `
(function(){
  try {
    var saved = localStorage.getItem('toolmera-theme');
    document.documentElement.dataset.theme = saved === 'dark' ? 'dark' : 'light';
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
  }
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInit }} /></head>
      <body><GoogleTagManager/><PublicAnalyticsEvents/>{children}</body>
    </html>
  );
}
