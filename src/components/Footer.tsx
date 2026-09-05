import Link from 'next/link';
import { Brand } from './Brand';

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footerGrid footerGridExpanded">
        <div className="footerBrand">
          <Brand />
          <p>Private, fast tools for everyday work.</p>
          <span>Calculate. Convert. Compress. Create.</span>
        </div>

        <div className="footerColumn">
          <strong>Tools</strong>
          <Link href="/tools/">All tools</Link>
          <Link href="/image/">Image</Link>
          <Link href="/pdf/">PDF</Link>
          <Link href="/calculators/">Calculators</Link>
          <Link href="/converters/">Converters</Link>
          <Link href="/generators/">Generators</Link>
          <Link href="/time/">Time & Date</Link>
          <Link href="/text/">Text</Link>
          <Link href="/developer/">Developer</Link>
        </div>

        <div className="footerColumn">
          <strong>Company</strong>
          <Link href="/about/">About</Link>
          <Link href="/contact/">Contact</Link>
          <Link href="/privacy/">Privacy</Link>
          <Link href="/terms/">Terms</Link>
          <Link href="/cookies/">Cookies</Link>
          <Link href="/disclaimer/">Disclaimer</Link>
        </div>

        <div className="footerMeta">
          <span>© {new Date().getFullYear()} Toolmera</span>
          <span>Built for speed.</span>
          <span>Private by default.</span>
        </div>
      </div>
    </footer>
  );
}
