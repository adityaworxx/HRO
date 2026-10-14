'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useOpening } from '@/features/openings';
import { OpeningForm } from '@/features/openings';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/hro/empty-state';
import { AlertCircle } from 'lucide-react';

export default function EditOpeningPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const { data: opening, isLoading, isError } = useOpening(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[840px] space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !opening) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Requisition Not Found"
        description="Could not locate the requested requisition for editing."
      />
    );
  }

  return (
    <div className="w-full h-full">
      <OpeningForm initialData={opening} isEditing />
    </div>
  );
}

