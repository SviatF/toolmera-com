export function freeTitle(title: string) {
  const clean = title.trim();
  if (/^free\b/i.test(clean)) return clean;

  // Keep one natural "Free" near the beginning instead of producing titles such
  // as "Free Merge PDF Free". Remove an existing later occurrence first.
  const withoutLaterFree = clean
    .replace(/\s*[—–-]\s*Free\b\s*[,/&-]?\s*/i, ' — ')
    .replace(/\bFree\b\s*/i, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/—\s*—/g, '—')
    .trim();

  return `Free ${withoutLaterFree}`;
}

export function freeInfoTitle(title: string) {
  const clean = title.trim();
  if (/\bfree\b/i.test(clean)) return clean;
  return `Free Online Tools — ${clean}`;
}
