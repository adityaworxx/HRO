'use client';

import * as React from 'react';
import { useCandidates, useRecordManagerDecision } from '../hooks';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/hro/status-badge';
import { EmptyState } from '@/components/hro/empty-state';
import { formatCtc } from '@/lib/format';
import { CheckCircle2, XCircle, FileText } from 'lucide-react';
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

  // Auto-select first pending candidate
  const activeCandidate = React.useMemo(() => {
    if (!pendingCandidates.length) return null;
    const found = pendingCandidates.find((c) => c.id === selectedId);
    return found ?? pendingCandidates[0] ?? null;
  }, [pendingCandidates, selectedId]);

  const handleDecision = (decision: 'Shortlisted' | 'Rejected') => {
    if (!activeCandidate) return;

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
          // Select next in list if available
          const nextIndex = pendingCandidates.findIndex((c) => c.id === activeCandidate.id);
          const nextCandidate = pendingCandidates[nextIndex + 1] ?? pendingCandidates[0];
          if (nextCandidate && nextCandidate.id !== activeCandidate.id) {
            setSelectedId(nextCandidate.id);
          } else {
            setSelectedId(null);
          }
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
          <span className="text-text-subtle text-[12px]">Select to review</span>
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
                className={`cursor-pointer rounded-[var(--radius-md)] border p-3.5 transition-all ${
                  isSelected
                    ? 'border-accent bg-accent-subtle/30'
                    : 'border-border bg-surface-1 hover:border-border-strong hover:bg-surface-2'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-[11px] font-bold">
                        {candidate.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-text text-[13px] font-semibold">{candidate.name}</h4>
                      <p className="text-text-muted text-[11px]">{candidate.currentRole}</p>
                    </div>
                  </div>
                  <Badge variant="default" className="text-[10px]">
                    {candidate.experienceYears}y exp
                  </Badge>
                </div>
                <div className="text-text-subtle border-border/60 mt-2.5 flex items-center justify-between border-t pt-2 text-[11px]">
                  <span>{candidate.currentCompany}</span>
                  <span className="text-text font-mono">{formatCtc(candidate.expectedCtc)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column (7/12): Active Candidate Assessment Panel */}
      <div className="lg:col-span-7">
        {activeCandidate && (
          <Card className="border-border">
            <CardHeader className="border-border border-b pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-accent/10 text-accent text-[16px] font-bold">
                      {activeCandidate.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-[18px]">{activeCandidate.name}</CardTitle>
                    <p className="text-text-muted text-[13px]">
                      {activeCandidate.currentRole} at {activeCandidate.currentCompany}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={activeCandidate.stage} type="candidate" />
                  <Badge variant="default" className="text-[11px]">
                    {activeCandidate.source}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 pt-5 text-[13px]">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="border-border bg-surface-2/40 rounded-lg border p-2.5">
                  <span className="text-text-subtle text-[11px]">Experience</span>
                  <p className="text-text font-semibold">{activeCandidate.experienceYears} Years</p>
                </div>
                <div className="border-border bg-surface-2/40 rounded-lg border p-2.5">
                  <span className="text-text-subtle text-[11px]">Expected CTC</span>
                  <p className="text-text font-mono font-semibold">
                    {formatCtc(activeCandidate.expectedCtc)}
                  </p>
                </div>
                <div className="border-border bg-surface-2/40 rounded-lg border p-2.5">
                  <span className="text-text-subtle text-[11px]">Notice Period</span>
                  <p className="text-text font-semibold">{activeCandidate.noticePeriod}</p>
                </div>
                <div className="border-border bg-surface-2/40 rounded-lg border p-2.5">
                  <span className="text-text-subtle text-[11px]">Contact</span>
                  <p className="text-text truncate font-semibold">{activeCandidate.phone}</p>
                </div>
              </div>

              {/* HR Screening Notes */}
              <div className="space-y-1.5">
                <h4 className="text-text flex items-center gap-1.5 font-semibold">
                  <FileText className="text-accent h-4 w-4" />
                  <span>HR Screening Notes & Initial Impression</span>
                </h4>
                <div className="border-border bg-surface-2/60 text-text rounded-md border p-3.5 leading-relaxed">
                  {activeCandidate.hrNotes ??
                    'Candidate exhibits deep technical comprehension in React ecosystems, strong team mentorship credentials, and verified compensation expectations.'}
                </div>
              </div>

              {/* Manager Feedback Input */}
              <div className="space-y-1.5">
                <label className="text-text text-[13px] font-semibold">
                  Manager Review Feedback (Optional)
                </label>
                <Textarea
                  rows={3}
                  value={managerComment}
                  onChange={(e) => setManagerComment(e.target.value)}
                  placeholder="Add specific topics or interviewers you would like for the technical round..."
                />
              </div>
            </CardContent>

            <CardFooter className="border-border flex gap-3 border-t pt-4">
              <Button
                variant="primary"
                onClick={() => handleDecision('Shortlisted')}
                loading={recordDecision.isPending}
                className="flex-1 gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Shortlist for Technical Interview</span>
              </Button>

              <Button
                variant="secondary"
                onClick={() => handleDecision('Rejected')}
                loading={recordDecision.isPending}
                className="flex-1 gap-2"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject Candidate</span>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
