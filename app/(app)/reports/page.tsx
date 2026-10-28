'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useOpenings } from '@/features/openings/hooks';
import { useCandidates } from '@/features/candidates/hooks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/hro/stat-card';
import { Progress } from '@/components/ui/progress';

const monthlyVelocityData = [
  { label: 'May', barA: 6, barB: 4, tipA: 'offers', tipB: 'joined' },
  { label: 'Jun', barA: 8, barB: 6, tipA: 'offers', tipB: 'joined' },
  { label: 'Jul', barA: 5, barB: 3, tipA: 'offers', tipB: 'joined' },
  { label: 'Aug', barA: 9, barB: 7, tipA: 'offers', tipB: 'joined' },
  { label: 'Sep', barA: 11, barB: 8, tipA: 'offers', tipB: 'joined' },
  { label: 'Oct', barA: 7, barB: 5, tipA: 'offers', tipB: 'joined' },
];

const sourcesSharedData = [
  { label: 'LinkedIn', barA: 10, barB: 8, tipA: 'sourced', tipB: 'shared with mgr' },
  { label: 'Referrals', barA: 7, barB: 6, tipA: 'sourced', tipB: 'shared with mgr' },
  { label: 'Naukri', barA: 6, barB: 5, tipA: 'sourced', tipB: 'shared with mgr' },
  { label: 'Indeed', barA: 4, barB: 3, tipA: 'sourced', tipB: 'shared with mgr' },
  { label: 'Other', barA: 3, barB: 2, tipA: 'sourced', tipB: 'shared with mgr' },
];

const monthlyPipelineData = [
  { label: 'May', barA: 20, barB: 16, tipA: 'sourced', tipB: 'shared with mgr' },
  { label: 'Jun', barA: 24, barB: 20, tipA: 'sourced', tipB: 'shared with mgr' },
  { label: 'Jul', barA: 18, barB: 15, tipA: 'sourced', tipB: 'shared with mgr' },
  { label: 'Aug', barA: 26, barB: 21, tipA: 'sourced', tipB: 'shared with mgr' },
  { label: 'Sep', barA: 32, barB: 27, tipA: 'sourced', tipB: 'shared with mgr' },
  { label: 'Oct', barA: 22, barB: 18, tipA: 'sourced', tipB: 'shared with mgr' },
];

const channelBreakdownData = [
  { source: 'LinkedIn Talent', count: 10, pct: 33, tag: 'High Volume', convRate: '28% offer rate' },
  { source: 'Employee Referrals', count: 7, pct: 23, tag: 'Top ROI', convRate: '57% offer rate' },
  {
    source: 'Naukri Direct',
    count: 6,
    pct: 20,
    tag: 'Active Pipeline',
    convRate: '18% offer rate',
  },
  { source: 'Indeed Direct', count: 4, pct: 14, tag: 'Inbound', convRate: '15% offer rate' },
  { source: 'Agency & Other', count: 3, pct: 10, tag: 'Specialist', convRate: '33% offer rate' },
];

