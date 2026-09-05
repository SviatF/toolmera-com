export function freeTitle(title: string) {
  const clean = title.trim();
  if (/^free\b/i.test(clean)) return clean;
  return `Free ${clean}`;
}

export function freeInfoTitle(title: string) {
  const clean = title.trim();
  if (/\bfree\b/i.test(clean)) return clean;
  return `Free Online Tools — ${clean}`;
}
