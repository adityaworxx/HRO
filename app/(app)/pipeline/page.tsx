'use client';

import { PageHeader } from '@/components/hro/page-header';
import { EmptyState } from '@/components/hro/empty-state';
import { GitPullRequest } from 'lucide-react';

export default function PipelinePage() {
  return (
    <div>
      <PageHeader
        title="Candidate Pipeline"
        description="Kanban board visualization tracking candidates from Sourced to Joined."
      />
      <EmptyState
        icon={GitPullRequest}
        title="Interactive Kanban Board Arrives in Phase 2"
        description="Full drag-and-drop board powered by dnd-kit with keyboard movement menus will be unlocked in the dashboard & feature phase."
      />
    </div>
  );
}
