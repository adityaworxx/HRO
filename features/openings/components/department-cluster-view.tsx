'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Users,
  MoreHorizontal,
  Eye,
  Edit,
  ArrowRightCircle,
  Briefcase,
  Layers,
  Code2,
  Palette,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Flame,
} from 'lucide-react';
import type { Opening, Candidate } from '@/types/entities';
import type { OpeningStatus } from '@/lib/domain/status-transitions';
import { getNextAllowedOpeningStatuses } from '@/lib/domain/status-transitions';
import { formatCtcRange } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export interface DepartmentClusterViewProps {
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

interface PipelineBreakdown {
  total: number;
  sourced: number;
  review: number;
  interview: number;
  offer: number;
  joined: number;
  highestStageLevel: number; // 0 = none, 1 = sourced, 2 = review, 3 = interview, 4 = offer/joined
  statusHeadline: string;
  statusBadgeVariant: 'default' | 'accent' | 'warning' | 'success';
}

function computeOpeningPipeline(openingId: string, candidates: Candidate[]): PipelineBreakdown {
  const openingCandidates = candidates.filter((c) => c.openingId === openingId);
  const total = openingCandidates.length;

  const sourced = openingCandidates.filter((c) => c.stage === 'Sourced').length;
  const review = openingCandidates.filter((c) => c.stage === 'Shared with Manager').length;
  const interview = openingCandidates.filter((c) => c.stage === 'Interview').length;
  const offer = openingCandidates.filter(
    (c) => c.stage === 'Selected' || c.stage === 'Offer Sent'
  ).length;
  const joined = openingCandidates.filter((c) => c.stage === 'Joined').length;

  let highestStageLevel = 0;
  let statusHeadline = 'No candidates in pipeline';
  let statusBadgeVariant: PipelineBreakdown['statusBadgeVariant'] = 'default';

  if (joined > 0) {
    highestStageLevel = 4;
    statusHeadline = `${joined} candidate${joined > 1 ? 's' : ''} joined`;
    statusBadgeVariant = 'success';
  } else if (offer > 0) {
    highestStageLevel = 4;
    statusHeadline = `${offer} offer${offer > 1 ? 's' : ''} pending decision`;
    statusBadgeVariant = 'accent';
  } else if (interview > 0) {
    highestStageLevel = 3;
    statusHeadline = `${interview} in active interviews`;
    statusBadgeVariant = 'accent';
  } else if (review > 0) {
    highestStageLevel = 2;
    statusHeadline = `${review} waiting manager review`;
    statusBadgeVariant = 'warning';
  } else if (sourced > 0) {
    highestStageLevel = 1;
    statusHeadline = `${sourced} sourced candidates`;
    statusBadgeVariant = 'default';
  }

  return {
    total,
    sourced,
    review,
    interview,
    offer,
    joined,
    highestStageLevel,
    statusHeadline,
    statusBadgeVariant,
  };
}

export function DepartmentClusterView({
  openings,
  candidates,
  onStatusChange,
}: DepartmentClusterViewProps) {
  // Group openings by department
  const departmentGroups = React.useMemo(() => {
    const map = new Map<string, Opening[]>();
    for (const opening of openings) {
      const dept = opening.department || 'General';
      if (!map.has(dept)) {
        map.set(dept, []);
      }
      map.get(dept)!.push(opening);
    }
    return Array.from(map.entries());
  }, [openings]);

  if (openings.length === 0) {
    return (
      <div className="border-border bg-surface-1 rounded-[12px] border p-12 text-center select-none">
        <Briefcase className="text-text-subtle mx-auto mb-3 h-9 w-9 opacity-60" />
        <h3 className="text-text text-[15px] font-semibold">No job openings found</h3>
        <p className="text-text-muted mx-auto mt-1 max-w-sm text-[13px]">
          Try adjusting your search criteria or status filter to see other requisitions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {departmentGroups.map(([department, deptOpenings]) => {
        const DeptIcon = DEPARTMENT_ICONS[department] || Building2;

        // Department-level metrics
        const totalHeadcount = deptOpenings.reduce((sum, o) => sum + (o.headcount || 1), 0);
        const deptOpeningIds = new Set(deptOpenings.map((o) => o.id));
        const deptCandidates = candidates.filter((c) => deptOpeningIds.has(c.openingId));
        const deptInInterview = deptCandidates.filter((c) => c.stage === 'Interview').length;
        const deptInOffer = deptCandidates.filter(
          (c) => c.stage === 'Selected' || c.stage === 'Offer Sent' || c.stage === 'Joined'
        ).length;

        return (
          <section key={department} className="space-y-3">
            {/* Department Cluster Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2.5">
                <div className="bg-surface-2 text-text border-border/80 flex h-8 w-8 items-center justify-center rounded-[8px] border">
                  <DeptIcon className="h-4 w-4 stroke-[2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-text text-[16px] font-semibold tracking-[-0.01em]">
                      {department}
                    </h2>
                    <span className="text-text-muted text-[12px] font-medium">
                      ({deptOpenings.length} {deptOpenings.length === 1 ? 'role' : 'roles'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Department Aggregated Telemetry */}
              <div className="text-text-muted flex items-center gap-3 text-[12px] font-medium select-none">
                <span className="hidden items-center gap-1.5 sm:inline-flex">
                  <span className="text-text font-sans font-semibold tabular-nums">
                    {totalHeadcount}
                  </span>{' '}
                  headcount target
                </span>
                <span className="text-text-subtle hidden sm:inline">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-text font-sans font-semibold tabular-nums">
                    {deptCandidates.length}
                  </span>{' '}
                  active candidates
                </span>
                {deptInOffer > 0 && (
                  <>
                    <span className="text-text-subtle">·</span>
                    <span className="text-accent inline-flex items-center gap-1 font-semibold">
                      <span>{deptInOffer} in offer stage</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Openings Rows within the Department Cluster */}
            <div className="space-y-2.5">
              {deptOpenings.map((opening) => {
                const pipeline = computeOpeningPipeline(opening.id, candidates);
                const allowedTransitions = getNextAllowedOpeningStatuses(opening.status);
                const isUrgent = opening.urgency === 'High';

                return (
                  <div
                    key={opening.id}
                    className={cn(
                      'group border-border/80 bg-surface-1 hover:border-border-strong hover:bg-surface-2/30 relative rounded-[10px] border p-4 shadow-2xs transition-all duration-140'
                    )}
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                      {/* Left: Role Info & Metadata */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/openings/${opening.id}`}
                            className="text-text hover:text-text text-[14.5px] font-semibold tracking-tight transition-colors"
                          >
                            {opening.title}
                          </Link>

                          {isUrgent && (
                            <span className="border-border/80 bg-surface-2 text-text inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-0.5 text-[10.5px] font-medium select-none">
                              <Flame className="h-3 w-3" />
                              <span>Urgent</span>
                            </span>
                          )}

                          <span className="text-text-muted bg-surface-2 border-border/60 rounded-[4px] border px-1.5 py-0.5 font-sans text-[11px] font-medium tabular-nums select-none">
                            {opening.headcount} {opening.headcount > 1 ? 'positions' : 'position'}
                          </span>
                        </div>

                        {/* Location, Type, Budget, Experience */}
                        <div className="text-text-muted flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px]">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="text-text-subtle h-3 w-3 shrink-0" />
                            <span className="truncate">{opening.location}</span>
                          </span>
                          <span className="text-text-subtle">·</span>
                          <span>{opening.employmentType}</span>
                          <span className="text-text-subtle">·</span>
                          <span className="text-text font-sans tabular-nums">
                            {formatCtcRange(opening.budgetRange.min, opening.budgetRange.max)}
                          </span>
                          <span className="text-text-subtle">·</span>
                          <span className="text-text font-bold">
                            {opening.experienceRange.min}–{opening.experienceRange.max} yrs exp
                          </span>
                        </div>

                        {/* Must-have skills micro-pills */}
                        {opening.mustHaveSkills && opening.mustHaveSkills.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            {opening.mustHaveSkills.slice(0, 4).map((skill) => (
                              <span
                                key={skill}
                                className="bg-surface-2 text-text-subtle border-border/50 rounded-[4px] border px-1.5 py-0.5 text-[10.5px] font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {opening.mustHaveSkills.length > 4 && (
                              <span className="text-text-subtle text-[10px]">
                                +{opening.mustHaveSkills.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Middle: Hiring Pipeline Progress Tracker */}
                      <div className="border-border/60 shrink-0 space-y-1.5 border-t pt-3 lg:w-[320px] lg:border-t-0 lg:pt-0">
                        <div className="flex items-center justify-between text-[11.5px]">
                          <span className="text-text-muted flex items-center gap-1.5 font-medium">
                            <span>Pipeline Pulse</span>
                            <span className="text-text font-sans font-semibold tabular-nums">
                              ({pipeline.total})
                            </span>
                          </span>
                          <span
                            className={cn(
                              'text-[11px] font-medium tracking-tight',
                              pipeline.statusBadgeVariant === 'accent' &&
                                'text-accent font-semibold',
                              pipeline.statusBadgeVariant === 'success' &&
                                'text-success font-semibold',
                              pipeline.statusBadgeVariant === 'warning' &&
                                'text-warning font-semibold',
                              pipeline.statusBadgeVariant === 'default' && 'text-text-subtle'
                            )}
                          >
                            {pipeline.statusHeadline}
                          </span>
                        </div>

                        {/* 4-Stage Segmented Progress Bar */}
                        <div className="grid grid-cols-4 gap-1 select-none">
                          {/* Segment 1: Sourced */}
                          <div
                            className={cn(
                              'h-1.5 rounded-full transition-colors',
                              pipeline.highestStageLevel >= 1
                                ? 'bg-accent/80'
                                : 'bg-surface-3 border-border/60 border'
                            )}
                            title={`Sourced: ${pipeline.sourced}`}
                          />
                          {/* Segment 2: Review */}
                          <div
                            className={cn(
                              'h-1.5 rounded-full transition-colors',
                              pipeline.highestStageLevel >= 2
                                ? 'bg-accent/80'
                                : 'bg-surface-3 border-border/60 border'
                            )}
                            title={`In Review: ${pipeline.review}`}
                          />
                          {/* Segment 3: Interview */}
                          <div
                            className={cn(
                              'h-1.5 rounded-full transition-colors',
                              pipeline.highestStageLevel >= 3
                                ? 'bg-accent'
                                : 'bg-surface-3 border-border/60 border'
                            )}
                            title={`Interviews: ${pipeline.interview}`}
                          />
                          {/* Segment 4: Offer/Hired */}
                          <div
                            className={cn(
                              'h-1.5 rounded-full transition-colors',
                              pipeline.highestStageLevel >= 4
                                ? 'bg-success'
                                : 'bg-surface-3 border-border/60 border'
                            )}
                            title={`Offers/Hired: ${pipeline.offer + pipeline.joined}`}
                          />
                        </div>

                        {/* Stage Breakdown Counters */}
                        <div className="text-text-subtle grid grid-cols-4 pt-0.5 text-center font-sans text-[10px] tabular-nums select-none">
                          <span title="Sourced candidates">{pipeline.sourced} src</span>
                          <span title="Under manager review">{pipeline.review} rev</span>
                          <span title="In active interviews">{pipeline.interview} int</span>
                          <span title="Offer or hired">{pipeline.offer + pipeline.joined} off</span>
                        </div>
                      </div>

                      {/* Right: Status Pill & Quick Action Menu */}
                      <div className="border-border/60 flex shrink-0 items-center justify-between gap-2.5 border-t pt-2 lg:justify-end lg:border-t-0 lg:pt-0">
                        {/* Status Badge */}
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-medium select-none',
                            opening.status === 'Open' &&
                              'bg-surface-2 text-text border-border border',
                            opening.status === 'Sourcing' &&
                              'bg-accent-subtle text-accent border-accent/20 border',
                            opening.status === 'Interviewing' &&
                              'bg-accent-subtle text-accent border-accent/30 border font-semibold',
                            opening.status === 'Offer Stage' &&
                              'bg-success/10 text-success border-success/20 border font-semibold',
                            opening.status === 'On Hold' &&
                              'bg-warning/10 text-warning border-warning/20 border',
                            opening.status === 'Closed' &&
                              'bg-surface-3 text-text-subtle border-border border'
                          )}
                        >
                          <span>{opening.status}</span>
                        </span>

                        {/* View Requisition Shortcut Button */}
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="text-text-muted hover:text-text hidden h-7 px-2 text-[12px] sm:inline-flex"
                        >
                          <Link href={`/openings/${opening.id}`}>
                            <span>Open</span>
                            <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                          </Link>
                        </Button>

                        {/* Quick Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-text-muted hover:text-text h-7 w-7"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/openings/${opening.id}`}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                <span>View Requisition</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/openings/${opening.id}/edit`}
                                className="flex items-center gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                <span>Edit Requisition</span>
                              </Link>
                            </DropdownMenuItem>

                            {allowedTransitions.length > 0 && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-text-subtle text-[11px]">
                                  Update Status
                                </DropdownMenuLabel>
                                {allowedTransitions.map((nextStatus) => (
                                  <DropdownMenuItem
                                    key={nextStatus}
                                    onClick={() =>
                                      onStatusChange(opening.id, nextStatus, opening.title)
                                    }
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
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
