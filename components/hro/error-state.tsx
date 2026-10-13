import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error loading this data. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'border-danger/20 bg-surface-1 flex min-h-[300px] flex-col items-center justify-center rounded-[var(--radius-md)] border p-8 text-center',
        className
      )}
    >
      <div className="text-danger mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--badge-danger-bg)]">
        <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h3 className="text-text mb-1 text-[16px] font-semibold">{title}</h3>
      <p className="text-text-muted mb-6 max-w-sm text-[13px]">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
