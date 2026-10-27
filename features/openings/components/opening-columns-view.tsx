'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  MoreHorizontal,
  Eye,
  Edit,
  ArrowRightCircle,
  Briefcase,
  Code2,
  Palette,
  BarChart3,
  Layers,
  Users,
  ChevronLeft,
  ChevronRight,
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

export interface OpeningColumnsViewProps {
  openings: Opening[];
  candidates: Candidate[];
  onStatusChange: (id: string, newStatus: OpeningStatus, title: string) => void;
}

// Department Icon Map
const DEPARTMENT_ICONS: Record<string, React.ElementType> = {
  Engineering: Code2,
  Design: Palette,
  'Data & Analytics': BarChart3,
  Product: Layers,
  'Human Resources': Users,
  Operations: Building2,
};

interface ColumnDef {
  id: string;
  title: string;
  icon?: React.ElementType;
  dotColor: string;
  openings: Opening[];
}

/**
 * Opening Card - Direct sibling styling to CandidateCard
 * Identical typography, boxless experience/budget, sharp hierarchy, and hover effects.
 */
function MinimalOpeningCard({
  opening,
  candidates,
  onStatusChange,
}: {
  opening: Opening;
  candidates: Candidate[];
  onStatusChange: (id: string, newStatus: OpeningStatus, title: string) => void;
}) {
  const allowedTransitions = getNextAllowedOpeningStatuses(opening.status);

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-[8px] border border-border/80 bg-surface-1 p-3 shadow-2xs transition-all duration-150',
        'hover:border-border-strong hover:shadow-xs select-none'
      )}
    >
      {/* 1. Top Header: Position Title (Primary Hero) + Boxless Experience & Actions */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <Link
          href={`/openings/${opening.id}`}
          className="text-[13.5px] font-semibold text-text tracking-tight leading-snug group-hover:text-accent transition-colors min-w-0 flex-1 truncate"
          title={opening.title}
        >
          {opening.title}
        </Link>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11.5px] font-semibold text-text tabular-nums select-none">
            {opening.experienceRange.min === opening.experienceRange.max
              ? `${opening.experienceRange.min}y exp`
              : `${opening.experienceRange.min}-${opening.experienceRange.max}y exp`}
          </span>

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
              {allowedTransitions.length > 0 && (
                <>
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
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 2. Middle Body: Career Identity (Location & Headcount/Type) */}
      <div className="space-y-1 my-0.5">
        <div className="flex items-center gap-1.5 min-w-0 text-[12px] font-semibold text-text leading-tight">
          <MapPin className="h-3 w-3 shrink-0 text-text-subtle stroke-[1.75]" />
          <span className="truncate">{opening.location}</span>
        </div>

        <div className="flex items-center gap-1.5 min-w-0 text-[11.5px] font-normal text-text-muted leading-tight">
          <Briefcase className="h-3 w-3 shrink-0 text-text-subtle/80 stroke-[1.75]" />
          <span className="truncate">{opening.employmentType}</span>
        </div>
      </div>

      {/* 3. Bottom Footer: Clean Borderless Budget + Status & Applicants */}
      <div className="border-t border-border/60 mt-2.5 pt-2 flex items-center justify-between gap-2">
        <span className="text-[11.5px] font-semibold text-text tabular-nums select-none">
          {formatCtcRange(opening.budgetRange.min, opening.budgetRange.max)}
        </span>

        <div className="flex items-center shrink-0">
          {opening.urgency === 'High' ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Urgent</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-muted select-none">
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  opening.status === 'Open'
                    ? 'bg-emerald-500'
                    : opening.status === 'Closed' || opening.status === 'Filled'
                      ? 'bg-text-subtle'
                      : 'bg-accent'
                )}
              />
              <span>{opening.status}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const OPENINGS_PER_PAGE = 4;

