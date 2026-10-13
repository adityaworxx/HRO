'use client';

import * as React from 'react';
import Link from 'next/link';
import { useOpenings, useUpdateOpeningStatus } from '@/features/openings/hooks';
import { useCandidates } from '@/features/candidates/hooks';
import { useAllOnboarding } from '@/features/onboarding/hooks';
import { useCurrentUser } from '@/features/auth/hooks';
import { StatCard } from '@/components/hro/stat-card';
import { StatusBadge } from '@/components/hro/status-badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  GitPullRequest,
  Users,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

export function HrDashboard() {
  const { data: user } = useCurrentUser();
  const { data: openings = [] } = useOpenings();
  const { data: candidates = [] } = useCandidates();
  const { data: onboardingItems = [] } = useAllOnboarding();
  const updateOpeningStatus = useUpdateOpeningStatus();

  // Openings metrics
  const openRequisitions = openings.filter((o) => o.status === 'Open' || o.status === 'Sourcing');
  const onHoldRequisitions = openings.filter((o) => o.status === 'On Hold');
  const hiredCandidates = candidates.filter(
    (c) => c.stage === 'Joined' || c.stage === 'Selected' || c.stage === 'Offer Sent'
  );

  // Candidate stages distribution
  const stagesCount = {
    sourced: candidates.filter((c) => c.stage === 'Sourced').length,
    shared: candidates.filter((c) => c.stage === 'Shared with Manager').length,
    interview: candidates.filter((c) => c.stage === 'Interview').length,
    offer: candidates.filter((c) => c.stage === 'Selected' || c.stage === 'Offer Sent').length,
    hired: candidates.filter((c) => c.stage === 'Joined').length,
  };

  // Simulated SLA warning candidates (candidates waiting in interview or manager review)
  const slaAlertCandidates = candidates
    .filter((c) => c.stage === 'Interview' || c.stage === 'Shared with Manager')
    .slice(0, 3);

  // Onboarding completion rate
  const completedTasks = onboardingItems.filter((item) => item.done).length;
  const totalTasks = onboardingItems.length || 1;
  const onboardingPercent = Math.round((completedTasks / totalTasks) * 100);

  const handleReactivate = (id: string, title: string) => {
    updateOpeningStatus.mutate(
      { id, status: 'Open' },
      {
        onSuccess: () => {
          toast.success(`Requisition "${title}" has been reactivated to Open!`);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-text text-2xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] ?? 'HR Specialist'} 👋
          </h1>
          <p className="text-text-muted text-[14px]">
            Company-wide hiring health, pipeline throughput, and onboarding operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="primary" className="gap-2">
            <Link href="/pipeline">
              <GitPullRequest className="h-4 w-4" />
              <span>Open Pipeline Board</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Open Requisitions"
          value={openRequisitions.length}
          delta="+2 this month"
        />
        <StatCard
          label="Active Candidates"
          value={candidates.length}
          delta="Across all stages"
        />
        <StatCard
          label="On-Hold Requisitions"
          value={onHoldRequisitions.length}
          delta={onHoldRequisitions.length > 0 ? 'Requires attention' : 'None'}
        />
        <StatCard
          label="Onboarding Progress"
          value={`${onboardingPercent}%`}
          delta={`${completedTasks} of ${totalTasks} tasks done`}
        />
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2/3 width) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Active Requisitions Monitoring */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-[17px]">Requisitions Under Review</CardTitle>
                  {onHoldRequisitions.length > 0 && (
                    <Badge variant="warning" className="font-semibold">
                      {onHoldRequisitions.length} On Hold
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-[13px]">
                  Track active requisition milestones, headcount allocations, and status updates.
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-accent gap-1 text-[13px]">
                <Link href="/openings">
                  <span>All Openings</span>
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {openings.slice(0, 4).map((opening) => (
                <div
                  key={opening.id}
                  className="border-border bg-surface-2/40 hover:bg-surface-2 flex flex-col justify-between gap-3 rounded-[var(--radius-md)] border p-3.5 transition-colors sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/openings/${opening.id}`}
                        className="text-text hover:text-accent font-semibold text-[14px] transition-colors"
                      >
                        {opening.title}
                      </Link>
                      <StatusBadge status={opening.status} type="opening" />
                    </div>
                    <p className="text-text-muted flex items-center gap-2 text-[12px]">
                      <span>{opening.department}</span>
                      <span>•</span>
                      <span>{opening.location}</span>
                      <span>•</span>
                      <span>Budget: ₹{opening.budgetRange.min}L - ₹{opening.budgetRange.max}L</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {opening.status === 'On Hold' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleReactivate(opening.id, opening.title)}
                        className="h-8 gap-1 text-[12px]"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Reactivate</span>
                      </Button>
                    )}
                    <Button asChild variant="outline" size="sm" className="h-8 text-[12px]">
                      <Link href={`/openings/${opening.id}`}>Details</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pipeline Funnel Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[17px] flex items-center gap-2">
                <TrendingUp className="text-accent h-4 w-4" />
                <span>Active Pipeline Throughput</span>
              </CardTitle>
              <CardDescription className="text-[13px]">
                Candidate volume distribution across recruitment stages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="border-border bg-surface-2/40 rounded-lg border p-3 text-center space-y-1">
                  <span className="text-text-muted text-[11px] font-medium uppercase tracking-wider">
                    Sourced
                  </span>
                  <p className="text-text text-xl font-bold">{stagesCount.sourced}</p>
                </div>
                <div className="border-border bg-surface-2/40 rounded-lg border p-3 text-center space-y-1">
                  <span className="text-text-muted text-[11px] font-medium uppercase tracking-wider">
                    Shared w/ Mgr
                  </span>
                  <p className="text-text text-xl font-bold">{stagesCount.shared}</p>
                </div>
                <div className="border-border bg-surface-2/40 rounded-lg border p-3 text-center space-y-1">
                  <span className="text-text-muted text-[11px] font-medium uppercase tracking-wider">
                    Interview
                  </span>
                  <p className="text-text text-xl font-bold">{stagesCount.interview}</p>
                </div>
                <div className="border-border bg-surface-2/40 rounded-lg border p-3 text-center space-y-1">
                  <span className="text-text-muted text-[11px] font-medium uppercase tracking-wider">
                    Offer
                  </span>
                  <p className="text-text text-xl font-bold">{stagesCount.offer}</p>
                </div>
                <div className="border-border bg-surface-2/40 rounded-lg border p-3 text-center space-y-1">
                  <span className="text-text-muted text-[11px] font-medium uppercase tracking-wider">
                    Joined
                  </span>
                  <p className="text-success text-xl font-bold">{stagesCount.hired}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SLA Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-[17px] flex items-center gap-2">
                  <Clock className="text-warning h-4 w-4" />
                  <span>SLA Watchlist</span>
                </CardTitle>
                <CardDescription className="text-[13px]">
                  Candidates waiting in evaluation stages needing priority follow-ups.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {slaAlertCandidates.length === 0 ? (
                <div className="text-text-muted border-border/60 flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed py-6 text-center text-[13px]">
                  <CheckCircle2 className="text-success mb-2 h-7 w-7 opacity-80" />
                  <p className="font-medium">No candidates past SLA</p>
                </div>
              ) : (
                slaAlertCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="border-border bg-surface-2/30 flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-[11px]">
                          {candidate.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-text font-semibold text-[13px]">{candidate.name}</p>
                        <p className="text-text-muted text-[11px]">
                          Stage: {candidate.stage} • Notice: {candidate.noticePeriod}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-accent hover:bg-accent/10 h-8 text-[12px]"
                      onClick={() => toast.success(`Nudge reminder sent for ${candidate.name}`)}
                    >
                      Nudge Team
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          {/* Onboarding Health Tracker */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[16px] flex items-center gap-2">
                <AlertTriangle className="text-accent h-4 w-4" />
                <span>Onboarding Readiness</span>
              </CardTitle>
              <CardDescription className="text-[12px]">
                Hardware dispatch and paperwork status for incoming hires.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[12px]">
                  <span className="text-text-muted">Task Completion Rate</span>
                  <span className="text-text font-semibold">{onboardingPercent}%</span>
                </div>
                <Progress value={onboardingPercent} className="h-2" />
                <p className="text-text-subtle text-[11px]">
                  {completedTasks} of {totalTasks} onboarding requirements fulfilled.
                </p>
              </div>

              <div className="border-border border-t pt-3 space-y-2">
                <p className="text-text text-[13px] font-semibold">Incoming Hires:</p>
                {hiredCandidates.slice(0, 2).map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between text-[12px]">
                    <span className="text-text font-medium">{candidate.name}</span>
                    <span className="text-text-muted">{candidate.currentRole}</span>
                  </div>
                ))}
              </div>

              <Button asChild variant="outline" className="w-full text-[12px] h-8">
                <Link href="/onboarding">View Onboarding Checklist</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Shortcuts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[16px] flex items-center gap-2">
                <Sparkles className="text-accent h-4 w-4" />
                <span>HR Quick Links</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start gap-2 h-9 text-[13px]">
                <Link href="/pipeline">
                  <GitPullRequest className="h-4 w-4 text-accent" />
                  <span>Kanban Pipeline Board</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2 h-9 text-[13px]">
                <Link href="/candidates">
                  <Users className="h-4 w-4 text-accent" />
                  <span>Candidate Directory</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2 h-9 text-[13px]">
                <Link href="/reports">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <span>Headcount & Reports</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

