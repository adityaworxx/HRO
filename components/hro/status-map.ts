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
    token: 'info',
    bgVar: 'var(--badge-info-bg)',
    textVar: 'var(--info)',
  },
  Sourcing: {
    label: 'Sourcing',
    token: 'info',
    bgVar: 'var(--badge-info-bg)',
    textVar: 'var(--info)',
  },
  Interviewing: {
    label: 'Interviewing',
    token: 'info',
    bgVar: 'var(--badge-info-bg)',
    textVar: 'var(--info)',
  },
  'Shortlist Shared': {
    label: 'Shortlist Shared',
    token: 'warning',
    bgVar: 'var(--badge-warning-bg)',
    textVar: 'var(--warning)',
  },
  'Offer Stage': {
    label: 'Offer Stage',
    token: 'warning',
    bgVar: 'var(--badge-warning-bg)',
    textVar: 'var(--warning)',
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
    textVar: 'var(--text-subtle)',
  },
  Closed: {
    label: 'Closed',
    token: 'neutral',
    bgVar: 'var(--badge-neutral-bg)',
    textVar: 'var(--text-subtle)',
  },
};

export const CANDIDATE_STAGE_MAP: Record<CandidateStage, StatusConfig> = {
  Sourced: {
    label: 'Sourced',
    token: 'neutral',
    bgVar: 'var(--badge-neutral-bg)',
    textVar: 'var(--text-subtle)',
  },
  'Shared with Manager': {
    label: 'Shared with Manager',
    token: 'warning',
    bgVar: 'var(--badge-warning-bg)',
    textVar: 'var(--warning)',
  },
  Interview: {
    label: 'Interview',
    token: 'info',
    bgVar: 'var(--badge-info-bg)',
    textVar: 'var(--info)',
  },
  Selected: {
    label: 'Selected',
    token: 'success',
    bgVar: 'var(--badge-success-bg)',
    textVar: 'var(--success)',
  },
  'Offer Sent': {
    label: 'Offer Sent',
    token: 'warning',
    bgVar: 'var(--badge-warning-bg)',
    textVar: 'var(--warning)',
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
