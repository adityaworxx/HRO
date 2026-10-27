'use client';

import * as React from 'react';
import type { Opening, Candidate } from '@/types/entities';
import { useCandidates, useAssignCandidateToOpening } from '../hooks';
import { rankCandidatesForOpening, type CandidateMatchResult } from '@/lib/ai-matcher';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  HelpCircle,
  TrendingUp,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatCtc } from '@/lib/format';

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
  const { data: allCandidates = [], isLoading } = useCandidates();
  const assignCandidate = useAssignCandidateToOpening();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTier, setSelectedTier] = React.useState<'all' | 'strong' | 'good' | 'fast'>('all');
  const [sortBy, setSortBy] = React.useState<'score' | 'experience' | 'notice' | 'ctc'>('score');
  const [isScanning, setIsScanning] = React.useState(false);
  const [shortlistedMap, setShortlistedMap] = React.useState<Record<string, boolean>>({});

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
        {/* TOP COVER BANNER */}
        <div className="border-border/60 bg-surface-2 relative shrink-0 overflow-hidden border-b p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-accent/15 text-accent border-accent/20 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold">
                  <Sparkles className="h-3 w-3" />
                  <span>Real-Time AI Candidate Screening</span>
                </span>
                <span className="text-text-subtle font-mono text-[11px]">
                  {allCandidates.length} profiles evaluated
                </span>
              </div>
              <h2 className="text-text text-[18px] font-bold tracking-tight">
                AI Match: {opening.title}
              </h2>
              <p className="text-text-muted text-[12px]">
                {opening.department} • Budget: {formatCtc(opening.budgetRange.min)}-
                {formatCtc(opening.budgetRange.max)} • Exp: {opening.experienceRange.min}-
                {opening.experienceRange.max} yrs
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBatchShortlistTop}
              className="border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 h-8 shrink-0 gap-1.5 text-[11px] font-semibold"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>Shortlist Top 3 Fits</span>
            </Button>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="border-border/70 bg-surface-1/90 rounded-[var(--radius-sm)] border p-2.5 text-center">
              <span className="text-text-subtle block text-[10px] uppercase font-semibold">
                Strong Fits (≥82%)
              </span>
              <span className="text-accent font-mono text-lg font-bold">{strongCount}</span>
            </div>
            <div className="border-border/70 bg-surface-1/90 rounded-[var(--radius-sm)] border p-2.5 text-center">
              <span className="text-text-subtle block text-[10px] uppercase font-semibold">
                Good Matches (≥68%)
              </span>
              <span className="text-success font-mono text-lg font-bold">{goodCount}</span>
            </div>
            <div className="border-border/70 bg-surface-1/90 rounded-[var(--radius-sm)] border p-2.5 text-center">
              <span className="text-text-subtle block text-[10px] uppercase font-semibold">
                Fast Joiners (&le;30d)
              </span>
              <span className="text-text font-mono text-lg font-bold">{fastJoinerCount}</span>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="border-border/70 bg-surface-1/90 sticky top-0 z-20 space-y-3 border-b p-4 backdrop-blur-md">
          <div className="relative">
            <Search className="text-text-subtle pointer-events-none absolute top-2.5 left-3 h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate by name, company, or skill..."
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
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setSelectedTier('all')}
                className={cn(
                  'rounded-[var(--radius-sm)] border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer',
                  selectedTier === 'all'
                    ? 'border-accent bg-accent/15 text-accent font-semibold'
                    : 'border-border bg-surface-2 text-text-muted hover:text-text'
                )}
              >
                All Fits ({rankedResults.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('strong')}
                className={cn(
                  'rounded-[var(--radius-sm)] border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer',
                  selectedTier === 'strong'
                    ? 'border-accent bg-accent/20 text-accent font-semibold'
                    : 'border-border bg-surface-2 text-text-muted hover:text-text'
                )}
              >
                🔥 Strong Fits ({strongCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('good')}
                className={cn(
                  'rounded-[var(--radius-sm)] border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer',
                  selectedTier === 'good'
                    ? 'border-success/30 bg-success/15 text-success font-semibold'
                    : 'border-border bg-surface-2 text-text-muted hover:text-text'
                )}
              >
                👍 Good Matches ({goodCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('fast')}
                className={cn(
                  'rounded-[var(--radius-sm)] border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer',
                  selectedTier === 'fast'
                    ? 'border-border-strong bg-surface-3 text-text font-semibold'
                    : 'border-border bg-surface-2 text-text-muted hover:text-text'
                )}
              >
                ⚡ Fast Joiners ({fastJoinerCount})
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort candidate matches"
                className="border-border bg-surface-2 text-text rounded-[var(--radius-sm)] border px-2 py-1 text-[11px]"
              >
                <option value="score">AI Fit Score (Highest)</option>
                <option value="experience">Experience (Highest)</option>
                <option value="notice">Notice Period (Fastest)</option>
                <option value="ctc">Expected CTC (Lowest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* CANDIDATE RESULTS LIST */}
        <div className="flex-1 space-y-3.5 p-4">
          {isScanning ? (
            <div className="border-border/60 bg-surface-2/40 flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed py-14 text-center">
              <Sparkles className="text-accent h-8 w-8 animate-spin" />
              <p className="text-text mt-3 text-[14px] font-semibold">
                Scanning Candidate Talent Pool...
              </p>
              <p className="text-text-muted mt-1 text-[12px]">
                Matching skill vectors, experience ranges, and compensation parameters in real-time.
              </p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="border-border/60 bg-surface-2/30 flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed py-12 text-center">
              <Filter className="text-text-subtle h-8 w-8" />
              <p className="text-text mt-2.5 text-[13px] font-semibold">
                No matching candidates found
              </p>
              <p className="text-text-muted mt-0.5 text-[12px]">
                Try relaxing the filters or broadening your search criteria.
              </p>
            </div>
          ) : (
            filteredResults.map((match, index) => {
              const { candidate, score, tier, summary, matchedMustSkills, missingMustSkills } =
                match;
              const isAssigned = candidate.openingId === opening.id;
              const isSharedWithManager =
                (isAssigned && candidate.stage === 'Shared with Manager' && candidate.managerDecision === 'Pending') ||
                Boolean(shortlistedMap[candidate.id]);
              const isManagerApproved =
                isAssigned && (candidate.managerDecision === 'Shortlisted' || candidate.stage === 'Interview');

              return (
                <div
                  key={candidate.id}
                  className={cn(
                    'border-border bg-surface-1 hover:border-accent/50 rounded-[var(--radius-md)] border p-4 shadow-xs transition-all space-y-3',
                    tier === 'Strong Fit' && 'border-accent/40 bg-accent/5'
                  )}
                >
                  {/* Card Header: Avatar + Meta + Match Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarFallback className="bg-surface-3 text-text text-[12px] font-bold">
                            {candidate.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-text-subtle font-mono text-[9px] absolute -bottom-1 -right-1 bg-surface-2 border border-border px-1 rounded-full">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-text font-bold text-[14px] truncate">
                            {candidate.name}
                          </h4>
                          <Badge
                            variant="default"
                            className={cn(
                              'text-[10px] font-bold font-mono px-2 py-0.5',
                              tier === 'Strong Fit'
                                ? 'border-accent/30 bg-accent/20 text-accent'
                                : tier === 'Good Match'
                                  ? 'border-success/30 bg-success/15 text-success'
                                  : 'border-border bg-surface-2 text-text-muted'
                            )}
                          >
                            {score}% Match • {tier}
                          </Badge>
                        </div>
                        <p className="text-text-muted text-[12px] truncate">
                          {candidate.currentRole} at <span className="font-semibold text-text">{candidate.currentCompany}</span>
                        </p>
                      </div>
                    </div>

                    {/* Stage status */}
                    <div className="shrink-0 text-right">
                      {isSharedWithManager ? (
                        <span className="border-accent/30 bg-accent/15 text-accent rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                          ⏳ Shared with Mgr
                        </span>
                      ) : isManagerApproved ? (
                        <span className="border-success/30 bg-success/15 text-success rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                          ✓ Shortlisted
                        </span>
                      ) : (
                        <span className="bg-surface-2 text-text-subtle border-border rounded-full border px-2 py-0.5 text-[10px] font-medium">
                          {candidate.stage}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Core Metrics: Exp, CTC, Notice */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] border-y border-border/60 py-2">
                    <div>
                      <span className="text-text-subtle block">Experience:</span>
                      <span className="text-text font-semibold font-mono">
                        {candidate.experienceYears} yrs
                      </span>
                      <span className="text-text-subtle block text-[10px]">
                        ({match.experienceVerdict.status === 'optimal' ? 'Fits Req' : match.experienceVerdict.status})
                      </span>
                    </div>

                    <div>
                      <span className="text-text-subtle block">Expected CTC:</span>
                      <span className="text-success font-semibold font-mono">
                        {formatCtc(candidate.expectedCtc)}
                      </span>
                      <span className="text-text-subtle block text-[10px]">
                        ({match.budgetVerdict.status === 'within' ? 'In Budget' : match.budgetVerdict.status})
                      </span>
                    </div>

                    <div>
                      <span className="text-text-subtle block">Notice Period:</span>
                      <span className="text-text font-semibold">
                        {candidate.noticePeriod}
                      </span>
                      <span className="text-text-subtle block text-[10px]">
                        Available soon
                      </span>
                    </div>
                  </div>

                  {/* Skill Alignment Chips */}
                  <div className="space-y-1.5">
                    <span className="text-text-subtle text-[11px] font-medium block">
                      Screened Core Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedMustSkills.map((s) => (
                        <span
                          key={s}
                          className="border-accent/30 bg-accent/15 text-accent inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium"
                        >
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                          <span>{s}</span>
                        </span>
                      ))}

                      {missingMustSkills.map((s) => (
                        <span
                          key={s}
                          className="border-border bg-surface-2 text-text-subtle inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-normal opacity-75"
                          title="Skill not explicitly verified in candidate profile"
                        >
                          <AlertTriangle className="h-2.5 w-2.5 text-warning" />
                          <span>{s}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Executive Reasoning Box */}
                  <div className="border-border/70 bg-surface-2/60 rounded-[var(--radius-sm)] border p-2.5 text-[11.5px] leading-relaxed">
                    <div className="flex items-center gap-1.5 font-semibold text-text mb-1">
                      <Sparkles className="h-3 w-3 text-accent" />
                      <span>AI Fit Reasoning:</span>
                    </div>
                    <p className="text-text-muted">{summary}</p>
                  </div>

                  {/* 1-Click Card Action Bar */}
                  <div className="flex items-center justify-between pt-1">
                    {onInspectCandidate && (
                      <button
                        type="button"
                        onClick={() => onInspectCandidate(candidate)}
                        className="text-text-muted hover:text-text text-[11.5px] font-medium underline-offset-4 hover:underline cursor-pointer"
                      >
                        View Full Dossier &rarr;
                      </button>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        type="button"
                        size="sm"
                        variant={isManagerApproved ? 'secondary' : isSharedWithManager ? 'secondary' : 'primary'}
                        disabled={isManagerApproved || isSharedWithManager || assignCandidate.isPending}
                        onClick={() => handleShortlistCandidate(match)}
                        className="h-8 gap-1.5 text-[11.5px] px-3 font-semibold cursor-pointer"
                      >
                        {isManagerApproved ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                            <span>Manager Approved</span>
                          </>
                        ) : isSharedWithManager ? (
                          <>
                            <Clock className="h-3.5 w-3.5 text-accent" />
                            <span>In Manager Queue</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Send to Manager</span>
                          </>
                        )}
                      </Button>
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

