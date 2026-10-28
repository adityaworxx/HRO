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
import { CompanyLogo } from '@/components/hro/company-logo';
import { CandidateAvatar } from '@/components/hro/candidate-avatar';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  UserCheck,
  X,
  ChevronDown,
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
  const [shortlistedMap, setShortlistedMap] = React.useState<Record<string, boolean>>({});
  const [expandedQuestionsMap, setExpandedQuestionsMap] = React.useState<Record<string, boolean>>({});

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
        {/* REFINED APPLE-GRADE HEADER */}
        <div className="border-border/60 bg-surface-1 shrink-0 border-b px-6 pt-5 pb-4 select-none">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-accent uppercase tracking-wider font-mono">
                AI Talent Match
              </span>
              <h2 className="text-text text-[17px] font-bold tracking-tight truncate mt-0.5">
                {opening.title}
              </h2>
              <p className="text-text-muted text-[12px] truncate mt-1">
                <span>{opening.department}</span>
                <span className="text-text-subtle/50 mx-1.5">•</span>
                <span>{formatCtcRange(opening.budgetRange.min, opening.budgetRange.max)}</span>
                <span className="text-text-subtle/50 mx-1.5">•</span>
                <span>{opening.experienceRange.min}–{opening.experienceRange.max}y exp</span>
                <span className="text-text-subtle/50 mx-1.5">•</span>
                <span className="text-text-subtle">{allCandidates.length} evaluated</span>
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBatchShortlistTop}
              className="border-border/80 hover:bg-surface-2 text-text h-7.5 shrink-0 px-3 text-[11.5px] font-semibold rounded-[6px] mr-8 transition-colors shadow-2xs cursor-pointer"
            >
              Shortlist Top 3
            </Button>
          </div>
        </div>

        {/* SEARCH, SEGMENTED CONTROLS & SORT TOOLBAR */}
        <div className="border-border/60 bg-surface-1/95 sticky top-0 z-20 space-y-2.5 border-b p-4 backdrop-blur-md select-none">
          <div className="relative">
            <Search className="text-text-subtle pointer-events-none absolute top-2.5 left-3 h-4 w-4 stroke-[1.75]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate by name, company, or skill..."
              className="bg-surface-2/40 border-border/60 hover:border-border focus:bg-surface-1 h-8.5 pl-9 pr-8 text-[12.5px] rounded-[7px] shadow-2xs transition-all w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-text-subtle hover:text-text absolute top-2.5 right-3 cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            {/* Apple-style Segmented Control */}
            <div className="inline-flex items-center gap-1 rounded-[7px] border border-border/60 bg-surface-2/50 p-0.5 select-none">
              <button
                type="button"
                onClick={() => setSelectedTier('all')}
                className={cn(
                  'h-6.5 px-2.5 rounded-[5px] text-[11.5px] font-medium transition-all cursor-pointer',
                  selectedTier === 'all'
                    ? 'bg-surface-1 text-text font-semibold shadow-2xs border border-border/60'
                    : 'text-text-muted hover:text-text'
                )}
              >
                All ({rankedResults.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('strong')}
                className={cn(
                  'h-6.5 px-2.5 rounded-[5px] text-[11.5px] font-medium transition-all cursor-pointer',
                  selectedTier === 'strong'
                    ? 'bg-surface-1 text-accent font-semibold shadow-2xs border border-border/60'
                    : 'text-text-muted hover:text-text'
                )}
              >
                Strong ({strongCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('good')}
                className={cn(
                  'h-6.5 px-2.5 rounded-[5px] text-[11.5px] font-medium transition-all cursor-pointer',
                  selectedTier === 'good'
                    ? 'bg-surface-1 text-emerald-600 dark:text-emerald-400 font-semibold shadow-2xs border border-border/60'
                    : 'text-text-muted hover:text-text'
                )}
              >
                Good ({goodCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('fast')}
                className={cn(
                  'h-6.5 px-2.5 rounded-[5px] text-[11.5px] font-medium transition-all cursor-pointer',
                  selectedTier === 'fast'
                    ? 'bg-surface-1 text-text font-semibold shadow-2xs border border-border/60'
                    : 'text-text-muted hover:text-text'
                )}
              >
                Fast Joiners ({fastJoinerCount})
              </button>
            </div>

            {/* Compact Sort Select */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
                <SelectTrigger className="h-7 w-[125px] gap-1 border-border/60 bg-surface-1 hover:bg-surface-2 text-text px-2 text-[11.5px] font-medium rounded-[6px] shadow-2xs">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent align="end" className="min-w-[150px]">
                  <SelectItem value="score" className="text-[12px] py-1.5">
                    Best Match
                  </SelectItem>
                  <SelectItem value="experience" className="text-[12px] py-1.5">
                    Experience
                  </SelectItem>
                  <SelectItem value="notice" className="text-[12px] py-1.5">
                    Fastest Notice
                  </SelectItem>
                  <SelectItem value="ctc" className="text-[12px] py-1.5">
                    Lowest CTC
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* CANDIDATE RESULTS LIST */}
        <div className="flex-1 space-y-3 p-4">
          {filteredResults.length === 0 ? (
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
              const isImmediate = candidate.noticePeriod.toLowerCase().includes('immediate');

              return (
                <div
                  key={candidate.id}
                  className="group relative flex flex-col justify-between rounded-[12px] border border-border/70 bg-surface-1/95 p-3.5 backdrop-blur-md transition-all duration-200 ease-out shadow-[0_2px_8px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] select-none space-y-2.5"
                >
                  {/* Row 1: Header (Avatar, Name, Role/Company & Match Score) */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <CandidateAvatar name={candidate.name} size="md" />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-[13.5px] font-bold text-text tracking-tight transition-colors truncate">
                            {candidate.name}
                          </h4>
                          <SourceBadge source={candidate.source} variant="plain" />
                        </div>
                        <p className="text-[11.5px] text-text-muted truncate mt-0.5 font-normal">
                          <span>{candidate.currentRole}</span>
                          <span className="text-text-subtle/50 mx-1">·</span>
                          <span className="inline-flex items-center gap-1"><CompanyLogo company={candidate.currentCompany} className="h-3.5 w-3.5 rounded-[3px] shrink-0 shadow-2xs" /><span>{candidate.currentCompany}</span></span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-0.5 shrink-0 select-none">
                      <span className="font-mono text-[11.5px] font-bold text-accent tabular-nums bg-accent/10 px-2 py-0.5 rounded-[5px]">
                        {score}% Fit
                      </span>
                      {isSharedWithManager ? (
                        <span className="text-[10.5px] font-medium text-accent">
                          • In Manager Queue
                        </span>
                      ) : isManagerApproved ? (
                        <span className="text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                          • Shortlisted
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Row 2: Signature Unboxed Spec Row (Experience, CTC, Notice) */}
                  <div className="flex items-center justify-between text-[11.5px] pt-0.5 pb-0.5 text-text-muted">
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <span className="font-medium text-text tabular-nums">
                        {candidate.experienceYears}y exp
                      </span>
                      <span className="text-border-strong">•</span>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatCtc(candidate.expectedCtc)}
                      </span>
                      <span className="text-border-strong">•</span>
                      <span
                        className={
                          isImmediate
                            ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                            : 'text-text-muted'
                        }
                      >
                        {candidate.noticePeriod}
                      </span>
                    </div>

                    <span className="text-[10.5px] font-mono text-text-subtle shrink-0">
                      {matchedMustSkills.length}/{matchedMustSkills.length + missingMustSkills.length} skills verified
                    </span>
                  </div>

                  {/* Row 3: Competencies (Clean Unboxed Tags) */}
                  <div className="flex flex-wrap gap-1">
                    {matchedMustSkills.map((s) => (
                      <span
                        key={s}
                        className="text-[11px] font-medium text-text bg-surface-2 px-2 py-0.5 rounded-[4px] border border-border/60"
                      >
                        {s}
                      </span>
                    ))}
                    {missingMustSkills.map((s) => (
                      <span
                        key={s}
                        className="text-[11px] font-normal text-text-subtle/60 px-1.5 py-0.5 rounded-[4px] border border-border/40 border-dashed"
                        title="Skill not listed in candidate profile"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Row 4: Apple Intelligence Fit Summary */}
                  <div className="text-[11.5px] text-text-muted leading-relaxed pl-2.5 border-l-2 border-accent/40 space-y-1">
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
                          className="text-[10.5px] font-medium text-accent hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Suggested interview questions ({match.suggestedQuestions.length})</span>
                          <ChevronDown
                            className={cn(
                              'h-3 w-3 text-text-subtle transition-transform duration-150',
                              isQuestionsExpanded && 'rotate-180'
                            )}
                          />
                        </button>
                        {isQuestionsExpanded && (
                          <ul className="mt-1 space-y-1 text-[11px] text-text-muted list-disc pl-3">
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
                  <div className="border-t border-border/60 pt-2 flex items-center justify-between gap-2 text-[11px]">
                    {onInspectCandidate ? (
                      <button
                        type="button"
                        onClick={() => onInspectCandidate(candidate)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted hover:text-text transition-colors cursor-pointer"
                      >
                        <span>View dossier</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-2">
                      {isManagerApproved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Manager Approved</span>
                        </span>
                      ) : isSharedWithManager ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent">
                          <Clock className="h-3 w-3 animate-pulse" />
                          <span>In Manager Queue</span>
                        </span>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          disabled={assignCandidate.isPending}
                          onClick={() => handleShortlistCandidate(match)}
                          className="h-7 px-3 text-[11px] font-semibold rounded-[6px] shadow-2xs cursor-pointer"
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
