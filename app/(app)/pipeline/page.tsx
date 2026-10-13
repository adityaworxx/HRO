'use client';

import * as React from 'react';
import { PageHeader } from '@/components/hro/page-header';
import { PipelineBoard } from '@/features/candidates';

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruitment Pipeline Board"
        description="Interactive drag-and-drop workflow tracking candidate progress across milestones."
      />
      <PipelineBoard />
    </div>
  );
}
