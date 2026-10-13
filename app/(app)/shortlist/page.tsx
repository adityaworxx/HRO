'use client';

import { PageHeader } from '@/components/hro/page-header';
import { EmptyState } from '@/components/hro/empty-state';
import { ListFilter } from 'lucide-react';

export default function ShortlistPage() {
  return (
    <div>
      <PageHeader
        title="Shortlist Review"
        description="Review candidate profiles submitted by HR, evaluate skills, and record interview decisions."
      />
      <EmptyState
        icon={ListFilter}
        title="Shortlist Review Screen Arrives in Phase 2"
        description="Split-view candidate assessment with keyboard shortcuts and decision comments will be delivered in the next phase."
      />
    </div>
  );
}
