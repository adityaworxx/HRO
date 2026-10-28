'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { OPENING_STATUS_MAP, type StatusColorToken } from './status-map';
import type { Opening } from '@/types/entities';

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
        'hidden sm:grid h-[34px] items-center px-4 sm:px-5 border-y border-border bg-surface-2/40 text-[11px] font-bold uppercase tracking-wider text-text-muted select-none',
        'grid-cols-[minmax(180px,1.4fr)_minmax(100px,1fr)_minmax(110px,1fr)_24px] lg:grid-cols-[minmax(180px,1.05fr)_minmax(100px,0.95fr)_minmax(130px,1fr)_minmax(110px,1fr)_minmax(120px,1fr)_24px] gap-3 sm:gap-4',
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
        'group relative grid min-h-[54px] py-3 items-center px-4 sm:px-5 border-b border-border/60 last:border-b-0 transition-colors',
        'hover:bg-surface-2/60 active:bg-surface-3',
        'focus-visible:outline-none focus:outline-none',
        'grid-cols-[minmax(0,1fr)_24px] sm:grid-cols-[minmax(180px,1.4fr)_minmax(100px,1fr)_minmax(110px,1fr)_24px] lg:grid-cols-[minmax(180px,1.05fr)_minmax(100px,0.95fr)_minmax(130px,1fr)_minmax(110px,1fr)_minmax(120px,1fr)_24px] gap-3 sm:gap-4',
        className
      )}
    >
      {/* 1. Opening Cell */}
      <div className="min-w-0 flex flex-col justify-center">
        <span className="inline-block max-w-full truncate text-[14px] leading-[20px] font-medium text-text group-hover:text-text transition-colors">
          {opening.title}
        </span>

        <div className="truncate text-[12px] leading-[18px] text-text-muted mt-0.5">
          {/* Desktop subline (>=1024px): Department only */}
          <span className="hidden lg:inline truncate">{opening.department}</span>

          {/* Responsive subline (<1024px and >=640px): Department · Location · Budget */}
          <span className="hidden sm:inline lg:hidden truncate">
            {opening.department} <span className="text-text-subtle">·</span> {opening.location}{' '}
            <span className="text-text-subtle">·</span>{' '}
            <span className="tabular-nums font-mono">{budgetText}</span>
          </span>

          {/* Mobile subline (<640px): Status label · Location */}
          <span className="inline-flex sm:hidden items-center gap-1.5 truncate">
            <span>{statusConfig.label}</span>
            <span className="text-text-subtle">·</span>
            <span>{opening.location}</span>
          </span>
        </div>
      </div>

      {/* 2. Status Cell (Low box style badge) */}
      <div className="hidden sm:flex items-center gap-2 min-w-0">
        {opening.status === 'On Hold' ? (
          <div className="flex items-center gap-1.5">
            <Badge variant="warning" className="text-[11px] font-medium py-0.5 px-2">
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
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-[11px] text-text-muted hover:text-text hover:underline font-medium cursor-pointer"
              >
                Reactivate
              </button>
            )}
          </div>
        ) : (
          <Badge variant="default" className="text-[11px] font-medium py-0.5 px-2">
            {statusConfig.label}
          </Badge>
        )}
      </div>

      {/* 3. Location Cell (Desktop >=1024px only) */}
      <div className="hidden lg:block min-w-0 truncate text-[13px] leading-[20px] text-text-muted">
        {opening.location}
      </div>

      {/* 4. Budget Cell (Desktop >=1024px only) */}
      <div className="hidden lg:block min-w-0 truncate text-[13px] leading-[20px] text-text-muted font-mono tabular-nums">
        {budgetText}
      </div>

      {/* 5. Candidates Cell (Clean pill/count) */}
      <div className="hidden sm:flex items-center gap-1.5 min-w-0">
        <Users className="h-3.5 w-3.5 text-text-subtle shrink-0 stroke-[1.75]" />
        <span className="text-[13px] leading-[20px] text-text font-medium tabular-nums">
          {candidatesCount}
        </span>
        <span className="text-[12px] leading-[20px] text-text-subtle">
          {candidatesCount === 1 ? 'candidate' : 'candidates'}
        </span>
      </div>

      {/* 6. Chevron Cell */}
      <div className="flex items-center justify-end">
        <ChevronRight className="h-4 w-4 text-text-subtle opacity-40 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
