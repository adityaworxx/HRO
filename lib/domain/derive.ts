import { differenceInDays, parseISO, isValid, isBefore } from 'date-fns';

export interface OnboardingTaskLike {
  id: string;
  dueDate: string;
  done: boolean;
}

export interface OnboardingProgress {
  total: number;
  completed: number;
  percentage: number;
  isComplete: boolean;
  hasOverdueTasks: boolean;
}

export function deriveDaysOpen(createdAt: string): number {
  try {
    const created = parseISO(createdAt);
    if (!isValid(created)) return 0;
    return Math.max(0, differenceInDays(new Date(), created));
  } catch {
    return 0;
  }
}

export function deriveOnboardingProgress(tasks: readonly OnboardingTaskLike[]): OnboardingProgress {
  const total = tasks.length;
  if (total === 0) {
    return {
      total: 0,
      completed: 0,
      percentage: 100,
      isComplete: true,
      hasOverdueTasks: false,
    };
  }

  const completed = tasks.filter((t) => t.done).length;
  const percentage = Math.round((completed / total) * 100);
  const now = new Date();

  const hasOverdueTasks = tasks.some((t) => {
    if (t.done) return false;
    try {
      const due = parseISO(t.dueDate);
      return isValid(due) && isBefore(due, now);
    } catch {
      return false;
    }
  });

  return {
    total,
    completed,
    percentage,
    isComplete: completed === total,
    hasOverdueTasks,
  };
}

export function isJoinerOverdue(
  joiningDate: string,
  tasks: readonly OnboardingTaskLike[]
): boolean {
  try {
    const joinDate = parseISO(joiningDate);
    const now = new Date();
    const joinDatePassed = isValid(joinDate) && isBefore(joinDate, now);
    const hasIncompleteTasks = tasks.some((t) => !t.done);

    return joinDatePassed && hasIncompleteTasks;
  } catch {
    return false;
  }
}
