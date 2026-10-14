'use client';

import * as React from 'react';
import { useCandidates, useScheduleInterview, useRecordInterviewOutcome } from '../hooks';
import type { Candidate } from '@/types/entities';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/hro/empty-state';
import { Calendar, Clock, Phone, CheckCircle2, XCircle, PauseCircle } from 'lucide-react';
import { VideoCameraIcon } from '@/components/ui/icons';
import { toast } from 'sonner';

export function InterviewsView() {
  const { data: candidates = [], isLoading } = useCandidates();
  const scheduleInterview = useScheduleInterview();
  const recordOutcome = useRecordInterviewOutcome();

  // All candidates in Interview stage
  const interviewCandidates = React.useMemo(() => {
    return candidates.filter((c) => c.stage === 'Interview');
  }, [candidates]);

  // Dialog states for scheduling
  const [selectedCandidate, setSelectedCandidate] = React.useState<Candidate | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = React.useState(false);
  const [outcomeModalOpen, setOutcomeModalOpen] = React.useState(false);
  const [interviewDate, setInterviewDate] = React.useState('2026-10-15T15:00');
  const [interviewMode, setInterviewMode] = React.useState<'Video' | 'Phone' | 'Onsite'>('Video');
  const [outcomeNote, setOutcomeNote] = React.useState('');

  const handleOpenSchedule = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setInterviewDate(candidate.interviewDate?.slice(0, 16) ?? '2026-10-15T15:00');
    setInterviewMode(candidate.interviewMode ?? 'Video');
    setScheduleModalOpen(true);
  };

  const handleOpenOutcome = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setOutcomeNote('');
    setOutcomeModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    scheduleInterview.mutate(
      {
        id: selectedCandidate.id,
        date: new Date(interviewDate).toISOString(),
        mode: interviewMode,
      },
      {
        onSuccess: () => {
          toast.success(`Interview scheduled with ${selectedCandidate.name}!`);
          setScheduleModalOpen(false);
        },
      }
    );
  };

  const handleSaveOutcome = (outcome: 'Selected' | 'Rejected' | 'On Hold') => {
    if (!selectedCandidate) return;

    recordOutcome.mutate(
      {
        id: selectedCandidate.id,
        outcome,
        note: outcomeNote.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`Outcome marked as ${outcome} for ${selectedCandidate.name}!`);
          setOutcomeModalOpen(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-text-muted text-[13px]">Loading interview roster...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border-border bg-surface-1 rounded-lg border p-4">
          <span className="text-text-muted text-[12px] font-medium">In Interview Stage</span>
          <p className="text-text mt-1 font-mono text-2xl font-bold">
            {interviewCandidates.length}
          </p>
        </div>
        <div className="border-border bg-surface-1 rounded-lg border p-4">
          <span className="text-text-muted text-[12px] font-medium">Scheduled Slots</span>
          <p className="text-text mt-1 font-mono text-2xl font-bold">
            {interviewCandidates.filter((c) => c.interviewDate).length}
          </p>
        </div>
        <div className="border-border bg-surface-1 rounded-lg border p-4">
          <span className="text-text-muted text-[12px] font-medium">Awaiting Scheduling</span>
          <p className="text-text mt-1 font-mono text-2xl font-bold">
            {interviewCandidates.filter((c) => !c.interviewDate).length}
          </p>
        </div>
      </div>

      {interviewCandidates.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Candidates in Interview Stage"
          description="Shortlist candidates from your review queue to begin scheduling technical assessments."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {interviewCandidates.map((candidate) => (
            <Card key={candidate.id} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-[12px] font-bold">
                      {candidate.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-[15px]">{candidate.name}</CardTitle>
                    <p className="text-text-muted text-[12px]">
                      {candidate.currentRole} at {candidate.currentCompany}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    candidate.interviewOutcome === 'Selected'
                      ? 'success'
                      : 'default'
                  }
                  className="text-[11px] font-medium"
                >
                  {candidate.interviewOutcome}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3 pt-1 text-[13px]">
                <div className="border-border bg-surface-2/40 space-y-1.5 rounded-md border p-3">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-text-muted flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {candidate.interviewDate
                          ? new Date(candidate.interviewDate).toLocaleString()
                          : 'Slot not assigned yet'}
                      </span>
                    </span>
                    <span
                      className="text-text-muted flex items-center"
                      title={`${candidate.interviewMode ?? 'Video'} Interview`}
                      aria-label={`${candidate.interviewMode ?? 'Video'} Interview`}
                    >
                      {candidate.interviewMode === 'Phone' ? (
                        <Phone className="h-4 w-4" />
                      ) : (
                        <VideoCameraIcon className="h-4 w-4" />
                      )}
                    </span>
                  </div>

                  {candidate.interviewNote && (
                    <p className="text-text-muted border-border/60 border-t pt-1 text-[12px]">
                      <strong>Notes:</strong> {candidate.interviewNote}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenSchedule(candidate)}
                    className="h-8 flex-1 gap-1 text-[12px]"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{candidate.interviewDate ? 'Reschedule' : 'Set Slot'}</span>
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenOutcome(candidate)}
                    className="h-8 flex-1 gap-1 text-[12px]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Record Outcome</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule Slot Dialog */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Technical Interview</DialogTitle>
            <DialogDescription>
              Assign interview slot and meeting format for {selectedCandidate?.name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSchedule} className="space-y-4 py-2 text-[13px]">
            <div className="space-y-1.5">
              <label className="text-text text-[13px] font-medium">Interview Date & Time</label>
              <Input
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-text text-[13px] font-medium">Interview Format</label>
              <select
                value={interviewMode}
                onChange={(e) => setInterviewMode(e.target.value as 'Video' | 'Phone' | 'Onsite')}
                className="border-border bg-surface-2 text-text h-9 w-full rounded border px-3 text-[13px]"
              >
                <option value="Video">Google Meet / Video Call</option>
                <option value="Phone">Phone Discussion</option>
                <option value="Onsite">In-Person Technical Round</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={scheduleInterview.isPending}>
                Save Interview Slot
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Outcome Dialog */}
      <Dialog open={outcomeModalOpen} onOpenChange={setOutcomeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Interview Evaluation</DialogTitle>
            <DialogDescription>
              Submit your technical evaluation and verdict for {selectedCandidate?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-[13px]">
            <div className="space-y-1.5">
              <label className="text-text text-[13px] font-medium">Evaluation Notes & Rubric</label>
              <Textarea
                rows={4}
                value={outcomeNote}
                onChange={(e) => setOutcomeNote(e.target.value)}
                placeholder="Candidate demonstrated clean coding habits, solid React fundamentals, and clear problem solving..."
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <Button
                variant="primary"
                onClick={() => handleSaveOutcome('Selected')}
                className="h-9 gap-1.5 text-[12px]"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Select & Advance</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleSaveOutcome('On Hold')}
                className="h-9 gap-1.5 text-[12px]"
              >
                <PauseCircle className="h-4 w-4" />
                <span>On Hold</span>
              </Button>

              <Button
                variant="destructive"
                onClick={() => handleSaveOutcome('Rejected')}
                className="h-9 gap-1.5 text-[12px]"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
