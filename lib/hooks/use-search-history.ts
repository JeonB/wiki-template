'use client';

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'wiki-search-history';
const MAX_HISTORY = 10;

function loadHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(list: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(() => loadHistory());

  const add = useCallback((query: string) => {
    const q = query.trim();
    if (!q) return;
    const prev = loadHistory();
    const next = [q, ...prev.filter((x) => x !== q)].slice(0, MAX_HISTORY);
    saveHistory(next);
    setHistory(next);
  }, []);

  const clear = useCallback(() => {
    saveHistory([]);
    setHistory([]);
  }, []);

  return { history, add, clear };
}
