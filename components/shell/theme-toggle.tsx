'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Monitor } from 'lucide-react';
import { UntitledMoonIcon, UntitledSunIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn('text-text-subtle relative h-9 w-9', className)}
        disabled
      >
        <UntitledMoonIcon className="h-4 w-4" />
      </Button>
    );
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'text-text-subtle hover:text-text hover:bg-surface-2 relative h-9 w-9 cursor-pointer overflow-hidden rounded-[var(--radius-md)] transition-colors',
        className
      )}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <UntitledSunIcon className="h-4 w-4 scale-100 rotate-0 transition-all duration-300" />
      ) : (
        <UntitledMoonIcon className="h-4 w-4 scale-100 rotate-0 transition-all duration-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function ThemeSegmented({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div
        className={cn(
          'border-border bg-surface-2 flex h-8 items-center rounded-lg border p-0.5',
          className
        )}
      >
        <div className="h-7 w-7 rounded-md" />
      </div>
    );
  }

  const options = [
    { value: 'light', label: 'Light', icon: UntitledSunIcon },
    { value: 'dark', label: 'Dark', icon: UntitledMoonIcon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <div
      className={cn(
        'border-border bg-surface-2 flex items-center rounded-[var(--radius-md)] border p-0.5 text-xs',
        className
      )}
      role="radiogroup"
      aria-label="Theme selection"
    >
      {options.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              'flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-1 font-medium transition-all',
              active ? 'bg-surface-1 text-text shadow-xs' : 'text-text-muted hover:text-text'
            )}
            aria-checked={active}
            role="radio"
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
