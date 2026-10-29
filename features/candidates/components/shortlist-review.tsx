'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

import { useCandidates, useRecordManagerDecision } from '../hooks';

import { useOpenings } from '@/features/openings/hooks';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Textarea } from '@/components/ui/textarea';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { CandidateCard } from '@/components/hro/candidate-card';

import { SourceBadge } from '@/components/hro/source-badge';

import { CompanyLogo } from '@/components/hro/company-logo';

import { CandidateAvatar } from '@/components/hro/candidate-avatar';

import { EmptyState } from '@/components/hro/empty-state';
import { ManagerAiAnalysisSheet } from './manager-ai-analysis-sheet';

import { Sheet, SheetContent } from '@/components/ui/sheet';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import { formatCtc, formatRoleTitle } from '@/lib/format';

import { cn } from '@/lib/utils';

import {
  CheckCircle2,
  XCircle,
  FileText,
  Briefcase,
  Building2,
  Search,
  Sparkles,
  Check,
  Clock,
  ArrowRight,
  Code2,
  Palette,
  BarChart3,
  Layers,
  Users,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { matchCandidateToOpening } from '@/lib/ai-matcher';

import { toast } from 'sonner';

import type { Candidate, Opening } from '@/types/entities';

// Department Icon Map matching Openings & Candidates view

const DEPARTMENT_ICONS: Record<string, React.ElementType> = {
  Engineering: Code2,

  Design: Palette,

  'Data & Analytics': BarChart3,

  Product: Layers,

  'Human Resources': Users,

  Operations: Building2,
};

const CANDIDATES_PER_PAGE = 4;

export function ShortlistReview() {
  const { data: candidates = [], isLoading: loadingCandidates } = useCandidates();

  const { data: openings = [], isLoading: loadingOpenings } = useOpenings();

  const recordDecision = useRecordManagerDecision();

  // Candidates awaiting hiring manager decision

  const pendingCandidates = React.useMemo(() => {
    return candidates.filter(
      (c) => c.stage === 'Shared with Manager' && c.managerDecision === 'Pending'
    );
  }, [candidates]);

  // Openings map for quick lookup

  const openingsMap = React.useMemo(() => {
    const map = new Map<string, Opening>();

    for (const o of openings) {
      map.set(o.id, o);
    }

    return map;
  }, [openings]);

  // Search, filter, pagination, and sheet states
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlOpeningId = searchParams.get('openingId') || searchParams.get('opening') || searchParams.get('requisition') || '';

  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>('all');
  const [selectedOpeningId, setSelectedOpeningId] = React.useState<string>(urlOpeningId || 'all');
  const [pageByDept, setPageByDept] = React.useState<Record<string, number>>({});
  const [selectedCandidate, setSelectedCandidate] = React.useState<Candidate | null>(null);
  const [isReviewSheetOpen, setIsReviewSheetOpen] = React.useState<boolean>(false);
  const [isAiAnalysisOpen, setIsAiAnalysisOpen] = React.useState<boolean>(false);
  const [managerComment, setManagerComment] = React.useState<string>('');
  const [pendingDecision, setPendingDecision] = React.useState<'Shortlisted' | 'Rejected' | null>(
    null
  );

  // Sync state if URL search param changes
  React.useEffect(() => {
    if (urlOpeningId && urlOpeningId !== selectedOpeningId) {
      setSelectedOpeningId(urlOpeningId);
    }
  }, [urlOpeningId, selectedOpeningId]);

  const handleOpeningChange = React.useCallback(
    (newOpeningId: string) => {
      setSelectedOpeningId(newOpeningId);
      const params = new URLSearchParams(window.location.search);
      if (newOpeningId === 'all') {
        params.delete('openingId');
        params.delete('opening');
        params.delete('requisition');
      } else {
        params.set('openingId', newOpeningId);
      }
      const qs = params.toString();
      router.replace(qs ? `/shortlist?${qs}` : '/shortlist', { scroll: false });
    },
    [router]
  );

  // Reset pagination when filters change
  React.useEffect(() => {
    setPageByDept({});
  }, [searchQuery, selectedDepartment, selectedOpeningId]);

  // Unique departments for filter
  const departments = React.useMemo(() => {
    const deptSet = new Set<string>();
    for (const c of pendingCandidates) {
      const opening = openingsMap.get(c.openingId);
      if (opening?.department) deptSet.add(opening.department);
    }
    return Array.from(deptSet).sort();
  }, [pendingCandidates, openingsMap]);

  // Requisitions with pending candidate profiles, or currently selected opening
  const relevantOpenings = React.useMemo(() => {
    const list = openings.filter(
      (o) => pendingCandidates.some((c) => c.openingId === o.id) || o.id === selectedOpeningId
    );
    return list.length > 0 ? list : openings;
  }, [pendingCandidates, openings, selectedOpeningId]);

  // Filter candidates by search query, department, and requisition

  const filteredCandidates = React.useMemo(() => {
    let list = pendingCandidates;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();

      list = list.filter((c) => {
        const opening = openingsMap.get(c.openingId);

        return (
          c.name.toLowerCase().includes(q) ||
          c.currentRole.toLowerCase().includes(q) ||
          c.currentCompany.toLowerCase().includes(q) ||
          (opening &&
            (opening.title.toLowerCase().includes(q) ||
              opening.department.toLowerCase().includes(q) ||
              opening.mustHaveSkills.some((s) => s.toLowerCase().includes(q))))
        );
      });
    }

    if (selectedDepartment !== 'all') {
      list = list.filter((c) => {
        const opening = openingsMap.get(c.openingId);

        return (opening?.department || 'General') === selectedDepartment;
      });
    }

    if (selectedOpeningId !== 'all') {
      list = list.filter((c) => c.openingId === selectedOpeningId);
    }

    return list;
  }, [pendingCandidates, searchQuery, selectedDepartment, selectedOpeningId, openingsMap]);

  // Department counts for filter telemetry

  const departmentCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};

    for (const c of pendingCandidates) {
      const opening = openingsMap.get(c.openingId);

      const dept = opening?.department || 'General';

      counts[dept] = (counts[dept] || 0) + 1;
    }

    return counts;
  }, [pendingCandidates, openingsMap]);

  // Group filtered candidates into department columns

  const departmentGroups = React.useMemo(() => {
    // If a specific opening is chosen, show only that opening's department column
    const deptSet = new Set<string>();

    if (selectedOpeningId !== 'all') {
      const selectedOp = openingsMap.get(selectedOpeningId);
      if (selectedOp?.department) {
        deptSet.add(selectedOp.department);
      } else {
        for (const c of filteredCandidates) {
          const opening = openingsMap.get(c.openingId);
          deptSet.add(opening?.department || 'General');
        }
        if (deptSet.size === 0) deptSet.add('General');
      }
    } else if (selectedDepartment !== 'all') {
      deptSet.add(selectedDepartment);
    } else {
      for (const c of pendingCandidates) {
        const opening = openingsMap.get(c.openingId);
        deptSet.add(opening?.department || 'General');
      }
    }

    const preferredOrder = [
      'Engineering',

      'Product',

      'Design',

      'Data & Analytics',

      'Operations',

      'Human Resources',

      'General',
    ];

    const sortedDepts = Array.from(deptSet).sort((a, b) => {
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

        candidates: filteredCandidates.filter((c) => {
          const opening = openingsMap.get(c.openingId);

          return (opening?.department || 'General') === dept;
        }),
      };
    });
  }, [filteredCandidates, pendingCandidates, selectedDepartment, openingsMap]);

  // Selected candidate's opening and AI match calculation

  const selectedOpening = React.useMemo(() => {
    if (!selectedCandidate) return null;

    return openingsMap.get(selectedCandidate.openingId) ?? null;
  }, [selectedCandidate, openingsMap]);

  const selectedAiMatch = React.useMemo(() => {
    if (!selectedCandidate || !selectedOpening) return null;

    return matchCandidateToOpening(selectedCandidate, selectedOpening);
  }, [selectedCandidate, selectedOpening]);

  // Handler to open the review sheet for a clicked candidate

  const handleOpenReview = (candidate: Candidate) => {
    setSelectedCandidate(candidate);

    setManagerComment(candidate.managerComment || '');

    setIsReviewSheetOpen(true);
  };

  // Handler for Shortlist / Reject decision

  const handleDecision = (decision: 'Shortlisted' | 'Rejected') => {
    if (!selectedCandidate) return;

    setPendingDecision(decision);

    recordDecision.mutate(
      {
        id: selectedCandidate.id,

        decision,

        comment: managerComment.trim() ? managerComment.trim() : undefined,
      },

      {
        onSuccess: () => {
          if (decision === 'Shortlisted') {
            toast.success(
              `🎯 ${selectedCandidate.name} shortlisted! Sent to HR for interview scheduling.`
            );
          } else {
            toast.info(`${selectedCandidate.name} rejected from evaluation queue.`);
          }

          setIsReviewSheetOpen(false);

          setSelectedCandidate(null);

          setManagerComment('');

          setPendingDecision(null);
        },

        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to record evaluation decision');

          setPendingDecision(null);
        },
      }
    );
  };

  if (loadingCandidates || loadingOpenings) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-text-muted text-[13px]">Loading review queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Filter and Search Bar (matching Pipeline & Candidates views) */}

      <div className="flex flex-col gap-3 select-none sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:gap-3">
          {/* Search Input */}

          <div className="relative w-full sm:max-w-xs">
            <Search className="text-text-subtle pointer-events-none absolute top-2.5 left-3 h-4 w-4" />

            <Input
              value={searchQuery}

              onChange={(e) => setSearchQuery(e.target.value)}

              placeholder="Search candidate, role, skill..."

              className="bg-surface-2/40 border-border/70 hover:border-border focus:bg-surface-1 h-9 w-full rounded-[8px] pr-8 pl-9 text-[13px] shadow-2xs transition-all"
            />

            {searchQuery && (
              <button
                type="button"

                onClick={() => setSearchQuery('')}

                className="text-text-subtle hover:text-text absolute top-2.5 right-3 cursor-pointer"

                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Department Filter */}

            {departments.length > 0 && (
              <Select
                value={selectedDepartment}

                onValueChange={(val) => setSelectedDepartment(val)}
              >
                <SelectTrigger className="border-border/70 bg-surface-2/40 hover:bg-surface-2 text-text h-9 w-full min-w-0 gap-2 rounded-[8px] px-3 text-[13px] font-medium shadow-2xs sm:w-auto sm:min-w-[160px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>

                <SelectContent align="start" className="min-w-[190px]">
                  <SelectItem value="all" className="min-h-[32px] rounded-[6px] py-1.5 text-[13px]">
                    All Departments ({pendingCandidates.length})
                  </SelectItem>

                  {departments.map((dept) => (
                    <SelectItem
                      key={dept}
                      value={dept}
                      className="min-h-[32px] rounded-[6px] py-1.5 text-[13px]"
                    >
                      {dept} ({departmentCounts[dept] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Requisition Filter */}
            {relevantOpenings.length > 0 && (
              <Select
                value={selectedOpeningId}
                onValueChange={handleOpeningChange}
              >
                <SelectTrigger className="border-border/70 bg-surface-2/40 hover:bg-surface-2 text-text h-9 w-full min-w-0 gap-2 rounded-[8px] px-3 text-[13px] font-medium shadow-2xs sm:w-auto sm:min-w-[200px]">
                  <SelectValue placeholder={`All Requisitions (${relevantOpenings.length})`} />
                </SelectTrigger>

                <SelectContent align="start" className="min-w-[240px]">
                  <SelectItem value="all" className="min-h-[32px] rounded-[6px] py-1.5 text-[13px]">
                    All Requisitions ({pendingCandidates.length})
                  </SelectItem>

                  {relevantOpenings.map((opening) => {
                    const count = pendingCandidates.filter((c) => c.openingId === opening.id).length;
                    return (
                      <SelectItem
                        key={opening.id}
                        value={opening.id}
                        className="min-h-[32px] rounded-[6px] py-1.5 text-[13px]"
                      >
                        {formatRoleTitle(opening.title)} ({count})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}

            {/* Active Requisition Filter Chip & AI Resume Analysis Trigger */}
            {selectedOpeningId !== 'all' && (
              <>
                <div className="flex items-center gap-1.5 rounded-[6px] border border-border/80 bg-surface-2 px-2.5 py-1 text-[12px] font-medium text-text select-none">
                  <span className="text-text-muted">Role:</span>
                  <span className="font-semibold text-text truncate max-w-[180px]">
                    {openingsMap.get(selectedOpeningId)?.title || 'Selected Role'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpeningChange('all')}
                    className="text-text-subtle hover:text-text ml-0.5 cursor-pointer p-0.5 rounded hover:bg-surface-3 transition-colors"
                    title="Clear role filter"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-9 border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 px-3 text-[12.5px] font-semibold select-none cursor-pointer"
                  title="Analyze shortlisted candidate resumes with Groq GPT-OSS 120B (Full Page)"
                >
                  <Link href={`/openings/${selectedOpeningId}/ai-review`}>
                    <span>AI Resume Review</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="text-text-muted text-[12px] font-medium">
          Showing <span className="text-text font-semibold">{filteredCandidates.length}</span>{' '}
          pending {filteredCandidates.length === 1 ? 'profile' : 'profiles'}
        </div>
      </div>

      {/* 2. Main Content: Department Columns of Candidate Cards */}
      {pendingCandidates.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Review Queue Clear"
          description="All candidate profiles forwarded by talent acquisition have been reviewed. New submissions will appear here automatically."
        />
      ) : filteredCandidates.length === 0 ? (
        <div className="border-border/70 rounded-[10px] border border-dashed p-12 text-center select-none">
          <Filter className="text-text-subtle mx-auto h-8 w-8" />

          <p className="text-text mt-3 text-[14px] font-semibold">
            {selectedOpeningId !== 'all'
              ? `No candidates shortlisted for "${openingsMap.get(selectedOpeningId)?.title || 'this role'}"`
              : 'No candidates match your filters'}
          </p>

          <p className="text-text-muted mt-1 text-[12.5px]">
            {selectedOpeningId !== 'all'
              ? 'HR has not forwarded any shortlisted profiles for this requisition yet, or they have already been processed.'
              : 'Try adjusting your search query or selecting "All Departments".'}
          </p>

          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedDepartment('all');
              handleOpeningChange('all');
            }}
            className="text-accent mt-3 inline-flex items-center gap-1.5 cursor-pointer text-[12px] font-medium hover:underline"
          >
            <span>View all shortlisted candidates</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      ) : (
        /* Horizontal Multi-Column Board */

        <div className="flex scrollbar-thin items-start gap-4 overflow-x-auto pt-1 pb-6">
          {departmentGroups.map((group) => {
            const ColIcon = group.icon;

            const totalCandidates = group.candidates.length;

            const totalPages = Math.ceil(totalCandidates / CANDIDATES_PER_PAGE);

            const currentPage = pageByDept[group.id] || 1;

            const validPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));

            const startIndex = (validPage - 1) * CANDIDATES_PER_PAGE;

            const visibleCandidates = group.candidates.slice(
              startIndex,

              startIndex + CANDIDATES_PER_PAGE
            );

            return (
              <div
                key={group.id}

                className="xs:w-[360px] bg-surface-2/30 border-border/70 flex w-[340px] max-w-[calc(100vw-2.5rem)] shrink-0 flex-col justify-between space-y-2.5 rounded-[12px] border p-3.5 sm:w-[380px]"
              >
                <div className="space-y-2.5">
                  {/* Column Header */}

                  <div className="border-border/60 flex items-center justify-between border-b pb-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="bg-surface-3/80 text-text-muted border-border/60 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border">
                        <ColIcon className="h-3.5 w-3.5" />
                      </div>

                      <h3 className="text-text truncate text-[13.5px] font-semibold">
                        {group.title}
                      </h3>
                    </div>

                    <span className="text-text-muted bg-surface-3/90 border-border/60 shrink-0 rounded-full border px-2 py-0.5 font-sans text-[11px] font-semibold tabular-nums">
                      {totalCandidates}
                    </span>
                  </div>

                  {/* Column Cards Container: Exact card format preserved */}

                  <div className="min-h-[100px] space-y-2.5">
                    {group.candidates.length === 0 ? (
                      <div className="border-border/60 rounded-[8px] border border-dashed p-5 text-center select-none">
                        <p className="text-text-subtle text-[11.5px]">No pending profiles</p>
                      </div>
                    ) : (
                      visibleCandidates.map((candidate) => {
                        const opening = openingsMap.get(candidate.openingId);

                        return (
                          <CandidateCard
                            key={candidate.id}

                            candidate={candidate}

                            openingTitle={opening?.title}

                            onClick={() => handleOpenReview(candidate)}

                            showReorderIcon={false}

                            actionText="Review Dossier & Decide"
                          />
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Per-Column Pagination Footer when more than 4 candidates */}

                {totalPages > 1 && (
                  <div className="border-border/50 mt-1 flex items-center justify-between border-t pt-2.5 text-[11.5px] select-none">
                    <button
                      type="button"

                      disabled={validPage <= 1}

                      onClick={() =>
                        setPageByDept((prev) => ({
                          ...prev,

                          [group.id]: Math.max(1, validPage - 1),
                        }))
                      }

                      className="border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-[5px] border transition-colors disabled:cursor-not-allowed disabled:opacity-25"

                      title="Previous page"

                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>

                    <span className="text-text-muted font-sans text-[11px] font-medium">
                      {startIndex + 1}–{Math.min(startIndex + CANDIDATES_PER_PAGE, totalCandidates)}{' '}
                      of {totalCandidates}
                    </span>

                    <button
                      type="button"

                      disabled={validPage >= totalPages}

                      onClick={() =>
                        setPageByDept((prev) => ({
                          ...prev,

                          [group.id]: Math.min(totalPages, validPage + 1),
                        }))
                      }

                      className="border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-[5px] border transition-colors disabled:cursor-not-allowed disabled:opacity-25"

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

      {/* 3. Candidate Review Sheet (Opens on Card Click: Shortlist & Cancel Options) */}

      <Sheet open={isReviewSheetOpen} onOpenChange={setIsReviewSheetOpen}>
        <SheetContent
          side="right"

          className="border-border bg-surface-1 flex w-full flex-col overflow-y-auto p-0 shadow-2xl select-none sm:max-w-xl md:max-w-2xl"
        >
          {selectedCandidate && (
            <div className="flex h-full flex-col justify-between">
              {/* Top Dossier Header */}

              <div className="border-border/70 bg-surface-1 relative shrink-0 border-b px-6 pt-5 pb-5">
                {/* Accent hairline */}

                <div className="from-accent via-accent/50 absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r to-transparent" />

                <div className="mr-8 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <CandidateAvatar
                      name={selectedCandidate.name}
                      className="h-12 w-12 text-[15px]"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-text truncate text-[17px] font-bold tracking-tight">
                          {selectedCandidate.name}
                        </h2>

                        <SourceBadge source={selectedCandidate.source} variant="badge" />
                      </div>

                      <p className="text-text-muted mt-0.5 truncate text-[12.5px]">
                        <span className="text-text font-semibold">
                          {selectedCandidate.currentRole}
                        </span>

                        <span className="text-text-subtle/80 mx-1">at</span>

                        <span className="text-text inline-flex items-center gap-1 font-medium">
                          <CompanyLogo
                            company={selectedCandidate.currentCompany}
                            className="h-3.5 w-3.5 shrink-0 rounded-[3px] shadow-2xs"
                          />
                          <span>{selectedCandidate.currentCompany}</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Target Requisition Pill */}

                {selectedOpening && (
                  <div className="text-text-muted mt-3.5 flex flex-wrap items-center gap-2 text-[11.5px]">
                    <span className="bg-surface-2 border-border/70 text-text inline-flex items-center gap-1 rounded-[5px] border px-2.5 py-1 font-medium">
                      <Briefcase className="text-text-subtle h-3 w-3 shrink-0" />

                      <span>
                        Requisition: <strong>{selectedOpening.title}</strong>
                      </span>
                    </span>

                    <span className="bg-surface-2 border-border/70 text-text inline-flex items-center gap-1 rounded-[5px] border px-2.5 py-1 font-medium">
                      <Building2 className="text-text-subtle h-3 w-3 shrink-0" />

                      <span>{selectedOpening.department}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Scrollable Body Content */}

              <div className="flex-1 space-y-4.5 overflow-y-auto p-6">
                {/* 4 Quick Metrics Grid */}

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  <div className="border-border/70 bg-surface-2/40 rounded-[8px] border p-2.5 transition-colors">
                    <span className="text-text-subtle block text-[10.5px] font-semibold tracking-wider uppercase">
                      Experience
                    </span>

                    <p className="text-text mt-0.5 font-sans text-[13px] font-bold">
                      {selectedCandidate.experienceYears} Years
                    </p>
                  </div>

                  <div className="border-border/70 bg-surface-2/40 rounded-[8px] border p-2.5 transition-colors">
                    <span className="text-text-subtle block text-[10.5px] font-semibold tracking-wider uppercase">
                      Expected CTC
                    </span>

                    <p className="text-text mt-0.5 font-sans text-[13px] font-bold">
                      {formatCtc(selectedCandidate.expectedCtc)}
                    </p>
                  </div>

                  <div className="border-border/70 bg-surface-2/40 rounded-[8px] border p-2.5 transition-colors">
                    <span className="text-text-subtle block text-[10.5px] font-semibold tracking-wider uppercase">
                      Notice Period
                    </span>

                    <p className="text-text mt-0.5 text-[13px] font-bold">
                      {selectedCandidate.noticePeriod}
                    </p>
                  </div>

                  <div className="border-border/70 bg-surface-2/40 rounded-[8px] border p-2.5 transition-colors">
                    <span className="text-text-subtle block text-[10.5px] font-semibold tracking-wider uppercase">
                      Contact Phone
                    </span>

                    <p className="text-text mt-0.5 truncate font-sans text-[12.5px] font-semibold">
                      {selectedCandidate.phone}
                    </p>
                  </div>
                </div>

                {/* AI Candidate Assessment Box */}

                {selectedAiMatch && (
                  <div className="border-border/70 bg-surface-2/40 space-y-2 rounded-[8px] border p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-text flex items-center gap-1.5 text-[12.5px] font-semibold">
                        <span>AI Candidate Assessment</span>

                        {selectedOpening && (
                          <span className="text-text-subtle text-[11.5px] font-normal">
                            for {selectedOpening.title}
                          </span>
                        )}
                      </div>

                      <span className="border-border/70 bg-surface-2 text-text rounded-full border px-2 py-0.5 font-sans text-[10.5px] font-medium">
                        {selectedAiMatch.score}% Match • {selectedAiMatch.tier}
                      </span>
                    </div>

                    <p className="text-text-muted text-[12px] leading-relaxed">
                      {selectedAiMatch.summary}
                    </p>

                    {selectedAiMatch.matchedMustSkills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-text-subtle text-[11px] font-medium">
                          Screened Skills:
                        </span>

                        {selectedAiMatch.matchedMustSkills.map((skill: string) => (
                          <span
                            key={skill}

                            className="border-border/70 bg-surface-2 text-text inline-flex items-center gap-1 rounded-[5px] border px-2 py-0.5 text-[11px] font-medium"
                          >
                            <Check className="text-text-muted h-2.5 w-2.5 stroke-[3]" />

                            <span>{skill}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* HR Screening Notes */}

                <div className="space-y-1.5">
                  <h3 className="text-text flex items-center gap-1.5 text-[12.5px] font-semibold">
                    <FileText className="text-accent h-3.5 w-3.5 shrink-0" />

                    <span>HR Screening Notes & Initial Impression</span>
                  </h3>

                  <div className="border-border/70 bg-surface-2/30 text-text rounded-[8px] border p-3.5 text-[12.5px] leading-relaxed">
                    {selectedCandidate.hrNotes ??
                      'Candidate exhibits deep technical comprehension, strong credentials, and verified compensation expectations.'}
                  </div>
                </div>

                {/* Manager Feedback Input */}

                <div className="space-y-1.5">
                  <label className="text-text text-[12.5px] font-semibold">
                    Manager Review Feedback (Optional)
                  </label>

                  <Textarea
                    rows={3}

                    value={managerComment}

                    onChange={(e) => setManagerComment(e.target.value)}

                    placeholder="Add specific topics, interview panel recommendations, or evaluation criteria for the technical round..."

                    className="bg-surface-2/40 border-border/70 focus:bg-surface-1 rounded-[8px] text-[12.5px]"
                  />
                </div>
              </div>

              {/* 4. Sticky Bottom Action Footer (Shortlist and Reject/Cancel) */}

              <div className="border-border/70 bg-surface-1/95 sticky bottom-0 flex flex-col items-center gap-3 border-t p-4 backdrop-blur-md sm:flex-row">
                {/* Shortlist Button */}

                <Button
                  variant="primary"

                  onClick={() => handleDecision('Shortlisted')}

                  loading={pendingDecision === 'Shortlisted'}

                  disabled={recordDecision.isPending}

                  className="h-10 w-full cursor-pointer gap-2 rounded-[8px] text-[13px] font-semibold shadow-xs sm:flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />

                  <span>
                    {pendingDecision === 'Shortlisted'
                      ? 'Shortlisting...'
                      : 'Shortlist for Technical Interview'}
                  </span>
                </Button>

                {/* Reject / Cancel Button */}

                <Button
                  variant="outline"

                  onClick={() => handleDecision('Rejected')}

                  loading={pendingDecision === 'Rejected'}

                  disabled={recordDecision.isPending}

                  className="border-border/80 hover:border-danger/40 hover:text-danger hover:bg-danger/10 h-10 w-full cursor-pointer gap-2 rounded-[8px] text-[13px] font-semibold sm:flex-1"
                >
                  <XCircle className="h-4 w-4 shrink-0" />

                  <span>
                    {pendingDecision === 'Rejected' ? 'Rejecting...' : 'Reject Candidate'}
                  </span>
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Groq AI Resume Intelligence Sheet */}
      <ManagerAiAnalysisSheet
        open={isAiAnalysisOpen}
        onOpenChange={setIsAiAnalysisOpen}
        opening={selectedOpeningId !== 'all' ? (openingsMap.get(selectedOpeningId) || null) : null}
        candidates={candidates}
      />
    </div>
  );
}
