'use client';

import * as React from 'react';
import { useUiStore } from '@/lib/store';
import { useSwitchRole } from '@/features/auth/hooks';
import { ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
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

  return (
    <Tooltip open={isCollapsed ? undefined : false}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'group relative flex h-9 w-full items-center rounded-[8px] border border-border/70 bg-surface-2 text-[12px] font-medium text-text select-none cursor-pointer transition-colors hover:bg-surface-3 hover:border-border overflow-hidden'
          )}
          title={!isCollapsed ? `Switch to ${isManager ? 'HR View' : 'Manager View'}` : undefined}
        >
          {/* Stationary Icon container: ALWAYS 36x36px */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center">
            <ArrowLeftRight className="text-accent h-4 w-4 shrink-0 transition-transform duration-200 group-hover:rotate-180" />
          </div>

          {/* Role details with smooth asymmetrical fade & slide */}
          <div
            className={cn(
              'flex-1 min-w-0 pr-2.5 overflow-hidden text-left transition-[opacity,transform,max-width] ease-out',
              isCollapsed
                ? 'opacity-0 -translate-x-2 max-w-0 pointer-events-none duration-150'
                : 'opacity-100 translate-x-0 max-w-[180px] duration-200 delay-100'
            )}
          >
            <div className="flex items-center justify-between text-[11px] leading-tight">
              <span className="text-text-muted font-medium truncate">Demo Role</span>
              <span className="text-accent font-mono font-semibold uppercase text-[10px] px-1.5 py-0.5 rounded-[4px] bg-surface-3 border border-border/60">
                {isManager ? 'Manager' : 'HR'}
              </span>
            </div>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={14}
        className="font-medium text-[12px] z-50 pointer-events-none select-none"
      >
        Current Role: {isManager ? 'Manager' : 'HR'} (Click to switch)
      </TooltipContent>
    </Tooltip>
  );
}
