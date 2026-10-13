'use client';

import * as React from 'react';
import { PageHeader } from '@/components/hro/page-header';
import { OpeningForm } from '@/features/openings';

export default function NewOpeningPage() {
  return (
    <div className="mx-auto max-w-[840px] space-y-6">
      <PageHeader
        title="Raise New Job Requisition"
        description="Specify requirements, target headcount, budget band, and skill criteria."
      />
      <OpeningForm />
    </div>
  );
}
