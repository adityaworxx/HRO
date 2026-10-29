'use client';

import * as React from 'react';
import Link from 'next/link';
import { useOpenings } from '@/features/openings/hooks';
import { useCandidates } from '@/features/candidates/hooks';
import { StatCard } from '@/components/hro/stat-card';
import { StatusBadge } from '@/components/hro/status-badge';
import { MetaSeparator } from '@/components/hro/meta-separator';
import { ActiveOpeningsCard } from '@/components/hro/active-openings-card';
import { CompanyLogo } from '@/components/hro/company-logo';
import {
  AiCandidateMatcherSheet,
  CandidateDetailSheet,
  ManagerAiAnalysisSheet,
} from '@/features/candidates';
import { Skeleton } from '@/components/ui/skeleton';
import type { Candidate, Opening } from '@/types/entities';
import {
  ArrowRight,
  Building2,
  Clock,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  CheckCircle2,
  Code2,
  Palette,
  BarChart3,
  Layers,
  Users,
} from 'lucide-react';
import { VideoCameraIcon } from '@/components/ui/icons';
import { formatCtc, formatInterviewDateTime, formatCtcRange, formatRoleTitle } from '@/lib/format';
import { cn } from '@/lib/utils';
import { matchCandidateToOpening } from '@/lib/ai-matcher';

// Department Icon Map matching Openings & Candidates view
const DEPARTMENT_ICONS: Record<string, React.ElementType> = {
  Engineering: Code2,
  Design: Palette,
  'Data & Analytics': BarChart3,
  Product: Layers,
  'Human Resources': Users,
  Operations: Building2,
};

