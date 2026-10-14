'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { Check, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

export function Toaster({ ...props }: ToasterProps) {
  const { resolvedTheme, theme } = useTheme();
  const currentTheme = (resolvedTheme || theme || 'dark') as ToasterProps['theme'];

  return (
    <Sonner
      theme={currentTheme}
      position="top-center"
      offset="72px"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-surface-1/95 group-[.toaster]:text-text group-[.toaster]:border-border group-[.toaster]:shadow-2xl group-[.toaster]:rounded-[12px] group-[.toaster]:border group-[.toaster]:backdrop-blur-[12px] group-[.toaster]:p-3.5 group-[.toaster]:gap-3',
          title: 'group-[.toast]:text-text text-[13px] font-medium leading-snug',
          description: 'group-[.toast]:text-text-muted text-[12px] leading-snug',
          actionButton:
            'group-[.toast]:bg-accent group-[.toast]:text-bg font-medium rounded-[var(--radius-sm)] text-[12px] px-2.5 py-1',
          cancelButton:
            'group-[.toast]:bg-surface-2 group-[.toast]:text-text font-medium rounded-[var(--radius-sm)] text-[12px] px-2.5 py-1',
        },
      }}
      icons={{
        success: (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-accent">
            <Check className="h-3 w-3 stroke-[2.5]" />
          </span>
        ),
        error: (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--badge-danger-bg)] text-danger">
            <AlertCircle className="h-3 w-3 stroke-[2.5]" />
          </span>
        ),
        warning: (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--badge-warning-bg)] text-warning">
            <AlertTriangle className="h-3 w-3 stroke-[2.5]" />
          </span>
        ),
        info: (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-accent">
            <Info className="h-3 w-3 stroke-[2.5]" />
          </span>
        ),
        loading: (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-text-subtle">
            <Loader2 className="h-3 w-3 animate-spin stroke-[2]" />
          </span>
        ),
      }}
      {...props}
    />
  );
}

