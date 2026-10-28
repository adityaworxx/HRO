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
  Sparkles,
  ArrowRight,
  MoreHorizontal,
  Eye,
  Edit,
  ArrowRightCircle,
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
  className?: string;
  actionText?: string;
}

export function OpeningCard({
  opening,
  candidatesCount = 0,
  onStatusChange,
  onReactivate,
  onAiMatch,
  className,
  actionText,
}: OpeningCardProps) {
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
        'group relative flex flex-col justify-between rounded-[12px] border border-border/70 bg-surface-1 p-3.5 transition-colors duration-150',
        'hover:border-border-strong select-none space-y-2.5',
        className
      )}
    >
      {/* 1. Header: Colorful Profile Avatar + Opening Title & Location + Experience Pill */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className={cn(
              'flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full text-white shadow-2xs select-none border border-black/5 dark:border-white/15',
              avatarColor.bg
            )}
          >
            <DeptIcon className="h-4 w-4 text-white stroke-[2]" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-[14px] font-semibold text-text tracking-[-0.015em] transition-colors truncate">
              <Link
                href={`/openings/${opening.id}`}
                title={opening.title}
                className="hover:text-text"
              >
                {opening.title}
              </Link>
            </h4>
            <p className="text-[12px] text-text-muted truncate mt-0.5 font-normal">
              <span>{opening.location}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11.5px] font-medium text-text-muted shrink-0 tabular-nums select-none">
            {expText}
          </span>

          {allowedTransitions.length > 0 && onStatusChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Opening actions"
                  className="cursor-pointer text-text-subtle/60 hover:text-text transition-colors p-0.5 rounded-[4px] hover:bg-surface-2 focus:outline-none flex items-center justify-center shrink-0"
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
      <div className="flex items-center gap-2 min-w-0 text-[12.5px] font-medium text-text">
        <Briefcase className="h-4 w-4 text-text-subtle stroke-[1.75]" />
        <span className="truncate">{opening.employmentType}</span>
      </div>

      {/* 3. Headcount & Compensation Range */}
      <div className="flex items-center justify-between gap-3 text-[12px] pt-0.5 pb-0.5">
        <span className="font-medium text-text truncate min-w-0">
          {opening.headcount ? `${opening.headcount} ${opening.headcount === 1 ? 'opening' : 'openings'}` : '1 opening'}
        </span>
        <span className="font-semibold text-text shrink-0 text-[12px] tabular-nums font-mono">
          {formatCtcRange(minBudget, maxBudget)}
        </span>
      </div>

      {/* 4. Bottom Meta: Status & AI Match / Urgency */}
      <div className="border-t border-border/40 pt-2.5 flex items-center justify-between gap-2 text-[11px]">
        {opening.status === 'On Hold' ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 select-none">
              On Hold
            </span>
            {onReactivate && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onReactivate(opening.id, opening.title);
                }}
                className="ml-1 text-[10.5px] font-medium text-accent hover:underline cursor-pointer"
              >
                Resume
              </button>
            )}
          </div>
        ) : opening.status === 'Open' ? (
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 select-none">
            Open
          </span>
        ) : (
          <span className="text-[11px] font-medium text-accent select-none">
            {opening.status}
          </span>
        )}

        <div className="flex items-center shrink-0">
          {onAiMatch ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAiMatch(opening);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline cursor-pointer select-none"
              title="Scan & Match Candidates with AI"
            >
              <Sparkles className="h-3 w-3 text-accent shrink-0" />
              <span>AI Match</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted select-none">
              <Clock className="h-3 w-3 text-text-subtle stroke-[1.75]" />
              <span>{opening.urgency} Priority</span>
            </span>
          )}
        </div>
      </div>

      {/* 5. Footer: View Requisition Details Action */}
      <Link
        href={`/openings/${opening.id}`}
        className="pt-2.5 border-t border-border/40 flex items-center justify-between text-[11.5px] text-text-muted group-hover:text-text transition-colors"
      >
        <span className="font-medium">{actionText || 'View Requisition Details'}</span>
        <ArrowRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-text-muted group-hover:text-text" />
      </Link>
    </div>
  );
}
