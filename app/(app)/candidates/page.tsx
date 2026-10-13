'use client';

import * as React from 'react';
import { PageHeader } from '@/components/hro/page-header';
import { CandidatesTable } from '@/features/candidates';

export default function CandidatesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate Directory"
        description="Comprehensive repository of all sourced talent, resume profiles, and stage records."
      />
      <CandidatesTable />
    </div>
  );
}
