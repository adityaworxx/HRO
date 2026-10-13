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
          'bg-surface-2 text-text-muted border-border/60 inline-flex h-[22px] items-center gap-1.5 rounded-full border px-2 text-[12px] leading-[16px] font-medium select-none',
          className
        )}
      >
        <span className="bg-text-subtle h-1.5 w-1.5 shrink-0 rounded-full" />
        <span className="truncate">{status}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center gap-1.5 rounded-full px-2 text-[12px] leading-[16px] font-medium select-none',
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
      <span className="truncate">{config.label}</span>
    </span>
  );
}
