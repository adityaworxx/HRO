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
}

export function StatCard({
  label,
  value,
  delta,
  href,
  isWarning = false,
  className,
}: StatCardProps) {
  const content = (
    <div
      className={cn(
        'border-border bg-surface-1 hover:border-border-strong flex flex-col justify-between rounded-[var(--radius-lg)] border px-6 py-5 shadow-none transition-colors',
        href &&
          'focus-visible:ring-accent cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        className
      )}
    >
      <span className="text-text-muted text-[13px] leading-[20px] font-medium select-none">
        {label}
      </span>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-text font-mono text-[28px] leading-[32px] font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              'text-[12px] leading-[16px]',
              isWarning ? 'text-warning font-medium' : 'text-text-muted font-normal'
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
