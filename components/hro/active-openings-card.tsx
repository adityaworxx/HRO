'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
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
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 4;

export function ActiveOpeningsCard({
  openings,
  candidates = [],
  title = 'Active Openings',
  subtitle,
  viewAllHref = '/openings',
  isLoading = false,
  className,
  onReactivate,
  pageSize = DEFAULT_PAGE_SIZE,
}: ActiveOpeningsCardProps) {
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  // Reset pagination when the openings list count changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [openings.length]);

  const totalCount = openings.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const validPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  const startIndex = (validPage - 1) * pageSize;
  const visibleOpenings = React.useMemo(() => {
    return openings.slice(startIndex, startIndex + pageSize);
  }, [openings, startIndex, pageSize]);

  return (
    <div
      className={cn(
        'border border-border bg-surface-1 rounded-[12px] pt-5 overflow-hidden',
        totalPages > 1 ? 'pb-0' : 'pb-1',
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
          {visibleOpenings.map((opening) => {
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

      {/* 4. Pagination Footer when > 6 openings */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-[12px] select-none bg-surface-1">
          <span className="font-mono text-text-subtle text-[11.5px]">
            Showing {startIndex + 1}–{Math.min(startIndex + pageSize, totalCount)} of {totalCount} openings
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={validPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 w-7 inline-flex items-center justify-center rounded-[6px] border border-border bg-surface-2/40 hover:bg-surface-2 text-text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous page"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <span className="px-2 font-mono text-text-muted text-[11.5px]">
              Page {validPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={validPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 w-7 inline-flex items-center justify-center rounded-[6px] border border-border bg-surface-2/40 hover:bg-surface-2 text-text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next page"
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
