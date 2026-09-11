'use client';

import { useEffect } from 'react';

type SortDirection = 'asc' | 'desc';

export function QuerySortEnhancer() {
  useEffect(() => {
    let direction: SortDirection = 'asc';

    const getPositionHeader = () => {
      const headers = Array.from(document.querySelectorAll<HTMLElement>('.queryTable .tableHead > span'));
      return headers.find((header) => header.textContent?.trim().toLowerCase() === 'position') || null;
    };

    const getPosition = (row: Element) => {
      const cells = row.children;
      const raw = cells[5]?.textContent?.trim() || '';
      const parsed = Number.parseFloat(raw.replace(',', '.'));
      return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
    };

    const updateHeader = () => {
      const header = getPositionHeader();
      if (!header) return;
      header.dataset.sortable = 'position';
      header.dataset.direction = direction;
      header.title = direction === 'asc'
        ? 'Sort by position: best to worst'
        : 'Sort by position: worst to best';
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-label', `Sort by position ${direction === 'asc' ? 'best to worst' : 'worst to best'}`);
    };

    const applySort = () => {
      const table = document.querySelector<HTMLElement>('.queryTable');
      if (!table) return;

      const rows = Array.from(table.children).filter((child) => !child.classList.contains('tableHead'));
      if (rows.length < 2) {
        updateHeader();
        return;
      }

      const sorted = [...rows].sort((a, b) => {
        const aPosition = getPosition(a);
        const bPosition = getPosition(b);

        // Missing positions always stay at the bottom.
        if (!Number.isFinite(aPosition) && !Number.isFinite(bPosition)) return 0;
        if (!Number.isFinite(aPosition)) return 1;
        if (!Number.isFinite(bPosition)) return -1;

        return direction === 'asc'
          ? aPosition - bPosition
          : bPosition - aPosition;
      });

      const alreadySorted = rows.every((row, index) => row === sorted[index]);
      if (!alreadySorted) sorted.forEach((row) => table.appendChild(row));
      updateHeader();
    };

    const toggleSort = () => {
      direction = direction === 'asc' ? 'desc' : 'asc';
      applySort();
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const header = target?.closest<HTMLElement>('.queryTable .tableHead > span[data-sortable="position"]');
      if (!header) return;
      toggleSort();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const header = target?.closest<HTMLElement>('.queryTable .tableHead > span[data-sortable="position"]');
      if (!header || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      toggleSort();
    };

    const observer = new MutationObserver(() => {
      const header = getPositionHeader();
      if (!header) return;
      updateHeader();
    });

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    observer.observe(document.body, { childList: true, subtree: true });
    updateHeader();

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
    };
  }, []);

  return (
    <style jsx global>{`
      .queryTable .tableHead > span[data-sortable='position'] {
        cursor: pointer;
        user-select: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .queryTable .tableHead > span[data-sortable='position']::after {
        content: '↕';
        font-size: 11px;
        opacity: .55;
      }

      .queryTable .tableHead > span[data-sortable='position'][data-direction='asc']::after {
        content: '↑';
        opacity: 1;
      }

      .queryTable .tableHead > span[data-sortable='position'][data-direction='desc']::after {
        content: '↓';
        opacity: 1;
      }

      .queryTable .tableHead > span[data-sortable='position']:hover {
        color: #58a9ff;
      }
    `}</style>
  );
}
