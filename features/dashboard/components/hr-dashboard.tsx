'use client';

import * as React from 'react';
import Link from 'next/link';
import { useOpenings } from '@/features/openings/hooks';
import { useCandidates } from '@/features/candidates/hooks';
import { useAllOnboarding } from '@/features/onboarding/hooks';
import { StatCard } from '@/components/hro/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

export function HrDashboard() {
  const { data: openings = [], isLoading: loadingOpenings } = useOpenings();
  const { data: candidates = [], isLoading: loadingCandidates } = useCandidates();
  const { data: onboardingItems = [], isLoading: loadingOnboarding } = useAllOnboarding();

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

      {/* 3. Bottom Grid: Pipeline Throughput (8 cols) & Onboarding Readiness (4 cols) */}
      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* ROW 2 LEFT (8 cols): Active Pipeline Throughput */}
        <div className="col-span-12 flex flex-col lg:col-span-8">
          <div className="border border-border bg-surface-1 flex h-full flex-col rounded-[12px] p-5 shadow-xs">
            {/* Header (No 30 candidates badge) */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/60">
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-text">
                Active Pipeline Throughput
              </h2>
              <Link
                href="/pipeline"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-text-muted hover:text-text transition-colors shrink-0"
              >
                <span>View pipeline</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Content: Unified Connected Progression Track */}
            <div className="flex-1 pt-4 flex flex-col justify-between gap-4">
              <div className="rounded-[10px] border border-border/80 bg-surface-2/30 divide-y sm:divide-y-0 sm:divide-x divide-border/60 grid grid-cols-2 sm:grid-cols-5 overflow-hidden">
                {/* Stage 1: Sourced */}
                <div className="flex flex-col justify-between p-3.5 hover:bg-surface-2/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[12px] font-medium select-none">
                      1. Sourced
                    </span>
                    <span className="text-text-subtle text-[11px] tabular-nums font-mono font-normal">
                      {Math.round((stagesCount.sourced / totalCandidates) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="text-text font-mono text-[24px] font-semibold tracking-tight tabular-nums">
                      {stagesCount.sourced}
                    </span>
                    <span className="text-text-subtle text-[11px]">candidates</span>
                  </div>
                  <div className="mt-2.5 h-1 w-full rounded-full bg-surface-3 overflow-hidden">
                    <div
                      className="h-full bg-text-subtle rounded-full"
                      style={{
                        width: `${Math.round((stagesCount.sourced / totalCandidates) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Stage 2: Manager Review */}
                <div className="flex flex-col justify-between p-3.5 hover:bg-surface-2/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[12px] font-medium select-none truncate">
                      2. Mgr Review
                    </span>
                    <span className="text-text-subtle text-[11px] tabular-nums font-mono font-normal">
                      {Math.round((stagesCount.shared / totalCandidates) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="text-text font-mono text-[24px] font-semibold tracking-tight tabular-nums">
                      {stagesCount.shared}
                    </span>
                    <span className="text-text-subtle text-[11px]">in review</span>
                  </div>
                  <div className="mt-2.5 h-1 w-full rounded-full bg-surface-3 overflow-hidden">
                    <div
                      className="h-full bg-text-subtle rounded-full"
                      style={{
                        width: `${Math.round((stagesCount.shared / totalCandidates) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Stage 3: Interview */}
                <div className="flex flex-col justify-between p-3.5 hover:bg-surface-2/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[12px] font-medium select-none">
                      3. Interview
                    </span>
                    <span className="text-text-subtle text-[11px] tabular-nums font-mono font-normal">
                      {Math.round((stagesCount.interview / totalCandidates) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="text-text font-mono text-[24px] font-semibold tracking-tight tabular-nums">
                      {stagesCount.interview}
                    </span>
                    <span className="text-text-subtle text-[11px]">rounds</span>
                  </div>
                  <div className="mt-2.5 h-1 w-full rounded-full bg-surface-3 overflow-hidden">
                    <div
                      className="h-full bg-text-muted rounded-full"
                      style={{
                        width: `${Math.round((stagesCount.interview / totalCandidates) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Stage 4: Offer */}
                <div className="flex flex-col justify-between p-3.5 hover:bg-surface-2/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[12px] font-medium select-none">
                      4. Offer
                    </span>
                    <span className="text-text-subtle text-[11px] tabular-nums font-mono font-normal">
                      {Math.round((stagesCount.offer / totalCandidates) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="text-text font-mono text-[24px] font-semibold tracking-tight tabular-nums">
                      {stagesCount.offer}
                    </span>
                    <span className="text-text-subtle text-[11px]">extended</span>
                  </div>
                  <div className="mt-2.5 h-1 w-full rounded-full bg-surface-3 overflow-hidden">
                    <div
                      className="h-full bg-text-muted rounded-full"
                      style={{
                        width: `${Math.round((stagesCount.offer / totalCandidates) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Stage 5: Joined */}
                <div className="col-span-2 sm:col-span-1 flex flex-col justify-between p-3.5 hover:bg-surface-2/60 transition-colors bg-accent-subtle/20">
                  <div className="flex items-center justify-between">
                    <span className="text-accent text-[12px] font-medium select-none">
                      5. Joined
                    </span>
                    <span className="text-accent text-[11px] tabular-nums font-mono font-normal">
                      {Math.round((stagesCount.hired / totalCandidates) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="text-accent font-mono text-[24px] font-semibold tracking-tight tabular-nums">
                      {stagesCount.hired}
                    </span>
                    <span className="text-accent/80 text-[11px]">hired</span>
                  </div>
                  <div className="mt-2.5 h-1 w-full rounded-full bg-accent/20 overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{
                        width: `${Math.round((stagesCount.hired / totalCandidates) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Proportional Segment Bar */}
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
                <div className="flex items-center justify-between text-[11px] text-text-subtle select-none">
                  <span>Talent acquisition progression</span>
                  <span className="font-medium text-text-muted">
                    {stagesCount.hired} hires finalized ({Math.round((stagesCount.hired / totalCandidates) * 100)}% conversion)
                  </span>
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
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-text">
                Onboarding Readiness
              </h2>
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
                    {completedTasks} / {totalTasks} tasks ({onboardingPercent}%)
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

        {/* ROW 3: SLA Watchlist (Redesigned Table Format) */}
        <div className="col-span-12 flex flex-col">
          <div className="border border-border bg-surface-1 flex h-full flex-col rounded-[12px] p-5 shadow-xs overflow-hidden">
            {/* Header (No count badge) */}
            <div className="flex items-center justify-between gap-4 pb-4">
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-text">
                SLA Watchlist
              </h2>
              <Link
                href="/candidates"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-text-muted hover:text-text transition-colors shrink-0"
              >
                <span>View all candidates</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Structured Table Container */}
            <div className="overflow-x-auto -mx-5 px-5">
              <div className="min-w-[580px]">
                {/* Table Column Header */}
                <div className="grid grid-cols-[minmax(200px,2fr)_140px_130px_110px_100px] gap-3 sm:gap-4 items-center px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-text-subtle border-y border-border bg-surface-2/40 select-none">
                  <div>Candidate</div>
                  <div>Current Stage</div>
                  <div>SLA Status</div>
                  <div>Notice Period</div>
                  <div className="text-right">Action</div>
                </div>

                {/* Table Content Rows */}
                <div className="divide-y divide-border/60">
                  {slaAlertCandidates.length === 0 ? (
                    <div className="text-text-muted flex flex-col items-center justify-center py-8 text-center text-[13px]">
                      <p className="font-medium">All candidate SLAs are currently on track</p>
                    </div>
                  ) : (
                    slaAlertCandidates.map((candidate) => {
                      const opening = openings.find((o) => o.id === candidate.openingId);
                      return (
                        <div
                          key={candidate.id}
                          className="grid grid-cols-[minmax(200px,2fr)_140px_130px_110px_100px] gap-3 sm:gap-4 items-center px-4 py-3 hover:bg-surface-2/50 transition-colors"
                        >
                          {/* 1. Candidate Info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 border border-border text-[11px] font-semibold text-text">
                              {candidate.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-medium text-text leading-tight">
                                {candidate.name}
                              </p>
                              <p className="truncate text-[11px] text-text-muted leading-tight mt-0.5">
                                {opening?.title || candidate.currentRole}
                              </p>
                            </div>
                          </div>

                          {/* 2. Stage Badge */}
                          <div className="flex items-center">
                            <Badge variant="default" className="text-[11px] font-medium py-0.5 px-2">
                              {candidate.stage}
                            </Badge>
                          </div>

                          {/* 3. SLA Status */}
                          <div className="flex items-center gap-1.5 text-text-muted">
                            <Clock className="h-3.5 w-3.5 stroke-[1.75] text-text-subtle shrink-0" />
                            <span className="text-[12px] font-normal tabular-nums">
                              Action required
                            </span>
                          </div>

                          {/* 4. Notice Period */}
                          <div className="text-[12px] text-text-muted tabular-nums font-mono">
                            {candidate.noticePeriod}
                          </div>

                          {/* 5. Action */}
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-[11px] font-medium border-border hover:bg-surface-2 hover:text-text cursor-pointer"
                              onClick={() => toast.success(`Nudge reminder sent for ${candidate.name}`)}
                            >
                              Nudge Team
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
