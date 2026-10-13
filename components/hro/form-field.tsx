import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function FormField({
  label,
  hint,
  error,
  required,
  children,
  className,
  id,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-text text-[13px] font-medium select-none">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
        {hint && <span className="text-text-subtle text-[12px]">{hint}</span>}
      </div>

      {children}

      {error && (
        <span role="alert" className="text-danger text-[12px] font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
