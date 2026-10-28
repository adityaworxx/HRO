export const OPENING_STATUSES = [
  'Open',
  'Sourcing',
  'Shortlist Shared',
  'Interviewing',
  'Offer Stage',
  'Filled',
  'On Hold',
  'Closed',
] as const;

export const CANDIDATE_STAGES = [
  'Sourced',
  'Shared with Manager',
  'Interview',
  'Selected',
  'Offer Sent',
  'Joined',
  'Rejected',
] as const;

export const CANDIDATE_SOURCES = ['LinkedIn', 'Naukri', 'Indeed', 'Referral', 'Other'] as const;

export const MANAGER_DECISIONS = ['Pending', 'Shortlisted', 'Rejected'] as const;

export const INTERVIEW_OUTCOMES = ['Pending', 'Selected', 'Rejected', 'On Hold'] as const;

export const INTERVIEW_MODES = ['Video', 'Phone', 'Onsite'] as const;

export const URGENCY_LEVELS = ['Low', 'Normal', 'High'] as const;

export const ONBOARDING_OWNERS = ['HR', 'Manager'] as const;

export const ONBOARDING_PHASES = ['Before joining', 'Day 1', 'First 30 days'] as const;

export const ONBOARDING_STATUSES = ['Pending', 'Done', 'Blocked'] as const;

export const LOCAL_STORAGE_KEY = 'hro:v3';
