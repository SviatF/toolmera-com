'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { Tool, toolUrl } from '@/data/tools';

export function ToolSearch({ tools }: { tools: Tool[] }) {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return tools.filter((tool) => `${tool.name} ${tool.short} ${tool.description} ${tool.slug} ${tool.categoryLabel} ${tool.benefits.join(' ')}`.toLowerCase().includes(q)).slice(0, 7);
  }, [query, tools]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (matches[0]) window.location.href = toolUrl(matches[0]);
  }

  return (
    <div className="searchWrap" id="tool-search">
      <form className="heroSearch" onSubmit={submit}>
        <Search size={22} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tools… e.g. QR code, PDF to JPG, loan calculator" aria-label="Search tools" />
        <button type="submit">Search <ArrowRight size={17} /></button>
      </form>
      {matches.length > 0 && (
        <div className="searchResults">
          {matches.map((tool) => <Link key={tool.id} href={toolUrl(tool)}><span>{tool.name}<small>{tool.categoryLabel}</small></span><ArrowRight size={16}/></Link>)}
        </div>
      )}
    </div>
  );
}
