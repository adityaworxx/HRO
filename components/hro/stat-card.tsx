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
        'border-border bg-surface-1 hover:border-border-strong hover:bg-surface-2/30 flex h-full min-h-[96px] flex-col justify-between overflow-hidden rounded-[12px] border p-4 transition-all duration-140 sm:p-5',
        href && 'cursor-pointer focus:outline-none focus-visible:outline-none',
        className
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="text-text-muted truncate text-[13px] leading-[18px] font-medium select-none">
          {label}
        </span>
        {icon && (
          <div className="bg-surface-2 text-text-subtle group-hover:text-text flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] transition-colors">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex min-w-0 items-baseline justify-between gap-1.5">
        <span className="text-text shrink-0 font-sans text-[24px] leading-[30px] font-semibold tracking-tight tabular-nums sm:text-[28px] sm:leading-[32px]">
          {value}
        </span>
        {delta && (
          <span
            className="text-text-muted max-w-full truncate text-right text-[11px] leading-[16px] font-medium select-none sm:text-[12px]"
            title={delta}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group block h-full focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
