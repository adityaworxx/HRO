'use client';

import * as React from 'react';
import { InterviewsView } from '@/features/candidates';

export default function InterviewsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <p className="text-text-muted text-[13px]">Loading interview roster...</p>
        </div>
      }
    >
      <InterviewsView />
    </React.Suspense>
  );
}
