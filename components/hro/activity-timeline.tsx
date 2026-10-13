import * as React from 'react';
import type { ActivityEvent } from '@/types/entities';
import { formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

export interface ActivityTimelineProps {
  events: ActivityEvent[];
  className?: string;
}

export function ActivityTimeline({ events, className }: ActivityTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-text-muted py-8 text-center text-[13px]">No recorded activity yet.</div>
    );
  }

  return (
    <div
      className={cn(
        'before:bg-border relative space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-[1px]',
        className
      )}
    >
      {events.map((event) => (
        <div key={event.id} className="relative flex flex-col gap-1">
          <div className="border-border bg-surface-1 absolute top-1.5 -left-6 flex h-3 w-3 items-center justify-center rounded-full border">
            <span className="bg-accent h-1.5 w-1.5 rounded-full" />
          </div>

          <div className="flex items-center gap-2 text-[12px]">
            <span className="text-text font-semibold">{event.actor}</span>
            <span className="text-text-subtle flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(event.timestamp)}
            </span>
          </div>

          <p className="text-text-muted text-[13px] leading-relaxed">{event.message}</p>
        </div>
      ))}
    </div>
  );
}