export default function ReportsPage() {
  const { data: openings = [] } = useOpenings();
  const { data: candidates = [] } = useCandidates();
  const [graphMode, setGraphMode] = React.useState<'velocity' | 'sources' | 'monthly'>('velocity');

  // Requisitions stats
  const activeOpenings = openings.filter((o) => o.status !== 'Closed').length;
  const totalHeadcount = openings.reduce((acc, o) => acc + o.headcount, 0);

  // Candidates stats
  const totalCandidates = candidates.length || 30;
  const hiredCount = candidates.filter((c) => c.stage === 'Joined').length;
  const offerCount = candidates.filter(
    (c) => c.stage === 'Selected' || c.stage === 'Offer Sent'
  ).length;
  const interviewCount = candidates.filter((c) => c.stage === 'Interview').length;

  // Stages count for Cumulative Funnel
  const funnelStages = [
    {
      num: '01',
      label: 'Sourced & Screened',
      sub: 'Initial qualified talent pool',
      count: totalCandidates,
      pct: 100,
      note: '5 active in screening',
    },
    {
      num: '02',
      label: 'Shared with Manager',
      sub: 'Hiring manager review queue',
      count: Math.round(totalCandidates * 0.83),
      pct: 83,
      note: '83% manager review rate',
    },
    {
      num: '03',
      label: 'Technical Interviews',
      sub: 'Competency & structured evaluation',
      count: Math.round(totalCandidates * 0.53),
      pct: 53,
      note: '64% interview clearance',
    },
    {
      num: '04',
      label: 'Offer Stage',
      sub: 'Formal compensation proposals',
      count: Math.round(totalCandidates * 0.4),
      pct: 40,
      note: '75% offer advance rate',
    },
    {
      num: '05',
      label: 'Joined & Placed',
      sub: 'Confirmed hires onboarded',
      count: Math.round(totalCandidates * 0.27),
      pct: 27,
      note: '27% net funnel yield',
    },
  ];

  // Department distribution
  const departmentStats = React.useMemo(() => {
    const depts: Record<string, { openings: number; headcount: number }> = {};
    openings.forEach((o) => {
      if (!depts[o.department]) {
        depts[o.department] = { openings: 0, headcount: 0 };
      }
      depts[o.department]!.openings += 1;
      depts[o.department]!.headcount += o.headcount;
    });
    return Object.entries(depts).map(([department, data]) => ({
      department,
      ...data,
      sharePct: Math.round((data.headcount / (totalHeadcount || 1)) * 100),
    }));
  }, [openings, totalHeadcount]);

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards (1x4 Grid) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Openings"
          value={activeOpenings}
          delta={`${totalHeadcount} total headcounts`}
        />
        <StatCard label="Total Talent Pool" value={totalCandidates} delta="Across all positions" />
        <StatCard label="Avg Time to Shortlist" value="4.2 days" delta="18% faster than SLA" />
        <StatCard label="Offer Acceptance Rate" value="91%" delta="+3% vs previous quarter" />
      </div>

      {/* Analytics Row 1: Pipeline Conversion & Hiring Velocity (Balanced 2-Col Grid) */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        {/* Card 1: Recruitment Conversion Funnel */}
        <Card className="flex h-full flex-col justify-between">
          <div>
            <CardHeader className="border-border/40 border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-text text-[16px] font-semibold tracking-[-0.01em]">
                    Recruitment Conversion Funnel
                  </CardTitle>
                  <CardDescription className="text-text-muted mt-0.5 text-[12px]">
                    Candidate volume drop-off and progression across key hiring milestones.
                  </CardDescription>
                </div>
                <span className="text-text-subtle bg-surface-2 border-border rounded-[6px] border px-2 py-0.5 font-mono text-[11px] font-medium select-none">
                  5 Stages
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {funnelStages.map((stage) => (
                <div key={stage.num} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2">
                      <span className="bg-surface-3 text-text-subtle border-border/60 flex h-5 w-5 items-center justify-center rounded-[4px] border font-mono text-[11px] font-medium">
                        {stage.num}
                      </span>
                      <span className="text-text text-[13px] font-medium">{stage.label}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-text text-[13px] font-semibold">{stage.count}</span>
                      <span className="text-text-subtle text-[11px]">({stage.pct}%)</span>
                    </div>
                  </div>

                  {/* Clean Visual Progress Bar */}
                  <Progress value={stage.pct} className="h-1.5" />

                  {/* Context Note / Drop-off Rate */}
                  <div className="text-text-subtle flex items-center justify-between text-[11px]">
                    <span>{stage.sub}</span>
                    <span className="text-text-muted font-medium">{stage.note}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </div>

          {/* Footer Summary Strip */}
          <div className="border-border/50 bg-surface-2/30 flex flex-wrap items-center justify-between gap-2 rounded-b-[12px] border-t px-4 py-2.5 text-[11px] select-none sm:px-6 sm:py-3">
            <span className="text-text-subtle">
              Net Yield: <strong className="text-accent font-mono font-semibold">27%</strong>
            </span>
            <span className="text-text-subtle">
              Avg Cycle: <strong className="text-text font-mono font-semibold">18.4 Days</strong>
            </span>
            <span className="text-text-subtle">
              Active Pipeline:{' '}
              <strong className="text-text font-mono font-semibold">26 Candidates</strong>
            </span>
          </div>
        </Card>

        {/* Card 2: Hiring Velocity & Trends Graph (with Toggle for Sources / Shared with Manager) */}
        <Card className="flex h-full flex-col justify-between">
          <div>
            <CardHeader className="border-border/40 border-b pb-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-text text-[16px] font-semibold tracking-[-0.01em]">
                      {graphMode === 'velocity'
                        ? 'Hiring Velocity & Trends'
                        : graphMode === 'sources'
                          ? 'Sources & Shared with Manager'
                          : 'Monthly Sourced vs. Shared with Manager'}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-text-muted mt-0.5 text-[12px]">
                    {graphMode === 'velocity'
                      ? 'Monthly offers extended vs. confirmed candidate joins.'
                      : graphMode === 'sources'
                        ? 'Candidates sourced by channel vs. profiles shared for manager review.'
                        : 'Monthly talent acquisition intake vs. profiles shared for manager evaluation.'}
                  </CardDescription>
                </div>

                {/* Graph Mode Segmented Toggle Buttons */}
                <div className="bg-surface-2/40 border-border/80 flex max-w-full shrink-0 items-center gap-1 self-start overflow-x-auto rounded-[10px] border p-1">
                  <button
                    type="button"
                    onClick={() => setGraphMode('velocity')}
                    className={cn(
                      'cursor-pointer rounded-[8px] px-2.5 py-1.5 text-[11.5px] whitespace-nowrap transition-colors select-none sm:px-3.5 sm:text-[12px]',
                      graphMode === 'velocity'
                        ? 'bg-accent font-bold text-white shadow-xs'
                        : 'text-text-muted hover:text-text font-medium'
                    )}
                  >
                    Velocity
                  </button>
                  <button
                    type="button"
                    onClick={() => setGraphMode('sources')}
                    className={cn(
                      'cursor-pointer rounded-[8px] px-2.5 py-1.5 text-[11.5px] whitespace-nowrap transition-colors select-none sm:px-3.5 sm:text-[12px]',
                      graphMode === 'sources'
                        ? 'bg-accent font-bold text-white shadow-xs'
                        : 'text-text-muted hover:text-text font-medium'
                    )}
                  >
                    Sources vs Shared
                  </button>
                  <button
                    type="button"
                    onClick={() => setGraphMode('monthly')}
                    className={cn(
                      'cursor-pointer rounded-[8px] px-2.5 py-1.5 text-[11.5px] whitespace-nowrap transition-colors select-none sm:px-3.5 sm:text-[12px]',
                      graphMode === 'monthly'
                        ? 'bg-accent font-bold text-white shadow-xs'
                        : 'text-text-muted hover:text-text font-medium'
                    )}
                  >
                    Monthly Shared
                  </button>
                </div>
              </div>

              {/* Clean Typography Legend */}
              <div className="text-text-muted flex items-center gap-4 pt-3 text-[11px] font-medium select-none">
                <div className="flex items-center gap-1.5">
                  <span className="bg-surface-3 border-border h-2 w-2 rounded-full border" />
                  <span>{graphMode === 'velocity' ? 'Offers' : 'Total Sourced'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-accent h-2 w-2 rounded-full" />
                  <span className="text-text">
                    {graphMode === 'velocity' ? 'Joined' : 'Shared with Manager'}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* Dual-bar SVG / CSS Chart Area */}
              {(() => {
                const activeData =
                  graphMode === 'velocity'
                    ? monthlyVelocityData
                    : graphMode === 'sources'
                      ? sourcesSharedData
                      : monthlyPipelineData;
                const maxVal = graphMode === 'monthly' ? 36 : 12;
                const midVal = maxVal / 2;

                return (
                  <div className="relative flex h-[210px] w-full items-end justify-between gap-3 px-2 pt-6 pb-2 sm:gap-4">
                    {/* Horizontal Background Grid Reference Lines */}
                    <div className="border-border/40 text-text-subtle absolute inset-x-0 top-6 flex items-center justify-end border-b pr-1 font-mono text-[10px] select-none">
                      {maxVal}
                    </div>
                    <div className="border-border/40 text-text-subtle absolute inset-x-0 top-[50%] flex items-center justify-end border-b pr-1 font-mono text-[10px] select-none">
                      {midVal}
                    </div>
                    <div className="border-border text-text-subtle absolute inset-x-0 bottom-6 flex items-center justify-end border-b pr-1 font-mono text-[10px] select-none">
                      0
                    </div>

                    {activeData.map((d) => {
                      const barAHeight = Math.round((d.barA / maxVal) * 140);
                      const barBHeight = Math.round((d.barB / maxVal) * 140);

                      return (
                        <div
                          key={d.label}
                          className="group relative z-10 flex h-full flex-1 flex-col items-center justify-end"
                        >
                          {/* Tooltip on hover */}
                          <div className="bg-surface-3 border-border text-text pointer-events-none absolute -top-7 z-20 rounded-[var(--radius-sm)] border px-2 py-0.5 font-mono text-[10px] whitespace-nowrap tabular-nums opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                            {d.barA} {d.tipA} · {d.barB} {d.tipB}
                          </div>

                          {/* Dual Bars */}
                          <div className="flex items-end gap-1.5 pb-6">
                            {/* Bar A */}
                            <div
                              style={{ height: `${barAHeight}px` }}
                              className="bg-surface-3 border-border group-hover:bg-border-strong w-3.5 cursor-pointer rounded-t-[3px] border transition-colors sm:w-5"
                              title={`${d.label}: ${d.barA} ${d.tipA}`}
                            />
                            {/* Bar B */}
                            <div
                              style={{ height: `${barBHeight}px` }}
                              className="bg-accent w-3.5 cursor-pointer rounded-t-[3px] transition-opacity group-hover:opacity-90 sm:w-5"
                              title={`${d.label}: ${d.barB} ${d.tipB}`}
                            />
                          </div>

                          {/* Category Label */}
                          <span className="text-text-subtle group-hover:text-text absolute bottom-0 max-w-full truncate text-center font-mono text-[11px] font-medium transition-colors select-none">
                            {d.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* In-card Context Details */}
              <div className="border-border/60 bg-surface-2/40 text-text-muted flex items-center justify-between rounded-[8px] border p-2.5 text-[11px]">
                {graphMode === 'velocity' ? (
                  <>
                    <span>
                      Peak Month: <strong className="text-text font-medium">September</strong> (11
                      offers, 8 hires)
                    </span>
                    <span className="text-accent font-medium">Trending +14% QoQ</span>
                  </>
                ) : graphMode === 'sources' ? (
                  <>
                    <span>
                      Top Channel:{' '}
                      <strong className="text-text font-medium">LinkedIn Talent</strong> (10
                      sourced, 8 shared with mgr)
                    </span>
                    <span className="text-accent font-medium">80% pass-through</span>
                  </>
                ) : (
                  <>
                    <span>
                      Peak Intake: <strong className="text-text font-medium">September</strong> (32
                      sourced, 27 shared with mgr)
                    </span>
                    <span className="text-accent font-medium">84% review clearance</span>
                  </>
                )}
              </div>
            </CardContent>
          </div>

          {/* Footer Summary Strip */}
          <div className="border-border/50 bg-surface-2/30 flex flex-wrap items-center justify-between gap-2 rounded-b-[12px] border-t px-4 py-2.5 text-[11px] select-none sm:px-6 sm:py-3">
            {graphMode === 'velocity' ? (
              <>
                <span className="text-text-subtle">
                  Total Hires: <strong className="text-text font-mono font-semibold">31</strong>
                </span>
                <span className="text-text-subtle">
                  Avg Velocity:{' '}
                  <strong className="text-text font-mono font-semibold">5.2/mo</strong>
                </span>
                <span className="text-text-subtle">
                  Offer Conversion:{' '}
                  <strong className="text-accent font-mono font-semibold">82%</strong>
                </span>
              </>
            ) : graphMode === 'sources' ? (
              <>
                <span className="text-text-subtle">
                  Total Sourced: <strong className="text-text font-mono font-semibold">30</strong>
                </span>
                <span className="text-text-subtle">
                  Shared with Mgr:{' '}
                  <strong className="text-accent font-mono font-semibold">24 (80%)</strong>
                </span>
                <span className="text-text-subtle">
                  Top Yield:{' '}
                  <strong className="text-text font-mono font-semibold">Referrals (86%)</strong>
                </span>
              </>
            ) : (
              <>
                <span className="text-text-subtle">
                  Net Sourced: <strong className="text-text font-mono font-semibold">142</strong>
                </span>
                <span className="text-text-subtle">
                  Shared with Mgr:{' '}
                  <strong className="text-accent font-mono font-semibold">117 (82%)</strong>
                </span>
                <span className="text-text-subtle">
                  Review SLA:{' '}
                  <strong className="text-text font-mono font-semibold">2.1 Days</strong>
                </span>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Analytics Row 2: Capacity Allocation & Sourcing Attribution (Balanced 2-Col Grid) */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        {/* Card 3: Department Headcount Allocations */}
        <Card className="flex h-full flex-col justify-between">
          <div>
            <CardHeader className="border-border/40 border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-text text-[16px] font-semibold tracking-[-0.01em]">
                    Department Headcount Allocations
                  </CardTitle>
                  <CardDescription className="text-text-muted mt-0.5 text-[12px]">
                    Open requisitions and approved headcount capacity by business unit.
                  </CardDescription>
                </div>
                <span className="text-text-subtle bg-surface-2 border-border rounded-[6px] border px-2 py-0.5 font-mono text-[11px] font-medium select-none">
                  {departmentStats.length} Depts
                </span>
              </div>
            </CardHeader>

            <CardContent className="divide-border/40 divide-y pt-2">
              {departmentStats.map((item) => (
                <div
                  key={item.department}
                  className="hover:bg-surface-2/20 flex items-center justify-between rounded-[6px] px-1 py-3 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="mb-1 flex items-center justify-between text-[13px]">
                      <span className="text-text text-[13px] font-medium">{item.department}</span>
                      <span className="text-text-subtle font-mono text-[11px]">
                        {item.openings} active {item.openings > 1 ? 'roles' : 'role'}
                      </span>
                    </div>
                    {/* Allocation Proportion Bar */}
                    <div className="flex items-center gap-2">
                      <Progress value={item.sharePct} className="h-1.5 flex-1" />
                      <span className="text-text-subtle w-8 shrink-0 text-right font-mono text-[11px]">
                        {item.sharePct}%
                      </span>
                    </div>
                  </div>

                  <div className="border-border/40 min-w-[70px] shrink-0 border-l pl-3 text-right">
                    <span className="text-text font-mono text-[15px] font-semibold">
                      {item.headcount}
                    </span>
                    <span className="text-text-subtle block text-[11px]">headcount</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </div>

          {/* Footer Summary Strip */}
          <div className="border-border/50 bg-surface-2/30 flex flex-wrap items-center justify-between gap-2 rounded-b-[12px] border-t px-4 py-2.5 text-[11px] select-none sm:px-6 sm:py-3">
            <span className="text-text-subtle">
              Total Quota:{' '}
              <strong className="text-text font-mono font-semibold">{totalHeadcount}</strong>
            </span>
            <span className="text-text-subtle">
              Open Positions:{' '}
              <strong className="text-text font-mono font-semibold">{activeOpenings}</strong>
            </span>
            <span className="text-text-subtle">
              Allocation Cap: <strong className="text-accent font-mono font-semibold">100%</strong>
            </span>
          </div>
        </Card>

        {/* Card 4: Sourcing Channel Performance */}
        <Card className="flex h-full flex-col justify-between">
          <div>
            <CardHeader className="border-border/40 border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-text text-[16px] font-semibold tracking-[-0.01em]">
                    Sourcing Channel Performance
                  </CardTitle>
                  <CardDescription className="text-text-muted mt-0.5 text-[12px]">
                    Candidate acquisition volume, channel share, and offer conversion yield.
                  </CardDescription>
                </div>
                <span className="text-text-subtle bg-surface-2 border-border rounded-[6px] border px-2 py-0.5 font-mono text-[11px] font-medium select-none">
                  {totalCandidates} Sourced
                </span>
              </div>
            </CardHeader>

            <CardContent className="divide-border/40 divide-y pt-2">
              {channelBreakdownData.map((item) => (
                <div
                  key={item.source}
                  className="hover:bg-surface-2/20 flex items-center justify-between rounded-[6px] px-1 py-3 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="mb-1 flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-2">
                        <span className="text-text text-[13px] font-medium">{item.source}</span>
                        <span className="py-0.2 bg-surface-3 text-text-subtle border-border/60 rounded-[4px] border px-1.5 text-[10px] font-medium">
                          {item.tag}
                        </span>
                      </div>
                      <span className="text-text-muted text-[11px] font-medium">
                        {item.convRate}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                      <Progress value={item.pct} className="h-1.5 flex-1" />
                      <span className="text-text-subtle w-8 shrink-0 text-right font-mono text-[11px]">
                        {item.pct}%
                      </span>
                    </div>
                  </div>

                  <div className="border-border/40 min-w-[70px] shrink-0 border-l pl-3 text-right">
                    <span className="text-text font-mono text-[15px] font-semibold">
                      {item.count}
                    </span>
                    <span className="text-text-subtle block text-[11px]">candidates</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </div>

          {/* Footer Summary Strip */}
          <div className="border-border/50 bg-surface-2/30 flex flex-wrap items-center justify-between gap-2 rounded-b-[12px] border-t px-4 py-2.5 text-[11px] select-none sm:px-6 sm:py-3">
            <span className="text-text-subtle">
              Primary Source:{' '}
              <strong className="text-text font-mono font-semibold">LinkedIn (33%)</strong>
            </span>
            <span className="text-text-subtle">
              Highest Yield:{' '}
              <strong className="text-accent font-mono font-semibold">Referrals (57%)</strong>
            </span>
            <span className="text-text-subtle">
              Channels: <strong className="text-text font-mono font-semibold">5 Active</strong>
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