export function OpeningColumnsView({
  openings,
  candidates,
  onStatusChange,
}: OpeningColumnsViewProps) {
  // Per-column pagination state: { [departmentId]: pageNumber }
  const [pageByDept, setPageByDept] = React.useState<Record<string, number>>({});

  // Reset pagination when the openings list or external filter changes
  React.useEffect(() => {
    setPageByDept({});
  }, [openings]);

  // Build department columns
  const columns = React.useMemo<ColumnDef[]>(() => {
    const deptSet = new Set(openings.map((o) => o.department || 'General'));
    const preferredOrder = [
      'Engineering',
      'Product',
      'Design',
      'Data & Analytics',
      'Operations',
      'Human Resources',
    ];

    const sortedDepts = Array.from(deptSet).sort((a, b) => {
      const indexA = preferredOrder.indexOf(a);
      const indexB = preferredOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    const deptColors = ['bg-indigo-500', 'bg-accent', 'bg-emerald-500', 'bg-cyan-500', 'bg-amber-500'];

    return sortedDepts.map((dept, index) => {
      const Icon = DEPARTMENT_ICONS[dept] || Building2;
      return {
        id: dept,
        title: dept,
        icon: Icon,
        dotColor: deptColors[index % deptColors.length] ?? 'bg-indigo-500',
        openings: openings.filter((o) => (o.department || 'General') === dept),
      };
    });
  }, [openings]);

  if (openings.length === 0) {
    return (
      <div className="rounded-[12px] border border-border bg-surface-1 p-12 text-center select-none">
        <Briefcase className="h-8 w-8 text-text-subtle mx-auto mb-2 opacity-60" />
        <h3 className="text-[14px] font-semibold text-text">No job openings found</h3>
        <p className="text-[12px] text-text-muted mt-0.5 max-w-xs mx-auto">
          Try clearing your search or status filter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Horizontal Multi-Column Board - Exact same responsive breadth as Candidates & Pipeline */}
      <div className="flex gap-4 overflow-x-auto pb-6 items-start pt-1 scrollbar-thin">
        {columns.map((column) => {
          const ColIcon = column.icon;

          // Per-column pagination calculations
          const totalOpenings = column.openings.length;
          const totalPages = Math.ceil(totalOpenings / OPENINGS_PER_PAGE);
          const currentPage = pageByDept[column.id] || 1;
          const validPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
          const startIndex = (validPage - 1) * OPENINGS_PER_PAGE;
          const visibleOpenings = column.openings.slice(
            startIndex,
            startIndex + OPENINGS_PER_PAGE
          );

          return (
            <div
              key={column.id}
              className="w-[280px] xs:w-[300px] sm:w-[320px] max-w-[calc(100vw-2.5rem)] shrink-0 flex flex-col justify-between rounded-[12px] bg-surface-2/30 border border-border/70 border-t-2 border-t-accent p-3 space-y-2.5"
            >
              <div className="space-y-2.5">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2 min-w-0">
                    {ColIcon ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-accent/15 text-accent shrink-0">
                        <ColIcon className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                    )}
                    <h3 className="text-[13.5px] font-semibold text-text truncate">
                      {column.title}
                    </h3>
                  </div>

                  <span className="font-mono text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
                    {totalOpenings}
                  </span>
                </div>

                {/* Column Cards Container: Identical layout and spacing to Candidate Cards */}
                <div className="space-y-2 min-h-[100px]">
                  {column.openings.length === 0 ? (
                    <div className="rounded-[8px] border border-dashed border-border/60 p-5 text-center select-none">
                      <p className="text-[11.5px] text-text-subtle">No roles</p>
                    </div>
                  ) : (
                    visibleOpenings.map((opening) => (
                      <MinimalOpeningCard
                        key={opening.id}
                        opening={opening}
                        candidates={candidates}
                        onStatusChange={onStatusChange}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Per-Column Pagination Footer when more than 4 openings */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11.5px] select-none">
                  <button
                    type="button"
                    disabled={validPage <= 1}
                    onClick={() =>
                      setPageByDept((prev) => ({
                        ...prev,
                        [column.id]: Math.max(1, validPage - 1),
                      }))
                    }
                    className="h-6 w-6 inline-flex items-center justify-center rounded-[5px] border border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Previous page"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>

                  <span className="font-mono text-text-subtle text-[11px]">
                    {startIndex + 1}–{Math.min(startIndex + OPENINGS_PER_PAGE, totalOpenings)} of {totalOpenings}
                  </span>

                  <button
                    type="button"
                    disabled={validPage >= totalPages}
                    onClick={() =>
                      setPageByDept((prev) => ({
                        ...prev,
                        [column.id]: Math.min(totalPages, validPage + 1),
                      }))
                    }
                    className="h-6 w-6 inline-flex items-center justify-center rounded-[5px] border border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Next page"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
