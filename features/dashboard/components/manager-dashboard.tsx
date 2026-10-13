'use client';

import * as React from 'react';
import Link from 'next/link';
import { useOpenings } from '@/features/openings/hooks';
import { useCandidates, useRecordManagerDecision } from '@/features/candidates/hooks';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Briefcase,
  Users,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  Mail,
  Phone,
  Sparkles,
  DollarSign,
  BriefcaseBusiness,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCtc } from '@/lib/format';

export function ManagerDashboard() {
  const { data: user } = useCurrentUser();
  const { data: openings = [] } = useOpenings();
  const { data: candidates = [] } = useCandidates();
  const recordDecision = useRecordManagerDecision();

  // Active openings
  const activeOpenings = openings.filter(
    (o) => o.status === 'Open' || o.status === 'Sourcing' || o.status === 'Interviewing'
  );

  // Candidates requiring manager review (Shared with Manager stage)
  const pendingReviewCandidates = candidates.filter(
    (c) => c.stage === 'Shared with Manager' && c.managerDecision === 'Pending'
  );

  // Candidates in interview stage
  const interviewCandidates = candidates.filter((c) => c.stage === 'Interview');

  // Offer / Selected stage candidates
  const offerCandidates = candidates.filter(
    (c) => c.stage === 'Selected' || c.stage === 'Offer Sent'
  );

  const handleDecision = (id: string, name: string, decision: 'Shortlisted' | 'Rejected') => {
    recordDecision.mutate(
      { id, decision },
      {
        onSuccess: () => {
          if (decision === 'Shortlisted') {
            toast.success(`${name} has been shortlisted for technical interview!`);
          } else {
            toast.error(`${name} has been marked as rejected.`);
          }
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
            Welcome back, {user?.name?.split(' ')[0] ?? 'Manager'} 👋
          </h1>
          <p className="text-text-muted text-[14px]">
            Here is what needs your attention across your active hiring pipelines.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="primary" className="gap-2">
            <Link href="/openings/new">
              <Plus className="h-4 w-4" />
              <span>Create Requisition</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Requisitions"
          value={activeOpenings.length}
          delta="+1 this month"
        />
        <StatCard
          label="Awaiting Your Review"
          value={pendingReviewCandidates.length}
          delta={pendingReviewCandidates.length > 0 ? 'Action required' : 'All clear'}
        />
        <StatCard
          label="Technical Interviews"
          value={interviewCandidates.length}
          delta="Active schedule"
        />
        <StatCard
          label="Offers in Progress"
          value={offerCandidates.length}
          delta="Final stage"
        />
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2/3 width): Action Items & Pipeline */}
        <div className="space-y-6 lg:col-span-2">
          {/* Candidates Awaiting Review */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-[17px]">Candidates Awaiting Your Review</CardTitle>
                  {pendingReviewCandidates.length > 0 && (
                    <Badge variant="warning" className="font-semibold">
                      {pendingReviewCandidates.length} Pending
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-[13px]">
                  Profiles shared by HR. Review credentials and advance or reject candidates.
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-accent gap-1 text-[13px]">
                <Link href="/pipeline">
                  <span>View Board</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingReviewCandidates.length === 0 ? (
                <div className="text-text-muted border-border/60 flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed py-8 text-center text-[13px]">
                  <CheckCircle2 className="text-success mb-2 h-8 w-8 opacity-80" />
                  <p className="font-medium">You are all caught up!</p>
                  <p className="text-text-subtle text-[12px]">No candidate profiles are waiting for your review.</p>
                </div>
              ) : (
                pendingReviewCandidates.slice(0, 4).map((candidate) => (
                  <div
                    key={candidate.id}
                    className="border-border bg-surface-2/40 hover:bg-surface-2 flex flex-col justify-between gap-3 rounded-[var(--radius-md)] border p-3.5 transition-colors sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-surface-3 text-text font-semibold text-[12px]">
                          {candidate.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-text text-[14px] font-semibold">{candidate.name}</span>
                          <StatusBadge status={candidate.stage} type="candidate" />
                        </div>
                        <p className="text-text-muted flex items-center gap-1.5 text-[12px]">
                          <Building2 className="h-3.5 w-3.5 shrink-0 opacity-70" />
                          <span>{candidate.currentRole} at {candidate.currentCompany}</span>
                          <span>•</span>
                          <span>{candidate.experienceYears} yrs</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {/* View Resume Drawer */}
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]">
                            <FileText className="h-3.5 w-3.5" />
                            <span>Profile</span>
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:max-w-md">
                          <SheetHeader>
                            <SheetTitle>{candidate.name}</SheetTitle>
                            <SheetDescription>
                              Candidate Profile & Review Sheet
                            </SheetDescription>
                          </SheetHeader>
                          <div className="space-y-4 py-4 text-[13px]">
                            <div className="border-border bg-surface-2 rounded-lg border p-3 space-y-2">
                              <div className="flex items-center gap-2 text-text-muted">
                                <Mail className="h-4 w-4" />
                                <span>{candidate.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-text-muted">
                                <Phone className="h-4 w-4" />
                                <span>{candidate.phone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-text-muted">
                                <BriefcaseBusiness className="h-4 w-4" />
                                <span>Role: {candidate.currentRole} ({candidate.currentCompany})</span>
                              </div>
                              <div className="flex items-center gap-2 text-text-muted">
                                <DollarSign className="h-4 w-4" />
                                <span>Expected: {formatCtc(candidate.expectedCtc)} (Notice: {candidate.noticePeriod})</span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <h4 className="font-semibold text-text">Source & Details</h4>
                              <div className="flex flex-wrap gap-1.5">
                                <Badge variant="default" className="text-[11px]">
                                  Source: {candidate.source}
                                </Badge>
                                <Badge variant="default" className="text-[11px]">
                                  Exp: {candidate.experienceYears} Years
                                </Badge>
                              </div>
                            </div>

                            {candidate.hrNotes && (
                              <div className="space-y-1.5">
                                <h4 className="font-semibold text-text">HR Screening Notes</h4>
                                <p className="border-border bg-surface-2/60 text-text-muted rounded-md border p-3 leading-relaxed">
                                  {candidate.hrNotes}
                                </p>
                              </div>
                            )}

                            <div className="pt-4 flex gap-2">
                              <Button
                                className="flex-1 gap-1.5"
                                variant="primary"
                                onClick={() => handleDecision(candidate.id, candidate.name, 'Shortlisted')}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Shortlist</span>
                              </Button>
                              <Button
                                className="flex-1 gap-1.5"
                                variant="destructive"
                                onClick={() => handleDecision(candidate.id, candidate.name, 'Rejected')}
                              >
                                <XCircle className="h-4 w-4" />
                                <span>Reject</span>
                              </Button>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDecision(candidate.id, candidate.name, 'Shortlisted')}
                        className="text-success hover:bg-success/10 h-8 gap-1 text-[12px]"
                        title="Shortlist for interview"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Shortlist</span>
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDecision(candidate.id, candidate.name, 'Rejected')}
                        className="text-danger hover:bg-danger/10 h-8 gap-1 text-[12px]"
                        title="Reject candidate"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Reject</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Active Requisitions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-[17px]">Active Requisitions</CardTitle>
                <CardDescription className="text-[13px]">
                  Open positions currently actively hiring in your department.
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-accent gap-1 text-[13px]">
                <Link href="/openings">
                  <span>View All ({activeOpenings.length})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeOpenings.length === 0 ? (
                <div className="text-text-muted border-border/60 flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed py-8 text-center text-[13px]">
                  <Briefcase className="text-text-muted mb-2 h-8 w-8 opacity-60" />
                  <p className="font-medium">No active requisitions</p>
                  <p className="text-text-subtle text-[12px]">Create a new requisition to begin hiring.</p>
                </div>
              ) : (
                activeOpenings.slice(0, 3).map((opening) => (
                  <div
                    key={opening.id}
                    className="border-border bg-surface-2/30 hover:bg-surface-2 flex items-center justify-between rounded-[var(--radius-md)] border p-3.5 transition-colors"
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
                      <div className="text-text-muted flex flex-wrap items-center gap-2 text-[12px]">
                        <span>{opening.department}</span>
                        <span>•</span>
                        <span>{opening.location}</span>
                        <span>•</span>
                        <span>{opening.headcount} position{opening.headcount > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-[12px]">
                      <Link href={`/openings/${opening.id}`}>
                        <span>Manage</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3 width): Upcoming Interviews & Actions */}
        <div className="space-y-6">
          {/* Upcoming Interviews Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[16px] flex items-center gap-2">
                <Calendar className="text-accent h-4 w-4" />
                <span>Interviews In Progress</span>
              </CardTitle>
              <CardDescription className="text-[12px]">
                Candidates in the technical evaluation round.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {interviewCandidates.length === 0 ? (
                <p className="text-text-muted py-4 text-center text-[12px]">
                  No candidates currently in technical interview stage.
                </p>
              ) : (
                interviewCandidates.slice(0, 3).map((candidate) => (
                  <div
                    key={candidate.id}
                    className="border-border bg-surface-2/50 rounded-lg border p-3 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-text font-semibold text-[13px]">{candidate.name}</span>
                      <Badge variant="accent" className="text-[11px] font-medium">
                        {candidate.interviewMode ?? 'Video'}
                      </Badge>
                    </div>
                    <p className="text-text-muted text-[12px] flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{candidate.interviewDate ? new Date(candidate.interviewDate).toLocaleDateString() : 'Scheduled Soon'}</span>
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="text-text-subtle">{candidate.currentRole}</span>
                      <Link href="/pipeline" className="text-accent hover:underline">
                        Open Pipeline
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Shortcuts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[16px] flex items-center gap-2">
                <Sparkles className="text-accent h-4 w-4" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start gap-2 h-9 text-[13px]">
                <Link href="/openings/new">
                  <Plus className="h-4 w-4 text-accent" />
                  <span>Request New Headcount</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2 h-9 text-[13px]">
                <Link href="/pipeline">
                  <Users className="h-4 w-4 text-accent" />
                  <span>View Pipeline Kanban</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2 h-9 text-[13px]">
                <Link href="/candidates">
                  <Briefcase className="h-4 w-4 text-accent" />
                  <span>Candidates Directory</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

