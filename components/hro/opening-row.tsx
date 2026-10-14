'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OPENING_STATUS_MAP, type StatusColorToken } from './status-map';
import type { Opening } from '@/types/entities';

export interface OpeningRowProps {
  opening: Opening;
  candidatesCount?: number;
  stageProgress?: number; // 0 to 4 filled segments
  className?: string;
  onReactivate?: (id: string, title: string) => void;
}

export function OpeningHeaderRow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'hidden sm:grid h-[32px] items-center px-5 border-b border-border text-[12px] leading-[16px] text-text-subtle font-normal select-none',
        'grid-cols-[minmax(0,1fr)_140px_130px_24px] lg:grid-cols-[minmax(240px,2fr)_140px_120px_120px_120px_24px] gap-4',
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
  stageProgress = 1,
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
        'group relative grid min-h-[56px] h-[56px] items-center px-5 border-b border-border last:border-b-0 transition-colors',
        'hover:bg-surface-2 active:bg-surface-3',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
        'grid-cols-[minmax(0,1fr)_24px] sm:grid-cols-[minmax(0,1fr)_140px_130px_24px] lg:grid-cols-[minmax(240px,2fr)_140px_120px_120px_120px_24px] gap-4',
        className
      )}
    >
      {/* 1. Opening Cell */}
      <div className="min-w-0 flex flex-col justify-center">
        <span className="truncate text-[14px] leading-[20px] font-medium text-text">
          {opening.title}
        </span>

        <div className="truncate text-[13px] leading-[20px] text-text-muted">
          {/* Desktop subline (>=1024px): Department only */}
          <span className="hidden lg:inline truncate">{opening.department}</span>

          {/* Responsive subline (<1024px and >=640px): Department · Location · Budget */}
          <span className="hidden sm:inline lg:hidden truncate">
            {opening.department} <span className="text-text-subtle">·</span> {opening.location}{' '}
            <span className="text-text-subtle">·</span>{' '}
            <span className="tabular-nums">{budgetText}</span>
          </span>

          {/* Mobile subline (<640px): Status label · Location */}
          <span className="inline-flex sm:hidden items-center gap-1.5 truncate">
            <span>{statusConfig.label}</span>
            <span className="text-text-subtle">·</span>
            <span>{opening.location}</span>
          </span>
        </div>
      </div>

      {/* 2. Status Cell (Hidden on mobile <640px where it stacks under title) */}
      <div className="hidden sm:flex items-center gap-2 min-w-0">
        <span className="whitespace-nowrap text-[13px] leading-[20px] text-text-muted">
          {statusConfig.label}
        </span>
        {opening.status === 'On Hold' && onReactivate && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReactivate(opening.id, opening.title);
            }}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity ml-1 text-[12px] text-accent hover:underline font-medium"
          >
            Reactivate
          </button>
        )}
      </div>

      {/* 3. Location Cell (Desktop >=1024px only) */}
      <div className="hidden lg:block min-w-0 truncate text-[13px] leading-[20px] text-text-muted">
        {opening.location}
      </div>

      {/* 4. Budget Cell (Desktop >=1024px only) */}
      <div className="hidden lg:block min-w-0 truncate text-[13px] leading-[20px] text-text-muted tabular-nums">
        {budgetText}
      </div>

      {/* 5. Candidates Cell (Hidden on mobile <640px) */}
      <div className="hidden sm:flex items-center gap-2.5 min-w-0">
        <span className="whitespace-nowrap text-[13px] leading-[20px] text-text-muted tabular-nums">
          {candidatesCount} shared
        </span>
        <div
          className="flex w-[48px] h-[4px] gap-[2px] shrink-0 items-center"
          aria-hidden="true"
        >
          {[0, 1, 2, 3].map((idx) => (
            <span
              key={idx}
              className={cn(
                'h-full flex-1 rounded-[1px]',
                idx < stageProgress ? 'bg-text-muted' : 'bg-surface-3'
              )}
            />
          ))}
        </div>
      </div>

      {/* 6. Chevron Cell */}
      <div className="flex items-center justify-end">
        <ChevronRight className="h-4 w-4 text-text-subtle opacity-50 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  );
}
