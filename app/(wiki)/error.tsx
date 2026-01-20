'use client';

import { useEffect } from 'react';
import ErrorFallback from '@/components/error-fallback';

interface WikiErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function WikiError({ error, reset }: WikiErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Wiki error:', error);
    }
  }, [error]);

  return <ErrorFallback error={error} reset={reset} isRoot={false} />;
}
