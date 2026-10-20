'use client';

import * as React from 'react';
import type { Candidate } from '@/types/entities';
import type { CandidateStage } from '@/lib/domain/status-transitions';
import { getNextAllowedCandidateStages } from '@/lib/domain/status-transitions';
import { useUpdateCandidateStage, useRecordManagerDecision, useScheduleInterview } from '../hooks';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  XCircle,
  Calendar,
  Send,
  Building2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { VideoCameraIcon } from '@/components/ui/icons';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { toast } from 'sonner';
import { formatCtc } from '@/lib/format';

interface CandidateDetailSheetProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getCurrentLocalDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
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

  // Split name for First & Last Name field presentation
  const nameParts = candidate.name.trim().split(/\s+/);
  const firstName = nameParts[0] || candidate.name;
  const lastName = nameParts.slice(1).join(' ') || '—';

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
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg p-0 flex flex-col border-border bg-surface-1 shadow-2xl">
        {/* 1. TOP COVER BANNER (Abstract cloud & gradient mesh) */}
        <div className="relative h-28 sm:h-32 w-full shrink-0 overflow-hidden bg-gradient-to-r from-surface-3 via-surface-2 to-accent/20 border-b border-border/60">
          {/* Ambient radial lighting */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent" />
          <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-accent/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-surface-3/30 blur-xl pointer-events-none" />

          {/* Pill tag in banner */}
          <div className="absolute top-4 left-6 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-1/70 backdrop-blur-md border border-border/60 text-[10px] font-mono uppercase tracking-wider text-text-subtle font-semibold shadow-xs">
            <span>Candidate Dossier</span>
          </div>
        </div>

        {/* 2. OVERLAPPING AVATAR & QUICK ACTION ROW */}
        <div className="px-6 flex items-end justify-between -mt-10 sm:-mt-12 relative z-10">
          <div className="relative">
            <Avatar className="h-20 w-20 sm:h-22 sm:w-22 rounded-full border-4 border-surface-1 shadow-xl bg-surface-2 select-none ring-1 ring-border/50">
              <AvatarFallback className="bg-gradient-to-br from-surface-3 via-surface-2 to-surface-1 text-text text-[22px] font-bold tracking-tight">
                {candidate.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Active status indicator dot */}
            <span
              className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-[2.5px] border-surface-1 shadow-xs"
              title="Active Candidate Profile"
            />
          </div>

          {/* Top-Right Action Buttons */}
          <div className="flex items-center gap-1.5 pb-1">
            {candidate.profileUrl && (
              <Button
                variant="outline"
                size="icon"
                asChild
                className="h-8 w-8 text-text-subtle hover:text-text rounded-[8px] bg-surface-2/60 hover:bg-surface-2 border-border/70 shadow-2xs cursor-pointer"
                title="External Profile Link"
              >
                <a href={candidate.profileUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                navigator.clipboard?.writeText(`${candidate.name} <${candidate.email}>`);
                toast.success('Candidate contact copied to clipboard!');
              }}
              className="h-8 w-8 text-text-subtle hover:text-text rounded-[8px] bg-surface-2/60 hover:bg-surface-2 border-border/70 shadow-2xs cursor-pointer"
              title="Copy Candidate Contact"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* 3. IDENTITY: NAME, VERIFIED BADGE & HANDLE */}
        <div className="px-6 pt-3 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[20px] leading-tight font-bold text-text tracking-tight">
              {candidate.name}
            </h3>
            {/* Blue Verified Checkmark */}
            <span className="inline-flex text-blue-500 shrink-0" title="Verified Applicant Profile">
              <CheckCircle2 className="h-4.5 w-4.5 fill-blue-500 text-surface-1" />
            </span>
            <Badge
              variant="default"
              className="text-[10px] font-mono uppercase px-2 py-0.5 ml-auto shrink-0 bg-surface-2 text-text-muted border-border/70"
            >
              {candidate.stage}
            </Badge>
          </div>
          <p className="text-text-muted text-[13px] font-medium flex items-center gap-1.5 flex-wrap">
            <span className="text-text-subtle font-mono text-[12px]">
              @{candidate.name.toLowerCase().replace(/[^a-z0-9]/g, '')}
            </span>
            <span className="text-text-subtle">•</span>
            <span>
              {candidate.currentRole} at{' '}
              <strong className="text-text font-semibold">{candidate.currentCompany}</strong>
            </span>
          </p>
        </div>

        {/* 4. KEY STATS BAR (4-Column dotted divider layout with vertical dividers from reference) */}
        <div className="mx-6 mt-4 py-3 border-y border-dashed border-border/80 grid grid-cols-4 divide-x divide-border/60 text-left select-none">
          <div className="pr-2">
            <span className="text-[10px] sm:text-[11px] font-medium text-text-subtle uppercase tracking-wider block">
              Experience
            </span>
            <span className="text-[15px] sm:text-[16px] font-bold text-text tabular-nums font-mono mt-0.5 block">
              {candidate.experienceYears}y
            </span>
          </div>
          <div className="px-2">
            <span className="text-[10px] sm:text-[11px] font-medium text-text-subtle uppercase tracking-wider block">
              Notice
            </span>
            <span className="text-[15px] sm:text-[16px] font-bold text-text tabular-nums font-mono mt-0.5 block truncate">
              {candidate.noticePeriod}
            </span>
          </div>
          <div className="px-2">
            <span className="text-[10px] sm:text-[11px] font-medium text-text-subtle uppercase tracking-wider block">
              Expected
            </span>
            <span className="text-[15px] sm:text-[16px] font-bold text-text tabular-nums font-mono mt-0.5 block">
              {formatCtc(candidate.expectedCtc)}
            </span>
          </div>
          <div className="pl-2">
            <span className="text-[10px] sm:text-[11px] font-medium text-text-subtle uppercase tracking-wider block">
              Source
            </span>
            <span className="text-[15px] sm:text-[16px] font-bold text-text truncate mt-0.5 block">
              {candidate.source}
            </span>
          </div>
        </div>

        {/* 5. STRUCTURED PROFILE DETAILS (Input-styled tiles with dashed dividers) */}
        <div className="px-6 py-5 space-y-4 text-[13px]">
          {/* Field: Name */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-text flex items-center gap-1 select-none">
              <span>Name</span>
              <span className="text-accent">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-surface-2/60 border border-border/80 rounded-[8px] px-3.5 py-2 text-[13px] text-text font-medium select-none shadow-2xs">
                {firstName}
              </div>
              <div className="bg-surface-2/60 border border-border/80 rounded-[8px] px-3.5 py-2 text-[13px] text-text font-medium select-none shadow-2xs">
                {lastName}
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-border/80" />

          {/* Field: Email */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-text flex items-center gap-1 select-none">
              <span>Email</span>
              <span className="text-accent">*</span>
            </label>
            <div className="flex items-center gap-2.5 bg-surface-2/60 border border-border/80 rounded-[8px] px-3.5 py-2 text-[13px] text-text font-medium shadow-2xs">
              <Mail className="h-4 w-4 text-text-subtle shrink-0" />
              <span className="truncate">{candidate.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-blue-500 font-medium pt-0.5 select-none">
              <CheckCircle2 className="h-3.5 w-3.5 fill-blue-500 text-surface-1 shrink-0" />
              <span>Verified Candidate Contact</span>
            </div>
          </div>

          <div className="border-t border-dashed border-border/80" />

          {/* Field: Username / Candidate Slug (Matches reference bottom widget) */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-text flex items-center gap-1 select-none">
              <span>Candidate Handle</span>
              <span className="text-accent">*</span>
            </label>
            <div className="flex rounded-[8px] border border-border/80 bg-surface-2/60 shadow-2xs overflow-hidden">
              <div className="px-3 py-2 bg-surface-3/50 border-r border-border/80 text-[12px] font-mono text-text-muted select-none flex items-center">
                <span>hro.internal/@</span>
              </div>
              <div className="flex-1 px-3 py-2 text-[13px] text-text font-mono font-medium flex items-center justify-between">
                <span>{candidate.name.toLowerCase().replace(/[^a-z0-9]/g, '')}</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-border/80" />

          {/* Field: Role & Organization */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-text flex items-center gap-1 select-none">
              <span>Designation & Current Organization</span>
              <span className="text-accent">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2 bg-surface-2/60 border border-border/80 rounded-[8px] px-3.5 py-2 text-[13px] text-text font-medium shadow-2xs truncate">
                <Briefcase className="h-3.5 w-3.5 text-text-subtle shrink-0" />
                <span className="truncate">{candidate.currentRole}</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-2/60 border border-border/80 rounded-[8px] px-3.5 py-2 text-[13px] text-text font-medium shadow-2xs truncate">
                <Building2 className="h-3.5 w-3.5 text-text-subtle shrink-0" />
                <span className="truncate">{candidate.currentCompany}</span>
              </div>
            </div>
          </div>

          {/* Field: Phone */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-text flex items-center gap-1 select-none">
              <span>Phone Number</span>
            </label>
            <div className="flex items-center gap-2.5 bg-surface-2/60 border border-border/80 rounded-[8px] px-3.5 py-2 text-[13px] text-text font-medium shadow-2xs">
              <Phone className="h-3.5 w-3.5 text-text-subtle shrink-0" />
              <span>{candidate.phone}</span>
            </div>
          </div>

          {/* Field: HR Notes */}
          {candidate.hrNotes && (
            <>
              <div className="border-t border-dashed border-border/80" />
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-text select-none">
                  HR Screening Feedback
                </label>
                <div className="bg-surface-2/40 border border-border/80 rounded-[8px] p-3.5 text-[12px] text-text-muted leading-relaxed">
                  {candidate.hrNotes}
                </div>
              </div>
            </>
          )}

          {/* Field: Interview Schedule Form (If Stage is Interview) */}
          {candidate.stage === 'Interview' && (
            <>
              <div className="border-t border-dashed border-border/80" />
              <div className="border-border bg-surface-2/30 space-y-3 rounded-lg border p-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-text flex items-center gap-1.5 text-[13px] font-semibold">
                    <Calendar className="text-accent h-4 w-4" />
                    <span>Interview Schedule</span>
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                    if (!showScheduleForm && !interviewDate) {
                      setInterviewDate(candidate.interviewDate ? candidate.interviewDate.slice(0, 16) : getCurrentLocalDateTime());
                    }
                    setShowScheduleForm(!showScheduleForm);
                  }}
                    className="h-7 text-[12px] cursor-pointer"
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
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <strong className="text-text">Outcome:</strong>
                      <Badge variant="default" className="text-[11px] font-medium">
                        {candidate.interviewOutcome}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-text-muted text-[12px]">
                    Interview stage active, but no slot has been assigned yet.
                  </p>
                )}

                {showScheduleForm && (
                  <form onSubmit={handleConfirmSchedule} className="border-border space-y-3 border-t pt-2">
                    <div className="space-y-1">
                      <label className="text-text text-[12px] font-medium">Interview Date & Time</label>
                      <DateTimePicker value={interviewDate} onChange={(val) => setInterviewDate(val)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-text text-[12px] font-medium">Interview Mode</label>
                      <Select
                        value={interviewMode}
                        onValueChange={(val) => setInterviewMode(val as 'Video' | 'Phone' | 'Onsite')}
                      >
                        <SelectTrigger className="border-border bg-surface-2 hover:bg-surface-3 text-text h-8 w-full rounded-[var(--radius-sm)] border px-2.5 text-[12px] font-medium">
                          <SelectValue placeholder="Select interview format" />
                        </SelectTrigger>
                        <SelectContent align="start" className="w-[var(--radix-select-trigger-width)] min-w-[220px]">
                          <SelectItem
                            value="Video"
                            icon={VideoCameraIcon}
                            className="text-[12px] py-1.5 min-h-[32px] rounded-[6px]"
                          >
                            Google Meet / Video Call
                          </SelectItem>
                          <SelectItem
                            value="Phone"
                            icon={Phone}
                            className="text-[12px] py-1.5 min-h-[32px] rounded-[6px]"
                          >
                            Phone Discussion
                          </SelectItem>
                          <SelectItem
                            value="Onsite"
                            icon={Building2}
                            className="text-[12px] py-1.5 min-h-[32px] rounded-[6px]"
                          >
                            In-Person Technical Round
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" variant="primary" size="sm" className="h-8 w-full text-[12px]">
                      Confirm Interview Slot
                    </Button>
                  </form>
                )}
              </div>
            </>
          )}

          {/* 6. PIPELINE ADVANCEMENT BUTTONS */}
          <div className="border-t border-dashed border-border/80 pt-1" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[13px] font-semibold text-text">Advance Candidate Pipeline</h4>
              <span className="text-[11px] text-text-subtle">Recruitment Progression</span>
            </div>

            {/* Manager Decision (if in Shared with Manager) */}
            {candidate.stage === 'Shared with Manager' && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="primary"
                  className="flex-1 gap-1.5 h-9 text-[12px] rounded-[8px]"
                  onClick={() => handleManagerDecision('Shortlisted')}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Shortlist for Interview</span>
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 gap-1.5 h-9 text-[12px] rounded-[8px]"
                  onClick={() => handleManagerDecision('Rejected')}
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject</span>
                </Button>
              </div>
            )}

            {/* Allowed Next Stages */}
            {allowedTransitions.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-medium text-text-subtle">Available Next Stages:</span>
                <div className="flex flex-wrap gap-2">
                  {allowedTransitions.map((nextStage) => (
                    <Button
                      key={nextStage}
                      variant={nextStage === 'Rejected' ? 'outline' : 'secondary'}
                      size="sm"
                      onClick={() => handleStageTransition(nextStage)}
                      className={`gap-1.5 text-[12px] rounded-[8px] h-8 px-3 cursor-pointer ${
                        nextStage === 'Rejected'
                          ? 'text-danger border-border hover:bg-danger/10 hover:border-danger/30'
                          : 'border border-border/80 hover:border-accent/40 text-text'
                      }`}
                    >
                      <Send className="h-3 w-3 text-accent" />
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
