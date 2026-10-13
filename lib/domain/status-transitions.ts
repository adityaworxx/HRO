import type { OPENING_STATUSES, CANDIDATE_STAGES } from '@/lib/constants';

export type OpeningStatus = (typeof OPENING_STATUSES)[number];
export type CandidateStage = (typeof CANDIDATE_STAGES)[number];

const OPENING_TRANSITION_MAP: Record<OpeningStatus, readonly OpeningStatus[]> = {
  Open: ['Sourcing', 'On Hold', 'Closed'],
  Sourcing: ['Shortlist Shared', 'On Hold', 'Closed'],
  'Shortlist Shared': ['Interviewing', 'Sourcing', 'On Hold', 'Closed'],
  Interviewing: ['Offer Stage', 'Sourcing', 'On Hold', 'Closed'],
  'Offer Stage': ['Filled', 'Sourcing', 'On Hold', 'Closed'],
  Filled: ['Closed'],
  'On Hold': ['Open', 'Sourcing', 'Interviewing', 'Closed'],
  Closed: [],
};

const CANDIDATE_STAGE_MAP: Record<CandidateStage, readonly CandidateStage[]> = {
  Sourced: ['Shared with Manager', 'Rejected'],
  'Shared with Manager': ['Interview', 'Rejected'],
  Interview: ['Selected', 'Rejected'],
  Selected: ['Offer Sent', 'Rejected'],
  'Offer Sent': ['Joined', 'Rejected'],
  Joined: [],
  Rejected: [],
};

export function isValidOpeningStatusTransition(from: OpeningStatus, to: OpeningStatus): boolean {
  if (from === to) return true;
  const allowed = OPENING_TRANSITION_MAP[from] ?? [];
  return allowed.includes(to);
}

export function isValidCandidateStageTransition(from: CandidateStage, to: CandidateStage): boolean {
  if (from === to) return true;
  const allowed = CANDIDATE_STAGE_MAP[from] ?? [];
  return allowed.includes(to);
}

export function getNextAllowedOpeningStatuses(current: OpeningStatus): readonly OpeningStatus[] {
  return OPENING_TRANSITION_MAP[current] ?? [];
}

export function getNextAllowedCandidateStages(current: CandidateStage): readonly CandidateStage[] {
  return CANDIDATE_STAGE_MAP[current] ?? [];
}
