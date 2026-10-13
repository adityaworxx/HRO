'use client';

import { PageHeader } from '@/components/hro/page-header';
import { EmptyState } from '@/components/hro/empty-state';
import { UserCheck } from 'lucide-react';

export default function OnboardingPage() {
  return (
    <div>
      <PageHeader
        title="Onboarding Checklists"
        description="Track Day-1 readiness, document verification, and asset provisioning for new hires."
      />
      <EmptyState
        icon={UserCheck}
        title="Onboarding Dashboard Arrives in Phase 2"
        description="Interactive onboarding checklist grouped by Phase (Before joining, Day 1, First 30 days) arrives in the upcoming phase."
      />
    </div>
  );
}
