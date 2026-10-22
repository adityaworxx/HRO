'use client';

import * as React from 'react';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SourceBadgeProps {
  source: string;
  className?: string;
  showIcon?: boolean;
}

export function SourceBadge({
  source,
  className,
  showIcon = true,
}: SourceBadgeProps) {
  const normalized = (source || '').trim().toLowerCase();

  if (normalized === 'linkedin') {
    return (
      <span
        className={cn(
          'badge-source-linkedin inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-0.5 text-[10.5px] font-semibold tracking-tight select-none shrink-0 shadow-2xs',
          className
        )}
      >
        {showIcon && (
          <span
            aria-hidden="true"
            className="flex h-3 w-3 items-center justify-center rounded-[2px] bg-[var(--source-linkedin-brand)] text-[8px] font-bold text-white leading-none shrink-0 select-none"
          >
            in
          </span>
        )}
        <span>LinkedIn</span>
      </span>
    );
  }

  if (normalized === 'naukri') {
    return (
      <span
        className={cn(
          'badge-source-naukri inline-flex items-center gap-1.5 rounded-[4px] border px-1.5 py-0.5 text-[10.5px] font-semibold tracking-tight select-none shrink-0 shadow-2xs',
          className
        )}
      >
        {showIcon && (
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[var(--source-naukri-brand)] shrink-0"
          />
        )}
        <span>Naukri</span>
      </span>
    );
  }

  if (normalized === 'indeed') {
    return (
      <span
        className={cn(
          'badge-source-indeed inline-flex items-center gap-1.5 rounded-[4px] border px-1.5 py-0.5 text-[10.5px] font-semibold tracking-tight select-none shrink-0 shadow-2xs',
          className
        )}
      >
        {showIcon && (
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[var(--source-indeed-brand)] shrink-0"
          />
        )}
        <span>Indeed</span>
      </span>
    );
  }

  if (normalized === 'referral') {
    return (
      <span
        className={cn(
          'badge-source-referral inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-0.5 text-[10.5px] font-semibold tracking-tight select-none shrink-0 shadow-2xs',
          className
        )}
      >
        {showIcon && (
          <Users
            aria-hidden="true"
            className="h-2.5 w-2.5 shrink-0 stroke-[2.5]"
          />
        )}
        <span>Referral</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'badge-source-other inline-flex items-center gap-1.5 rounded-[4px] border px-1.5 py-0.5 text-[10.5px] font-semibold tracking-tight select-none shrink-0 shadow-2xs',
        className
      )}
    >
      {showIcon && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-[var(--source-other-brand)] shrink-0"
        />
      )}
      <span>{source}</span>
    </span>
  );
}
