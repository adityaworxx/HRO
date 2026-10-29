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
import { SourceBadge } from '@/components/hro/source-badge';
import { StatusBadge } from '@/components/hro/status-badge';
import type { Candidate, Opening } from '@/types/entities';
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
      <div className="space-y-4 w-full py-1">
        <Skeleton className="h-28 w-full rounded-[12px]" />
        <Skeleton className="h-36 w-full rounded-[12px]" />
        <div className="space-y-4">
          <Skeleton className="h-56 w-full rounded-[12px]" />
          <Skeleton className="h-56 w-full rounded-[12px]" />
        </div>
      </div>
    );
  }

  if (isError || !opening) {
    return (
      <div className="border border-border/70 bg-surface-1 rounded-[12px] p-8 text-center select-none space-y-3">
        <h3 className="text-text text-[16px] font-semibold">Requisition Not Found</h3>
        <p className="text-text-muted text-[13px]">
          Could not locate the requested requisition for AI Resume Review.
        </p>
        <div className="pt-2">
          <Button asChild variant="outline" size="sm" className="rounded-[5px] text-[12px] font-medium h-8">
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
    <div className="space-y-4 w-full pb-16">
      {/* 1. Requisition Header Banner (No duplicate top breadcrumb header strip) */}
      <div className="border-border/70 bg-surface-1 rounded-[12px] border p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-text text-[20px] font-semibold tracking-tight">
                {opening.title}
              </h1>
              <span className="text-text text-[11px] font-medium select-none">
                {opening.status}
              </span>
            </div>
            <p className="text-text-muted text-[12.5px] flex items-center gap-2 flex-wrap">
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
              <span className="font-sans tabular-nums">
                {opening.experienceRange.min}–{opening.experienceRange.max}y required exp
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <span className="text-text-muted text-[11px] font-medium select-none pr-1">
              Powered by Groq {modelUsed.replace('openai/', '')}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={runAnalysis}
              disabled={isLoading || shortlistedCandidates.length === 0}
              className="border-border/70 bg-surface-1 hover:bg-surface-2 text-text rounded-[5px] h-8 px-3 text-[12px] font-medium select-none cursor-pointer"
            >
              {isLoading ? 'Analyzing...' : 'Re-analyze'}
            </Button>

            <Button
              asChild
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[5px] h-8 px-3 text-[12px] font-medium shadow-2xs cursor-pointer select-none"
            >
              <Link href={`/shortlist?openingId=${opening.id}`}>
                Shortlist Queue ({shortlistedCandidates.length})
              </Link>
            </Button>
          </div>
        </div>

        {/* Must-Have Skills Strip */}
        {opening.mustHaveSkills && opening.mustHaveSkills.length > 0 && (
          <div className="border-border/50 mt-3 flex items-center gap-2 border-t pt-2.5 flex-wrap">
            <span className="text-text-muted text-[11.5px] font-medium select-none">Must-have skills:</span>
            {opening.mustHaveSkills.map((skill) => (
              <span
                key={skill}
                className="bg-surface-2 text-text border border-border/70 rounded-[5px] px-2 py-0.5 text-[11px] font-medium select-none"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. Empty State if no candidates */}
      {shortlistedCandidates.length === 0 ? (
        <div className="border-border/70 bg-surface-1 rounded-[12px] border border-dashed py-14 text-center select-none shadow-2xs space-y-2">
          <h3 className="text-text text-[15px] font-semibold">
            No candidates shortlisted for {opening.title} yet
          </h3>
          <p className="text-text-muted text-[12.5px] max-w-md mx-auto">
            HR has not forwarded any screened profiles for this opening yet. Once candidates in the Sourced stage are shortlisted, Groq AI Resume Intelligence will cross-analyze them here.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2.5">
            <Button asChild variant="outline" size="sm" className="rounded-[5px] text-[12px] font-medium h-8">
              <Link href="/openings">View Openings</Link>
            </Button>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-[5px] text-[12px] font-medium h-8">
              <Link href="/candidates">Candidates Pipeline</Link>
            </Button>
          </div>
        </div>
      ) : isLoading ? (
        /* Loading Skeleton */
        <div className="space-y-4">
          <div className="border-border/70 bg-surface-1 rounded-[12px] border p-5 space-y-2.5 shadow-2xs">
            <span className="text-text text-[13px] font-semibold">
              Groq GPT-OSS 120B analyzing resumes and synthesizing interview guides...
            </span>
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-56 w-full rounded-[12px]" />
            <Skeleton className="h-56 w-full rounded-[12px]" />
          </div>
        </div>
      ) : error ? (
        <div className="border-border/70 bg-surface-1 rounded-[12px] border p-5 space-y-2 select-none shadow-2xs">
          <div className="text-text text-[14px] font-semibold">Analysis Could Not Complete</div>
          <p className="text-text-muted text-[12.5px] leading-relaxed">{error}</p>
          <div className="pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={runAnalysis}
              className="border-border/70 bg-surface-1 hover:bg-surface-2 text-text rounded-[5px] h-8 text-[12px] font-medium"
            >
              Retry Analysis
            </Button>
          </div>
        </div>
      ) : analysis ? (
        <>
          {/* 3. Executive Cohort Verdict Card (No trophy icon, no stars, standard typography) */}
          <div className="border-border/70 bg-surface-1 rounded-[12px] border p-4 shadow-2xs space-y-2.5 select-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/50 pb-2.5">
              <div>
                <h3 className="text-text text-[14px] font-semibold tracking-tight">
                  Executive Cohort Verdict
                </h3>
                <p className="text-text-muted text-[11.5px] font-normal">
                  Comparative analysis across {shortlistedCandidates.length} candidate resumes
                </p>
              </div>

              {topPick && (
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="text-text text-[11.5px] font-medium select-none">
                    Recommended Pick: {topPick.name}
                  </span>
                </div>
              )}
            </div>

            <p className="text-text text-[13px] leading-relaxed font-normal">
              {analysis.executiveSummary}
            </p>
          </div>

          {/* 4. Detailed Candidate Dossiers Stack */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[13px] font-semibold text-text">
              <span>Candidate Assessments & Tailored Guides ({analysis.candidates.length})</span>
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
                  className="border-border/70 bg-surface-1 rounded-[12px] border shadow-2xs p-4 space-y-3.5 select-none"
                >
                  {/* Candidate Header: Profile, Info, Fit Score, Forward Action */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-border/50 pb-3.5">
                    <div className="flex items-start gap-3 min-w-0">
                      <CandidateAvatar
                        name={candidate.name}
                        size="md"
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-text text-[15px] font-semibold tracking-tight">
                            {candidate.name}
                          </h4>
                          {isTopPick && (
                            <span className="text-text text-[11px] font-medium select-none">
                              Top Pick
                            </span>
                          )}
                          <span className="bg-surface-2 border border-border/70 text-text rounded-[5px] px-2 py-0.5 text-[11px] font-medium select-none">
                            {analyzed.verdict}
                          </span>
                        </div>

                        <p className="text-text-muted text-[12px] flex items-center gap-2 flex-wrap">
                          <CompanyLogo
                            company={candidate.currentCompany}
                            className="h-4 w-4 rounded-[3px] shadow-2xs"
                          />
                          <span className="font-medium text-text">
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

                    {/* Fit Score & Forward Button (Clean HRO styling, zero icons) */}
                    <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                      <div className="text-right">
                        <span className="text-text font-semibold text-[17px] tabular-nums font-sans">
                          {analyzed.fitScore}%
                        </span>
                        <span className="text-text-muted block text-[10px] uppercase tracking-wider font-medium">
                          Fit Score
                        </span>
                      </div>

                      {isApproved ? (
                        <span className="text-emerald-600 dark:text-emerald-400 text-[12px] font-medium px-2 py-1 select-none">
                          Forwarded to Interview
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleForwardToInterview(candidate.id, candidate.name)}
                          disabled={recordDecision.isPending}
                          className="inline-flex cursor-pointer items-center justify-center rounded-[5px] border-0 bg-blue-600 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-2xs transition-colors select-none hover:bg-blue-700 active:scale-95 active:bg-blue-800 disabled:opacity-50"
                        >
                          Forward to Interview
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary Quote */}
                  <div className="border border-border/60 bg-surface-2/40 rounded-[8px] p-3 text-text text-[12.5px] leading-relaxed font-normal">
                    &ldquo;{analyzed.summary}&rdquo;
                  </div>

                  {/* 2-Column: Strengths & Potential Gaps (Zero icons, clean bullet lists) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Strengths */}
                    <div className="border border-border/70 bg-surface-2/20 rounded-[8px] p-3.5 space-y-2">
                      <h5 className="text-text font-semibold text-[12px]">
                        Verified Technical Strengths
                      </h5>
                      <ul className="space-y-1.5">
                        {analyzed.strengths.map((str, i) => (
                          <li key={i} className="text-text text-[12px] leading-relaxed flex items-start gap-2">
                            <span className="text-text-muted select-none leading-none mt-1">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Areas to Probe & Gaps */}
                    <div className="border border-border/70 bg-surface-2/20 rounded-[8px] p-3.5 space-y-2">
                      <h5 className="text-text font-semibold text-[12px]">
                        Areas to Probe & Potential Gaps
                      </h5>
                      <ul className="space-y-1.5">
                        {analyzed.gaps.map((gap, i) => (
                          <li key={i} className="text-text text-[12px] leading-relaxed flex items-start gap-2">
                            <span className="text-text-muted select-none leading-none mt-1">•</span>
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Tailored Technical Interview Questions (Plain text copy button, zero icons) */}
                  <div className="border border-border/70 bg-surface-2/20 rounded-[8px] p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h5 className="text-text font-semibold text-[12px]">
                        Tailored Technical Interview Questions
                      </h5>
                      <span className="text-text-muted text-[11px] font-normal">
                        Crafted for {candidate.name}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {analyzed.interviewQuestions.map((q, idx) => {
                        const qKey = `${candidate.id}-q-${idx}`;
                        const isCopied = copiedQuestionIdx === qKey;
                        return (
                          <div
                            key={idx}
                            className="border border-border/60 bg-surface-1 rounded-[6px] p-3 flex items-start justify-between gap-3 text-[12px]"
                          >
                            <span className="text-text leading-relaxed font-normal">
                              <span className="text-text-muted font-medium mr-1.5 select-none">
                                Q{idx + 1}.
                              </span>
                              {q}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyQuestion(q, qKey)}
                              className="text-text-muted hover:text-text text-[11px] font-medium h-6 px-2 rounded-[4px] border border-border/60 bg-surface-2/40 hover:bg-surface-2 select-none shrink-0 transition-colors cursor-pointer"
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
