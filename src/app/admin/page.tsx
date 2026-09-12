import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/AdminDashboard';

export const metadata: Metadata = {
  title: 'TOOLMERA Admin — SEO Intelligence',
  description: 'Private TOOLMERA SEO and traffic intelligence dashboard.',
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function AdminPage() {
  // Emergency safe mode: advanced SEO modules are temporarily unmounted.
  // Several modules used DOM polling/portal discovery and could repeatedly remount,
  // multiplying /api/admin requests while the Queries view stayed open.
  // Keep the core dashboard live while the shared-data architecture is rebuilt.
  return <AdminDashboard />;
}
