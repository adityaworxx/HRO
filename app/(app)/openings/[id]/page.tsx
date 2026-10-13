'use client';

import { PageHeader } from '@/components/hro/page-header';
import { EmptyState } from '@/components/hro/empty-state';
import { FileText } from 'lucide-react';

export default function OpeningDetailPage() {
  return (
    <div>
      <PageHeader
        title="Opening Details"
        description="Comprehensive view of requisition requirements, candidates, and hiring timeline."
      />
      <EmptyState
        icon={FileText}
        title="Opening Detail View Arrives in Phase 2"
        description="Tabbed view covering Requirements, Candidate Pipeline, and Activity History will be designed in the next phase."
      />
    </div>
  );
}
