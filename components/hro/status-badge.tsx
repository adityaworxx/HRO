import * as React from 'react';
import { OPENING_STATUS_MAP, CANDIDATE_STAGE_MAP, type StatusConfig } from './status-map';
import type { OpeningStatus, CandidateStage } from '@/lib/domain/status-transitions';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status: OpeningStatus | CandidateStage | string;
  type?: 'opening' | 'candidate';
  className?: string;
}

const DOT_COLOR_MAP: Record<string, string> = {
  info: 'bg-info',
  warning: 'bg-warning',
  success: 'bg-success',
  danger: 'bg-danger',
  neutral: 'bg-text-subtle',
};

export function StatusBadge({ status, type = 'opening', className }: StatusBadgeProps) {
  let config: StatusConfig | undefined;

  if (type === 'opening') {
    config = OPENING_STATUS_MAP[status as OpeningStatus];
  } else {
    config = CANDIDATE_STAGE_MAP[status as CandidateStage];
  }

  const label = config?.label ?? status;
  const token = config?.token ?? 'neutral';
  const dotColor = DOT_COLOR_MAP[token] ?? 'bg-text-subtle';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-[13px] leading-[20px] font-normal text-text-muted select-none',
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotColor)} />
      <span className="truncate">{label}</span>
    </span>
  );
}
