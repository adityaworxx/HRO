'use client';

import * as React from 'react';
import Link from 'next/link';
import { useOpenings } from '@/features/openings/hooks';
import { useCandidates, useRecordManagerDecision } from '@/features/candidates/hooks';
import { StatCard } from '@/components/hro/stat-card';
import { StatusBadge } from '@/components/hro/status-badge';
import { MetaSeparator } from '@/components/hro/meta-separator';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  ArrowRight,
  Check,
  X,
  FileText,
  Building2,
  Clock,
  Video,
  Phone,
  MapPin,
  ChevronRight,
  ListFilter,
  GitPullRequest,
  Users,
  Briefcase,
  DollarSign,
  Mail,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCtc, formatInterviewDateTime } from '@/lib/format';

export function ManagerDashboard() {
  const { data: openings = [], isLoading: loadingOpenings } = useOpenings();
  const { data: candidates = [], isLoading: loadingCandidates } = useCandidates();
  const recordDecision = useRecordManagerDecision();

  // Active openings (renamed from requisitions per Rule 9)
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

  const handleDecision = (id: string, name: string, decision: 'Shortlisted' | 'Rejected') => {
    recordDecision.mutate(
      { id, decision },
      {
        onSuccess: () => {
          if (decision === 'Shortlisted') {
            toast.success(`${name} has been shortlisted for technical interview.`);
          } else {
            toast.error(`${name} has been marked as rejected.`);
          }
        },
      }
    );
  };

  const isInitialLoading = loadingOpenings || loadingCandidates;

  return (
    <div className="w-full">
      {/* Stat Cards Grid: 24px gap throughout */}
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
              label="Active Openings"
              value={activeOpenings.length}
              delta="+1 this month"
              href="/openings"
            />
            <StatCard
              label="Awaiting Your Review"
              value={pendingReviewCandidates.length}
              delta={pendingReviewCandidates.length > 0 ? 'Action required' : 'All clear'}
              isWarning={pendingReviewCandidates.length > 0}
              href="/shortlist"
            />
            <StatCard
              label="Technical Interviews"
              value={interviewCandidates.length}
              delta="Active schedule"
              href="/interviews"
            />
            <StatCard
              label="Offers in Progress"
              value={offerCandidates.length}
              delta="Final stage"
              href="/pipeline"
            />
          </>
        )}
      </div>

      {/* 3. Main 12-Column Grid: 8 cols main, 4 cols sidebar; equal row heights */}
      <div className="grid grid-cols-12 items-stretch gap-6">
        {/* ROW 1 LEFT (8 cols): Candidates Awaiting Review */}
        <div className="col-span-12 flex flex-col lg:col-span-8">
          <div className="border-border bg-surface-1 flex h-full flex-col rounded-[12px] border p-6">
            {/* Header Block: title, 4px subtitle, 16px to content */}
            <div className="mb-4 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-text text-[16px] leading-[24px] font-semibold">
                    Candidates Awaiting Your Review
                  </h2>
                  {pendingReviewCandidates.length > 0 && (
                    <span className="bg-surface-2 text-text-muted border-border/60 rounded-full border px-2 py-0.5 text-[12px] leading-[16px] font-medium select-none">
                      {pendingReviewCandidates.length} Pending
                    </span>
                  )}
                </div>
                <p className="text-text-muted text-[13px] leading-[20px]">
                  Profiles shared by talent acquisition. Evaluate credentials and advance or reject
                  candidates.
                </p>
              </div>
            </div>

            {/* Content Area: flex-1 */}
            <div className="flex-1">
              {isInitialLoading ? (
                <div className="space-y-3 py-2">
                  <Skeleton className="h-[64px] rounded-[8px]" />
                  <Skeleton className="h-[64px] rounded-[8px]" />
                  <Skeleton className="h-[64px] rounded-[8px]" />
                </div>
              ) : pendingReviewCandidates.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <CheckCircle2 className="text-success mb-2 h-7 w-7 stroke-[1.75]" />
                  <p className="text-text text-[14px] font-medium">All caught up</p>
                  <p className="text-text-subtle text-[12px]">
                    No candidate profiles currently awaiting your review.
                  </p>
                </div>
              ) : (
                <div className="divide-border divide-y">
                  {pendingReviewCandidates.slice(0, 4).map((candidate) => (
                    <div
                      key={candidate.id}
                      className="hover:bg-surface-2 -mx-3 flex flex-col justify-between gap-2.5 rounded-[8px] px-3 py-3 transition-colors sm:min-h-[64px] sm:flex-row sm:items-center"
                    >
                      {/* Candidate Avatar & Meta Info */}
                      <div className="flex min-w-0 items-start sm:items-center gap-3">
                        <div className="bg-surface-2 text-text flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold select-none mt-0.5 sm:mt-0">
                          {candidate.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-text text-[14px] leading-[20px] font-semibold">
                              {candidate.name}
                            </span>
                            <span className="text-text-subtle text-[12px] leading-[16px]">
                              Shared 2d ago
                            </span>
                          </div>
                          <div className="text-text-muted flex items-center text-[13px] leading-[20px]">
                            <Building2 className="text-text-subtle mr-1.5 h-3.5 w-3.5 shrink-0 stroke-[1.75]" />
                            <span className="truncate">
                              {candidate.currentRole} at {candidate.currentCompany}
                            </span>
                            <MetaSeparator />
                            <span className="shrink-0">{candidate.experienceYears}y exp</span>
                          </div>
                        </div>
                      </div>

                      {/* Right-aligned Actions: 32px height, 8px gap */}
                      <div className="flex shrink-0 items-center gap-2 pl-12 sm:pl-0">
                        {/* Profile Sheet Drawer */}
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1.5 rounded-[8px] px-2.5 text-[13px] font-medium"
                            >
                              <FileText className="h-4 w-4 stroke-[1.75]" />
                              <span>Profile</span>
                            </Button>
                          </SheetTrigger>
                          <SheetContent side="right" className="w-full sm:max-w-md">
                            <SheetHeader>
                              <SheetTitle className="text-[18px]">{candidate.name}</SheetTitle>
                              <SheetDescription className="text-[13px]">
                                Candidate Profile & Review Sheet
                              </SheetDescription>
                            </SheetHeader>
                            <div className="space-y-4 py-4 text-[13px]">
                              <div className="border-border bg-surface-2 space-y-2 rounded-[var(--radius-md)] border p-3.5">
                                <div className="text-text-muted flex items-center gap-2">
                                  <Mail className="h-4 w-4 stroke-[1.75]" />
                                  <span>{candidate.email}</span>
                                </div>
                                <div className="text-text-muted flex items-center gap-2">
                                  <PhoneCall className="h-4 w-4 stroke-[1.75]" />
                                  <span>{candidate.phone}</span>
                                </div>
                                <div className="text-text-muted flex items-center gap-2">
                                  <Briefcase className="h-4 w-4 stroke-[1.75]" />
                                  <span>
                                    Role: {candidate.currentRole} ({candidate.currentCompany})
                                  </span>
                                </div>
                                <div className="text-text-muted flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 stroke-[1.75]" />
                                  <span>
                                    Expected: {formatCtc(candidate.expectedCtc)} (Notice:{' '}
                                    {candidate.noticePeriod})
                                  </span>
                                </div>
                              </div>

                              {candidate.hrNotes && (
                                <div className="space-y-1.5">
                                  <h4 className="text-text font-semibold">HR Screening Notes</h4>
                                  <p className="border-border bg-surface-2 text-text-muted rounded-[var(--radius-md)] border p-3 leading-relaxed">
                                    {candidate.hrNotes}
                                  </p>
                                </div>
                              )}

                              <div className="flex gap-2 pt-4">
                                <Button
                                  className="flex-1 gap-1.5"
                                  variant="primary"
                                  onClick={() =>
                                    handleDecision(candidate.id, candidate.name, 'Shortlisted')
                                  }
                                >
                                  <Check className="h-4 w-4 stroke-[2]" />
                                  <span>Shortlist</span>
                                </Button>
                                <Button
                                  className="flex-1 gap-1.5"
                                  variant="destructive"
                                  onClick={() =>
                                    handleDecision(candidate.id, candidate.name, 'Rejected')
                                  }
                                >
                                  <X className="h-4 w-4 stroke-[2]" />
                                  <span>Reject</span>
                                </Button>
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>

                        {/* Shortlist Action */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            handleDecision(candidate.id, candidate.name, 'Shortlisted')
                          }
                          className="border-border-strong text-text h-8 gap-1.5 rounded-[8px] px-2.5 text-[13px] font-medium"
                          title="Shortlist candidate for interview"
                        >
                          <Check className="text-success h-4 w-4 stroke-[2]" />
                          <span>Shortlist</span>
                        </Button>

                        {/* Reject Action */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDecision(candidate.id, candidate.name, 'Rejected')}
                          className="text-danger h-8 gap-1.5 rounded-[8px] px-2.5 text-[13px] font-medium hover:bg-[var(--badge-danger-bg)]"
                          title="Reject candidate"
                        >
                          <X className="h-4 w-4 stroke-[1.75]" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pinned Footer Link */}
            {pendingReviewCandidates.length > 4 && (
              <div className="border-border mt-auto border-t pt-4">
                <Link
                  href="/shortlist"
                  className="text-accent inline-flex items-center gap-1.5 text-[13px] font-medium hover:underline"
                >
                  <span>View all {pendingReviewCandidates.length} in Shortlist</span>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[1.75]" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ROW 1 RIGHT (4 cols): Technical Interviews Scheduled */}
        <div className="col-span-12 flex flex-col lg:col-span-4">
          <div className="border-border bg-surface-1 flex h-full flex-col rounded-[12px] border p-6">
            {/* Header Block */}
            <div className="mb-4 space-y-1">
              <h2 className="text-text text-[16px] leading-[24px] font-semibold">
                Technical Interviews
              </h2>
              <p className="text-text-muted text-[13px] leading-[20px]">
                Candidates in the technical evaluation round.
              </p>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              {isInitialLoading ? (
                <div className="space-y-3 py-2">
                  <Skeleton className="h-[60px] rounded-[8px]" />
                  <Skeleton className="h-[60px] rounded-[8px]" />
                </div>
              ) : interviewCandidates.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <Clock className="text-text-subtle mb-2 h-7 w-7 stroke-[1.75]" />
                  <p className="text-text text-[14px] font-medium">No interviews scheduled</p>
                  <p className="text-text-subtle text-[12px]">
                    Shortlist candidates to begin scheduling technical discussions.
                  </p>
                </div>
              ) : (
                <div className="divide-border divide-y">
                  {interviewCandidates.slice(0, 3).map((candidate) => {
                    const mode = candidate.interviewMode ?? 'Video';
                    const ModeIcon = mode === 'Phone' ? Phone : mode === 'Onsite' ? MapPin : Video;

                    return (
                      <div
                        key={candidate.id}
                        className="hover:bg-surface-2 -mx-3 flex flex-col justify-between gap-1.5 rounded-[8px] px-3 py-3 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-text truncate text-[14px] leading-[20px] font-semibold">
                            {candidate.name}
                          </span>
                          <span className="bg-surface-2 text-text-muted border-border/60 inline-flex h-[22px] items-center gap-1 rounded-full border px-2 text-[12px] leading-[16px] font-medium">
                            <ModeIcon className="h-3.5 w-3.5 stroke-[1.75]" />
                            <span>{mode}</span>
                          </span>
                        </div>

                        <div className="text-text-muted flex items-center truncate text-[13px] leading-[20px]">
                          <Clock className="text-text-subtle mr-1.5 h-3.5 w-3.5 shrink-0 stroke-[1.75]" />
                          <span className="truncate">
                            {candidate.interviewDate
                              ? formatInterviewDateTime(candidate.interviewDate)
                              : 'Pending slot'}
                          </span>
                          <MetaSeparator />
                          <span className="truncate">{candidate.currentRole}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pinned Footer Link */}
            <div className="border-border mt-auto flex items-center justify-between border-t pt-4 text-[13px]">
              <Link
                href="/pipeline"
                className="text-accent inline-flex items-center gap-1.5 font-medium hover:underline"
              >
                <span>View pipeline</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[1.75]" />
              </Link>
              {interviewCandidates.length > 3 && (
                <Link href="/interviews" className="text-text-muted hover:text-text font-medium">
                  +{interviewCandidates.length - 3} more
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2 LEFT (8 cols): Active Openings Overview */}
        <div className="col-span-12 flex flex-col lg:col-span-8">
          <div className="border-border bg-surface-1 flex h-full flex-col rounded-[12px] border p-6">
            {/* Header Block */}
            <div className="mb-4 flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-text text-[16px] leading-[24px] font-semibold">
                  Active Openings
                </h2>
                <p className="text-text-muted text-[13px] leading-[20px]">
                  Positions currently open and actively hiring in your department.
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              {isInitialLoading ? (
                <div className="space-y-3 py-2">
                  <Skeleton className="h-[56px] rounded-[8px]" />
                  <Skeleton className="h-[56px] rounded-[8px]" />
                </div>
              ) : activeOpenings.length === 0 ? (
                <div className="flex h-36 flex-col items-center justify-center text-center">
                  <Briefcase className="text-text-subtle mb-2 h-7 w-7 stroke-[1.75]" />
                  <p className="text-text text-[14px] font-medium">No active openings</p>
                  <p className="text-text-subtle text-[12px]">
                    Create a new opening to begin recruiting.
                  </p>
                </div>
              ) : (
                <div className="divide-border divide-y">
                  {activeOpenings.slice(0, 3).map((opening) => (
                    <div
                      key={opening.id}
                      className="hover:bg-surface-2 -mx-3 flex items-center justify-between rounded-[8px] px-3 py-3 transition-colors"
                    >
                      <div className="min-w-0 space-y-0.5 pr-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/openings/${opening.id}`}
                            className="text-text hover:text-accent truncate text-[14px] leading-[20px] font-semibold transition-colors"
                          >
                            {opening.title}
                          </Link>
                          <StatusBadge status={opening.status} type="opening" />
                        </div>
                        <div className="text-text-muted flex items-center truncate text-[13px] leading-[20px]">
                          <span>{opening.department}</span>
                          <MetaSeparator />
                          <span>{opening.location}</span>
                          <MetaSeparator />
                          <span>
                            {opening.headcount} opening{opening.headcount > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-8 shrink-0 gap-1.5 rounded-[var(--radius-md)] px-2.5 text-[13px] font-medium"
                      >
                        <Link href={`/openings/${opening.id}`}>
                          <span>Manage</span>
                          <ArrowRight className="h-3.5 w-3.5 stroke-[1.75]" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pinned Footer Link */}
            {activeOpenings.length > 3 && (
              <div className="border-border mt-auto border-t pt-4">
                <Link
                  href="/openings"
                  className="text-accent inline-flex items-center gap-1.5 text-[13px] font-medium hover:underline"
                >
                  <span>View all {activeOpenings.length} openings</span>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[1.75]" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ROW 2 RIGHT (4 cols): Quick Actions */}
        <div className="col-span-12 flex flex-col lg:col-span-4">
          <div className="border-border bg-surface-1 flex h-full flex-col rounded-[var(--radius-lg)] border p-6">
            {/* Header Block: NO icon in card title per Rule 8 */}
            <div className="mb-4 space-y-1">
              <h2 className="text-text text-[16px] leading-[24px] font-semibold">Quick Actions</h2>
              <p className="text-text-muted text-[13px] leading-[20px]">
                Direct links to high-frequency hiring workflows.
              </p>
            </div>

            {/* Content Area: 40px row height per Rule 8 */}
            <div className="flex-1 space-y-1.5">
              <Link
                href="/shortlist"
                className="hover:bg-surface-2 focus-visible:ring-accent text-text flex h-10 items-center justify-between rounded-[var(--radius-md)] px-3 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <ListFilter className="text-text-muted h-4 w-4 stroke-[1.75]" />
                  <span>Review shortlist queue</span>
                </div>
                <ChevronRight className="text-text-subtle h-4 w-4 stroke-[1.75]" />
              </Link>

              <Link
                href="/pipeline"
                className="hover:bg-surface-2 focus-visible:ring-accent text-text flex h-10 items-center justify-between rounded-[var(--radius-md)] px-3 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <GitPullRequest className="text-text-muted h-4 w-4 stroke-[1.75]" />
                  <span>Pipeline Kanban board</span>
                </div>
                <ChevronRight className="text-text-subtle h-4 w-4 stroke-[1.75]" />
              </Link>

              <Link
                href="/candidates"
                className="hover:bg-surface-2 focus-visible:ring-accent text-text flex h-10 items-center justify-between rounded-[var(--radius-md)] px-3 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="text-text-muted h-4 w-4 stroke-[1.75]" />
                  <span>Candidate directory</span>
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
