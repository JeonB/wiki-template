'use client';

import { useEffect, useRef } from 'react';
import { useRecentPages } from '@/lib/hooks/use-recent-pages';

interface RecentPagesRecorderProps {
  slug: string;
  title: string;
}

export default function RecentPagesRecorder({ slug, title }: RecentPagesRecorderProps) {
  const { record } = useRecentPages();
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    record(slug, title);
  }, [slug, title, record]);

  return null;
}
