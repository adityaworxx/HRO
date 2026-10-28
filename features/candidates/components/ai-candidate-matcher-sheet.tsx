'use client';

import * as React from 'react';
import type { Opening, Candidate } from '@/types/entities';
import { useCandidates, useAssignCandidateToOpening } from '../hooks';
import { rankCandidatesForOpening, type CandidateMatchResult } from '@/lib/ai-matcher';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SourceBadge } from '@/components/hro/source-badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Sparkles,
  Search,
  Check,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  UserCheck,
  Zap,
  Briefcase,
  IndianRupee,
  Building2,
  X,
  ChevronDown,
  Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatCtc, formatCtcRange } from '@/lib/format';

interface AiCandidateMatcherSheetProps {
  opening: Opening | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInspectCandidate?: (candidate: Candidate) => void;
}

export function AiCandidateMatcherSheet({
  opening,
  open,
  onOpenChange,
  onInspectCandidate,
}: AiCandidateMatcherSheetProps) {
  const { data: allCandidates = [] } = useCandidates();
  const assignCandidate = useAssignCandidateToOpening();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTier, setSelectedTier] = React.useState<'all' | 'strong' | 'good' | 'fast'>('all');
  const [sortBy, setSortBy] = React.useState<'score' | 'experience' | 'notice' | 'ctc'>('score');
  const [isScanning, setIsScanning] = React.useState(false);
  const [shortlistedMap, setShortlistedMap] = React.useState<Record<string, boolean>>({});
  const [expandedQuestionsMap, setExpandedQuestionsMap] = React.useState<Record<string, boolean>>({});

  // Simulate real-time scan when opening changes or sheet is opened
  React.useEffect(() => {
    if (open && opening) {
      setIsScanning(true);
      const timer = setTimeout(() => {
        setIsScanning(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [open, opening?.id]);

  // Compute AI Match rankings
  const rankedResults = React.useMemo(() => {
    if (!opening || allCandidates.length === 0) return [];
    return rankCandidatesForOpening(allCandidates, opening);
  }, [opening, allCandidates]);

  // Filter & sort results
  const filteredResults = React.useMemo(() => {
    let list = [...rankedResults];

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
      // Default: best match score
      list.sort((a, b) => b.score - a.score);
    }

    return list;
  }, [rankedResults, searchQuery, selectedTier, sortBy]);

  const strongCount = rankedResults.filter((r) => r.tier === 'Strong Fit').length;
  const goodCount = rankedResults.filter((r) => r.tier === 'Good Match').length;
  const fastJoinerCount = rankedResults.filter(
    (r) =>
      r.candidate.noticePeriod.toLowerCase().includes('immediate') ||
      r.candidate.noticePeriod.toLowerCase().includes('15') ||
      r.candidate.noticePeriod.toLowerCase().includes('30')
  ).length;

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
    const topMatches = rankedResults.slice(0, 3);
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

  if (!opening) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="border-border bg-surface-1 flex w-full flex-col overflow-y-auto p-0 shadow-2xl sm:max-w-2xl"
      >
        {/* TOP COVER BANNER WITH AMBIENT GLOW */}
        <div className="border-border/70 bg-surface-1 relative shrink-0 border-b px-6 pt-5 pb-5 select-none">
          {/* Subtle accent hairline */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-accent via-accent/50 to-transparent" />

          {/* Utility row: AI pill & Evaluated count on left, Batch button on right (with mr-8 margin from Radix Close 'X') */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-accent/15 text-accent border-accent/30 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold shadow-2xs">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>Real-Time AI Candidate Screening</span>
              </span>
              <span className="text-text-subtle font-mono text-[11px]">
                • {allCandidates.length} evaluated
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBatchShortlistTop}
              className="border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 h-7.5 shrink-0 gap-1.5 text-[11.5px] font-semibold rounded-[6px] mr-8 transition-colors shadow-2xs cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>Shortlist Top 3 Fits</span>
            </Button>
          </div>

          {/* Requisition Title & Parameters */}
          <div className="mt-3.5 space-y-1.5">
            <h2 className="text-text text-[17.5px] font-bold tracking-tight">
              AI Match: {opening.title}
            </h2>

            <div className="flex items-center gap-2 flex-wrap text-[11.5px] text-text-muted">
              <span className="inline-flex items-center gap-1 bg-surface-2 border border-border/70 px-2 py-0.5 rounded-[5px] text-text font-medium">
                <Building2 className="h-3 w-3 text-text-subtle shrink-0" />
                <span>{opening.department}</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-surface-2 border border-border/70 px-2 py-0.5 rounded-[5px] text-text font-mono font-medium">
                <IndianRupee className="h-3 w-3 text-text-subtle shrink-0" />
                <span>{formatCtcRange(opening.budgetRange.min, opening.budgetRange.max)}</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-surface-2 border border-border/70 px-2 py-0.5 rounded-[5px] text-text font-mono font-medium">
                <Briefcase className="h-3 w-3 text-text-subtle shrink-0" />
                <span>{opening.experienceRange.min}–{opening.experienceRange.max} yrs exp</span>
              </span>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <div className="border-border/70 bg-surface-2/40 rounded-[8px] border p-2.5 transition-colors hover:bg-surface-2/70">
              <div className="flex items-center justify-between text-text-subtle text-[10.5px] uppercase font-semibold tracking-wider">
                <span>Strong Fits</span>
                <Sparkles className="h-3 w-3 text-accent" />
              </div>
              <span className="text-accent font-mono text-xl font-bold block mt-0.5 tabular-nums">
                {strongCount}
              </span>
              <span className="text-text-subtle block text-[10.5px] font-medium truncate mt-0.5">
                &ge; 82% Match
              </span>
            </div>

            <div className="border-border/70 bg-surface-2/40 rounded-[8px] border p-2.5 transition-colors hover:bg-surface-2/70">
              <div className="flex items-center justify-between text-text-subtle text-[10.5px] uppercase font-semibold tracking-wider">
                <span>Good Matches</span>
                <Check className="h-3 w-3 text-emerald-500 stroke-[2.5]" />
              </div>
              <span className="text-emerald-500 font-mono text-xl font-bold block mt-0.5 tabular-nums">
                {goodCount}
              </span>
              <span className="text-text-subtle block text-[10.5px] font-medium truncate mt-0.5">
                &ge; 68% Match
              </span>
            </div>

            <div className="border-border/70 bg-surface-2/40 rounded-[8px] border p-2.5 transition-colors hover:bg-surface-2/70">
              <div className="flex items-center justify-between text-text-subtle text-[10.5px] uppercase font-semibold tracking-wider">
                <span>Fast Joiners</span>
                <Clock className="h-3 w-3 text-text-subtle" />
              </div>
              <span className="text-text font-mono text-xl font-bold block mt-0.5 tabular-nums">
                {fastJoinerCount}
              </span>
              <span className="text-text-subtle block text-[10.5px] font-medium truncate mt-0.5">
                &le; 30 Days Notice
              </span>
            </div>
          </div>
        </div>

        {/* SEARCH, FILTERS & SORT TOOLBAR */}
        <div className="border-border/70 bg-surface-1/95 sticky top-0 z-20 space-y-2.5 border-b p-4 backdrop-blur-md select-none">
          <div className="relative">
            <Search className="text-text-subtle pointer-events-none absolute top-2.5 left-3 h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate by name, company, or screened skill..."
              className="bg-surface-2/40 border-border/70 hover:border-border focus:bg-surface-1 h-9 pl-9 pr-8 text-[13px] rounded-[8px] shadow-2xs transition-all w-full"
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
                All Fits ({rankedResults.length})
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
                <span>Strong Fits ({strongCount})</span>
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
                <span>Good Matches ({goodCount})</span>
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
                <span>Fast Joiners ({fastJoinerCount})</span>
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
                    AI Fit Score (Highest)
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

        {/* CANDIDATE RESULTS LIST */}
        <div className="flex-1 space-y-3.5 p-4">
          {isScanning ? (
            <div className="border-border/60 bg-surface-2/40 flex flex-col items-center justify-center rounded-[8px] border border-dashed py-14 text-center select-none">
              <Sparkles className="text-accent h-7 w-7 animate-spin" />
              <p className="text-text mt-3 text-[13.5px] font-semibold">
                Scanning Candidate Talent Pool...
              </p>
              <p className="text-text-muted mt-1 text-[12px] max-w-sm">
                Matching skill vectors, experience ranges, and compensation parameters in real-time.
              </p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="border-border/60 bg-surface-2/30 flex flex-col items-center justify-center rounded-[8px] border border-dashed py-12 text-center select-none">
              <Filter className="text-text-subtle h-7 w-7" />
              <p className="text-text mt-2.5 text-[13px] font-semibold">
                No matching candidates found
              </p>
              <p className="text-text-muted mt-0.5 text-[12px]">
                Try relaxing the filters or broadening your search criteria.
              </p>
            </div>
          ) : (
            filteredResults.map((match) => {
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
                          <h4 className="text-text font-bold text-[14px] tracking-tight group-hover:text-accent transition-colors truncate">
                            {candidate.name}
                          </h4>
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

                      {/* Small Status Indicator */}
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

                  {/* Core Requisition Parameters (3 Cells) */}
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

                  {/* Screened Core Skills */}
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

                  {/* AI Fit Reasoning Box */}
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

                  {/* Card Action Bar */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
                    {onInspectCandidate ? (
                      <button
                        type="button"
                        onClick={() => onInspectCandidate(candidate)}
                        className="inline-flex items-center gap-1 text-[11.5px] font-medium text-text-muted hover:text-accent transition-colors cursor-pointer"
                      >
                        <span>View Full Dossier</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    ) : (
                      <div />
                    )}

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
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
