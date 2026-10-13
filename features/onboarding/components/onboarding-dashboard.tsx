'use client';

import * as React from 'react';
import { useAllOnboarding, useToggleOnboardingTask, useCreateOnboardingTask } from '../hooks';
import { useCandidates } from '@/features/candidates/hooks';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/format';
import { Clock, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';

const PHASES = ['Before joining', 'Day 1', 'First 30 days'] as const;

export function OnboardingDashboard() {
  const { data: onboardingItems = [], isLoading } = useAllOnboarding();
  const { data: candidates = [] } = useCandidates();
  const toggleTask = useToggleOnboardingTask();
  const createTask = useCreateOnboardingTask();

  // Candidates who are at Joined or Offer Sent stage (or candidates in onboarding)
  const candidateIdsWithTasks = Array.from(new Set(onboardingItems.map((i) => i.candidateId)));
  const onboardingCandidates = candidates.filter(
    (c) => candidateIdsWithTasks.includes(c.id) || c.stage === 'Joined' || c.stage === 'Offer Sent'
  );

  const [selectedCandidateId, setSelectedCandidateId] = React.useState<string>('all');
  const [selectedOwner, setSelectedOwner] = React.useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = React.useState(false);

  // Form states for new task
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [newTaskCandidateId, setNewTaskCandidateId] = React.useState(
    onboardingCandidates[0]?.id ?? ''
  );
  const [newTaskPhase, setNewTaskPhase] = React.useState<
    'Before joining' | 'Day 1' | 'First 30 days'
  >('Before joining');
  const [newTaskOwner, setNewTaskOwner] = React.useState<'HR' | 'Manager'>('HR');
  const [newTaskDueDate, setNewTaskDueDate] = React.useState('2026-11-01');
  const [newTaskNotes, setNewTaskNotes] = React.useState('');

  const filteredItems = React.useMemo(() => {
    return onboardingItems.filter((item) => {
      const matchesCandidate =
        selectedCandidateId === 'all' || item.candidateId === selectedCandidateId;
      const matchesOwner = selectedOwner === 'all' || item.owner === selectedOwner;
      return matchesCandidate && matchesOwner;
    });
  }, [onboardingItems, selectedCandidateId, selectedOwner]);

  const totalTasks = filteredItems.length;
  const completedTasks = filteredItems.filter((i) => i.done).length;
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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

    const targetCandidateId = newTaskCandidateId || candidates[0]?.id;
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
          toast.success('Onboarding task added!');
          setCreateModalOpen(false);
          setNewTaskTitle('');
          setNewTaskNotes('');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-text-muted text-[13px]">Loading onboarding rosters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Progress & Metrics Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-text text-[16px] font-semibold">
                  Readiness Progress Tracker
                </span>
                <Badge variant={completionPercent === 100 ? 'success' : 'accent'}>
                  {completionPercent}% Fulfilled
                </Badge>
              </div>
              <p className="text-text-muted text-[13px]">
                {completedTasks} of {totalTasks} onboarding requirements completed across new hires.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="gap-1.5 self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add Checklist Item</span>
            </Button>
          </div>

          <div className="mt-4">
            <Progress value={completionPercent} className="h-2.5" />
          </div>
        </CardContent>
      </Card>

      {/* Filter and Candidate Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Users className="text-text-muted h-4 w-4" />
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="border-border bg-surface-2 text-text focus:ring-accent h-9 rounded-[var(--radius-sm)] border px-3 text-[13px] outline-none focus:ring-1"
            >
              <option value="all">All Hires ({onboardingCandidates.length})</option>
              {onboardingCandidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.currentRole})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="border-border bg-surface-2 text-text focus:ring-accent h-9 rounded-[var(--radius-sm)] border px-3 text-[13px] outline-none focus:ring-1"
            >
              <option value="all">All Owners (HR & Manager)</option>
              <option value="HR">HR Responsible</option>
              <option value="Manager">Manager Responsible</option>
            </select>
          </div>
        </div>

        <span className="text-text-muted text-[13px]">
          Showing <strong className="text-text">{filteredItems.length}</strong> checklist tasks
        </span>
      </div>

      {/* Grouped by Phase */}
      <div className="space-y-6">
        {PHASES.map((phase) => {
          const phaseItems = filteredItems.filter((i) => i.phase === phase);
          const phaseCompleted = phaseItems.filter((i) => i.done).length;

          return (
            <Card key={phase} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-[16px]">{phase}</CardTitle>
                    <Badge variant="default" className="font-mono text-[11px]">
                      {phaseCompleted}/{phaseItems.length} Done
                    </Badge>
                  </div>
                  <CardDescription className="text-[12px]">
                    {phase === 'Before joining'
                      ? 'Pre-onboarding tasks, background verification, and equipment ordering.'
                      : phase === 'Day 1'
                        ? 'Welcome session, account access, workstation setup, and buddy intro.'
                        : 'First 30 days ramping milestones, check-ins, and performance alignment.'}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-2.5">
                {phaseItems.length === 0 ? (
                  <p className="text-text-muted py-4 text-center text-[12px]">
                    No tasks configured for this phase.
                  </p>
                ) : (
                  phaseItems.map((item) => {
                    const candidate = candidates.find((c) => c.id === item.candidateId);

                    return (
                      <div
                        key={item.id}
                        className={`flex items-start justify-between gap-3 rounded-[var(--radius-md)] border p-3.5 transition-colors ${
                          item.done
                            ? 'border-border/60 bg-surface-2/30 opacity-75'
                            : 'border-border bg-surface-1 hover:bg-surface-2'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={item.done}
                            onCheckedChange={() => handleToggle(item.id, item.done, item.title)}
                            className="mt-0.5"
                          />
                          <div className="space-y-1">
                            <span
                              className={`text-[13px] font-medium ${
                                item.done ? 'text-text-muted line-through' : 'text-text'
                              }`}
                            >
                              {item.title}
                            </span>
                            {candidate && (
                              <p className="text-text-muted text-[11px]">
                                Assignee: <strong className="text-text">{candidate.name}</strong> •{' '}
                                {candidate.currentRole}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-text-subtle text-[11px] italic">{item.notes}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant={item.owner === 'HR' ? 'accent' : 'default'}
                              className="text-[10px]"
                            >
                              Owner: {item.owner}
                            </Badge>
                            <Badge
                              variant={item.done ? 'success' : 'default'}
                              className="text-[10px]"
                            >
                              {item.done ? 'Done' : item.status}
                            </Badge>
                          </div>
                          <span className="text-text-subtle flex items-center gap-1 text-[11px]">
                            <Clock className="h-3 w-3" />
                            <span>Due: {formatDate(item.dueDate)}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Task Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Onboarding Checklist Item</DialogTitle>
            <DialogDescription>
              Assign a new pre-boarding or ramp-up task for an incoming hire.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-4 py-2 text-[13px]">
            <div className="space-y-1.5">
              <label className="text-text text-[13px] font-medium">Task Title</label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Issue MacBook Pro & Security Key"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-text text-[13px] font-medium">Select New Hire</label>
              <select
                value={newTaskCandidateId}
                onChange={(e) => setNewTaskCandidateId(e.target.value)}
                className="border-border bg-surface-2 text-text h-9 w-full rounded border px-3 text-[13px]"
              >
                {onboardingCandidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.currentRole}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-text text-[13px] font-medium">Onboarding Phase</label>
                <select
                  value={newTaskPhase}
                  onChange={(e) =>
                    setNewTaskPhase(e.target.value as 'Before joining' | 'Day 1' | 'First 30 days')
                  }
                  className="border-border bg-surface-2 text-text h-9 w-full rounded border px-3 text-[13px]"
                >
                  <option value="Before joining">Before joining</option>
                  <option value="Day 1">Day 1</option>
                  <option value="First 30 days">First 30 days</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-text text-[13px] font-medium">Responsible Owner</label>
                <select
                  value={newTaskOwner}
                  onChange={(e) => setNewTaskOwner(e.target.value as 'HR' | 'Manager')}
                  className="border-border bg-surface-2 text-text h-9 w-full rounded border px-3 text-[13px]"
                >
                  <option value="HR">HR Team</option>
                  <option value="Manager">Hiring Manager</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-text text-[13px] font-medium">Due Date</label>
              <Input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-text text-[13px] font-medium">Additional Instructions</label>
              <Textarea
                rows={2}
                value={newTaskNotes}
                onChange={(e) => setNewTaskNotes(e.target.value)}
                placeholder="Special notes or contact details..."
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={createTask.isPending}>
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
