'use client';

import * as React from 'react';
import { useCandidates, useRecordManagerDecision } from '../hooks';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SourceBadge } from '@/components/hro/source-badge';
import { EmptyState } from '@/components/hro/empty-state';
import { formatCtc } from '@/lib/format';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, FileText, Briefcase, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export function ShortlistReview() {
  const { data: candidates = [], isLoading } = useCandidates();
  const recordDecision = useRecordManagerDecision();

  // Candidates in 'Shared with Manager' stage or pending decision
  const pendingCandidates = React.useMemo(() => {
    return candidates.filter(
      (c) => c.stage === 'Shared with Manager' && c.managerDecision === 'Pending'
    );
  }, [candidates]);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [managerComment, setManagerComment] = React.useState<string>('');
  const [pendingDecision, setPendingDecision] = React.useState<'Shortlisted' | 'Rejected' | null>(
    null
  );

  // Auto-select first pending candidate
  const activeCandidate = React.useMemo(() => {
    if (!pendingCandidates.length) return null;
    const found = pendingCandidates.find((c) => c.id === selectedId);
    return found ?? pendingCandidates[0] ?? null;
  }, [pendingCandidates, selectedId]);

  const handleDecision = (decision: 'Shortlisted' | 'Rejected') => {
    if (!activeCandidate) return;

    setPendingDecision(decision);

    recordDecision.mutate(
      {
        id: activeCandidate.id,
        decision,
        comment: managerComment.trim() || undefined,
      },
      {
        onSuccess: () => {
          if (decision === 'Shortlisted') {
            toast.success(`${activeCandidate.name} shortlisted for technical interview!`);
          } else {
            toast.error(`${activeCandidate.name} has been marked as rejected.`);
          }
          setManagerComment('');
          // Select next in remaining list
          const remaining = pendingCandidates.filter((c) => c.id !== activeCandidate.id);
          setSelectedId(remaining[0]?.id ?? null);
          setPendingDecision(null);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to record decision');
          setPendingDecision(null);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-text-muted text-[13px]">Loading candidate review queue...</p>
      </div>
    );
  }

  if (pendingCandidates.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="Review Queue Clear"
        description="Great job! You have completed reviewing all candidates shared by the talent acquisition team."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Column (5/12): Queue List */}
      <div className="space-y-3 lg:col-span-5">
        <div className="flex items-center justify-between pb-1">
          <span className="text-text text-[13px] font-semibold">
            Pending Queue ({pendingCandidates.length})
          </span>
        </div>

        <div className="space-y-2.5">
          {pendingCandidates.map((candidate) => {
            const isSelected = activeCandidate?.id === candidate.id;

            return (
              <div
                key={candidate.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(candidate.id)}
                className={cn(
                  'cursor-pointer rounded-[8px] border p-3.5 transition-all duration-150 shadow-2xs select-none',
                  isSelected
                    ? 'border-accent bg-accent-subtle/25 shadow-xs ring-1 ring-accent'
                    : 'border-border bg-surface-1 hover:border-border-strong hover:bg-surface-2/60'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-surface-2 text-text text-[11px] font-bold">
                        {candidate.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h4 className="text-text truncate text-[13.5px] font-semibold tracking-tight">
                        {candidate.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[12px] font-medium text-text min-w-0">
                        <Briefcase className="h-3 w-3 shrink-0 text-text-subtle stroke-[1.75]" />
                        <span className="truncate">{candidate.currentRole}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-text shrink-0 text-[11.5px] font-semibold tabular-nums select-none">
                    {candidate.experienceYears} {candidate.experienceYears === 1 ? 'year' : 'years'} experience
                  </span>
                </div>
                <div className="border-border/60 mt-2.5 flex items-center justify-between border-t pt-2 text-[12px]">
                  <div className="flex items-center gap-1.5 min-w-0 text-text-muted font-medium">
                    <Building2 className="h-3 w-3 shrink-0 text-text-subtle/80 stroke-[1.75]" />
                    <span className="truncate">{candidate.currentCompany}</span>
                  </div>
                  <span className="text-text font-mono font-semibold tabular-nums">
                    {formatCtc(candidate.expectedCtc)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column (7/12): Active Candidate Assessment Panel */}
      <div className="lg:col-span-7">
        {activeCandidate && (
          <Card className="border-border bg-surface-1 rounded-[10px] shadow-2xs">
            <CardHeader className="border-border border-b pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarFallback className="bg-accent-subtle text-accent text-[15px] font-bold">
                      {activeCandidate.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-text text-[18px] font-bold tracking-tight">
                      {activeCandidate.name}
                    </CardTitle>
                    <div className="flex items-center gap-2.5 text-[13px] text-text-muted mt-1">
                      <div className="flex items-center gap-1.5 text-text font-medium">
                        <Briefcase className="h-3.5 w-3.5 shrink-0 text-text-subtle stroke-[1.75]" />
                        <span>{activeCandidate.currentRole}</span>
                      </div>
                      <span className="text-text-subtle">at</span>
                      <div className="flex items-center gap-1.5 text-text font-semibold">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-text-subtle/80 stroke-[1.75]" />
                        <span>{activeCandidate.currentCompany}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <SourceBadge source={activeCandidate.source} variant="plain" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 pt-5 text-[13px]">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="border-border/70 bg-surface-2/30 rounded-[8px] border p-2.5 transition-colors">
                  <span className="text-text-subtle text-[11px] font-medium uppercase tracking-wider">
                    Experience
                  </span>
                  <p className="text-text mt-0.5 text-[13px] font-semibold tracking-tight">
                    {activeCandidate.experienceYears} Years Experience
                  </p>
                </div>
                <div className="border-border/70 bg-surface-2/30 rounded-[8px] border p-2.5 transition-colors">
                  <span className="text-text-subtle text-[11px] font-medium uppercase tracking-wider">
                    Expected CTC
                  </span>
                  <p className="text-text mt-0.5 font-mono text-[13px] font-semibold tracking-tight">
                    {formatCtc(activeCandidate.expectedCtc)}
                  </p>
                </div>
                <div className="border-border/70 bg-surface-2/30 rounded-[8px] border p-2.5 transition-colors">
                  <span className="text-text-subtle text-[11px] font-medium uppercase tracking-wider">
                    Notice Period
                  </span>
                  <p className="text-text mt-0.5 text-[13px] font-semibold tracking-tight">
                    {activeCandidate.noticePeriod}
                  </p>
                </div>
                <div className="border-border/70 bg-surface-2/30 rounded-[8px] border p-2.5 transition-colors">
                  <span className="text-text-subtle text-[11px] font-medium uppercase tracking-wider">
                    Contact
                  </span>
                  <p className="text-text mt-0.5 truncate text-[13px] font-semibold tracking-tight">
                    {activeCandidate.phone}
                  </p>
                </div>
              </div>

              {/* HR Screening Notes */}
              <div className="space-y-1.5">
                <h4 className="text-text flex items-center gap-1.5 text-[12.5px] font-semibold">
                  <FileText className="text-accent h-4 w-4 shrink-0" />
                  <span>HR Screening Notes & Initial Impression</span>
                </h4>
                <div className="border-border/60 bg-surface-2/25 text-text rounded-[8px] border p-3.5 text-[12.5px] leading-relaxed">
                  {activeCandidate.hrNotes ??
                    'Candidate exhibits deep technical comprehension in React ecosystems, strong team mentorship credentials, and verified compensation expectations.'}
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
                  placeholder="Add specific topics or interviewers you would like for the technical round..."
                  className="rounded-[8px] text-[12.5px]"
                />
              </div>
            </CardContent>

            <CardFooter className="border-border flex flex-col gap-2.5 border-t pt-4 sm:flex-row sm:gap-3">
              <Button
                variant="primary"
                onClick={() => handleDecision('Shortlisted')}
                loading={pendingDecision === 'Shortlisted'}
                disabled={recordDecision.isPending}
                className="h-9.5 w-full cursor-pointer gap-2 rounded-[8px] text-[12.5px] font-semibold shadow-2xs sm:flex-1"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  {pendingDecision === 'Shortlisted'
                    ? 'Shortlisting...'
                    : 'Shortlist for Technical Interview'}
                </span>
              </Button>

              <Button
                variant="secondary"
                onClick={() => handleDecision('Rejected')}
                loading={pendingDecision === 'Rejected'}
                disabled={recordDecision.isPending}
                className="h-9.5 w-full cursor-pointer gap-2 rounded-[8px] text-[12.5px] font-semibold shadow-2xs hover:border-danger/40 hover:text-danger sm:flex-1"
              >
                <XCircle className="h-4 w-4 shrink-0" />
                <span>{pendingDecision === 'Rejected' ? 'Rejecting...' : 'Reject Candidate'}</span>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
