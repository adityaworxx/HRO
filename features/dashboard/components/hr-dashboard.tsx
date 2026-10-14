'use client';

import * as React from 'react';
import Link from 'next/link';
import { useOpenings, useUpdateOpeningStatus } from '@/features/openings/hooks';
import { useCandidates } from '@/features/candidates/hooks';
import { useAllOnboarding } from '@/features/onboarding/hooks';
import { StatCard } from '@/components/hro/stat-card';
import { ActiveOpeningsCard } from '@/components/hro/active-openings-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  GitPullRequest,
  UserCheck,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

export function HrDashboard() {
  const { data: openings = [], isLoading: loadingOpenings } = useOpenings();
  const { data: candidates = [], isLoading: loadingCandidates } = useCandidates();
  const { data: onboardingItems = [], isLoading: loadingOnboarding } = useAllOnboarding();
  const updateOpeningStatus = useUpdateOpeningStatus();

  // Openings metrics
  const openRequisitions = React.useMemo(
    () => openings.filter((o) => o.status === 'Open' || o.status === 'Sourcing'),
    [openings]
  );
  const onHoldRequisitions = React.useMemo(
    () => openings.filter((o) => o.status === 'On Hold'),
    [openings]
  );
  const hiredCandidates = React.useMemo(
    () =>
      candidates.filter(
        (c) => c.stage === 'Joined' || c.stage === 'Selected' || c.stage === 'Offer Sent'
      ),
    [candidates]
  );

  // Candidate stages distribution
  const stagesCount = React.useMemo(
    () => ({
      sourced: candidates.filter((c) => c.stage === 'Sourced').length,
      shared: candidates.filter((c) => c.stage === 'Shared with Manager').length,
      interview: candidates.filter((c) => c.stage === 'Interview').length,
      offer: candidates.filter((c) => c.stage === 'Selected' || c.stage === 'Offer Sent').length,
      hired: candidates.filter((c) => c.stage === 'Joined').length,
    }),
    [candidates]
  );

  const totalCandidates = candidates.length || 1;

  // SLA warning candidates (candidates waiting in interview or manager review)
  const slaAlertCandidates = React.useMemo(
    () =>
      candidates
        .filter((c) => c.stage === 'Interview' || c.stage === 'Shared with Manager')
        .slice(0, 3),
    [candidates]
  );

  // Onboarding completion rate
  const completedTasks = onboardingItems.filter((item) => item.done).length;
  const totalTasks = onboardingItems.length || 1;
  const onboardingPercent = Math.round((completedTasks / totalTasks) * 100);

  const handleReactivate = (id: string, title: string) => {
    updateOpeningStatus.mutate(
      { id, status: 'Open' },
      {
        onSuccess: () => {
          toast.success(`Opening "${title}" has been reactivated to Open!`);
        },
      }
    );
  };

  const isInitialLoading = loadingOpenings || loadingCandidates || loadingOnboarding;

  return (
    <div className="w-full space-y-6">
      {/* 1. KPI Stat Cards Grid */}
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
              label="Open Openings"
              value={openRequisitions.length}
              delta="+2 this month"
              href="/openings"
              icon={<Briefcase className="h-4 w-4 stroke-[1.75]" />}
            />
            <StatCard
              label="Active Candidates"
              value={candidates.length}
              delta="In recruitment"
              href="/candidates"
              icon={<Users className="h-4 w-4 stroke-[1.75]" />}
            />
            <StatCard
              label="On-Hold Openings"
              value={onHoldRequisitions.length}
              delta={onHoldRequisitions.length > 0 ? 'Requires attention' : 'All active'}
              isWarning={onHoldRequisitions.length > 0}
              href="/openings"
              icon={<Clock className="h-4 w-4 stroke-[1.75]" />}
            />
            <StatCard
              label="Onboarding Progress"
              value={`${onboardingPercent}%`}
              delta={`${completedTasks} of ${totalTasks} tasks`}
              href="/onboarding"
              icon={<CheckCircle2 className="h-4 w-4 stroke-[1.75]" />}
            />
          </>
        )}
      </div>

      {/* 2. Active Openings Card */}
      <ActiveOpeningsCard
        openings={openings}
        candidates={candidates}
        title="Active Openings"
        viewAllHref="/openings"
        isLoading={isInitialLoading}
        onReactivate={handleReactivate}
      />

      {/* 3. Bottom Grid: Pipeline Throughput (8 cols) & Onboarding Readiness (4 cols) */}
      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* ROW 2 LEFT (8 cols): Active Pipeline Throughput */}
        <div className="col-span-12 flex flex-col lg:col-span-8">
          <div className="border border-border bg-surface-1 flex h-full flex-col rounded-[12px] p-5 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-surface-2 text-text">
                  <GitPullRequest className="h-4 w-4 stroke-[1.75]" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-text">
                    Active Pipeline Throughput
                  </h2>
                  <span className="border border-border bg-surface-2 text-text-muted rounded-[var(--radius-sm)] px-2 py-0.5 text-[11px] font-medium tabular-nums select-none">
                    {candidates.length} candidates
                  </span>
                </div>
              </div>
              <Link
                href="/pipeline"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-text-muted hover:text-text transition-colors shrink-0"
              >
                <span>View pipeline</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Content: 5 Connected Stage Metric Cards */}
            <div className="flex-1 pt-4 flex flex-col justify-between gap-4">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                {/* Stage 1: Sourced */}
                <div className="border border-border/70 bg-surface-2/40 hover:bg-surface-2/70 flex flex-col rounded-[8px] p-3 transition-colors">
                  <span className="text-text-subtle text-[11px] font-medium select-none">
                    1. Sourced
                  </span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-text font-mono text-[22px] font-semibold leading-tight tabular-nums">
                      {stagesCount.sourced}
                    </span>
                    <span className="text-text-subtle text-[11px] font-medium tabular-nums">
                      {Math.round((stagesCount.sourced / totalCandidates) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Stage 2: Manager Review */}
                <div className="border border-border/70 bg-surface-2/40 hover:bg-surface-2/70 flex flex-col rounded-[8px] p-3 transition-colors">
                  <span className="text-text-subtle text-[11px] font-medium select-none truncate">
                    2. Mgr Review
                  </span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-text font-mono text-[22px] font-semibold leading-tight tabular-nums">
                      {stagesCount.shared}
                    </span>
                    <span className="text-text-subtle text-[11px] font-medium tabular-nums">
                      {Math.round((stagesCount.shared / totalCandidates) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Stage 3: Interview */}
                <div className="border border-border/70 bg-surface-2/40 hover:bg-surface-2/70 flex flex-col rounded-[8px] p-3 transition-colors">
                  <span className="text-text-subtle text-[11px] font-medium select-none">
                    3. Interview
                  </span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-text font-mono text-[22px] font-semibold leading-tight tabular-nums">
                      {stagesCount.interview}
                    </span>
                    <span className="text-text-subtle text-[11px] font-medium tabular-nums">
                      {Math.round((stagesCount.interview / totalCandidates) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Stage 4: Offer */}
                <div className="border border-border/70 bg-surface-2/40 hover:bg-surface-2/70 flex flex-col rounded-[8px] p-3 transition-colors">
                  <span className="text-text-subtle text-[11px] font-medium select-none">
                    4. Offer
                  </span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-text font-mono text-[22px] font-semibold leading-tight tabular-nums">
                      {stagesCount.offer}
                    </span>
                    <span className="text-text-subtle text-[11px] font-medium tabular-nums">
                      {Math.round((stagesCount.offer / totalCandidates) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Stage 5: Joined */}
                <div className="border border-border/70 bg-surface-2/40 hover:bg-surface-2/70 flex flex-col rounded-[8px] p-3 transition-colors">
                  <span className="text-text-subtle text-[11px] font-medium select-none">
                    5. Joined
                  </span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-accent font-mono text-[22px] font-semibold leading-tight tabular-nums">
                      {stagesCount.hired}
                    </span>
                    <span className="text-text-subtle text-[11px] font-medium tabular-nums">
                      {Math.round((stagesCount.hired / totalCandidates) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Proportional Pipeline Segment Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="h-2 w-full flex rounded-full overflow-hidden bg-surface-2 gap-0.5">
                  <div
                    style={{ width: `${(stagesCount.sourced / totalCandidates) * 100}%` }}
                    className="bg-surface-3 transition-all"
                    title={`Sourced: ${stagesCount.sourced}`}
                  />
                  <div
                    style={{ width: `${(stagesCount.shared / totalCandidates) * 100}%` }}
                    className="bg-border-strong transition-all"
                    title={`Manager Review: ${stagesCount.shared}`}
                  />
                  <div
                    style={{ width: `${(stagesCount.interview / totalCandidates) * 100}%` }}
                    className="bg-text-subtle transition-all"
                    title={`Interview: ${stagesCount.interview}`}
                  />
                  <div
                    style={{ width: `${(stagesCount.offer / totalCandidates) * 100}%` }}
                    className="bg-text-muted transition-all"
                    title={`Offer: ${stagesCount.offer}`}
                  />
                  <div
                    style={{ width: `${(stagesCount.hired / totalCandidates) * 100}%` }}
                    className="bg-accent transition-all"
                    title={`Joined: ${stagesCount.hired}`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-subtle">
                  <span>Talent acquisition funnel</span>
                  <span>{stagesCount.hired} hires finalized</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2 RIGHT (4 cols): Onboarding Readiness */}
        <div className="col-span-12 flex flex-col lg:col-span-4">
          <div className="border border-border bg-surface-1 flex h-full flex-col rounded-[12px] p-5 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-surface-2 text-text">
                  <UserCheck className="h-4 w-4 stroke-[1.75]" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-text">
                    Onboarding Readiness
                  </h2>
                  <span className="border border-border bg-surface-2 text-text-muted rounded-[var(--radius-sm)] px-2 py-0.5 text-[11px] font-medium tabular-nums select-none">
                    {onboardingPercent}%
                  </span>
                </div>
              </div>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-text-muted hover:text-text transition-colors shrink-0"
              >
                <span>View checklist</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Content: Progress bar & Incoming Hires */}
            <div className="flex-1 pt-4 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between text-[12px]">
                  <span className="text-text-muted font-medium">Task Completion</span>
                  <span className="text-text font-mono font-medium tabular-nums">
                    {completedTasks} / {totalTasks} tasks
                  </span>
                </div>
                <Progress value={onboardingPercent} className="h-1.5" />
              </div>

              <div className="border-border/60 space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-subtle text-[11px] font-medium uppercase tracking-wider">
                    Incoming Hires
                  </span>
                  <span className="text-text-subtle text-[11px] tabular-nums">
                    {hiredCandidates.length} active
                  </span>
                </div>
                {hiredCandidates.length === 0 ? (
                  <p className="text-text-muted text-[12px] py-2">No pending hires in onboarding.</p>
                ) : (
                  <div className="divide-border/60 divide-y">
                    {hiredCandidates.slice(0, 2).map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex items-center justify-between py-2 text-[12px]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-6 w-6 rounded-full bg-surface-2 text-text font-medium text-[11px] flex items-center justify-center shrink-0">
                            {candidate.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-text font-medium truncate">{candidate.name}</span>
                        </div>
                        <span className="text-text-muted truncate ml-2 text-[11px]">
                          {candidate.currentRole}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: SLA Watchlist */}
        <div className="col-span-12 flex flex-col">
          <div className="border border-border bg-surface-1 flex h-full flex-col rounded-[12px] p-5 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-surface-2 text-text">
                  <AlertTriangle className="h-4 w-4 stroke-[1.75]" />
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-text">
                    SLA Watchlist
                  </h2>
                  <span className="border border-border bg-surface-2 text-text-muted rounded-[var(--radius-sm)] px-2 py-0.5 text-[11px] font-medium tabular-nums select-none">
                    {slaAlertCandidates.length} candidates
                  </span>
                </div>
              </div>
              <Link
                href="/candidates"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-text-muted hover:text-text transition-colors shrink-0"
              >
                <span>View all candidates</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Content */}
            <div className="flex-1 pt-2">
              {slaAlertCandidates.length === 0 ? (
                <div className="text-text-muted flex flex-col items-center justify-center py-8 text-center text-[13px]">
                  <p className="font-medium">All candidate SLAs are currently on track</p>
                </div>
              ) : (
                <div className="divide-border/60 divide-y">
                  {slaAlertCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="group hover:bg-surface-2/40 -mx-2 flex flex-col justify-between gap-3 rounded-[8px] px-3 py-3 transition-colors sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-surface-2 text-text flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold">
                          {candidate.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-text text-[13px] font-medium">
                              {candidate.name}
                            </span>
                            <Badge
                              variant="default"
                              className="text-[11px] font-normal py-0 px-1.5"
                            >
                              {candidate.stage}
                            </Badge>
                          </div>
                          <span className="text-text-subtle text-[11px]">
                            Notice: {candidate.noticePeriod}
                          </span>
                        </div>
                      </div>

                      <div className="self-end sm:self-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-text-muted hover:text-text hover:bg-surface-2 h-7 px-2.5 text-[12px] font-medium cursor-pointer"
                          onClick={() => toast.success(`Nudge reminder sent for ${candidate.name}`)}
                        >
                          Nudge Team
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
