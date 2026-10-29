'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOpening } from '@/features/openings/hooks';
import { useCandidates, useRecordManagerDecision } from '@/features/candidates/hooks';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/hro/empty-state';
import { CandidateAvatar } from '@/components/hro/candidate-avatar';
import { CompanyLogo } from '@/components/hro/company-logo';
import { SourceBadge } from '@/components/hro/source-badge';
import { StatusBadge } from '@/components/hro/status-badge';
import type { Candidate, Opening } from '@/types/entities';
import {
  ArrowLeft,
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
  AlertCircle,
  FileText,
  UserCheck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatCtc, formatCtcRange } from '@/lib/format';

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

interface ManagerAiAnalysisPageProps {
  openingId: string;
}

export function ManagerAiAnalysisPage({ openingId }: ManagerAiAnalysisPageProps) {
  const router = useRouter();
  const { data: opening, isLoading: loadingOpening, isError } = useOpening(openingId);
  const { data: candidates = [], isLoading: loadingCandidates } = useCandidates();
  const recordDecision = useRecordManagerDecision();

  const [isLoading, setIsLoading] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<AiAnalysisResponse | null>(null);
  const [modelUsed, setModelUsed] = React.useState<string>('openai/gpt-oss-120b');
  const [error, setError] = React.useState<string | null>(null);
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
    } catch (err: any) {
      console.error('Failed to run AI resume analysis:', err);
      setError(err.message || 'Analysis failed. Please check Groq API configuration.');
    } finally {
      setIsLoading(false);
    }
  }, [opening, shortlistedCandidates]);

  // Trigger analysis when opening and candidates are available
  React.useEffect(() => {
    if (opening && shortlistedCandidates.length > 0 && !analysis && !isLoading && !error) {
      void runAnalysis();
    }
  }, [opening, shortlistedCandidates.length, analysis, isLoading, error, runAnalysis]);

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

  if (loadingOpening || loadingCandidates) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28 w-full rounded-[12px]" />
        <Skeleton className="h-44 w-full rounded-[12px]" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-[12px]" />
          <Skeleton className="h-64 w-full rounded-[12px]" />
        </div>
      </div>
    );
  }

  if (isError || !opening) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <EmptyState
          icon={AlertCircle}
          title="Requisition Not Found"
          description="Could not locate the requested requisition for AI Resume Review."
        />
        <div className="text-center mt-4">
          <Button asChild variant="outline">
            <Link href="/openings">Back to Openings</Link>
          </Button>
        </div>
      </div>
    );
  }

  const topPick = analysis?.recommendedCandidateId
    ? shortlistedCandidates.find((c) => c.id === analysis.recommendedCandidateId)
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Navigation Breadcrumb & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 select-none">
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-text-muted hover:text-text gap-1.5 -ml-2"
          >
            <Link href="/openings">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Openings</span>
            </Link>
          </Button>
          <span className="text-text-subtle/50 text-[13px]">&bull;</span>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-text-muted hover:text-text text-[12.5px]"
          >
            <Link href={`/openings/${opening.id}`}>Requisition Details</Link>
          </Button>
          <span className="text-text-subtle/50 text-[13px]">&bull;</span>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-text-muted hover:text-text text-[12.5px]"
          >
            <Link href={`/shortlist?openingId=${opening.id}`}>Shortlist Queue</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11.5px] font-semibold text-blue-600 dark:text-blue-400">
            <span>Powered by Groq {modelUsed.replace('openai/', '')}</span>
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={runAnalysis}
            disabled={isLoading || shortlistedCandidates.length === 0}
            className="border-border/80 h-8 gap-1.5 text-[12px] font-semibold select-none cursor-pointer"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            <span>{isLoading ? 'Analyzing...' : 'Re-analyze Resumes'}</span>
          </Button>
        </div>
      </div>

      {/* 2. Requisition Header Banner */}
      <div className="border-border/70 bg-surface-1 rounded-[12px] border p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-text text-[22px] font-bold tracking-tight">
                {opening.title}
              </h1>
              <StatusBadge status={opening.status} type="opening" />
            </div>
            <p className="text-text-muted text-[13px] flex items-center gap-2 flex-wrap">
              <span className="font-medium text-text">{opening.department}</span>
              <span>&bull;</span>
              <span>{opening.location}</span>
              <span>&bull;</span>
              <span>
                {opening.headcount} {opening.headcount === 1 ? 'position' : 'positions'}
              </span>
              <span>&bull;</span>
              <span className="font-sans tabular-nums">
                {formatCtcRange(opening.budgetRange.min, opening.budgetRange.max)}
              </span>
              <span>&bull;</span>
              <span>
                {opening.experienceRange.min}–{opening.experienceRange.max}y required exp
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              asChild
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[6px] h-8.5 px-3 text-[12px] font-semibold shadow-2xs cursor-pointer select-none"
            >
              <Link href={`/shortlist?openingId=${opening.id}`}>
                <span>View Shortlist Queue ({shortlistedCandidates.length})</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Must-Have Skills Strip */}
        {opening.mustHaveSkills && opening.mustHaveSkills.length > 0 && (
          <div className="border-border/50 mt-4 flex items-center gap-2 border-t pt-3 flex-wrap">
            <span className="text-text-muted text-[11.5px] font-medium">Must-have skills:</span>
            {opening.mustHaveSkills.map((skill) => (
              <span
                key={skill}
                className="bg-surface-2 text-text border border-border/70 rounded-[5px] px-2 py-0.5 text-[11.5px] font-medium select-none"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. Empty State if no candidates */}
      {shortlistedCandidates.length === 0 ? (
        <div className="border-border/70 bg-surface-1 rounded-[12px] border border-dashed py-16 text-center select-none shadow-2xs">
          <FileText className="text-text-subtle/40 mx-auto h-12 w-12 stroke-[1.5]" />
          <h3 className="text-text mt-4 text-[16px] font-semibold">
            No candidates shortlisted for {opening.title} yet
          </h3>
          <p className="text-text-muted mt-1.5 text-[13px] max-w-md mx-auto">
            HR has not forwarded any screened profiles for this opening yet. Once candidates in the Sourced stage are shortlisted, Groq AI Resume Intelligence will cross-analyze them here.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/openings">View Openings</Link>
            </Button>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/candidates">Go to Candidates Pipeline</Link>
            </Button>
          </div>
        </div>
      ) : isLoading ? (
        /* Loading Skeleton */
        <div className="space-y-4">
          <div className="border-border/70 bg-surface-1 rounded-[12px] border p-6 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-text text-[14px] font-semibold">
                Groq GPT-OSS 120B analyzing resumes and synthesizing interview guides...
              </span>
            </div>
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Skeleton className="h-56 w-full rounded-[12px]" />
            <Skeleton className="h-56 w-full rounded-[12px]" />
          </div>
        </div>
      ) : error ? (
        <div className="border-rose-500/30 bg-rose-500/10 rounded-[12px] border p-6 text-rose-700 dark:text-rose-400 select-none shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-[14px] font-bold">Analysis Could Not Complete</span>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={runAnalysis}
            className="mt-4 border-rose-500/40 text-rose-700 dark:text-rose-300 h-8 text-[12px] font-semibold"
          >
            Retry Analysis
          </Button>
        </div>
      ) : analysis ? (
        <>
          {/* 4. Executive Cohort Verdict Card */}
          <div className="border-border/80 bg-surface-1 relative overflow-hidden rounded-[12px] border p-6 shadow-2xs space-y-3.5 select-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="bg-amber-500/10 border border-amber-500/20 p-1.5 rounded-[8px]">
                  <Award className="h-4.5 w-4.5 text-amber-500 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-text text-[15px] font-bold tracking-tight">
                    Executive Cohort Verdict
                  </h3>
                  <p className="text-text-muted text-[11.5px]">
                    Comparative analysis across {shortlistedCandidates.length} candidate resumes
                  </p>
                </div>
              </div>

              {topPick && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[12px] font-bold text-amber-700 dark:text-amber-400">
                    ★ Recommended Pick: {topPick.name}
                  </span>
                </div>
              )}
            </div>

            <p className="text-text text-[13.5px] leading-relaxed">
              {analysis.executiveSummary}
            </p>
          </div>

          {/* 5. Detailed Candidate Dossiers Stack */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[13px] font-semibold text-text">
              <span>Candidate Assessments & Tailored Technical Guides ({analysis.candidates.length})</span>
              <span className="text-text-muted text-[12px] font-normal">
                Structured for hiring manager review
              </span>
            </div>

            {analysis.candidates.map((analyzed) => {
              const candidate = shortlistedCandidates.find((c) => c.id === analyzed.id);
              if (!candidate) return null;

              const isTopPick = analysis.recommendedCandidateId === analyzed.id;
              const isApproved = approvedIds.has(candidate.id);

              return (
                <div
                  key={analyzed.id}
                  className={cn(
                    'border-border/70 bg-surface-1 rounded-[12px] border shadow-2xs transition-all overflow-hidden',
                    isTopPick && 'border-blue-500/50 ring-1 ring-blue-500/20'
                  )}
                >
                  {/* Candidate Card Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 border-b border-border/50">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <CandidateAvatar
                        name={candidate.name}
                        size="md"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-text text-[16px] font-bold tracking-tight">
                            {candidate.name}
                          </h3>
                          {isTopPick && (
                            <span className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-[11px] font-bold px-2 py-0.5 rounded-full">
                              Top Pick
                            </span>
                          )}
                          <span
                            className={cn(
                              'text-[11.5px] font-bold px-2.5 py-0.5 rounded-full border',
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

                        <p className="text-text-muted mt-1 text-[12.5px] flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-text">
                            {candidate.currentRole} @ {candidate.currentCompany}
                          </span>
                          <span>&bull;</span>
                          <span className="font-sans tabular-nums">{candidate.experienceYears}y exp</span>
                          <span>&bull;</span>
                          <span className="font-sans tabular-nums">{formatCtc(candidate.expectedCtc)}</span>
                          <span>&bull;</span>
                          <span>{candidate.noticePeriod}</span>
                          <span>&bull;</span>
                          <SourceBadge source={candidate.source} />
                        </p>
                      </div>
                    </div>

                    {/* Fit Score Gauge & Actions */}
                    <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                      <div className="text-right">
                        <span className="text-text font-bold text-[18px] tabular-nums font-sans">
                          {analyzed.fitScore}%
                        </span>
                        <span className="text-text-subtle block text-[10px] uppercase tracking-wider font-bold">
                          Fit Score
                        </span>
                      </div>

                      {isApproved ? (
                        <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3.5 py-2 text-[12px] font-semibold border border-emerald-500/20 select-none">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Forwarded to Interview</span>
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleForwardToInterview(candidate.id, candidate.name)}
                          disabled={recordDecision.isPending}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-[6px] px-4 py-2 text-[12.5px] font-semibold shadow-2xs gap-1.5 transition-all active:scale-95 cursor-pointer select-none"
                        >
                          <span>Forward to Interview</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Candidate Content Body */}
                  <div className="p-5 space-y-4">
                    {/* Executive Assessment Quote */}
                    <p className="text-text text-[13px] italic bg-surface-2/40 border border-border/60 rounded-[8px] p-3 leading-relaxed">
                      &ldquo;{analyzed.summary}&rdquo;
                    </p>

                    {/* 2-Column: Strengths & Gaps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Technical Strengths */}
                      <div className="border-border/60 bg-surface-2/20 rounded-[8px] border p-4 space-y-2.5">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-[12px]">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Verified Technical Strengths</span>
                        </div>
                        <ul className="space-y-2 text-text">
                          {analyzed.strengths.map((str, i) => (
                            <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed">
                              <span className="text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Gaps / Risks */}
                      <div className="border-border/60 bg-surface-2/20 rounded-[8px] border p-4 space-y-2.5">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-[12px]">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Areas to Probe / Potential Gaps</span>
                        </div>
                        <ul className="space-y-2 text-text">
                          {analyzed.gaps.map((gap, i) => (
                            <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed">
                              <span className="text-amber-600 dark:text-amber-400 mt-0.5 font-bold">•</span>
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Tailored Technical Interview Questions */}
                    <div className="border-border/70 bg-surface-2/30 rounded-[10px] border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-text font-bold text-[12.5px] tracking-tight">
                          Tailored Technical Interview Questions
                        </span>
                        <span className="text-text-muted text-[11.5px]">
                          Crafted specifically for {candidate.name}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {analyzed.interviewQuestions.map((q, idx) => {
                          const qKey = `${candidate.id}-q-${idx}`;
                          const isCopied = copiedQuestionIdx === qKey;
                          return (
                            <div
                              key={idx}
                              className="border-border/60 bg-surface-1 flex items-start justify-between gap-3 rounded-[8px] border p-3 text-[12.5px] shadow-2xs"
                            >
                              <span className="text-text font-medium leading-relaxed">
                                <strong className="text-text-muted mr-1.5 font-bold">
                                  Q{idx + 1}.
                                </strong>
                                {q}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyQuestion(q, qKey)}
                                className="h-7 px-2 text-text-subtle hover:text-text shrink-0 gap-1 text-[11px] cursor-pointer"
                                title="Copy question to clipboard"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3.5 w-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
