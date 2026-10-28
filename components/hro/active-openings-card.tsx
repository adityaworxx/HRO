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
  onAiMatch?: (opening: Opening) => void;
  pageSize?: number;
}

import { OpeningCard } from './opening-card';

export function ActiveOpeningsCard({
  openings,
  candidates = [],
  title = 'Active Openings',
  subtitle,
  viewAllHref = '/openings',
  isLoading = false,
  className,
  onReactivate,
  onAiMatch,
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
        'border-border bg-surface-1 flex flex-col rounded-[12px] border p-5',
        className
      )}
    >
      {/* 1. Header: Title + Count Badge + Search + View all link */}
      <div className="border-border/60 flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <h2 className="text-text text-[16px] leading-[24px] font-semibold tracking-[-0.01em]">
            {title}
          </h2>
          {openings.length > 0 && (
            <span className="text-text-muted bg-surface-3 border-border/60 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums">
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
              className="bg-surface-2/40 border-border/70 hover:border-border focus:border-border-strong h-7.5 w-full rounded-[6px] pr-2 pl-8 text-[12px]"
            />
          </div>

          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-text-muted hover:text-text inline-flex shrink-0 items-center gap-1 text-[13px] leading-[20px] font-medium transition-colors"
            >
              <span>View all</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {subtitle && <p className="text-text-muted mt-1 text-[13px] leading-[20px]">{subtitle}</p>}

      {/* 2. Content */}
      <div className="pt-4">
        {isLoading ? (
          <div className="flex scrollbar-thin items-start gap-3.5 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface-2/30 border-border/70 border-t-accent max-w-[360px] min-w-[270px] flex-1 space-y-2.5 rounded-[12px] border border-t-2 p-3 sm:min-w-[290px]"
              >
                <div className="border-border/60 flex items-center justify-between border-b pb-2">
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
            <p className="text-text-muted text-[13px] leading-[20px]">No active openings.</p>
          </div>
        ) : departmentGroups.length === 0 ? (
          <div className="py-12 text-center select-none">
            <p className="text-text-muted text-[13px] leading-[20px]">
              No roles match &quot;{searchQuery}&quot;
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-accent mt-1 cursor-pointer text-[12px] hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="flex scrollbar-thin items-start gap-3.5 overflow-x-auto pb-2">
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
                  className="bg-surface-2/30 border-border/70 flex max-w-[430px] min-w-[340px] flex-1 shrink-0 flex-col justify-between space-y-2.5 rounded-[12px] border p-3.5 sm:min-w-[370px]"
                >
                  <div className="space-y-2.5">
                    {/* Column Header */}
                    <div className="border-border/60 flex items-center justify-between border-b pb-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="bg-surface-3/80 text-text-muted border-border/60 flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border">
                          <GroupIcon className="h-3.5 w-3.5" />
                        </div>
                        <h3 className="text-text truncate text-[13px] font-semibold">
                          {group.title}
                        </h3>
                      </div>
                      <span className="text-text-muted bg-surface-3/90 border-border/60 shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums">
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
                          <OpeningCard
                            key={opening.id}
                            opening={opening}
                            candidatesCount={openingCandidates.length}
                            onReactivate={onReactivate}
                            onAiMatch={onAiMatch}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Per-Column Pagination Footer when more than pageSize openings */}
                  {deptTotalPages > 1 && (
                    <div className="border-border/50 mt-1 flex items-center justify-between border-t pt-2.5 text-[11.5px] select-none">
                      <button
                        type="button"
                        disabled={validDeptPage <= 1}
                        onClick={() =>
                          setPageByDept((prev) => ({
                            ...prev,
                            [group.id]: Math.max(1, validDeptPage - 1),
                          }))
                        }
                        className="border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-[5px] border shadow-2xs transition-colors disabled:cursor-not-allowed disabled:opacity-25"
                        title="Previous page"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>

                      <span className="text-text-muted text-[11px] font-medium tabular-nums">
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
                        className="border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-[5px] border shadow-2xs transition-colors disabled:cursor-not-allowed disabled:opacity-25"
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
