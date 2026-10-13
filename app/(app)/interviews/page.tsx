'use client';

import { PageHeader } from '@/components/hro/page-header';
import { EmptyState } from '@/components/hro/empty-state';
import { Calendar } from 'lucide-react';

export default function InterviewsPage() {
  return (
    <div>
      <PageHeader
        title="Interviews"
        description="Schedule technical evaluations, track upcoming calls, and record hiring outcomes."
      />
      <EmptyState
        icon={Calendar}
        title="Interview Coordination Arrives in Phase 2"
        description="Lightweight interview logging with video/phone modes and decision recording arrives in the next phase."
      />
    </div>
  );
}
