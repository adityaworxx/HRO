'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/hro/page-header';
import { OpeningsTable } from '@/features/openings';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function OpeningsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Openings & Requisitions"
        description="Oversee headcount requirements, pipeline progression, and department hiring budgets."
        action={
          <Button asChild variant="primary" className="gap-2">
            <Link href="/openings/new">
              <Plus className="h-4 w-4" />
              <span>Create Requisition</span>
            </Link>
          </Button>
        }
      />

      <OpeningsTable />
    </div>
  );
}
