import * as React from 'react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  className?: string;
}

export function StatCard({ label, value, delta, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'border-border bg-surface-1 hover:border-border-strong flex flex-col justify-between rounded-[var(--radius-md)] border p-5 shadow-none transition-colors',
        className
      )}
    >
      <span className="text-text-muted text-[13px] font-medium">{label}</span>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-text font-mono text-[28px] font-semibold tracking-tight">
          {value}
        </span>
        {delta && <span className="text-text-subtle text-[12px] font-medium">{delta}</span>}
      </div>
    </div>
  );
}
