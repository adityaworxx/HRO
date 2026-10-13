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
  subtitle?: string;
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
  // If subtitle is not explicitly provided, compute clean plain-text counts: e.g. "8 active, 1 on hold"
  const defaultSubtitle = React.useMemo(() => {
    const activeCount = openings.filter((o) => o.status !== 'On Hold' && o.status !== 'Closed').length;
    const onHoldCount = openings.filter((o) => o.status === 'On Hold').length;
    if (onHoldCount > 0) {
      return `${activeCount} active, ${onHoldCount} on hold`;
    }
    return `${activeCount} active ${activeCount === 1 ? 'position' : 'positions'}`;
  }, [openings]);

  const displaySubtitle = subtitle ?? defaultSubtitle;

  return (
    <div
      className={cn(
        'border border-border bg-surface-1 rounded-[12px] py-5',
        className
      )}
    >
      {/* 1. Header (padding: 0 20px 16px) */}
      <div className="flex items-start justify-between gap-4 px-5 pb-4">
        <div>
          <h2 className="text-[16px] leading-[24px] font-medium tracking-[-0.01em] text-text">
            {title}
          </h2>
          <p className="mt-[2px] text-[13px] leading-[20px] text-text-muted">
            {displaySubtitle}
          </p>
        </div>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-[13px] leading-[20px] font-medium text-text-muted hover:text-text transition-colors shrink-0"
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
            <div key={i} className="h-[56px] px-5 flex items-center">
              <Skeleton className="h-4 w-full rounded-[4px]" />
            </div>
          ))}
        </div>
      ) : openings.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-[13px] leading-[20px] text-text-muted">No active openings.</p>
        </div>
      ) : (
        <div>
          {openings.map((opening) => {
            const openingCandidates = candidates.filter((c) => c.openingId === opening.id);
            const candidatesCount = openingCandidates.length;

            // Determine 4-segment stage progress:
            // Sourced = 1, Shared with Manager = 2, Interview = 3, Offer/Joined = 4
            let stageProgress = 1;
            if (
              openingCandidates.some(
                (c) => c.stage === 'Joined' || c.stage === 'Selected' || c.stage === 'Offer Sent'
              )
            ) {
              stageProgress = 4;
            } else if (openingCandidates.some((c) => c.stage === 'Interview')) {
              stageProgress = 3;
            } else if (openingCandidates.some((c) => c.stage === 'Shared with Manager')) {
              stageProgress = 2;
            }

            return (
              <OpeningRow
                key={opening.id}
                opening={opening}
                candidatesCount={candidatesCount}
                stageProgress={stageProgress}
                onReactivate={onReactivate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

