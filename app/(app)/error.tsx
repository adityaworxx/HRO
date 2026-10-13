'use client';

import * as React from 'react';
import { ErrorState } from '@/components/hro/error-state';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-12">
      <ErrorState
        title="Application Error"
        message={error.message || 'An unexpected error occurred while rendering this page.'}
        onRetry={reset}
      />
    </div>
  );
}
