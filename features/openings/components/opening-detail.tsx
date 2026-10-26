'use client';

import * as React from 'react';
import Link from 'next/link';
import { useOpening, useUpdateOpeningStatus } from '../hooks';
import { useCandidates } from '@/features/candidates/hooks';
import { useUsers } from '@/features/auth/hooks';
import { getNextAllowedOpeningStatuses } from '@/lib/domain/status-transitions';
import type { OpeningStatus } from '@/lib/domain/status-transitions';
import { StatusBadge } from '@/components/hro/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/hro/empty-state';
import { cn } from '@/lib/utils';
import { getAvatarColorClass } from '@/lib/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Edit,
  ArrowRightCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCtcRange, formatCtc, formatDate } from '@/lib/format';

interface OpeningDetailProps {
  id: string;
}

export function OpeningDetail({ id }: OpeningDetailProps) {
  const { data: opening, isLoading, isError } = useOpening(id);
  const { data: allCandidates = [] } = useCandidates();
  const { data: users = [] } = useUsers();
  const updateStatus = useUpdateOpeningStatus();

  // Candidates for this specific opening
  const openingCandidates = React.useMemo(() => {
    return allCandidates.filter((c) => c.openingId === id);
  }, [allCandidates, id]);

  // Hiring manager lookup
  const manager = React.useMemo(() => {
    if (!opening) return null;
    return users.find((u) => u.id === opening.managerId);
  }, [users, opening]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Skeleton className="h-96 lg:col-span-8" />
          <Skeleton className="h-96 lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (isError || !opening) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Requisition Not Found"
        description="The requested job requisition could not be found or has been removed."
        action={
          <Button asChild variant="primary">
            <Link href="/openings">Back to Openings</Link>
          </Button>
        }
      />
    );
  }

  const allowedTransitions = getNextAllowedOpeningStatuses(opening.status);

  const handleStatusChange = (newStatus: OpeningStatus) => {
    updateStatus.mutate(
      { id: opening.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Updated status to ${newStatus}`);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="h-7 gap-1 px-1.5 text-[12px] text-text-muted hover:text-text">
              <Link href="/openings">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Openings</span>
              </Link>
            </Button>
            <span className="text-text-subtle text-[12px]">/</span>
            <span className="text-text-muted text-[12px] font-medium">{opening.department}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-0.5">
            <h1 className="text-text text-2xl font-bold tracking-tight">{opening.title}</h1>
            <StatusBadge status={opening.status} type="opening" />
            <Badge variant="default" className="text-[11px] font-medium">
              {opening.urgency} Urgency
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-[13px]">
            <Link href={`/openings/${opening.id}/edit`}>
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Requisition</span>
            </Link>
          </Button>

          {allowedTransitions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="primary" size="sm" className="h-9 gap-1.5 text-[13px]">
                  <span>Status: {opening.status}</span>
                  <ArrowRightCircle className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-[11px] text-text-subtle uppercase tracking-wider">
                  Transition Status
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allowedTransitions.map((nextStatus) => (
                  <DropdownMenuItem
                    key={nextStatus}
                    onClick={() => handleStatusChange(nextStatus)}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="text-accent h-3.5 w-3.5" />
                    <span>Move to {nextStatus}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Metric Stat Cards (Consistent 4-column row, zero decorative icon clutter) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[var(--radius-md)] border border-border bg-surface-1 p-4 shadow-xs">
          <span className="text-[12px] font-medium text-text-muted">Target Headcount</span>
          <p className="mt-1.5 font-mono text-2xl font-bold text-text">
            {opening.headcount}{' '}
            <span className="font-sans text-[13px] font-normal text-text-subtle">
              role{opening.headcount > 1 ? 's' : ''}
            </span>
          </p>
        </div>

        <div className="rounded-[var(--radius-md)] border border-border bg-surface-1 p-4 shadow-xs">
          <span className="text-[12px] font-medium text-text-muted">Experience Required</span>
          <p className="mt-1.5 font-mono text-2xl font-bold text-text">
            {opening.experienceRange.min}-{opening.experienceRange.max}{' '}
            <span className="font-sans text-[13px] font-normal text-text-subtle">years</span>
          </p>
        </div>

        <div className="rounded-[var(--radius-md)] border border-border bg-surface-1 p-4 shadow-xs">
          <span className="text-[12px] font-medium text-text-muted">Annual CTC Budget</span>
          <p className="mt-1.5 font-mono text-xl font-bold text-success">
            {formatCtcRange(opening.budgetRange.min, opening.budgetRange.max)}
          </p>
        </div>

        <div className="rounded-[var(--radius-md)] border border-border bg-surface-1 p-4 shadow-xs">
          <span className="text-[12px] font-medium text-text-muted">Work Location & Format</span>
          <p className="mt-1.5 truncate text-[15px] font-semibold text-text">
            {opening.location}
          </p>
          <span className="text-[12px] text-text-subtle">{opening.employmentType}</span>
        </div>
      </div>

      {/* Main Cohesive 12-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: 8 Columns for Tabbed Sections */}
        <div className="space-y-6 lg:col-span-8">
          <Tabs defaultValue="specification" className="w-full">
            <TabsList className="w-full justify-start sm:w-auto">
              <TabsTrigger value="specification">Requirements & Scope</TabsTrigger>
              <TabsTrigger value="candidates">Candidates ({openingCandidates.length})</TabsTrigger>
              <TabsTrigger value="timeline">Audit & Timeline</TabsTrigger>
            </TabsList>

            {/* Tab 1: Requirements & Scope */}
            <TabsContent value="specification" className="space-y-6 pt-4">
              {/* Job Description Card */}
              <Card className="border-border bg-surface-1 shadow-sm">
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-[16px] font-semibold text-text">
                    Job Description & Responsibilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-[13px] leading-relaxed text-text">
                  <p className="whitespace-pre-line">{opening.description}</p>
                </CardContent>
              </Card>

              {/* Technical Skills & Qualifications */}
              <Card className="border-border bg-surface-1 shadow-sm">
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-[16px] font-semibold text-text">
                    Candidate Profile & Screening Criteria
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-4">
                  <div className="space-y-2">
                    <span className="text-[12px] font-medium text-text-muted">
                      Must-Have Competencies:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {opening.mustHaveSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-[11px] font-medium text-accent"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {opening.niceToHaveSkills.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[12px] font-medium text-text-muted">
                        Nice-to-Have Skills:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {opening.niceToHaveSkills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-text-muted"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Candidates in pipeline for this role */}
            <TabsContent value="candidates" className="pt-4">
              <Card className="border-border bg-surface-1 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/80 pb-3">
                  <CardTitle className="text-[16px] font-semibold text-text">
                    Assigned Pipeline Candidates ({openingCandidates.length})
                  </CardTitle>
                  <Button asChild variant="outline" size="sm" className="h-8 text-[12px]">
                    <Link href="/pipeline">
                      <span>Pipeline Board</span>
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {openingCandidates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed border-border/60 py-10 text-center text-[13px] text-text-muted">
                      <p className="font-medium">No candidates in this pipeline yet</p>
                      <p className="text-[12px] text-text-subtle">
                        Source or add candidates to start evaluating.
                      </p>
                    </div>
                  ) : (
                    openingCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex flex-col justify-between gap-3 rounded-[var(--radius-md)] border border-border bg-surface-2/40 p-3.5 transition-colors hover:bg-surface-2 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={cn('text-[11px] font-semibold border', getAvatarColorClass(candidate.name))}>
                              {candidate.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-semibold text-text">
                                {candidate.name}
                              </span>
                              <StatusBadge status={candidate.stage} type="candidate" />
                            </div>
                            <p className="text-[11px] text-text-muted">
                              {candidate.currentRole} at {candidate.currentCompany} •{' '}
                              <span className="font-bold text-text">
                                {candidate.experienceYears} yrs exp
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end text-[11px] text-text-muted sm:self-center">
                          <span className="font-mono font-medium text-text">
                            Expected: {formatCtc(candidate.expectedCtc)}
                          </span>
                          <span className="font-bold text-text">Notice: {candidate.noticePeriod}</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Timeline & Audit */}
            <TabsContent value="timeline" className="pt-4">
              <Card className="border-border bg-surface-1 shadow-sm">
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-[16px] font-semibold text-text">
                    Activity & Audit Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="relative space-y-4 border-l border-border pl-4 text-[13px]">
                    <div className="relative">
                      <div className="absolute top-1 -left-[21px] h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-surface-1" />
                      <p className="text-[13px] font-medium text-text">Requisition Created</p>
                      <p className="text-[11px] text-text-muted">
                        Created on {formatDate(opening.createdAt)} by Hiring Team
                      </p>
                    </div>
                    <div className="relative">
                      <div className="absolute top-1 -left-[21px] h-2.5 w-2.5 rounded-full bg-success ring-4 ring-surface-1" />
                      <p className="text-[13px] font-medium text-text">Current State</p>
                      <p className="text-[11px] text-text-muted">Status: {opening.status}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: 4 Columns (Sticky Sidebar, stays stable & visible across all tabs) */}
        <div className="lg:col-span-4">
          <div className="sticky top-0 space-y-4">
            {/* Requisition Overview Card */}
            <Card className="border-border bg-surface-1 shadow-sm">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-[14px] font-semibold text-text">
                  Requisition Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {/* Hiring Manager info */}
                <div className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-border bg-surface-2/60 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-[12px] font-bold text-accent">
                    {manager?.avatarInitials || (manager?.name ? manager.name.charAt(0).toUpperCase() : 'H')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-text">
                      {manager?.name || 'Hiring Manager'}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      {manager?.department ? `${manager.department} Lead` : `${opening.department} Lead`}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1 text-[12px]">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-text-muted">Target Joining</span>
                    <span className="font-medium text-text">{formatDate(opening.targetStartDate)}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-text-muted">Created Date</span>
                    <span className="font-medium text-text">{formatDate(opening.createdAt)}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-text-muted">Department</span>
                    <span className="font-medium text-text">{opening.department}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-text-muted">Employment Type</span>
                    <span className="font-medium text-text">{opening.employmentType}</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span className="text-text-muted">Current Urgency</span>
                    <span className="font-semibold text-accent">{opening.urgency}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="border-border bg-surface-1 shadow-sm">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-[14px] font-semibold text-text">
                  Pipeline Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-3.5">
                <Button
                  asChild
                  variant="outline"
                  className="h-9 w-full justify-start text-[13px]"
                >
                  <Link href="/pipeline">
                    <span>Open Kanban Board</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-9 w-full justify-start text-[13px]"
                >
                  <Link href="/candidates">
                    <span>View All Candidates</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-9 w-full justify-start text-[13px]"
                >
                  <Link href={`/openings/${opening.id}/edit`}>
                    <span>Edit Requisition Details</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
