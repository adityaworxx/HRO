'use client';

import * as React from 'react';
import { useUiStore } from '@/lib/store';
import { useSwitchRole } from '@/features/auth/hooks';
import { ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

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
      <Tooltip open={isCollapsed ? undefined : false}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="text-text-subtle hover:text-text hover:bg-surface-2 h-9 w-9 shrink-0 flex items-center justify-center cursor-pointer transition-colors"
          >
            <ArrowLeftRight className="text-accent h-4 w-4 shrink-0" />
            <span className="sr-only">Switch Demo Role</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={14} className="font-medium text-[12px] z-50">
          Role: {isManager ? 'Manager' : 'HR'} (Click to switch)
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="border-border bg-surface-2 flex flex-col gap-2 rounded-[var(--radius-sm)] border p-2.5 w-full overflow-hidden transition-all duration-200">
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
        className="bg-surface-1 hover:bg-surface-3 h-7 w-full justify-center gap-1.5 text-[12px] cursor-pointer"
      >
        <ArrowLeftRight className="text-accent h-3.5 w-3.5" />
        <span>Switch to {isManager ? 'HR View' : 'Manager View'}</span>
      </Button>
    </div>
  );
}
