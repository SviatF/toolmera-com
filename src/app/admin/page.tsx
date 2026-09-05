import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/AdminDashboard';

export const metadata: Metadata = {
  title: 'TOOLMERA Admin — SEO Intelligence',
  description: 'Private TOOLMERA SEO and traffic intelligence dashboard.',
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
