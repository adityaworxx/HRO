'use client';

import * as React from 'react';
import { PageHeader } from '@/components/hro/page-header';
import { ShortlistReview } from '@/features/candidates';

export default function ShortlistPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate Shortlist Review"
        description="Evaluate candidates submitted by talent acquisition, review screening notes, and decide next interview rounds."
      />
      <ShortlistReview />
    </div>
  );
}
