import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminSeoSafeSuite } from '@/components/AdminSeoSafeSuite';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'SEO Командний центр — TOOLMERA Admin',
  description: 'Простий SEO command center з конкретними діями на основі Search Console.',
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function CommandCenterPage(){
  return <main className={styles.page}>
    <header className={styles.topbar}>
      <div>
        <span>TOOLMERA · SEO INTELLIGENCE</span>
        <strong>Командний центр</strong>
      </div>
      <nav>
        <Link href="/admin/">← Назад в адмінку</Link>
        <a href="https://toolmera.com/" target="_blank" rel="noreferrer">Відкрити сайт ↗</a>
      </nav>
    </header>
    <AdminSeoSafeSuite />
  </main>;
}
