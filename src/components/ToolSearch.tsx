'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { pushAnalyticsEvent } from '@/lib/analytics';

export type ToolSearchItem = {
  id: string;
  name: string;
  short: string;
  slug: string;
  categoryLabel: string;
  url: string;
};

export function ToolSearch({ tools }: { tools: ToolSearchItem[] }) {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return tools.filter((tool) => `${tool.name} ${tool.short} ${tool.slug} ${tool.categoryLabel}`.toLowerCase().includes(q)).slice(0, 7);
  }, [query, tools]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (matches[0]) {
      pushAnalyticsEvent({
        event: 'search_used',
        search_query: query.trim(),
        result_tool: matches[0].name,
        result_url: matches[0].url,
        result_position: 1,
      });
      window.location.href = matches[0].url;
    }
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
          {matches.map((tool,index) => <Link prefetch={false} key={tool.id} href={tool.url} onClick={()=>pushAnalyticsEvent({event:'search_used',search_query:query.trim(),result_tool:tool.name,result_url:tool.url,result_position:index+1})}><span>{tool.name}<small>{tool.categoryLabel}</small></span><ArrowRight size={16}/></Link>)}
        </div>
      )}
    </div>
  );
}
