'use client';

import * as React from 'react';
import Link from 'next/link';
import { useOpenings } from '@/features/openings/hooks';
import { useCandidates, useRecordManagerDecision } from '@/features/candidates/hooks';
import { StatCard } from '@/components/hro/stat-card';
import { StatusBadge } from '@/components/hro/status-badge';
import { MetaSeparator } from '@/components/hro/meta-separator';
import { ActiveOpeningsCard } from '@/components/hro/active-openings-card';
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
  Phone,
  MapPin,
  ChevronRight,
  Briefcase,
  DollarSign,
  Mail,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import { VideoCameraIcon } from '@/components/ui/icons';
import { toast } from 'sonner';
import { formatCtc, formatInterviewDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { getAvatarColorClass } from '@/lib/avatar';

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
          <div className="border border-border bg-surface-1 flex h-full flex-col rounded-[12px] p-5">
            {/* Header: title left, text link right */}
            <div className="flex items-center justify-between gap-4 pb-4">
              <h2 className="text-text text-[16px] leading-[24px] font-medium tracking-[-0.01em]">
                Candidates Awaiting Your Review
              </h2>
              <Link
                href="/shortlist"
                className="inline-flex items-center gap-1 text-[13px] leading-[20px] font-medium text-text-muted hover:text-text transition-colors shrink-0"
              >
                <span>View all</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Content Area: flex-1 */}
            <div className="flex-1">
              {isInitialLoading ? (
                <div className="space-y-3 py-2">
                  <Skeleton className="h-[56px] rounded-[8px]" />
                  <Skeleton className="h-[56px] rounded-[8px]" />
                  <Skeleton className="h-[56px] rounded-[8px]" />
                </div>
              ) : pendingReviewCandidates.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <p className="text-text text-[14px] font-medium">All caught up</p>
                  <p className="text-text-subtle text-[12px] mt-1">
                    No candidate profiles currently awaiting your review.
                  </p>
                </div>
              ) : (
                <div className="divide-border divide-y">
                  {pendingReviewCandidates.slice(0, 4).map((candidate) => (
                    <div
                      key={candidate.id}
                      className="group -mx-2 flex flex-col justify-between gap-2.5 rounded-[8px] px-2 py-3 transition-colors hover:bg-surface-2 sm:min-h-[56px] sm:flex-row sm:items-center"
                    >
                      {/* Candidate Avatar & Meta Info */}
                      <div className="flex min-w-0 items-start sm:items-center gap-3">
                        <div className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold select-none shadow-2xs mt-0.5 sm:mt-0',
                          getAvatarColorClass(candidate.name)
                        )}>
                          {candidate.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-text text-[14px] leading-[20px] font-medium">
                              {candidate.name}
                            </span>
                            <span className="text-text-subtle text-[12px] leading-[16px]">
                              Shared 2d ago
                            </span>
                          </div>
                          <div className="text-text-muted flex items-center gap-1.5 sm:gap-2 text-[13px] leading-[20px]">
                            <span
                              className="max-w-[170px] xs:max-w-[210px] sm:max-w-none sm:w-[260px] shrink-0 truncate"
                              title={`${candidate.currentRole} at ${candidate.currentCompany}`}
                            >
                              {candidate.currentRole} at {candidate.currentCompany}
                            </span>
                            <span className="shrink-0 tabular-nums font-bold text-text">{candidate.experienceYears}y exp</span>
                          </div>
                        </div>
                      </div>

                      {/* Right-aligned Actions: ghost buttons that appear on hover */}
                      <div className="flex shrink-0 items-center gap-1 pl-11 sm:pl-0 opacity-100 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        {/* Profile Sheet Drawer */}
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1.5 rounded-[6px] px-2 text-[13px] font-medium text-text-muted hover:text-text"
                            >
                              <FileText className="h-3.5 w-3.5" />
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
                              <div className="border border-border bg-surface-2 space-y-2 rounded-[var(--radius-md)] p-3.5">
                                <div className="text-text-muted flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  <span>{candidate.email}</span>
                                </div>
                                <div className="text-text-muted flex items-center gap-2">
                                  <PhoneCall className="h-4 w-4" />
                                  <span>{candidate.phone}</span>
                                </div>
                                <div className="text-text-muted flex items-center gap-2">
                                  <span>
                                    Role: {candidate.currentRole} ({candidate.currentCompany})
                                  </span>
                                </div>
                                <div className="text-text-muted flex items-center gap-2">
                                  <span className="tabular-nums">
                                    Expected: {formatCtc(candidate.expectedCtc)} (Notice:{' '}
                                    <span className="font-bold text-text">{candidate.noticePeriod}</span>)
                                  </span>
                                </div>
                              </div>

                              {candidate.hrNotes && (
                                <div className="space-y-1.5">
                                  <h4 className="text-text font-medium">HR Screening Notes</h4>
                                  <p className="border border-border bg-surface-2 text-text-muted rounded-[var(--radius-md)] p-3 leading-relaxed">
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
                                  <Check className="h-4 w-4" />
                                  <span>Shortlist</span>
                                </Button>
                                <Button
                                  className="flex-1 gap-1.5"
                                  variant="secondary"
                                  onClick={() =>
                                    handleDecision(candidate.id, candidate.name, 'Rejected')
                                  }
                                >
                                  <X className="h-4 w-4" />
                                  <span>Reject</span>
                                </Button>
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>

                        {/* Shortlist Action */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDecision(candidate.id, candidate.name, 'Shortlisted')
                          }
                          className="text-text-muted hover:text-text h-8 gap-1 rounded-[6px] px-2 text-[13px] font-medium"
                          title="Shortlist candidate for interview"
                        >
                          <Check className="text-success h-3.5 w-3.5" />
                          <span>Shortlist</span>
                        </Button>

                        {/* Reject Action */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDecision(candidate.id, candidate.name, 'Rejected')}
                          className="text-text-muted hover:text-danger h-8 gap-1 rounded-[6px] px-2 text-[13px] font-medium"
                          title="Reject candidate"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 1 RIGHT (4 cols): Technical Interviews Scheduled */}
        <div className="col-span-12 flex flex-col lg:col-span-4">
          <div className="border border-border bg-surface-1 flex h-full flex-col rounded-[12px] p-5">
            {/* Header: title + subtitle left, text link right */}
            <div className="flex items-start justify-between gap-4 pb-4">
              <div>
                <h2 className="text-text text-[16px] leading-[24px] font-medium tracking-[-0.01em]">
                  Technical Interviews
                </h2>
                <p className="text-text-muted mt-[2px] text-[13px] leading-[20px]">
                  {interviewCandidates.length} scheduled evaluation
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

            {/* Content Area */}
            <div className="flex-1">
              {isInitialLoading ? (
                <div className="space-y-3 py-2">
                  <Skeleton className="h-[56px] rounded-[8px]" />
                  <Skeleton className="h-[56px] rounded-[8px]" />
                </div>
              ) : interviewCandidates.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <p className="text-text text-[14px] font-medium">No interviews scheduled</p>
                  <p className="text-text-subtle text-[12px] mt-1">
                    Shortlist candidates to begin scheduling technical discussions.
                  </p>
                </div>
              ) : (
                <div className="divide-border divide-y">
                  {interviewCandidates.slice(0, 3).map((candidate) => {
                    const mode = candidate.interviewMode ?? 'Video';
                    const ModeIcon = mode === 'Phone' ? Phone : mode === 'Onsite' ? MapPin : VideoCameraIcon;

                    return (
                      <div
                        key={candidate.id}
                        className="group hover:bg-surface-2 -mx-2 flex flex-col justify-between gap-1.5 rounded-[8px] px-2 py-3 transition-colors"
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: Active Openings (12 cols full-width table card) */}
        <div className="col-span-12 flex flex-col">
          <ActiveOpeningsCard
            openings={activeOpenings}
            candidates={candidates}
            title="Active Openings"
            subtitle={null}
            viewAllHref="/openings"
            isLoading={isInitialLoading}
          />
        </div>
      </div>
    </div>
  );
}
