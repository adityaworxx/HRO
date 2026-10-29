'use client';

import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecordManagerDecision } from '../hooks';
import type { Opening, Candidate } from '@/types/entities';
import {
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  Building2,
  Briefcase,
  Clock,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatCtc } from '@/lib/format';

interface CandidateAiAnalysis {
  id: string;
  name: string;
  verdict: 'Strong Hire' | 'Hire' | 'Borderline' | 'Do Not Hire';
  fitScore: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  interviewQuestions: string[];
}

interface AiAnalysisResponse {
  executiveSummary: string;
  recommendedCandidateId: string;
  candidates: CandidateAiAnalysis[];
}

interface ManagerAiAnalysisSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opening: Opening | null;
  candidates: Candidate[];
}

export function ManagerAiAnalysisSheet({
  open,
  onOpenChange,
  opening,
  candidates,
}: ManagerAiAnalysisSheetProps) {
  const recordDecision = useRecordManagerDecision();

  const [isLoading, setIsLoading] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<AiAnalysisResponse | null>(null);
  const [modelUsed, setModelUsed] = React.useState<string>('openai/gpt-oss-120b');
  const [error, setError] = React.useState<string | null>(null);
  const [expandedCandidateId, setExpandedCandidateId] = React.useState<string | null>(null);
  const [copiedQuestionIdx, setCopiedQuestionIdx] = React.useState<string | null>(null);
  const [approvedIds, setApprovedIds] = React.useState<Set<string>>(new Set());

  // Filter candidates specifically in 'Shared with Manager' & 'Pending' for this opening
  const shortlistedCandidates = React.useMemo(() => {
    if (!opening) return [];
    return candidates.filter(
      (c) =>
        c.openingId === opening.id &&
        c.stage === 'Shared with Manager' &&
        c.managerDecision === 'Pending'
    );
  }, [candidates, opening]);

  const runAnalysis = React.useCallback(async () => {
    if (!opening || shortlistedCandidates.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/analyze-resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opening,
          candidates: shortlistedCandidates,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || 'Failed to analyze candidates');
      }

      setAnalysis(json.data);
      if (json.modelUsed) setModelUsed(json.modelUsed);
      if (json.data?.recommendedCandidateId) {
        setExpandedCandidateId(json.data.recommendedCandidateId);
      }
    } catch (err: any) {
      console.error('Failed to run AI resume analysis:', err);
      setError(err.message || 'Analysis failed. Please check Groq API configuration.');
    } finally {
      setIsLoading(false);
    }
  }, [opening, shortlistedCandidates]);

  // Trigger analysis when opened with candidates and not yet analyzed
  React.useEffect(() => {
    if (open && opening && shortlistedCandidates.length > 0 && !analysis && !isLoading && !error) {
      void runAnalysis();
    }
  }, [open, opening, shortlistedCandidates.length, analysis, isLoading, error, runAnalysis]);

  // Reset when opening changes
  React.useEffect(() => {
    setAnalysis(null);
    setError(null);
    setApprovedIds(new Set());
  }, [opening?.id]);

  const handleForwardToInterview = (candidateId: string, candidateName: string) => {
    recordDecision.mutate(
      {
        id: candidateId,
        decision: 'Shortlisted',
        comment: 'Approved by hiring manager via Groq AI Resume Analysis',
      },
      {
        onSuccess: () => {
          setApprovedIds((prev) => new Set(prev).add(candidateId));
          toast.success(`${candidateName} forwarded to Interview scheduling queue!`);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to forward candidate');
        },
      }
    );
  };

  const handleCopyQuestion = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionIdx(key);
    toast.success('Interview question copied to clipboard');
    setTimeout(() => setCopiedQuestionIdx(null), 2000);
  };

  if (!opening) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl md:max-w-3xl"
      >
        {/* 1. Header */}
        <SheetHeader className="border-border/70 bg-surface-1/90 border-b px-6 py-4 select-none">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  <Sparkles className="h-3 w-3 stroke-[2.2]" />
                  <span>AI Resume Intelligence</span>
                </span>
                <span className="text-text-muted text-[11.5px] tabular-nums font-mono">
                  {modelUsed.replace('openai/', '')}
                </span>
              </div>
              <SheetTitle className="text-text mt-1 text-[17px] font-bold tracking-tight">
                {opening.title}
              </SheetTitle>
              <SheetDescription className="text-text-muted text-[12.5px]">
                {opening.department} &bull; {shortlistedCandidates.length}{' '}
                {shortlistedCandidates.length === 1 ? 'shortlisted candidate' : 'shortlisted candidates'} awaiting review
              </SheetDescription>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={runAnalysis}
              disabled={isLoading || shortlistedCandidates.length === 0}
              className="border-border/70 h-8 gap-1.5 text-[12px] font-medium"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
              <span>{isLoading ? 'Analyzing...' : 'Re-analyze'}</span>
            </Button>
          </div>
        </SheetHeader>

        {/* 2. Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {shortlistedCandidates.length === 0 ? (
            <div className="border-border/60 bg-surface-2/30 rounded-[12px] border border-dashed py-14 text-center select-none">
              <Sparkles className="text-text-subtle/40 mx-auto h-9 w-9 stroke-[1.5]" />
              <h3 className="text-text mt-3 text-[14px] font-semibold">
                No candidates shortlisted yet
              </h3>
              <p className="text-text-muted mt-1 text-[12.5px] max-w-sm mx-auto">
                HR has not forwarded any screened candidates for {opening.title} yet. Use the HR candidate matcher to screen Sourced talent and shortlist them.
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-4 py-2">
              <div className="border-border/70 bg-surface-2/40 rounded-[12px] border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-text text-[13px] font-semibold">
                    Synthesizing candidate profiles with {modelUsed}...
                  </span>
                </div>
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-3/6" />
              </div>

              <div className="space-y-3">
                <Skeleton className="h-32 w-full rounded-[12px]" />
                <Skeleton className="h-32 w-full rounded-[12px]" />
              </div>
            </div>
          ) : error ? (
            <div className="border-rose-500/30 bg-rose-500/10 rounded-[12px] border p-4 text-rose-700 dark:text-rose-400 select-none">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-[13px] font-bold">Analysis Encountered an Issue</span>
              </div>
              <p className="mt-1 text-[12px]">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={runAnalysis}
                className="mt-3 border-rose-500/40 text-rose-700 dark:text-rose-300 h-7.5 text-[11.5px]"
              >
                Try Again
              </Button>
            </div>
          ) : analysis ? (
            <>
              {/* Executive Summary Card */}
              <div className="border-border/80 bg-surface-2/60 relative overflow-hidden rounded-[12px] border p-4.5 space-y-3 select-none">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-500 stroke-[2]" />
                    <span className="text-text text-[13px] font-bold tracking-tight">
                      Executive Cohort Verdict
                    </span>
                  </div>
                  {analysis.recommendedCandidateId && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                      ★ Top Pick:{' '}
                      {shortlistedCandidates.find((c) => c.id === analysis.recommendedCandidateId)?.name || 'Selected'}
                    </span>
                  )}
                </div>

                <p className="text-text text-[13px] leading-relaxed">
                  {analysis.executiveSummary}
                </p>
              </div>

              {/* Candidate Breakdowns */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-[12px] font-medium text-text-muted">
                  <span>Candidate Dossiers & Tailored Interview Guides ({analysis.candidates.length})</span>
                  <span>Click to expand details</span>
                </div>

                {analysis.candidates.map((analyzed) => {
                  const candidate = shortlistedCandidates.find((c) => c.id === analyzed.id);
                  if (!candidate) return null;

                  const isExpanded = expandedCandidateId === analyzed.id;
                  const isTopPick = analysis.recommendedCandidateId === analyzed.id;
                  const isApproved = approvedIds.has(candidate.id);

                  return (
                    <div
                      key={analyzed.id}
                      className={cn(
                        'border-border/70 bg-surface-1 rounded-[12px] border transition-all duration-150',
                        isTopPick && 'border-blue-500/40 ring-1 ring-blue-500/20',
                        'hover:border-border-strong'
                      )}
                    >
                      {/* Candidate Card Header */}
                      <div
                        onClick={() =>
                          setExpandedCandidateId(isExpanded ? null : analyzed.id)
                        }
                        className="flex cursor-pointer items-start justify-between p-4 select-none"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-text text-[14.5px] font-semibold">
                                {candidate.name}
                              </h4>
                              {isTopPick && (
                                <span className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[10.5px] font-bold px-1.5 py-0.2 rounded-full">
                                  Top Recommendation
                                </span>
                              )}
                              <span
                                className={cn(
                                  'text-[11px] font-semibold px-2 py-0.5 rounded-full border',
                                  analyzed.verdict === 'Strong Hire' &&
                                    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
                                  analyzed.verdict === 'Hire' &&
                                    'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
                                  analyzed.verdict === 'Borderline' &&
                                    'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
                                  analyzed.verdict === 'Do Not Hire' &&
                                    'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                                )}
                              >
                                {analyzed.verdict}
                              </span>
                            </div>

                            <p className="text-text-muted mt-1 text-[12px] flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-text">
                                {candidate.currentRole} @ {candidate.currentCompany}
                              </span>
                              <span>&bull;</span>
                              <span>{candidate.experienceYears}y exp</span>
                              <span>&bull;</span>
                              <span>{formatCtc(candidate.expectedCtc)}</span>
                              <span>&bull;</span>
                              <span>{candidate.noticePeriod}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Fit Score Gauge */}
                          <div className="text-right">
                            <span className="text-text font-bold text-[14px] tabular-nums font-sans">
                              {analyzed.fitScore}%
                            </span>
                            <span className="text-text-subtle block text-[10.5px] uppercase tracking-wider font-semibold">
                              Fit Score
                            </span>
                          </div>

                          <button
                            type="button"
                            className="text-text-subtle hover:text-text p-1"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Section: Strengths, Gaps, and Questions */}
                      {isExpanded && (
                        <div className="border-border/60 bg-surface-2/30 border-t px-4.5 py-4 space-y-4">
                          {/* Summary text */}
                          <p className="text-text text-[12.5px] italic">
                            &ldquo;{analyzed.summary}&rdquo;
                          </p>

                          {/* Strengths & Gaps Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
                            {/* Strengths */}
                            <div className="border-border/60 bg-surface-1/70 rounded-[8px] border p-3 space-y-2">
                              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11.5px]">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Verified Technical Strengths</span>
                              </div>
                              <ul className="space-y-1.5 text-text">
                                {analyzed.strengths.map((str, i) => (
                                  <li key={i} className="flex items-start gap-1.5 text-[11.5px]">
                                    <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                                    <span>{str}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Gaps / Risks */}
                            <div className="border-border/60 bg-surface-1/70 rounded-[8px] border p-3 space-y-2">
                              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-[11.5px]">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                <span>Areas to Probe / Potential Gaps</span>
                              </div>
                              <ul className="space-y-1.5 text-text">
                                {analyzed.gaps.map((gap, i) => (
                                  <li key={i} className="flex items-start gap-1.5 text-[11.5px]">
                                    <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                                    <span>{gap}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Tailored Interview Questions */}
                          <div className="border-border/60 bg-surface-1 rounded-[8px] border p-3 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-text font-bold text-[12px] tracking-tight">
                                Tailored Technical Interview Questions
                              </span>
                              <span className="text-text-muted text-[11px]">
                                Crafted specifically for this profile
                              </span>
                            </div>

                            <div className="space-y-2">
                              {analyzed.interviewQuestions.map((q, idx) => {
                                const qKey = `${candidate.id}-q-${idx}`;
                                const isCopied = copiedQuestionIdx === qKey;
                                return (
                                  <div
                                    key={idx}
                                    className="border-border/40 bg-surface-2/40 flex items-start justify-between gap-2.5 rounded-[6px] border p-2 text-[12px]"
                                  >
                                    <span className="text-text font-medium leading-relaxed">
                                      <strong className="text-text-muted mr-1 font-semibold">
                                        Q{idx + 1}.
                                      </strong>
                                      {q}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyQuestion(q, qKey)}
                                      className="text-text-subtle hover:text-text cursor-pointer p-1 shrink-0 rounded transition-colors"
                                      title="Copy question"
                                    >
                                      {isCopied ? (
                                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                                      ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* 1-Click Action Bar: Forward to Interview */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-text-muted text-[11.5px]">
                              {isApproved ? 'Candidate sent to HR Interview Schedule queue' : 'Move candidate to Technical Interview'}
                            </span>

                            {isApproved ? (
                              <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 text-[12px] font-semibold border border-emerald-500/20">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Forwarded to Interview</span>
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleForwardToInterview(candidate.id, candidate.name)}
                                disabled={recordDecision.isPending}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-[6px] px-3.5 py-1.5 text-[12px] font-semibold shadow-2xs gap-1.5 transition-all active:scale-95 cursor-pointer"
                              >
                                <span>Forward to Interview</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

