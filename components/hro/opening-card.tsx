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
  MapPin,
  ArrowRight,
  MoreHorizontal,
  Eye,
  Edit,
  ArrowRightCircle,
} from 'lucide-react';
import type { Opening, Candidate } from '@/types/entities';
import type { OpeningStatus } from '@/lib/domain/status-transitions';
import { getNextAllowedOpeningStatuses } from '@/lib/domain/status-transitions';
import { formatCtcRange } from '@/lib/format';
import { cn } from '@/lib/utils';
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
  const minBudget = opening.budgetRange?.min ?? 0;
  const maxBudget = opening.budgetRange?.max ?? 0;
  const minExp = opening.experienceRange?.min ?? 0;
  const maxExp = opening.experienceRange?.max ?? 0;
  const expText = minExp === maxExp ? `${minExp}y exp` : `${minExp}–${maxExp}y exp`;

  const allowedTransitions = onStatusChange ? getNextAllowedOpeningStatuses(opening.status) : [];

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-[10px] border border-border/80 bg-surface-1 p-3.5 shadow-2xs transition-all duration-150',
        'hover:border-border-strong hover:shadow-xs select-none space-y-2.5',
        className
      )}
    >
      {/* 1. Header: Department Avatar + Opening Title & Experience Pill */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full border border-border/70 bg-surface-2 text-accent shadow-2xs">
            <DeptIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-[13.5px] font-bold text-text tracking-tight group-hover:text-accent transition-colors truncate">
              <Link
                href={`/openings/${opening.id}`}
                title={opening.title}
              >
                {opening.title}
              </Link>
            </h4>
            <div className="flex items-center gap-1 text-[11.5px] text-text-muted truncate mt-0.5 font-normal">
              <MapPin className="h-3 w-3 shrink-0 text-text-subtle stroke-[1.75]" />
              <span className="truncate">{opening.location}</span>
            </div>
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

      {/* 2. Middle Body: Department */}
      <div className="flex items-center gap-1.5 min-w-0 text-[12px] font-medium text-text-muted">
        <Building2 className="h-3 w-3 shrink-0 text-text-subtle/80 stroke-[1.75]" />
        <span className="truncate">{opening.department}</span>
      </div>

      {/* 3. Employment Type & Compensation (Clean unboxed row) */}
      <div className="flex items-center justify-between gap-3 text-[12px] pt-0.5 pb-0.5">
        <span className="font-medium text-text truncate min-w-0">
          {opening.employmentType}
          {opening.headcount ? ` · ${opening.headcount} ${opening.headcount === 1 ? 'opening' : 'openings'}` : ''}
        </span>
        <span className="font-semibold text-text-muted shrink-0 text-[12px] tabular-nums">
          {formatCtcRange(minBudget, maxBudget)}
        </span>
      </div>

      {/* 4. Bottom Meta: AI Match & Opening Status Badge */}
      <div className="border-t border-border/60 pt-2 flex items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 min-w-0">
          {onAiMatch ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAiMatch(opening);
              }}
              className="inline-flex items-center justify-center rounded-[6px] bg-accent/10 hover:bg-accent/20 text-accent px-2.5 py-1 text-[11px] font-semibold transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs"
              title="Scan & Match Candidates with AI"
            >
              AI Match
            </button>
          ) : (
            <span className="text-text-subtle text-[11px] font-medium">Requisition</span>
          )}
        </div>

        <div className="flex items-center shrink-0">
          {opening.status === 'On Hold' ? (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 select-none">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>On Hold</span>
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
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Open</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span>{opening.status}</span>
            </span>
          )}
        </div>
      </div>

      {/* 5. Footer: View Requisition with Arrow */}
      <Link
        href={`/openings/${opening.id}`}
        className="pt-2 border-t border-border/50 flex items-center justify-between text-[11.5px] text-text-subtle group-hover:text-accent transition-colors cursor-pointer"
      >
        <span className="font-medium">{actionText || 'View Requisition Details'}</span>
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
