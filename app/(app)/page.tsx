'use client';

import { PageHeader } from '@/components/hro/page-header';
import { EmptyState } from '@/components/hro/empty-state';
import { LayoutDashboard } from 'lucide-react';
import { useUiStore } from '@/lib/store';

export default function DashboardPage() {
  const { role } = useUiStore();
  const roleTitle = role === 'manager' ? 'Hiring Manager' : 'HR Specialist';

  return (
    <div>
      <PageHeader
        title={`${roleTitle} Dashboard`}
        description="Unified overview of active requisitions, pipeline metrics, and hiring priorities."
      />
      <EmptyState
        icon={LayoutDashboard}
        title="Dashboard Screen Arrives in Phase 2"
        description="This foundation provides the theme, shell, and mock store. Full dashboard cards, metrics, and activity widgets will be designed in the next phase."
      />
    </div>
  );
}
