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
 * Ultra-Minimalist Opening Card
 * Clean, calm, zero nested boxes, pure typography and whitespace.
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
  const candidateCount = React.useMemo(
    () => candidates.filter((c) => c.openingId === opening.id).length,
    [candidates, opening.id]
  );

  const allowedTransitions = getNextAllowedOpeningStatuses(opening.status);

  return (
    <div
      className={cn(
        'group relative rounded-[10px] border border-border/70 bg-surface-1 p-3.5 transition-all duration-140',
        'hover:border-border-strong hover:bg-surface-2/20 flex flex-col justify-between gap-3'
      )}
    >
      {/* 1. Status Indicator & Context Menu */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11.5px] select-none">
          <span className="font-medium text-text-muted">{opening.status}</span>
          {opening.urgency === 'High' && (
            <span className="text-[11px] font-semibold text-accent">· Urgent</span>
          )}
        </div>

        {/* Minimal Action Trigger */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="h-6 w-6 inline-flex items-center justify-center text-text-subtle hover:text-text rounded transition-colors opacity-60 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
              <span className="sr-only">Actions</span>
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

      {/* 2. Position Title & Location */}
      <div className="space-y-0.5">
        <Link
          href={`/openings/${opening.id}`}
          className="text-[14px] font-semibold text-text hover:text-accent tracking-tight transition-colors line-clamp-1 block"
          title={opening.title}
        >
          {opening.title}
        </Link>
        <p className="text-[12px] text-text-muted truncate">
          {opening.location} · {opening.headcount} {opening.headcount > 1 ? 'roles' : 'role'}
        </p>
      </div>

      {/* 3. Subtle Footer Line: Budget & Candidate Count */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11.5px]">
        <span className="font-mono text-text font-medium">
          {formatCtcRange(opening.budgetRange.min, opening.budgetRange.max)}
        </span>
        <span className="font-mono text-text-subtle">
          {candidateCount} {candidateCount === 1 ? 'candidate' : 'candidates'}
        </span>
      </div>
    </div>
  );
}

export function OpeningColumnsView({
  openings,
  candidates,
  onStatusChange,
}: OpeningColumnsViewProps) {
  // Build department columns
  const columns = React.useMemo<ColumnDef[]>(() => {
    const depts = Array.from(new Set(openings.map((o) => o.department || 'General')));
    const deptColors = ['bg-indigo-500', 'bg-accent', 'bg-emerald-500', 'bg-cyan-500', 'bg-amber-500'];

    return depts.map((dept, index) => {
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
      {/* Horizontal Multi-Column Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 items-start pt-1 scrollbar-thin">
        {columns.map((column) => {
          const ColIcon = column.icon;

          return (
            <div
              key={column.id}
              className="w-[300px] sm:w-[320px] shrink-0 flex flex-col rounded-[12px] bg-surface-2/30 border border-border/70 border-t-2 border-t-accent p-3 space-y-2.5"
            >
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
                  {column.openings.length}
                </span>
              </div>

              {/* Minimal Column Cards Container */}
              <div className="space-y-2 min-h-[100px]">
                {column.openings.length === 0 ? (
                  <div className="rounded-[8px] border border-dashed border-border/60 p-5 text-center select-none">
                    <p className="text-[11.5px] text-text-subtle">No roles</p>
                  </div>
                ) : (
                  column.openings.map((opening) => (
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
          );
        })}
      </div>
    </div>
  );
}
