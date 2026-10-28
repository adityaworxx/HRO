'use client';

import * as React from 'react';
import Link from 'next/link';
import { useOpenings } from '@/features/openings/hooks';
import { useCandidates, useRecordManagerDecision } from '@/features/candidates/hooks';
import { StatCard } from '@/components/hro/stat-card';
import { StatusBadge } from '@/components/hro/status-badge';
import { MetaSeparator } from '@/components/hro/meta-separator';
import { ActiveOpeningsCard } from '@/components/hro/active-openings-card';
import { CandidateCard } from '@/components/hro/candidate-card';
import { CandidateDetailSheet } from '@/features/candidates/components/candidate-detail-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { Candidate, Opening } from '@/types/entities';
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
  ChevronLeft,
  Search,
  Briefcase,
  DollarSign,
  Mail,
  PhoneCall,
  CheckCircle2,
  Code2,
  Palette,
  BarChart3,
  Layers,
  Users,
} from 'lucide-react';
import { VideoCameraIcon } from '@/components/ui/icons';
import { toast } from 'sonner';
import { formatCtc, formatInterviewDateTime } from '@/lib/format';

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
  const recordDecision = useRecordManagerDecision();

  const [selectedCandidate, setSelectedCandidate] = React.useState<Candidate | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  // Map openingId to Opening for O(1) lookups
  const openingsMap = React.useMemo(() => {
    return new Map<string, Opening>(openings.map((o) => [o.id, o]));
  }, [openings]);

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

  // Search & Pagination state for Candidates Awaiting Review
  const [reviewSearchQuery, setReviewSearchQuery] = React.useState<string>('');
  const [reviewPageByDept, setReviewPageByDept] = React.useState<Record<string, number>>({});

  // Reset pagination when search query or pending candidate list changes
  React.useEffect(() => {
    setReviewPageByDept({});
  }, [reviewSearchQuery, pendingReviewCandidates.length]);

  // Filter pending review candidates by search query
  const filteredReviewCandidates = React.useMemo(() => {
    const q = reviewSearchQuery.trim().toLowerCase();
    if (!q) return pendingReviewCandidates;
    return pendingReviewCandidates.filter((c) => {
      const opening = openingsMap.get(c.openingId);
      return (
        c.name.toLowerCase().includes(q) ||
        c.currentRole.toLowerCase().includes(q) ||
        c.currentCompany.toLowerCase().includes(q) ||
        (opening && (
          opening.title.toLowerCase().includes(q) ||
          opening.department.toLowerCase().includes(q) ||
          opening.mustHaveSkills.some((s) => s.toLowerCase().includes(q))
        ))
      );
    });
  }, [pendingReviewCandidates, reviewSearchQuery, openingsMap]);

  // Group pending review candidates by department
  const departmentGroups = React.useMemo(() => {
    const map = new Map<string, Candidate[]>();
    for (const c of filteredReviewCandidates) {
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
  }, [filteredReviewCandidates, openingsMap]);

  // Candidates in technical interview stage & pagination
  const [interviewPage, setInterviewPage] = React.useState<number>(1);
  const INTERVIEWS_PER_PAGE = 3;

  const interviewCandidates = React.useMemo(
    () => candidates.filter((c) => c.stage === 'Interview'),
    [candidates]
  );

  const totalInterviewPages = Math.ceil(interviewCandidates.length / INTERVIEWS_PER_PAGE);
  const validInterviewPage = Math.min(Math.max(1, interviewPage), Math.max(1, totalInterviewPages));
  const visibleInterviewCandidates = React.useMemo(() => {
    const start = (validInterviewPage - 1) * INTERVIEWS_PER_PAGE;
    return interviewCandidates.slice(start, start + INTERVIEWS_PER_PAGE);
  }, [interviewCandidates, validInterviewPage]);

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
            {/* Header: title left, search & text link right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <h2 className="text-text text-[16px] leading-[24px] font-semibold tracking-[-0.01em]">
                  Candidates Awaiting Your Review
                </h2>
                {pendingReviewCandidates.length > 0 && (
                  <span className="font-mono text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                    {pendingReviewCandidates.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative w-full sm:w-[155px]">
                  <Search className="text-text-subtle pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
                  <Input
                    type="text"
                    value={reviewSearchQuery}
                    onChange={(e) => setReviewSearchQuery(e.target.value)}
                    placeholder="Search candidates..."
                    aria-label="Search candidates awaiting review"
                    className="bg-surface-2/40 border-border/70 hover:border-border focus:border-border-strong h-7.5 w-full pl-8 pr-2 text-[12px] rounded-[6px]"
                  />
                </div>

                <Link
                  href="/shortlist"
                  className="inline-flex items-center gap-1 text-[13px] leading-[20px] font-medium text-text-muted hover:text-text transition-colors shrink-0"
                >
                  <span>View all</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Content Area: flex-1 */}
            <div className="flex-1 pt-4">
              {isInitialLoading ? (
                <div className="space-y-3 py-2">
                  <Skeleton className="h-[120px] rounded-[10px]" />
                </div>
              ) : pendingReviewCandidates.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <p className="text-text text-[14px] font-medium">All caught up</p>
                  <p className="text-text-subtle text-[12px] mt-1">
                    No candidate profiles currently awaiting your review.
                  </p>
                </div>
              ) : departmentGroups.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center select-none">
                  <p className="text-[13px] text-text-muted">No candidates match &quot;{reviewSearchQuery}&quot;</p>
                  <button
                    type="button"
                    onClick={() => setReviewSearchQuery('')}
                    className="text-[12px] text-accent hover:underline mt-1 cursor-pointer"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="flex gap-3.5 overflow-x-auto pb-2 items-start scrollbar-thin">
                  {departmentGroups.map((group) => {
                    const GroupIcon = group.icon;
                    const CANDIDATES_PER_PAGE = 2;
                    const totalInDept = group.candidates.length;
                    const deptPage = reviewPageByDept[group.id] || 1;
                    const deptTotalPages = Math.ceil(totalInDept / CANDIDATES_PER_PAGE);
                    const validDeptPage = Math.min(Math.max(1, deptPage), Math.max(1, deptTotalPages));
                    const startIndex = (validDeptPage - 1) * CANDIDATES_PER_PAGE;
                    const visibleInDept = group.candidates.slice(
                      startIndex,
                      startIndex + CANDIDATES_PER_PAGE
                    );

                    return (
                      <div
                        key={group.id}
                        className="w-[280px] sm:w-[295px] shrink-0 flex flex-col justify-between rounded-[12px] bg-surface-2/30 border border-border/70 border-t-2 border-t-accent p-3 space-y-2.5"
                      >
                        <div className="space-y-2.5">
                          {/* Column Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-border/60">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-accent/15 text-accent shrink-0">
                                <GroupIcon className="h-3.5 w-3.5" />
                              </div>
                              <h3 className="text-[13px] font-semibold text-text truncate">
                                {group.title}
                              </h3>
                            </div>
                            <span className="font-mono text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
                              {totalInDept}
                            </span>
                          </div>

                          {/* Candidate Cards */}
                          <div className="space-y-2">
                            {visibleInDept.map((candidate) => (
                              <CandidateCard
                                key={candidate.id}
                                candidate={candidate}
                                onClick={() => {
                                  setSelectedCandidate(candidate);
                                  setIsSheetOpen(true);
                                }}
                                showReorderIcon={false}
                                actions={
                                  <div className="flex items-center gap-1.5 w-full">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 flex-1 gap-1 text-[11.5px] font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/15 rounded-[6px]"
                                      onClick={() => handleDecision(candidate.id, candidate.name, 'Shortlisted')}
                                      title="Shortlist candidate for interview"
                                    >
                                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                      <span>Shortlist</span>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 flex-1 gap-1 text-[11.5px] font-medium text-text-muted hover:text-danger hover:bg-danger/10 rounded-[6px]"
                                      onClick={() => handleDecision(candidate.id, candidate.name, 'Rejected')}
                                      title="Reject candidate"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                      <span>Reject</span>
                                    </Button>
                                  </div>
                                }
                              />
                            ))}
                          </div>
                        </div>

                        {/* Per-Column Pagination Footer when > 2 candidates in department */}
                        {deptTotalPages > 1 && (
                          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11.5px] select-none">
                            <button
                              type="button"
                              disabled={validDeptPage <= 1}
                              onClick={() =>
                                setReviewPageByDept((prev) => ({
                                  ...prev,
                                  [group.id]: Math.max(1, validDeptPage - 1),
                                }))
                              }
                              className="h-6 w-6 inline-flex items-center justify-center rounded-[5px] border border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              title="Previous page"
                              aria-label="Previous page"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>

                            <span className="font-mono text-text-subtle text-[11px]">
                              {validDeptPage} of {deptTotalPages}
                            </span>

                            <button
                              type="button"
                              disabled={validDeptPage >= deptTotalPages}
                              onClick={() =>
                                setReviewPageByDept((prev) => ({
                                  ...prev,
                                  [group.id]: Math.min(deptTotalPages, validDeptPage + 1),
                                }))
                              }
                              className="h-6 w-6 inline-flex items-center justify-center rounded-[5px] border border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              title="Next page"
                              aria-label="Next page"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 1 RIGHT (4 cols): Technical Interviews Scheduled */}
        <div className="col-span-12 flex flex-col lg:col-span-4">
          <div className="border border-border bg-surface-1 flex h-full flex-col justify-between rounded-[12px] p-5">
            <div>
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
              <div>
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
                    {visibleInterviewCandidates.map((candidate) => {
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

            {/* Pagination Footer for Interviews */}
            {!isInitialLoading && totalInterviewPages > 1 && (
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/60 text-[11.5px] select-none">
                <span className="font-mono text-text-subtle text-[11px]">
                  Page {validInterviewPage} of {totalInterviewPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={validInterviewPage <= 1}
                    onClick={() => setInterviewPage((p) => Math.max(1, p - 1))}
                    className="h-6 w-6 inline-flex items-center justify-center rounded-[5px] border border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Previous page"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={validInterviewPage >= totalInterviewPages}
                    onClick={() => setInterviewPage((p) => Math.min(totalInterviewPages, p + 1))}
                    className="h-6 w-6 inline-flex items-center justify-center rounded-[5px] border border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Next page"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
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

      {/* Candidate Profile & Review Drawer */}
      <CandidateDetailSheet
        candidate={selectedCandidate}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
}
