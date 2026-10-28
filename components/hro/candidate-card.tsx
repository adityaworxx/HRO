'use client';

import * as React from 'react';
import type { Candidate } from '@/types/entities';
import { cn } from '@/lib/utils';
import { Building2, Clock, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ReorderIcon } from './reorder-icon';
import { SourceBadge } from './source-badge';
import { CompanyLogo } from './company-logo';
import { CandidateAvatar } from './candidate-avatar';
import { useOpenings } from '@/features/openings/hooks';
import { formatCtc, formatRoleTitle } from '@/lib/format';

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

  const rawOpeningTitle = openingTitle || openings.find((o) => o.id === candidate.openingId)?.title;
  const targetOpeningTitle = rawOpeningTitle ? formatRoleTitle(rawOpeningTitle) : undefined;

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
        'group border-border/70 bg-surface-1 relative flex flex-col justify-between rounded-[12px] border p-3.5 transition-colors duration-150',
        'hover:border-border-strong focus-visible:ring-border-strong space-y-2.5 select-none focus-visible:ring-1 focus-visible:outline-none',
        showReorderIcon ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
        isDragging &&
          'border-border-strong ring-border-strong bg-surface-2 z-50 scale-[1.01] ring-1',
        className
      )}
    >
      {/* 1. Top Header: Avatar + Candidate Name & AI Tag + Experience Pill (+ optional drag handle) */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <CandidateAvatar name={candidate.name} size="md" />
          <div className="min-w-0 flex-1">
            <h4 className="text-text truncate text-[14px] font-semibold tracking-[-0.015em] transition-colors">
              {candidate.name}
            </h4>
            <p className="text-text-muted mt-0.5 truncate text-[12px] font-normal">
              <span>{candidate.currentRole}</span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {candidate.hrNotes?.includes('[AI Match:') && (
            <span
              className="text-text shrink-0 text-[11px] font-medium select-none"
              title="Screened & matched by AI Talent Scout"
            >
              AI Fit
            </span>
          )}
          <span className="text-text-muted shrink-0 text-[11.5px] font-medium tabular-nums select-none">
            {candidate.experienceYears}y exp
          </span>
          {showReorderIcon && <ReorderIcon isActive={isDragging} />}
        </div>
      </div>

      {/* 2. Middle Body: Real Company Logo & Name */}
      <div className="text-text flex min-w-0 items-center gap-2 text-[12.5px] font-medium">
        <CompanyLogo
          company={candidate.currentCompany}
          className="h-4.5 w-4.5 rounded-[4px] shadow-2xs"
        />
        <span className="truncate">{candidate.currentCompany}</span>
      </div>

      {/* 3. Requisition & Expected CTC */}
      {targetOpeningTitle && (
        <div className="flex items-center justify-between gap-3 pt-0.5 pb-0.5 text-[12px]">
          <span className="text-text min-w-0 truncate font-medium">{targetOpeningTitle}</span>
          <span className="text-text shrink-0 font-sans text-[12px] font-semibold tabular-nums">
            {formatCtc(candidate.expectedCtc)}
          </span>
        </div>
      )}

      {/* 4. Bottom Meta: Source & Notice Period */}
      <div className="border-border/40 flex items-center justify-between gap-2 border-t pt-2.5 text-[11px]">
        <SourceBadge source={candidate.source} variant="plain" />

        <div className="flex shrink-0 items-center">
          {isImmediate ? (
            <span className="text-text text-[11px] font-medium select-none">Immediate</span>
          ) : (
            <span className="text-text-muted inline-flex items-center gap-1.5 text-[11px] font-medium select-none">
              <Clock className="text-text-subtle h-3 w-3 stroke-[1.75]" />
              <span>{candidate.noticePeriod}</span>
            </span>
          )}
        </div>
      </div>

      {/* 5. Footer: Custom Actions OR Contextual Action Hint with Arrow */}
      {actions ? (
        <div
          className="border-border/40 flex items-center gap-2 border-t pt-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      ) : (
        <div className="border-border/40 text-text-muted group-hover:text-text flex items-center justify-between border-t pt-2.5 text-[11.5px] transition-colors">
          <span className="font-medium">{actionText || 'Review Dossier & Decide'}</span>
          <ArrowRight className="text-text-muted group-hover:text-text h-3.5 w-3.5 opacity-60 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
        </div>
      )}
    </div>
  );
}
