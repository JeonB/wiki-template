'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'wiki-recent-pages';
const MAX_RECENT = 10;

export interface RecentPage {
  slug: string;
  title: string;
}

function loadRecent(): RecentPage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecent(list: RecentPage[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('wiki-recent-updated'));
  } catch {
    // ignore
  }
}

export function useRecentPages() {
  const [recent, setRecent] = useState<RecentPage[]>(loadRecent);

  useEffect(() => {
    const handler = () => setRecent(loadRecent());
    window.addEventListener('wiki-recent-updated', handler);
    return () => window.removeEventListener('wiki-recent-updated', handler);
  }, []);

  const record = useCallback((slug: string, title: string) => {
    const prev = loadRecent();
    const next = [{ slug, title }, ...prev.filter((p) => p.slug !== slug)].slice(0, MAX_RECENT);
    saveRecent(next);
    setRecent(next);
  }, []);

  return { recent, record };
}
