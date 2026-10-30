'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  Code2,
  Palette,
  BarChart3,
  Layers,
  Users,
  Briefcase,
  Clock,
  ArrowRight,
  MoreHorizontal,
  Eye,
  Edit,
  ArrowRightCircle,
  Sparkles,
} from 'lucide-react';
import type { Opening } from '@/types/entities';
import type { OpeningStatus } from '@/lib/domain/status-transitions';
import { getNextAllowedOpeningStatuses } from '@/lib/domain/status-transitions';
import { formatCtcRange } from '@/lib/format';
import { cn } from '@/lib/utils';
import { getAvatarColor } from './candidate-avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useUiStore } from '@/lib/store';
import { useCandidates } from '@/features/candidates/hooks';

const DEPARTMENT_ICONS: Record<string, React.ElementType> = {
  Engineering: Code2,
  Design: Palette,
  'Data & Analytics': BarChart3,
  Product: Layers,
  'Human Resources': Users,
  Operations: Building2,
};

export interface OpeningCardProps {
  opening: Opening;
  candidatesCount?: number;
  onStatusChange?: (id: string, newStatus: OpeningStatus, title: string) => void;
  onReactivate?: (id: string, title: string) => void;
  onAiMatch?: (opening: Opening) => void;
  onAiReview?: (opening: Opening) => void;
  className?: string;
  actionText?: string;
}

