'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { OPENING_STATUS_MAP, type StatusColorToken } from './status-map';
import type { Opening } from '@/types/entities';
import { formatRoleTitle } from '@/lib/format';

export interface OpeningRowProps {
  opening: Opening;
  candidatesCount?: number;
  stageProgress?: number;
  className?: string;
  onReactivate?: (id: string, title: string) => void;
}

export function OpeningHeaderRow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'border-border bg-surface-2/40 text-text-muted hidden h-[34px] items-center border-y px-4 text-[11px] font-bold tracking-wider uppercase select-none sm:grid sm:px-5',
        'grid-cols-[minmax(180px,1.4fr)_minmax(100px,1fr)_minmax(110px,1fr)_24px] gap-3 sm:gap-4 lg:grid-cols-[minmax(180px,1.05fr)_minmax(100px,0.95fr)_minmax(130px,1fr)_minmax(110px,1fr)_minmax(120px,1fr)_24px]',
        className
      )}
    >
      <div>Opening</div>
      <div>Status</div>
      <div className="hidden lg:block">Location</div>
      <div className="hidden lg:block">Budget</div>
      <div>Candidates</div>
      <div aria-hidden="true" />
    </div>
  );
}

export function OpeningRow({
  opening,
  candidatesCount = 0,
  className,
  onReactivate,
}: OpeningRowProps) {
  const statusConfig = OPENING_STATUS_MAP[opening.status] ?? {
    label: opening.status,
    token: 'neutral' as StatusColorToken,
  };

  const minBudget = opening.budgetRange?.min ?? 0;
  const maxBudget = opening.budgetRange?.max ?? 0;
  const budgetText = `₹${minBudget}–${maxBudget} LPA`;

  return (
    <Link
      href={`/openings/${opening.id}`}
      className={cn(
        'group border-border/60 relative grid min-h-[54px] items-center border-b px-4 py-3 transition-colors last:border-b-0 sm:px-5',
        'hover:bg-surface-2/60 active:bg-surface-3',
        'focus:outline-none focus-visible:outline-none',
        'grid-cols-[minmax(0,1fr)_24px] gap-3 sm:grid-cols-[minmax(180px,1.4fr)_minmax(100px,1fr)_minmax(110px,1fr)_24px] sm:gap-4 lg:grid-cols-[minmax(180px,1.05fr)_minmax(100px,0.95fr)_minmax(130px,1fr)_minmax(110px,1fr)_minmax(120px,1fr)_24px]',
        className
      )}
    >
      {/* 1. Opening Cell */}
      <div className="flex min-w-0 flex-col justify-center">
        <span className="text-text group-hover:text-text inline-block max-w-full truncate text-[14px] leading-[20px] font-medium transition-colors">
          {formatRoleTitle(opening.title)}
        </span>

        <div className="text-text-muted mt-0.5 truncate text-[12px] leading-[18px]">
          {/* Desktop subline (>=1024px): Department only */}
          <span className="hidden truncate lg:inline">{opening.department}</span>

          {/* Responsive subline (<1024px and >=640px): Department · Location · Budget */}
          <span className="hidden truncate sm:inline lg:hidden">
            {opening.department} <span className="text-text-subtle">·</span> {opening.location}{' '}
            <span className="text-text-subtle">·</span>{' '}
            <span className="font-mono tabular-nums">{budgetText}</span>
          </span>

          {/* Mobile subline (<640px): Status label · Location */}
          <span className="inline-flex items-center gap-1.5 truncate sm:hidden">
            <span>{statusConfig.label}</span>
            <span className="text-text-subtle">·</span>
            <span>{opening.location}</span>
          </span>
        </div>
      </div>

      {/* 2. Status Cell (Low box style badge) */}
      <div className="hidden min-w-0 items-center gap-2 sm:flex">
        {opening.status === 'On Hold' ? (
          <div className="flex items-center gap-1.5">
            <Badge variant="warning" className="px-2 py-0.5 text-[11px] font-medium">
              On Hold
            </Badge>
            {onReactivate && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onReactivate(opening.id, opening.title);
                }}
                className="text-text-muted hover:text-text cursor-pointer text-[11px] font-medium opacity-0 transition-opacity group-hover:opacity-100 hover:underline focus:opacity-100"
              >
                Reactivate
              </button>
            )}
          </div>
        ) : (
          <Badge variant="default" className="px-2 py-0.5 text-[11px] font-medium">
            {statusConfig.label}
          </Badge>
        )}
      </div>

      {/* 3. Location Cell (Desktop >=1024px only) */}
      <div className="text-text-muted hidden min-w-0 truncate text-[13px] leading-[20px] lg:block">
        {opening.location}
      </div>

      {/* 4. Budget Cell (Desktop >=1024px only) */}
      <div className="text-text-muted hidden min-w-0 truncate font-mono text-[13px] leading-[20px] tabular-nums lg:block">
        {budgetText}
      </div>

      {/* 5. Candidates Cell (Clean pill/count) */}
      <div className="hidden min-w-0 items-center gap-1.5 sm:flex">
        <Users className="text-text-subtle h-3.5 w-3.5 shrink-0 stroke-[1.75]" />
        <span className="text-text text-[13px] leading-[20px] font-medium tabular-nums">
          {candidatesCount}
        </span>
        <span className="text-text-subtle text-[12px] leading-[20px]">
          {candidatesCount === 1 ? 'candidate' : 'candidates'}
        </span>
      </div>

      {/* 6. Chevron Cell */}
      <div className="flex items-center justify-end">
        <ChevronRight className="text-text-subtle h-4 w-4 opacity-40 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
    </Link>
  );
}
