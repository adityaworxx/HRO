import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-2 py-0.5 text-[12px] font-medium transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface-2 text-text',
        accent: 'border-transparent bg-accent-subtle text-accent',
        success: 'border-transparent bg-[var(--badge-success-bg)] text-success',
        warning: 'border-transparent bg-[var(--badge-warning-bg)] text-warning',
        danger: 'border-transparent bg-[var(--badge-danger-bg)] text-danger',
        info: 'border-transparent bg-[var(--badge-info-bg)] text-info',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