export function OpeningCard({
  opening,
  candidatesCount = 0,
  onStatusChange,
  onReactivate,
  onAiMatch,
  onAiReview,
  className,
  actionText,
}: OpeningCardProps) {
  const { role } = useUiStore();
  const isManager = role === 'manager';
  const { data: allCandidates = [] } = useCandidates();

  const shortlistedCount = React.useMemo(() => {
    return allCandidates.filter(
      (c) =>
        c.openingId === opening.id &&
        c.stage === 'Shared with Manager' &&
        c.managerDecision === 'Pending'
    ).length;
  }, [allCandidates, opening.id]);

  const interviewCount = React.useMemo(() => {
    return allCandidates.filter(
      (c) =>
        c.openingId === opening.id &&
        (c.stage === 'Interview' ||
          (c.managerDecision === 'Shortlisted' &&
            c.stage !== 'Rejected' &&
            c.stage !== 'Joined'))
    ).length;
  }, [allCandidates, opening.id]);

  const DeptIcon = DEPARTMENT_ICONS[opening.department] || Building2;
  const avatarColor = getAvatarColor(opening.title);
  const minBudget = opening.budgetRange?.min ?? 0;
  const maxBudget = opening.budgetRange?.max ?? 0;
  const minExp = opening.experienceRange?.min ?? 0;
  const maxExp = opening.experienceRange?.max ?? 0;
  const expText = minExp === maxExp ? `${minExp}y exp` : `${minExp}–${maxExp}y exp`;

  const allowedTransitions = onStatusChange ? getNextAllowedOpeningStatuses(opening.status) : [];

  return (
    <div
      className={cn(
        'group border-border/70 bg-surface-1 relative flex flex-col justify-between rounded-[12px] border p-3.5 transition-colors duration-150',
        'hover:border-border-strong space-y-2.5 select-none',
        className
      )}
    >
      {/* 1. Header: Colorful Profile Avatar + Opening Title & Location + Experience Pill */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div
            className={cn(
              'flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full border border-black/5 text-white shadow-2xs select-none dark:border-white/15',
              avatarColor.bg
            )}
          >
            <DeptIcon className="h-4 w-4 stroke-[2] text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-text truncate text-[14px] font-semibold tracking-[-0.015em] transition-colors">
              <Link
                href={`/openings/${opening.id}`}
                title={opening.title}
                className="hover:text-text"
              >
                {opening.title}
              </Link>
            </h4>
            <p className="text-text-muted mt-0.5 truncate text-[12px] font-normal">
              <span>{opening.location}</span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-text-muted shrink-0 text-[11.5px] font-medium tabular-nums select-none">
            {expText}
          </span>

          {allowedTransitions.length > 0 && onStatusChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Opening actions"
                  className="text-text-subtle/60 hover:text-text hover:bg-surface-2 flex shrink-0 cursor-pointer items-center justify-center rounded-[4px] p-0.5 transition-colors focus:outline-none"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/openings/${opening.id}`} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>View Requisition</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/openings/${opening.id}/edit`} className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    <span>Edit Details</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-text-subtle text-[11px]">
                  Move Status
                </DropdownMenuLabel>
                {allowedTransitions.map((nextStatus) => (
                  <DropdownMenuItem
                    key={nextStatus}
                    onClick={() => onStatusChange(opening.id, nextStatus, opening.title)}
                    className="flex items-center gap-2"
                  >
                    <ArrowRightCircle className="text-accent h-3.5 w-3.5" />
                    <span>Move to {nextStatus}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* 2. Middle Body: Employment Type */}
      <div className="text-text flex min-w-0 items-center gap-2 text-[12.5px] font-medium">
        <Briefcase className="text-text-subtle h-4 w-4 stroke-[1.75]" />
        <span className="truncate">{opening.employmentType}</span>
      </div>

      {/* 3. Headcount & Compensation Range */}
      <div className="flex items-center justify-between gap-3 pt-0.5 pb-0.5 text-[12px]">
        <span className="text-text min-w-0 truncate font-medium">
          {opening.headcount
            ? `${opening.headcount} ${opening.headcount === 1 ? 'opening' : 'openings'}`
            : '1 opening'}
        </span>
        <span className="text-text shrink-0 font-sans text-[12px] font-semibold tabular-nums">
          {formatCtcRange(minBudget, maxBudget)}
        </span>
      </div>

      {/* 4. Bottom Meta: Status & AI Match / Urgency */}
      <div className="border-border/40 flex items-center justify-between gap-2 border-t pt-2.5 text-[11px]">
        {opening.status === 'On Hold' ? (
          <div className="flex items-center gap-1.5">
            <span className="text-text text-[11px] font-medium select-none">On Hold</span>
            {onReactivate && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onReactivate(opening.id, opening.title);
                }}
                className="text-text-muted hover:text-text ml-1 cursor-pointer text-[10.5px] font-medium hover:underline"
              >
                Resume
              </button>
            )}
          </div>
        ) : (
          <span className="text-text text-[11px] font-medium select-none">{opening.status}</span>
        )}

        <div className="flex shrink-0 items-center gap-2">
          {isManager ? (
            <>
              {interviewCount > 0 && (
                <Link
                  href={`/interviews?openingId=${opening.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="inline-flex cursor-pointer items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-bold text-amber-800 hover:text-amber-950 dark:text-amber-400 dark:hover:text-amber-300 transition-colors select-none hover:bg-amber-500/10"
                  title={`View ${interviewCount} candidate${interviewCount === 1 ? '' : 's'} in interview stage for ${opening.title}`}
                >
                  <span>Interviews ({interviewCount})</span>
                </Link>
              )}
              <Link
                href={`/shortlist?openingId=${opening.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="inline-flex cursor-pointer items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors select-none hover:bg-emerald-500/10"
                title={`View ${shortlistedCount} candidate${shortlistedCount === 1 ? '' : 's'} shortlisted for ${opening.title}`}
              >
                <span>Shortlisted ({shortlistedCount})</span>
              </Link>
              <Link
                href={`/openings/${opening.id}/ai-review`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAiReview) onAiReview(opening);
                }}
                className="inline-flex cursor-pointer items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-bold text-blue-800 hover:text-blue-950 dark:text-blue-400 dark:hover:text-blue-300 transition-colors select-none hover:bg-blue-500/10"
                title="Run AI Resume Review (Full Page)"
              >
                <span>AI Review</span>
              </Link>
            </>
          ) : (
            <>
              {interviewCount > 0 && (
                <Link
                  href={`/interviews?openingId=${opening.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="inline-flex cursor-pointer items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-bold text-amber-800 hover:text-amber-950 dark:text-amber-400 dark:hover:text-amber-300 transition-colors select-none hover:bg-amber-500/10"
                  title={`View ${interviewCount} candidate${interviewCount === 1 ? '' : 's'} in interview stage for ${opening.title}`}
                >
                  <span>Interviews ({interviewCount})</span>
                </Link>
              )}
              {onAiMatch ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAiMatch(opening);
                  }}
                  className="inline-flex cursor-pointer items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-bold text-blue-800 hover:text-blue-950 dark:text-blue-400 dark:hover:text-blue-300 transition-colors select-none hover:bg-blue-500/10"
                  title="Scan & Match Candidates with AI"
                >
                  <span>AI Match</span>
                </button>
              ) : interviewCount === 0 ? (
                <span className="text-text-muted inline-flex items-center gap-1 text-[11px] font-medium select-none">
                  <Clock className="text-text-subtle h-3 w-3 stroke-[1.75]" />
                  <span>{opening.urgency} Priority</span>
                </span>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* 5. Footer: View Requisition Details Action */}
      <Link
        href={`/openings/${opening.id}`}
        className="border-border/40 text-text-muted group-hover:text-text flex items-center justify-between border-t pt-2.5 text-[11.5px] transition-colors"
      >
        <span className="font-medium">{actionText || 'View Requisition Details'}</span>
        <ArrowRight className="text-text-muted group-hover:text-text h-3.5 w-3.5 opacity-60 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
      </Link>
    </div>
  );
}
