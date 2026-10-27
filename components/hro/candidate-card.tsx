import * as React from 'react';
import type { Candidate } from '@/types/entities';
import { cn } from '@/lib/utils';
import { Building2, Briefcase, Clock } from 'lucide-react';
import { ReorderIcon } from './reorder-icon';
import { SourceBadge } from './source-badge';

export interface CandidateCardProps {
  candidate: Candidate;
  onClick?: () => void;
  className?: string;
  isDragging?: boolean;
  showReorderIcon?: boolean;
}

export function CandidateCard({
  candidate,
  onClick,
  className,
  isDragging = false,
  showReorderIcon = true,
}: CandidateCardProps) {
  const isImmediate = candidate.noticePeriod?.toLowerCase().includes('immediate');

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        'group relative flex flex-col justify-between rounded-[8px] border border-border/80 bg-surface-1 p-3 shadow-2xs transition-all duration-150',
        'hover:border-border-strong hover:shadow-xs cursor-grab active:cursor-grabbing select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
        isDragging && 'border-border-strong shadow-2xl ring-1 ring-border-strong bg-surface-1 scale-[1.02] z-50',
        className
      )}
    >
      {/* 1. Top Header: Candidate Name (Primary Hero) + Clean Experience (Boxless) */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4 className="text-[13.5px] font-semibold text-text tracking-tight leading-snug group-hover:text-accent transition-colors min-w-0 flex-1 truncate">
          {candidate.name}
        </h4>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11.5px] font-semibold text-text tabular-nums select-none">
            {candidate.experienceYears}y exp
          </span>
          {showReorderIcon && <ReorderIcon isActive={isDragging} />}
        </div>
      </div>

      {/* 2. Middle Body: Career Identity (Role & Company) */}
      <div className="space-y-1 my-0.5">
        <div className="flex items-center gap-1.5 min-w-0 text-[12px] font-semibold text-text leading-tight">
          <Briefcase className="h-3 w-3 shrink-0 text-text-subtle stroke-[1.75]" />
          <span className="truncate">{candidate.currentRole}</span>
        </div>

        <div className="flex items-center gap-1.5 min-w-0 text-[11.5px] font-normal text-text-muted leading-tight">
          <Building2 className="h-3 w-3 shrink-0 text-text-subtle/80 stroke-[1.75]" />
          <span className="truncate">{candidate.currentCompany}</span>
        </div>
      </div>

      {/* 3. Bottom Footer: Clean Borderless Source + Availability */}
      <div className="border-t border-border/60 mt-2.5 pt-2 flex items-center justify-between gap-2">
        {/* Source Badge without outer box */}
        <SourceBadge source={candidate.source} variant="plain" />

        {/* Notice Period */}
        <div className="flex items-center shrink-0">
          {isImmediate ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Immediate</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted select-none">
              <Clock className="h-3 w-3 text-text-subtle stroke-[1.75]" />
              <span>{candidate.noticePeriod}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
