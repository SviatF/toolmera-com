import Link from 'next/link';
import { Search, Grid2X2 } from 'lucide-react';
import { Brand } from './Brand';
import { ThemeToggle } from './ThemeToggle';

const nav = [
  ['Image', '/image/'], ['PDF', '/pdf/'], ['Calculators', '/calculators/'],
  ['Converters', '/converters/'], ['Generators', '/generators/'], ['Time', '/time/'],
  ['Text', '/text/'], ['Developer', '/developer/'], ['Website', '/website-analysis/'],
];

export function Header() {
  return (
    <header className="siteHeader">
      <div className="shell headerInner">
        <Brand />
        <nav className="desktopNav" aria-label="Primary">
          {nav.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
        </nav>
        <div className="headerActions">
          <ThemeToggle />
          <Link className="iconButton" href="/#tool-search" aria-label="Search tools"><Search size={18} /></Link>
          <Link className="allToolsButton" href="/tools/"><Grid2X2 size={16} /> All tools</Link>
        </div>
      </div>
    </header>
  );
}
