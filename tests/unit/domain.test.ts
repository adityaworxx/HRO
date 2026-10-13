import { describe, it, expect } from 'vitest';
import {
  isValidOpeningStatusTransition,
  isValidCandidateStageTransition,
} from '@/lib/domain/status-transitions';
import { deriveOnboardingProgress, isJoinerOverdue } from '@/lib/domain/derive';
import { can } from '@/lib/domain/permissions';

describe('Domain: Status Transitions', () => {
  it('allows valid opening status transitions', () => {
    expect(isValidOpeningStatusTransition('Open', 'Sourcing')).toBe(true);
    expect(isValidOpeningStatusTransition('Sourcing', 'Shortlist Shared')).toBe(true);
    expect(isValidOpeningStatusTransition('Shortlist Shared', 'Interviewing')).toBe(true);
    expect(isValidOpeningStatusTransition('Interviewing', 'Offer Stage')).toBe(true);
    expect(isValidOpeningStatusTransition('Offer Stage', 'Filled')).toBe(true);
  });

  it('rejects invalid opening status transitions', () => {
    expect(isValidOpeningStatusTransition('Closed', 'Open')).toBe(false);
    expect(isValidOpeningStatusTransition('Filled', 'Sourcing')).toBe(false);
  });

  it('validates candidate stage transitions', () => {
    expect(isValidCandidateStageTransition('Sourced', 'Shared with Manager')).toBe(true);
    expect(isValidCandidateStageTransition('Shared with Manager', 'Interview')).toBe(true);
    expect(isValidCandidateStageTransition('Interview', 'Selected')).toBe(true);
    expect(isValidCandidateStageTransition('Joined', 'Sourced')).toBe(false);
  });
});

describe('Domain: Derived Computations', () => {
  it('correctly calculates onboarding progress percentage', () => {
    const tasks = [
      { id: '1', dueDate: '2026-12-01T00:00:00Z', done: true },
      { id: '2', dueDate: '2026-12-02T00:00:00Z', done: false },
    ];
    const progress = deriveOnboardingProgress(tasks);
    expect(progress.total).toBe(2);
    expect(progress.completed).toBe(1);
    expect(progress.percentage).toBe(50);
    expect(progress.isComplete).toBe(false);
  });

  it('identifies overdue joiners when joining date passed with unfinished tasks', () => {
    const tasks = [{ id: '1', dueDate: '2020-01-01T00:00:00Z', done: false }];
    const isOverdue = isJoinerOverdue('2020-01-01T00:00:00Z', tasks);
    expect(isOverdue).toBe(true);
  });
});

describe('Domain: Permissions', () => {
  const managerUser = {
    id: 'm1',
    name: 'Test Manager',
    role: 'manager' as const,
    department: 'Tech',
  };

  const hrUser = {
    id: 'h1',
    name: 'Test HR',
    role: 'hr' as const,
    department: 'People',
  };

  it('enforces role boundaries', () => {
    expect(can(managerUser, 'create_opening')).toBe(true);
    expect(can(hrUser, 'create_opening')).toBe(false);

    expect(can(hrUser, 'add_candidate')).toBe(true);
    expect(can(managerUser, 'add_candidate')).toBe(false);

    expect(can(hrUser, 'manage_onboarding')).toBe(true);
    expect(can(managerUser, 'manage_onboarding')).toBe(false);
  });
});
