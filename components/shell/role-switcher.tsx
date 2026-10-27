'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUiStore } from '@/lib/store';
import { useSwitchRole } from '@/features/auth/hooks';
import { isRouteAllowed } from '@/lib/navigation';
import { ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { toast } from 'sonner';

export function RoleSwitcher({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole } = useUiStore();
  const switchRole = useSwitchRole();

  const isManager = role === 'manager';

  const handleToggle = () => {
    const nextRole = isManager ? 'hr' : 'manager';
    setRole(nextRole);
    switchRole.mutate(nextRole);
    if (!isRouteAllowed(pathname, nextRole)) {
      router.push('/');
    }
    toast.success(
      `Switched to ${nextRole === 'manager' ? 'Hiring Manager (Arjun Kapoor)' : 'HR Specialist (Priya Sharma)'} view`
    );
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'group relative flex h-9.5 w-full items-center rounded-[8px] border border-border/70 bg-surface-2 text-[12px] font-medium text-text select-none cursor-pointer transition-colors hover:bg-surface-3 hover:border-border overflow-hidden'
          )}
          title={!isCollapsed ? `Switch to ${isManager ? 'HR View (Priya Sharma)' : 'Manager View (Arjun Kapoor)'}` : undefined}
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
            <div className="flex items-center justify-between text-[11.5px] leading-tight">
              <span className="text-text font-semibold truncate">
                {isManager ? 'Arjun Kapoor' : 'Priya Sharma'}
              </span>
              <span className="text-accent font-mono font-semibold uppercase text-[10px] px-1.5 py-0.5 rounded-[4px] bg-accent-subtle border border-accent/20">
                {isManager ? 'Mgr' : 'HR'}
              </span>
            </div>
            <p className="text-[10px] text-text-subtle truncate mt-0.5">
              {isManager ? 'Hiring Manager' : 'HR Specialist'} · Switch &rarr;
            </p>
          </div>
        </button>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent
          side="right"
          sideOffset={14}
          className="font-medium text-[12px] z-50 pointer-events-none select-none"
        >
          Persona: {isManager ? 'Arjun Kapoor (Manager)' : 'Priya Sharma (HR)'} (Click to switch)
        </TooltipContent>
      )}
    </Tooltip>
  );
}
