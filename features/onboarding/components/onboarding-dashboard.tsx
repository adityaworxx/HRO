'use client';

import * as React from 'react';
import { useAllOnboarding, useToggleOnboardingTask, useCreateOnboardingTask } from '../hooks';
import { useCandidates } from '@/features/candidates/hooks';
import { PageHeader } from '@/components/hro/page-header';
import { StatCard } from '@/components/hro/stat-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import { Skeleton } from '@/components/ui/skeleton';
import { deriveOnboardingProgress } from '@/lib/domain/derive';
import { formatDate } from '@/lib/format';
import {
  CheckCircle2,
  Clock,
  Plus,
  Users,
  Search,
  Briefcase,
  ShieldCheck,
  FileCheck,
  Sparkles,
  CalendarCheck,
  Layers,
  ListChecks,
  Check,
  Info,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

const PHASES = ['Before joining', 'Day 1', 'First 30 days'] as const;

export function OnboardingDashboard() {
  const { data: onboardingItems = [], isLoading: loadingItems } = useAllOnboarding();
  const { data: candidates = [], isLoading: loadingCandidates } = useCandidates();
  const toggleTask = useToggleOnboardingTask();
  const createTask = useCreateOnboardingTask();

  // Active onboarding candidates (candidates with assigned onboarding tasks or at Joined / Offer Sent stages)
  const candidateIdsWithTasks = React.useMemo(
    () => Array.from(new Set(onboardingItems.map((i) => i.candidateId))),
    [onboardingItems]
  );

  const onboardingCandidates = React.useMemo(() => {
    return candidates.filter(
      (c) =>
        candidateIdsWithTasks.includes(c.id) || c.stage === 'Joined' || c.stage === 'Offer Sent'
    );
  }, [candidates, candidateIdsWithTasks]);

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

  // Pre-fill candidate ID when opening modal if available
  const handleOpenCreateModal = (candidateId?: string) => {
    setNewTaskCandidateId(
      candidateId ?? (onboardingCandidates[0]?.id || candidates[0]?.id || '')
    );
    setNewTaskTitle('');
    setNewTaskNotes('');
    setCreateModalOpen(true);
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
  }, [onboardingItems, candidates, selectedCandidateId, selectedOwner, selectedStatus, searchQuery]);

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

    const targetCandidateId = newTaskCandidateId || onboardingCandidates[0]?.id || candidates[0]?.id;
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
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-md" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Onboarding & Readiness"
        description="Monitor pre-boarding requirements, Day-1 readiness, and 30-day ramps across incoming team members."
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenCreateModal()}
            className="gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Checklist Item</span>
          </Button>
        }
      />

      {/* 2. Executive Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Readiness Progress"
          value={`${overallProgress.percentage}%`}
          delta={`${overallProgress.completed} of ${overallProgress.total} tasks completed`}
          icon={<CheckCircle2 className="h-4 w-4 stroke-[1.75]" />}
        />
        <StatCard
          label="New Hires in Roster"
          value={onboardingCandidates.length}
          delta="Offers accepted & joined"
          icon={<Users className="h-4 w-4 stroke-[1.75]" />}
        />
        <StatCard
          label="HR Responsibilities"
          value={`${hrCompleted}/${hrTasks.length}`}
          delta={hrPending > 0 ? `${hrPending} tasks pending` : 'All tasks completed'}
          isWarning={hrPending > 0}
          icon={<ShieldCheck className="h-4 w-4 stroke-[1.75]" />}
        />
        <StatCard
          label="Manager Checkpoints"
          value={`${mgrCompleted}/${mgrTasks.length}`}
          delta={mgrPending > 0 ? `${mgrPending} checkpoints pending` : 'All checkpoints done'}
          icon={<Briefcase className="h-4 w-4 stroke-[1.75]" />}
        />
      </div>

      {/* 3. Controls & Filter Bar */}
      <Card className="border-border bg-surface-1">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Segmented View Mode Switcher */}
          <Tabs
            value={viewMode}
            onValueChange={(val) => setViewMode(val as typeof viewMode)}
            className="w-auto"
          >
            <TabsList className="h-9">
              <TabsTrigger value="by-candidate" className="gap-1.5 text-[12px]">
                <Users className="h-3.5 w-3.5" />
                <span>By New Hire</span>
              </TabsTrigger>
              <TabsTrigger value="by-phase" className="gap-1.5 text-[12px]">
                <Layers className="h-3.5 w-3.5" />
                <span>By Phase</span>
              </TabsTrigger>
              <TabsTrigger value="all-tasks" className="gap-1.5 text-[12px]">
                <ListChecks className="h-3.5 w-3.5" />
                <span>All Tasks ({filteredItems.length})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search & Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[180px] sm:w-[220px]">
              <Search className="text-text-muted absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search tasks or hires..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 pl-8 text-[12px] bg-surface-2 border-border"
              />
            </div>

            {/* Candidate Filter (shown in by-phase & all-tasks) */}
            {viewMode !== 'by-candidate' && (
              <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId}>
                <SelectTrigger className="h-8.5 w-auto min-w-[140px] text-[12px] bg-surface-2 border-border">
                  <SelectValue placeholder="All Hires" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All Hires ({onboardingCandidates.length})</SelectItem>
                  {onboardingCandidates.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Owner Filter */}
            <Select value={selectedOwner} onValueChange={setSelectedOwner}>
              <SelectTrigger className="h-8.5 w-auto min-w-[130px] text-[12px] bg-surface-2 border-border">
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
              <SelectTrigger className="h-8.5 w-auto min-w-[120px] text-[12px] bg-surface-2 border-border">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="done">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* 4. Main Views */}

      {/* VIEW 1: BY NEW HIRE (Candidate Focus Roster) */}
      {viewMode === 'by-candidate' && (
        <div className="space-y-4">
          {onboardingCandidates.length === 0 ? (
            <Card className="border-border p-12 text-center">
              <Users className="text-text-muted mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-text text-[14px] font-medium">No candidates in onboarding</p>
              <p className="text-text-muted text-[12px] mt-1">
                Candidates moved to Offer Sent or Joined will appear here automatically.
              </p>
            </Card>
          ) : (
            onboardingCandidates.map((candidate) => {
              const candidateTasks = filteredItems.filter((i) => i.candidateId === candidate.id);
              const total = candidateTasks.length;
              const completed = candidateTasks.filter((i) => i.done).length;
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <Card key={candidate.id} className="border-border bg-surface-1 overflow-hidden shadow-xs">
                  {/* Candidate Header Summary */}
                  <div className="border-border bg-surface-2/40 flex flex-col gap-3 border-b px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarFallback className="bg-surface-3 text-text font-semibold text-[12px]">
                          {candidate.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-text text-[14px] font-semibold">
                            {candidate.name}
                          </span>
                          <Badge variant="accent" className="text-[10px] font-medium px-1.5 py-0.5">
                            {candidate.stage}
                          </Badge>
                        </div>
                        <p className="text-text-muted text-[12px]">
                          {candidate.currentRole} • {candidate.currentCompany}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Progress Indicator */}
                      <div className="flex items-center gap-2.5">
                        <div className="text-right">
                          <span className="text-text font-mono text-[12px] font-semibold">
                            {completed}/{total}
                          </span>
                          <span className="text-text-muted text-[11px] ml-1">tasks</span>
                        </div>
                        <Progress value={percent} className="h-2 w-24 sm:w-28" />
                        <Badge
                          variant={percent === 100 ? 'success' : 'default'}
                          className="font-mono text-[11px]"
                        >
                          {percent}%
                        </Badge>
                      </div>

                      {/* Add Task for Candidate Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCreateModal(candidate.id)}
                        className="h-8 gap-1 text-[12px] border-border hover:bg-surface-2"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Task</span>
                      </Button>
                    </div>
                  </div>

                  {/* Tasks Grouped by Phase for Candidate */}
                  <CardContent className="p-5">
                    {candidateTasks.length === 0 ? (
                      <p className="text-text-muted py-4 text-center text-[12px]">
                        No tasks match the active filters for this candidate.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                        {PHASES.map((phase) => {
                          const phaseTasks = candidateTasks.filter((t) => t.phase === phase);
                          const phaseDone = phaseTasks.filter((t) => t.done).length;

                          return (
                            <div
                              key={phase}
                              className="border-border bg-surface-2/20 flex flex-col rounded-[var(--radius-md)] border p-3.5"
                            >
                              {/* Phase Mini-Header */}
                              <div className="mb-2.5 flex items-center justify-between">
                                <span className="text-text text-[13px] font-semibold">
                                  {phase}
                                </span>
                                <Badge
                                  variant={phaseDone === phaseTasks.length && phaseTasks.length > 0 ? 'success' : 'default'}
                                  className="font-mono text-[10px]"
                                >
                                  {phaseDone}/{phaseTasks.length}
                                </Badge>
                              </div>

                              {/* Task Items */}
                              <div className="space-y-2 flex-1">
                                {phaseTasks.length === 0 ? (
                                  <div className="flex h-20 items-center justify-center text-center">
                                    <span className="text-text-subtle text-[11px]">
                                      No tasks in this phase
                                    </span>
                                  </div>
                                ) : (
                                  phaseTasks.map((task) => (
                                    <div
                                      key={task.id}
                                      className={`group flex items-start gap-2.5 rounded-[var(--radius-sm)] border p-2.5 transition-all ${
                                        task.done
                                          ? 'border-border/60 bg-surface-1/40'
                                          : 'border-border bg-surface-1 hover:border-border-strong hover:bg-surface-2/40'
                                      }`}
                                    >
                                      <Checkbox
                                        checked={task.done}
                                        onCheckedChange={() =>
                                          handleToggle(task.id, task.done, task.title)
                                        }
                                        className="mt-0.5 shrink-0"
                                      />
                                      <div className="min-w-0 flex-1 space-y-1">
                                        <p
                                          className={`text-[12px] leading-snug font-medium transition-colors ${
                                            task.done
                                              ? 'text-text-muted line-through decoration-text-subtle/40'
                                              : 'text-text'
                                          }`}
                                        >
                                          {task.title}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                          <Badge
                                            variant={task.owner === 'HR' ? 'accent' : 'default'}
                                            className="px-1.5 py-0 text-[10px]"
                                          >
                                            {task.owner}
                                          </Badge>
                                          <span className="text-text-subtle flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatDate(task.dueDate, 'dd MMM')}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })}
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
                <CardHeader className="border-border bg-surface-2/30 border-b px-5 py-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-surface-3 flex h-7 w-7 items-center justify-center rounded-[6px]">
                        {phaseIcon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-[15px] font-semibold">{phase}</CardTitle>
                          <Badge
                            variant={phasePct === 100 && phaseItems.length > 0 ? 'success' : 'default'}
                            className="font-mono text-[11px]"
                          >
                            {phaseCompleted}/{phaseItems.length} Done
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Progress value={phasePct} className="h-2 w-28" />
                      <span className="text-text-muted font-mono text-[12px]">{phasePct}%</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
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
                            className={`flex items-start justify-between gap-3 rounded-[var(--radius-md)] border p-3 transition-colors ${
                              item.done
                                ? 'border-border/60 bg-surface-2/30'
                                : 'border-border bg-surface-1 hover:border-border-strong hover:bg-surface-2/50'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <Checkbox
                                checked={item.done}
                                onCheckedChange={() => handleToggle(item.id, item.done, item.title)}
                                className="mt-0.5 shrink-0"
                              />
                              <div className="min-w-0 space-y-1">
                                <span
                                  className={`text-[13px] leading-snug font-medium block truncate ${
                                    item.done
                                      ? 'text-text-muted line-through decoration-text-subtle/40'
                                      : 'text-text'
                                  }`}
                                  title={item.title}
                                >
                                  {item.title}
                                </span>
                                {candidate && (
                                  <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                                    <Avatar className="h-4 w-4">
                                      <AvatarFallback className="text-[8px] bg-surface-3">
                                        {candidate.name.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-text font-medium">{candidate.name}</span>
                                    <span>•</span>
                                    <span className="text-text-subtle truncate max-w-[140px]">
                                      {candidate.currentRole}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-1">
                              <Badge
                                variant={item.owner === 'HR' ? 'accent' : 'default'}
                                className="text-[10px] px-1.5 py-0"
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
        <Card className="border-border bg-surface-1 overflow-hidden">
          <div className="border-border bg-surface-2/30 flex items-center justify-between border-b px-5 py-3">
            <span className="text-text text-[14px] font-semibold">
              Unified Checklist ({filteredItems.length} items)
            </span>
            <span className="text-text-muted text-[12px]">
              {filteredItems.filter((i) => i.done).length} completed
            </span>
          </div>

          <div className="divide-border divide-y">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-[13px]">
                No tasks match your search or filter criteria.
              </div>
            ) : (
              filteredItems.map((item) => {
                const candidate = candidates.find((c) => c.id === item.candidateId);

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-4 px-5 py-3 transition-colors ${
                      item.done ? 'bg-surface-2/20' : 'hover:bg-surface-2/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox
                        checked={item.done}
                        onCheckedChange={() => handleToggle(item.id, item.done, item.title)}
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <span
                          className={`text-[13px] font-medium block truncate ${
                            item.done
                              ? 'text-text-muted line-through decoration-text-subtle/40'
                              : 'text-text'
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.notes && (
                          <p className="text-text-subtle text-[11px] truncate">{item.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      {/* Candidate badge */}
                      {candidate && (
                        <div className="hidden sm:flex items-center gap-1.5 text-[12px]">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[9px] bg-surface-3">
                              {candidate.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-text font-medium">{candidate.name}</span>
                        </div>
                      )}

                      {/* Phase */}
                      <Badge variant="default" className="text-[11px] hidden md:inline-flex">
                        {item.phase}
                      </Badge>

                      {/* Owner */}
                      <Badge
                        variant={item.owner === 'HR' ? 'accent' : 'default'}
                        className="text-[11px]"
                      >
                        {item.owner}
                      </Badge>

                      {/* Due Date */}
                      <span className="text-text-subtle flex items-center gap-1 font-mono text-[12px] min-w-[75px] justify-end">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.dueDate, 'dd MMM')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {/* 5. Add Task Dialog */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-semibold">
              Add Onboarding Checklist Item
            </DialogTitle>
            <DialogDescription className="text-[13px] text-text-muted">
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
              <Input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="bg-surface-2 border-border text-[13px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-text text-[13px] font-medium">
                Instructions or Notes <span className="text-text-subtle font-normal">(Optional)</span>
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
