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
}

export function CandidateCard({
  candidate,
  onClick,
  className,
  isDragging = false,
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
          <span className="text-[10px] font-medium text-text-subtle bg-surface-2 border border-border/70 rounded-[4px] px-1.5 py-0.5">
            {candidate.source}
          </span>
          <ReorderIcon isActive={isDragging} />
        </div>
      </div>

      <div className="space-y-1 text-[12px]">
        <div className="text-text-muted flex items-center gap-1.5 truncate font-normal">
          <Briefcase className="text-text-subtle/70 h-3 w-3 shrink-0" />
          <span className="truncate">{candidate.currentRole}</span>
        </div>
        <div className="text-text-subtle flex items-center gap-1.5 truncate text-[11px] font-normal">
          <Building2 className="text-text-subtle/70 h-3 w-3 shrink-0" />
          <span className="truncate">{candidate.currentCompany}</span>
        </div>
      </div>

      <div className="border-border/60 text-text-subtle mt-1 flex items-center justify-between border-t pt-2 text-[11px] font-normal">
        <span>{candidate.experienceYears}y exp</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-text-subtle/70" />
          <span>{candidate.noticePeriod}</span>
        </span>
      </div>
    </div>
  );
}
