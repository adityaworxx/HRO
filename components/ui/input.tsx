import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'bg-surface-2 text-text placeholder:text-text-subtle flex h-9 w-full rounded-[var(--radius-sm)] border px-3 py-1 text-[14px] shadow-none transition-colors duration-[150ms] focus-visible:outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-danger'
            : 'border-border focus:border-border-strong focus-visible:border-border-strong',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
