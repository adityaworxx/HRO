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
            className="flex h-3.5 w-3.5 items-center justify-center rounded-[2px] bg-[var(--source-linkedin-brand)] text-[8.5px] font-bold text-white leading-none shrink-0 select-none"
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
          <img
            src="/icons/naukri.png"
            alt=""
            aria-hidden="true"
            width={14}
            height={14}
            className="h-3.5 w-3.5 rounded-full object-contain shrink-0 select-none"
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
          <img
            src="/icons/indeed.png"
            alt=""
            aria-hidden="true"
            width={14}
            height={14}
            className="h-3.5 w-3.5 rounded-[2px] object-contain shrink-0 select-none"
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
            className="h-3 w-3 shrink-0 stroke-[2.2]"
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
