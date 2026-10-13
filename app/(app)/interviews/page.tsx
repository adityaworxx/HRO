'use client';

import * as React from 'react';
import { PageHeader } from '@/components/hro/page-header';
import { InterviewsView } from '@/features/candidates';

export default function InterviewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Technical Interviews Coordination"
        description="Schedule candidate evaluations, view upcoming call times, and submit technical rubric scores."
      />
      <InterviewsView />
    </div>
  );
}
