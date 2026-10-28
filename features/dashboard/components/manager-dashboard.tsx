'use client';

import * as React from 'react';
import Link from 'next/link';
import { useOpenings } from '@/features/openings/hooks';
import { useCandidates } from '@/features/candidates/hooks';
import { StatCard } from '@/components/hro/stat-card';
import { StatusBadge } from '@/components/hro/status-badge';
import { MetaSeparator } from '@/components/hro/meta-separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { Candidate, Opening } from '@/types/entities';
import {
  ArrowRight,
  Building2,
  Clock,
  Phone,
  MapPin,
  ChevronRight,
  Briefcase,
  CheckCircle2,
  Code2,
  Palette,
  BarChart3,
  Layers,
  Users,
  TrendingUp,
} from 'lucide-react';
import { VideoCameraIcon } from '@/components/ui/icons';
import { formatCtc, formatInterviewDateTime, formatCtcRange } from '@/lib/format';

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
    [candidates, pendingReviewCandidates.length, interviewCandidates.length, offerCandidates.length, hiredCandidates.length]
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
              delta={pendingReviewCandidates.length > 0 ? `${pendingReviewCandidates.length} Action Required` : 'Queue Clear'}
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
          {/* A. Candidates Awaiting Review Telemetry (Info-First, No Inline Action Clutter) */}
          <div className="border border-border bg-surface-1 flex flex-col rounded-[12px] p-5 shadow-xs">
            {/* Header with Direct Redirect Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-text text-[16px] leading-[24px] font-semibold tracking-[-0.01em]">
                    Candidates Awaiting Review
                  </h2>
                  <span className="font-mono text-[11px] font-semibold text-accent bg-accent/10 border border-accent/25 px-2.5 py-0.5 rounded-full select-none">
                    {pendingReviewCandidates.length} Profiles
                  </span>
                </div>
                <p className="text-text-muted text-[12.5px] mt-0.5">
                  Forwarded by talent acquisition. Review dossiers and make shortlist decisions on the queue page.
                </p>
              </div>

              <Link
                href="/shortlist"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-accent/10 border border-accent/25 text-accent hover:bg-accent/20 text-[12.5px] font-semibold transition-all group shrink-0"
              >
                <span>Open Review Queue</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Content: Department Breakdown Matrix (Each Tile Links to /shortlist) */}
            <div className="pt-4 flex-1">
              {isInitialLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Skeleton className="h-[100px] rounded-[10px]" />
                  <Skeleton className="h-[100px] rounded-[10px]" />
                </div>
              ) : pendingReviewCandidates.length === 0 ? (
                <div className="flex h-36 flex-col items-center justify-center text-center select-none">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500/70 mb-2" />
                  <p className="text-text text-[13.5px] font-medium">Review Queue Clear</p>
                  <p className="text-text-subtle text-[12px] mt-0.5">
                    No candidate profiles are currently awaiting hiring manager evaluation.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {departmentGroups.map((group) => {
                      const GroupIcon = group.icon;

                      return (
                        <Link
                          key={group.id}
                          href="/shortlist"
                          className="group flex flex-col justify-between rounded-[10px] border border-border/70 bg-surface-2/30 p-3.5 hover:border-border-strong hover:bg-surface-2/60 transition-all cursor-pointer"
                        >
                          <div>
                            {/* Department Title & Count */}
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-accent/15 text-accent shrink-0">
                                  <GroupIcon className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-[13px] font-semibold text-text truncate group-hover:text-accent transition-colors">
                                  {group.title}
                                </span>
                              </div>
                              <span className="font-mono text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
                                {group.candidates.length} {group.candidates.length === 1 ? 'profile' : 'profiles'}
                              </span>
                            </div>

                            {/* Top Profiles Overview (Sharp Read-only Info) */}
                            <div className="mt-2.5 space-y-1.5">
                              {group.candidates.slice(0, 2).map((c) => (
                                <div key={c.id} className="flex items-center justify-between text-[11.5px] min-w-0">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-text font-medium truncate">{c.name}</span>
                                    <span className="text-text-subtle text-[10.5px]">({c.experienceYears}y exp)</span>
                                  </div>
                                  <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold shrink-0">
                                    {formatCtc(c.expectedCtc)}
                                  </span>
                                </div>
                              ))}
                              {group.candidates.length > 2 && (
                                <p className="text-[10.5px] text-text-subtle pt-0.5">
                                  +{group.candidates.length - 2} more awaiting review
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Hint Redirect */}
                          <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-text-subtle group-hover:text-accent transition-colors">
                            <span className="font-medium">Review Department Queue</span>
                            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* B. Talent Pipeline Velocity & Throughput Tracker (Redirects to /pipeline) */}
          <div className="border border-border bg-surface-1 flex flex-col rounded-[12px] p-5 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div>
                <h2 className="text-text text-[15px] font-semibold tracking-[-0.01em]">
                  Talent Pipeline Velocity
                </h2>
                <p className="text-text-muted text-[12.5px] mt-0.5">
                  {candidates.length} candidates progressing across evaluation stages
                </p>
              </div>

              <Link
                href="/pipeline"
                className="inline-flex items-center gap-1 text-[12.5px] font-medium text-text-muted hover:text-text transition-colors shrink-0"
              >
                <span>Open Pipeline Board</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Progression Track: Each Step Links to /pipeline */}
            <div className="pt-4 space-y-4">
              <div className="border border-border/80 bg-surface-2/30 grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-border/60 rounded-[10px] overflow-hidden">
                {/* 1. Sourced */}
                <Link
                  href="/pipeline"
                  className="p-3.5 flex flex-col justify-between hover:bg-surface-2/60 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[12px] font-medium group-hover:text-text">
                      1. Sourced
                    </span>
                    <span className="text-text-subtle font-mono text-[11px] tabular-nums">
                      {Math.round((stagesCount.sourced / totalCandidates) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="text-text font-mono text-[22px] font-semibold tabular-nums">
                      {stagesCount.sourced}
                    </span>
                    <span className="text-text-subtle text-[11px]">in pool</span>
                  </div>
                </Link>

                {/* 2. Manager Review */}
                <Link
                  href="/shortlist"
                  className="p-3.5 flex flex-col justify-between hover:bg-surface-2/60 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[12px] font-medium group-hover:text-text">
                      2. Review
                    </span>
                    <span className="text-accent font-mono text-[11px] font-semibold tabular-nums">
                      {Math.round((stagesCount.shared / totalCandidates) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="text-accent font-mono text-[22px] font-semibold tabular-nums">
                      {stagesCount.shared}
                    </span>
                    <span className="text-text-subtle text-[11px]">pending</span>
                  </div>
                </Link>

                {/* 3. Technical Interview */}
                <Link
                  href="/interviews"
                  className="p-3.5 flex flex-col justify-between hover:bg-surface-2/60 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[12px] font-medium group-hover:text-text">
                      3. Interview
                    </span>
                    <span className="text-text-subtle font-mono text-[11px] tabular-nums">
                      {Math.round((stagesCount.interview / totalCandidates) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="text-text font-mono text-[22px] font-semibold tabular-nums">
                      {stagesCount.interview}
                    </span>
                    <span className="text-text-subtle text-[11px]">rounds</span>
                  </div>
                </Link>

                {/* 4. Offer Stage */}
                <Link
                  href="/pipeline"
                  className="p-3.5 flex flex-col justify-between hover:bg-surface-2/60 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-[12px] font-medium group-hover:text-text">
                      4. Offer
                    </span>
                    <span className="text-text-subtle font-mono text-[11px] tabular-nums">
                      {Math.round((stagesCount.offer / totalCandidates) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="text-text font-mono text-[22px] font-semibold tabular-nums">
                      {stagesCount.offer}
                    </span>
                    <span className="text-text-subtle text-[11px]">extended</span>
                  </div>
                </Link>

                {/* 5. Joined */}
                <Link
                  href="/pipeline"
                  className="p-3.5 col-span-2 sm:col-span-1 flex flex-col justify-between bg-accent/5 hover:bg-accent/10 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-accent text-[12px] font-semibold">
                      5. Joined
                    </span>
                    <span className="text-accent font-mono text-[11px] font-bold tabular-nums">
                      {Math.round((stagesCount.hired / totalCandidates) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="text-accent font-mono text-[22px] font-bold tabular-nums">
                      {stagesCount.hired}
                    </span>
                    <span className="text-accent/80 text-[11px]">finalized</span>
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
                    {stagesCount.hired} hires finalized ({Math.round((stagesCount.hired / totalCandidates) * 100)}% conversion)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 cols): Upcoming Schedules & Key Benchmarks */}
        <div className="col-span-12 flex flex-col space-y-6 lg:col-span-4">
          {/* C. Technical Interviews Schedule (Agenda List, Links to /interviews) */}
          <div className="border border-border bg-surface-1 flex flex-col justify-between rounded-[12px] p-5 shadow-xs">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/60">
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
                  className="inline-flex items-center gap-1 text-[13px] leading-[20px] font-medium text-text-muted hover:text-text transition-colors shrink-0"
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
                    <Clock className="h-6 w-6 text-text-subtle mb-1.5 opacity-60" />
                    <p className="text-text text-[14px] font-medium">No interviews scheduled</p>
                    <p className="text-text-subtle text-[12px] mt-0.5">
                      Shortlist candidates to begin scheduling technical discussions.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/60">
                    {interviewCandidates.slice(0, 4).map((candidate) => {
                      const mode = candidate.interviewMode ?? 'Video';
                      const ModeIcon = mode === 'Phone' ? Phone : mode === 'Onsite' ? MapPin : VideoCameraIcon;

                      return (
                        <Link
                          key={candidate.id}
                          href="/interviews"
                          className="group hover:bg-surface-2 -mx-2 flex flex-col justify-between gap-1.5 rounded-[8px] px-2 py-3 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-text truncate text-[14px] leading-[20px] font-medium">
                              {candidate.name}
                            </span>
                            <span
                              className="text-text-subtle group-hover:text-text-muted transition-colors shrink-0 flex items-center"
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
            <div className="pt-3 border-t border-border/60 mt-2">
              <Link
                href="/interviews"
                className="flex items-center justify-between text-[13px] leading-[20px] text-text-muted hover:text-text font-medium transition-colors"
              >
                <span>Manage Interview Scorecards</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* D. Operational Benchmarks & Hiring Health Telemetry */}
          <div className="border border-border bg-surface-1 flex flex-col justify-between rounded-[12px] p-5 shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <h2 className="text-text text-[15px] font-semibold tracking-[-0.01em]">
                    Hiring Telemetry
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full select-none">
                  Healthy Velocity
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3.5">
                <div className="p-3 rounded-[8px] bg-surface-2/40 border border-border/60">
                  <span className="text-text-subtle text-[10.5px] uppercase font-semibold tracking-wider block">
                    Avg. Time-to-Hire
                  </span>
                  <p className="text-text font-bold font-mono text-[16px] mt-1">18 Days</p>
                  <span className="text-emerald-600 dark:text-emerald-400 text-[10.5px] font-medium block mt-0.5">
                    Top 10% benchmark
                  </span>
                </div>

                <div className="p-3 rounded-[8px] bg-surface-2/40 border border-border/60">
                  <span className="text-text-subtle text-[10.5px] uppercase font-semibold tracking-wider block">
                    Offer Acceptance
                  </span>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[16px] mt-1">
                    94.2%
                  </p>
                  <span className="text-text-subtle text-[10.5px] font-medium block mt-0.5">
                    vs 82% industry avg
                  </span>
                </div>

                <div className="p-3 rounded-[8px] bg-surface-2/40 border border-border/60">
                  <span className="text-text-subtle text-[10.5px] uppercase font-semibold tracking-wider block">
                    AI Match Conviction
                  </span>
                  <p className="text-accent font-bold font-mono text-[16px] mt-1">88%</p>
                  <span className="text-text-subtle text-[10.5px] font-medium block mt-0.5">
                    Verified competencies
                  </span>
                </div>

                <div className="p-3 rounded-[8px] bg-surface-2/40 border border-border/60">
                  <span className="text-text-subtle text-[10.5px] uppercase font-semibold tracking-wider block">
                    Review SLA
                  </span>
                  <p className="text-text font-bold font-mono text-[16px] mt-1">&lt; 24h</p>
                  <span className="text-text-subtle text-[10.5px] font-medium block mt-0.5">
                    Target: 48h turnaround
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 mt-3">
              <Link
                href="/reports"
                className="flex items-center justify-between text-[12px] text-text-subtle hover:text-text font-medium transition-colors"
              >
                <span>View Full Analytics & Reports</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW (12 cols full-width): Active Requisitions Overview (Clean Table Redirecting to /openings) */}
        <div className="col-span-12 flex flex-col">
          <div className="border border-border bg-surface-1 flex flex-col rounded-[12px] p-5 shadow-xs">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-text text-[16px] leading-[24px] font-semibold tracking-[-0.01em]">
                    Active Requisitions Overview
                  </h2>
                  <span className="font-mono text-[11px] font-semibold text-accent bg-accent/10 border border-accent/25 px-2.5 py-0.5 rounded-full select-none">
                    {activeOpenings.length} Active Openings
                  </span>
                </div>
                <p className="text-text-muted text-[12.5px] mt-0.5">
                  Live recruitment openings across departments with budget targets and candidate pools.
                </p>
              </div>

              <Link
                href="/openings"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-surface-2 border border-border/70 text-text hover:border-border-strong text-[12.5px] font-semibold transition-all group shrink-0"
              >
                <span>View All Openings</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Clean Structured Requisitions List */}
            <div className="overflow-x-auto pt-2">
              <div className="min-w-[700px] divide-y divide-border/60">
                {/* Table Header */}
                <div className="grid grid-cols-[minmax(220px,2fr)_minmax(140px,1.2fr)_minmax(130px,1fr)_minmax(120px,1fr)_minmax(90px,0.8fr)] items-center gap-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-text-subtle select-none">
                  <div>Requisition & Role</div>
                  <div>Department</div>
                  <div>Target Budget (CTC)</div>
                  <div>Candidate Pool</div>
                  <div className="text-right">Status</div>
                </div>

                {/* Rows */}
                {activeOpenings.map((opening) => {
                  const poolCount = candidates.filter((c) => c.openingId === opening.id).length;
                  const inReviewCount = candidates.filter(
                    (c) => c.openingId === opening.id && c.stage === 'Shared with Manager'
                  ).length;

                  return (
                    <Link
                      key={opening.id}
                      href={`/openings/${opening.id}`}
                      className="group hover:bg-surface-2/60 grid grid-cols-[minmax(220px,2fr)_minmax(140px,1.2fr)_minmax(130px,1fr)_minmax(120px,1fr)_minmax(90px,0.8fr)] items-center gap-4 py-3 px-1 transition-colors cursor-pointer"
                    >
                      {/* 1. Title & Details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-text font-semibold text-[13.5px] truncate group-hover:text-accent transition-colors">
                            {opening.title}
                          </span>
                        </div>
                        <p className="text-text-muted text-[11.5px] truncate mt-0.5">
                          <span>{opening.experienceRange.min}-{opening.experienceRange.max} yrs exp</span>
                          <span className="mx-1.5 text-text-subtle/80">&middot;</span>
                          <span>{opening.location}</span>
                        </p>
                      </div>

                      {/* 2. Department */}
                      <div className="flex items-center gap-1.5 min-w-0 text-[12.5px] font-medium text-text-muted">
                        <Building2 className="h-3.5 w-3.5 text-text-subtle shrink-0" />
                        <span className="truncate">{opening.department}</span>
                      </div>

                      {/* 3. Budget */}
                      <div className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-[12px]">
                        {formatCtcRange(opening.budgetRange.min, opening.budgetRange.max)}
                      </div>

                      {/* 4. Candidate Pool */}
                      <div className="text-[12px] text-text-muted">
                        <span className="font-semibold text-text">{poolCount}</span> candidates
                        {inReviewCount > 0 && (
                          <span className="text-accent font-semibold ml-1 text-[11px]">
                            ({inReviewCount} in review)
                          </span>
                        )}
                      </div>

                      {/* 5. Status Badge */}
                      <div className="flex justify-end">
                        <StatusBadge status={opening.status} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
