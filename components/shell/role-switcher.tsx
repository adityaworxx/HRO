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
            'group border-border/70 bg-surface-2 text-text hover:bg-surface-3 hover:border-border relative flex h-9.5 w-full cursor-pointer items-center overflow-hidden rounded-[8px] border text-[12px] font-medium transition-colors select-none'
          )}
          title={
            !isCollapsed
              ? `Switch to ${isManager ? 'HR View (Priya Sharma)' : 'Manager View (Arjun Kapoor)'}`
              : undefined
          }
        >
          {/* Stationary Icon container: ALWAYS 36x36px */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center">
            <ArrowLeftRight className="text-accent h-4 w-4 shrink-0 transition-transform duration-200 group-hover:rotate-180" />
          </div>

          {/* Role details with smooth asymmetrical fade & slide */}
          <div
            className={cn(
              'min-w-0 flex-1 overflow-hidden pr-2.5 text-left transition-[opacity,transform,max-width] ease-out',
              isCollapsed
                ? 'pointer-events-none max-w-0 -translate-x-2 opacity-0 duration-150'
                : 'max-w-[180px] translate-x-0 opacity-100 delay-100 duration-200'
            )}
          >
            <div className="flex items-center justify-between text-[11.5px] leading-tight">
              <span className="text-text truncate font-semibold">
                {isManager ? 'Arjun Kapoor' : 'Priya Sharma'}
              </span>
              <span className="text-accent bg-accent-subtle border-accent/20 rounded-[4px] border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase">
                {isManager ? 'Mgr' : 'HR'}
              </span>
            </div>
            <p className="text-text-subtle mt-0.5 truncate text-[10px]">
              {isManager ? 'Hiring Manager' : 'HR Specialist'} · Switch &rarr;
            </p>
          </div>
        </button>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent
          side="right"
          sideOffset={14}
          className="pointer-events-none z-50 text-[12px] font-medium select-none"
        >
          Persona: {isManager ? 'Arjun Kapoor (Manager)' : 'Priya Sharma (HR)'} (Click to switch)
        </TooltipContent>
      )}
    </Tooltip>
  );
}
