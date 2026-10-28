'use client';

import * as React from 'react';

import Link from 'next/link';

import { useOpening, useUpdateOpeningStatus } from '../hooks';

import { useCandidates, useAssignCandidateToOpening } from '@/features/candidates/hooks';

import { CandidateDetailSheet } from '@/features/candidates/components/candidate-detail-sheet';

import { useUsers } from '@/features/auth/hooks';

import { getNextAllowedOpeningStatuses } from '@/lib/domain/status-transitions';

import type { OpeningStatus } from '@/lib/domain/status-transitions';

import type { Candidate } from '@/types/entities';

import { rankCandidatesForOpening, type CandidateMatchResult } from '@/lib/ai-matcher';

import { StatusBadge } from '@/components/hro/status-badge';

import { SourceBadge } from '@/components/hro/source-badge';

import { CompanyLogo } from '@/components/hro/company-logo';

import { CandidateAvatar } from '@/components/hro/candidate-avatar';

import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { Skeleton } from '@/components/ui/skeleton';

import { EmptyState } from '@/components/hro/empty-state';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

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
  Zap,
  Search,
  Check,
  AlertTriangle,
  UserCheck,
  ArrowRight,
  Filter,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Briefcase,
  IndianRupee,
  Lightbulb,
} from 'lucide-react';

import { toast } from 'sonner';

import { cn } from '@/lib/utils';

import { formatCtcRange, formatCtc, formatDate } from '@/lib/format';

interface OpeningDetailProps {
  id: string;
}

