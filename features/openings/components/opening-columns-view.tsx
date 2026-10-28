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
  onAiMatch?: (opening: Opening) => void;
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

import { OpeningCard } from '@/components/hro/opening-card';

const OPENINGS_PER_PAGE = 4;

export function OpeningColumnsView({
  openings,
  candidates,
  onStatusChange,
  onAiMatch,
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

    const deptColors = [
      'bg-indigo-500',
      'bg-accent',
      'bg-emerald-500',
      'bg-cyan-500',
      'bg-amber-500',
    ];

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
      <div className="border-border bg-surface-1 rounded-[12px] border p-12 text-center select-none">
        <Briefcase className="text-text-subtle mx-auto mb-2 h-8 w-8 opacity-60" />
        <h3 className="text-text text-[14px] font-semibold">No job openings found</h3>
        <p className="text-text-muted mx-auto mt-0.5 max-w-xs text-[12px]">
          Try clearing your search or status filter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Horizontal Multi-Column Board - Exact same responsive breadth as Candidates & Pipeline */}
      <div className="flex scrollbar-thin items-start gap-4 overflow-x-auto pt-1 pb-6">
        {columns.map((column) => {
          const ColIcon = column.icon;

          // Per-column pagination calculations
          const totalOpenings = column.openings.length;
          const totalPages = Math.ceil(totalOpenings / OPENINGS_PER_PAGE);
          const currentPage = pageByDept[column.id] || 1;
          const validPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
          const startIndex = (validPage - 1) * OPENINGS_PER_PAGE;
          const visibleOpenings = column.openings.slice(startIndex, startIndex + OPENINGS_PER_PAGE);

          return (
            <div
              key={column.id}
              className="xs:w-[360px] bg-surface-2/30 border-border/70 flex w-[340px] max-w-[calc(100vw-2.5rem)] shrink-0 flex-col justify-between space-y-2.5 rounded-[12px] border p-3.5 sm:w-[380px]"
            >
              <div className="space-y-2.5">
                {/* Column Header */}
                <div className="border-border/60 flex items-center justify-between border-b pb-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {ColIcon ? (
                      <div className="bg-surface-3/80 text-text-muted border-border/60 flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border">
                        <ColIcon className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <span className="bg-accent h-2 w-2 shrink-0 rounded-full" />
                    )}
                    <h3 className="text-text truncate text-[13.5px] font-semibold">
                      {column.title}
                    </h3>
                  </div>

                  <span className="text-text-muted bg-surface-3/90 border-border/60 shrink-0 rounded-full border px-2 py-0.5 font-sans text-[11px] font-semibold tabular-nums">
                    {totalOpenings}
                  </span>
                </div>

                {/* Column Cards Container: Identical layout and spacing to Candidate Cards */}
                <div className="min-h-[100px] space-y-2">
                  {column.openings.length === 0 ? (
                    <div className="border-border/60 rounded-[8px] border border-dashed p-5 text-center select-none">
                      <p className="text-text-subtle text-[11.5px]">No roles</p>
                    </div>
                  ) : (
                    visibleOpenings.map((opening) => {
                      const openingCandidates = candidates.filter(
                        (c) => c.openingId === opening.id
                      );
                      return (
                        <OpeningCard
                          key={opening.id}
                          opening={opening}
                          candidatesCount={openingCandidates.length}
                          onStatusChange={onStatusChange}
                          onAiMatch={onAiMatch}
                        />
                      );
                    })
                  )}
                </div>
              </div>

              {/* Per-Column Pagination Footer when more than 4 openings */}
              {totalPages > 1 && (
                <div className="border-border/50 mt-1 flex items-center justify-between border-t pt-2.5 text-[11.5px] select-none">
                  <button
                    type="button"
                    disabled={validPage <= 1}
                    onClick={() =>
                      setPageByDept((prev) => ({
                        ...prev,
                        [column.id]: Math.max(1, validPage - 1),
                      }))
                    }
                    className="border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-[5px] border shadow-2xs transition-colors disabled:cursor-not-allowed disabled:opacity-25"
                    title="Previous page"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>

                  <span className="text-text-muted font-sans text-[11px] font-medium">
                    {validPage} of {totalPages}
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
    </div>
  );
}
