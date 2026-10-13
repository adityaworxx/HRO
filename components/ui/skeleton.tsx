import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-surface-3 animate-pulse rounded-[var(--radius-sm)]', className)}
      {...props}
    />
  );
}