export function OpeningDetail({ id }: OpeningDetailProps) {
  const { data: opening, isLoading, isError } = useOpening(id);

  const { data: allCandidates = [] } = useCandidates();

  const { data: users = [] } = useUsers();

  const updateStatus = useUpdateOpeningStatus();

  const assignCandidate = useAssignCandidateToOpening();

  const [activeTab, setActiveTab] = React.useState<string>('ai-matcher');

  const [selectedCandidate, setSelectedCandidate] = React.useState<Candidate | null>(null);

  const [isSheetOpen, setIsSheetOpen] = React.useState<boolean>(false);

  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const [selectedTier, setSelectedTier] = React.useState<'all' | 'strong' | 'good' | 'fast'>('all');

  const [sortBy, setSortBy] = React.useState<'score' | 'experience' | 'notice' | 'ctc'>('score');

  const [shortlistedMap, setShortlistedMap] = React.useState<Record<string, boolean>>({});

  const [expandedQuestionsMap, setExpandedQuestionsMap] = React.useState<Record<string, boolean>>(
    {}
  );

  // Candidates for this specific opening

  const openingCandidates = React.useMemo(() => {
    return allCandidates.filter((c) => c.openingId === id);
  }, [allCandidates, id]);

  // Hiring manager lookup

  const manager = React.useMemo(() => {
    if (!opening) return null;

    return users.find((u) => u.id === opening.managerId);
  }, [users, opening]);

  // AI Matching against all candidates in talent pool

  const rankedMatches = React.useMemo(() => {
    if (!opening || allCandidates.length === 0) return [];

    return rankCandidatesForOpening(allCandidates, opening);
  }, [opening, allCandidates]);

  const strongMatches = React.useMemo(
    () => rankedMatches.filter((r) => r.tier === 'Strong Fit'),

    [rankedMatches]
  );

  const goodMatches = React.useMemo(
    () => rankedMatches.filter((r) => r.tier === 'Good Match'),

    [rankedMatches]
  );

  const fastJoiners = React.useMemo(
    () =>
      rankedMatches.filter(
        (r) =>
          r.candidate.noticePeriod.toLowerCase().includes('immediate') ||
          r.candidate.noticePeriod.toLowerCase().includes('15') ||
          r.candidate.noticePeriod.toLowerCase().includes('30')
      ),

    [rankedMatches]
  );

  // Filtered AI candidate matches

  const filteredMatches = React.useMemo(() => {
    let list = [...rankedMatches];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();

      list = list.filter(
        (r) =>
          r.candidate.name.toLowerCase().includes(q) ||
          r.candidate.currentRole.toLowerCase().includes(q) ||
          r.candidate.currentCompany.toLowerCase().includes(q) ||
          r.matchedMustSkills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (selectedTier === 'strong') {
      list = list.filter((r) => r.tier === 'Strong Fit');
    } else if (selectedTier === 'good') {
      list = list.filter((r) => r.tier === 'Good Match');
    } else if (selectedTier === 'fast') {
      list = list.filter(
        (r) =>
          r.candidate.noticePeriod.toLowerCase().includes('immediate') ||
          r.candidate.noticePeriod.toLowerCase().includes('15') ||
          r.candidate.noticePeriod.toLowerCase().includes('30')
      );
    }

    if (sortBy === 'experience') {
      list.sort((a, b) => b.candidate.experienceYears - a.candidate.experienceYears);
    } else if (sortBy === 'notice') {
      const noticeOrder = (n: string) => {
        const lower = n.toLowerCase();

        if (lower.includes('immediate')) return 0;

        if (lower.includes('15')) return 1;

        if (lower.includes('30')) return 2;

        if (lower.includes('60')) return 3;

        return 4;
      };

      list.sort(
        (a, b) => noticeOrder(a.candidate.noticePeriod) - noticeOrder(b.candidate.noticePeriod)
      );
    } else if (sortBy === 'ctc') {
      list.sort((a, b) => a.candidate.expectedCtc - b.candidate.expectedCtc);
    } else {
      list.sort((a, b) => b.score - a.score);
    }

    return list;
  }, [rankedMatches, searchQuery, selectedTier, sortBy]);

  // Candidates Pipeline Tab Pagination

  const [pipelinePage, setPipelinePage] = React.useState(1);

  const PIPELINE_PAGE_SIZE = 5;

  const totalPipelinePages = Math.ceil(openingCandidates.length / PIPELINE_PAGE_SIZE);

  const validPipelinePage = Math.min(Math.max(1, pipelinePage), Math.max(1, totalPipelinePages));

  const visiblePipelineCandidates = React.useMemo(() => {
    const start = (validPipelinePage - 1) * PIPELINE_PAGE_SIZE;

    return openingCandidates.slice(start, start + PIPELINE_PAGE_SIZE);
  }, [openingCandidates, validPipelinePage]);

  const handleShortlistCandidate = (match: CandidateMatchResult) => {
    if (!opening) return;

    const { candidate } = match;

    const notes = `[AI Match: ${match.score}% • ${match.tier}] ${match.summary}`;

    assignCandidate.mutate(
      {
        candidateId: candidate.id,

        openingId: opening.id,

        stage: 'Shared with Manager',

        notes,
      },

      {
        onSuccess: () => {
          setShortlistedMap((prev) => ({ ...prev, [candidate.id]: true }));

          toast.success(`🎯 ${candidate.name} (${match.score}% match) shared with Hiring Manager!`);
        },

        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : 'Failed to share candidate with manager'
          );
        },
      }
    );
  };

  const handleBatchShortlistTop = () => {
    if (!opening) return;

    const topMatches = rankedMatches.slice(0, 3);

    if (topMatches.length === 0) return;

    for (const match of topMatches) {
      const notes = `[AI Match: ${match.score}% • ${match.tier}] ${match.summary}`;

      assignCandidate.mutate({
        candidateId: match.candidate.id,

        openingId: opening.id,

        stage: 'Shared with Manager',

        notes,
      });

      setShortlistedMap((prev) => ({ ...prev, [match.candidate.id]: true }));
    }

    toast.success(`🎯 Top ${topMatches.length} AI matches shared with Hiring Manager for review!`);
  };

  const handleInspect = (candidate: Candidate) => {
    setSelectedCandidate(candidate);

    setIsSheetOpen(true);
  };

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
            <Button
              asChild

              variant="ghost"

              size="sm"

              className="text-text-muted hover:text-text h-7 gap-1 px-1.5 text-[12px]"
            >
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
                <DropdownMenuLabel className="text-text-subtle text-[11px] tracking-wider uppercase">
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

      {/* AI CALLOUT BANNER (Only shown when not on ai-matcher tab) */}

      {activeTab !== 'ai-matcher' && strongMatches.length > 0 && (
        <div className="border-border/70 bg-surface-1 flex flex-col gap-3 rounded-[8px] border p-3.5 shadow-2xs select-none sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-blue-600" />

            <div className="text-text text-[12.5px] font-medium">
              <span className="font-semibold">
                {strongMatches.length} strong candidate{' '}
                {strongMatches.length === 1 ? 'fit' : 'fits'}
              </span>{' '}
              screened by AI for {opening.title}
            </div>
          </div>

          <Button
            type="button"

            variant="outline"

            size="sm"

            onClick={() => setActiveTab('ai-matcher')}

            className="border-border/80 hover:bg-surface-2 text-text h-7.5 shrink-0 gap-1.5 px-3 text-[11.5px] font-semibold"
          >
            <span>View Matches</span>

            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Metric Stat Cards */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-border bg-surface-1 rounded-[var(--radius-md)] border p-4 shadow-xs">
          <span className="text-text-muted text-[12px] font-medium">Target Headcount</span>

          <p className="text-text mt-1.5 font-sans text-2xl font-bold tabular-nums">
            {opening.headcount}{' '}
            <span className="text-text-subtle font-sans text-[13px] font-normal">
              role{opening.headcount > 1 ? 's' : ''}
            </span>
          </p>
        </div>

        <div className="border-border bg-surface-1 rounded-[var(--radius-md)] border p-4 shadow-xs">
          <span className="text-text-muted text-[12px] font-medium">Experience Required</span>

          <p className="text-text mt-1.5 font-sans text-2xl font-bold tabular-nums">
            {opening.experienceRange.min}-{opening.experienceRange.max}{' '}
            <span className="text-text-subtle font-sans text-[13px] font-normal">years</span>
          </p>
        </div>

        <div className="border-border bg-surface-1 rounded-[var(--radius-md)] border p-4 shadow-xs">
          <span className="text-text-muted text-[12px] font-medium">Annual CTC Budget</span>

          <p className="text-text mt-1.5 font-sans text-xl font-bold tabular-nums">
            {formatCtcRange(opening.budgetRange.min, opening.budgetRange.max)}
          </p>
        </div>

        <div className="border-border bg-surface-1 rounded-[var(--radius-md)] border p-4 shadow-xs">
          <span className="text-text-muted text-[12px] font-medium">Work Location & Format</span>

          <p className="text-text mt-1.5 truncate text-[15px] font-semibold">{opening.location}</p>

          <span className="text-text-subtle text-[12px]">{opening.employmentType}</span>
        </div>
      </div>

      {/* Main Cohesive 12-Column Layout */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: 8 Columns for Tabbed Sections */}

        <div className="space-y-6 lg:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start sm:w-auto">
              <TabsTrigger value="ai-matcher" className="gap-1.5 font-semibold">
                <span>AI Candidate Match</span>

                <span className="bg-surface-2 text-text border-border/80 py-0.2 rounded-full border px-1.5 font-sans text-[10px] font-bold tabular-nums">
                  {strongMatches.length}
                </span>
              </TabsTrigger>

              <TabsTrigger value="specification">Requirements & Scope</TabsTrigger>

              <TabsTrigger value="candidates">
                Assigned Pipeline ({openingCandidates.length})
              </TabsTrigger>

              <TabsTrigger value="timeline">Audit & Timeline</TabsTrigger>
            </TabsList>

            {/* TAB 1: AI CANDIDATE SCREENING & MATCHING */}

            <TabsContent value="ai-matcher" className="space-y-4 pt-4">
              <Card className="border-border bg-surface-1 shadow-sm">
                <CardHeader className="border-border/80 border-b pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-text text-[16px] font-semibold">
                          AI Talent Match
                        </CardTitle>

                        <span className="text-text-subtle font-sans text-[11px] font-normal tabular-nums">
                          ({allCandidates.length} evaluated)
                        </span>
                      </div>

                      <p className="text-text-muted mt-0.5 text-[12px]">
                        Ranked candidates matched against core skills, experience, and compensation
                        requirements.
                      </p>
                    </div>

                    <Button
                      type="button"

                      variant="outline"

                      size="sm"

                      onClick={handleBatchShortlistTop}

                      className="border-border/80 hover:bg-surface-2 text-text h-7.5 shrink-0 cursor-pointer rounded-[6px] px-3 text-[11.5px] font-semibold shadow-2xs transition-colors"
                    >
                      Shortlist Top 3
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                  {/* Search and Filters */}

                  <div className="space-y-2.5">
                    <div className="relative">
                      <Search className="text-text-subtle pointer-events-none absolute top-2.5 left-3 h-4 w-4 stroke-[1.75]" />

                      <Input
                        value={searchQuery}

                        onChange={(e) => setSearchQuery(e.target.value)}

                        placeholder="Search candidate by name, company, or skill..."

                        className="bg-surface-2/40 border-border/60 hover:border-border focus:bg-surface-1 h-8.5 w-full rounded-[7px] pr-8 pl-9 text-[12.5px] shadow-2xs transition-all"
                      />

                      {searchQuery && (
                        <button
                          type="button"

                          onClick={() => setSearchQuery('')}

                          className="text-text-subtle hover:text-text absolute top-2.5 right-3 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                      {/* Apple-style Segmented Control */}

                      <div className="border-border/60 bg-surface-2/50 inline-flex items-center gap-1 rounded-[7px] border p-0.5 select-none">
                        <button
                          type="button"

                          onClick={() => setSelectedTier('all')}

                          className={cn(
                            'h-6.5 cursor-pointer rounded-[5px] px-2.5 text-[11.5px] font-medium transition-all',

                            selectedTier === 'all'
                              ? 'bg-surface-1 text-text border-border/60 border font-semibold shadow-2xs'
                              : 'text-text-muted hover:text-text'
                          )}
                        >
                          All ({rankedMatches.length})
                        </button>

                        <button
                          type="button"

                          onClick={() => setSelectedTier('strong')}

                          className={cn(
                            'h-6.5 cursor-pointer rounded-[5px] px-2.5 text-[11.5px] font-medium transition-all',

                            selectedTier === 'strong'
                              ? 'bg-surface-1 text-text border-border/60 border font-semibold shadow-2xs'
                              : 'text-text-muted hover:text-text'
                          )}
                        >
                          Strong ({strongMatches.length})
                        </button>

                        <button
                          type="button"

                          onClick={() => setSelectedTier('good')}

                          className={cn(
                            'h-6.5 cursor-pointer rounded-[5px] px-2.5 text-[11.5px] font-medium transition-all',

                            selectedTier === 'good'
                              ? 'bg-surface-1 border-border/60 text-text border font-semibold shadow-2xs'
                              : 'text-text-muted hover:text-text'
                          )}
                        >
                          Good ({goodMatches.length})
                        </button>

                        <button
                          type="button"

                          onClick={() => setSelectedTier('fast')}

                          className={cn(
                            'h-6.5 cursor-pointer rounded-[5px] px-2.5 text-[11.5px] font-medium transition-all',

                            selectedTier === 'fast'
                              ? 'bg-surface-1 text-text border-border/60 border font-semibold shadow-2xs'
                              : 'text-text-muted hover:text-text'
                          )}
                        >
                          Fast Joiners ({fastJoiners.length})
                        </button>
                      </div>

                      {/* Compact Sort Select */}

                      <div className="flex shrink-0 items-center gap-1.5">
                        <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
                          <SelectTrigger className="border-border/60 bg-surface-1 hover:bg-surface-2 text-text h-7 w-[125px] gap-1 rounded-[6px] px-2 text-[11.5px] font-medium shadow-2xs">
                            <SelectValue placeholder="Sort" />
                          </SelectTrigger>

                          <SelectContent align="end" className="min-w-[150px]">
                            <SelectItem value="score" className="py-1.5 text-[12px]">
                              Best Match
                            </SelectItem>

                            <SelectItem value="experience" className="py-1.5 text-[12px]">
                              Experience
                            </SelectItem>

                            <SelectItem value="notice" className="py-1.5 text-[12px]">
                              Fastest Notice
                            </SelectItem>

                            <SelectItem value="ctc" className="py-1.5 text-[12px]">
                              Lowest CTC
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Ranked Candidate List */}

                  {filteredMatches.length === 0 ? (
                    <div className="border-border/60 bg-surface-2/20 flex flex-col items-center justify-center rounded-[8px] border border-dashed py-12 text-center select-none">
                      <Filter className="text-text-subtle h-6 w-6 stroke-[1.5]" />

                      <p className="text-text mt-2 text-[13px] font-medium">
                        No matching candidates
                      </p>

                      <p className="text-text-muted mt-0.5 text-[11.5px]">
                        Try adjusting your search keyword or relaxing the filters.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredMatches.map((match) => {
                        const {
                          candidate,

                          score,

                          tier,

                          summary,

                          matchedMustSkills,

                          missingMustSkills,
                        } = match;

                        const isAssigned = candidate.openingId === opening.id;

                        const isSharedWithManager =
                          (isAssigned &&
                            candidate.stage === 'Shared with Manager' &&
                            candidate.managerDecision === 'Pending') ||
                          Boolean(shortlistedMap[candidate.id]);

                        const isManagerApproved =
                          isAssigned &&
                          (candidate.managerDecision === 'Shortlisted' ||
                            candidate.stage === 'Interview');

                        const isQuestionsExpanded = Boolean(expandedQuestionsMap[candidate.id]);

                        const isImmediate = candidate.noticePeriod

                          .toLowerCase()

                          .includes('immediate');

                        return (
                          <div
                            key={candidate.id}

                            className="group border-border/70 bg-surface-1/95 hover:border-border-strong relative flex flex-col justify-between space-y-2.5 rounded-[12px] border p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)] backdrop-blur-md transition-all duration-200 ease-out select-none hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
                          >
                            {/* Row 1: Header (Avatar, Name, Role/Company & Match Score) */}

                            <div className="flex items-start justify-between gap-2.5">
                              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                <CandidateAvatar name={candidate.name} size="md" />

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                      type="button"

                                      onClick={() => handleInspect(candidate)}

                                      className="text-text hover:text-text cursor-pointer truncate text-left text-[13.5px] font-bold tracking-tight transition-colors"
                                    >
                                      {candidate.name}
                                    </button>

                                    <SourceBadge source={candidate.source} variant="plain" />
                                  </div>

                                  <p className="text-text-muted mt-0.5 flex items-center gap-1.5 truncate text-[11.5px] font-normal">
                                    <span>{candidate.currentRole}</span>

                                    <span className="text-text-subtle/50">·</span>

                                    <span className="text-text inline-flex items-center gap-1 truncate font-medium">
                                      <CompanyLogo
                                        company={candidate.currentCompany}

                                        className="h-3.5 w-3.5 shrink-0 rounded-[3px]"
                                      />

                                      <span className="truncate">{candidate.currentCompany}</span>
                                    </span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex shrink-0 flex-col items-end gap-0.5 select-none">
                                <span className="text-text bg-surface-2 border-border/70 rounded-[5px] border px-2 py-0.5 font-sans text-[11.5px] font-medium tabular-nums">
                                  {score}% Fit
                                </span>

                                {isSharedWithManager ? (
                                  <span className="text-text-muted text-[10.5px] font-medium">
                                    • In Manager Queue
                                  </span>
                                ) : isManagerApproved ? (
                                  <span className="text-text text-[10.5px] font-medium">
                                    • Shortlisted
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            {/* Row 2: Signature Unboxed Spec Row (Experience, CTC, Notice) */}

                            <div className="text-text-muted flex items-center justify-between pt-0.5 pb-0.5 text-[11.5px]">
                              <div className="flex min-w-0 items-center gap-2 truncate">
                                <span className="text-text font-medium tabular-nums">
                                  {candidate.experienceYears}y exp
                                </span>

                                <span className="text-border-strong">•</span>

                                <span className="text-text font-sans font-medium tabular-nums">
                                  {formatCtc(candidate.expectedCtc)}
                                </span>

                                <span className="text-border-strong">•</span>

                                <span
                                  className={
                                    isImmediate ? 'text-text font-medium' : 'text-text-muted'
                                  }
                                >
                                  {candidate.noticePeriod}
                                </span>
                              </div>

                              <span className="text-text-subtle shrink-0 font-sans text-[10.5px] tabular-nums">
                                {matchedMustSkills.length}/
                                {matchedMustSkills.length + missingMustSkills.length} skills
                                verified
                              </span>
                            </div>

                            {/* Row 3: Competencies (Clean Unboxed Tags) */}

                            <div className="flex flex-wrap gap-1">
                              {matchedMustSkills.map((s) => (
                                <span
                                  key={s}

                                  className="text-text bg-surface-2 border-border/60 rounded-[4px] border px-2 py-0.5 text-[11px] font-medium"
                                >
                                  {s}
                                </span>
                              ))}

                              {missingMustSkills.map((s) => (
                                <span
                                  key={s}

                                  className="text-text-subtle/60 border-border/40 rounded-[4px] border border-dashed px-1.5 py-0.5 text-[11px] font-normal"

                                  title="Skill not listed in candidate profile"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>

                            {/* Row 4: Apple Intelligence Fit Summary */}

                            <div className="text-text-muted border-accent/40 space-y-1 border-l-2 pl-2.5 text-[11.5px] leading-relaxed">
                              <p>{summary}</p>

                              {match.suggestedQuestions && match.suggestedQuestions.length > 0 && (
                                <div className="pt-0.5">
                                  <button
                                    type="button"

                                    onClick={() =>
                                      setExpandedQuestionsMap((prev) => ({
                                        ...prev,

                                        [candidate.id]: !prev[candidate.id],
                                      }))
                                    }

                                    className="text-accent inline-flex cursor-pointer items-center gap-1 text-[10.5px] font-medium hover:underline"
                                  >
                                    <span>
                                      Suggested interview questions (
                                      {match.suggestedQuestions.length})
                                    </span>

                                    <ChevronDown
                                      className={cn(
                                        'text-text-subtle h-3 w-3 transition-transform duration-150',

                                        isQuestionsExpanded && 'rotate-180'
                                      )}
                                    />
                                  </button>

                                  {isQuestionsExpanded && (
                                    <ul className="text-text-muted mt-1 list-disc space-y-1 pl-3 text-[11px]">
                                      {match.suggestedQuestions.map((q, qIdx) => (
                                        <li key={qIdx} className="leading-snug">
                                          {q}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Row 5: Action Footer */}

                            <div className="border-border/60 flex items-center justify-between gap-2 border-t pt-2 text-[11px]">
                              <button
                                type="button"

                                onClick={() => handleInspect(candidate)}

                                className="text-text-muted hover:text-text inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium transition-colors"
                              >
                                <span>View dossier</span>

                                <ArrowRight className="h-3 w-3" />
                              </button>

                              <div className="flex items-center gap-2">
                                {isManagerApproved ? (
                                  <span className="text-text inline-flex items-center gap-1 text-[11px] font-medium">
                                    <CheckCircle2 className="h-3.5 w-3.5" />

                                    <span>Manager Approved</span>
                                  </span>
                                ) : isSharedWithManager ? (
                                  <span className="text-text-muted inline-flex items-center gap-1 text-[11px] font-medium">
                                    <Clock className="h-3 w-3 animate-pulse" />

                                    <span>In Manager Queue</span>
                                  </span>
                                ) : (
                                  <Button
                                    type="button"

                                    size="sm"

                                    disabled={assignCandidate.isPending}

                                    onClick={() => handleShortlistCandidate(match)}

                                    className="h-7 cursor-pointer rounded-[6px] px-3 text-[11px] font-semibold shadow-2xs"
                                  >
                                    <UserCheck className="h-3.5 w-3.5" />

                                    <span>Send to Manager</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Requirements & Scope */}

            <TabsContent value="specification" className="space-y-6 pt-4">
              {/* Job Description Card */}

              <Card className="border-border bg-surface-1 shadow-sm">
                <CardHeader className="border-border/80 border-b pb-3">
                  <CardTitle className="text-text text-[16px] font-semibold">
                    Job Description & Responsibilities
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-text pt-4 text-[13px] leading-relaxed">
                  <p className="whitespace-pre-line">{opening.description}</p>
                </CardContent>
              </Card>

              {/* Technical Skills & Qualifications */}

              <Card className="border-border bg-surface-1 shadow-sm">
                <CardHeader className="border-border/80 border-b pb-3">
                  <CardTitle className="text-text text-[16px] font-semibold">
                    Candidate Profile & Screening Criteria
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-5 pt-4">
                  <div className="space-y-2">
                    <span className="text-text-muted text-[12px] font-medium">
                      Must-Have Competencies:
                    </span>

                    <div className="flex flex-wrap gap-1.5">
                      {opening.mustHaveSkills.map((skill) => (
                        <span
                          key={skill}

                          className="border-border/70 bg-surface-2 text-text inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {opening.niceToHaveSkills.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-text-muted text-[12px] font-medium">
                        Nice-to-Have Skills:
                      </span>

                      <div className="flex flex-wrap gap-1.5">
                        {opening.niceToHaveSkills.map((skill) => (
                          <span
                            key={skill}

                            className="border-border bg-surface-2 text-text-muted inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
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

            {/* Tab 3: Assigned Pipeline Candidates */}

            <TabsContent value="candidates" className="pt-4">
              <Card className="border-border bg-surface-1 shadow-sm">
                <CardHeader className="border-border/80 flex flex-row items-center justify-between border-b pb-3">
                  <CardTitle className="text-text text-[16px] font-semibold">
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
                    <div className="border-border/60 text-text-muted flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed py-10 text-center text-[13px]">
                      <p className="font-medium">No candidates in this pipeline yet</p>

                      <p className="text-text-subtle text-[12px]">
                        Review the "AI Candidate Match" tab to shortlist top fit candidates.
                      </p>
                    </div>
                  ) : (
                    <>
                      {visiblePipelineCandidates.map((candidate) => (
                        <div
                          key={candidate.id}

                          className="border-border bg-surface-2/40 hover:bg-surface-2 flex flex-col justify-between gap-3 rounded-[var(--radius-md)] border p-3.5 transition-colors sm:flex-row sm:items-center"
                        >
                          <div className="flex items-center gap-3">
                            <CandidateAvatar
                              name={candidate.name}

                              candidateId={candidate.id}

                              size="sm"
                            />

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-text text-[13px] font-semibold">
                                  {candidate.name}
                                </span>

                                <StatusBadge status={candidate.stage} type="candidate" />
                              </div>

                              <p className="text-text-muted flex flex-wrap items-center gap-1.5 text-[11px]">
                                <span>{candidate.currentRole} at</span>

                                <span className="text-text inline-flex items-center gap-1 font-medium">
                                  <CompanyLogo
                                    company={candidate.currentCompany}

                                    className="h-3.5 w-3.5 shrink-0 rounded-[3px] shadow-2xs"
                                  />

                                  <span>{candidate.currentCompany}</span>
                                </span>

                                <span>•</span>

                                <span className="text-text font-bold">
                                  {candidate.experienceYears} yrs exp
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="text-text-muted flex items-center gap-4 self-end text-[11px] sm:self-center">
                            <span className="text-text font-sans font-medium tabular-nums">
                              Expected: {formatCtc(candidate.expectedCtc)}
                            </span>

                            <span className="text-text font-bold">
                              Notice: {candidate.noticePeriod}
                            </span>
                          </div>
                        </div>
                      ))}

                      {totalPipelinePages > 1 && (
                        <div className="border-border/60 flex items-center justify-between border-t pt-3 text-[12px] select-none">
                          <span className="text-text-subtle font-sans text-[11.5px] tabular-nums">
                            Showing {(validPipelinePage - 1) * PIPELINE_PAGE_SIZE + 1}–
                            {Math.min(
                              validPipelinePage * PIPELINE_PAGE_SIZE,

                              openingCandidates.length
                            )}{' '}
                            of {openingCandidates.length} candidates (Page {validPipelinePage} of{' '}
                            {totalPipelinePages})
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"

                              disabled={validPipelinePage <= 1}

                              onClick={() => setPipelinePage((p) => Math.max(1, p - 1))}

                              className="border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] border transition-colors disabled:cursor-not-allowed disabled:opacity-25"

                              title="Previous page"

                              aria-label="Previous page"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"

                              disabled={validPipelinePage >= totalPipelinePages}

                              onClick={() =>
                                setPipelinePage((p) => Math.min(totalPipelinePages, p + 1))
                              }

                              className="border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] border transition-colors disabled:cursor-not-allowed disabled:opacity-25"

                              title="Next page"

                              aria-label="Next page"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Timeline & Audit */}

            <TabsContent value="timeline" className="pt-4">
              <Card className="border-border bg-surface-1 shadow-sm">
                <CardHeader className="border-border/80 border-b pb-3">
                  <CardTitle className="text-text text-[16px] font-semibold">
                    Activity & Audit Log
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                  <div className="border-border relative space-y-4 border-l pl-4 text-[13px]">
                    <div className="relative">
                      <div className="bg-accent ring-surface-1 absolute top-1 -left-[21px] h-2.5 w-2.5 rounded-full ring-4" />

                      <p className="text-text text-[13px] font-medium">Requisition Created</p>

                      <p className="text-text-muted text-[11px]">
                        Created on {formatDate(opening.createdAt)} by Hiring Team
                      </p>
                    </div>

                    <div className="relative">
                      <div className="bg-success ring-surface-1 absolute top-1 -left-[21px] h-2.5 w-2.5 rounded-full ring-4" />

                      <p className="text-text text-[13px] font-medium">Current State</p>

                      <p className="text-text-muted text-[11px]">Status: {opening.status}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: 4 Columns (Sticky Sidebar) */}

        <div className="lg:col-span-4">
          <div className="sticky top-0 space-y-4">
            {/* AI Intelligence Summary Card */}

            <Card className="border-border bg-surface-1 shadow-2xs">
              <CardHeader className="border-border/80 border-b pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-text text-[13.5px] font-semibold">
                    AI Talent Match
                  </CardTitle>

                  <span className="text-text-muted font-sans text-[11px] font-medium">Active</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-3.5 text-[12px]">
                <div className="space-y-2 text-[12px]">
                  <div className="text-text-muted flex items-center justify-between">
                    <span>Top Match</span>

                    <span className="text-text font-sans font-semibold tabular-nums">
                      {strongMatches[0]
                        ? `${strongMatches[0].score}% (${strongMatches[0].candidate.name})`
                        : 'N/A'}
                    </span>
                  </div>

                  <div className="text-text-muted flex items-center justify-between">
                    <span>High-Fit Candidates</span>

                    <span className="text-text font-sans font-semibold tabular-nums">
                      {strongMatches.length} available
                    </span>
                  </div>

                  <div className="text-text-muted flex items-center justify-between">
                    <span>Budget Feasibility</span>

                    <span className="text-text font-sans font-medium">Within band</span>
                  </div>
                </div>

                <Button
                  type="button"

                  variant="outline"

                  onClick={handleBatchShortlistTop}

                  className="border-border/80 hover:bg-surface-2 text-text h-7.5 w-full rounded-[6px] text-[11.5px] font-semibold"
                >
                  <span>Shortlist Top 3</span>
                </Button>
              </CardContent>
            </Card>

            {/* Requisition Overview Card */}

            <Card className="border-border bg-surface-1 shadow-sm">
              <CardHeader className="border-border/80 border-b pb-3">
                <CardTitle className="text-text text-[14px] font-semibold">
                  Requisition Overview
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 pt-4">
                {/* Hiring Manager info */}

                <div className="border-border bg-surface-2/60 flex items-center gap-3 rounded-[var(--radius-sm)] border p-3">
                  <div className="bg-accent/20 text-accent flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold">
                    {manager?.avatarInitials ||
                      (manager?.name ? manager.name.charAt(0).toUpperCase() : 'H')}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-text truncate text-[13px] font-semibold">
                      {manager?.name || 'Hiring Manager'}
                    </p>

                    <p className="text-text-muted text-[11px]">
                      {manager?.department
                        ? `${manager.department} Lead`
                        : `${opening.department} Lead`}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1 text-[12px]">
                  <div className="border-border/60 flex justify-between border-b pb-2">
                    <span className="text-text-muted">Target Joining</span>

                    <span className="text-text font-medium">
                      {formatDate(opening.targetStartDate)}
                    </span>
                  </div>

                  <div className="border-border/60 flex justify-between border-b pb-2">
                    <span className="text-text-muted">Created Date</span>

                    <span className="text-text font-medium">{formatDate(opening.createdAt)}</span>
                  </div>

                  <div className="border-border/60 flex justify-between border-b pb-2">
                    <span className="text-text-muted">Department</span>

                    <span className="text-text font-medium">{opening.department}</span>
                  </div>

                  <div className="border-border/60 flex justify-between border-b pb-2">
                    <span className="text-text-muted">Employment Type</span>

                    <span className="text-text font-medium">{opening.employmentType}</span>
                  </div>

                  <div className="flex justify-between pt-0.5">
                    <span className="text-text-muted">Current Urgency</span>

                    <span className="text-text font-semibold">{opening.urgency}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}

            <Card className="border-border bg-surface-1 shadow-sm">
              <CardHeader className="border-border/80 border-b pb-3">
                <CardTitle className="text-text text-[14px] font-semibold">
                  Pipeline Actions
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2 pt-3.5">
                <Button asChild variant="outline" className="h-9 w-full justify-start text-[13px]">
                  <Link href="/pipeline">
                    <span>Open Kanban Board</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-9 w-full justify-start text-[13px]">
                  <Link href="/candidates">
                    <span>View All Candidates</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-9 w-full justify-start text-[13px]">
                  <Link href={`/openings/${opening.id}/edit`}>
                    <span>Edit Requisition Details</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Candidate Profile Dossier Sheet */}

      <CandidateDetailSheet
        candidate={selectedCandidate}

        open={isSheetOpen}

        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
}
