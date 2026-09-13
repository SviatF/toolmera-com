import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminDashboard } from '@/components/AdminDashboard';

export const metadata: Metadata = {
  title: 'TOOLMERA Admin — SEO Intelligence',
  description: 'Private TOOLMERA SEO and traffic intelligence dashboard.',
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function AdminPage() {
  return <>
    <AdminDashboard />
    <Link
      href="/admin/command-center/"
      style={{
        position:'fixed',right:24,bottom:24,zIndex:1000,
        display:'inline-flex',alignItems:'center',gap:8,
        padding:'12px 16px',borderRadius:12,
        background:'#168cff',color:'#fff',textDecoration:'none',fontWeight:800,fontSize:13,
        boxShadow:'0 12px 32px rgba(0,0,0,.35)',border:'1px solid rgba(255,255,255,.12)'
      }}
    >
      SEO Командний центр →
    </Link>
  </>;
}
