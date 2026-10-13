'use client';

import { PageHeader } from '@/components/hro/page-header';
import { EmptyState } from '@/components/hro/empty-state';
import { Edit } from 'lucide-react';

export default function EditOpeningPage() {
  return (
    <div className="mx-auto max-w-[960px]">
      <PageHeader
        title="Edit Opening"
        description="Update hiring criteria, budget range, or headcount."
      />
      <EmptyState
        icon={Edit}
        title="Edit Opening Form Arrives in Phase 2"
        description="Editable form prefilled with current requisition data will be constructed in the next phase."
      />
    </div>
  );
}
