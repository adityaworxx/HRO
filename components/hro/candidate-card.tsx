'use client';

import * as React from 'react';
import type { Candidate } from '@/types/entities';
import { cn } from '@/lib/utils';
import { Building2, Clock, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ReorderIcon } from './reorder-icon';
import { SourceBadge } from './source-badge';
import { useOpenings } from '@/features/openings/hooks';
import { formatCtc } from '@/lib/format';

export interface CandidateCardProps {
  candidate: Candidate;
  openingTitle?: string;
  onClick?: () => void;
  className?: string;
  isDragging?: boolean;
  showReorderIcon?: boolean;
  actions?: React.ReactNode;
  actionText?: string;
}

export function CandidateCard({
  candidate,
  openingTitle,
  onClick,
  className,
  isDragging = false,
  showReorderIcon = true,
  actions,
  actionText,
}: CandidateCardProps) {
  const { data: openings = [] } = useOpenings();
  const isImmediate = candidate.noticePeriod?.toLowerCase().includes('immediate');

  const targetOpeningTitle =
    openingTitle || openings.find((o) => o.id === candidate.openingId)?.title;

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
        'group relative flex flex-col justify-between rounded-[10px] border border-border/80 bg-surface-1 p-3.5 shadow-2xs transition-all duration-150',
        'hover:border-border-strong hover:shadow-xs select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent space-y-2.5',
        showReorderIcon ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
        isDragging && 'border-border-strong shadow-2xl ring-1 ring-border-strong bg-surface-1 scale-[1.02] z-50',
        className
      )}
    >
      {/* 1. Top Header: Avatar + Candidate Name & AI Tag + Experience Pill (+ optional drag handle) */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Avatar className="h-8.5 w-8.5 shrink-0 border border-border/70 bg-surface-2 shadow-2xs">
            <AvatarFallback className="text-[11.5px] font-semibold text-text bg-surface-2 tracking-wide">
              {candidate.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h4 className="text-[13.5px] font-bold text-text tracking-tight group-hover:text-accent transition-colors truncate">
              {candidate.name}
            </h4>
            <p className="text-[11.5px] text-text-muted truncate mt-0.5 font-normal">
              <span>{candidate.currentRole}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {candidate.hrNotes?.includes('[AI Match:') && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent shrink-0 select-none"
              title="Screened & matched by AI Talent Scout"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              AI Fit
            </span>
          )}
          <span className="text-[11.5px] font-medium text-text-muted shrink-0 tabular-nums select-none">
            {candidate.experienceYears}y exp
          </span>
          {showReorderIcon && <ReorderIcon isActive={isDragging} />}
        </div>
      </div>

      {/* 2. Middle Body: Company */}
      <div className="flex items-center gap-1.5 min-w-0 text-[12px] font-medium text-text-muted">
        <Building2 className="h-3 w-3 shrink-0 text-text-subtle/80 stroke-[1.75]" />
        <span className="truncate">{candidate.currentCompany}</span>
      </div>

      {/* 3. Requisition & Expected CTC (Clean unboxed row) */}
      {targetOpeningTitle && (
        <div className="flex items-center justify-between gap-3 text-[12px] pt-0.5 pb-0.5">
          <span className="font-medium text-text truncate min-w-0">
            {targetOpeningTitle}
          </span>
          <span className="font-semibold text-text-muted shrink-0 text-[12px] tabular-nums">
            {formatCtc(candidate.expectedCtc)}
          </span>
        </div>
      )}

      {/* 4. Bottom Meta: Source & Notice Period */}
      <div className="border-t border-border/60 pt-2 flex items-center justify-between gap-2 text-[11px]">
        <SourceBadge source={candidate.source} variant="plain" />

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

      {/* 5. Footer: Custom Actions OR Contextual Action Hint with Arrow */}
      {actions ? (
        <div
          className="border-t border-border/60 pt-2 flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      ) : (
        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11.5px] text-text-subtle group-hover:text-accent transition-colors">
          <span className="font-medium">{actionText || 'Review Dossier & Decide'}</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      )}
    </div>
  );
}
