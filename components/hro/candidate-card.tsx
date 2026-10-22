import * as React from 'react';
import type { Candidate } from '@/types/entities';
import { cn } from '@/lib/utils';
import { Building2, Briefcase, Clock } from 'lucide-react';
import { ReorderIcon } from './reorder-icon';

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
        'group border border-border/80 bg-surface-1 hover:border-border-strong flex cursor-grab active:cursor-grabbing flex-col gap-2 rounded-[8px] p-3 shadow-2xs transition-colors duration-[140ms] focus-visible:outline-none select-none',
        isDragging && 'border-border-strong shadow-2xl ring-1 ring-border-strong bg-surface-1 scale-[1.02]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-text hover:text-accent text-[13px] font-semibold tracking-tight transition-colors min-w-0 flex-1 truncate cursor-pointer">
          {candidate.name}
        </h4>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10.5px] font-medium text-text-muted bg-surface-2 border border-border rounded-[4px] px-1.5 py-0.5">
            {candidate.source}
          </span>
          {showReorderIcon && <ReorderIcon isActive={isDragging} />}
        </div>
      </div>

      <div className="space-y-1.5 text-[12px]">
        <div className="text-text flex items-center gap-1.5 truncate text-[12.5px] font-semibold">
          <Briefcase className="text-text-muted h-3.5 w-3.5 shrink-0 stroke-[2]" />
          <span className="truncate">{candidate.currentRole}</span>
        </div>
        <div className="text-text flex items-center gap-1.5 truncate text-[12px] font-medium">
          <Building2 className="text-text-muted h-3.5 w-3.5 shrink-0 stroke-[2]" />
          <span className="truncate">{candidate.currentCompany}</span>
        </div>
      </div>

      <div className="border-border/80 mt-1 flex items-center justify-between border-t pt-2 text-[11.5px]">
        <span className="font-bold text-text">{candidate.experienceYears}y exp</span>
        <span className="flex items-center gap-1 font-bold text-text">
          <Clock className="h-3.5 w-3.5 text-text-muted stroke-[2.25]" />
          <span>{candidate.noticePeriod}</span>
        </span>
      </div>
    </div>
  );
}
