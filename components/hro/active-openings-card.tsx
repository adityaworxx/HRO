'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ChevronLeft,
  Briefcase,
  MapPin,
  Users,
  Building2,
  Code2,
  Palette,
  BarChart3,
  Layers,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCtcRange } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import type { Opening, Candidate } from '@/types/entities';

const DEPARTMENT_ICONS: Record<string, React.ElementType> = {
  Engineering: Code2,
  Design: Palette,
  'Data & Analytics': BarChart3,
  Product: Layers,
  'Human Resources': Users,
  Operations: Building2,
};

const PREFERRED_DEPARTMENT_ORDER = [
  'Engineering',
  'Product',
  'Design',
  'Data & Analytics',
  'Operations',
  'Human Resources',
];

const DEFAULT_CARDS_PER_COLUMN = 3;

export interface ActiveOpeningsCardProps {
  openings: Opening[];
  candidates?: Candidate[];
  title?: string;
  subtitle?: string | null;
  viewAllHref?: string;
  isLoading?: boolean;
  className?: string;
  onReactivate?: (id: string, title: string) => void;
  pageSize?: number;
}

interface OpeningDashboardCardProps {
  opening: Opening;
  candidatesCount: number;
  onReactivate?: (id: string, title: string) => void;
}

function OpeningDashboardCard({
  opening,
  candidatesCount,
  onReactivate,
}: OpeningDashboardCardProps) {
  const minBudget = opening.budgetRange?.min ?? 0;
  const maxBudget = opening.budgetRange?.max ?? 0;
  const minExp = opening.experienceRange?.min ?? 0;
  const maxExp = opening.experienceRange?.max ?? 0;
  const expText = minExp === maxExp ? `${minExp}y exp` : `${minExp}–${maxExp}y exp`;

  return (
    <Link
      href={`/openings/${opening.id}`}
      className={cn(
        'group relative flex flex-col justify-between rounded-[8px] border border-border/80 bg-surface-1 p-3 shadow-2xs transition-all duration-150',
        'hover:border-border-strong hover:shadow-xs select-none cursor-pointer'
      )}
    >
      {/* 1. Header: Position Title + Boxless Experience (Right-aligned, clean, no leading dot) */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4
          className="text-[13.5px] font-semibold text-text tracking-tight leading-snug group-hover:text-accent transition-colors min-w-0 flex-1 truncate"
          title={opening.title}
        >
          {opening.title}
        </h4>
        <span className="text-[11.5px] font-semibold text-text tabular-nums select-none shrink-0">
          {expText}
        </span>
      </div>

      {/* 2. Middle Body: Location & Headcount/Employment Type */}
      <div className="space-y-1 my-0.5">
        <div className="flex items-center gap-1.5 min-w-0 text-[12px] font-semibold text-text leading-tight">
          <MapPin className="h-3 w-3 shrink-0 text-text-subtle stroke-[1.75]" />
          <span className="truncate">{opening.location}</span>
        </div>

        <div className="flex items-center gap-1.5 min-w-0 text-[11.5px] font-normal text-text-muted leading-tight">
          <Briefcase className="h-3 w-3 shrink-0 text-text-subtle/80 stroke-[1.75]" />
          <span className="truncate">
            {opening.employmentType}
            {opening.headcount ? ` · ${opening.headcount} ${opening.headcount === 1 ? 'opening' : 'openings'}` : ''}
          </span>
        </div>
      </div>

      {/* 3. Footer: Budget + Applicants Count + Status Indicator */}
      <div className="border-t border-border/60 mt-2.5 pt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11.5px] font-semibold text-text tabular-nums select-none">
            {formatCtcRange(minBudget, maxBudget)}
          </span>
          <span className="text-text-subtle/50 text-[10px]">·</span>
          <span
            className="text-[11px] text-text-muted flex items-center gap-1 tabular-nums font-mono"
            title={`${candidatesCount} candidates in pipeline`}
          >
            <Users className="h-3 w-3 text-text-subtle stroke-[1.75]" />
            <span>{candidatesCount}</span>
          </span>
        </div>

        <div className="flex items-center shrink-0">
          {opening.status === 'On Hold' ? (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 select-none">
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
                  className="text-[11px] font-medium text-accent hover:underline cursor-pointer"
                >
                  Reactivate
                </button>
              )}
            </div>
          ) : opening.urgency === 'High' ? (
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
    </Link>
  );
}

export function ActiveOpeningsCard({
  openings,
  candidates = [],
  title = 'Active Openings',
  subtitle,
  viewAllHref = '/openings',
  isLoading = false,
  className,
  onReactivate,
  pageSize = DEFAULT_CARDS_PER_COLUMN,
}: ActiveOpeningsCardProps) {
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  // Per-column pagination state: { [department]: pageNumber }
  const [pageByDept, setPageByDept] = React.useState<Record<string, number>>({});

  // Reset pagination when openings count or search query changes
  React.useEffect(() => {
    setPageByDept({});
  }, [openings.length, searchQuery]);

  // Filter openings by search query
  const filteredOpenings = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return openings;
    return openings.filter((o) => {
      return (
        o.title.toLowerCase().includes(q) ||
        o.department.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q) ||
        (o.mustHaveSkills && o.mustHaveSkills.some((s) => s.toLowerCase().includes(q)))
      );
    });
  }, [openings, searchQuery]);

  // Group openings by department
  const departmentGroups = React.useMemo(() => {
    const map = new Map<string, Opening[]>();
    for (const o of filteredOpenings) {
      const dept = o.department || 'General';
      if (!map.has(dept)) {
        map.set(dept, []);
      }
      map.get(dept)!.push(o);
    }

    const sortedDepts = Array.from(map.keys()).sort((a, b) => {
      const indexA = PREFERRED_DEPARTMENT_ORDER.indexOf(a);
      const indexB = PREFERRED_DEPARTMENT_ORDER.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    return sortedDepts.map((dept) => {
      const Icon = DEPARTMENT_ICONS[dept] || Building2;
      return {
        id: dept,
        title: dept,
        icon: Icon,
        openings: map.get(dept) || [],
      };
    });
  }, [filteredOpenings]);

  return (
    <div
      className={cn(
        'border border-border bg-surface-1 rounded-[12px] p-5 flex flex-col',
        className
      )}
    >
      {/* 1. Header: Title + Count Badge + Search + View all link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <h2 className="text-text text-[16px] leading-[24px] font-semibold tracking-[-0.01em]">
            {title}
          </h2>
          {openings.length > 0 && (
            <span className="font-mono text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              {openings.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-[155px]">
            <Search className="text-text-subtle pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles..."
              aria-label="Search active openings"
              className="bg-surface-2/40 border-border/70 hover:border-border focus:border-border-strong h-7.5 w-full pl-8 pr-2 text-[12px] rounded-[6px]"
            />
          </div>

          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-1 text-[13px] leading-[20px] font-medium text-text-muted hover:text-text transition-colors shrink-0"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {subtitle && (
        <p className="text-text-muted mt-1 text-[13px] leading-[20px]">{subtitle}</p>
      )}

      {/* 2. Content */}
      <div className="pt-4">
        {isLoading ? (
          <div className="flex gap-3.5 overflow-x-auto pb-2 items-start scrollbar-thin">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 min-w-[270px] sm:min-w-[290px] max-w-[360px] rounded-[12px] bg-surface-2/30 border border-border/70 border-t-2 border-t-accent p-3 space-y-2.5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <Skeleton className="h-5 w-28 rounded-[4px]" />
                  <Skeleton className="h-4 w-6 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-[96px] rounded-[8px]" />
                  <Skeleton className="h-[96px] rounded-[8px]" />
                </div>
              </div>
            ))}
          </div>
        ) : openings.length === 0 ? (
          <div className="py-12 text-center select-none">
            <p className="text-[13px] leading-[20px] text-text-muted">No active openings.</p>
          </div>
        ) : departmentGroups.length === 0 ? (
          <div className="py-12 text-center select-none">
            <p className="text-[13px] leading-[20px] text-text-muted">No roles match &quot;{searchQuery}&quot;</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[12px] text-accent hover:underline mt-1 cursor-pointer"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="flex gap-3.5 overflow-x-auto pb-2 items-start scrollbar-thin">
            {departmentGroups.map((group) => {
              const GroupIcon = group.icon;
              const totalInDept = group.openings.length;
              const deptPage = pageByDept[group.id] || 1;
              const deptTotalPages = Math.ceil(totalInDept / pageSize);
              const validDeptPage = Math.min(Math.max(1, deptPage), Math.max(1, deptTotalPages));
              const startIndex = (validDeptPage - 1) * pageSize;
              const visibleInDept = group.openings.slice(startIndex, startIndex + pageSize);

              return (
                <div
                  key={group.id}
                  className="flex-1 min-w-[270px] sm:min-w-[290px] max-w-[360px] shrink-0 flex flex-col justify-between rounded-[12px] bg-surface-2/30 border border-border/70 border-t-2 border-t-accent p-3 space-y-2.5"
                >
                  <div className="space-y-2.5">
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-accent/15 text-accent shrink-0">
                          <GroupIcon className="h-3.5 w-3.5" />
                        </div>
                        <h3 className="text-[13px] font-semibold text-text truncate">
                          {group.title}
                        </h3>
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
                        {totalInDept}
                      </span>
                    </div>

                    {/* Opening Cards */}
                    <div className="space-y-2">
                      {visibleInDept.map((opening) => {
                        const openingCandidates = candidates.filter(
                          (c) => c.openingId === opening.id
                        );
                        return (
                          <OpeningDashboardCard
                            key={opening.id}
                            opening={opening}
                            candidatesCount={openingCandidates.length}
                            onReactivate={onReactivate}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Per-Column Pagination Footer when more than pageSize openings */}
                  {deptTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11.5px] select-none">
                      <button
                        type="button"
                        disabled={validDeptPage <= 1}
                        onClick={() =>
                          setPageByDept((prev) => ({
                            ...prev,
                            [group.id]: Math.max(1, validDeptPage - 1),
                          }))
                        }
                        className="h-6 w-6 inline-flex items-center justify-center rounded-[5px] border border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title="Previous page"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>

                      <span className="font-mono text-text-subtle text-[11px]">
                        {validDeptPage} of {deptTotalPages}
                      </span>

                      <button
                        type="button"
                        disabled={validDeptPage >= deptTotalPages}
                        onClick={() =>
                          setPageByDept((prev) => ({
                            ...prev,
                            [group.id]: Math.min(deptTotalPages, validDeptPage + 1),
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
        )}
      </div>
    </div>
  );
}
