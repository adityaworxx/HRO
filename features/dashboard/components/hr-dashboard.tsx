'use client';

import * as React from 'react';
import Link from 'next/link';
import { useOpenings, useUpdateOpeningStatus } from '@/features/openings/hooks';
import { useCandidates } from '@/features/candidates/hooks';
import { useAllOnboarding } from '@/features/onboarding/hooks';
import { StatCard } from '@/components/hro/stat-card';
import { StatusBadge } from '@/components/hro/status-badge';
import { MetaSeparator } from '@/components/hro/meta-separator';
import { ActiveOpeningsCard } from '@/components/hro/active-openings-card';
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

  const isInitialLoading = loadingOpenings || loadingCandidates || loadingOnboarding;

  return (
    <div className="w-full">
      {/* KPI Stat Cards Grid: 24px gap throughout */}
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
        {/* ROW 1: Active Openings (12 cols full-width table card) */}
        <div className="col-span-12 flex flex-col">
          <ActiveOpeningsCard
            openings={openings}
            candidates={candidates}
            title="Active Openings"
            subtitle={`${openings.length - onHoldRequisitions.length} active, ${onHoldRequisitions.length} on hold`}
            viewAllHref="/openings"
            isLoading={isInitialLoading}
            onReactivate={handleReactivate}
          />
        </div>

        {/* ROW 2 LEFT (8 cols): Active Pipeline Throughput */}
        <div className="col-span-12 flex flex-col lg:col-span-8">
          <div className="border border-border bg-surface-1 flex h-full flex-col rounded-[12px] p-5">
            {/* Header: title + subtitle left, text link right */}
            <div className="flex items-start justify-between gap-4 pb-4">
              <div>
                <h2 className="text-text text-[16px] leading-[24px] font-medium tracking-[-0.01em]">
                  Active Pipeline Throughput
                </h2>
                <p className="text-text-muted mt-[2px] text-[13px] leading-[20px]">
                  Candidate volume distribution across recruitment stages
                </p>
              </div>
              <Link
                href="/pipeline"
                className="inline-flex items-center gap-1 text-[13px] leading-[20px] font-medium text-text-muted hover:text-text transition-colors shrink-0"
              >
                <span>View pipeline</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Content: 5 Stage Metric Blocks */}
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="bg-surface-2/60 hover:bg-surface-2 flex flex-col items-center justify-center rounded-[8px] p-4 text-center transition-colors">
                  <span className="text-text-muted text-[12px] font-medium uppercase tracking-wider">
                    Sourced
                  </span>
                  <p className="text-text mt-1 text-[26px] leading-[32px] font-medium tabular-nums">
                    {stagesCount.sourced}
                  </p>
                </div>
                <div className="bg-surface-2/60 hover:bg-surface-2 flex flex-col items-center justify-center rounded-[8px] p-4 text-center transition-colors">
                  <span className="text-text-muted text-[12px] font-medium uppercase tracking-wider">
                    Shared w/ Mgr
                  </span>
                  <p className="text-text mt-1 text-[26px] leading-[32px] font-medium tabular-nums">
                    {stagesCount.shared}
                  </p>
                </div>
                <div className="bg-surface-2/60 hover:bg-surface-2 flex flex-col items-center justify-center rounded-[8px] p-4 text-center transition-colors">
                  <span className="text-text-muted text-[12px] font-medium uppercase tracking-wider">
                    Interview
                  </span>
                  <p className="text-text mt-1 text-[26px] leading-[32px] font-medium tabular-nums">
                    {stagesCount.interview}
                  </p>
                </div>
                <div className="bg-surface-2/60 hover:bg-surface-2 flex flex-col items-center justify-center rounded-[8px] p-4 text-center transition-colors">
                  <span className="text-text-muted text-[12px] font-medium uppercase tracking-wider">
                    Offer
                  </span>
                  <p className="text-text mt-1 text-[26px] leading-[32px] font-medium tabular-nums">
                    {stagesCount.offer}
                  </p>
                </div>
                <div className="bg-surface-2/60 hover:bg-surface-2 flex flex-col items-center justify-center rounded-[8px] p-4 text-center transition-colors">
                  <span className="text-text-muted text-[12px] font-medium uppercase tracking-wider">
                    Joined
                  </span>
                  <p className="text-success mt-1 text-[26px] leading-[32px] font-medium tabular-nums">
                    {stagesCount.hired}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2 RIGHT (4 cols): Onboarding Readiness */}
        <div className="col-span-12 flex flex-col lg:col-span-4">
          <div className="border border-border bg-surface-1 flex h-full flex-col rounded-[12px] p-5">
            {/* Header: title + subtitle left, text link right */}
            <div className="flex items-start justify-between gap-4 pb-4">
              <div>
                <h2 className="text-text text-[16px] leading-[24px] font-medium tracking-[-0.01em]">
                  Onboarding Readiness
                </h2>
                <p className="text-text-muted mt-[2px] text-[13px] leading-[20px]">
                  {completedTasks} of {totalTasks} tasks completed · <span className="tabular-nums">{onboardingPercent}%</span>
                </p>
              </div>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-1 text-[13px] leading-[20px] font-medium text-text-muted hover:text-text transition-colors shrink-0"
              >
                <span>View checklist</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Content: Progress bar & Incoming Hires */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[13px] leading-[20px]">
                  <span className="text-text-muted font-normal">Task Completion Rate</span>
                  <span className="text-text font-medium tabular-nums">{onboardingPercent}%</span>
                </div>
                <Progress value={onboardingPercent} className="h-2" />
                <p className="text-text-subtle text-[12px] leading-[16px]">
                  {completedTasks} of {totalTasks} onboarding requirements fulfilled.
                </p>
              </div>

              <div className="border-border space-y-2 border-t pt-3">
                <p className="text-text text-[13px] font-medium">Incoming Hires:</p>
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
          </div>
        </div>

        {/* ROW 3 LEFT (8 cols): SLA Watchlist */}
        <div className="col-span-12 flex flex-col lg:col-span-8">
          <div className="border border-border bg-surface-1 flex h-full flex-col rounded-[12px] p-5">
            {/* Header: title + subtitle left, text link right */}
            <div className="flex items-start justify-between gap-4 pb-4">
              <div>
                <h2 className="text-text text-[16px] leading-[24px] font-medium tracking-[-0.01em]">
                  SLA Watchlist
                </h2>
                <p className="text-text-muted mt-[2px] text-[13px] leading-[20px]">
                  {slaAlertCandidates.length} candidate SLAs requiring priority follow-up
                </p>
              </div>
              <Link
                href="/candidates"
                className="inline-flex items-center gap-1 text-[13px] leading-[20px] font-medium text-text-muted hover:text-text transition-colors shrink-0"
              >
                <span>View all</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Content: Divider rows */}
            <div className="flex-1">
              {slaAlertCandidates.length === 0 ? (
                <div className="text-text-muted flex flex-col items-center justify-center py-8 text-center text-[13px]">
                  <p className="font-medium">All candidate SLAs are currently on track</p>
                </div>
              ) : (
                <div className="divide-border divide-y">
                  {slaAlertCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="group hover:bg-surface-2 -mx-2 flex flex-col justify-between gap-3 rounded-[8px] px-2 py-3 transition-colors sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-surface-2 text-text flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-medium">
                          {candidate.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-text text-[14px] leading-[20px] font-medium">
                            {candidate.name}
                          </p>
                          <div className="text-text-muted flex flex-wrap items-center text-[13px] leading-[20px]">
                            <span>Stage: {candidate.stage}</span>
                            <MetaSeparator />
                            <span>Notice: {candidate.noticePeriod}</span>
                          </div>
                        </div>
                      </div>

                      <div className="self-end sm:self-center opacity-100 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-text-muted hover:text-text h-8 px-2 text-[13px] font-medium"
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

        {/* ROW 3 RIGHT (4 cols): Quick Actions */}
        <div className="col-span-12 flex flex-col lg:col-span-4">
          <div className="border border-border bg-surface-1 flex h-full flex-col rounded-[12px] p-5">
            <div className="pb-4">
              <h2 className="text-text text-[16px] leading-[24px] font-medium tracking-[-0.01em]">Quick Actions</h2>
              <p className="text-text-muted mt-[2px] text-[13px] leading-[20px]">
                Direct links to high-frequency HR operations
              </p>
            </div>

            {/* Content: 40px row height actions */}
            <div className="flex-1 space-y-1">
              <Link
                href="/candidates"
                className="hover:bg-surface-2 text-text flex h-10 items-center justify-between rounded-[8px] px-3 text-[14px] font-medium transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="text-text-subtle h-4 w-4 stroke-[1.75]" />
                  <span>Candidate directory</span>
                </div>
                <ChevronRight className="text-text-subtle h-4 w-4 stroke-[1.75]" />
              </Link>

              <Link
                href="/pipeline"
                className="hover:bg-surface-2 text-text flex h-10 items-center justify-between rounded-[8px] px-3 text-[14px] font-medium transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GitPullRequest className="text-text-subtle h-4 w-4 stroke-[1.75]" />
                  <span>Pipeline Kanban board</span>
                </div>
                <ChevronRight className="text-text-subtle h-4 w-4 stroke-[1.75]" />
              </Link>

              <Link
                href="/reports"
                className="hover:bg-surface-2 text-text flex h-10 items-center justify-between rounded-[8px] px-3 text-[14px] font-medium transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="text-text-subtle h-4 w-4 stroke-[1.75]" />
                  <span>Headcount & reports</span>
                </div>
                <ChevronRight className="text-text-subtle h-4 w-4 stroke-[1.75]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
