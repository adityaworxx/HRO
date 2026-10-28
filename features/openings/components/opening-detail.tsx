'use client';

import * as React from 'react';
import Link from 'next/link';
import { useOpening, useUpdateOpeningStatus } from '../hooks';
import {
  useCandidates,
  useAssignCandidateToOpening,
} from '@/features/candidates/hooks';
import { CandidateDetailSheet } from '@/features/candidates/components/candidate-detail-sheet';
import { useUsers } from '@/features/auth/hooks';
import { getNextAllowedOpeningStatuses } from '@/lib/domain/status-transitions';
import type { OpeningStatus } from '@/lib/domain/status-transitions';
import type { Candidate } from '@/types/entities';
import { rankCandidatesForOpening, type CandidateMatchResult } from '@/lib/ai-matcher';
import { StatusBadge } from '@/components/hro/status-badge';
import { SourceBadge } from '@/components/hro/source-badge';
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
  Sparkles,
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
  const [expandedQuestionsMap, setExpandedQuestionsMap] = React.useState<Record<string, boolean>>({});

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
      list.sort((a, b) => noticeOrder(a.candidate.noticePeriod) - noticeOrder(b.candidate.noticePeriod));
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
          toast.error(err instanceof Error ? err.message : 'Failed to share candidate with manager');
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
                <DropdownMenuLabel className="text-text-subtle text-[11px] uppercase tracking-wider">
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

      {/* AI HERO CALLOUT BANNER */}
      <div className="border-accent/30 bg-accent/10 flex flex-col gap-3 rounded-[var(--radius-md)] border p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-accent text-white flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-xs">
            <Sparkles className="h-5 w-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-text text-[14px] font-bold">
                Real-Time AI Candidate Screening
              </span>
              <span className="border-accent/40 bg-accent/20 text-accent rounded-full border px-2 py-0.2 font-mono text-[11px] font-bold">
                {strongMatches.length} High-Fit Matches
              </span>
            </div>
            <p className="text-text-muted mt-0.5 text-[12px]">
              AI evaluated {allCandidates.length} candidate profiles in the database against{' '}
              <span className="text-text font-medium">{opening.title}</span> screening criteria.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setActiveTab('ai-matcher')}
          className="h-8.5 shrink-0 gap-1.5 text-[12px] font-semibold"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Review AI Fits ({strongMatches.length})</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-border bg-surface-1 rounded-[var(--radius-md)] border p-4 shadow-xs">
          <span className="text-text-muted text-[12px] font-medium">Target Headcount</span>
          <p className="text-text mt-1.5 font-mono text-2xl font-bold">
            {opening.headcount}{' '}
            <span className="text-text-subtle font-sans text-[13px] font-normal">
              role{opening.headcount > 1 ? 's' : ''}
            </span>
          </p>
        </div>

        <div className="border-border bg-surface-1 rounded-[var(--radius-md)] border p-4 shadow-xs">
          <span className="text-text-muted text-[12px] font-medium">Experience Required</span>
          <p className="text-text mt-1.5 font-mono text-2xl font-bold">
            {opening.experienceRange.min}-{opening.experienceRange.max}{' '}
            <span className="text-text-subtle font-sans text-[13px] font-normal">years</span>
          </p>
        </div>

        <div className="border-border bg-surface-1 rounded-[var(--radius-md)] border p-4 shadow-xs">
          <span className="text-text-muted text-[12px] font-medium">Annual CTC Budget</span>
          <p className="text-success mt-1.5 font-mono text-xl font-bold">
            {formatCtcRange(opening.budgetRange.min, opening.budgetRange.max)}
          </p>
        </div>

        <div className="border-border bg-surface-1 rounded-[var(--radius-md)] border p-4 shadow-xs">
          <span className="text-text-muted text-[12px] font-medium">Work Location & Format</span>
          <p className="text-text mt-1.5 truncate text-[15px] font-semibold">
            {opening.location}
          </p>
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
                <Sparkles className="text-accent h-3.5 w-3.5" />
                <span>AI Candidate Match</span>
                <span className="bg-accent/20 text-accent rounded-full px-1.5 py-0.2 font-mono text-[10px] font-bold">
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
                          AI Neural Talent Ranking
                        </CardTitle>
                        <Badge
                          variant="default"
                          className="border-accent/30 bg-accent/15 text-accent text-[10px] font-bold font-mono"
                        >
                          Real-Time Engine
                        </Badge>
                      </div>
                      <p className="text-text-muted mt-0.5 text-[12px]">
                        Evaluated {allCandidates.length} candidate profiles across required skills,
                        experience, budget, and notice parameters.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleBatchShortlistTop}
                      className="border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 h-8 gap-1.5 text-[11px] font-semibold shrink-0"
                    >
                      <Zap className="h-3.5 w-3.5 fill-current" />
                      <span>Shortlist Top 3 Fits</span>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                  {/* Search and Filters */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="text-text-subtle pointer-events-none absolute top-2.5 left-3 h-4 w-4" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search candidate by name, company, or screened skill..."
                        className="bg-surface-2 h-9 pl-9 text-[13px]"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="text-text-subtle hover:text-text absolute top-2.5 right-3"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                      {/* Filter Pills */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedTier('all')}
                          className={cn(
                            'h-7.5 px-2.5 rounded-[6px] border text-[11.5px] font-medium transition-all cursor-pointer',
                            selectedTier === 'all'
                              ? 'border-accent/40 bg-accent/15 text-accent font-semibold shadow-2xs'
                              : 'border-border/70 bg-surface-2/40 text-text-muted hover:text-text hover:bg-surface-2'
                          )}
                        >
                          All Matches ({rankedMatches.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTier('strong')}
                          className={cn(
                            'h-7.5 px-2.5 rounded-[6px] border text-[11.5px] font-medium transition-all cursor-pointer inline-flex items-center gap-1.5',
                            selectedTier === 'strong'
                              ? 'border-accent/40 bg-accent/15 text-accent font-semibold shadow-2xs'
                              : 'border-border/70 bg-surface-2/40 text-text-muted hover:text-text hover:bg-surface-2'
                          )}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                          <span>Strong Fits ({strongMatches.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTier('good')}
                          className={cn(
                            'h-7.5 px-2.5 rounded-[6px] border text-[11.5px] font-medium transition-all cursor-pointer inline-flex items-center gap-1.5',
                            selectedTier === 'good'
                              ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold shadow-2xs'
                              : 'border-border/70 bg-surface-2/40 text-text-muted hover:text-text hover:bg-surface-2'
                          )}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>Good Matches ({goodMatches.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTier('fast')}
                          className={cn(
                            'h-7.5 px-2.5 rounded-[6px] border text-[11.5px] font-medium transition-all cursor-pointer inline-flex items-center gap-1.5',
                            selectedTier === 'fast'
                              ? 'border-border-strong bg-surface-3 text-text font-semibold shadow-2xs'
                              : 'border-border/70 bg-surface-2/40 text-text-muted hover:text-text hover:bg-surface-2'
                          )}
                        >
                          <Clock className="h-3 w-3 text-text-subtle" />
                          <span>Fast Joiners ({fastJoiners.length})</span>
                        </button>
                      </div>

                      {/* Custom Sort Select */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
                          <SelectTrigger className="h-7.5 w-[165px] gap-1.5 border-border/70 bg-surface-2/40 hover:bg-surface-2 text-text px-2.5 text-[11.5px] font-medium rounded-[6px] shadow-2xs">
                            <SelectValue placeholder="Sort candidate matches" />
                          </SelectTrigger>
                          <SelectContent align="end" className="min-w-[180px]">
                            <SelectItem value="score" className="text-[12px] py-1.5 rounded-[5px]">
                              AI Match Score (Highest)
                            </SelectItem>
                            <SelectItem value="experience" className="text-[12px] py-1.5 rounded-[5px]">
                              Experience (Highest)
                            </SelectItem>
                            <SelectItem value="notice" className="text-[12px] py-1.5 rounded-[5px]">
                              Notice Period (Fastest)
                            </SelectItem>
                            <SelectItem value="ctc" className="text-[12px] py-1.5 rounded-[5px]">
                              Expected CTC (Lowest)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Ranked Candidate List */}
                  {filteredMatches.length === 0 ? (
                    <div className="border-border/60 bg-surface-2/30 flex flex-col items-center justify-center rounded-[8px] border border-dashed py-12 text-center select-none">
                      <Filter className="text-text-subtle h-7 w-7" />
                      <p className="text-text mt-2.5 text-[13px] font-semibold">
                        No candidates match your current filter
                      </p>
                      <p className="text-text-muted mt-0.5 text-[12px]">
                        Try switching to "All Matches" or adjusting your search keyword.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {filteredMatches.map((match) => {
                        const { candidate, score, tier, summary, matchedMustSkills, missingMustSkills } =
                          match;
                        const isAssigned = candidate.openingId === opening.id;
                        const isSharedWithManager =
                          (isAssigned && candidate.stage === 'Shared with Manager' && candidate.managerDecision === 'Pending') ||
                          Boolean(shortlistedMap[candidate.id]);
                        const isManagerApproved =
                          isAssigned && (candidate.managerDecision === 'Shortlisted' || candidate.stage === 'Interview');
                        const isQuestionsExpanded = Boolean(expandedQuestionsMap[candidate.id]);

                        return (
                          <div
                            key={candidate.id}
                            className={cn(
                              'group relative flex flex-col justify-between rounded-[10px] border border-border/80 bg-surface-1 p-4 shadow-2xs transition-all duration-150',
                              'hover:border-border-strong hover:shadow-xs space-y-3.5 select-none',
                              tier === 'Strong Fit' && 'border-accent/40 bg-gradient-to-b from-accent/[0.03] to-surface-1'
                            )}
                          >
                            {/* Card Header: Avatar + Meta + Match Score */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <Avatar className="h-10 w-10 shrink-0 border border-border/70 bg-surface-2 shadow-2xs">
                                  <AvatarFallback className="bg-surface-2 text-text text-[12px] font-semibold tracking-wide">
                                    {candidate.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => handleInspect(candidate)}
                                      className="text-text hover:text-accent font-bold text-[14px] truncate cursor-pointer text-left transition-colors"
                                    >
                                      {candidate.name}
                                    </button>
                                    <SourceBadge source={candidate.source} variant="badge" />
                                  </div>
                                  <p className="text-text-muted text-[12px] truncate mt-0.5">
                                    <span className="font-semibold text-text">{candidate.currentRole}</span>
                                    <span className="text-text-subtle/80 mx-1">at</span>
                                    <span className="font-medium text-text">{candidate.currentCompany}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Match Score Badge & Status */}
                              <div className="flex flex-col items-end gap-1.5 shrink-0 select-none">
                                {tier === 'Strong Fit' ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-2.5 py-0.5 text-[11px] font-mono font-bold text-accent shadow-2xs">
                                    <Sparkles className="h-3 w-3 animate-pulse" />
                                    <span>{score}% Match • Strong Fit</span>
                                  </span>
                                ) : tier === 'Good Match' ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 shadow-2xs">
                                    <Check className="h-3 w-3 stroke-[2.5]" />
                                    <span>{score}% Match • Good Match</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-[11px] font-mono font-medium text-text-muted">
                                    <span>{score}% Match</span>
                                  </span>
                                )}

                                <div>
                                  {isSharedWithManager ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent">
                                      <Clock className="h-3 w-3 animate-pulse" />
                                      <span>In Manager Queue</span>
                                    </span>
                                  ) : isManagerApproved ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      <span>Shortlisted</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-text-subtle">
                                      <span className="h-1.5 w-1.5 rounded-full bg-text-subtle/60" />
                                      <span>{candidate.stage}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Core Parameters Row (3 Cells) */}
                            <div className="grid grid-cols-3 gap-2 bg-surface-2/40 border border-border/60 rounded-[8px] p-2.5 text-[11.5px]">
                              <div>
                                <div className="flex items-center gap-1 text-[10.5px] uppercase font-semibold text-text-subtle">
                                  <Briefcase className="h-3 w-3 text-text-subtle" />
                                  <span>Experience</span>
                                </div>
                                <div className="text-text font-bold font-mono text-[13px] mt-0.5">
                                  {candidate.experienceYears} Years
                                </div>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block truncate mt-0.5">
                                  {match.experienceVerdict.status === 'optimal'
                                    ? '✓ Fits Requisition'
                                    : match.experienceVerdict.label}
                                </span>
                              </div>

                              <div>
                                <div className="flex items-center gap-1 text-[10.5px] uppercase font-semibold text-text-subtle">
                                  <IndianRupee className="h-3 w-3 text-text-subtle" />
                                  <span>Expected CTC</span>
                                </div>
                                <div className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[13px] mt-0.5">
                                  {formatCtc(candidate.expectedCtc)}
                                </div>
                                <span className="text-[10px] text-text-subtle font-medium block truncate mt-0.5">
                                  {match.budgetVerdict.status === 'within'
                                    ? '✓ Within Budget'
                                    : match.budgetVerdict.label}
                                </span>
                              </div>

                              <div>
                                <div className="flex items-center gap-1 text-[10.5px] uppercase font-semibold text-text-subtle">
                                  <Clock className="h-3 w-3 text-text-subtle" />
                                  <span>Notice Period</span>
                                </div>
                                <div className="text-text font-bold text-[13px] mt-0.5">
                                  {candidate.noticePeriod}
                                </div>
                                <span className="text-[10px] text-text-subtle font-medium block truncate mt-0.5">
                                  {candidate.noticePeriod.toLowerCase().includes('immediate')
                                    ? '⚡ Immediate Joining'
                                    : 'Available soon'}
                                </span>
                              </div>
                            </div>

                            {/* Screened Skills Chips */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                                <span>Screened Competencies</span>
                                <span className="font-mono text-[10px] lowercase font-normal">
                                  {matchedMustSkills.length} of {matchedMustSkills.length + missingMustSkills.length} verified
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {matchedMustSkills.map((s) => (
                                  <span
                                    key={s}
                                    className="border-border/70 bg-surface-2 text-text inline-flex items-center gap-1 rounded-[5px] border px-2 py-0.5 text-[11px] font-medium"
                                  >
                                    <Check className="h-2.5 w-2.5 text-emerald-500 stroke-[3]" />
                                    <span>{s}</span>
                                  </span>
                                ))}

                                {missingMustSkills.map((s) => (
                                  <span
                                    key={s}
                                    className="border-border/50 bg-surface-2/30 text-text-subtle inline-flex items-center gap-1 rounded-[5px] border border-dashed px-2 py-0.5 text-[11px] font-normal opacity-75"
                                    title="Skill not explicitly verified in candidate profile"
                                  >
                                    <AlertTriangle className="h-2.5 w-2.5 text-amber-500/80" />
                                    <span>{s}</span>
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* AI Reasoning Callout */}
                            <div className="border-accent/25 bg-accent/5 rounded-[8px] border p-3 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 font-semibold text-text text-[11.5px]">
                                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                                  <span>AI Fit Reasoning</span>
                                </div>
                                <span className="font-mono text-[10.5px] font-semibold text-accent">
                                  {score}% Conviction
                                </span>
                              </div>
                              <p className="text-text-muted text-[12px] leading-relaxed font-normal">
                                {summary}
                              </p>

                              {/* Probing Technical Questions (Collapsible) */}
                              {match.suggestedQuestions && match.suggestedQuestions.length > 0 && (
                                <div className="pt-2 border-t border-accent/15">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedQuestionsMap((prev) => ({
                                        ...prev,
                                        [candidate.id]: !prev[candidate.id],
                                      }))
                                    }
                                    className="flex items-center justify-between w-full text-left text-[11px] font-medium text-text-muted hover:text-text cursor-pointer transition-colors"
                                  >
                                    <span className="flex items-center gap-1">
                                      <Lightbulb className="h-3 w-3 text-accent" />
                                      <span>AI Probing Questions ({match.suggestedQuestions.length})</span>
                                    </span>
                                    <ChevronDown
                                      className={cn(
                                        'h-3.5 w-3.5 text-text-subtle transition-transform duration-150',
                                        isQuestionsExpanded && 'rotate-180'
                                      )}
                                    />
                                  </button>
                                  {isQuestionsExpanded && (
                                    <ul className="mt-2 space-y-1.5 pl-3 border-l-2 border-accent/30 text-[11.5px] text-text-muted">
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

                            {/* Action Row */}
                            <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
                              <button
                                type="button"
                                onClick={() => handleInspect(candidate)}
                                className="inline-flex items-center gap-1 text-[11.5px] font-medium text-text-muted hover:text-accent transition-colors cursor-pointer"
                              >
                                <span>View Full Dossier</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>

                              <div className="flex items-center gap-2">
                                {isManagerApproved ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled
                                    className="h-8 gap-1.5 text-[11.5px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-semibold cursor-default"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Manager Approved</span>
                                  </Button>
                                ) : isSharedWithManager ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled
                                    className="h-8 gap-1.5 text-[11.5px] text-accent border-accent/30 bg-accent/10 font-semibold cursor-default"
                                  >
                                    <Clock className="h-3.5 w-3.5 animate-pulse" />
                                    <span>In Manager Queue</span>
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="primary"
                                    disabled={assignCandidate.isPending}
                                    onClick={() => handleShortlistCandidate(match)}
                                    className="h-8 gap-1.5 text-[11.5px] font-semibold rounded-[6px] shadow-xs cursor-pointer"
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
                          className="border-accent/20 bg-accent/10 text-accent inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
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
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-accent/20 text-accent text-[11px] font-semibold">
                                {candidate.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-text text-[13px] font-semibold">
                                  {candidate.name}
                                </span>
                                <StatusBadge status={candidate.stage} type="candidate" />
                              </div>
                              <p className="text-text-muted text-[11px]">
                                {candidate.currentRole} at {candidate.currentCompany} •{' '}
                                <span className="text-text font-bold">
                                  {candidate.experienceYears} yrs exp
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="text-text-muted flex items-center gap-4 self-end text-[11px] sm:self-center">
                            <span className="text-text font-mono font-medium">
                              Expected: {formatCtc(candidate.expectedCtc)}
                            </span>
                            <span className="text-text font-bold">
                              Notice: {candidate.noticePeriod}
                            </span>
                          </div>
                        </div>
                      ))}

                      {totalPipelinePages > 1 && (
                        <div className="flex items-center justify-between pt-3 border-t border-border/60 text-[12px] select-none">
                          <span className="font-mono text-text-subtle text-[11.5px]">
                            Showing {(validPipelinePage - 1) * PIPELINE_PAGE_SIZE + 1}–{Math.min(validPipelinePage * PIPELINE_PAGE_SIZE, openingCandidates.length)} of {openingCandidates.length} candidates (Page {validPipelinePage} of {totalPipelinePages})
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={validPipelinePage <= 1}
                              onClick={() => setPipelinePage((p) => Math.max(1, p - 1))}
                              className="h-7 w-7 inline-flex items-center justify-center rounded-[6px] border border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              title="Previous page"
                              aria-label="Previous page"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={validPipelinePage >= totalPipelinePages}
                              onClick={() => setPipelinePage((p) => Math.min(totalPipelinePages, p + 1))}
                              className="h-7 w-7 inline-flex items-center justify-center rounded-[6px] border border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
            <Card className="border-accent/30 bg-surface-1 shadow-sm">
              <CardHeader className="border-border/80 border-b pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="text-accent h-4 w-4" />
                    <CardTitle className="text-text text-[14px] font-semibold">
                      AI Talent Radar
                    </CardTitle>
                  </div>
                  <Badge variant="default" className="text-accent bg-accent/15 border-accent/30 font-mono text-[10px]">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 text-[12px]">
                <div className="border-border bg-surface-2/60 space-y-2 rounded-[var(--radius-sm)] border p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Top Match Fit</span>
                    <span className="text-accent font-bold font-mono">
                      {strongMatches[0] ? `${strongMatches[0].score}% (${strongMatches[0].candidate.name})` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">High-Fit Candidates</span>
                    <span className="text-text font-bold font-mono">{strongMatches.length} available</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Budget Feasibility</span>
                    <span className="text-success font-bold font-mono">100% within band</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBatchShortlistTop}
                  className="w-full h-8 text-[11px] gap-1.5 border-accent/30 text-accent hover:bg-accent/10"
                >
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  <span>Shortlist Top 3 Fits</span>
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
                    <span className="text-accent font-semibold">{opening.urgency}</span>
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

      {/* Candidate Profile Dossier Sheet */}
      <CandidateDetailSheet
        candidate={selectedCandidate}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
}
