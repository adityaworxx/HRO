'use client';

import * as React from 'react';

import { useCandidates, useScheduleInterview, useRecordInterviewOutcome } from '../hooks';

import { useOpenings } from '@/features/openings/hooks';

import { useUiStore } from '@/lib/store';

import type { Candidate } from '@/types/entities';

import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';

import { Input } from '@/components/ui/input';

import { Textarea } from '@/components/ui/textarea';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { CandidateAvatar } from '@/components/hro/candidate-avatar';
import { CompanyLogo } from '@/components/hro/company-logo';

import { CandidateDetailSheet } from './candidate-detail-sheet';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import { EmptyState } from '@/components/hro/empty-state';

import {
  Calendar,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserCheck,
  Briefcase,
  AlertCircle,
  FileText,
  ExternalLink,
  X,
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

import { cn } from '@/lib/utils';

import { formatCtc, formatRoleTitle } from '@/lib/format';

function getCurrentLocalDateTime(): string {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, '0');

  const day = String(now.getDate()).padStart(2, '0');

  const hours = String(now.getHours()).padStart(2, '0');

  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatInterviewDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);

    if (isNaN(d.getTime())) return isoString;

    return d.toLocaleString(undefined, {
      weekday: 'short',

      month: 'short',

      day: 'numeric',

      year: 'numeric',

      hour: 'numeric',

      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function InterviewsView() {
  const { role } = useUiStore();

  const isHr = role === 'hr';

  const { data: candidates = [], isLoading } = useCandidates();

  const { data: openings = [] } = useOpenings();

  const scheduleInterview = useScheduleInterview();

  const recordOutcome = useRecordInterviewOutcome();

  // Openings map for quick lookup

  const openingsMap = React.useMemo(() => {
    return new Map(openings.map((o) => [o.id, o]));
  }, [openings]);

  // Candidates in Interview stage

  const interviewCandidates = React.useMemo(() => {
    return candidates.filter((c) => c.stage === 'Interview');
  }, [candidates]);

  // Count unscheduled vs scheduled

  const unscheduledCandidates = React.useMemo(
    () => interviewCandidates.filter((c) => !c.interviewDate),

    [interviewCandidates]
  );

  const scheduledCandidates = React.useMemo(
    () => interviewCandidates.filter((c) => Boolean(c.interviewDate)),

    [interviewCandidates]
  );

  // Filters & State

  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const [statusTab, setStatusTab] = React.useState<'all' | 'needs-scheduling' | 'scheduled'>('all');

  const [departmentFilter, setDepartmentFilter] = React.useState<string>('all');

  const [outcomeFilter, setOutcomeFilter] = React.useState<string>('all');

  const [modeFilter, setModeFilter] = React.useState<string>('all');

  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const PAGE_SIZE = 6;

  // Extract all unique departments present across interview candidates

  const departments = React.useMemo(() => {
    const set = new Set<string>();

    interviewCandidates.forEach((c) => {
      const op = openingsMap.get(c.openingId);

      if (op?.department) set.add(op.department);
    });

    return Array.from(set).sort();
  }, [interviewCandidates, openingsMap]);

  // Reset pagination when search or filters change

  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    statusTab,
    departmentFilter,
    outcomeFilter,
    modeFilter,
    interviewCandidates.length,
  ]);

  // Filtered interviews

  const filteredInterviews = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return interviewCandidates.filter((c) => {
      // Tab filter

      if (statusTab === 'needs-scheduling' && c.interviewDate) return false;

      if (statusTab === 'scheduled' && !c.interviewDate) return false;

      const opening = openingsMap.get(c.openingId);

      // Department filter

      if (departmentFilter !== 'all' && opening?.department !== departmentFilter) {
        return false;
      }

      // Text search

      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.currentRole.toLowerCase().includes(q) ||
        c.currentCompany.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (opening && opening.title.toLowerCase().includes(q)) ||
        (opening && opening.department.toLowerCase().includes(q)) ||
        (c.interviewNote && c.interviewNote.toLowerCase().includes(q));

      const matchesOutcome =
        outcomeFilter === 'all' || (c.interviewOutcome ?? 'Pending') === outcomeFilter;

      const matchesMode = modeFilter === 'all' || (c.interviewMode ?? 'Video') === modeFilter;

      return matchesSearch && matchesOutcome && matchesMode;
    });
  }, [
    interviewCandidates,
    statusTab,
    departmentFilter,
    searchQuery,
    outcomeFilter,
    modeFilter,
    openingsMap,
  ]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    statusTab !== 'all' ||
    departmentFilter !== 'all' ||
    outcomeFilter !== 'all' ||
    modeFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');

    setStatusTab('all');

    setDepartmentFilter('all');

    setOutcomeFilter('all');

    setModeFilter('all');
  };

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

  const [scheduleNote, setScheduleNote] = React.useState('');

  const [outcomeNote, setOutcomeNote] = React.useState('');

  // Candidate Profile Drawer state

  const [detailCandidate, setDetailCandidate] = React.useState<Candidate | null>(null);

  const [sheetOpen, setSheetOpen] = React.useState(false);

  const handleOpenDetail = (candidate: Candidate) => {
    setDetailCandidate(candidate);

    setSheetOpen(true);
  };

  const handleOpenSchedule = (candidate: Candidate) => {
    setSelectedCandidate(candidate);

    setInterviewDate(
      candidate.interviewDate ? candidate.interviewDate.slice(0, 16) : getCurrentLocalDateTime()
    );

    setInterviewMode(candidate.interviewMode ?? 'Video');

    setScheduleNote(candidate.interviewNote ?? '');

    setScheduleModalOpen(true);
  };

  const handleOpenOutcome = (candidate: Candidate) => {
    setSelectedCandidate(candidate);

    setOutcomeNote(candidate.interviewNote ?? '');

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

        note: scheduleNote.trim() ? scheduleNote.trim() : undefined,
      },

      {
        onSuccess: () => {
          toast.success(
            `🎯 Interview scheduled for ${selectedCandidate.name}! Hiring Manager has been notified.`
          );

          setScheduleModalOpen(false);
        },

        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to schedule interview');
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

        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to record outcome');
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

          <p className="text-text mt-1 font-sans text-2xl font-bold tabular-nums">
            {interviewCandidates.length}
          </p>

          <span className="text-text-subtle mt-0.5 block text-[11px]">Active candidates</span>
        </div>

        <div className="border-border bg-surface-1 rounded-lg border p-4">
          <span className="text-text-muted text-[12px] font-medium">Awaiting HR Scheduling</span>

          <p className="text-text mt-1 font-sans text-2xl font-bold tabular-nums">
            {unscheduledCandidates.length}
          </p>

          <span className="text-text-muted mt-0.5 block text-[11px] font-medium">
            {unscheduledCandidates.length > 0 ? 'Action required: Call candidate' : 'All caught up'}
          </span>
        </div>

        <div className="border-border bg-surface-1 rounded-lg border p-4">
          <span className="text-text-muted text-[12px] font-medium">Confirmed Slots</span>

          <p className="text-text mt-1 font-sans text-2xl font-bold tabular-nums">
            {scheduledCandidates.length}
          </p>

          <span className="text-text-muted mt-0.5 block text-[11px] font-medium">
            Ready for Manager
          </span>
        </div>
      </div>

      {interviewCandidates.length === 0 ? (
        <EmptyState
          icon={Calendar}

          title="No Candidates in Interview Stage"

          description="Candidates shortlisted by hiring managers will appear here for HR interview scheduling and technical evaluation."
        />
      ) : (
        <div className="space-y-4">
          {/* Status Tabs + Search & Filters */}

          <div className="space-y-3">
            {/* Row 1: Status Filter Tabs (Left) + Showing Count (Right) */}

            <div className="border-border/60 flex flex-col justify-between gap-3 border-b pb-2.5 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"

                  onClick={() => setStatusTab('all')}

                  className={cn(
                    'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[6px] border px-3 text-[12px] font-medium transition-colors select-none',

                    statusTab === 'all'
                      ? 'border-border-strong bg-surface-3 text-text font-semibold shadow-xs'
                      : 'border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2'
                  )}
                >
                  <span>All</span>

                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 font-sans text-[11px] font-semibold tabular-nums',

                      statusTab === 'all'
                        ? 'bg-surface-1 text-text border-border/80 border'
                        : 'bg-surface-2 text-text-subtle border-border/60 border'
                    )}
                  >
                    {interviewCandidates.length}
                  </span>
                </button>

                <button
                  type="button"

                  onClick={() => setStatusTab('needs-scheduling')}

                  className={cn(
                    'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[6px] border px-3 text-[12px] font-medium transition-colors select-none',

                    statusTab === 'needs-scheduling'
                      ? 'border-border-strong bg-surface-3 text-text font-semibold shadow-xs'
                      : 'border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2'
                  )}
                >
                  <Phone className={cn('h-3 w-3 shrink-0', 'text-text-subtle')} />

                  <span>Needs Call / Scheduling</span>

                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 font-sans text-[11px] font-semibold tabular-nums',

                      statusTab === 'needs-scheduling'
                        ? 'bg-surface-1 text-text border-border/80 border'
                        : 'bg-surface-2 text-text-subtle border-border/60 border'
                    )}
                  >
                    {unscheduledCandidates.length}
                  </span>
                </button>

                <button
                  type="button"

                  onClick={() => setStatusTab('scheduled')}

                  className={cn(
                    'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[6px] border px-3 text-[12px] font-medium transition-colors select-none',

                    statusTab === 'scheduled'
                      ? 'border-border-strong bg-surface-3 text-text font-semibold shadow-xs'
                      : 'border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2'
                  )}
                >
                  <CheckCircle2 className={cn('h-3 w-3 shrink-0', 'text-text-subtle')} />

                  <span>Confirmed Slots</span>

                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 font-sans text-[11px] font-semibold tabular-nums',

                      statusTab === 'scheduled'
                        ? 'bg-surface-1 text-text border-border/80 border'
                        : 'bg-surface-2 text-text-subtle border-border/60 border'
                    )}
                  >
                    {scheduledCandidates.length}
                  </span>
                </button>
              </div>

              <div className="text-text-muted flex shrink-0 items-center text-[12px] font-medium">
                Showing{' '}
                <span className="text-text mx-1 font-semibold">{filteredInterviews.length}</span> of{' '}
                {interviewCandidates.length} candidates
              </div>
            </div>

            {/* Row 2: Search + Department Filter + Outcome Filter + Format Filter + Reset */}

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                <Search className="text-text-subtle pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />

                <Input
                  value={searchQuery}

                  onChange={(e) => setSearchQuery(e.target.value)}

                  placeholder="Search candidate, role, phone, or notes..."

                  className="bg-surface-2/40 border-border/70 hover:border-border focus:bg-surface-1 h-8 w-full rounded-[6px] pl-8.5 text-[12px] shadow-2xs transition-all"
                />
              </div>

              {/* Department Filter */}

              {departments.length > 0 && (
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="border-border/70 bg-surface-2/40 hover:bg-surface-2 text-text h-8 w-auto min-w-[150px] gap-2 rounded-[6px] px-3 text-[12px] font-medium shadow-2xs">
                    <Building2 className="text-text-muted h-3.5 w-3.5 shrink-0" />

                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>

                  <SelectContent align="start" className="min-w-[190px]">
                    <SelectItem
                      value="all"
                      className="min-h-[32px] rounded-[6px] py-1.5 text-[12.5px]"
                    >
                      All Departments ({interviewCandidates.length})
                    </SelectItem>

                    {departments.map((dept) => {
                      const count = interviewCandidates.filter(
                        (c) => openingsMap.get(c.openingId)?.department === dept
                      ).length;

                      return (
                        <SelectItem
                          key={dept}
                          value={dept}
                          className="min-h-[32px] rounded-[6px] py-1.5 text-[12.5px]"
                        >
                          {dept} ({count})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}

              {/* Outcome Filter */}

              <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                <SelectTrigger className="border-border/70 bg-surface-2/40 hover:bg-surface-2 text-text h-8 w-auto min-w-[130px] gap-2 rounded-[6px] px-3 text-[12px] font-medium shadow-2xs">
                  <SelectValue placeholder="All Outcomes" />
                </SelectTrigger>

                <SelectContent align="start" className="min-w-[150px]">
                  <SelectItem
                    value="all"
                    className="min-h-[32px] rounded-[6px] py-1.5 text-[12.5px]"
                  >
                    All Outcomes
                  </SelectItem>

                  <SelectItem
                    value="Pending"
                    className="min-h-[32px] rounded-[6px] py-1.5 text-[12.5px]"
                  >
                    Pending
                  </SelectItem>

                  <SelectItem
                    value="Selected"
                    className="min-h-[32px] rounded-[6px] py-1.5 text-[12.5px]"
                  >
                    Selected
                  </SelectItem>

                  <SelectItem
                    value="Rejected"
                    className="min-h-[32px] rounded-[6px] py-1.5 text-[12.5px]"
                  >
                    Rejected
                  </SelectItem>

                  <SelectItem
                    value="On Hold"
                    className="min-h-[32px] rounded-[6px] py-1.5 text-[12.5px]"
                  >
                    On Hold
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Mode / Format Filter */}

              <Select value={modeFilter} onValueChange={setModeFilter}>
                <SelectTrigger className="border-border/70 bg-surface-2/40 hover:bg-surface-2 text-text h-8 w-auto min-w-[125px] gap-2 rounded-[6px] px-3 text-[12px] font-medium shadow-2xs">
                  <SelectValue placeholder="All Formats" />
                </SelectTrigger>

                <SelectContent align="start" className="min-w-[140px]">
                  <SelectItem
                    value="all"
                    className="min-h-[32px] rounded-[6px] py-1.5 text-[12.5px]"
                  >
                    All Formats
                  </SelectItem>

                  <SelectItem
                    value="Video"
                    className="min-h-[32px] rounded-[6px] py-1.5 text-[12.5px]"
                  >
                    Video Call
                  </SelectItem>

                  <SelectItem
                    value="Phone"
                    className="min-h-[32px] rounded-[6px] py-1.5 text-[12.5px]"
                  >
                    Phone
                  </SelectItem>

                  <SelectItem
                    value="Onsite"
                    className="min-h-[32px] rounded-[6px] py-1.5 text-[12.5px]"
                  >
                    Onsite
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Clear filters button if any filter is active */}

              {hasActiveFilters && (
                <button
                  type="button"

                  onClick={handleResetFilters}

                  className="text-text-muted hover:text-text flex h-8 cursor-pointer items-center gap-1 px-2 text-[12px] font-medium select-none"
                >
                  <X className="h-3.5 w-3.5" />

                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {filteredInterviews.length === 0 ? (
            <div className="border-border/70 rounded-[10px] border border-dashed p-8 text-center select-none">
              <p className="text-text-muted text-[13px]">
                No interviews match your filter criteria
              </p>

              <button
                type="button"

                onClick={handleResetFilters}

                className="text-text hover:text-text-muted mt-1.5 cursor-pointer text-[12px] underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {visibleInterviews.map((candidate) => {
                  const opening = openingsMap.get(candidate.openingId);

                  const isScheduled = Boolean(candidate.interviewDate);

                  const outcomeConfig = {
                    Pending: {
                      text: 'text-text',
                      label: isScheduled ? 'Slot Confirmed' : isHr ? 'Needs HR Call' : 'Pending',
                    },

                    Selected: {
                      text: 'text-text',
                      label: 'Selected',
                    },

                    Rejected: {
                      text: 'text-text',
                      label: 'Rejected',
                    },

                    'On Hold': {
                      text: 'text-text',
                      label: 'On Hold',
                    },
                  }[candidate.interviewOutcome ?? 'Pending'] ?? {
                    text: 'text-text',
                    label: candidate.interviewOutcome,
                  };

                  const isPhone = candidate.interviewMode === 'Phone';

                  const isAudio = candidate.interviewMode === 'Phone';

                  const ModeIcon = isAudio
                    ? Phone
                    : candidate.interviewMode === 'Onsite'
                      ? Building2
                      : VideoCameraIcon;

                  return (
                    <div
                      key={candidate.id}

                      role="button"

                      tabIndex={0}

                      onClick={() => handleOpenDetail(candidate)}

                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();

                          handleOpenDetail(candidate);
                        }
                      }}

                      className="group border-border/70 bg-surface-1 hover:border-border-strong relative flex cursor-pointer flex-col justify-between space-y-3.5 rounded-[12px] border p-4 transition-colors duration-150 select-none"
                    >
                      <div className="space-y-3">
                        {/* 1. Header: Colored Avatar + Name & Role at Company + Status Dot */}

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <CandidateAvatar name={candidate.name} size="md" />

                            <div className="min-w-0 flex-1">
                              <h4 className="text-text truncate text-[14px] font-semibold tracking-[-0.015em] transition-colors">
                                {candidate.name}
                              </h4>

                              <p className="text-text-muted mt-0.5 truncate text-[12px] font-normal">
                                <span>{candidate.currentRole}</span>

                                <span className="text-text-subtle/80 mx-1">at</span>

                                <span className="text-text inline-flex items-center gap-1 font-medium">
                                  <CompanyLogo
                                    company={candidate.currentCompany}
                                    className="h-3.5 w-3.5 rounded-[3px] shadow-2xs"
                                  />

                                  <span>{candidate.currentCompany}</span>
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Status Label (Clean unboxed, without dot) */}

                          <div className="shrink-0 pt-0.5 select-none">
                            <span className="text-text text-[12px] font-medium">
                              {outcomeConfig.label}
                            </span>
                          </div>
                        </div>

                        {/* 2. Middle Body: Interview Details (Notes / Role on left, Mode & Date/Time on right) */}

                        <div className="border-border/50 flex items-start justify-between gap-3 border-t pt-2.5 text-[12px]">
                          {/* Left: Notes or Target Role */}

                          <div className="min-w-0 flex-1 space-y-1 pr-2">
                            <span className="text-text-subtle block text-[10px] font-semibold tracking-wider uppercase">
                              {candidate.interviewNote ? 'Notes' : 'Target Role'}
                            </span>

                            <p
                              className="text-text line-clamp-2 text-[12px] leading-snug font-medium"
                              title={candidate.interviewNote || formatRoleTitle(opening?.title)}
                            >
                              {candidate.interviewNote || (
                                <span>
                                  {formatRoleTitle(opening?.title)}

                                  {opening?.department ? (
                                    <span className="text-text-subtle font-normal">
                                      {' '}
                                      · {opening.department}
                                    </span>
                                  ) : null}
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Right: Mode & Scheduled Date/Time or Status Prompt */}

                          <div className="shrink-0 space-y-1 text-right">
                            {isScheduled ? (
                              <>
                                <div className="text-text inline-flex items-center gap-1.5 text-[12px] font-semibold">
                                  <ModeIcon className="text-text-muted h-3.5 w-3.5 stroke-[1.75]" />

                                  <span>{candidate.interviewMode ?? 'Video'} Interview</span>
                                </div>

                                <div className="text-text-muted flex items-center justify-end gap-1 text-[11.5px] font-medium">
                                  <Clock className="text-text-subtle h-3 w-3 shrink-0" />

                                  <span>{formatInterviewDateTime(candidate.interviewDate!)}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-text inline-flex items-center gap-1.5 text-[12px] font-medium">
                                  <AlertCircle className="text-text-subtle h-3.5 w-3.5 stroke-[1.75]" />

                                  <span>Slot Unscheduled</span>
                                </div>

                                <div className="text-text-subtle text-[11.5px]">
                                  {isHr ? 'Call candidate to book' : 'Awaiting HR booking'}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 3. Footer Action Buttons */}

                      <div className="border-border/50 border-t pt-2.5">
                        {isHr ? (
                          !isScheduled ? (
                            <Button
                              variant="primary"

                              size="sm"

                              onClick={(e) => {
                                e.stopPropagation();

                                handleOpenSchedule(candidate);
                              }}

                              className="h-8 w-full cursor-pointer gap-1.5 rounded-[6px] text-[12px] font-semibold"
                            >
                              <Phone className="h-3.5 w-3.5" />

                              <span>Call & Schedule Slot</span>
                            </Button>
                          ) : (
                            <div className="flex w-full items-center gap-2">
                              <Button
                                variant="outline"

                                size="sm"

                                onClick={(e) => {
                                  e.stopPropagation();

                                  handleOpenSchedule(candidate);
                                }}

                                className="h-8 flex-1 cursor-pointer gap-1.5 rounded-[6px] text-[12px] font-medium"
                              >
                                <Calendar className="h-3.5 w-3.5" />

                                <span>Reschedule</span>
                              </Button>

                              <Button
                                variant="primary"

                                size="sm"

                                onClick={(e) => {
                                  e.stopPropagation();

                                  handleOpenOutcome(candidate);
                                }}

                                className="h-8 flex-1 cursor-pointer gap-1.5 rounded-[6px] text-[12px] font-semibold"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />

                                <span>Record Outcome</span>
                              </Button>
                            </div>
                          )
                        ) : isScheduled ? (
                          <Button
                            variant="primary"

                            size="sm"

                            onClick={(e) => {
                              e.stopPropagation();

                              handleOpenOutcome(candidate);
                            }}

                            className="h-8 w-full cursor-pointer gap-1.5 rounded-[6px] text-[12px] font-semibold"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />

                            <span>Conduct & Record Outcome</span>
                          </Button>
                        ) : (
                          <div className="text-text-subtle bg-surface-2/40 border-border/60 w-full rounded-[6px] border py-1.5 text-center text-[11.5px] select-none">
                            ⏳ Waiting for HR to confirm interview slot
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interviews Pagination Footer */}

              {totalPages > 1 && (
                <div className="border-border/60 flex items-center justify-between border-t pt-3 text-[12px] select-none">
                  <span className="text-text-subtle font-sans text-[11.5px] tabular-nums">
                    Showing {startIndex + 1}–
                    {Math.min(startIndex + PAGE_SIZE, filteredInterviews.length)} of{' '}
                    {filteredInterviews.length} interviews (Page {validPage} of {totalPages})
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"

                      disabled={validPage <= 1}

                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}

                      className="border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] border transition-colors disabled:cursor-not-allowed disabled:opacity-25"

                      title="Previous page"

                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"

                      disabled={validPage >= totalPages}

                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}

                      className="border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] border transition-colors disabled:cursor-not-allowed disabled:opacity-25"

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

      {/* HR Schedule Slot Dialog */}

      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Technical Interview</DialogTitle>

            <DialogDescription>
              Confirm candidate availability and book the technical interview slot for the hiring
              manager.
            </DialogDescription>
          </DialogHeader>

          {selectedCandidate && (
            <form onSubmit={handleSaveSchedule} className="space-y-4 py-2 text-[13px]">
              {/* Quick candidate contact reminder */}

              <div className="border-border bg-surface-2/60 space-y-1 rounded-[8px] border p-3 text-[12px]">
                <div className="flex items-center gap-3">
                  <CandidateAvatar
                    name={selectedCandidate.name}
                    candidateId={selectedCandidate.id}
                    size="sm"
                  />
                  <div>
                    <div className="text-text font-semibold">{selectedCandidate.name}</div>
                    <div className="text-text-muted mt-0.5 flex items-center gap-1.5 text-[11.5px]">
                      <span>{selectedCandidate.currentRole} at</span>
                      <span className="text-text inline-flex items-center gap-1 font-medium">
                        <CompanyLogo
                          company={selectedCandidate.currentCompany}
                          className="h-3.5 w-3.5 shrink-0 rounded-[3px] shadow-2xs"
                        />
                        <span>{selectedCandidate.currentCompany}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-text flex items-center gap-3 pt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <Phone className="text-text-muted h-3 w-3" />

                    <a href={`tel:${selectedCandidate.phone}`} className="hover:underline">
                      {selectedCandidate.phone}
                    </a>
                  </span>

                  <span className="text-text-muted flex items-center gap-1">
                    <Mail className="text-text-subtle h-3 w-3" />

                    <span>{selectedCandidate.email}</span>
                  </span>
                </div>
              </div>

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

                  <SelectContent
                    align="start"
                    className="w-[var(--radix-select-trigger-width)] min-w-[240px]"
                  >
                    <SelectItem
                      value="Video"
                      icon={VideoCameraIcon}
                      className="min-h-[36px] rounded-[6px] py-2 text-[13px]"
                    >
                      Google Meet / Video Call
                    </SelectItem>

                    <SelectItem
                      value="Phone"
                      icon={Phone}
                      className="min-h-[36px] rounded-[6px] py-2 text-[13px]"
                    >
                      Phone Discussion
                    </SelectItem>

                    <SelectItem
                      value="Onsite"
                      icon={Building2}
                      className="min-h-[36px] rounded-[6px] py-2 text-[13px]"
                    >
                      In-Person Technical Round
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-text text-[13px] font-medium">
                  Coordination Notes & Meeting Link (Optional)
                </label>

                <Textarea
                  rows={2}

                  value={scheduleNote}

                  onChange={(e) => setScheduleNote(e.target.value)}

                  placeholder="e.g. Candidate confirmed 11 AM. Google Meet link: meet.google.com/xyz-abcd-efg"

                  className="rounded-[8px] text-[12.5px]"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setScheduleModalOpen(false)}>
                  Cancel
                </Button>

                <Button type="submit" variant="primary" loading={scheduleInterview.isPending}>
                  Confirm Slot & Notify Manager
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Manager Record Outcome Dialog */}

      <Dialog open={outcomeModalOpen} onOpenChange={setOutcomeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Technical Evaluation</DialogTitle>

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

                placeholder="Candidate demonstrated clean coding habits, solid technical fundamentals, and clear problem solving..."
              />
            </div>

            <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-3">
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

      {/* Candidate Profile Drawer (opens on card click) */}

      <CandidateDetailSheet
        candidate={detailCandidate}

        open={sheetOpen}

        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
