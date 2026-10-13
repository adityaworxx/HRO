import type { OpeningStatus, CandidateStage } from '@/lib/domain/status-transitions';

export type StatusColorToken = 'info' | 'warning' | 'success' | 'danger' | 'neutral';

export interface StatusConfig {
  label: string;
  token: StatusColorToken;
  bgVar: string;
  textVar: string;
}

export const OPENING_STATUS_MAP: Record<OpeningStatus, StatusConfig> = {
  Open: {
    label: 'Open',
    token: 'neutral',
    bgVar: 'var(--badge-neutral-bg)',
    textVar: 'var(--text-muted)',
  },
  Sourcing: {
    label: 'Sourcing',
    token: 'neutral',
    bgVar: 'var(--badge-neutral-bg)',
    textVar: 'var(--text-muted)',
  },
  Interviewing: {
    label: 'Interviewing',
    token: 'neutral',
    bgVar: 'var(--badge-neutral-bg)',
    textVar: 'var(--text-muted)',
  },
  'Shortlist Shared': {
    label: 'Shortlist Shared',
    token: 'neutral',
    bgVar: 'var(--badge-neutral-bg)',
    textVar: 'var(--text-muted)',
  },
  'Offer Stage': {
    label: 'Offer Stage',
    token: 'neutral',
    bgVar: 'var(--badge-neutral-bg)',
    textVar: 'var(--text-muted)',
  },
  Filled: {
    label: 'Filled',
    token: 'success',
    bgVar: 'var(--badge-success-bg)',
    textVar: 'var(--success)',
  },
  'On Hold': {
    label: 'On Hold',
    token: 'neutral',
    bgVar: 'var(--badge-neutral-bg)',
    textVar: 'var(--text-muted)',
  },
  Closed: {
    label: 'Closed',
    token: 'neutral',
    bgVar: 'var(--badge-neutral-bg)',
    textVar: 'var(--text-muted)',
  },
};

export const CANDIDATE_STAGE_MAP: Record<CandidateStage, StatusConfig> = {
  Sourced: {
    label: 'Sourced',
    token: 'neutral',
    bgVar: 'var(--badge-neutral-bg)',
    textVar: 'var(--text-muted)',
  },
  'Shared with Manager': {
    label: 'Shared with Manager',
    token: 'neutral',
    bgVar: 'var(--badge-neutral-bg)',
    textVar: 'var(--text-muted)',
  },
  Interview: {
    label: 'Interview',
    token: 'neutral',
    bgVar: 'var(--badge-neutral-bg)',
    textVar: 'var(--text-muted)',
  },
  Selected: {
    label: 'Selected',
    token: 'success',
    bgVar: 'var(--badge-success-bg)',
    textVar: 'var(--success)',
  },
  'Offer Sent': {
    label: 'Offer Sent',
    token: 'neutral',
    bgVar: 'var(--badge-neutral-bg)',
    textVar: 'var(--text-muted)',
  },
  Joined: {
    label: 'Joined',
    token: 'success',
    bgVar: 'var(--badge-success-bg)',
    textVar: 'var(--success)',
  },
  Rejected: {
    label: 'Rejected',
    token: 'danger',
    bgVar: 'var(--badge-danger-bg)',
    textVar: 'var(--danger)',
  },
};
