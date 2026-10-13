'use client';

import { PageHeader } from '@/components/hro/page-header';
import { EmptyState } from '@/components/hro/empty-state';
import { Users } from 'lucide-react';

export default function CandidatesPage() {
  return (
    <div>
      <PageHeader
        title="Candidates Directory"
        description="Comprehensive repository of all sourced talent across requisitions."
      />
      <EmptyState
        icon={Users}
        title="Candidates Table Arrives in Phase 2"
        description="Filterable data table with source tracking, opening association, and quick-share actions will be added in the next phase."
      />
    </div>
  );
}
