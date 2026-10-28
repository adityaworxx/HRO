'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CandidateAvatar } from '@/components/hro/candidate-avatar';
import { useCurrentUser, useSwitchRole } from '@/features/auth/hooks';
import { useUiStore } from '@/lib/store';
import { isRouteAllowed } from '@/lib/navigation';
import { Check, Settings, LogOut, ArrowLeftRight, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { PRIMARY_MANAGER, PRIMARY_HR } from '@/fixtures/users';

export function ProfileDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const { role, setRole } = useUiStore();
  const switchRole = useSwitchRole();

  const isManager = role === 'manager';
  const defaultPersona = isManager ? PRIMARY_MANAGER : PRIMARY_HR;
  const activeUser = user ?? defaultPersona;
  const displayName = activeUser.name;
  const displayDepartment = activeUser.department;
  const displayInitials = activeUser.avatarInitials;
  const displayEmail = `${activeUser.name.toLowerCase().replace(/\s+/g, '.')}@company.com`;

  const handleSelectRole = (newRole: 'manager' | 'hr') => {
    if (role === newRole) return;
    setRole(newRole);
    switchRole.mutate(newRole);
    if (!isRouteAllowed(pathname, newRole)) {
      router.push('/');
    }
    toast.success(
      `Active persona: ${newRole === 'manager' ? 'Arjun Kapoor (Manager)' : 'Priya Sharma (HR)'}`
    );
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hro:demo-role');
      localStorage.removeItem('hro:user');
    }
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-all select-none focus:outline-none focus-visible:outline-none"
          aria-label="User profile menu"
          title={`${displayName} (${displayDepartment})`}
        >
          <CandidateAvatar
            name={displayName}
            initials={displayInitials}
            size="sm"
            className="h-8 w-8 hover:scale-105"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-1.5">
        {/* User Identity Header */}
        <div className="px-3 py-2">
          <p className="text-text-subtle text-[11px] leading-[14px]">Signed in as</p>
          <p className="text-text mt-0.5 truncate text-[13.5px] leading-[18px] font-semibold">
            {displayName}
          </p>
          <p className="text-text-muted truncate text-[11.5px]">{displayEmail}</p>
        </div>

        <DropdownMenuSeparator />

        {/* Roles / Personas Section */}
        <DropdownMenuLabel className="text-text-subtle text-[11px] tracking-wider uppercase">
          Active Persona & Role
        </DropdownMenuLabel>

        {/* Hiring Manager Persona */}
        <DropdownMenuItem
          onClick={() => handleSelectRole('manager')}
          className="cursor-pointer justify-between py-2"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <Shield
              className={cn(
                'h-4 w-4 shrink-0 stroke-[1.75]',
                isManager ? 'text-accent' : 'text-text-subtle'
              )}
            />
            <div className="flex min-w-0 flex-col text-left">
              <span
                className={cn(
                  'text-[13px] leading-tight',
                  isManager ? 'text-text font-semibold' : 'text-text-muted font-medium'
                )}
              >
                Arjun Kapoor
              </span>
              <span className="text-text-subtle truncate text-[11px]">
                Hiring Manager · Engineering
              </span>
            </div>
          </div>
          {isManager && <Check className="text-accent ml-2 h-4 w-4 shrink-0 stroke-[2.2]" />}
        </DropdownMenuItem>

        {/* HR Specialist Persona */}
        <DropdownMenuItem
          onClick={() => handleSelectRole('hr')}
          className="cursor-pointer justify-between py-2"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <Shield
              className={cn(
                'h-4 w-4 shrink-0 stroke-[1.75]',
                !isManager ? 'text-accent' : 'text-text-subtle'
              )}
            />
            <div className="flex min-w-0 flex-col text-left">
              <span
                className={cn(
                  'text-[13px] leading-tight',
                  !isManager ? 'text-text font-semibold' : 'text-text-muted font-medium'
                )}
              >
                Priya Sharma
              </span>
              <span className="text-text-subtle truncate text-[11px]">
                HR Specialist · People Ops
              </span>
            </div>
          </div>
          {!isManager && <Check className="text-accent ml-2 h-4 w-4 shrink-0 stroke-[2.2]" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Navigation & Toggle */}
        <DropdownMenuItem asChild className="cursor-pointer py-1.5">
          <Link href="/settings">
            <Settings className="text-text-subtle h-4 w-4 stroke-[1.75]" />
            <span>Account & settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleSelectRole(isManager ? 'hr' : 'manager')}
          className="cursor-pointer py-1.5"
        >
          <ArrowLeftRight className="text-text-subtle h-4 w-4 stroke-[1.75]" />
          <span>Quick Switch to {isManager ? 'HR view' : 'Manager view'}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-danger hover:bg-surface-2 focus:bg-surface-2 focus:text-danger cursor-pointer py-1.5"
        >
          <LogOut className="text-danger h-4 w-4 stroke-[1.75]" />
          <span>Log out of HRO</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
