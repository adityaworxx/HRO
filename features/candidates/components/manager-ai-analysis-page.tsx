'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOpening } from '@/features/openings/hooks';
import { useCandidates, useRecordManagerDecision } from '@/features/candidates/hooks';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CandidateAvatar } from '@/components/hro/candidate-avatar';
import { CompanyLogo } from '@/components/hro/company-logo';
import type { Candidate, Opening } from '@/types/entities';
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
    } catch (err: any) {
      console.error('Failed to run AI resume analysis:', err);
      setError(err.message || 'Resume analysis encountered an error. Please try again.');
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
        comment: 'Approved by hiring manager via AI Resume Intelligence',
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
    toast.success('Interview question copied');
    setTimeout(() => setCopiedQuestionIdx(null), 2000);
  };

  if (loadingOpening || loadingCandidates) {
    return (
      <div className="space-y-5 w-full py-2">
        <Skeleton className="h-36 w-full rounded-[14px]" />
        <Skeleton className="h-32 w-full rounded-[14px]" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-[16px]" />
          <Skeleton className="h-64 w-full rounded-[16px]" />
        </div>
      </div>
    );
  }

  if (isError || !opening) {
    return (
      <div className="border border-border/70 bg-surface-1 rounded-[14px] p-10 text-center select-none space-y-3">
        <h3 className="text-text text-[16px] font-semibold">Requisition Not Found</h3>
        <p className="text-text-muted text-[13px]">
          Could not locate the requested requisition for AI Resume Intelligence.
        </p>
        <div className="pt-2">
          <Button asChild variant="outline" size="sm" className="rounded-[8px] text-[12px] font-medium h-8.5">
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
    <div className="space-y-5 w-full pb-20">
      {/* 1. Clean Requisition Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 select-none">
        <h1 className="text-text text-[20px] font-semibold tracking-tight">
          {opening.title}
        </h1>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={runAnalysis}
            disabled={isLoading || shortlistedCandidates.length === 0}
            className="border-border/70 bg-surface-1 hover:bg-surface-2 text-text rounded-[8px] h-8.5 px-3 text-[12px] font-medium select-none cursor-pointer"
          >
            {isLoading ? 'Analyzing...' : 'Re-analyze'}
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] h-8.5 px-3.5 text-[12px] font-semibold shadow-xs cursor-pointer select-none"
          >
            <Link href={`/shortlist?openingId=${opening.id}`}>
              Shortlist Queue ({shortlistedCandidates.length})
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Empty State if no candidates */}
      {shortlistedCandidates.length === 0 ? (
        <div className="border border-border/70 bg-surface-1 rounded-[16px] border-dashed py-16 text-center select-none shadow-2xs space-y-2.5">
          <h3 className="text-text text-[15px] font-semibold">
            No candidates shortlisted for {opening.title} yet
          </h3>
          <p className="text-text-muted text-[13px] max-w-md mx-auto">
            Candidates screened by talent acquisition will appear here for automated comparative analysis and interview synthesis.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2.5">
            <Button asChild variant="outline" size="sm" className="rounded-[8px] text-[12px] font-medium h-8.5">
              <Link href="/openings">View Openings</Link>
            </Button>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-[8px] text-[12px] font-medium h-8.5">
              <Link href="/candidates">Candidates Pipeline</Link>
            </Button>
          </div>
        </div>
      ) : isLoading ? (
        /* Loading Skeleton with Apple Intelligence Shimmer */
        <div className="space-y-4">
          <div className="border border-border/70 bg-surface-1 rounded-[16px] p-6 space-y-3 shadow-2xs">
            <div className="text-[11px] uppercase tracking-widest font-semibold text-text-subtle">
              AI Resume Intelligence in Progress
            </div>
            <div className="text-text text-[14px] font-medium">
              Cross-analyzing candidate resumes against requisition criteria...
            </div>
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-[16px]" />
            <Skeleton className="h-64 w-full rounded-[16px]" />
          </div>
        </div>
      ) : error ? (
        <div className="border border-border/70 bg-surface-1 rounded-[16px] p-6 space-y-2.5 select-none shadow-2xs">
          <div className="text-text text-[14px] font-semibold">Analysis Could Not Complete</div>
          <p className="text-text-muted text-[13px] leading-relaxed">{error}</p>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={runAnalysis}
              className="border-border/70 bg-surface-1 hover:bg-surface-2 text-text rounded-[8px] h-8.5 text-[12px] font-medium"
            >
              Retry Analysis
            </Button>
          </div>
        </div>
      ) : analysis ? (
        <>
          {/* 3. Executive Cohort Verdict Card (Apple Editorial Style) */}
          <div className="border border-border/70 bg-surface-1 rounded-[16px] p-5.5 shadow-2xs space-y-3 select-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-border/50 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-text-subtle block">
                  Cohort Synthesis
                </span>
                <h3 className="text-text text-[15px] font-semibold tracking-tight mt-0.5">
                  Executive Evaluation Verdict
                </h3>
              </div>

              {topPick && (
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="inline-flex items-center rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-[11.5px] font-medium text-blue-600 dark:text-blue-400 select-none">
                    Top Recommendation: {topPick.name}
                  </span>
                </div>
              )}
            </div>

            <p className="text-text text-[13.5px] leading-relaxed font-normal">
              {analysis.executiveSummary}
            </p>
          </div>

          {/* 4. Candidate Dossiers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[13px] text-text font-medium px-1">
              <span className="font-semibold text-text">
                Candidate Profiles & Tailored Interview Guides ({analysis.candidates.length})
              </span>
              <span className="text-text-muted text-[12px]">
                Prepared for hiring manager review
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
                  className="border border-border/70 bg-surface-1 rounded-[16px] border shadow-2xs p-5.5 space-y-4.5 select-none transition-all"
                >
                  {/* Top Header: Candidate Identity & AI Match Score / Forward Action */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-border/50 pb-4">
                    {/* Left: Identity (Avatar, Name, Role, Company, Verdict) */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <CandidateAvatar
                        name={candidate.name}
                        className="h-11 w-11 text-[14px] font-semibold rounded-full ring-2 ring-border/50 shrink-0"
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-text text-[16px] font-semibold tracking-tight">
                            {candidate.name}
                          </h3>

                          {isTopPick && (
                            <span className="inline-flex items-center rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 py-0.5 text-[10.5px] font-semibold text-blue-600 dark:text-blue-400 select-none">
                              Top Pick
                            </span>
                          )}

                          <span className="rounded-full border border-border/80 bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-text select-none">
                            {analyzed.verdict}
                          </span>
                        </div>

                        {/* Current Role & Company */}
                        <div className="text-text-muted text-[13px] flex items-center gap-1.5 pt-0.5">
                          <span className="text-text font-medium">{candidate.currentRole}</span>
                          <span className="text-text-subtle">at</span>
                          <span className="text-text inline-flex items-center gap-1.5 font-semibold">
                            <CompanyLogo
                              company={candidate.currentCompany}
                              className="h-3.5 w-3.5 rounded-[3px] shadow-2xs inline-block"
                            />
                            <span>{candidate.currentCompany}</span>
                          </span>
                        </div>

                        {/* Professional Vitals: Experience, Expected CTC, Notice Period */}
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-border/70 bg-surface-2/60 px-2.5 py-1 text-[11.5px] select-none">
                            <span className="text-text-subtle text-[10px] uppercase tracking-wider font-semibold">Exp</span>
                            <span className="text-text font-semibold font-sans tabular-nums">{candidate.experienceYears} Years</span>
                          </span>

                          <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-border/70 bg-surface-2/60 px-2.5 py-1 text-[11.5px] select-none">
                            <span className="text-text-subtle text-[10px] uppercase tracking-wider font-semibold">Expected CTC</span>
                            <span className="text-text font-semibold font-sans tabular-nums">{formatCtc(candidate.expectedCtc)}</span>
                          </span>

                          <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-border/70 bg-surface-2/60 px-2.5 py-1 text-[11.5px] select-none">
                            <span className="text-text-subtle text-[10px] uppercase tracking-wider font-semibold">Notice</span>
                            <span className="text-text font-semibold">{candidate.noticePeriod}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: AI Match Score & Forward to Interview Action */}
                    <div className="flex items-center gap-4.5 self-end md:self-auto shrink-0">
                      <div className="text-right">
                        <span className="text-text font-bold text-[22px] tabular-nums font-sans leading-none block">
                          {analyzed.fitScore}%
                        </span>
                        <span className="text-text-subtle block text-[10px] uppercase tracking-wider font-semibold mt-0.5">
                          Match Index
                        </span>
                      </div>

                      {isApproved ? (
                        <span className="text-emerald-600 dark:text-emerald-400 text-[12px] font-medium px-3 py-1.5 rounded-[8px] bg-emerald-500/10 border border-emerald-500/20 select-none">
                          Forwarded to Interview
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleForwardToInterview(candidate.id, candidate.name)}
                          disabled={recordDecision.isPending}
                          className="inline-flex cursor-pointer items-center justify-center rounded-[8px] border-0 bg-blue-600 px-4 py-2 text-[12.5px] font-semibold text-white shadow-xs transition-all select-none hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                        >
                          Forward to Interview
                        </button>
                      )}
                    </div>
                  </div>

                  {/* AI Synthesis Assessment Quote */}
                  <div className="rounded-[10px] border border-border/60 bg-surface-2/40 p-3.5 space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-text-subtle font-semibold">
                      AI Profile Assessment
                    </div>
                    <p className="text-text text-[13px] leading-relaxed font-normal">
                      &ldquo;{analyzed.summary}&rdquo;
                    </p>
                  </div>

                  {/* 2-Column: Strengths & Potential Gaps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Strengths */}
                    <div className="rounded-[10px] border border-border/60 bg-surface-2/20 p-4 space-y-2.5">
                      <div className="text-text font-semibold text-[12.5px] tracking-tight">
                        Verified Technical Strengths
                      </div>
                      <ul className="space-y-2">
                        {analyzed.strengths.map((str, i) => (
                          <li key={i} className="text-text text-[12.5px] leading-relaxed flex items-start gap-2.5">
                            <span className="text-text-subtle select-none mt-1 text-[11px]">&bull;</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Areas to Probe & Gaps */}
                    <div className="rounded-[10px] border border-border/60 bg-surface-2/20 p-4 space-y-2.5">
                      <div className="text-text font-semibold text-[12.5px] tracking-tight">
                        Areas to Probe & Potential Gaps
                      </div>
                      <ul className="space-y-2">
                        {analyzed.gaps.map((gap, i) => (
                          <li key={i} className="text-text text-[12.5px] leading-relaxed flex items-start gap-2.5">
                            <span className="text-text-subtle select-none mt-1 text-[11px]">&bull;</span>
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Tailored Technical Interview Guide */}
                  <div className="rounded-[10px] border border-border/60 bg-surface-2/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-text font-semibold text-[12.5px] tracking-tight">
                        Tailored Technical Interview Questions
                      </div>
                      <span className="text-text-muted text-[11px]">
                        Formulated specifically for {candidate.name}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {analyzed.interviewQuestions.map((q, idx) => {
                        const qKey = `${candidate.id}-q-${idx}`;
                        const isCopied = copiedQuestionIdx === qKey;
                        return (
                          <div
                            key={idx}
                            className="rounded-[8px] border border-border/60 bg-surface-1 p-3.5 flex items-start justify-between gap-3 text-[12.5px] shadow-2xs hover:border-border transition-colors"
                          >
                            <div className="text-text leading-relaxed font-normal flex items-start gap-2.5">
                              <span className="text-text-subtle font-mono text-[11px] font-semibold select-none pt-0.5">
                                0{idx + 1}
                              </span>
                              <span>{q}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyQuestion(q, qKey)}
                              className="text-text-muted hover:text-text text-[11px] font-medium h-6 px-2.5 rounded-[5px] border border-border/70 bg-surface-2/50 hover:bg-surface-2 select-none shrink-0 transition-colors cursor-pointer"
                              title="Copy question"
                            >
                              {isCopied ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        );
                      })}
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
