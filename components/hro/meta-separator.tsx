import * as React from 'react';
import { cn } from '@/lib/utils';

export interface MetaSeparatorProps {
  className?: string;
}

export function MetaSeparator({ className }: MetaSeparatorProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('text-text-subtle mx-2 font-normal select-none', className)}
    >
      ·
    </span>
  );
}
