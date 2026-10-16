import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OpeningStatus } from '@/lib/domain/status-transitions';

const MAIN_STAGES: OpeningStatus[] = [
  'Open',
  'Sourcing',
  'Shortlist Shared',
  'Interviewing',
  'Offer Stage',
  'Filled',
];

export interface StageStepperProps {
  currentStatus: OpeningStatus;
  className?: string;
}

export function StageStepper({ currentStatus, className }: StageStepperProps) {
  const currentIndex = MAIN_STAGES.indexOf(currentStatus);
  const isSpecialState = currentStatus === 'On Hold' || currentStatus === 'Closed';

  return (
    <div className={cn('w-full py-4', className)}>
      {isSpecialState && (
        <div className="border-warning/30 text-warning mb-3 inline-flex items-center gap-2 rounded-[var(--radius-sm)] border bg-[var(--badge-warning-bg)] px-3 py-1 text-[12px] font-medium">
          Opening is currently: {currentStatus}
        </div>
      )}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
        {MAIN_STAGES.map((stage, index) => {
          const isCompleted = currentIndex > index;
          const isCurrent = currentIndex === index;

          return (
            <React.Fragment key={stage}>
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border text-[12px] font-semibold transition-colors duration-[150ms]',
                    isCompleted
                      ? 'border-success text-success bg-[var(--badge-success-bg)]'
                      : isCurrent
                        ? 'border-accent bg-accent text-white shadow-sm'
                        : 'border-border bg-surface-2 text-text-subtle'
                  )}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[2.5]" /> : index + 1}
                </div>
                <span
                  className={cn(
                    'text-center text-[11px] font-medium whitespace-nowrap',
                    isCurrent ? 'text-text font-semibold' : 'text-text-muted'
                  )}
                >
                  {stage}
                </span>
              </div>

              {index < MAIN_STAGES.length - 1 && (
                <div
                  className={cn(
                    'h-[2px] w-full min-w-[20px] transition-colors',
                    isCompleted ? 'bg-success' : 'bg-border'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
