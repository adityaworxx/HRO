import * as React from 'react';
import type { Candidate } from '@/types/entities';
import { Badge } from '@/components/ui/badge';
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
        'group border-border bg-surface-1 hover:border-border-strong hover:bg-surface-2 focus-visible:ring-accent flex cursor-pointer flex-col gap-2 rounded-[var(--radius-md)] border p-3.5 shadow-none transition-all duration-[150ms] focus-visible:ring-2 focus-visible:outline-none',
        isDragging && 'border-accent rotate-1 opacity-60',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-text group-hover:text-accent text-[14px] font-semibold transition-colors">
          {candidate.name}
        </h4>
        <Badge variant="default" className="shrink-0 text-[11px] font-normal">
          {candidate.source}
        </Badge>
      </div>

      <div className="text-text-muted space-y-1 text-[12px]">
        <div className="flex items-center gap-1.5 truncate">
          <Briefcase className="text-text-subtle h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{candidate.currentRole}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <Building2 className="text-text-subtle h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{candidate.currentCompany}</span>
        </div>
      </div>

      <div className="border-border text-text-subtle mt-1 flex items-center justify-between border-t pt-2 text-[11px]">
        <span>{candidate.experienceYears}y exp</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {candidate.noticePeriod}
        </span>
      </div>
    </div>
  );
}
