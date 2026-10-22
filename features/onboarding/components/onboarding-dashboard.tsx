'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useAllOnboarding, useToggleOnboardingTask, useCreateOnboardingTask } from '../hooks';
import { useCandidates } from '@/features/candidates/hooks';
import { useOpenings } from '@/features/openings/hooks';
import { StatCard } from '@/components/hro/stat-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { deriveOnboardingProgress } from '@/lib/domain/derive';
import { formatDate } from '@/lib/format';
import {
  Check,
  CheckCircle2,
  Clock,
  Plus,
  Users,
  Search,
  Briefcase,
  FileCheck,
  Sparkles,
  CalendarCheck,
  Layers,
  ListChecks,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

const PHASES = ['Before joining', 'Day 1', 'First 30 days'] as const;

const STANDARD_TASKS = [
  {
    title: 'Collect documents (PAN, Aadhaar, Degree)',
    owner: 'HR' as const,
    phase: 'Before joining' as const,
    daysOffset: -5,
  },
  {
    title: 'Create email and system accounts',
    owner: 'HR' as const,
    phase: 'Before joining' as const,
    daysOffset: -3,
  },
  {
    title: 'Arrange laptop and desk setup',
    owner: 'HR' as const,
    phase: 'Before joining' as const,
    daysOffset: -2,
  },
  {
    title: 'Prepare first-week plan',
    owner: 'Manager' as const,
    phase: 'Before joining' as const,
    daysOffset: -1,
  },
  {
    title: 'Welcome and orientation',
    owner: 'HR' as const,
    phase: 'Day 1' as const,
    daysOffset: 0,
  },
  {
    title: 'Introduce team and assign a buddy',
    owner: 'Manager' as const,
    phase: 'Day 1' as const,
    daysOffset: 0,
  },
  {
    title: '30-day check-in',
    owner: 'Manager' as const,
    phase: 'First 30 days' as const,
    daysOffset: 30,
  },
];

export function OnboardingDashboard() {
  const { data: onboardingItems = [], isLoading: loadingItems } = useAllOnboarding();
  const { data: candidates = [], isLoading: loadingCandidates } = useCandidates();
  const { data: openings = [] } = useOpenings();

  const getCandidateJoiningDate = React.useCallback(
    (candidate: { openingId?: string }) => {
      const opening = openings.find((o) => o.id === candidate.openingId);
      return opening?.targetStartDate ? formatDate(opening.targetStartDate) : '01 Nov 2026';
    },
    [openings]
  );
  const toggleTask = useToggleOnboardingTask();
  const createTask = useCreateOnboardingTask();

  // Active candidate IDs who currently have onboarding tasks
  const candidateIdsWithTasks = React.useMemo(
    () => Array.from(new Set(onboardingItems.map((i) => i.candidateId))),
    [onboardingItems]
  );

  // Candidates eligible for onboarding: either have tasks, or are at Joined / Offer Sent stages
  const onboardingCandidates = React.useMemo(() => {
    return candidates.filter(
      (c) =>
        candidateIdsWithTasks.includes(c.id) || c.stage === 'Joined' || c.stage === 'Offer Sent'
    );
  }, [candidates, candidateIdsWithTasks]);

  // Candidates who already have an active checklist
  const candidatesWithActiveChecklists = React.useMemo(() => {
    return onboardingCandidates.filter((c) => candidateIdsWithTasks.includes(c.id));
  }, [onboardingCandidates, candidateIdsWithTasks]);

  // Candidates awaiting checklist setup
  const candidatesAwaitingChecklists = React.useMemo(() => {
    return onboardingCandidates.filter((c) => !candidateIdsWithTasks.includes(c.id));
  }, [onboardingCandidates, candidateIdsWithTasks]);

  // View & Filter States
  const [viewMode, setViewMode] = React.useState<'by-candidate' | 'by-phase' | 'all-tasks'>(
    'by-candidate'
  );
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCandidateId, setSelectedCandidateId] = React.useState<string>('all');
  const [selectedOwner, setSelectedOwner] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');

  // Modal State
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [newTaskCandidateId, setNewTaskCandidateId] = React.useState('');
  const [newTaskPhase, setNewTaskPhase] = React.useState<
    'Before joining' | 'Day 1' | 'First 30 days'
  >('Before joining');
  const [newTaskOwner, setNewTaskOwner] = React.useState<'HR' | 'Manager'>('HR');
  const [newTaskDueDate, setNewTaskDueDate] = React.useState('2026-11-01');
  const [newTaskNotes, setNewTaskNotes] = React.useState('');
  const [initializingCandidateId, setInitializingCandidateId] = React.useState<string | null>(null);

  // Pre-fill candidate ID when opening modal
  const handleOpenCreateModal = (candidateId?: string) => {
    setNewTaskCandidateId(
      candidateId ??
        (candidatesWithActiveChecklists[0]?.id ||
          onboardingCandidates[0]?.id ||
          candidates[0]?.id ||
          '')
    );
    setNewTaskTitle('');
    setNewTaskNotes('');
    setCreateModalOpen(true);
  };

  // Initialize standard 7-task checklist for a new hire with 1 click
  const handleInitializeStandardChecklist = async (candidateId: string, candidateName: string) => {
    setInitializingCandidateId(candidateId);
    try {
      for (const t of STANDARD_TASKS) {
        await createTask.mutateAsync({
          candidateId,
          title: t.title,
          phase: t.phase,
          owner: t.owner,
          dueDate: new Date(Date.now() + t.daysOffset * 86400000).toISOString(),
          done: false,
          status: 'Pending',
        });
      }
      toast.success(`Standard onboarding checklist initialized for ${candidateName}!`);
    } catch {
      toast.error('Failed to initialize checklist. Please try again.');
    } finally {
      setInitializingCandidateId(null);
    }
  };

  // Filtered Tasks
  const filteredItems = React.useMemo(() => {
    return onboardingItems.filter((item) => {
      // Candidate filter
      if (selectedCandidateId !== 'all' && item.candidateId !== selectedCandidateId) {
        return false;
      }
      // Owner filter
      if (selectedOwner !== 'all' && item.owner !== selectedOwner) {
        return false;
      }
      // Status filter
      if (selectedStatus === 'done' && !item.done) return false;
      if (selectedStatus === 'pending' && item.done) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const candidate = candidates.find((c) => c.id === item.candidateId);
        const candidateName = candidate?.name.toLowerCase() ?? '';
        const taskTitle = item.title.toLowerCase();
        const notes = item.notes?.toLowerCase() ?? '';
        if (
          !taskTitle.includes(query) &&
          !candidateName.includes(query) &&
          !notes.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    onboardingItems,
    candidates,
    selectedCandidateId,
    selectedOwner,
    selectedStatus,
    searchQuery,
  ]);

  // Overall and Department Metrics
  const overallProgress = React.useMemo(
    () => deriveOnboardingProgress(onboardingItems),
    [onboardingItems]
  );

  const hrTasks = React.useMemo(
    () => onboardingItems.filter((i) => i.owner === 'HR'),
    [onboardingItems]
  );
  const hrCompleted = hrTasks.filter((i) => i.done).length;
  const hrPending = hrTasks.length - hrCompleted;

  const mgrTasks = React.useMemo(
    () => onboardingItems.filter((i) => i.owner === 'Manager'),
    [onboardingItems]
  );
  const mgrCompleted = mgrTasks.filter((i) => i.done).length;
  const mgrPending = mgrTasks.length - mgrCompleted;

  const handleToggle = (id: string, currentDone: boolean, title: string) => {
    toggleTask.mutate(
      { id, done: !currentDone },
      {
        onSuccess: () => {
          if (!currentDone) {
            toast.success(`Completed "${title}"`);
          } else {
            toast.info(`Marked "${title}" as pending`);
          }
        },
      }
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.error('Task title is required');
      return;
    }

    const targetCandidateId =
      newTaskCandidateId || onboardingCandidates[0]?.id || candidates[0]?.id;
    if (!targetCandidateId) {
      toast.error('Candidate is required');
      return;
    }

    createTask.mutate(
      {
        candidateId: targetCandidateId,
        title: newTaskTitle.trim(),
        phase: newTaskPhase,
        owner: newTaskOwner,
        dueDate: new Date(newTaskDueDate).toISOString(),
        done: false,
        status: 'Pending',
        notes: newTaskNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Onboarding checklist task created');
          setCreateModalOpen(false);
          setNewTaskTitle('');
          setNewTaskNotes('');
        },
      }
    );
  };

  const isLoading = loadingItems || loadingCandidates;

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <Skeleton className="h-[96px] rounded-[12px]" />
          <Skeleton className="h-[96px] rounded-[12px]" />
          <Skeleton className="h-[96px] rounded-[12px]" />
          <Skeleton className="h-[96px] rounded-[12px]" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-[12px]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Executive Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Readiness Progress"
          value={`${overallProgress.percentage}%`}
          delta={`${overallProgress.completed} of ${overallProgress.total} tasks completed`}
        />
        <StatCard
          label="Active Checklists"
          value={candidatesWithActiveChecklists.length}
          delta={`${candidatesAwaitingChecklists.length} pending checklist setup`}
        />
        <StatCard
          label="HR Requirements"
          value={`${hrCompleted}/${hrTasks.length}`}
          delta={hrPending > 0 ? `${hrPending} tasks pending` : 'All tasks completed'}
          isWarning={hrPending > 0}
        />
        <StatCard
          label="Manager Checkpoints"
          value={`${mgrCompleted}/${mgrTasks.length}`}
          delta={mgrPending > 0 ? `${mgrPending} checkpoints pending` : 'All checkpoints done'}
        />
      </div>

      {/* 2. Controls & Filter Bar with Action Button */}
      <Card className="border-border bg-surface-1 overflow-hidden">
        <div className="flex flex-col gap-3 p-3 sm:p-3.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Segmented View Mode Switcher */}
          <Tabs
            value={viewMode}
            onValueChange={(val) => setViewMode(val as typeof viewMode)}
            className="w-full lg:w-auto"
          >
            <TabsList className="bg-surface-2/40 border-border/80 h-auto w-full grid-cols-3 gap-1 rounded-[10px] border p-1 grid lg:flex lg:w-auto">
              <TabsTrigger
                value="by-candidate"
                className="data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:font-bold text-text-muted hover:text-text rounded-[8px] px-3.5 py-1.5 text-[12px] font-medium transition-colors"
              >
                <span>By New Hire</span>
              </TabsTrigger>
              <TabsTrigger
                value="by-phase"
                className="data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:font-bold text-text-muted hover:text-text rounded-[8px] px-3.5 py-1.5 text-[12px] font-medium transition-colors"
              >
                <span>By Phase</span>
              </TabsTrigger>
              <TabsTrigger
                value="all-tasks"
                className="data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:font-bold text-text-muted hover:text-text rounded-[8px] px-3.5 py-1.5 text-[12px] font-medium transition-colors"
              >
                <span>All Tasks ({filteredItems.length})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search, Filter Dropdowns & Add Button */}
          <div className="flex w-full flex-col flex-wrap items-stretch gap-2 sm:flex-row sm:items-center lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-[180px] lg:w-[200px]">
              <Search className="text-text-muted absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search tasks or hires..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-surface-2 border-border h-8.5 w-full pl-8 text-[12px]"
              />
            </div>

            {/* Filter Dropdowns Row */}
            <div className="grid w-full grid-cols-2 items-center gap-2 sm:flex sm:w-auto">
              {/* Candidate Filter (shown in by-phase & all-tasks) */}
              {viewMode !== 'by-candidate' && (
                <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId}>
                  <SelectTrigger className="bg-surface-2 border-border h-8.5 w-full min-w-[120px] text-[12px] sm:w-auto">
                    <SelectValue placeholder="All Hires" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="all">
                      All Hires ({candidatesWithActiveChecklists.length})
                    </SelectItem>
                    {candidatesWithActiveChecklists.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Owner Filter */}
              <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                <SelectTrigger className="bg-surface-2 border-border h-8.5 w-full min-w-[115px] text-[12px] sm:w-auto">
                  <SelectValue placeholder="All Owners" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All Owners</SelectItem>
                  <SelectItem value="HR">HR Responsible</SelectItem>
                  <SelectItem value="Manager">Manager Responsible</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-surface-2 border-border h-8.5 w-full min-w-[110px] text-[12px] sm:w-auto">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="done">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* + Add Checklist Item Action Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenCreateModal()}
              className="h-8.5 w-full justify-center gap-1.5 text-[12px] shadow-sm sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add Checklist Item</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. Main Views */}

      {/* VIEW 1: BY NEW HIRE (Candidate Focus Roster) */}
      {viewMode === 'by-candidate' && (
        <div className="space-y-4 sm:space-y-5">
          {/* 1. TOP: Clean Table for Upcoming Hires Ready to Initialize Checklist */}
          {candidatesAwaitingChecklists.length > 0 && (
            <Card className="border-border bg-surface-1 overflow-hidden">
              <div className="border-border bg-surface-2/30 flex items-center justify-between border-b px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <span className="text-text text-[13px] font-semibold">
                    Upcoming Hires Awaiting Onboarding Roadmap
                  </span>
                </div>
                <span className="text-text-subtle hidden text-[11px] sm:inline">
                  Initialize standard checklist or add custom tasks
                </span>
              </div>

              <div className="-mx-px overflow-x-auto">
                <table className="w-full min-w-[720px] table-fixed border-collapse text-left">
                  <colgroup>
                    <col className="w-[20%]" />
                    <col className="w-[28%]" />
                    <col className="w-[14%]" />
                    <col className="w-[16%]" />
                    <col className="w-[22%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-border text-text-muted bg-surface-2/40 border-b text-[11px] font-bold tracking-wider uppercase">
                      <th className="px-4 py-2.5 font-bold sm:px-5">Candidate</th>
                      <th className="px-3 py-2.5 font-bold sm:px-4">Role & Company</th>
                      <th className="px-3 py-2.5 font-bold sm:px-4">Stage</th>
                      <th className="px-3 py-2.5 font-bold sm:px-4">Joining Date</th>
                      <th className="px-4 py-2.5 text-right font-bold sm:px-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y text-[12px]">
                    {candidatesAwaitingChecklists.map((candidate) => {
                      const joiningDate = getCandidateJoiningDate(candidate);

                      return (
                        <tr key={candidate.id} className="hover:bg-surface-2/30 transition-colors">
                          <td className="px-4 py-2.5 whitespace-nowrap sm:px-5">
                            <div className="flex items-center gap-2">
                              <Avatar className="border-border h-6 w-6 shrink-0 border">
                                <AvatarFallback className="bg-surface-3 text-text text-[9px] font-medium">
                                  {candidate.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-text font-medium">{candidate.name}</span>
                            </div>
                          </td>
                          <td className="text-text-muted truncate px-3 py-2.5 whitespace-nowrap sm:px-4">
                            {candidate.currentRole} <span className="text-text-subtle">•</span>{' '}
                            {candidate.currentCompany}
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap sm:px-4">
                            <Badge
                              variant="default"
                              className="text-text-muted bg-surface-2 text-[11px] font-normal"
                            >
                              {candidate.stage}
                            </Badge>
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap sm:px-4">
                            <span className="text-text flex items-center gap-1.5 text-[12px] font-medium tabular-nums">
                              <Calendar className="text-accent h-3.5 w-3.5 stroke-[1.75]" />
                              {joiningDate}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right whitespace-nowrap sm:px-5">
                            <div className="inline-flex items-center justify-end gap-1.5 sm:gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleInitializeStandardChecklist(candidate.id, candidate.name)
                                }
                                loading={initializingCandidateId === candidate.id}
                                disabled={initializingCandidateId !== null}
                                className="border-border hover:bg-surface-2 h-7 cursor-pointer gap-1 px-2 text-[11px] sm:px-2.5"
                              >
                                <ListChecks className="h-3 w-3" />
                                <span>Setup Standard Checklist</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenCreateModal(candidate.id)}
                                disabled={initializingCandidateId !== null}
                                className="text-text-muted hover:text-text h-7 cursor-pointer gap-1 px-2 text-[11px]"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Custom Task</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* 2. BOTTOM: Candidate Checklist Tasks Section */}
          {candidatesWithActiveChecklists.length === 0 ? (
            <Card className="border-border p-8 text-center sm:p-12">
              <Users className="text-text-muted mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-text text-[14px] font-medium">
                No candidates with active checklists
              </p>
              <p className="text-text-muted mt-1 text-[12px]">
                Select an upcoming hire above to initialize their onboarding roadmap.
              </p>
            </Card>
          ) : (
            candidatesWithActiveChecklists.map((candidate) => {
              const candidateTasks = filteredItems.filter((i) => i.candidateId === candidate.id);
              const total = candidateTasks.length;
              const completed = candidateTasks.filter((i) => i.done).length;
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
              const joiningDate = getCandidateJoiningDate(candidate);

              return (
                <Card
                  key={candidate.id}
                  className="border-border bg-surface-1 overflow-hidden shadow-xs"
                >
                  {/* Candidate Header Summary */}
                  <div className="border-border bg-surface-2/40 flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="border-border h-9 w-9 shrink-0 border">
                        <AvatarFallback className="bg-surface-3 text-text text-[12px] font-semibold">
                          {candidate.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-text truncate text-[14px] font-semibold">
                            {candidate.name}
                          </span>
                          <span className="text-text-muted bg-surface-2/60 border-border flex items-center gap-1 rounded-[4px] border px-2 py-0.5 font-mono text-[11px] tabular-nums">
                            <Calendar className="text-accent h-3 w-3 shrink-0" />
                            <span>Joining: {joiningDate}</span>
                          </span>
                        </div>
                        <p className="text-text-muted truncate text-[12px]">
                          {candidate.currentRole} • {candidate.currentCompany}
                        </p>
                      </div>
                    </div>

                    <div className="border-border/50 flex w-full flex-wrap items-center justify-between gap-3 border-t pt-2 sm:w-auto sm:flex-nowrap sm:justify-end sm:border-t-0 sm:pt-0">
                      {/* Progress Indicator */}
                      <div className="flex items-center gap-2">
                        <div className="shrink-0 text-right">
                          <span className="text-text font-mono text-[12px] font-semibold">
                            {completed}/{total}
                          </span>
                          <span className="text-text-muted ml-1 text-[11px]">tasks</span>
                        </div>
                        <Progress value={percent} className="h-2 w-20 sm:w-28" />
                        <Badge
                          variant={percent === 100 ? 'success' : 'default'}
                          className="shrink-0 font-mono text-[11px]"
                        >
                          {percent}%
                        </Badge>
                      </div>

                      {/* Add Task for Candidate Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCreateModal(candidate.id)}
                        className="border-border hover:bg-surface-2 h-8 shrink-0 cursor-pointer gap-1 text-[12px]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Task</span>
                      </Button>
                    </div>
                  </div>

                  {/* 3-Phase Columns Board */}
                  <CardContent className="p-3.5 sm:p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-start">
                      {PHASES.map((phase) => {
                        const phaseTasks = candidateTasks.filter((t) => t.phase === phase);
                        const phaseCompleted = phaseTasks.filter((t) => t.done).length;

                        return (
                          <div
                            key={phase}
                            className="rounded-[10px] border border-border/70 bg-surface-2/20 p-3 space-y-2.5 flex flex-col justify-between"
                          >
                            <div className="space-y-2.5">
                              {/* Phase Header */}
                              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    className={cn(
                                      'h-2 w-2 rounded-full shrink-0',
                                      phase === 'Before joining'
                                        ? 'bg-accent'
                                        : phase === 'Day 1'
                                          ? 'bg-indigo-400'
                                          : 'bg-emerald-400'
                                    )}
                                  />
                                  <span className="text-[12.5px] font-semibold text-text truncate">
                                    {phase}
                                  </span>
                                </div>
                                <span
                                  className={cn(
                                    'font-mono text-[10.5px] font-semibold px-1.5 py-0.2 rounded-full shrink-0',
                                    phaseCompleted === phaseTasks.length && phaseTasks.length > 0
                                      ? 'bg-emerald-500/15 text-emerald-400'
                                      : 'bg-surface-3 text-text-subtle'
                                  )}
                                >
                                  {phaseCompleted}/{phaseTasks.length}
                                </span>
                              </div>

                              {/* Task Cards */}
                              {phaseTasks.length === 0 ? (
                                <div className="rounded-[8px] border border-dashed border-border/60 p-4 text-center select-none">
                                  <p className="text-[11px] text-text-subtle">No tasks in this phase</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {phaseTasks.map((task) => (
                                    <div
                                      key={task.id}
                                      className={cn(
                                        'group rounded-[8px] border border-border/70 p-2.5 transition-all duration-140 space-y-1.5',
                                        task.done
                                          ? 'bg-surface-2/30 opacity-70 border-border/50'
                                          : 'bg-surface-1 hover:border-border-strong hover:bg-surface-2/40'
                                      )}
                                    >
                                      {/* Checkbox + Title */}
                                      <div className="flex items-start gap-2.5 min-w-0">
                                        <Checkbox
                                          id={task.id}
                                          checked={task.done}
                                          onCheckedChange={() =>
                                            handleToggle(task.id, task.done, task.title)
                                          }
                                          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer"
                                        />
                                        <label
                                          htmlFor={task.id}
                                          className={cn(
                                            'text-[12.5px] leading-[17px] font-medium cursor-pointer block min-w-0 select-none transition-colors duration-150',
                                            task.done
                                              ? 'text-text-muted font-normal'
                                              : 'text-text'
                                          )}
                                        >
                                          {task.title}
                                        </label>
                                      </div>

                                      {/* Optional Note */}
                                      {task.notes && (
                                        <p
                                          className="text-[11px] text-text-subtle pl-[26px] line-clamp-1 truncate"
                                          title={task.notes}
                                        >
                                          {task.notes}
                                        </p>
                                      )}

                                      {/* Bottom Meta: Owner Badge + Due Date */}
                                      <div className="flex items-center justify-between pl-[26px] pt-1 text-[11px]">
                                        <Badge
                                          variant="default"
                                          className={cn(
                                            'px-1.5 py-0 text-[10px] font-medium rounded-[4px] leading-tight',
                                            task.owner === 'HR'
                                              ? 'border-accent/30 text-accent bg-accent/10'
                                              : 'border-border text-text-muted bg-surface-3'
                                          )}
                                        >
                                          {task.owner}
                                        </Badge>

                                        <span className="text-text-subtle font-mono text-[10.5px] tabular-nums">
                                          {formatDate(task.dueDate, 'dd MMM')}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {candidateTasks.length === 0 && (
                      <div className="text-text-muted p-6 text-center text-[12px]">
                        No tasks match your active filter.
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: BY PHASE (Timeline Stage View) */}
      {viewMode === 'by-phase' && (
        <div className="space-y-4">
          {PHASES.map((phase) => {
            const phaseItems = filteredItems.filter((i) => i.phase === phase);
            const phaseCompleted = phaseItems.filter((i) => i.done).length;
            const phasePct =
              phaseItems.length > 0 ? Math.round((phaseCompleted / phaseItems.length) * 100) : 0;

            const phaseIcon =
              phase === 'Before joining' ? (
                <FileCheck className="text-accent h-4 w-4" />
              ) : phase === 'Day 1' ? (
                <Sparkles className="text-accent h-4 w-4" />
              ) : (
                <CalendarCheck className="text-accent h-4 w-4" />
              );

            return (
              <Card key={phase} className="border-border bg-surface-1 overflow-hidden">
                <CardHeader className="border-border bg-surface-2/30 border-b px-4 py-3 sm:px-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-surface-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px]">
                        {phaseIcon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-[15px] font-semibold">{phase}</CardTitle>
                          <Badge
                            variant={
                              phasePct === 100 && phaseItems.length > 0 ? 'success' : 'default'
                            }
                            className="font-mono text-[11px]"
                          >
                            {phaseCompleted}/{phaseItems.length} Done
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Progress value={phasePct} className="h-2 w-24 sm:w-28" />
                      <span className="text-text-muted font-mono text-[12px]">{phasePct}%</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-3 sm:p-4">
                  {phaseItems.length === 0 ? (
                    <p className="text-text-muted py-6 text-center text-[12px]">
                      No checklist tasks in this phase match your filters.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                      {phaseItems.map((item) => {
                        const candidate = candidates.find((c) => c.id === item.candidateId);

                        return (
                          <div
                            key={item.id}
                            className={`flex min-w-0 items-start justify-between gap-2.5 rounded-[var(--radius-md)] border p-2.5 transition-colors sm:gap-3 sm:p-3 ${
                              item.done
                                ? 'border-border/60 bg-surface-2/30'
                                : 'border-border bg-surface-1 hover:border-border-strong hover:bg-surface-2/50'
                            }`}
                          >
                            <div className="flex min-w-0 flex-1 items-start gap-2.5 overflow-hidden">
                              <Checkbox
                                checked={item.done}
                                onCheckedChange={() => handleToggle(item.id, item.done, item.title)}
                                className="mt-0.5 shrink-0"
                              />
                              <div className="min-w-0 flex-1 space-y-1 overflow-hidden">
                                <span
                                  className={`block truncate text-[13px] leading-snug font-medium transition-colors duration-150 ${
                                    item.done
                                      ? 'text-text-muted font-normal'
                                      : 'text-text'
                                  }`}
                                  title={item.title}
                                >
                                  {item.title}
                                </span>
                                {candidate && (
                                  <div className="text-text-muted flex items-center gap-1.5 truncate text-[11px]">
                                    <Avatar className="h-4 w-4 shrink-0">
                                      <AvatarFallback className="bg-surface-3 text-[8px]">
                                        {candidate.name.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-text truncate font-medium">
                                      {candidate.name}
                                    </span>
                                    <span>•</span>
                                    <span className="text-text-subtle truncate">
                                      {candidate.currentRole}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-1">
                              <Badge
                                variant="default"
                                className="text-text-muted bg-surface-2 px-1.5 py-0 text-[10px] font-normal"
                              >
                                {item.owner}
                              </Badge>
                              <span className="text-text-subtle flex items-center gap-1 font-mono text-[11px]">
                                <Clock className="h-3 w-3" />
                                {formatDate(item.dueDate, 'dd MMM')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* VIEW 3: ALL TASKS (Unified Table/Checklist View) */}
      {viewMode === 'all-tasks' && (
        <Card className="border-border bg-surface-1 overflow-hidden shadow-2xs">
          <div className="border-border/80 bg-surface-2/30 flex items-center justify-between border-b px-4 py-3 sm:px-5">
            <span className="text-text text-[14px] font-semibold tracking-tight">
              Unified Checklist
            </span>
            <div className="text-text-muted text-[12px]">
              <span className="text-text font-semibold">
                {filteredItems.filter((i) => i.done).length}
              </span>{' '}
              of {filteredItems.length} completed
            </div>
          </div>

          <div className="-mx-px overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-border/80 bg-surface-2/50 text-text-muted border-b text-[11px] font-bold tracking-wider uppercase select-none">
                  <th className="w-12 px-3.5 py-2.5 text-center sm:px-4">
                    <span className="sr-only">Status Toggle</span>
                  </th>
                  <th className="min-w-[260px] px-3 py-2.5 font-bold">Task</th>
                  <th className="w-[170px] px-3 py-2.5 font-bold">New Hire</th>
                  <th className="w-[130px] px-3 py-2.5 font-bold">Phase</th>
                  <th className="w-[100px] px-3 py-2.5 font-bold">Owner</th>
                  <th className="w-[110px] px-3 py-2.5 font-bold">Due Date</th>
                  <th className="w-[100px] py-2.5 pr-4 text-right font-bold sm:pr-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-border/60 divide-y text-[13px]">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-text-muted p-8 text-center text-[13px]">
                      No tasks match your search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const candidate = candidates.find((c) => c.id === item.candidateId);

                    return (
                      <tr
                        key={item.id}
                        className={cn(
                          'group hover:bg-surface-2/40 transition-colors',
                          item.done && 'bg-surface-2/15'
                        )}
                      >
                        {/* Checkbox */}
                        <td
                          className="cursor-pointer px-3.5 py-3 text-center align-middle sm:px-4"
                          onClick={() => handleToggle(item.id, item.done, item.title)}
                        >
                          <Checkbox
                            checked={item.done}
                            onCheckedChange={() => handleToggle(item.id, item.done, item.title)}
                            onClick={(e) => e.stopPropagation()}
                            className="mx-auto"
                          />
                        </td>

                        {/* Task Title & Notes */}
                        <td className="px-3 py-3 align-middle">
                          <div className="flex flex-col gap-0.5 pr-2">
                            <span
                              className={cn(
                                'text-[13px] leading-snug font-medium break-words transition-colors duration-150',
                                item.done
                                  ? 'text-text-muted font-normal'
                                  : 'text-text'
                              )}
                            >
                              {item.title}
                            </span>
                            {item.notes && (
                              <p className="text-text-subtle line-clamp-1 text-[11px]">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* New Hire */}
                        <td className="px-3 py-3 align-middle whitespace-nowrap">
                          {candidate ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="border-border/80 h-5 w-5 shrink-0 border">
                                <AvatarFallback className="bg-surface-3 text-text text-[9px] font-semibold">
                                  {candidate.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span
                                className="text-text max-w-[130px] truncate text-[12px] font-medium"
                                title={candidate.name}
                              >
                                {candidate.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-text-subtle text-[12px]">—</span>
                          )}
                        </td>

                        {/* Phase */}
                        <td className="px-3 py-3 align-middle whitespace-nowrap">
                          <Badge
                            variant="default"
                            className="text-text bg-surface-2 border-border/70 rounded-[4px] border px-2 py-0.5 text-[11px] font-normal"
                          >
                            {item.phase}
                          </Badge>
                        </td>

                        {/* Owner */}
                        <td className="px-3 py-3 align-middle whitespace-nowrap">
                          <Badge
                            variant="default"
                            className="text-text-muted bg-surface-2 border-border/60 rounded-[4px] border px-2 py-0.5 text-[11px] font-normal"
                          >
                            {item.owner}
                          </Badge>
                        </td>

                        {/* Due Date */}
                        <td className="px-3 py-3 align-middle whitespace-nowrap">
                          <span className="text-text-subtle flex items-center gap-1.5 font-mono text-[12px]">
                            <Calendar className="text-text-subtle/70 h-3.5 w-3.5 shrink-0" />
                            <span>{formatDate(item.dueDate, 'dd MMM')}</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 pr-4 text-right align-middle whitespace-nowrap sm:pr-5">
                          {item.done ? (
                            <span className="text-text bg-surface-2 border-border/80 inline-flex items-center gap-1 rounded-[4px] border px-2 py-0.5 text-[11px] font-medium">
                              <Check className="text-text h-3 w-3" />
                              <span>Done</span>
                            </span>
                          ) : (
                            <span className="text-text-subtle bg-surface-2/60 border-border/60 inline-flex items-center gap-1 rounded-[4px] border px-2 py-0.5 text-[11px] font-normal">
                              <Clock className="text-text-subtle/70 h-3 w-3" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 4. Add Task Dialog */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-semibold">
              Add Onboarding Checklist Item
            </DialogTitle>
            <DialogDescription className="text-text-muted text-[13px]">
              Configure a pre-boarding milestone or ramp-up action item for an incoming hire.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-text text-[13px] font-medium">Task Title</label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Issue MacBook Pro & Security Key"
                required
                className="bg-surface-2 border-border"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-text text-[13px] font-medium">Assignee (New Hire)</label>
              <Select
                value={newTaskCandidateId}
                onValueChange={(val) => setNewTaskCandidateId(val)}
              >
                <SelectTrigger className="bg-surface-2 border-border text-[13px]">
                  <SelectValue placeholder="Select candidate" />
                </SelectTrigger>
                <SelectContent>
                  {onboardingCandidates.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-[13px]">
                      {c.name} — {c.currentRole}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-text text-[13px] font-medium">Onboarding Phase</label>
                <Select
                  value={newTaskPhase}
                  onValueChange={(val) =>
                    setNewTaskPhase(val as 'Before joining' | 'Day 1' | 'First 30 days')
                  }
                >
                  <SelectTrigger className="bg-surface-2 border-border text-[13px]">
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Before joining" className="text-[13px]">
                      Before joining
                    </SelectItem>
                    <SelectItem value="Day 1" className="text-[13px]">
                      Day 1
                    </SelectItem>
                    <SelectItem value="First 30 days" className="text-[13px]">
                      First 30 days
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-text text-[13px] font-medium">Responsible Owner</label>
                <Select
                  value={newTaskOwner}
                  onValueChange={(val) => setNewTaskOwner(val as 'HR' | 'Manager')}
                >
                  <SelectTrigger className="bg-surface-2 border-border text-[13px]">
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HR" className="text-[13px]">
                      HR Team
                    </SelectItem>
                    <SelectItem value="Manager" className="text-[13px]">
                      Hiring Manager
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-text text-[13px] font-medium">Due Date</label>
              <DatePicker
                value={newTaskDueDate}
                onChange={(val) => setNewTaskDueDate(val || '2026-11-01')}
                placeholder="Select due date"
                className="bg-surface-2 border-border h-9 text-[13px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-text text-[13px] font-medium">
                Instructions or Notes{' '}
                <span className="text-text-subtle font-normal">(Optional)</span>
              </label>
              <Textarea
                rows={2}
                value={newTaskNotes}
                onChange={(e) => setNewTaskNotes(e.target.value)}
                placeholder="Key contacts, asset tracking numbers, or preparation steps..."
                className="bg-surface-2 border-border text-[13px]"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="border-border text-[13px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={createTask.isPending}
                className="text-[13px]"
              >
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
