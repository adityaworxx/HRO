'use client';

import { PageHeader } from '@/components/hro/page-header';
import { EmptyState } from '@/components/hro/empty-state';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Hiring Reports & Analytics"
        description="Key recruiting metrics: time-to-shortlist, sourcing funnel, and requisition status."
      />
      <EmptyState
        icon={BarChart3}
        title="Reports & Analytics Arrives in Phase 2"
        description="Clean, token-styled visual analytics tracking hiring velocity and pipeline distribution will be delivered in the next phase."
      />
    </div>
  );
}
