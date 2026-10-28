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
        'group relative flex flex-col justify-between rounded-[12px] border border-border/70 bg-surface-1 p-3.5 transition-colors duration-150',
        'hover:border-border-strong select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-strong space-y-2.5',
        showReorderIcon ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
        isDragging && 'border-border-strong ring-1 ring-border-strong bg-surface-2 scale-[1.01] z-50',
        className
      )}
    >
      {/* 1. Top Header: Avatar + Candidate Name & AI Tag + Experience Pill (+ optional drag handle) */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <CandidateAvatar name={candidate.name} size="md" />
          <div className="min-w-0 flex-1">
            <h4 className="text-[14px] font-semibold text-text tracking-[-0.015em] transition-colors truncate">
              {candidate.name}
            </h4>
            <p className="text-[12px] text-text-muted truncate mt-0.5 font-normal">
              <span>{candidate.currentRole}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {candidate.hrNotes?.includes('[AI Match:') && (
            <span
              className="text-[11px] font-medium text-text shrink-0 select-none"
              title="Screened & matched by AI Talent Scout"
            >
              AI Fit
            </span>
          )}
          <span className="text-[11.5px] font-medium text-text-muted shrink-0 tabular-nums select-none">
            {candidate.experienceYears}y exp
          </span>
          {showReorderIcon && <ReorderIcon isActive={isDragging} />}
        </div>
      </div>

      {/* 2. Middle Body: Real Company Logo & Name */}
      <div className="flex items-center gap-2 min-w-0 text-[12.5px] font-medium text-text">
        <CompanyLogo company={candidate.currentCompany} className="h-4.5 w-4.5 rounded-[4px] shadow-2xs" />
        <span className="truncate">{candidate.currentCompany}</span>
      </div>

      {/* 3. Requisition & Expected CTC */}
      {targetOpeningTitle && (
        <div className="flex items-center justify-between gap-3 text-[12px] pt-0.5 pb-0.5">
          <span className="font-medium text-text truncate min-w-0">
            {targetOpeningTitle}
          </span>
          <span className="font-semibold text-text shrink-0 text-[12px] tabular-nums font-sans">
            {formatCtc(candidate.expectedCtc)}
          </span>
        </div>
      )}

      {/* 4. Bottom Meta: Source & Notice Period */}
      <div className="border-t border-border/40 pt-2.5 flex items-center justify-between gap-2 text-[11px]">
        <SourceBadge source={candidate.source} variant="plain" />

        <div className="flex items-center shrink-0">
          {isImmediate ? (
            <span className="text-[11px] font-medium text-text select-none">
              Immediate
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-muted select-none">
              <Clock className="h-3 w-3 text-text-subtle stroke-[1.75]" />
              <span>{candidate.noticePeriod}</span>
            </span>
          )}
        </div>
      </div>

      {/* 5. Footer: Custom Actions OR Contextual Action Hint with Arrow */}
      {actions ? (
        <div
          className="border-t border-border/40 pt-2.5 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      ) : (
        <div className="pt-2.5 border-t border-border/40 flex items-center justify-between text-[11.5px] text-text-muted group-hover:text-text transition-colors">
          <span className="font-medium">{actionText || 'Review Dossier & Decide'}</span>
          <ArrowRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-text-muted group-hover:text-text" />
        </div>
      )}
    </div>
  );
}
