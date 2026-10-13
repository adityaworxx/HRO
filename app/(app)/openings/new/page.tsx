'use client';

import { PageHeader } from '@/components/hro/page-header';
import { EmptyState } from '@/components/hro/empty-state';
import { PlusCircle } from 'lucide-react';

export default function NewOpeningPage() {
  return (
    <div className="mx-auto max-w-[960px]">
      <PageHeader
        title="Raise New Opening"
        description="Specify requirements, headcount, and budget for your engineering team."
      />
      <EmptyState
        icon={PlusCircle}
        title="New Opening Form Arrives in Phase 2"
        description="The multi-group requisition creation form with Zod schema validation will be designed in the upcoming phase."
      />
    </div>
  );
}
