'use client';

import * as React from 'react';
import { PageHeader } from '@/components/hro/page-header';
import { useOpenings } from '@/features/openings/hooks';
import { useCandidates } from '@/features/candidates/hooks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/hro/stat-card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Briefcase, Target, Award, Clock, PieChart } from 'lucide-react';

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
      <PageHeader
        title="Hiring Reports & Velocity Analytics"
        description="Comprehensive insights across recruitment funnel efficiency, channel effectiveness, and department headcounts."
      />

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
              <CardTitle className="flex items-center gap-2 text-[17px]">
                <TrendingUp className="text-accent h-4 w-4" />
                <span>Recruitment Conversion Funnel</span>
              </CardTitle>
              <CardDescription>
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
              <CardTitle className="flex items-center gap-2 text-[17px]">
                <Briefcase className="text-accent h-4 w-4" />
                <span>Department Headcount Allocations</span>
              </CardTitle>
              <CardDescription>
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

        {/* Channel Sources & Executive Summary (5/12) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Sourcing Channel Effectiveness */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[17px]">
                <PieChart className="text-accent h-4 w-4" />
                <span>Sourcing Channels</span>
              </CardTitle>
              <CardDescription>
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

          {/* Key Hiring Principles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <Award className="text-accent h-4 w-4" />
                <span>Quality & SLA Standards</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-text-muted space-y-3 text-[13px]">
              <div className="flex items-start gap-2.5">
                <Target className="text-accent mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  <strong className="text-text">Manager Review SLA:</strong> Target 48 hours from HR
                  profile submission to shortlist decision.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="text-accent mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  <strong className="text-text">Offer Turnaround:</strong> Target 3 business days
                  from final interview selection to formal letter dispatch.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
