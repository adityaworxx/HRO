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
import { useCurrentUser } from '@/features/auth/hooks';
import { useUiStore } from '@/lib/store';
import { Check, Settings, LogOut, ArrowLeftRight, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function ProfileDropdown() {
  const { data: user } = useCurrentUser();
  const { role, setRole } = useUiStore();

  const displayName = user?.name ?? 'Aditya Chaubey';
  const displayDepartment = user?.department ?? 'Operations';
  const displayInitials = user?.avatarInitials ?? 'AC';
  const displayEmail = user
    ? `${user.name.toLowerCase().replace(/\s+/g, '.')}@company.com`
    : 'aditya@company.com';

  const isManager = role === 'manager';

  const toggleRole = () => {
    const nextRole = role === 'manager' ? 'hr' : 'manager';
    setRole(nextRole);
    toast.info(`Switched role to: ${nextRole === 'manager' ? 'Hiring Manager' : 'HR Specialist'}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="focus-visible:ring-accent relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-all select-none focus-visible:ring-2 focus-visible:outline-none"
          aria-label="User profile menu"
          title={`${displayName} (${displayDepartment})`}
        >
          <div className="relative">
            <Avatar className="border-border/80 hover:border-border-strong h-8 w-8 border shadow-2xs transition-colors">
              <AvatarFallback className="bg-surface-3 text-text text-[12px] font-bold">
                {displayInitials}
              </AvatarFallback>
            </Avatar>
            <span className="bg-success ring-surface-1 absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full ring-2" />
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="border-border bg-surface-1 w-56 p-1.5 shadow-xl">
        {/* User Identity Header */}
        <div className="px-2.5 py-2">
          <p className="text-text-subtle text-[11px] font-medium">Signed in as</p>
          <p className="text-text truncate text-[13px] font-semibold">{displayEmail}</p>
        </div>

        <DropdownMenuSeparator />

        {/* Roles / Teams Section */}
        <DropdownMenuLabel className="text-text-subtle px-2.5 pt-1.5 pb-1 text-[11px] font-semibold tracking-wider uppercase">
          Active Role
        </DropdownMenuLabel>

        <DropdownMenuItem
          onClick={toggleRole}
          className="flex cursor-pointer items-center justify-between px-2.5 py-1.5 text-[13px]"
        >
          <div className="flex items-center gap-2">
            <Shield className="text-accent h-3.5 w-3.5" />
            <span>Hiring Manager</span>
          </div>
          {isManager && <Check className="text-accent h-3.5 w-3.5" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={toggleRole}
          className="flex cursor-pointer items-center justify-between px-2.5 py-1.5 text-[13px]"
        >
          <div className="flex items-center gap-2">
            <Shield className="text-accent h-3.5 w-3.5" />
            <span>HR Specialist</span>
          </div>
          {!isManager && <Check className="text-accent h-3.5 w-3.5" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Navigation Items */}
        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-[13px]"
          >
            <Settings className="text-text-muted h-3.5 w-3.5" />
            <span>Account & Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={toggleRole}
          className="flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-[13px]"
        >
          <ArrowLeftRight className="text-text-muted h-3.5 w-3.5" />
          <span>Switch to {isManager ? 'HR View' : 'Manager View'}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={() => toast.info('Demo session reset')}
          className="text-danger focus:bg-danger/10 focus:text-danger flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-[13px]"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
