import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AdminQueryIntelligence } from '@/components/AdminQueryIntelligence';
import { AdminInternalLinkBoost } from '@/components/AdminInternalLinkBoost';
import { AdminSeoExperiments } from '@/components/AdminSeoExperiments';

export const metadata: Metadata = {
  title: 'TOOLMERA Admin — SEO Intelligence',
  description: 'Private TOOLMERA SEO and traffic intelligence dashboard.',
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function AdminPage() {
  return <><AdminDashboard /><AdminQueryIntelligence /><AdminInternalLinkBoost /><AdminSeoExperiments /></>;
}
