import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'bg-surface-2 text-text placeholder:text-text-subtle focus-visible:ring-accent flex min-h-[80px] w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[14px] shadow-none transition-colors duration-[150ms] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-danger focus-visible:ring-danger'
            : 'border-border focus-visible:border-border-strong',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
