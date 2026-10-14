import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  href?: string;
  isWarning?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  delta,
  href,
  isWarning = false,
  className,
  icon,
}: StatCardProps) {
  const content = (
    <div
      className={cn(
        'border-border bg-surface-1 hover:border-border-strong hover:bg-surface-2/30 flex flex-col justify-between rounded-[12px] border p-5 transition-all duration-140',
        href &&
          'focus-visible:ring-accent cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-text-muted text-[13px] leading-[18px] font-medium select-none">
          {label}
        </span>
        {icon && (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-surface-2 text-text-subtle transition-colors group-hover:text-text">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-text font-mono text-[28px] leading-[32px] font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              'text-[12px] font-medium leading-[16px] truncate select-none',
              isWarning
                ? 'text-warning'
                : delta.startsWith('+')
                  ? 'text-accent'
                  : 'text-text-subtle'
            )}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
