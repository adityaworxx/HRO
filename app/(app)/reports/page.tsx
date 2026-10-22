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
  { source: 'Naukri Direct', count: 6, pct: 20, tag: 'Active Pipeline', convRate: '18% offer rate' },
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-stretch">
        {/* Card 1: Recruitment Conversion Funnel */}
        <Card className="flex flex-col justify-between h-full">
          <div>
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[16px] font-semibold text-text tracking-[-0.01em]">
                    Recruitment Conversion Funnel
                  </CardTitle>
                  <CardDescription className="text-[12px] text-text-muted mt-0.5">
                    Candidate volume drop-off and progression across key hiring milestones.
                  </CardDescription>
                </div>
                <span className="text-[11px] font-mono font-medium text-text-subtle bg-surface-2 border border-border px-2 py-0.5 rounded-[6px] select-none">
                  5 Stages
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {funnelStages.map((stage) => (
                <div key={stage.num} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2">
                      <span className="bg-surface-3 text-text-subtle flex h-5 w-5 items-center justify-center rounded-[4px] font-mono text-[11px] font-medium border border-border/60">
                        {stage.num}
                      </span>
                      <span className="text-text font-medium text-[13px]">{stage.label}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-text font-semibold text-[13px]">{stage.count}</span>
                      <span className="text-text-subtle text-[11px]">({stage.pct}%)</span>
                    </div>
                  </div>

                  {/* Clean Visual Progress Bar */}
                  <Progress value={stage.pct} className="h-1.5" />

                  {/* Context Note / Drop-off Rate */}
                  <div className="flex items-center justify-between text-[11px] text-text-subtle">
                    <span>{stage.sub}</span>
                    <span className="text-text-muted font-medium">{stage.note}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </div>

          {/* Footer Summary Strip */}
          <div className="border-t border-border/50 px-4 sm:px-6 py-2.5 sm:py-3 bg-surface-2/30 flex flex-wrap items-center justify-between gap-2 text-[11px] select-none rounded-b-[12px]">
            <span className="text-text-subtle">
              Net Yield: <strong className="text-accent font-mono font-semibold">27%</strong>
            </span>
            <span className="text-text-subtle">
              Avg Cycle: <strong className="text-text font-mono font-semibold">18.4 Days</strong>
            </span>
            <span className="text-text-subtle">
              Active Pipeline: <strong className="text-text font-mono font-semibold">26 Candidates</strong>
            </span>
          </div>
        </Card>

        {/* Card 2: Hiring Velocity & Trends Graph (with Toggle for Sources / Shared with Manager) */}
        <Card className="flex flex-col justify-between h-full">
          <div>
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-[16px] font-semibold text-text tracking-[-0.01em]">
                      {graphMode === 'velocity'
                        ? 'Hiring Velocity & Trends'
                        : graphMode === 'sources'
                          ? 'Sources & Shared with Manager'
                          : 'Monthly Sourced vs. Shared with Manager'}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-[12px] text-text-muted mt-0.5">
                    {graphMode === 'velocity'
                      ? 'Monthly offers extended vs. confirmed candidate joins.'
                      : graphMode === 'sources'
                        ? 'Candidates sourced by channel vs. profiles shared for manager review.'
                        : 'Monthly talent acquisition intake vs. profiles shared for manager evaluation.'}
                  </CardDescription>
                </div>

                {/* Graph Mode Segmented Toggle Buttons */}
                <div className="flex items-center gap-1 bg-surface-2/40 p-1 rounded-[10px] border border-border/80 shrink-0 self-start">
                  <button
                    type="button"
                    onClick={() => setGraphMode('velocity')}
                    className={cn(
                      'px-3.5 py-1.5 text-[12px] rounded-[8px] transition-colors cursor-pointer select-none',
                      graphMode === 'velocity'
                        ? 'bg-accent text-white font-bold shadow-xs'
                        : 'text-text-muted hover:text-text font-medium'
                    )}
                  >
                    Velocity
                  </button>
                  <button
                    type="button"
                    onClick={() => setGraphMode('sources')}
                    className={cn(
                      'px-3.5 py-1.5 text-[12px] rounded-[8px] transition-colors cursor-pointer select-none',
                      graphMode === 'sources'
                        ? 'bg-accent text-white font-bold shadow-xs'
                        : 'text-text-muted hover:text-text font-medium'
                    )}
                  >
                    Sources vs Shared
                  </button>
                  <button
                    type="button"
                    onClick={() => setGraphMode('monthly')}
                    className={cn(
                      'px-3.5 py-1.5 text-[12px] rounded-[8px] transition-colors cursor-pointer select-none',
                      graphMode === 'monthly'
                        ? 'bg-accent text-white font-bold shadow-xs'
                        : 'text-text-muted hover:text-text font-medium'
                    )}
                  >
                    Monthly Shared
                  </button>
                </div>
              </div>

              {/* Clean Typography Legend */}
              <div className="flex items-center gap-4 text-[11px] font-medium text-text-muted select-none pt-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-surface-3 border border-border" />
                  <span>{graphMode === 'velocity' ? 'Offers' : 'Total Sourced'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-text">
                    {graphMode === 'velocity' ? 'Joined' : 'Shared with Manager'}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
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
                  <div className="h-[210px] w-full flex items-end justify-between gap-3 sm:gap-4 pt-6 pb-2 px-2 relative">
                    {/* Horizontal Background Grid Reference Lines */}
                    <div className="absolute inset-x-0 top-6 border-b border-border/40 flex items-center justify-end pr-1 text-[10px] text-text-subtle font-mono select-none">
                      {maxVal}
                    </div>
                    <div className="absolute inset-x-0 top-[50%] border-b border-border/40 flex items-center justify-end pr-1 text-[10px] text-text-subtle font-mono select-none">
                      {midVal}
                    </div>
                    <div className="absolute inset-x-0 bottom-6 border-b border-border flex items-center justify-end pr-1 text-[10px] text-text-subtle font-mono select-none">
                      0
                    </div>

                    {activeData.map((d) => {
                      const barAHeight = Math.round((d.barA / maxVal) * 140);
                      const barBHeight = Math.round((d.barB / maxVal) * 140);

                      return (
                        <div
                          key={d.label}
                          className="group relative flex-1 flex flex-col items-center justify-end h-full z-10"
                        >
                          {/* Tooltip on hover */}
                          <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-3 border border-border text-text rounded-[var(--radius-sm)] px-2 py-0.5 text-[10px] font-mono tabular-nums shadow-sm whitespace-nowrap pointer-events-none z-20">
                            {d.barA} {d.tipA} · {d.barB} {d.tipB}
                          </div>

                          {/* Dual Bars */}
                          <div className="flex items-end gap-1.5 pb-6">
                            {/* Bar A */}
                            <div
                              style={{ height: `${barAHeight}px` }}
                              className="w-3.5 sm:w-5 rounded-t-[3px] bg-surface-3 border border-border group-hover:bg-border-strong transition-colors cursor-pointer"
                              title={`${d.label}: ${d.barA} ${d.tipA}`}
                            />
                            {/* Bar B */}
                            <div
                              style={{ height: `${barBHeight}px` }}
                              className="w-3.5 sm:w-5 rounded-t-[3px] bg-accent group-hover:opacity-90 transition-opacity cursor-pointer"
                              title={`${d.label}: ${d.barB} ${d.tipB}`}
                            />
                          </div>

                          {/* Category Label */}
                          <span className="absolute bottom-0 text-[11px] font-medium text-text-subtle group-hover:text-text transition-colors select-none font-mono truncate max-w-full text-center">
                            {d.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* In-card Context Details */}
              <div className="rounded-[8px] border border-border/60 bg-surface-2/40 p-2.5 flex items-center justify-between text-[11px] text-text-muted">
                {graphMode === 'velocity' ? (
                  <>
                    <span>
                      Peak Month: <strong className="text-text font-medium">September</strong> (11 offers, 8 hires)
                    </span>
                    <span className="text-accent font-medium">Trending +14% QoQ</span>
                  </>
                ) : graphMode === 'sources' ? (
                  <>
                    <span>
                      Top Channel: <strong className="text-text font-medium">LinkedIn Talent</strong> (10 sourced, 8 shared with mgr)
                    </span>
                    <span className="text-accent font-medium">80% pass-through</span>
                  </>
                ) : (
                  <>
                    <span>
                      Peak Intake: <strong className="text-text font-medium">September</strong> (32 sourced, 27 shared with mgr)
                    </span>
                    <span className="text-accent font-medium">84% review clearance</span>
                  </>
                )}
              </div>
            </CardContent>
          </div>

          {/* Footer Summary Strip */}
          <div className="border-t border-border/50 px-4 sm:px-6 py-2.5 sm:py-3 bg-surface-2/30 flex flex-wrap items-center justify-between gap-2 text-[11px] select-none rounded-b-[12px]">
            {graphMode === 'velocity' ? (
              <>
                <span className="text-text-subtle">
                  Total Hires: <strong className="text-text font-mono font-semibold">31</strong>
                </span>
                <span className="text-text-subtle">
                  Avg Velocity: <strong className="text-text font-mono font-semibold">5.2/mo</strong>
                </span>
                <span className="text-text-subtle">
                  Offer Conversion: <strong className="text-accent font-mono font-semibold">82%</strong>
                </span>
              </>
            ) : graphMode === 'sources' ? (
              <>
                <span className="text-text-subtle">
                  Total Sourced: <strong className="text-text font-mono font-semibold">30</strong>
                </span>
                <span className="text-text-subtle">
                  Shared with Mgr: <strong className="text-accent font-mono font-semibold">24 (80%)</strong>
                </span>
                <span className="text-text-subtle">
                  Top Yield: <strong className="text-text font-mono font-semibold">Referrals (86%)</strong>
                </span>
              </>
            ) : (
              <>
                <span className="text-text-subtle">
                  Net Sourced: <strong className="text-text font-mono font-semibold">142</strong>
                </span>
                <span className="text-text-subtle">
                  Shared with Mgr: <strong className="text-accent font-mono font-semibold">117 (82%)</strong>
                </span>
                <span className="text-text-subtle">
                  Review SLA: <strong className="text-text font-mono font-semibold">2.1 Days</strong>
                </span>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Analytics Row 2: Capacity Allocation & Sourcing Attribution (Balanced 2-Col Grid) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-stretch">
        {/* Card 3: Department Headcount Allocations */}
        <Card className="flex flex-col justify-between h-full">
          <div>
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[16px] font-semibold text-text tracking-[-0.01em]">
                    Department Headcount Allocations
                  </CardTitle>
                  <CardDescription className="text-[12px] text-text-muted mt-0.5">
                    Open requisitions and approved headcount capacity by business unit.
                  </CardDescription>
                </div>
                <span className="text-[11px] font-mono font-medium text-text-subtle bg-surface-2 border border-border px-2 py-0.5 rounded-[6px] select-none">
                  {departmentStats.length} Depts
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-2 divide-y divide-border/40">
              {departmentStats.map((item) => (
                <div
                  key={item.department}
                  className="py-3 flex items-center justify-between hover:bg-surface-2/20 transition-colors px-1 rounded-[6px]"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center justify-between text-[13px] mb-1">
                      <span className="text-text font-medium text-[13px]">{item.department}</span>
                      <span className="text-text-subtle font-mono text-[11px]">
                        {item.openings} active {item.openings > 1 ? 'roles' : 'role'}
                      </span>
                    </div>
                    {/* Allocation Proportion Bar */}
                    <div className="flex items-center gap-2">
                      <Progress value={item.sharePct} className="h-1.5 flex-1" />
                      <span className="font-mono text-[11px] text-text-subtle w-8 text-right shrink-0">
                        {item.sharePct}%
                      </span>
                    </div>
                  </div>

                  <div className="text-right pl-3 border-l border-border/40 shrink-0 min-w-[70px]">
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
          <div className="border-t border-border/50 px-4 sm:px-6 py-2.5 sm:py-3 bg-surface-2/30 flex flex-wrap items-center justify-between gap-2 text-[11px] select-none rounded-b-[12px]">
            <span className="text-text-subtle">
              Total Quota: <strong className="text-text font-mono font-semibold">{totalHeadcount}</strong>
            </span>
            <span className="text-text-subtle">
              Open Positions: <strong className="text-text font-mono font-semibold">{activeOpenings}</strong>
            </span>
            <span className="text-text-subtle">
              Allocation Cap: <strong className="text-accent font-mono font-semibold">100%</strong>
            </span>
          </div>
        </Card>

        {/* Card 4: Sourcing Channel Performance */}
        <Card className="flex flex-col justify-between h-full">
          <div>
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[16px] font-semibold text-text tracking-[-0.01em]">
                    Sourcing Channel Performance
                  </CardTitle>
                  <CardDescription className="text-[12px] text-text-muted mt-0.5">
                    Candidate acquisition volume, channel share, and offer conversion yield.
                  </CardDescription>
                </div>
                <span className="text-[11px] font-mono font-medium text-text-subtle bg-surface-2 border border-border px-2 py-0.5 rounded-[6px] select-none">
                  {totalCandidates} Sourced
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-2 divide-y divide-border/40">
              {channelBreakdownData.map((item) => (
                <div
                  key={item.source}
                  className="py-3 flex items-center justify-between hover:bg-surface-2/20 transition-colors px-1 rounded-[6px]"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center justify-between text-[13px] mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-text font-medium text-[13px]">{item.source}</span>
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-[4px] bg-surface-3 text-text-subtle border border-border/60">
                          {item.tag}
                        </span>
                      </div>
                      <span className="text-text-muted font-medium text-[11px]">
                        {item.convRate}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                      <Progress value={item.pct} className="h-1.5 flex-1" />
                      <span className="font-mono text-[11px] text-text-subtle w-8 text-right shrink-0">
                        {item.pct}%
                      </span>
                    </div>
                  </div>

                  <div className="text-right pl-3 border-l border-border/40 shrink-0 min-w-[70px]">
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
          <div className="border-t border-border/50 px-4 sm:px-6 py-2.5 sm:py-3 bg-surface-2/30 flex flex-wrap items-center justify-between gap-2 text-[11px] select-none rounded-b-[12px]">
            <span className="text-text-subtle">
              Primary Source: <strong className="text-text font-mono font-semibold">LinkedIn (33%)</strong>
            </span>
            <span className="text-text-subtle">
              Highest Yield: <strong className="text-accent font-mono font-semibold">Referrals (57%)</strong>
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
