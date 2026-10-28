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
            <span className="text-[11px] font-semibold text-text-muted bg-surface-3 border border-border/60 px-2 py-0.5 rounded-full tabular-nums">
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
                  className="flex-1 min-w-[340px] sm:min-w-[370px] max-w-[430px] shrink-0 flex flex-col justify-between rounded-[12px] bg-surface-2/30 border border-border/70 p-3.5 space-y-2.5"
                >
                  <div className="space-y-2.5">
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-surface-3/80 text-text-muted border border-border/60 shrink-0">
                          <GroupIcon className="h-3.5 w-3.5" />
                        </div>
                        <h3 className="text-[13px] font-semibold text-text truncate">
                          {group.title}
                        </h3>
                      </div>
                      <span className="text-[11px] font-semibold text-text-muted bg-surface-3/90 border border-border/60 px-2 py-0.5 rounded-full shrink-0 tabular-nums">
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
                    <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-border/50 text-[11.5px] select-none">
                      <button
                        type="button"
                        disabled={validDeptPage <= 1}
                        onClick={() =>
                          setPageByDept((prev) => ({
                            ...prev,
                            [group.id]: Math.max(1, validDeptPage - 1),
                          }))
                        }
                        className="h-6 w-6 inline-flex items-center justify-center rounded-[5px] border border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
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
                        className="h-6 w-6 inline-flex items-center justify-center rounded-[5px] border border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
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
