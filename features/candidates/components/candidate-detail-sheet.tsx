'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { Candidate } from '@/types/entities';
import type { CandidateStage } from '@/lib/domain/status-transitions';
import { getNextAllowedCandidateStages } from '@/lib/domain/status-transitions';
import { useUpdateCandidateStage, useRecordManagerDecision, useScheduleInterview } from '../hooks';
import { useUiStore } from '@/lib/store';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { SourceBadge } from '@/components/hro/source-badge';
import { CompanyLogo } from '@/components/hro/company-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  CandidateAvatar,
  AvatarColorPicker,
  useAvatarColorStore,
  getAvatarColorIndex,
} from '@/components/hro/candidate-avatar';
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
  const { role } = useUiStore();
  const isHr = role === 'hr';

  const updateStage = useUpdateCandidateStage();
  const recordDecision = useRecordManagerDecision();
  const scheduleInterview = useScheduleInterview();

  const [interviewDate, setInterviewDate] = React.useState('');
  const [interviewMode, setInterviewMode] = React.useState<'Video' | 'Phone' | 'Onsite'>('Video');
  const [scheduleNote, setScheduleNote] = React.useState('');
  const [showScheduleForm, setShowScheduleForm] = React.useState(false);
  const customColors = useAvatarColorStore((s) => s.customColors);
  const setColor = useAvatarColorStore((s) => s.setColor);

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
        note: scheduleNote.trim() ? scheduleNote.trim() : undefined,
      },
      {
        onSuccess: () => {
          toast.success(
            `Interview scheduled with ${candidate.name}! Hiring Manager has been notified.`
          );
          setShowScheduleForm(false);
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="border-border bg-surface-1 flex w-full flex-col overflow-y-auto p-0 shadow-2xl sm:max-w-lg"
      >
        {/* 1. TOP COVER BANNER (Abstract cloud & gradient mesh) */}
        <div className="from-surface-3 via-surface-2 to-accent/20 border-border/60 relative h-28 w-full shrink-0 overflow-hidden border-b bg-gradient-to-r sm:h-32">
          {/* Ambient radial lighting */}
          <div className="from-accent/10 absolute inset-0 bg-gradient-to-b to-transparent" />
          <div className="bg-accent/15 pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full blur-2xl" />
          <div className="bg-surface-3/30 pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full blur-xl" />

          {/* Pill tag in banner */}
          <div className="bg-surface-1/70 border-border/60 text-text-subtle absolute top-4 left-6 flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase shadow-xs backdrop-blur-md">
            <span>Candidate Dossier</span>
          </div>
        </div>

        {/* 2. OVERLAPPING AVATAR & QUICK ACTION ROW */}
        <div className="relative z-10 -mt-10 flex items-end justify-between px-6 sm:-mt-12">
          <div className="relative">
            <CandidateAvatar
              name={candidate.name}
              candidateId={candidate.id}
              className="border-surface-1 ring-border/50 h-20 w-20 rounded-full border-4 shadow-xl ring-1 sm:h-22 sm:w-22"
              fallbackClassName="text-[24px]"
            />
            {/* Active status indicator dot */}
            <span
              className="border-surface-1 absolute right-1 bottom-1 h-4 w-4 rounded-full border-[2.5px] bg-emerald-500 shadow-xs"
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
                className="text-text-subtle hover:text-text bg-surface-2/60 hover:bg-surface-2 border-border/70 h-8 w-8 cursor-pointer rounded-[8px] shadow-2xs"
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
              className="text-text-subtle hover:text-text bg-surface-2/60 hover:bg-surface-2 border-border/70 h-8 w-8 cursor-pointer rounded-[8px] shadow-2xs"
              title="Copy Candidate Contact"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* 3. IDENTITY: NAME, VERIFIED BADGE & HANDLE */}
        <div className="space-y-1 px-6 pt-3">
          <div className="flex items-center gap-2">
            <h3 className="text-text text-[20px] leading-tight font-bold tracking-tight">
              {candidate.name}
            </h3>
            {/* Blue Verified Checkmark */}
            <span className="inline-flex shrink-0 text-blue-500" title="Verified Applicant Profile">
              <CheckCircle2 className="text-surface-1 h-4.5 w-4.5 fill-blue-500" />
            </span>
            <Badge
              variant="default"
              className="bg-surface-2 text-text-muted border-border/70 ml-auto shrink-0 px-2 py-0.5 font-mono text-[10px] uppercase"
            >
              {candidate.stage}
            </Badge>
          </div>
          <p className="text-text-muted flex flex-wrap items-center gap-1.5 text-[13px] font-medium">
            <span className="text-text-subtle font-mono text-[12px]">
              @{candidate.name.toLowerCase().replace(/[^a-z0-9]/g, '')}
            </span>
            <span className="text-text-subtle">•</span>
            <span>
              {candidate.currentRole} at{' '}
              <span className="inline-flex items-center gap-1.5">
                <CompanyLogo
                  company={candidate.currentCompany}
                  className="inline-block h-4 w-4 rounded-[3px] shadow-2xs"
                />
                <strong className="text-text font-semibold">{candidate.currentCompany}</strong>
              </span>
            </span>
          </p>
        </div>

        {/* Avatar Color Accent Picker (Matches user design reference) */}
        <div className="mx-6 mt-3 pt-3 border-t border-border/40">
          <AvatarColorPicker
            value={
              typeof customColors[candidate.id] === 'number'
                ? customColors[candidate.id]
                : typeof customColors[candidate.name] === 'number'
                  ? customColors[candidate.name]
                  : getAvatarColorIndex(candidate.name)
            }
            onChange={(idx) => {
              setColor(candidate.id, idx);
              setColor(candidate.name, idx);
              toast.success(`Updated ${candidate.name}'s avatar accent!`);
            }}
          />
        </div>

        {/* 4. KEY STATS BAR (4-Column dotted divider layout with vertical dividers from reference) */}
        <div className="border-border/80 divide-border/60 mx-6 mt-4 grid grid-cols-4 divide-x border-y border-dashed py-3 text-left select-none">
          <div className="pr-2">
            <span className="text-text-subtle block text-[10px] font-medium tracking-wider uppercase sm:text-[11px]">
              Experience
            </span>
            <span className="text-text mt-0.5 block font-sans text-[15px] font-bold tabular-nums sm:text-[16px]">
              {candidate.experienceYears}y
            </span>
          </div>
          <div className="px-2">
            <span className="text-text-subtle block text-[10px] font-medium tracking-wider uppercase sm:text-[11px]">
              Notice
            </span>
            <span className="text-text mt-0.5 block truncate font-sans text-[15px] font-bold tabular-nums sm:text-[16px]">
              {candidate.noticePeriod}
            </span>
          </div>
          <div className="px-2">
            <span className="text-text-subtle block text-[10px] font-medium tracking-wider uppercase sm:text-[11px]">
              Expected
            </span>
            <span className="text-text mt-0.5 block font-sans text-[15px] font-bold tabular-nums sm:text-[16px]">
              {formatCtc(candidate.expectedCtc)}
            </span>
          </div>
          <div className="pl-2">
            <span className="text-text-subtle block text-[10px] font-medium tracking-wider uppercase sm:text-[11px]">
              Source
            </span>
            <div className="mt-1">
              <SourceBadge source={candidate.source} />
            </div>
          </div>
        </div>

        {/* 5. STRUCTURED PROFILE DETAILS (Input-styled tiles with dashed dividers) */}
        <div className="space-y-4 px-6 py-5 text-[13px]">
          {/* Field: Name */}
          <div className="space-y-1.5">
            <label className="text-text flex items-center gap-1 text-[12px] font-semibold select-none">
              <span>Name</span>
              <span className="text-accent">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-surface-2/60 border-border/80 text-text rounded-[8px] border px-3.5 py-2 text-[13px] font-medium shadow-2xs select-none">
                {firstName}
              </div>
              <div className="bg-surface-2/60 border-border/80 text-text rounded-[8px] border px-3.5 py-2 text-[13px] font-medium shadow-2xs select-none">
                {lastName}
              </div>
            </div>
          </div>

          <div className="border-border/80 border-t border-dashed" />

          {/* Field: Email */}
          <div className="space-y-1.5">
            <label className="text-text flex items-center gap-1 text-[12px] font-semibold select-none">
              <span>Email</span>
              <span className="text-accent">*</span>
            </label>
            <div className="bg-surface-2/60 border-border/80 text-text flex items-center gap-2.5 rounded-[8px] border px-3.5 py-2 text-[13px] font-medium shadow-2xs">
              <Mail className="text-text-subtle h-4 w-4 shrink-0" />
              <span className="truncate">{candidate.email}</span>
            </div>
            <div className="flex items-center gap-1.5 pt-0.5 text-[11px] font-medium text-blue-500 select-none">
              <CheckCircle2 className="text-surface-1 h-3.5 w-3.5 shrink-0 fill-blue-500" />
              <span>Verified Candidate Contact</span>
            </div>
          </div>

          <div className="border-border/80 border-t border-dashed" />

          {/* Field: Username / Candidate Slug (Matches reference bottom widget) */}
          <div className="space-y-1.5">
            <label className="text-text flex items-center gap-1 text-[12px] font-semibold select-none">
              <span>Candidate Handle</span>
              <span className="text-accent">*</span>
            </label>
            <div className="border-border/80 bg-surface-2/60 flex overflow-hidden rounded-[8px] border shadow-2xs">
              <div className="bg-surface-3/50 border-border/80 text-text-muted flex items-center border-r px-3 py-2 font-mono text-[12px] select-none">
                <span>hro.internal/@</span>
              </div>
              <div className="text-text flex flex-1 items-center justify-between px-3 py-2 font-mono text-[13px] font-medium">
                <span>{candidate.name.toLowerCase().replace(/[^a-z0-9]/g, '')}</span>
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="border-border/80 border-t border-dashed" />

          {/* Field: Role & Organization */}
          <div className="space-y-1.5">
            <label className="text-text flex items-center gap-1 text-[12px] font-semibold select-none">
              <span>Designation & Current Organization</span>
              <span className="text-accent">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="bg-surface-2/60 border-border/80 text-text flex items-center gap-2 truncate rounded-[8px] border px-3.5 py-2 text-[13px] font-medium shadow-2xs">
                <Briefcase className="text-text-subtle h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{candidate.currentRole}</span>
              </div>
              <div className="bg-surface-2/60 border-border/80 text-text flex items-center gap-2 truncate rounded-[8px] border px-3.5 py-2 text-[13px] font-medium shadow-2xs">
                <CompanyLogo
                  company={candidate.currentCompany}
                  className="h-4 w-4 shrink-0 rounded-[3px] shadow-2xs"
                />
                <span className="truncate">{candidate.currentCompany}</span>
              </div>
            </div>
          </div>

          {/* Field: Phone */}
          <div className="space-y-1.5">
            <label className="text-text flex items-center gap-1 text-[12px] font-semibold select-none">
              <span>Phone Number</span>
            </label>
            <div className="bg-surface-2/60 border-border/80 text-text flex items-center gap-2.5 rounded-[8px] border px-3.5 py-2 text-[13px] font-medium shadow-2xs">
              <Phone className="text-text-subtle h-3.5 w-3.5 shrink-0" />
              <span>{candidate.phone}</span>
            </div>
          </div>

          {/* Field: HR Notes */}
          {candidate.hrNotes && (
            <>
              <div className="border-border/80 border-t border-dashed" />
              <div className="space-y-1.5">
                <label className="text-text text-[12px] font-semibold select-none">
                  HR Screening Feedback
                </label>
                <div className="bg-surface-2/40 border-border/80 text-text-muted rounded-[8px] border p-3.5 text-[12px] leading-relaxed">
                  {candidate.hrNotes}
                </div>
              </div>
            </>
          )}

          {/* Field: Interview Schedule Form (If Stage is Interview) */}
          {candidate.stage === 'Interview' && (
            <>
              <div className="border-border/80 border-t border-dashed" />
              <div className="border-border bg-surface-2/30 space-y-3 rounded-lg border p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-text flex items-center gap-1.5 text-[13px] font-semibold">
                      <Calendar className="text-accent h-4 w-4" />
                      <span>Interview Schedule</span>
                    </h4>
                    {candidate.interviewDate ? (
                      <span className="text-text text-[11.5px] font-medium select-none">
                        Slot Confirmed
                      </span>
                    ) : (
                      <span className="text-text text-[11.5px] font-medium select-none">
                        {isHr ? 'Needs HR Call' : 'HR Scheduling'}
                      </span>
                    )}
                  </div>
                  {isHr ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!showScheduleForm && !interviewDate) {
                          setInterviewDate(
                            candidate.interviewDate
                              ? candidate.interviewDate.slice(0, 16)
                              : getCurrentLocalDateTime()
                          );
                        }
                        setShowScheduleForm(!showScheduleForm);
                      }}
                      className="h-7 cursor-pointer text-[12px]"
                    >
                      {candidate.interviewDate ? 'Reschedule Slot' : 'Call & Set Slot'}
                    </Button>
                  ) : (
                    <span className="text-text-subtle text-[11px] font-medium">
                      {candidate.interviewDate ? 'Scheduled by HR' : 'HR Scheduling in Progress'}
                    </span>
                  )}
                </div>

                {candidate.interviewDate ? (
                  <div className="text-text-muted space-y-1 text-[12px]">
                    <p>
                      <strong className="text-text">Date & Time:</strong>{' '}
                      {new Date(candidate.interviewDate).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                    <p>
                      <strong className="text-text">Mode:</strong>{' '}
                      {candidate.interviewMode ?? 'Video'}
                    </p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <strong className="text-text font-medium">Outcome:</strong>
                      <span className="text-text text-[12px] font-medium select-none">
                        {candidate.interviewOutcome}
                      </span>
                    </div>
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
                      <DateTimePicker
                        value={interviewDate}
                        onChange={(val) => setInterviewDate(val)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-text text-[12px] font-medium">Interview Mode</label>
                      <Select
                        value={interviewMode}
                        onValueChange={(val) =>
                          setInterviewMode(val as 'Video' | 'Phone' | 'Onsite')
                        }
                      >
                        <SelectTrigger className="border-border bg-surface-2 hover:bg-surface-3 text-text h-8 w-full rounded-[var(--radius-sm)] border px-2.5 text-[12px] font-medium">
                          <SelectValue placeholder="Select interview format" />
                        </SelectTrigger>
                        <SelectContent
                          align="start"
                          className="w-[var(--radix-select-trigger-width)] min-w-[220px]"
                        >
                          <SelectItem
                            value="Video"
                            icon={VideoCameraIcon}
                            className="min-h-[32px] rounded-[6px] py-1.5 text-[12px]"
                          >
                            Google Meet / Video Call
                          </SelectItem>
                          <SelectItem
                            value="Phone"
                            icon={Phone}
                            className="min-h-[32px] rounded-[6px] py-1.5 text-[12px]"
                          >
                            Phone Discussion
                          </SelectItem>
                          <SelectItem
                            value="Onsite"
                            icon={Building2}
                            className="min-h-[32px] rounded-[6px] py-1.5 text-[12px]"
                          >
                            In-Person Technical Round
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-text text-[12px] font-medium">
                        Coordination Notes (Optional)
                      </label>
                      <Input
                        value={scheduleNote}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setScheduleNote(e.target.value)
                        }
                        placeholder="e.g. Candidate confirmed 11 AM slot. Link: meet.google.com/..."
                        className="h-8 text-[12px]"
                      />
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
            </>
          )}

          {/* 6. PIPELINE ADVANCEMENT BUTTONS */}
          <div className="border-border/80 border-t border-dashed pt-1" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-text text-[13px] font-semibold">Advance Candidate Pipeline</h4>
              <span className="text-text-subtle text-[11px]">Recruitment Progression</span>
            </div>

            {/* Manager Decision (if in Shared with Manager) */}
            {candidate.stage === 'Shared with Manager' && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="primary"
                  className="h-9 flex-1 gap-1.5 rounded-[8px] text-[12px]"
                  onClick={() => handleManagerDecision('Shortlisted')}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Shortlist for Interview</span>
                </Button>
                <Button
                  variant="secondary"
                  className="h-9 flex-1 gap-1.5 rounded-[8px] text-[12px]"
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
                <span className="text-text-subtle text-[11px] font-medium">
                  Available Next Stages:
                </span>
                <div className="flex flex-wrap gap-2">
                  {allowedTransitions.map((nextStage) => (
                    <Button
                      key={nextStage}
                      variant={nextStage === 'Rejected' ? 'outline' : 'secondary'}
                      size="sm"
                      onClick={() => handleStageTransition(nextStage)}
                      className={`h-8 cursor-pointer gap-1.5 rounded-[8px] px-3 text-[12px] ${
                        nextStage === 'Rejected'
                          ? 'text-danger border-border hover:bg-danger/10 hover:border-danger/30'
                          : 'border-border/80 hover:border-accent/40 text-text border'
                      }`}
                    >
                      <Send className="text-accent h-3 w-3" />
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
