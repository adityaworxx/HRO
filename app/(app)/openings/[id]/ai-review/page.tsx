'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { ManagerAiAnalysisPage } from '@/features/candidates';

export default function OpeningAiReviewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  return (
    <React.Suspense fallback={<div className="p-6 text-text-muted text-[13px]">Loading AI Resume Intelligence...</div>}>
      <ManagerAiAnalysisPage openingId={id} />
    </React.Suspense>
  );
}
