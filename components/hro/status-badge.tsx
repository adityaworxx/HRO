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

  if (!config) {
    return (
      <span
        className={cn(
          'border-border bg-surface-2 text-text-muted inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-2 py-0.5 text-[12px] font-medium select-none',
          className
        )}
      >
        <span className="bg-text-subtle h-1.5 w-1.5 rounded-full" />
        {status}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-0.5 text-[12px] font-medium select-none',
        className
      )}
      style={{
        backgroundColor: config.bgVar,
        color: config.textVar,
      }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: config.textVar }}
      />
      {config.label}
    </span>
  );
}
