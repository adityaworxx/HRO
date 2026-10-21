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
  ShieldCheck,
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
  { title: 'Collect documents (PAN, Aadhaar, Degree)', owner: 'HR' as const, phase: 'Before joining' as const, daysOffset: -5 },
  { title: 'Create email and system accounts', owner: 'HR' as const, phase: 'Before joining' as const, daysOffset: -3 },
  { title: 'Arrange laptop and desk setup', owner: 'HR' as const, phase: 'Before joining' as const, daysOffset: -2 },
  { title: 'Prepare first-week plan', owner: 'Manager' as const, phase: 'Before joining' as const, daysOffset: -1 },
  { title: 'Welcome and orientation', owner: 'HR' as const, phase: 'Day 1' as const, daysOffset: 0 },
  { title: 'Introduce team and assign a buddy', owner: 'Manager' as const, phase: 'Day 1' as const, daysOffset: 0 },
  { title: '30-day check-in', owner: 'Manager' as const, phase: 'First 30 days' as const, daysOffset: 30 },
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
      candidateId ?? (candidatesWithActiveChecklists[0]?.id || onboardingCandidates[0]?.id || candidates[0]?.id || '')
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
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <StatCard
          label="Readiness Progress"
          value={`${overallProgress.percentage}%`}
          delta={`${overallProgress.completed} of ${overallProgress.total} tasks completed`}
          icon={<CheckCircle2 className="h-4 w-4 stroke-[1.75]" />}
        />
        <StatCard
          label="Active Checklists"
          value={candidatesWithActiveChecklists.length}
          delta={`${candidatesAwaitingChecklists.length} pending checklist setup`}
          icon={<Users className="h-4 w-4 stroke-[1.75]" />}
        />
        <StatCard
          label="HR Requirements"
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

      {/* 2. Controls & Filter Bar with Action Button */}
      <Card className="border-border bg-surface-1 overflow-hidden">
        <div className="flex flex-col gap-3 p-3 sm:p-3.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Segmented View Mode Switcher */}
          <Tabs
            value={viewMode}
            onValueChange={(val) => setViewMode(val as typeof viewMode)}
            className="w-full lg:w-auto"
          >
            <TabsList className="h-9 w-full lg:w-auto grid grid-cols-3 lg:flex">
              <TabsTrigger value="by-candidate" className="gap-1.5 text-[12px] px-2 sm:px-3">
                <Users className="h-3.5 w-3.5" />
                <span>By New Hire</span>
              </TabsTrigger>
              <TabsTrigger value="by-phase" className="gap-1.5 text-[12px] px-2 sm:px-3">
                <Layers className="h-3.5 w-3.5" />
                <span>By Phase</span>
              </TabsTrigger>
              <TabsTrigger value="all-tasks" className="gap-1.5 text-[12px] px-2 sm:px-3">
                <ListChecks className="h-3.5 w-3.5" />
                <span>All Tasks ({filteredItems.length})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search, Filter Dropdowns & Add Button */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-[180px] lg:w-[200px]">
              <Search className="text-text-muted absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search tasks or hires..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 pl-8 text-[12px] bg-surface-2 border-border w-full"
              />
            </div>

            {/* Filter Dropdowns Row */}
            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
              {/* Candidate Filter (shown in by-phase & all-tasks) */}
              {viewMode !== 'by-candidate' && (
                <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId}>
                  <SelectTrigger className="h-8.5 w-full sm:w-auto min-w-[120px] text-[12px] bg-surface-2 border-border">
                    <SelectValue placeholder="All Hires" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="all">All Hires ({candidatesWithActiveChecklists.length})</SelectItem>
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
                <SelectTrigger className="h-8.5 w-full sm:w-auto min-w-[115px] text-[12px] bg-surface-2 border-border">
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
                <SelectTrigger className="h-8.5 w-full sm:w-auto min-w-[110px] text-[12px] bg-surface-2 border-border">
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
              className="h-8.5 gap-1.5 shadow-sm text-[12px] w-full sm:w-auto justify-center"
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
                <span className="text-text-subtle text-[11px] hidden sm:inline">
                  Initialize standard checklist or add custom tasks
                </span>
              </div>

              <div className="overflow-x-auto -mx-px">
                <table className="w-full text-left border-collapse table-fixed min-w-[720px]">
                  <colgroup>
                    <col className="w-[20%]" />
                    <col className="w-[28%]" />
                    <col className="w-[14%]" />
                    <col className="w-[16%]" />
                    <col className="w-[22%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-border text-[11px] font-medium text-text-subtle uppercase tracking-wider bg-surface-2/40">
                      <th className="py-2.5 px-4 sm:px-5 font-medium">Candidate</th>
                      <th className="py-2.5 px-3 sm:px-4 font-medium">Role & Company</th>
                      <th className="py-2.5 px-3 sm:px-4 font-medium">Stage</th>
                      <th className="py-2.5 px-3 sm:px-4 font-medium">Joining Date</th>
                      <th className="py-2.5 px-4 sm:px-5 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-[12px]">
                    {candidatesAwaitingChecklists.map((candidate) => {
                      const joiningDate = getCandidateJoiningDate(candidate);

                      return (
                        <tr key={candidate.id} className="hover:bg-surface-2/30 transition-colors">
                          <td className="py-2.5 px-4 sm:px-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6 border border-border shrink-0">
                                <AvatarFallback className="text-[9px] bg-surface-3 text-text font-medium">
                                  {candidate.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-text">{candidate.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap truncate text-text-muted">
                            {candidate.currentRole} <span className="text-text-subtle">•</span> {candidate.currentCompany}
                          </td>
                          <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                            <Badge variant="default" className="text-[11px] font-normal text-text-muted bg-surface-2">
                              {candidate.stage}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                            <span className="flex items-center gap-1.5 text-[12px] font-medium text-text tabular-nums">
                              <Calendar className="h-3.5 w-3.5 text-accent stroke-[1.75]" />
                              {joiningDate}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 sm:px-5 whitespace-nowrap text-right">
                            <div className="inline-flex items-center gap-1.5 sm:gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleInitializeStandardChecklist(candidate.id, candidate.name)
                                }
                                loading={initializingCandidateId === candidate.id}
                                disabled={initializingCandidateId !== null}
                                className="h-7 px-2 sm:px-2.5 text-[11px] gap-1 border-border hover:bg-surface-2 cursor-pointer"
                              >
                                <ListChecks className="h-3 w-3" />
                                <span>Setup Standard Checklist</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenCreateModal(candidate.id)}
                                disabled={initializingCandidateId !== null}
                                className="h-7 px-2 text-[11px] gap-1 text-text-muted hover:text-text cursor-pointer"
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
            <Card className="border-border p-8 sm:p-12 text-center">
              <Users className="text-text-muted mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-text text-[14px] font-medium">No candidates with active checklists</p>
              <p className="text-text-muted text-[12px] mt-1">
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
                <Card key={candidate.id} className="border-border bg-surface-1 overflow-hidden shadow-xs">
                  {/* Candidate Header Summary */}
                  <div className="border-border bg-surface-2/40 flex flex-col gap-3 border-b px-4 py-3 sm:px-5 sm:py-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9 border border-border shrink-0">
                        <AvatarFallback className="bg-surface-3 text-text font-semibold text-[12px]">
                          {candidate.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-text text-[14px] font-semibold truncate">
                            {candidate.name}
                          </span>
                          <Badge variant="default" className="text-[11px] font-normal text-text-muted bg-surface-2 px-1.5 py-0.2 shrink-0">
                            {candidate.stage}
                          </Badge>
                          <span className="flex items-center gap-1 text-[11px] text-text-muted bg-surface-2/60 border border-border px-2 py-0.5 rounded-[4px] tabular-nums font-mono">
                            <Calendar className="h-3 w-3 text-accent shrink-0" />
                            <span>Joining: {joiningDate}</span>
                          </span>
                        </div>
                        <p className="text-text-muted text-[12px] truncate">
                          {candidate.currentRole} • {candidate.currentCompany}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                      {/* Progress Indicator */}
                      <div className="flex items-center gap-2">
                        <div className="text-right shrink-0">
                          <span className="text-text font-mono text-[12px] font-semibold">
                            {completed}/{total}
                          </span>
                          <span className="text-text-muted text-[11px] ml-1">tasks</span>
                        </div>
                        <Progress value={percent} className="h-2 w-20 sm:w-28" />
                        <Badge
                          variant={percent === 100 ? 'success' : 'default'}
                          className="font-mono text-[11px] shrink-0"
                        >
                          {percent}%
                        </Badge>
                      </div>

                      {/* Add Task for Candidate Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCreateModal(candidate.id)}
                        className="h-8 gap-1 text-[12px] border-border hover:bg-surface-2 shrink-0 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Task</span>
                      </Button>
                    </div>
                  </div>

                  {/* Tasks List by Phase Accordion/Groupings */}
                  <CardContent className="p-0 divide-y divide-border/60">
                    {PHASES.map((phase) => {
                      const phaseTasks = candidateTasks.filter((t) => t.phase === phase);
                      if (phaseTasks.length === 0) return null;

                      const phaseCompleted = phaseTasks.filter((t) => t.done).length;

                      return (
                        <div key={phase} className="p-4 sm:p-5">
                          {/* Phase Title & Completion */}
                          <div className="flex items-center justify-between pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-text text-[13px] font-semibold tracking-tight">
                                {phase}
                              </span>
                              <span className="text-text-subtle font-mono text-[11px]">
                                ({phaseCompleted}/{phaseTasks.length})
                              </span>
                            </div>
                            <span className="text-text-subtle text-[11px] font-medium hidden sm:inline">
                              {phase === 'Before joining'
                                ? 'Pre-boarding compliance & equipment setup'
                                : phase === 'Day 1'
                                  ? 'First-day welcome & team introduction'
                                  : '30-day performance & cultural check-in'}
                            </span>
                          </div>

                          {/* Phase Checklist Tasks Grid */}
                          <div className="space-y-2">
                            {phaseTasks.map((task) => (
                              <div
                                key={task.id}
                                className={cn(
                                  'group border border-border/80 flex items-start justify-between gap-3 rounded-[8px] p-3 transition-colors',
                                  task.done
                                    ? 'bg-surface-2/40 opacity-75'
                                    : 'bg-surface-1 hover:bg-surface-2/30 hover:border-border-strong'
                                )}
                              >
                                <div className="flex items-start gap-3 min-w-0">
                                  <Checkbox
                                    id={task.id}
                                    checked={task.done}
                                    onCheckedChange={(checked) =>
                                      handleToggle(task.id, task.done, task.title)
                                    }
                                    className="mt-0.5 cursor-pointer"
                                  />
                                  <div className="space-y-0.5 min-w-0">
                                    <label
                                      htmlFor={task.id}
                                      className={cn(
                                        'block text-[13px] font-medium cursor-pointer leading-snug',
                                        task.done
                                          ? 'line-through text-text-muted font-normal'
                                          : 'text-text'
                                      )}
                                    >
                                      {task.title}
                                    </label>
                                    {task.notes && (
                                      <p className="text-text-subtle text-[12px] truncate">
                                        {task.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                                  <Badge
                                    variant="default"
                                    className={cn(
                                      'text-[10px] font-medium py-0 px-1.5',
                                      task.owner === 'HR'
                                        ? 'border-accent/30 text-accent bg-accent/10'
                                        : 'border-border text-text-muted bg-surface-3'
                                    )}
                                  >
                                    {task.owner}
                                  </Badge>

                                  <span className="text-text-subtle text-[11px] font-mono tabular-nums hidden sm:inline">
                                    {formatDate(task.dueDate, 'dd MMM')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {candidateTasks.length === 0 && (
                      <div className="p-6 text-center text-text-muted text-[12px]">
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
                      <div className="bg-surface-3 flex h-7 w-7 items-center justify-center rounded-[6px] shrink-0">
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
                            className={`flex items-start justify-between gap-2.5 sm:gap-3 rounded-[var(--radius-md)] border p-2.5 sm:p-3 transition-colors min-w-0 ${
                              item.done
                                ? 'border-border/60 bg-surface-2/30'
                                : 'border-border bg-surface-1 hover:border-border-strong hover:bg-surface-2/50'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0 flex-1 overflow-hidden">
                              <Checkbox
                                checked={item.done}
                                onCheckedChange={() => handleToggle(item.id, item.done, item.title)}
                                className="mt-0.5 shrink-0"
                              />
                              <div className="min-w-0 space-y-1 flex-1 overflow-hidden">
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
                                  <div className="flex items-center gap-1.5 text-text-muted text-[11px] truncate">
                                    <Avatar className="h-4 w-4 shrink-0">
                                      <AvatarFallback className="text-[8px] bg-surface-3">
                                        {candidate.name.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-text font-medium truncate">{candidate.name}</span>
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
                                className="text-[10px] px-1.5 py-0 text-text-muted font-normal bg-surface-2"
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
          <div className="border-b border-border/80 bg-surface-2/30 flex items-center justify-between px-4 py-3 sm:px-5">
            <span className="text-text text-[14px] font-semibold tracking-tight">
              Unified Checklist
            </span>
            <div className="text-text-muted text-[12px]">
              <span className="font-semibold text-text">{filteredItems.filter((i) => i.done).length}</span> of {filteredItems.length} completed
            </div>
          </div>

          <div className="overflow-x-auto -mx-px">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-border/80 bg-surface-2/50 text-[11px] font-medium text-text-subtle uppercase tracking-wider select-none">
                  <th className="py-2.5 px-3.5 sm:px-4 w-12 text-center">
                    <span className="sr-only">Status Toggle</span>
                  </th>
                  <th className="py-2.5 px-3 font-medium min-w-[260px]">Task</th>
                  <th className="py-2.5 px-3 font-medium w-[170px]">New Hire</th>
                  <th className="py-2.5 px-3 font-medium w-[130px]">Phase</th>
                  <th className="py-2.5 px-3 font-medium w-[100px]">Owner</th>
                  <th className="py-2.5 px-3 font-medium w-[110px]">Due Date</th>
                  <th className="py-2.5 pr-4 sm:pr-5 font-medium text-right w-[100px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-[13px]">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-text-muted text-[13px]">
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
                          className="py-3 px-3.5 sm:px-4 text-center align-middle cursor-pointer"
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
                        <td className="py-3 px-3 align-middle">
                          <div className="flex flex-col gap-0.5 pr-2">
                            <span
                              className={cn(
                                'text-[13px] font-medium leading-snug break-words',
                                item.done
                                  ? 'text-text-muted line-through decoration-text-subtle/40'
                                  : 'text-text'
                              )}
                            >
                              {item.title}
                            </span>
                            {item.notes && (
                              <p className="text-text-subtle text-[11px] line-clamp-1">{item.notes}</p>
                            )}
                          </div>
                        </td>

                        {/* New Hire */}
                        <td className="py-3 px-3 align-middle whitespace-nowrap">
                          {candidate ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5 border border-border/80 shrink-0">
                                <AvatarFallback className="text-[9px] bg-surface-3 text-text font-semibold">
                                  {candidate.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[12px] font-medium text-text truncate max-w-[130px]" title={candidate.name}>
                                {candidate.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-text-subtle text-[12px]">—</span>
                          )}
                        </td>

                        {/* Phase */}
                        <td className="py-3 px-3 align-middle whitespace-nowrap">
                          <Badge
                            variant="default"
                            className="text-[11px] font-normal text-text bg-surface-2 border border-border/70 px-2 py-0.5 rounded-[4px]"
                          >
                            {item.phase}
                          </Badge>
                        </td>

                        {/* Owner */}
                        <td className="py-3 px-3 align-middle whitespace-nowrap">
                          <Badge
                            variant="default"
                            className="text-[11px] text-text-muted font-normal bg-surface-2 border border-border/60 px-2 py-0.5 rounded-[4px]"
                          >
                            {item.owner}
                          </Badge>
                        </td>

                        {/* Due Date */}
                        <td className="py-3 px-3 align-middle whitespace-nowrap">
                          <span className="text-text-subtle flex items-center gap-1.5 font-mono text-[12px]">
                            <Calendar className="h-3.5 w-3.5 text-text-subtle/70 shrink-0" />
                            <span>{formatDate(item.dueDate, 'dd MMM')}</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 pr-4 sm:pr-5 align-middle text-right whitespace-nowrap">
                          {item.done ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text bg-surface-2 border border-border/80 px-2 py-0.5 rounded-[4px]">
                              <Check className="h-3 w-3 text-text" />
                              <span>Done</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-normal text-text-subtle bg-surface-2/60 border border-border/60 px-2 py-0.5 rounded-[4px]">
                              <Clock className="h-3 w-3 text-text-subtle/70" />
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
        <DialogContent className="w-[95vw] sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
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
              <DatePicker
                value={newTaskDueDate}
                onChange={(val) => setNewTaskDueDate(val || '2026-11-01')}
                placeholder="Select due date"
                className="bg-surface-2 border-border text-[13px] h-9"
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
