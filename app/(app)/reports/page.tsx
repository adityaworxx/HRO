'use client';

import * as React from 'react';
import { useOpenings } from '@/features/openings/hooks';
import { useCandidates } from '@/features/candidates/hooks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/hro/stat-card';
import { Progress } from '@/components/ui/progress';

const monthlyVelocityData = [
  { month: 'May', offers: 6, joined: 4 },
  { month: 'Jun', offers: 8, joined: 6 },
  { month: 'Jul', offers: 5, joined: 3 },
  { month: 'Aug', offers: 9, joined: 7 },
  { month: 'Sep', offers: 11, joined: 8 },
  { month: 'Oct', offers: 7, joined: 5 },
];

export default function ReportsPage() {
  const { data: openings = [] } = useOpenings();
  const { data: candidates = [] } = useCandidates();

  // Requisitions stats
  const activeOpenings = openings.filter((o) => o.status !== 'Closed').length;
  const totalHeadcount = openings.reduce((acc, o) => acc + o.headcount, 0);

  // Candidates stats
  const totalCandidates = candidates.length;
  const hiredCount = candidates.filter((c) => c.stage === 'Joined').length;
  const offerCount = candidates.filter(
    (c) => c.stage === 'Selected' || c.stage === 'Offer Sent'
  ).length;
  const interviewCount = candidates.filter((c) => c.stage === 'Interview').length;

  // Stages count for Funnel
  const stages = [
    { label: 'Sourced', count: candidates.filter((c) => c.stage === 'Sourced').length },
    {
      label: 'Shared with Manager',
      count: candidates.filter((c) => c.stage === 'Shared with Manager').length,
    },
    { label: 'Interview', count: interviewCount },
    { label: 'Offer Stage', count: offerCount },
    { label: 'Joined / Hired', count: hiredCount },
  ];

  // Source distribution
  const sourceStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    candidates.forEach((c) => {
      counts[c.source] = (counts[c.source] ?? 0) + 1;
    });
    return Object.entries(counts).map(([source, count]) => ({
      source,
      count,
      pct: Math.round((count / (totalCandidates || 1)) * 100),
    }));
  }, [candidates, totalCandidates]);

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
    }));
  }, [openings]);

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Recruitment Pipeline Funnel (7/12) */}
        <div className="space-y-6 lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold text-text tracking-[-0.01em]">
                Recruitment Conversion Funnel
              </CardTitle>
              <CardDescription className="text-[13px] text-text-muted">
                Candidate progression and volume drop-off across hiring milestones.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stages.map((stage, idx) => {
                const percentOfTotal =
                  totalCandidates > 0 ? Math.round((stage.count / totalCandidates) * 100) : 0;

                return (
                  <div key={stage.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-text flex items-center gap-2 font-medium">
                        <span className="bg-surface-3 text-text-subtle flex h-5 w-5 items-center justify-center rounded-full font-mono text-[11px]">
                          {idx + 1}
                        </span>
                        <span>{stage.label}</span>
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-text font-semibold">{stage.count}</span>
                        <span className="text-text-subtle text-[11px]">({percentOfTotal}%)</span>
                      </div>
                    </div>
                    <Progress value={Math.max(percentOfTotal, 5)} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Department Headcount Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold text-text tracking-[-0.01em]">
                Department Headcount Allocations
              </CardTitle>
              <CardDescription className="text-[13px] text-text-muted">
                Open roles and approved headcount distributed by business unit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {departmentStats.map((item) => (
                <div
                  key={item.department}
                  className="border-border bg-surface-2/40 flex items-center justify-between rounded-lg border p-3.5"
                >
                  <div>
                    <p className="text-text text-[14px] font-semibold">{item.department}</p>
                    <p className="text-text-muted text-[12px]">
                      {item.openings} active requisition{item.openings > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-text font-mono text-[15px] font-bold">
                      {item.headcount}
                    </span>
                    <span className="text-text-subtle block text-[12px]">headcount</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Channel Sources & Velocity Chart (5/12) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Sourcing Channel Effectiveness */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold text-text tracking-[-0.01em]">
                Sourcing Channels
              </CardTitle>
              <CardDescription className="text-[13px] text-text-muted">
                Candidate distribution by applicant sourcing channel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {sourceStats.map((item) => (
                <div key={item.source} className="space-y-1">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-text font-medium">{item.source}</span>
                    <span className="text-text-muted font-mono">
                      {item.count} ({item.pct}%)
                    </span>
                  </div>
                  <Progress value={item.pct} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Customized Graph: Hiring Velocity & Trends */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-[16px] font-semibold text-text tracking-[-0.01em]">
                    Hiring Velocity & Trends
                  </CardTitle>
                  <CardDescription className="text-[12px] text-text-muted mt-0.5">
                    Monthly offers extended vs. confirmed joins.
                  </CardDescription>
                </div>

                {/* Clean Legend */}
                <div className="flex items-center gap-3 text-[11px] font-medium text-text-muted select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-surface-3 border border-border" />
                    <span>Offers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    <span className="text-text">Joined</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              {/* Custom SVG / CSS Bar Chart */}
              <div className="h-[160px] w-full flex items-end justify-between gap-2 sm:gap-3 pt-6 pb-2 px-1 relative">
                {/* Background Grid Lines */}
                <div className="absolute inset-x-0 top-3 border-b border-border/40" />
                <div className="absolute inset-x-0 top-1/2 border-b border-border/40" />
                <div className="absolute inset-x-0 bottom-6 border-b border-border" />

                {monthlyVelocityData.map((d) => {
                  const maxVal = 12;
                  const offerHeight = Math.round((d.offers / maxVal) * 105);
                  const joinHeight = Math.round((d.joined / maxVal) * 105);

                  return (
                    <div
                      key={d.month}
                      className="group relative flex-1 flex flex-col items-center justify-end h-full z-10"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-3 border border-border text-text rounded-[var(--radius-sm)] px-2 py-0.5 text-[10px] font-mono tabular-nums shadow-sm whitespace-nowrap pointer-events-none z-20">
                        {d.offers} offers · {d.joined} joined
                      </div>

                      {/* Dual Bars */}
                      <div className="flex items-end gap-1 sm:gap-1.5 pb-6">
                        {/* Offers Bar */}
                        <div
                          style={{ height: `${offerHeight}px` }}
                          className="w-2.5 sm:w-3.5 rounded-t-[3px] bg-surface-3 border border-border group-hover:bg-border-strong transition-colors cursor-pointer"
                          title={`${d.month}: ${d.offers} Offers`}
                        />
                        {/* Joined Bar */}
                        <div
                          style={{ height: `${joinHeight}px` }}
                          className="w-2.5 sm:w-3.5 rounded-t-[3px] bg-accent group-hover:opacity-90 transition-opacity cursor-pointer"
                          title={`${d.month}: ${d.joined} Joined`}
                        />
                      </div>

                      {/* Month Label */}
                      <span className="absolute bottom-0 text-[11px] font-medium text-text-subtle group-hover:text-text transition-colors select-none">
                        {d.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Metrics Summary Footer */}
              <div className="border-t border-border/60 pt-3 flex items-center justify-between text-[11px] select-none">
                <span className="text-text-subtle">
                  Total Hires: <strong className="text-text font-mono">31</strong>
                </span>
                <span className="text-text-subtle">
                  Avg Velocity: <strong className="text-text font-mono">5.2/mo</strong>
                </span>
                <span className="text-text-subtle">
                  Conversion: <strong className="text-accent font-mono">82%</strong>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
