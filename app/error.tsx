'use client';

import { useEffect } from 'react';
import ErrorFallback from '@/components/error-fallback';

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('App error:', error);
    }
  }, [error]);

  return <ErrorFallback error={error} reset={reset} isRoot />;
}
