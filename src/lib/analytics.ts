'use client';

export type AnalyticsEvent = {
  event: 'tool_action' | 'file_download' | 'copy_result' | 'search_used';
  [key: string]: string | number | boolean | undefined;
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function pushAnalyticsEvent(payload: AnalyticsEvent) {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === '/admin/' || window.location.pathname.startsWith('/admin/')) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    ...payload,
    page_path: window.location.pathname,
  });
}
