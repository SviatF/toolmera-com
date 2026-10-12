'use client';

import { useEffect } from 'react';

const GTM_ID = 'GTM-P9P7456H';

export function GoogleTagManager() {
  useEffect(() => {
    if (window.location.pathname === '/admin/' || window.location.pathname.startsWith('/admin/')) return;

    let timeout = 0;
    let cancelled = false;

    function load() {
      if (cancelled || document.getElementById('toolmera-gtm')) return;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      const script = document.createElement('script');
      script.id = 'toolmera-gtm';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
      document.head.appendChild(script);
    }

    function schedule() {
      timeout = window.setTimeout(load, 800);
    }

    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener('load', schedule);
      if (timeout) window.clearTimeout(timeout);
    };
  }, []);

  return null;
}
