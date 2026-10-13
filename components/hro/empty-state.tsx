import * as React from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-border bg-surface-1 flex min-h-[320px] flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed p-8 text-center',
        className
      )}
    >
      <div className="bg-surface-2 text-text-subtle mb-4 flex h-12 w-12 items-center justify-center rounded-full">
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h3 className="text-text mb-1 text-[16px] font-semibold">{title}</h3>
      <p className="text-text-muted mb-6 max-w-sm text-[13px] leading-relaxed">{description}</p>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}
