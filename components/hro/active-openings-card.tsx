'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { OpeningRow, OpeningHeaderRow } from './opening-row';
import type { Opening, Candidate } from '@/types/entities';

export interface ActiveOpeningsCardProps {
  openings: Opening[];
  candidates?: Candidate[];
  title?: string;
  subtitle?: string | null;
  viewAllHref?: string;
  isLoading?: boolean;
  className?: string;
  onReactivate?: (id: string, title: string) => void;
}

export function ActiveOpeningsCard({
  openings,
  candidates = [],
  title = 'Active Openings',
  subtitle,
  viewAllHref = '/openings',
  isLoading = false,
  className,
  onReactivate,
}: ActiveOpeningsCardProps) {
  const activeCount = React.useMemo(
    () => openings.filter((o) => o.status !== 'On Hold' && o.status !== 'Closed').length,
    [openings]
  );
  const onHoldCount = React.useMemo(
    () => openings.filter((o) => o.status === 'On Hold').length,
    [openings]
  );

  return (
    <div
      className={cn(
        'border border-border bg-surface-1 rounded-[12px] pt-5 pb-1 overflow-hidden',
        className
      )}
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between gap-4 px-5 pb-4">
        <h2 className="text-[15px] leading-[22px] font-semibold tracking-[-0.01em] text-text">
          {title}
        </h2>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-text-muted hover:text-text transition-colors shrink-0"
          >
            <span>View all</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* 2. Column Header Row */}
      <OpeningHeaderRow />

      {/* 3. Rows / Content */}
      {isLoading ? (
        <div className="divide-y divide-border">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[58px] px-5 flex items-center">
              <Skeleton className="h-4 w-full rounded-[4px]" />
            </div>
          ))}
        </div>
      ) : openings.length === 0 ? (
        <div className="py-12 text-center select-none">
          <p className="text-[13px] leading-[20px] text-text-muted">No active openings.</p>
        </div>
      ) : (
        <div>
          {openings.map((opening) => {
            const openingCandidates = candidates.filter((c) => c.openingId === opening.id);
            const candidatesCount = openingCandidates.length;

            return (
              <OpeningRow
                key={opening.id}
                opening={opening}
                candidatesCount={candidatesCount}
                onReactivate={onReactivate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
