'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCurrentUser, useSwitchRole } from '@/features/auth/hooks';
import { useUiStore } from '@/lib/store';
import { Check, Settings, LogOut, ArrowLeftRight, Shield } from 'lucide-react';

import { PRIMARY_MANAGER, PRIMARY_HR } from '@/fixtures/users';

export function ProfileDropdown() {
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

  const toggleRole = () => {
    const nextRole = role === 'manager' ? 'hr' : 'manager';
    setRole(nextRole);
    switchRole.mutate(nextRole);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-all select-none focus-visible:outline-none focus:outline-none"
          aria-label="User profile menu"
          title={`${displayName} (${displayDepartment})`}
        >
          <Avatar className="border-border/80 hover:border-border-strong h-8 w-8 border shadow-2xs transition-colors">
            <AvatarFallback className="bg-surface-3 text-text text-[12px] font-bold" suppressHydrationWarning>
              {displayInitials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60 p-1.5">
        {/* User Identity Header */}
        <div className="px-3 py-2">
          <p className="text-text-subtle text-[12px] leading-[16px]">Signed in as</p>
          <p className="text-text truncate text-[14px] leading-[20px] font-medium">{displayEmail}</p>
        </div>

        <DropdownMenuSeparator />

        {/* Roles / Teams Section */}
        <DropdownMenuLabel>
          Active role
        </DropdownMenuLabel>

        <DropdownMenuItem
          onClick={toggleRole}
          className="justify-between"
        >
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 stroke-[1.75] text-text-subtle" />
            <span>Hiring Manager</span>
          </div>
          {isManager && <Check className="h-4 w-4 stroke-[1.75] text-text" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={toggleRole}
          className="justify-between"
        >
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 stroke-[1.75] text-text-subtle" />
            <span>HR Specialist</span>
          </div>
          {!isManager && <Check className="h-4 w-4 stroke-[1.75] text-text" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Navigation Items */}
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4 stroke-[1.75] text-text-subtle" />
            <span>Account & settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={toggleRole}>
          <ArrowLeftRight className="h-4 w-4 stroke-[1.75] text-text-subtle" />
          <span>Switch to {isManager ? 'HR view' : 'Manager view'}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          className="text-danger hover:bg-surface-2 focus:bg-surface-2 focus:text-danger"
        >
          <LogOut className="h-4 w-4 stroke-[1.75] text-danger" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
