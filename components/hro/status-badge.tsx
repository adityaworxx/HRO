import * as React from 'react';
import { OPENING_STATUS_MAP, CANDIDATE_STAGE_MAP, type StatusConfig } from './status-map';
import type { OpeningStatus, CandidateStage } from '@/lib/domain/status-transitions';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status: OpeningStatus | CandidateStage | string;
  type?: 'opening' | 'candidate';
  className?: string;
}

export function StatusBadge({ status, type = 'opening', className }: StatusBadgeProps) {
  let config: StatusConfig | undefined;

  if (type === 'opening') {
    config = OPENING_STATUS_MAP[status as OpeningStatus];
  } else {
    config = CANDIDATE_STAGE_MAP[status as CandidateStage];
  }

  const label = config?.label ?? status;
  const token = config?.token ?? 'neutral';

  const tokenClass =
    {
      neutral: 'border-border/80 bg-surface-2 text-text-muted',
      info: 'border-border/80 bg-surface-2 text-text-muted',
      warning: 'border-border/80 bg-surface-2 text-text-muted',
      success: 'border-border/80 bg-surface-2 text-success',
      danger: 'border-border/80 bg-surface-2 text-danger',
    }[token] ?? 'border-border/80 bg-surface-2 text-text-muted';

  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center rounded-[6px] border px-2 text-[12px] leading-none font-medium select-none',
        tokenClass,
        className
      )}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}
