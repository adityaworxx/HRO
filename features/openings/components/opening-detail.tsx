'use client';

import * as React from 'react';
import Link from 'next/link';
import { useOpening, useUpdateOpeningStatus } from '../hooks';
import { useCandidates } from '@/features/candidates/hooks';
import { getNextAllowedOpeningStatuses } from '@/lib/domain/status-transitions';
import type { OpeningStatus } from '@/lib/domain/status-transitions';
import { StatusBadge } from '@/components/hro/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/hro/empty-state';
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
  MapPin,
  Clock,
  DollarSign,
  Users,
  Edit,
  ArrowRightCircle,
  GitPullRequest,
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
  const updateStatus = useUpdateOpeningStatus();

  // Candidates for this specific opening
  const openingCandidates = React.useMemo(() => {
    return allCandidates.filter((c) => c.openingId === id);
  }, [allCandidates, id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
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
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 pl-1 text-[13px]">
              <Link href="/openings">
                <ArrowLeft className="h-4 w-4" />
                <span>Openings</span>
              </Link>
            </Button>
            <span className="text-text-muted">/</span>
            <span className="text-text-muted text-[13px]">{opening.department}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <h1 className="text-text text-2xl font-bold tracking-tight">{opening.title}</h1>
            <StatusBadge status={opening.status} type="opening" />
            <Badge variant="default" className="text-[11px]">
              {opening.urgency} Urgency
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-[13px]">
            <Link href={`/openings/${opening.id}/edit`}>
              <Edit className="h-4 w-4" />
              <span>Edit Requisition</span>
            </Link>
          </Button>

          {allowedTransitions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="primary" size="sm" className="h-9 gap-1.5 text-[13px]">
                  <span>Status: {opening.status}</span>
                  <ArrowRightCircle className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-[11px]">
                  Transition Requisition
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

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-border bg-surface-1 rounded-[var(--radius-md)] border p-4">
          <span className="text-text-muted flex items-center gap-1.5 text-[12px] font-medium">
            <Users className="h-3.5 w-3.5" />
            <span>Target Headcount</span>
          </span>
          <p className="text-text mt-1.5 font-mono text-2xl font-bold">
            {opening.headcount}{' '}
            <span className="text-text-subtle text-[13px] font-normal">positions</span>
          </p>
        </div>

        <div className="border-border bg-surface-1 rounded-[var(--radius-md)] border p-4">
          <span className="text-text-muted flex items-center gap-1.5 text-[12px] font-medium">
            <Clock className="h-3.5 w-3.5" />
            <span>Experience Required</span>
          </span>
          <p className="text-text mt-1.5 font-mono text-2xl font-bold">
            {opening.experienceRange.min}-{opening.experienceRange.max}{' '}
            <span className="text-text-subtle text-[13px] font-normal">years</span>
          </p>
        </div>

        <div className="border-border bg-surface-1 rounded-[var(--radius-md)] border p-4">
          <span className="text-text-muted flex items-center gap-1.5 text-[12px] font-medium">
            <DollarSign className="h-3.5 w-3.5" />
            <span>Budget Band</span>
          </span>
          <p className="text-text mt-1.5 font-mono text-xl font-bold">
            {formatCtcRange(opening.budgetRange.min, opening.budgetRange.max)}
          </p>
        </div>

        <div className="border-border bg-surface-1 rounded-[var(--radius-md)] border p-4">
          <span className="text-text-muted flex items-center gap-1.5 text-[12px] font-medium">
            <MapPin className="h-3.5 w-3.5" />
            <span>Location & Format</span>
          </span>
          <p className="text-text mt-1.5 truncate text-[15px] font-semibold">{opening.location}</p>
          <span className="text-text-subtle text-[12px]">{opening.employmentType}</span>
        </div>
      </div>

      {/* Tabbed Detail Sections */}
      <Tabs defaultValue="specification" className="w-full">
        <TabsList className="w-full justify-start sm:w-auto">
          <TabsTrigger value="specification">Requirements & Scope</TabsTrigger>
          <TabsTrigger value="candidates">Candidates ({openingCandidates.length})</TabsTrigger>
          <TabsTrigger value="timeline">Audit & Timeline</TabsTrigger>
        </TabsList>

        {/* Tab 1: Requirements */}
        <TabsContent value="specification" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[17px]">Job Description & Responsibilities</CardTitle>
                </CardHeader>
                <CardContent className="text-text space-y-4 text-[14px] leading-relaxed">
                  <p className="whitespace-pre-line">{opening.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[17px]">Technical Skills & Qualifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-text-muted text-[13px] font-semibold">
                      Must-Have Proficiencies:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {opening.mustHaveSkills.map((skill) => (
                        <Badge key={skill} variant="accent" className="px-2.5 py-1 text-[12px]">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {opening.niceToHaveSkills.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-text-muted text-[13px] font-semibold">
                        Nice-to-Have Skills:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {opening.niceToHaveSkills.map((skill) => (
                          <Badge key={skill} variant="default" className="px-2.5 py-1 text-[12px]">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Requisition Meta Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[16px]">Requisition Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 text-[13px]">
                  <div className="border-border flex justify-between border-b pb-2.5">
                    <span className="text-text-muted">Target Joining Date</span>
                    <span className="text-text font-medium">
                      {formatDate(opening.targetStartDate)}
                    </span>
                  </div>
                  <div className="border-border flex justify-between border-b pb-2.5">
                    <span className="text-text-muted">Created On</span>
                    <span className="text-text font-medium">{formatDate(opening.createdAt)}</span>
                  </div>
                  <div className="border-border flex justify-between border-b pb-2.5">
                    <span className="text-text-muted">Department</span>
                    <span className="text-text font-medium">{opening.department}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-text-muted">Employment Type</span>
                    <span className="text-text font-medium">{opening.employmentType}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[16px]">Pipeline Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    asChild
                    variant="outline"
                    className="h-9 w-full justify-start gap-2 text-[13px]"
                  >
                    <Link href="/pipeline">
                      <GitPullRequest className="text-accent h-4 w-4" />
                      <span>Open Kanban Board</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-9 w-full justify-start gap-2 text-[13px]"
                  >
                    <Link href="/candidates">
                      <Users className="text-accent h-4 w-4" />
                      <span>View All Candidates</span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Candidates in pipeline for this role */}
        <TabsContent value="candidates" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-[17px]">
                  Candidates Assigned to {opening.title}
                </CardTitle>
                <CardDescription className="text-[13px]">
                  All applicants currently at various stages in this position&apos;s pipeline.
                </CardDescription>
              </div>
              <Button asChild variant="primary" size="sm" className="gap-1.5 text-[13px]">
                <Link href="/pipeline">
                  <GitPullRequest className="h-4 w-4" />
                  <span>Pipeline Board</span>
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {openingCandidates.length === 0 ? (
                <div className="text-text-muted border-border/60 flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed py-10 text-center text-[13px]">
                  <Users className="text-text-muted mb-2 h-8 w-8 opacity-60" />
                  <p className="font-medium">No candidates in this pipeline yet</p>
                  <p className="text-text-subtle text-[12px]">
                    Source or add candidates to start evaluating.
                  </p>
                </div>
              ) : (
                openingCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="border-border bg-surface-2/30 hover:bg-surface-2 flex flex-col justify-between gap-3 rounded-[var(--radius-md)] border p-3.5 transition-colors sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-[12px] font-semibold">
                          {candidate.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-text text-[14px] font-semibold">
                            {candidate.name}
                          </span>
                          <StatusBadge status={candidate.stage} type="candidate" />
                        </div>
                        <p className="text-text-muted text-[12px]">
                          {candidate.currentRole} at {candidate.currentCompany} •{' '}
                          {candidate.experienceYears} yrs exp
                        </p>
                      </div>
                    </div>

                    <div className="text-text-muted flex items-center gap-4 self-end text-[12px] sm:self-center">
                      <span className="text-text font-mono">
                        Expected: {formatCtc(candidate.expectedCtc)}
                      </span>
                      <span>Notice: {candidate.noticePeriod}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Timeline & Audit */}
        <TabsContent value="timeline" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[17px]">Activity & Audit Log</CardTitle>
              <CardDescription>
                Chronological record of status changes and manager interactions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-border relative space-y-4 border-l pl-4 text-[13px]">
                <div className="relative">
                  <div className="bg-accent ring-surface-1 absolute top-1 -left-[21px] h-2.5 w-2.5 rounded-full ring-4" />
                  <p className="text-text font-medium">Requisition Created</p>
                  <p className="text-text-muted text-[12px]">
                    Created on {formatDate(opening.createdAt)} by Hiring Team
                  </p>
                </div>
                <div className="relative">
                  <div className="bg-success ring-surface-1 absolute top-1 -left-[21px] h-2.5 w-2.5 rounded-full ring-4" />
                  <p className="text-text font-medium">Published & Active</p>
                  <p className="text-text-muted text-[12px]">Current Status: {opening.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
