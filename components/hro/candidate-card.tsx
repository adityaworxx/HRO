import * as React from 'react';
import type { Candidate } from '@/types/entities';
import { cn } from '@/lib/utils';
import { Building2, Briefcase, Clock } from 'lucide-react';

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
        'group border border-border/80 bg-surface-1 hover:border-border-strong flex cursor-pointer flex-col gap-2 rounded-[8px] p-3 shadow-2xs transition-colors duration-[140ms] focus-visible:outline-none select-none',
        isDragging && 'border-accent/80 opacity-50 shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-text text-[13px] font-semibold tracking-tight transition-colors inline-block max-w-[170px] truncate">
          {candidate.name}
        </h4>
        <span className="shrink-0 text-[10px] font-medium text-text-subtle bg-surface-2 border border-border/70 rounded-[4px] px-1.5 py-0.5">
          {candidate.source}
        </span>
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
