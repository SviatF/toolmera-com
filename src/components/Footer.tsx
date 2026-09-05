import Link from 'next/link';
import { Brand } from './Brand';

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footerGrid">
        <div><Brand /><p>Private, fast tools for everyday work.</p></div>
        <div className="footerLinks">
          <Link href="/image/">Image</Link><Link href="/pdf/">PDF</Link><Link href="/calculators/">Calculators</Link>
          <Link href="/converters/">Converters</Link><Link href="/text/">Text</Link><Link href="/developer/">Developer</Link>
        </div>
        <div className="footerMeta"><span>© {new Date().getFullYear()} Toolmera</span><span>Built for speed. Private by default.</span></div>
      </div>
    </footer>
  );
}