export function ManagerDashboard() {
  const { data: openings = [], isLoading: loadingOpenings } = useOpenings();
  const { data: candidates = [], isLoading: loadingCandidates } = useCandidates();

  const [aiMatchOpening, setAiMatchOpening] = React.useState<Opening | null>(null);
  const [aiReviewOpening, setAiReviewOpening] = React.useState<Opening | null>(null);
  const [inspectedCandidate, setInspectedCandidate] = React.useState<Candidate | null>(null);
  const [isCandidateSheetOpen, setIsCandidateSheetOpen] = React.useState(false);

  // Map openingId to Opening for O(1) lookups
  const openingsMap = React.useMemo(() => {
    return new Map<string, Opening>(openings.map((o) => [o.id, o]));
  }, [openings]);

  // Active openings
  const activeOpenings = React.useMemo(
    () =>
      openings.filter(
        (o) => o.status === 'Open' || o.status === 'Sourcing' || o.status === 'Interviewing'
      ),
    [openings]
  );

  // Candidates requiring manager review (Shared with Manager stage)
  const pendingReviewCandidates = React.useMemo(
    () =>
      candidates.filter(
        (c) => c.stage === 'Shared with Manager' && c.managerDecision === 'Pending'
      ),
    [candidates]
  );

  // Candidates in technical interview stage
  const interviewCandidates = React.useMemo(
    () => candidates.filter((c) => c.stage === 'Interview'),
    [candidates]
  );

  // Offer / Selected stage candidates
  const offerCandidates = React.useMemo(
    () => candidates.filter((c) => c.stage === 'Selected' || c.stage === 'Offer Sent'),
    [candidates]
  );

  // Hired candidates
  const hiredCandidates = React.useMemo(
    () => candidates.filter((c) => c.stage === 'Joined'),
    [candidates]
  );

  // Candidate stages distribution for pipeline velocity
  const stagesCount = React.useMemo(
    () => ({
      sourced: candidates.filter((c) => c.stage === 'Sourced').length,
      shared: pendingReviewCandidates.length,
      interview: interviewCandidates.length,
      offer: offerCandidates.length,
      hired: hiredCandidates.length,
    }),
    [
      candidates,
      pendingReviewCandidates.length,
      interviewCandidates.length,
      offerCandidates.length,
      hiredCandidates.length,
    ]
  );

  const totalCandidates = candidates.length || 1;

  // Group pending review candidates by department for telemetry
  const departmentGroups = React.useMemo(() => {
    const map = new Map<string, Candidate[]>();
    for (const c of pendingReviewCandidates) {
      const opening = openingsMap.get(c.openingId);
      const dept = opening?.department || 'General';
      if (!map.has(dept)) {
        map.set(dept, []);
      }
      map.get(dept)!.push(c);
    }

    const preferredOrder = [
      'Engineering',
      'Product',
      'Design',
      'Data & Analytics',
      'Operations',
      'Human Resources',
    ];

    const sortedDepts = Array.from(map.keys()).sort((a, b) => {
      const indexA = preferredOrder.indexOf(a);
      const indexB = preferredOrder.indexOf(b);
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
        candidates: map.get(dept) || [],
      };
    });
  }, [pendingReviewCandidates, openingsMap]);

  // Review candidates department filter & pagination state
  const [selectedReviewDept, setSelectedReviewDept] = React.useState<string>('all');
  const [reviewPage, setReviewPage] = React.useState<number>(1);
  const REVIEWS_PER_PAGE = 4;

  const filteredReviewCandidates = React.useMemo(() => {
    if (selectedReviewDept === 'all') return pendingReviewCandidates;
    return pendingReviewCandidates.filter((c) => {
      const opening = openingsMap.get(c.openingId);
      return (opening?.department || 'General') === selectedReviewDept;
    });
  }, [pendingReviewCandidates, selectedReviewDept, openingsMap]);

  const totalReviewPages = Math.ceil(filteredReviewCandidates.length / REVIEWS_PER_PAGE);
  const paginatedReviewCandidates = React.useMemo(() => {
    const start = (reviewPage - 1) * REVIEWS_PER_PAGE;
    return filteredReviewCandidates.slice(start, start + REVIEWS_PER_PAGE);
  }, [filteredReviewCandidates, reviewPage]);

  const handleSelectReviewDept = (dept: string) => {
    setSelectedReviewDept(dept);
    setReviewPage(1);
  };

  const isInitialLoading = loadingOpenings || loadingCandidates;

  return (
    <div className="w-full space-y-6">
      {/* 1. Top KPI Telemetry Cards: Sharp Info with Direct Navigation Gateways */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isInitialLoading ? (
          <>
            <Skeleton className="h-[96px] rounded-[12px]" />
            <Skeleton className="h-[96px] rounded-[12px]" />
            <Skeleton className="h-[96px] rounded-[12px]" />
            <Skeleton className="h-[96px] rounded-[12px]" />
          </>
        ) : (
          <>
            <StatCard
              label="Active Openings"
              value={activeOpenings.length}
              delta="+1 this month"
              href="/openings"
              icon={<Briefcase className="h-4 w-4" />}
            />
            <StatCard
              label="Awaiting Shortlist Review"
              value={pendingReviewCandidates.length}
              delta={
                pendingReviewCandidates.length > 0
                  ? `${pendingReviewCandidates.length} Action Required`
                  : 'Queue Clear'
              }
              isWarning={pendingReviewCandidates.length > 0}
              href="/shortlist"
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <StatCard
              label="Technical Interviews"
              value={interviewCandidates.length}
              delta="Active Schedule"
              href="/interviews"
              icon={<Clock className="h-4 w-4" />}
            />
            <StatCard
              label="Offers & Hires"
              value={offerCandidates.length + hiredCandidates.length}
              delta={`${hiredCandidates.length} Hired · ${offerCandidates.length} In Offer`}
              href="/pipeline"
              icon={<Users className="h-4 w-4" />}
            />
          </>
        )}
      </div>

      {/* 2. Main 12-Column Grid: 8 Cols (Review Queue & Pipeline) + 4 Cols (Schedule & Telemetry) */}
      <div className="grid grid-cols-12 items-stretch gap-6">
        {/* LEFT COLUMN (8 cols): Shortlist Review Telemetry & Pipeline Velocity */}
        <div className="col-span-12 flex flex-col space-y-6 lg:col-span-8">
          {/* A. Candidates Awaiting Review Telemetry (Styled matching Technical Interviews) */}
          <div className="border-border bg-surface-1 flex flex-col justify-between rounded-[12px] border p-5 shadow-xs">
            {/* Header matching Technical Interviews typography */}
            <div className="border-border/60 flex items-center justify-between gap-4 border-b pb-3">
              <h2 className="text-text text-[16px] leading-[24px] font-medium tracking-[-0.01em]">
                Candidates Awaiting Review
              </h2>

              <Link
                href="/shortlist"
                className="text-text-muted hover:text-text inline-flex shrink-0 items-center gap-1 text-[13px] leading-[20px] font-medium transition-colors"
              >
                <span>View all</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Department Filter Pills (Solid Orange when Selected, matching design) */}
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pt-3 pb-1">
              <button
                type="button"
                onClick={() => handleSelectReviewDept('all')}
                className={cn(
                  'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[12.5px] font-medium transition-colors select-none',
                  selectedReviewDept === 'all'
                    ? 'border-accent bg-accent font-semibold text-white shadow-xs'
                    : 'bg-surface-2 text-text-muted hover:bg-surface-3 hover:text-text'
                )}
              >
                <span>All</span>
                <span
                  className={cn(
                    'rounded-full px-1.5 font-sans text-[11px] font-semibold tabular-nums',
                    selectedReviewDept === 'all'
                      ? 'bg-white/20 text-white'
                      : 'bg-surface-3 text-text-subtle'
                  )}
                >
                  {pendingReviewCandidates.length}
                </span>
              </button>
              {departmentGroups.map((group) => {
                const GroupIcon = group.icon;
                const isSelected = selectedReviewDept === group.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => handleSelectReviewDept(group.id)}
                    className={cn(
                      'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[12.5px] font-medium transition-colors select-none',
                      isSelected
                        ? 'border-accent bg-accent font-semibold text-white shadow-xs'
                        : 'bg-surface-2 text-text-muted hover:bg-surface-3 hover:text-text'
                    )}
                  >
                    <GroupIcon className={cn('h-3.5 w-3.5 shrink-0', isSelected ? 'text-white' : 'text-text-subtle')} />
                    <span>{group.title}</span>
                    <span
                      className={cn(
                        'rounded-full px-1.5 font-sans text-[11px] font-semibold tabular-nums',
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-surface-3 text-text-subtle'
                      )}
                    >
                      {group.candidates.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Content: Structured Table View (Clean & Highly Organized, AI without Box) */}
            <div className="flex-1 pt-2">
              {isInitialLoading ? (
                <div className="space-y-3 py-2">
                  <Skeleton className="h-[48px] rounded-[8px]" />
                  <Skeleton className="h-[48px] rounded-[8px]" />
                  <Skeleton className="h-[48px] rounded-[8px]" />
                </div>
              ) : filteredReviewCandidates.length === 0 ? (
                <div className="flex h-36 flex-col items-center justify-center text-center select-none">
                  <CheckCircle2 className="text-text-muted mb-1.5 h-6 w-6" />
                  <p className="text-text text-[14px] font-medium">
                    No candidates in this department
                  </p>
                  <p className="text-text-subtle mt-0.5 text-[12px]">
                    Select another department or view all pending candidates.
                  </p>
                </div>
              ) : (
                <div className="border-border/70 bg-surface-1 overflow-hidden rounded-[10px] border shadow-2xs">
                  <div className="no-scrollbar overflow-x-auto">
                    {/* Table Header */}
                    <div className="bg-surface-2/40 border-border/60 text-text-subtle grid grid-cols-[minmax(180px,2fr)_minmax(140px,1.5fr)_minmax(90px,1fr)_minmax(95px,1fr)_minmax(90px,1fr)] items-center gap-3 border-b px-3.5 py-2 text-[11px] font-semibold tracking-wider uppercase select-none">
                      <div>Candidate</div>
                      <div>Target Requisition</div>
                      <div>Experience</div>
                      <div>AI Match</div>
                      <div className="text-right">Expected CTC</div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-border/50 divide-y">
                      {paginatedReviewCandidates.map((candidate) => {
                        const opening = openingsMap.get(candidate.openingId);
                        const dept = opening?.department || 'General';
                        const aiMatch = opening
                          ? matchCandidateToOpening(candidate, opening)
                          : null;

                        return (
                          <Link
                            key={candidate.id}
                            href="/shortlist"
                            className="hover:bg-surface-2/60 group grid cursor-pointer grid-cols-[minmax(180px,2fr)_minmax(140px,1.5fr)_minmax(90px,1fr)_minmax(95px,1fr)_minmax(90px,1fr)] items-center gap-3 px-3.5 py-2.5 transition-colors"
                          >
                            {/* 1. Candidate Info */}
                            <div className="flex min-w-0 items-center gap-2.5 pr-2">
                              <CompanyLogo
                                company={candidate.currentCompany}
                                className="h-4 w-4 shrink-0 rounded-[3px] shadow-2xs"
                              />
                              <div className="min-w-0 truncate">
                                <span className="text-text block truncate text-[13.5px] leading-[18px] font-medium transition-colors">
                                  {candidate.name}
                                </span>
                                <span className="text-text-muted block truncate text-[11.5px] leading-[15px]">
                                  {candidate.currentRole}
                                </span>
                              </div>
                            </div>

                            {/* 2. Target Requisition */}
                            <div className="min-w-0 pr-2">
                              <span className="text-text block truncate text-[13px] leading-[18px] font-medium">
                                {formatRoleTitle(opening?.title)}
                              </span>
                              <span className="text-text-muted mt-0.5 block truncate text-[11.5px] leading-[15px]">
                                {dept}
                              </span>
                            </div>

                            {/* 3. Experience */}
                            <div className="min-w-0 pr-2">
                              <span className="text-text block font-sans text-[12px] font-medium tabular-nums">
                                {candidate.experienceYears}y exp
                              </span>
                            </div>

                            {/* 4. AI Match */}
                            <div className="min-w-0 pr-2">
                              {aiMatch ? (
                                <span className="text-text block font-sans text-[11.5px] font-medium tabular-nums">
                                  {aiMatch.score}% Match
                                </span>
                              ) : (
                                <span className="text-text-subtle text-[11.5px]">—</span>
                              )}
                            </div>

                            {/* 5. Expected CTC & Chevron */}
                            <div className="flex shrink-0 items-center justify-end gap-1.5 text-right">
                              <span className="text-text block font-sans text-[13px] font-semibold whitespace-nowrap tabular-nums">
                                {formatCtc(candidate.expectedCtc)}
                              </span>
                              <ChevronRight className="text-text-subtle group-hover:text-text ml-1 h-3.5 w-3.5 shrink-0 transition-all group-hover:translate-x-0.5" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Direct Redirect Link & Pagination */}
            <div className="border-border/60 mt-2 flex items-center justify-between border-t pt-3">
              <Link
                href="/shortlist"
                className="text-text-muted hover:text-text inline-flex items-center gap-1.5 text-[13px] leading-[20px] font-medium transition-colors"
              >
                <span>Manage Review Queue ({pendingReviewCandidates.length} Pending)</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              {totalReviewPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-text-muted mr-1 font-sans text-[12px]">
                    Page {reviewPage} of {totalReviewPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                    disabled={reviewPage <= 1}
                    className="border-border/70 hover:bg-surface-2 text-text-muted hover:text-text inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-[4px] border transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                    title="Previous page"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewPage((p) => Math.min(totalReviewPages, p + 1))}
                    disabled={reviewPage >= totalReviewPages}
                    className="border-border/70 hover:bg-surface-2 text-text-muted hover:text-text inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-[4px] border transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                    title="Next page"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* B. Talent Pipeline Velocity & Throughput Tracker (Redirects to /pipeline) */}
          <div className="border-border bg-surface-1 flex flex-col rounded-[12px] border p-5 shadow-xs">
            {/* Header */}
            <div className="border-border/60 flex items-start justify-between gap-4 border-b pb-4">
              <div>
                <h2 className="text-text text-[16px] leading-[24px] font-medium tracking-[-0.01em]">
                  Talent Pipeline Velocity
                </h2>
                <p className="text-text-muted mt-[2px] text-[13px] leading-[20px]">
                  {candidates.length} candidates progressing across evaluation stages
                </p>
              </div>

              <Link
                href="/pipeline"
                className="text-text-muted hover:text-text inline-flex shrink-0 items-center gap-1 text-[13px] leading-[20px] font-medium transition-colors"
              >
                <span>Open Pipeline Board</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Progression Track: Clean Open Stages without Box Borders */}
            <div className="space-y-3.5 pt-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {/* 1. Sourced */}
                <Link
                  href="/pipeline"
                  className="hover:bg-surface-2 group flex cursor-pointer flex-col justify-between rounded-[8px] p-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted group-hover:text-text text-[12.5px] font-medium">
                      1. Sourced
                    </span>
                    <span className="text-text-subtle font-sans text-[11px] tabular-nums">
                      {Math.round((stagesCount.sourced / totalCandidates) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="text-text font-sans text-[22px] font-semibold tabular-nums">
                      {stagesCount.sourced}
                    </span>
                    <span className="text-text-subtle text-[11px]">in pool</span>
                  </div>
                </Link>

                {/* 2. Manager Review */}
                <Link
                  href="/shortlist"
                  className="hover:bg-surface-2 group flex cursor-pointer flex-col justify-between rounded-[8px] p-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted group-hover:text-text text-[12.5px] font-medium">
                      2. Review
                    </span>
                    <span className="text-text-muted font-sans text-[11px] font-semibold tabular-nums">
                      {Math.round((stagesCount.shared / totalCandidates) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="text-text font-sans text-[22px] font-semibold tabular-nums">
                      {stagesCount.shared}
                    </span>
                    <span className="text-text-subtle text-[11px]">pending</span>
                  </div>
                </Link>

                {/* 3. Technical Interview */}
                <Link
                  href="/interviews"
                  className="hover:bg-surface-2 group flex cursor-pointer flex-col justify-between rounded-[8px] p-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted group-hover:text-text text-[12.5px] font-medium">
                      3. Interview
                    </span>
                    <span className="text-text-subtle font-sans text-[11px] tabular-nums">
                      {Math.round((stagesCount.interview / totalCandidates) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="text-text font-sans text-[22px] font-semibold tabular-nums">
                      {stagesCount.interview}
                    </span>
                    <span className="text-text-subtle text-[11px]">rounds</span>
                  </div>
                </Link>

                {/* 4. Offer Stage */}
                <Link
                  href="/pipeline"
                  className="hover:bg-surface-2 group flex cursor-pointer flex-col justify-between rounded-[8px] p-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted group-hover:text-text text-[12.5px] font-medium">
                      4. Offer
                    </span>
                    <span className="text-text-subtle font-sans text-[11px] tabular-nums">
                      {Math.round((stagesCount.offer / totalCandidates) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="text-text font-sans text-[22px] font-semibold tabular-nums">
                      {stagesCount.offer}
                    </span>
                    <span className="text-text-subtle text-[11px]">extended</span>
                  </div>
                </Link>

                {/* 5. Joined */}
                <Link
                  href="/pipeline"
                  className="hover:bg-accent/10 group col-span-2 flex cursor-pointer flex-col justify-between rounded-[8px] p-3 transition-colors sm:col-span-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-text text-[12.5px] font-semibold">5. Joined</span>
                    <span className="text-text-muted font-sans text-[11px] font-bold tabular-nums">
                      {Math.round((stagesCount.hired / totalCandidates) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="text-text font-sans text-[22px] font-bold tabular-nums">
                      {stagesCount.hired}
                    </span>
                    <span className="text-text-muted text-[11px]">finalized</span>
                  </div>
                </Link>
              </div>

              {/* Proportional Segment Distribution Bar */}
              <div className="space-y-1.5">
                <div className="bg-surface-2 flex h-2 w-full gap-0.5 overflow-hidden rounded-full">
                  <div
                    style={{ width: `${(stagesCount.sourced / totalCandidates) * 100}%` }}
                    className="bg-surface-3 transition-all"
                  />
                  <div
                    style={{ width: `${(stagesCount.shared / totalCandidates) * 100}%` }}
                    className="bg-accent transition-all"
                  />
                  <div
                    style={{ width: `${(stagesCount.interview / totalCandidates) * 100}%` }}
                    className="bg-text-subtle transition-all"
                  />
                  <div
                    style={{ width: `${(stagesCount.offer / totalCandidates) * 100}%` }}
                    className="bg-text-muted transition-all"
                  />
                  <div
                    style={{ width: `${(stagesCount.hired / totalCandidates) * 100}%` }}
                    className="bg-emerald-500 transition-all"
                  />
                </div>
                <div className="text-text-subtle flex items-center justify-between text-[11px] select-none">
                  <span>Talent acquisition progression</span>
                  <span className="text-text-muted font-medium">
                    {stagesCount.hired} hires finalized (
                    {Math.round((stagesCount.hired / totalCandidates) * 100)}% conversion)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 cols): Upcoming Schedules & Key Benchmarks */}
        <div className="col-span-12 flex flex-col space-y-6 lg:col-span-4">
          {/* C. Technical Interviews Schedule (Agenda List, Links to /interviews) */}
          <div className="border-border bg-surface-1 flex flex-col justify-between rounded-[12px] border p-5 shadow-xs">
            <div>
              {/* Header */}
              <div className="border-border/60 flex items-start justify-between gap-4 border-b pb-4">
                <div>
                  <h2 className="text-text text-[16px] leading-[24px] font-medium tracking-[-0.01em]">
                    Technical Interviews
                  </h2>
                  <p className="text-text-muted mt-[2px] text-[13px] leading-[20px]">
                    {interviewCandidates.length} scheduled evaluations
                  </p>
                </div>
                <Link
                  href="/interviews"
                  className="text-text-muted hover:text-text inline-flex shrink-0 items-center gap-1 text-[13px] leading-[20px] font-medium transition-colors"
                >
                  <span>View all</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Interviews List: Original clean typography redirecting to /interviews */}
              <div className="pt-3">
                {isInitialLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-[48px] rounded-[8px]" />
                    <Skeleton className="h-[48px] rounded-[8px]" />
                  </div>
                ) : interviewCandidates.length === 0 ? (
                  <div className="flex h-36 flex-col items-center justify-center text-center select-none">
                    <Clock className="text-text-subtle mb-1.5 h-6 w-6 opacity-60" />
                    <p className="text-text text-[14px] font-medium">No interviews scheduled</p>
                    <p className="text-text-subtle mt-0.5 text-[12px]">
                      Shortlist candidates to begin scheduling technical discussions.
                    </p>
                  </div>
                ) : (
                  <div className="divide-border/60 divide-y">
                    {interviewCandidates.slice(0, 4).map((candidate) => {
                      const mode = candidate.interviewMode ?? 'Video';
                      const ModeIcon =
                        mode === 'Phone' ? Phone : mode === 'Onsite' ? MapPin : VideoCameraIcon;

                      return (
                        <Link
                          key={candidate.id}
                          href="/interviews"
                          className="group hover:bg-surface-2 -mx-2 flex cursor-pointer flex-col justify-between gap-1.5 rounded-[8px] px-2 py-3 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <CompanyLogo
                                company={candidate.currentCompany}
                                className="h-4 w-4 shrink-0 rounded-[3px] shadow-2xs"
                              />
                              <span className="text-text truncate text-[14px] leading-[20px] font-medium">
                                {candidate.name}
                              </span>
                            </div>
                            <span
                              className="text-text-subtle group-hover:text-text-muted flex shrink-0 items-center transition-colors"
                              title={`${mode} Interview`}
                              aria-label={`${mode} Interview`}
                            >
                              <ModeIcon className="h-4 w-4" />
                            </span>
                          </div>

                          <div className="text-text-muted flex items-center truncate text-[13px] leading-[20px]">
                            <span className="truncate tabular-nums">
                              {candidate.interviewDate
                                ? formatInterviewDateTime(candidate.interviewDate)
                                : 'Pending slot'}
                            </span>
                            <MetaSeparator />
                            <span className="truncate">{candidate.currentRole}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Direct Redirect Link */}
            <div className="border-border/60 mt-2 border-t pt-3">
              <Link
                href="/interviews"
                className="text-text-muted hover:text-text flex items-center justify-between text-[13px] leading-[20px] font-medium transition-colors"
              >
                <span>Manage Interview Scorecards</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* D. Operational Benchmarks & Hiring Health Telemetry */}
          <div className="border-border bg-surface-1 flex flex-col justify-between rounded-[12px] border p-5 shadow-xs">
            <div>
              <div className="border-border/60 flex items-center justify-between border-b pb-3.5">
                <h2 className="text-text text-[15px] font-semibold tracking-[-0.01em]">
                  Hiring Telemetry
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3.5">
                <div className="py-1">
                  <span className="text-text-subtle block text-[11px] font-medium tracking-wider uppercase">
                    Avg. Time-to-Hire
                  </span>
                  <p className="text-text mt-1 font-sans text-[18px] font-bold">18 Days</p>
                  <span className="text-text-muted mt-0.5 block text-[11px] font-medium">
                    Top 10% benchmark
                  </span>
                </div>

                <div className="py-1">
                  <span className="text-text-subtle block text-[11px] font-medium tracking-wider uppercase">
                    Offer Acceptance
                  </span>
                  <p className="text-text mt-1 font-sans text-[18px] font-bold">94.2%</p>
                  <span className="text-text-subtle mt-0.5 block text-[11px] font-medium">
                    vs 82% industry avg
                  </span>
                </div>

                <div className="py-1">
                  <span className="text-text-subtle block text-[11px] font-medium tracking-wider uppercase">
                    AI Match Conviction
                  </span>
                  <p className="text-text mt-1 font-sans text-[18px] font-bold">88%</p>
                  <span className="text-text-subtle mt-0.5 block text-[11px] font-medium">
                    Verified competencies
                  </span>
                </div>

                <div className="py-1">
                  <span className="text-text-subtle block text-[11px] font-medium tracking-wider uppercase">
                    Review SLA
                  </span>
                  <p className="text-text mt-1 font-sans text-[18px] font-bold">&lt; 24h</p>
                  <span className="text-text-subtle mt-0.5 block text-[11px] font-medium">
                    Target: 48h turnaround
                  </span>
                </div>
              </div>
            </div>

            <div className="border-border/60 mt-3 border-t pt-3">
              <Link
                href="/reports"
                className="text-text-subtle hover:text-text flex items-center justify-between text-[12px] font-medium transition-colors"
              >
                <span>View Full Analytics & Reports</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW (12 cols full-width): Active Openings (Department Columns & Cards format) */}
        <div className="col-span-12 flex flex-col">
          <ActiveOpeningsCard
            openings={activeOpenings}
            candidates={candidates}
            title="Active Openings"
            subtitle={null}
            viewAllHref="/openings"
            isLoading={isInitialLoading}
            onAiMatch={setAiMatchOpening}
            onAiReview={setAiReviewOpening}
          />
        </div>
      </div>

      {/* Groq AI Resume Intelligence Sheet for Managers */}
      <ManagerAiAnalysisSheet
        opening={aiReviewOpening}
        open={Boolean(aiReviewOpening)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setAiReviewOpening(null);
        }}
        candidates={candidates}
      />

      {/* AI Candidate Matcher Drawer */}
      <AiCandidateMatcherSheet
        opening={aiMatchOpening}
        open={Boolean(aiMatchOpening)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setAiMatchOpening(null);
        }}
        onInspectCandidate={(c) => {
          setInspectedCandidate(c);
          setIsCandidateSheetOpen(true);
        }}
      />

      {/* Candidate Dossier Sheet */}
      <CandidateDetailSheet
        candidate={inspectedCandidate}
        open={isCandidateSheetOpen}
        onOpenChange={setIsCandidateSheetOpen}
      />
    </div>
  );
}
