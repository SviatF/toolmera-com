'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { pushAnalyticsEvent } from '@/lib/analytics';

function cleanLabel(value: string) {
  return value.replace(/\s+/g, ' ').trim().slice(0, 120);
}

export function PublicAnalyticsEvents() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/admin' || pathname?.startsWith('/admin/')) return;

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const download = target.closest('a[download]') as HTMLAnchorElement | null;
      if (download) {
        pushAnalyticsEvent({
          event: 'file_download',
          file_name: download.getAttribute('download') || 'download',
          link_text: cleanLabel(download.textContent || 'Download'),
        });
        return;
      }

      const button = target.closest('button') as HTMLButtonElement | null;
      if (!button) return;

      const label = cleanLabel(button.getAttribute('aria-label') || button.textContent || 'button');
      if (!label) return;

      if (/\bcopy\b/i.test(label)) {
        pushAnalyticsEvent({
          event: 'copy_result',
          action_label: label,
        });
        return;
      }

      if (button.closest('.toolUi')) {
        pushAnalyticsEvent({
          event: 'tool_action',
          action_label: label,
        });
      }
    }

    function onChange(event: Event) {
      const target = event.target as HTMLInputElement | null;
      if (!target) return;
      if (target.matches('.toolUi input[type="file"]')) {
        pushAnalyticsEvent({
          event: 'tool_action',
          action_label: 'file_selected',
          file_count: target.files?.length || 0,
        });
      }
    }

    document.addEventListener('click', onClick, true);
    document.addEventListener('change', onChange, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('change', onChange, true);
    };
  }, [pathname]);

  return null;
}
