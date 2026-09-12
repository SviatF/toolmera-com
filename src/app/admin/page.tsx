import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AdminQueryIntelligence } from '@/components/AdminQueryIntelligence';
import { AdminInternalLinkBoost } from '@/components/AdminInternalLinkBoost';
import { AdminSeoExperiments } from '@/components/AdminSeoExperiments';
import { AdminSeoActionCenter } from '@/components/AdminSeoActionCenter';
import { AdminSeoTaskSync } from '@/components/AdminSeoTaskSync';
import { AdminSeoActivityLog } from '@/components/AdminSeoActivityLog';
import { AdminSeoVerificationRecorder } from '@/components/AdminSeoVerificationRecorder';
import { AdminSeoOutcomeLearning } from '@/components/AdminSeoOutcomeLearning';
import { AdminSeoAutopilotGuardrails } from '@/components/AdminSeoAutopilotGuardrails';

export const metadata: Metadata = {
  title: 'TOOLMERA Admin — SEO Intelligence',
  description: 'Private TOOLMERA SEO and traffic intelligence dashboard.',
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function AdminPage() {
  return <><AdminDashboard /><AdminQueryIntelligence /><AdminInternalLinkBoost /><AdminSeoActionCenter /><AdminSeoTaskSync /><AdminSeoVerificationRecorder /><AdminSeoAutopilotGuardrails /><AdminSeoActivityLog /><AdminSeoOutcomeLearning /><AdminSeoExperiments /></>;
}
