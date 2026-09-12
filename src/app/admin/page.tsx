import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AdminSeoSafeSuite } from '@/components/AdminSeoSafeSuite';

export const metadata: Metadata = {
  title: 'TOOLMERA Admin — SEO Intelligence',
  description: 'Private TOOLMERA SEO and traffic intelligence dashboard.',
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function AdminPage() {
  // Safe architecture: the legacy portal/polling SEO widgets stay unmounted.
  // AdminSeoSafeSuite reads one shared 7d + 28d GSC payload and computes
  // opportunity, trend, cannibalization, experiment locks and link ideas locally.
  return <><AdminDashboard /><AdminSeoSafeSuite /></>;
}
