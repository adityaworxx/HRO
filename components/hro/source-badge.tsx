'use client';

import * as React from 'react';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SourceBadgeProps {
  source: string;
  className?: string;
  showIcon?: boolean;
  variant?: 'badge' | 'plain';
}

export function SourceBadge({
  source,
  className,
  showIcon = true,
  variant = 'badge',
}: SourceBadgeProps) {
  const normalized = (source || '').trim().toLowerCase();

  const baseBadgeClass = cn(
    variant === 'plain'
      ? 'inline-flex items-center gap-1.5 text-[11px] font-medium text-text select-none shrink-0'
      : 'inline-flex items-center gap-1.5 rounded-[4px] border border-border bg-surface-2 px-1.5 py-0.5 text-[10.5px] font-medium text-text select-none shrink-0 shadow-2xs',
    className
  );

  if (normalized === 'linkedin') {
    return (
      <span className={baseBadgeClass}>
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
      <span className={baseBadgeClass}>
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
      <span className={baseBadgeClass}>
        {showIcon && (
          <span
            aria-hidden="true"
            className="flex h-3.5 w-3.5 items-center justify-center rounded-[2px] bg-white text-[var(--source-indeed-brand)] shrink-0 select-none shadow-2xs"
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              className="h-2.5 w-2.5 fill-[var(--source-indeed-brand)]"
              aria-hidden="true"
            >
              <path d="M11.566 21.5633v-8.762c.2553.0231.5009.0346.758.0346 1.2225 0 2.3739-.3206 3.3506-.8928v9.6182c0 .8219-.1957 1.4287-.5757 1.8338-.378.4033-.8808.6049-1.491.6049-.6007 0-1.0766-.2016-1.468-.6183-.3781-.4032-.5739-1.01-.5739-1.8184zM11.589.5659c2.5447-.8929 5.4424-.8449 7.6186.987.405.3687.8673.8334 1.0515 1.3806.2207.6913-.7695-.073-.9057-.167-.71-.4532-1.4182-.8334-2.2127-1.0946C12.8614.3873 8.8122 2.709 6.2945 6.315c-1.0516 1.5939-1.7367 3.2721-2.299 5.1174-.0614.2017-.1094.4647-.2207.6413-.1113.2036-.048-.5453-.048-.5702.0845-.7623.2438-1.4997.4414-2.237C5.3292 5.3375 7.897 2.0655 11.5891.5658zm4.9281 7.0587c0 1.6686-1.353 3.0224-3.0205 3.0224-1.6677 0-3.0186-1.3538-3.0186-3.0224 0-1.6687 1.351-3.0224 3.0186-3.0224 1.6676 0 3.0205 1.3518 3.0205 3.0224Z" />
            </svg>
          </span>
        )}
        <span>Indeed</span>
      </span>
    );
  }

  if (normalized === 'referral') {
    return (
      <span className={baseBadgeClass}>
        {showIcon && (
          <Users
            aria-hidden="true"
            className="h-3 w-3 shrink-0 stroke-[2.4] text-[var(--source-referral-brand)]"
          />
        )}
        <span>Referral</span>
      </span>
    );
  }

  return (
    <span className={baseBadgeClass}>
      {showIcon && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-text-subtle shrink-0"
        />
      )}
      <span>{source}</span>
    </span>
  );
}
