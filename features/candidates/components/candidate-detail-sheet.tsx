'use client';

import * as React from 'react';
import type { Candidate } from '@/types/entities';
import type { CandidateStage } from '@/lib/domain/status-transitions';
import { getNextAllowedCandidateStages } from '@/lib/domain/status-transitions';
import { useUpdateCandidateStage, useRecordManagerDecision, useScheduleInterview } from '../hooks';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { StatusBadge } from '@/components/hro/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCtc } from '@/lib/format';

interface CandidateDetailSheetProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CandidateDetailSheet({ candidate, open, onOpenChange }: CandidateDetailSheetProps) {
  const updateStage = useUpdateCandidateStage();
  const recordDecision = useRecordManagerDecision();
  const scheduleInterview = useScheduleInterview();

  const [interviewDate, setInterviewDate] = React.useState('');
  const [interviewMode, setInterviewMode] = React.useState<'Video' | 'Phone' | 'Onsite'>('Video');
  const [showScheduleForm, setShowScheduleForm] = React.useState(false);

  if (!candidate) return null;

  const allowedTransitions = getNextAllowedCandidateStages(candidate.stage);

  const handleStageTransition = (nextStage: CandidateStage) => {
    updateStage.mutate(
      { id: candidate.id, stage: nextStage },
      {
        onSuccess: () => {
          toast.success(`Advanced ${candidate.name} to "${nextStage}"!`);
          onOpenChange(false);
        },
      }
    );
  };

  const handleManagerDecision = (decision: 'Shortlisted' | 'Rejected') => {
    recordDecision.mutate(
      { id: candidate.id, decision },
      {
        onSuccess: () => {
          toast.success(`Manager decision recorded: ${decision}`);
          onOpenChange(false);
        },
      }
    );
  };

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewDate) {
      toast.error('Please select an interview date and time.');
      return;
    }

    scheduleInterview.mutate(
      {
        id: candidate.id,
        date: new Date(interviewDate).toISOString(),
        mode: interviewMode,
      },
      {
        onSuccess: () => {
          toast.success(`Technical interview scheduled with ${candidate.name}!`);
          setShowScheduleForm(false);
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-border border-b pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarFallback className="bg-accent/10 text-accent text-[14px] font-bold">
                {candidate.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-[18px]">{candidate.name}</SheetTitle>
              <div className="flex items-center gap-2 pt-0.5">
                <StatusBadge status={candidate.stage} type="candidate" />
                <Badge variant="default" className="text-[11px]">
                  {candidate.source}
                </Badge>
              </div>
            </div>
          </div>
          <SheetDescription className="pt-1 text-[12px]">
            Requisition Applicant Profile & Stage History
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 py-5 text-[13px]">
          {/* Quick Contact & Role Summary */}
          <div className="border-border bg-surface-2/60 space-y-2.5 rounded-lg border p-3.5">
            <div className="flex items-center justify-between">
              <div className="text-text flex items-center gap-2">
                <Briefcase className="text-accent h-4 w-4" />
                <span className="font-semibold">{candidate.currentRole}</span>
              </div>
              <span className="text-text-muted">{candidate.currentCompany}</span>
            </div>

            <div className="border-border/70 text-text-muted grid grid-cols-2 gap-2 border-t pt-1 text-[12px]">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Exp: {candidate.experienceYears} Years</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                <span>Expected: {formatCtc(candidate.expectedCtc)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Notice: {candidate.noticePeriod}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{candidate.email}</span>
              </div>
            </div>

            <div className="text-text-muted flex items-center gap-1.5 text-[12px]">
              <Phone className="h-3.5 w-3.5" />
              <span>{candidate.phone}</span>
            </div>
          </div>

          {/* HR Screening Notes */}
          {candidate.hrNotes && (
            <div className="space-y-1.5">
              <h4 className="text-text text-[13px] font-semibold">HR Screening Feedback</h4>
              <p className="border-border bg-surface-2/40 text-text rounded-md border p-3 text-[13px] leading-relaxed">
                {candidate.hrNotes}
              </p>
            </div>
          )}

          {/* Interview Details if in Interview Stage */}
          {candidate.stage === 'Interview' && (
            <div className="border-border bg-surface-2/30 space-y-3 rounded-lg border p-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-text flex items-center gap-1.5 text-[13px] font-semibold">
                  <Calendar className="text-accent h-4 w-4" />
                  <span>Interview Schedule</span>
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScheduleForm(!showScheduleForm)}
                  className="h-7 text-[12px]"
                >
                  {candidate.interviewDate ? 'Reschedule' : 'Set Slot'}
                </Button>
              </div>

              {candidate.interviewDate ? (
                <div className="text-text-muted space-y-1 text-[12px]">
                  <p>
                    <strong className="text-text">Date & Time:</strong>{' '}
                    {new Date(candidate.interviewDate).toLocaleString()}
                  </p>
                  <p>
                    <strong className="text-text">Mode:</strong>{' '}
                    {candidate.interviewMode ?? 'Video'}
                  </p>
                  <p>
                    <strong className="text-text">Outcome:</strong>{' '}
                    <Badge variant="accent" className="text-[11px]">
                      {candidate.interviewOutcome}
                    </Badge>
                  </p>
                </div>
              ) : (
                <p className="text-text-muted text-[12px]">
                  Interview stage active, but no slot has been assigned yet.
                </p>
              )}

              {showScheduleForm && (
                <form
                  onSubmit={handleConfirmSchedule}
                  className="border-border space-y-3 border-t pt-2"
                >
                  <div className="space-y-1">
                    <label className="text-text text-[12px] font-medium">
                      Interview Date & Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-text text-[12px] font-medium">Interview Mode</label>
                    <select
                      value={interviewMode}
                      onChange={(e) =>
                        setInterviewMode(e.target.value as 'Video' | 'Phone' | 'Onsite')
                      }
                      className="border-border bg-surface-2 text-text h-8 w-full rounded border px-2.5 text-[12px]"
                    >
                      <option value="Video">Video Call</option>
                      <option value="Phone">Phone Call</option>
                      <option value="Onsite">Onsite Discussion</option>
                    </select>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="h-8 w-full text-[12px]"
                  >
                    Confirm Interview Slot
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Quick Actions & Progression */}
          <div className="border-border space-y-3 border-t pt-2">
            <h4 className="text-text text-[13px] font-semibold">Advance Candidate Pipeline</h4>

            {candidate.stage === 'Shared with Manager' && (
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  className="flex-1 gap-1.5"
                  onClick={() => handleManagerDecision('Shortlisted')}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Shortlist for Interview</span>
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-1.5"
                  onClick={() => handleManagerDecision('Rejected')}
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject</span>
                </Button>
              </div>
            )}

            {allowedTransitions.length > 0 && (
              <div className="space-y-2">
                <span className="text-text-muted text-[12px]">Available Next Stages:</span>
                <div className="flex flex-wrap gap-2">
                  {allowedTransitions.map((nextStage) => (
                    <Button
                      key={nextStage}
                      variant={nextStage === 'Rejected' ? 'outline' : 'secondary'}
                      size="sm"
                      onClick={() => handleStageTransition(nextStage)}
                      className={`gap-1.5 text-[12px] ${
                        nextStage === 'Rejected' ? 'text-danger hover:bg-danger/10' : ''
                      }`}
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Advance to {nextStage}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
