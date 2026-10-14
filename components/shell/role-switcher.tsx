'use client';

import * as React from 'react';
import { useUiStore } from '@/lib/store';
import { useSwitchRole } from '@/features/auth/hooks';
import { ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RoleSwitcher({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const { role, setRole } = useUiStore();
  const switchRole = useSwitchRole();

  const handleToggle = () => {
    const nextRole = role === 'manager' ? 'hr' : 'manager';
    setRole(nextRole);
    switchRole.mutate(nextRole);
  };

  const isManager = role === 'manager';

  if (isCollapsed) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className="text-text-subtle hover:text-text mx-auto h-9 w-9"
        title={`Current role: ${isManager ? 'Manager' : 'HR'}. Click to switch.`}
      >
        <ArrowLeftRight className="text-accent h-4 w-4" />
        <span className="sr-only">Switch Demo Role</span>
      </Button>
    );
  }

  return (
    <div className="border-border bg-surface-2 flex flex-col gap-2 rounded-[var(--radius-sm)] border p-2.5">
      <div className="text-text-subtle flex items-center justify-between text-[11px]">
        <span>DEMO ROLE</span>
        <span className="text-accent font-mono font-semibold uppercase">
          {isManager ? 'Manager' : 'HR'}
        </span>
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleToggle}
        className="bg-surface-1 hover:bg-surface-3 h-7 w-full justify-center gap-1.5 text-[12px]"
      >
        <ArrowLeftRight className="text-accent h-3.5 w-3.5" />
        <span>Switch to {isManager ? 'HR View' : 'Manager View'}</span>
      </Button>
    </div>
  );
}
