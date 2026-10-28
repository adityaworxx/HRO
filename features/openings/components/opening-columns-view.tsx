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
  Sparkles,
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
              className="w-[340px] xs:w-[360px] sm:w-[380px] max-w-[calc(100vw-2.5rem)] shrink-0 flex flex-col justify-between rounded-[12px] bg-surface-2/30 border border-border/70 border-t-2 border-t-accent p-3.5 space-y-2.5"
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
