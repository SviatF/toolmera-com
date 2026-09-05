import Link from 'next/link';
import { ArrowUpRight, Calculator, Code2, FileText, ImageIcon, TextCursorInput, Repeat2 } from 'lucide-react';
import { Tool, toolUrl } from '@/data/tools';

const icons: Record<string, typeof ImageIcon> = { image: ImageIcon, pdf: FileText, calculators: Calculator, converters: Repeat2, text: TextCursorInput, developer: Code2, finance: Calculator, tax: Calculator };

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = icons[tool.category] || Calculator;
  return (
    <Link className={`toolCard accent-${tool.accent}`} href={toolUrl(tool)}>
      <div className="toolCardTop"><span className="toolIcon"><Icon size={21}/></span>{tool.badge && <span className="toolBadge">{tool.badge}</span>}</div>
      <h3>{tool.name}</h3><p>{tool.short}</p>
      <span className="toolCardLink">Open tool <ArrowUpRight size={15}/></span>
    </Link>
  );
}
