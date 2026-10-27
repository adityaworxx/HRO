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
import { Calendar, Clock, Phone, CheckCircle2, XCircle, PauseCircle, Building2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { cn } from '@/lib/utils';

function getCurrentLocalDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function InterviewsView() {
  const { data: candidates = [], isLoading } = useCandidates();
  const scheduleInterview = useScheduleInterview();
  const recordOutcome = useRecordInterviewOutcome();

  // All candidates in Interview stage
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [outcomeFilter, setOutcomeFilter] = React.useState<string>('all');
  const [modeFilter, setModeFilter] = React.useState<string>('all');
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const PAGE_SIZE = 6;

  // All candidates in Interview stage
  const interviewCandidates = React.useMemo(() => {
    return candidates.filter((c) => c.stage === 'Interview');
  }, [candidates]);

  // Reset pagination when search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, outcomeFilter, modeFilter, interviewCandidates.length]);

  // Filtered interviews
  const filteredInterviews = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return interviewCandidates.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.currentRole.toLowerCase().includes(q) ||
        c.currentCompany.toLowerCase().includes(q) ||
        (c.interviewNote && c.interviewNote.toLowerCase().includes(q));

      const matchesOutcome =
        outcomeFilter === 'all' ||
        (c.interviewOutcome ?? 'Pending') === outcomeFilter;

      const matchesMode =
        modeFilter === 'all' ||
        (c.interviewMode ?? 'Video') === modeFilter;

      return matchesSearch && matchesOutcome && matchesMode;
    });
  }, [interviewCandidates, searchQuery, outcomeFilter, modeFilter]);

  const totalPages = Math.ceil(filteredInterviews.length / PAGE_SIZE);
  const validPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  const startIndex = (validPage - 1) * PAGE_SIZE;
  const visibleInterviews = React.useMemo(() => {
    return filteredInterviews.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredInterviews, startIndex]);

  // Dialog states for scheduling
  const [selectedCandidate, setSelectedCandidate] = React.useState<Candidate | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = React.useState(false);
  const [outcomeModalOpen, setOutcomeModalOpen] = React.useState(false);
  const [interviewDate, setInterviewDate] = React.useState(getCurrentLocalDateTime());
  const [interviewMode, setInterviewMode] = React.useState<'Video' | 'Phone' | 'Onsite'>('Video');
  const [outcomeNote, setOutcomeNote] = React.useState('');

  const handleOpenSchedule = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setInterviewDate(candidate.interviewDate ? candidate.interviewDate.slice(0, 16) : getCurrentLocalDateTime());
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
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-2.5 sm:gap-3">
              <div className="relative w-full sm:max-w-xs">
                <Search className="text-text-subtle absolute top-2.5 left-3 h-4 w-4 pointer-events-none" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search interview roster..."
                  className="h-9 pl-9 text-[13px] bg-surface-2/40 border-border/70 hover:border-border focus:bg-surface-1 rounded-[8px] transition-all shadow-2xs w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Outcome Filter */}
                <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                  <SelectTrigger className="h-9 w-full sm:w-auto min-w-0 sm:min-w-[130px] gap-2 border-border/70 bg-surface-2/40 hover:bg-surface-2 text-text px-3 text-[13px] font-medium rounded-[8px] shadow-2xs">
                    <SelectValue placeholder="All Outcomes" />
                  </SelectTrigger>
                  <SelectContent align="start" className="min-w-[150px]">
                    <SelectItem value="all" className="text-[13px] py-1.5 min-h-[32px] rounded-[6px]">
                      All Outcomes
                    </SelectItem>
                    <SelectItem value="Pending" className="text-[13px] py-1.5 min-h-[32px] rounded-[6px]">
                      Pending
                    </SelectItem>
                    <SelectItem value="Selected" className="text-[13px] py-1.5 min-h-[32px] rounded-[6px]">
                      Selected
                    </SelectItem>
                    <SelectItem value="Rejected" className="text-[13px] py-1.5 min-h-[32px] rounded-[6px]">
                      Rejected
                    </SelectItem>
                    <SelectItem value="On Hold" className="text-[13px] py-1.5 min-h-[32px] rounded-[6px]">
                      On Hold
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Mode Filter */}
                <Select value={modeFilter} onValueChange={setModeFilter}>
                  <SelectTrigger className="h-9 w-full sm:w-auto min-w-0 sm:min-w-[120px] gap-2 border-border/70 bg-surface-2/40 hover:bg-surface-2 text-text px-3 text-[13px] font-medium rounded-[8px] shadow-2xs">
                    <SelectValue placeholder="All Modes" />
                  </SelectTrigger>
                  <SelectContent align="start" className="min-w-[140px]">
                    <SelectItem value="all" className="text-[13px] py-1.5 min-h-[32px] rounded-[6px]">
                      All Formats
                    </SelectItem>
                    <SelectItem value="Video" className="text-[13px] py-1.5 min-h-[32px] rounded-[6px]">
                      Video Call
                    </SelectItem>
                    <SelectItem value="Phone" className="text-[13px] py-1.5 min-h-[32px] rounded-[6px]">
                      Phone
                    </SelectItem>
                    <SelectItem value="Onsite" className="text-[13px] py-1.5 min-h-[32px] rounded-[6px]">
                      Onsite
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="text-text-muted text-[12px] font-medium">
              Showing <span className="text-text font-semibold">{filteredInterviews.length}</span> of {interviewCandidates.length}
            </div>
          </div>

          {filteredInterviews.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-border/70 p-8 text-center select-none">
              <p className="text-[13px] text-text-muted">No interviews match your filter criteria</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setOutcomeFilter('all');
                  setModeFilter('all');
                }}
                className="text-[12px] text-accent hover:underline mt-1.5 cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {visibleInterviews.map((candidate) => {
            const outcomeConfig = {
              Pending: {
                dot: 'bg-amber-500 animate-pulse',
                text: 'text-amber-600 dark:text-amber-400',
                label: 'Pending',
              },
              Selected: {
                dot: 'bg-emerald-500',
                text: 'text-emerald-600 dark:text-emerald-400',
                label: 'Selected',
              },
              Rejected: {
                dot: 'bg-rose-500',
                text: 'text-rose-600 dark:text-rose-400',
                label: 'Rejected',
              },
              'On Hold': {
                dot: 'bg-text-subtle',
                text: 'text-text-muted',
                label: 'On Hold',
              },
            }[candidate.interviewOutcome ?? 'Pending'] ?? {
              dot: 'bg-amber-500',
              text: 'text-amber-600 dark:text-amber-400',
              label: candidate.interviewOutcome,
            };

            const isPhone = candidate.interviewMode === 'Phone';
            const ModeIcon = isPhone ? Phone : VideoCameraIcon;

            return (
              <div
                key={candidate.id}
                className="group relative flex flex-col justify-between rounded-[8px] border border-border/80 bg-surface-1 p-3.5 shadow-2xs transition-all duration-150 hover:border-border-strong hover:shadow-xs select-none"
              >
                <div className="space-y-3">
                  {/* 1. Header: Avatar + Candidate Name & Role + Boxless Status Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Avatar className="h-9 w-9 shrink-0 border border-border/70 bg-surface-2 shadow-2xs">
                        <AvatarFallback className="text-[11.5px] font-semibold text-text bg-surface-2 tracking-wide">
                          {candidate.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[13.5px] font-semibold text-text tracking-tight leading-snug truncate">
                          {candidate.name}
                        </h4>
                        <p className="text-[11.5px] text-text-muted leading-tight truncate mt-0.5">
                          <span className="font-medium text-text">{candidate.currentRole}</span>
                          <span className="text-text-subtle/80 mx-1">at</span>
                          <span className="font-medium text-text">{candidate.currentCompany}</span>
                        </p>
                      </div>
                    </div>

                    {/* Boxless Status Badge (Consistent with Candidate and Opening Cards) */}
                    <div className="flex items-center gap-1.5 shrink-0 select-none">
                      <span className={cn('h-1.5 w-1.5 rounded-full', outcomeConfig.dot)} />
                      <span className={cn('text-[11.5px] font-semibold tabular-nums', outcomeConfig.text)}>
                        {outcomeConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* 2. Middle Body: Notes (Left) + Video Icon & Date/Time (Right side) */}
                  <div className="border-t border-border/60 pt-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Notes (Agenda word removed) */}
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <span className="text-[11px] font-medium text-text-subtle tracking-wide uppercase">
                        Notes
                      </span>
                      <p className="text-[12.5px] font-medium text-text leading-snug">
                        {candidate.interviewNote ? (
                          candidate.interviewNote
                        ) : (
                          <span className="text-text-subtle italic">No notes specified</span>
                        )}
                      </p>
                    </div>

                    {/* Video Icon & Time/Date on Right side */}
                    <div className="flex flex-col sm:items-end gap-1 shrink-0 sm:text-right">
                      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-text">
                        <ModeIcon className="h-3.5 w-3.5 text-accent stroke-[1.75]" />
                        <span>{candidate.interviewMode ?? 'Video'} Interview</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11.5px] font-normal text-text-muted">
                        <Clock className="h-3 w-3 text-text-subtle shrink-0 stroke-[1.75]" />
                        <span className="tabular-nums">
                          {candidate.interviewDate
                            ? new Date(candidate.interviewDate).toLocaleString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })
                            : 'Slot not assigned yet'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Bottom Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-border/60 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenSchedule(candidate)}
                    className="h-8 flex-1 gap-1.5 text-[12px] font-medium border-border/80 hover:bg-surface-2 rounded-[6px]"
                  >
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{candidate.interviewDate ? 'Reschedule' : 'Set Slot'}</span>
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenOutcome(candidate)}
                    className="h-8 flex-1 gap-1.5 text-[12px] font-medium rounded-[6px]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Record Outcome</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interviews Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-border/60 text-[12px] select-none">
            <span className="font-mono text-text-subtle text-[11.5px]">
              Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filteredInterviews.length)} of {filteredInterviews.length} interviews (Page {validPage} of {totalPages})
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={validPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-7 w-7 inline-flex items-center justify-center rounded-[6px] border border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Previous page"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 w-7 inline-flex items-center justify-center rounded-[6px] border border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Next page"
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    )}
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
              <DateTimePicker
                value={interviewDate}
                onChange={(val) => setInterviewDate(val)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-text text-[13px] font-medium">Interview Format</label>
              <Select
                value={interviewMode}
                onValueChange={(val) => setInterviewMode(val as 'Video' | 'Phone' | 'Onsite')}
              >
                <SelectTrigger className="border-border bg-surface-2 hover:bg-surface-3 text-text h-9 w-full rounded-[var(--radius-sm)] border px-3 text-[13px] font-medium">
                  <SelectValue placeholder="Select interview format" />
                </SelectTrigger>
                <SelectContent align="start" className="w-[var(--radix-select-trigger-width)] min-w-[240px]">
                  <SelectItem value="Video" icon={VideoCameraIcon} className="text-[13px] py-2 min-h-[36px] rounded-[6px]">
                    Google Meet / Video Call
                  </SelectItem>
                  <SelectItem value="Phone" icon={Phone} className="text-[13px] py-2 min-h-[36px] rounded-[6px]">
                    Phone Discussion
                  </SelectItem>
                  <SelectItem value="Onsite" icon={Building2} className="text-[13px] py-2 min-h-[36px] rounded-[6px]">
                    In-Person Technical Round
                  </SelectItem>
                </SelectContent>
              </Select>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
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
