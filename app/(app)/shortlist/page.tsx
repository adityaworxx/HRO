'use client';

import * as React from 'react';
import { ShortlistReview } from '@/features/candidates';

export default function ShortlistPage() {
  return (
    <React.Suspense fallback={<div className="p-6 text-text-muted text-[13px]">Loading shortlist review...</div>}>
      <ShortlistReview />
    </React.Suspense>
  );
}
