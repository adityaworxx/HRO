'use client';

import * as React from 'react';
import Link from 'next/link';
import { useOpenings, useUpdateOpeningStatus } from '@/features/openings/hooks';
import { useCandidates } from '@/features/candidates/hooks';
import { useAllOnboarding } from '@/features/onboarding/hooks';
import { useCurrentUser } from '@/features/auth/hooks';
import { StatCard } from '@/components/hro/stat-card';
import { StatusBadge } from '@/components/hro/status-badge';
import { MetaSeparator } from '@/components/hro/meta-separator';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  GitPullRequest,
  Users,
  Building2,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';

export function HrDashboard() {
  const { data: user, isLoading: loadingUser } = useCurrentUser();
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

  // Simulated SLA warning candidates (candidates waiting in interview or manager review)
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

  const isInitialLoading = loadingUser || loadingOpenings || loadingCandidates || loadingOnboarding;

  return (
    <div className="w-full">
      {/* 1. Page Header Block: 24px bottom spacing */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-text text-[24px] leading-[32px] font-semibold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] ?? 'HR Specialist'}
          </h1>
          <p className="text-text-muted mt-1 text-[14px] leading-[20px]">
            Company-wide hiring health, pipeline throughput, and onboarding operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="primary" className="h-9 gap-1.5 px-4 text-[13px] font-medium">
            <Link href="/pipeline">
              <GitPullRequest className="h-4 w-4 stroke-[1.75]" />
              <span>Open Pipeline Board</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. KPI Stat Cards Grid: 24px gap throughout */}
      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isInitialLoading ? (
          <>
            <Skeleton className="h-[96px] rounded-[var(--radius-lg)]" />
            <Skeleton className="h-[96px] rounded-[var(--radius-lg)]" />
            <Skeleton className="h-[96px] rounded-[var(--radius-lg)]" />
            <Skeleton className="h-[96px] rounded-[var(--radius-lg)]" />
          </>
        ) : (
          <>
            <StatCard
              label="Open Openings"
              value={openRequisitions.length}
              delta="+2 this month"
              href="/openings"
            />
            <StatCard
              label="Active Candidates"
              value={candidates.length}
              delta="Across all stages"
              href="/candidates"
            />
            <StatCard
              label="On-Hold Openings"
              value={onHoldRequisitions.length}
              delta={onHoldRequisitions.length > 0 ? 'Requires attention' : 'None'}
              isWarning={onHoldRequisitions.length > 0}
              href="/openings"
            />
            <StatCard
              label="Onboarding Progress"
              value={`${onboardingPercent}%`}
              delta={`${completedTasks} of ${totalTasks} tasks done`}
              href="/onboarding"
            />
          </>
        )}
      </div>

      {/* 3. Main 12-Column Grid: 8 cols main, 4 cols sidebar; equal row heights */}
      <div className="grid grid-cols-12 items-stretch gap-6">
        {/* ROW 1 LEFT (8 cols): Openings Under Review */}
        <div className="col-span-12 flex flex-col lg:col-span-8">
          <div className="border-border bg-surface-1 flex h-full flex-col rounded-[var(--radius-lg)] border p-6">
            {/* Header Block: title, 4px subtitle, 16px to content */}
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-text text-[16px] leading-[24px] font-semibold">
                    Openings Under Review
                  </h2>
                  {onHoldRequisitions.length > 0 && (
                    <span className="bg-surface-2 text-text-muted rounded-full px-2 py-0.5 text-[12px] font-medium">
                      {onHoldRequisitions.length} On Hold
                    </span>
                  )}
                </div>
                <p className="text-text-muted mt-1 text-[13px] leading-[20px]">
                  Track active opening milestones, budget allocations, and status updates.
                </p>
              </div>
            </div>

            {/* Content: Divider rows, no nested boxes */}
            <div className="flex-1">
              {openings.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-text-muted text-[13px]">No active openings under review.</p>
                </div>
              ) : (
                <div className="divide-border divide-y">
                  {openings.slice(0, 4).map((opening) => (
                    <div
                      key={opening.id}
                      className="hover:bg-surface-2 flex flex-col justify-between gap-3 rounded-[var(--radius-md)] px-3 py-3.5 transition-colors sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/openings/${opening.id}`}
                            className="text-text hover:text-accent truncate text-[14px] leading-[20px] font-semibold transition-colors"
                          >
                            {opening.title}
                          </Link>
                          <StatusBadge status={opening.status} type="opening" />
                        </div>
                        <div className="text-text-muted flex flex-wrap items-center text-[13px] leading-[20px]">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="text-text-muted h-3.5 w-3.5 stroke-[1.75]" />
                            <span>{opening.department}</span>
                          </span>
                          <MetaSeparator />
                          <span className="flex items-center gap-1.5">
                            <MapPin className="text-text-muted h-3.5 w-3.5 stroke-[1.75]" />
                            <span>{opening.location}</span>
                          </span>
                          <MetaSeparator />
                          <span>
                            Budget: ₹{opening.budgetRange.min}L - ₹{opening.budgetRange.max}L
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {opening.status === 'On Hold' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleReactivate(opening.id, opening.title)}
                            className="h-8 gap-1.5 px-3 text-[13px] font-medium"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 stroke-[1.75]" />
                            <span>Reactivate</span>
                          </Button>
                        )}
                        <Button
                          asChild
                          variant="secondary"
                          size="sm"
                          className="border-border-strong text-text h-8 px-3 text-[13px] font-medium"
                        >
                          <Link href={`/openings/${opening.id}`}>Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pinned Footer Link */}
            <div className="border-border mt-auto border-t pt-4">
              <Link
                href="/openings"
                className="text-text-muted hover:text-accent focus-visible:ring-accent inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors focus-visible:rounded focus-visible:outline-none focus-visible:ring-2"
              >
                <span>View all {openings.length} openings</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.75]" />
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 1 RIGHT (4 cols): Onboarding Readiness */}
        <div className="col-span-12 flex flex-col lg:col-span-4">
          <div className="border-border bg-surface-1 flex h-full flex-col rounded-[var(--radius-lg)] border p-6">
            {/* Header Block: title, 4px subtitle, 16px to content */}
            <div className="mb-4">
              <h2 className="text-text text-[16px] leading-[24px] font-semibold">
                Onboarding Readiness
              </h2>
              <p className="text-text-muted mt-1 text-[13px] leading-[20px]">
                Hardware dispatch and paperwork status for incoming hires.
              </p>
            </div>

            {/* Content: Progress bar & Incoming Hires */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[13px] leading-[20px]">
                  <span className="text-text-muted font-medium">Task Completion Rate</span>
                  <span className="text-text font-semibold tabular-nums">{onboardingPercent}%</span>
                </div>
                <Progress value={onboardingPercent} className="h-2" />
                <p className="text-text-subtle text-[12px] leading-[16px]">
                  {completedTasks} of {totalTasks} onboarding requirements fulfilled.
                </p>
              </div>

              <div className="border-border space-y-2 border-t pt-3">
                <p className="text-text text-[13px] font-semibold">Incoming Hires:</p>
                {hiredCandidates.length === 0 ? (
                  <p className="text-text-muted text-[13px]">No pending hires in onboarding.</p>
                ) : (
                  <div className="divide-border divide-y">
                    {hiredCandidates.slice(0, 2).map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex items-center justify-between py-2 text-[13px] leading-[20px]"
                      >
                        <span className="text-text font-medium">{candidate.name}</span>
                        <span className="text-text-muted">{candidate.currentRole}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pinned Footer Link */}
            <div className="border-border mt-auto border-t pt-4">
              <Link
                href="/onboarding"
                className="text-text-muted hover:text-accent focus-visible:ring-accent inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors focus-visible:rounded focus-visible:outline-none focus-visible:ring-2"
              >
                <span>View onboarding checklist</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.75]" />
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 2 LEFT (8 cols): Active Pipeline Throughput */}
        <div className="col-span-12 flex flex-col lg:col-span-8">
          <div className="border-border bg-surface-1 flex h-full flex-col rounded-[var(--radius-lg)] border p-6">
            {/* Header Block: title, 4px subtitle, 16px to content */}
            <div className="mb-4">
              <h2 className="text-text text-[16px] leading-[24px] font-semibold">
                Active Pipeline Throughput
              </h2>
              <p className="text-text-muted mt-1 text-[13px] leading-[20px]">
                Candidate volume distribution across recruitment stages.
              </p>
            </div>

            {/* Content: 5 Stage Metric Blocks */}
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="bg-surface-2/60 hover:bg-surface-2 flex flex-col items-center justify-center rounded-[var(--radius-md)] p-4 text-center transition-colors">
                  <span className="text-text-muted text-[12px] font-medium uppercase tracking-wider">
                    Sourced
                  </span>
                  <p className="text-text mt-1 text-[28px] leading-[32px] font-semibold tabular-nums">
                    {stagesCount.sourced}
                  </p>
                </div>
                <div className="bg-surface-2/60 hover:bg-surface-2 flex flex-col items-center justify-center rounded-[var(--radius-md)] p-4 text-center transition-colors">
                  <span className="text-text-muted text-[12px] font-medium uppercase tracking-wider">
                    Shared w/ Mgr
                  </span>
                  <p className="text-text mt-1 text-[28px] leading-[32px] font-semibold tabular-nums">
                    {stagesCount.shared}
                  </p>
                </div>
                <div className="bg-surface-2/60 hover:bg-surface-2 flex flex-col items-center justify-center rounded-[var(--radius-md)] p-4 text-center transition-colors">
                  <span className="text-text-muted text-[12px] font-medium uppercase tracking-wider">
                    Interview
                  </span>
                  <p className="text-text mt-1 text-[28px] leading-[32px] font-semibold tabular-nums">
                    {stagesCount.interview}
                  </p>
                </div>
                <div className="bg-surface-2/60 hover:bg-surface-2 flex flex-col items-center justify-center rounded-[var(--radius-md)] p-4 text-center transition-colors">
                  <span className="text-text-muted text-[12px] font-medium uppercase tracking-wider">
                    Offer
                  </span>
                  <p className="text-text mt-1 text-[28px] leading-[32px] font-semibold tabular-nums">
                    {stagesCount.offer}
                  </p>
                </div>
                <div className="bg-surface-2/60 hover:bg-surface-2 flex flex-col items-center justify-center rounded-[var(--radius-md)] p-4 text-center transition-colors">
                  <span className="text-text-muted text-[12px] font-medium uppercase tracking-wider">
                    Joined
                  </span>
                  <p className="text-success mt-1 text-[28px] leading-[32px] font-semibold tabular-nums">
                    {stagesCount.hired}
                  </p>
                </div>
              </div>
            </div>

            {/* Pinned Footer Link */}
            <div className="border-border mt-auto border-t pt-4">
              <Link
                href="/pipeline"
                className="text-text-muted hover:text-accent focus-visible:ring-accent inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors focus-visible:rounded focus-visible:outline-none focus-visible:ring-2"
              >
                <span>View Kanban pipeline board</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.75]" />
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 2 RIGHT (4 cols): Quick Actions */}
        <div className="col-span-12 flex flex-col lg:col-span-4">
          <div className="border-border bg-surface-1 flex h-full flex-col rounded-[var(--radius-lg)] border p-6">
            {/* Header Block: title, 4px subtitle, 16px to content */}
            <div className="mb-4">
              <h2 className="text-text text-[16px] leading-[24px] font-semibold">Quick Actions</h2>
              <p className="text-text-muted mt-1 text-[13px] leading-[20px]">
                Direct links to high-frequency HR operations.
              </p>
            </div>

            {/* Content: 40px row height actions */}
            <div className="flex-1 space-y-1">
              <Link
                href="/candidates"
                className="hover:bg-surface-2 text-text flex h-10 items-center justify-between rounded-[var(--radius-md)] px-3 text-[14px] font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="text-text-muted h-4 w-4 stroke-[1.75]" />
                  <span>Candidate directory</span>
                </div>
                <ChevronRight className="text-text-subtle h-4 w-4 stroke-[1.75]" />
              </Link>

              <Link
                href="/pipeline"
                className="hover:bg-surface-2 text-text flex h-10 items-center justify-between rounded-[var(--radius-md)] px-3 text-[14px] font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <GitPullRequest className="text-text-muted h-4 w-4 stroke-[1.75]" />
                  <span>Pipeline Kanban board</span>
                </div>
                <ChevronRight className="text-text-subtle h-4 w-4 stroke-[1.75]" />
              </Link>

              <Link
                href="/reports"
                className="hover:bg-surface-2 text-text flex h-10 items-center justify-between rounded-[var(--radius-md)] px-3 text-[14px] font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="text-text-muted h-4 w-4 stroke-[1.75]" />
                  <span>Headcount & reports</span>
                </div>
                <ChevronRight className="text-text-subtle h-4 w-4 stroke-[1.75]" />
              </Link>
            </div>

            {/* Pinned Footer Link */}
            <div className="border-border mt-auto border-t pt-4">
              <Link
                href="/settings"
                className="text-text-muted hover:text-accent focus-visible:ring-accent inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors focus-visible:rounded focus-visible:outline-none focus-visible:ring-2"
              >
                <span>Department settings</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.75]" />
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 3 LEFT (8 cols): SLA Watchlist */}
        <div className="col-span-12 flex flex-col lg:col-span-8">
          <div className="border-border bg-surface-1 flex h-full flex-col rounded-[var(--radius-lg)] border p-6">
            {/* Header Block: title, 4px subtitle, 16px to content */}
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-text text-[16px] leading-[24px] font-semibold">
                    SLA Watchlist
                  </h2>
                  {slaAlertCandidates.length > 0 && (
                    <span className="bg-surface-2 text-text-muted rounded-full px-2 py-0.5 text-[12px] font-medium">
                      {slaAlertCandidates.length} Active
                    </span>
                  )}
                </div>
                <p className="text-text-muted mt-1 text-[13px] leading-[20px]">
                  Candidates waiting in evaluation stages needing priority follow-ups.
                </p>
              </div>
            </div>

            {/* Content: Divider rows */}
            <div className="flex-1">
              {slaAlertCandidates.length === 0 ? (
                <div className="text-text-muted flex flex-col items-center justify-center py-8 text-center text-[13px]">
                  <CheckCircle2 className="text-success mb-2 h-7 w-7 stroke-[1.75]" />
                  <p className="font-medium">All candidate SLAs are currently on track</p>
                </div>
              ) : (
                <div className="divide-border divide-y">
                  {slaAlertCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="hover:bg-surface-2 flex flex-col justify-between gap-3 rounded-[var(--radius-md)] px-3 py-3 transition-colors sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-surface-2 text-text-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold">
                          {candidate.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-text text-[14px] leading-[20px] font-semibold">
                            {candidate.name}
                          </p>
                          <div className="text-text-muted flex flex-wrap items-center text-[13px] leading-[20px]">
                            <span>Stage: {candidate.stage}</span>
                            <MetaSeparator />
                            <span>Notice: {candidate.noticePeriod}</span>
                          </div>
                        </div>
                      </div>

                      <div className="self-end sm:self-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-accent hover:bg-accent/10 h-8 px-3 text-[13px] font-medium"
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

            {/* Pinned Footer Link */}
            <div className="border-border mt-auto border-t pt-4">
              <Link
                href="/candidates"
                className="text-text-muted hover:text-accent focus-visible:ring-accent inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors focus-visible:rounded focus-visible:outline-none focus-visible:ring-2"
              >
                <span>View all candidates in directory</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.75]" />
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 3 RIGHT (4 cols): SLA Benchmarks */}
        <div className="col-span-12 flex flex-col lg:col-span-4">
          <div className="border-border bg-surface-1 flex h-full flex-col rounded-[var(--radius-lg)] border p-6">
            {/* Header Block: title, 4px subtitle, 16px to content */}
            <div className="mb-4">
              <h2 className="text-text text-[16px] leading-[24px] font-semibold">
                SLA Benchmarks
              </h2>
              <p className="text-text-muted mt-1 text-[13px] leading-[20px]">
                Recruitment turnaround standard targets.
              </p>
            </div>

            {/* Content: Target Benchmarks */}
            <div className="flex-1">
              <div className="divide-border divide-y text-[13px]">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-text-muted">Resume Review</span>
                  <span className="text-text font-semibold">≤ 48 hours</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-text-muted">Manager Decision</span>
                  <span className="text-text font-semibold">≤ 3 days</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-text-muted">Interview Feedback</span>
                  <span className="text-text font-semibold">≤ 24 hours</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-text-muted">Offer Turnaround</span>
                  <span className="text-text font-semibold">≤ 5 days</span>
                </div>
              </div>
            </div>

            {/* Pinned Footer Link */}
            <div className="border-border mt-auto border-t pt-4">
              <Link
                href="/reports"
                className="text-text-muted hover:text-accent focus-visible:ring-accent inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors focus-visible:rounded focus-visible:outline-none focus-visible:ring-2"
              >
                <span>View SLA analytics report</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.75]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
