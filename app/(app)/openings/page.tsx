'use client';

import { PageHeader } from '@/components/hro/page-header';
import { EmptyState } from '@/components/hro/empty-state';
import { Briefcase } from 'lucide-react';

export default function OpeningsPage() {
  return (
    <div>
      <PageHeader
        title="Openings"
        description="Manage active job openings, headcount allocations, and hiring requisitions."
      />
      <EmptyState
        icon={Briefcase}
        title="Openings List Screen Arrives in Phase 2"
        description="The openings table with stage progression, filters, and requisition management will be introduced in the upcoming feature phase."
      />
    </div>
  );
}
