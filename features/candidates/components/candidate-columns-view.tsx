'use client';

import * as React from 'react';
import {
  Building2,
  Code2,
  Palette,
  BarChart3,
  Layers,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Candidate, Opening } from '@/types/entities';
import { cn } from '@/lib/utils';
import { CandidateCard } from '@/components/hro/candidate-card';

export interface CandidateColumnsViewProps {
  candidates: Candidate[];
  openings: Opening[];
  onSelectCandidate: (candidate: Candidate) => void;
}

// Department Icon Map matching Openings view
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
  candidates: Candidate[];
}

const CANDIDATES_PER_PAGE = 4;

export function CandidateColumnsView({
  candidates,
  openings,
  onSelectCandidate,
}: CandidateColumnsViewProps) {
  // Per-column pagination state: { [departmentId]: pageNumber }
  const [pageByDept, setPageByDept] = React.useState<Record<string, number>>({});

  // Reset pagination when the candidates list or external filter changes
  React.useEffect(() => {
    setPageByDept({});
  }, [candidates]);

  // Map openingId to Opening for O(1) lookups
  const openingsMap = React.useMemo(() => {
    return new Map<string, Opening>(openings.map((o) => [o.id, o]));
  }, [openings]);

  // Build department columns based on candidate openings
  const columns = React.useMemo<ColumnDef[]>(() => {
    // Collect all departments from openings or candidates
    const deptSet = new Set<string>();

    for (const c of candidates) {
      const opening = openingsMap.get(c.openingId);
      deptSet.add(opening?.department || 'General');
    }

    // Ensure common departments appear in consistent order if present
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
        candidates: candidates.filter((c) => {
          const opening = openingsMap.get(c.openingId);
          return (opening?.department || 'General') === dept;
        }),
      };
    });
  }, [candidates, openingsMap]);

  if (candidates.length === 0) {
    return (
      <div className="rounded-[12px] border border-border bg-surface-1 p-12 text-center select-none">
        <Users className="h-8 w-8 text-text-subtle mx-auto mb-2 opacity-60" />
        <h3 className="text-[14px] font-semibold text-text">No candidates found</h3>
        <p className="text-[12px] text-text-muted mt-0.5 max-w-xs mx-auto">
          Try clearing your search query or stage filter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Horizontal Multi-Column Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 items-start pt-1 scrollbar-thin">
        {columns.map((column) => {
          const ColIcon = column.icon;

          // Per-column pagination calculations
          const totalCandidates = column.candidates.length;
          const totalPages = Math.ceil(totalCandidates / CANDIDATES_PER_PAGE);
          const currentPage = pageByDept[column.id] || 1;
          const validPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
          const startIndex = (validPage - 1) * CANDIDATES_PER_PAGE;
          const visibleCandidates = column.candidates.slice(
            startIndex,
            startIndex + CANDIDATES_PER_PAGE
          );

          return (
            <div
              key={column.id}
              className="w-[340px] xs:w-[360px] sm:w-[380px] max-w-[calc(100vw-2.5rem)] shrink-0 flex flex-col justify-between rounded-[12px] bg-surface-2/30 border border-border/70 p-3.5 space-y-2.5"
            >
              <div className="space-y-2.5">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2 min-w-0">
                    {ColIcon ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-surface-3/80 text-text-muted border border-border/60 shrink-0">
                        <ColIcon className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                    )}
                    <h3 className="text-[13.5px] font-semibold text-text truncate">
                      {column.title}
                    </h3>
                  </div>

                  <span className="font-mono text-[11px] font-semibold text-text-muted bg-surface-3/90 border border-border/60 px-2 py-0.5 rounded-full shrink-0 tabular-nums">
                    {totalCandidates}
                  </span>
                </div>

                {/* Column Cards Container: Exact same format, text, colour & text size as Pipeline Card */}
                <div className="space-y-2 min-h-[100px]">
                  {column.candidates.length === 0 ? (
                    <div className="rounded-[8px] border border-dashed border-border/60 p-5 text-center select-none">
                      <p className="text-[11.5px] text-text-subtle">No candidates</p>
                    </div>
                  ) : (
                    visibleCandidates.map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        onClick={() => onSelectCandidate(candidate)}
                        showReorderIcon={false}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Per-Column Pagination Footer when more than 4 candidates */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-border/50 text-[11.5px] select-none">
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

                  <span className="font-mono text-text-muted text-[11px] font-medium">
                    {startIndex + 1}–{Math.min(startIndex + CANDIDATES_PER_PAGE, totalCandidates)} of {totalCandidates}
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
