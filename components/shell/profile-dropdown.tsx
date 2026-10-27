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

      <DropdownMenuContent align="end" className="w-64 p-1.5">
        {/* User Identity Header */}
        <div className="px-3 py-2">
          <p className="text-text-subtle text-[11px] leading-[14px]">Signed in as</p>
          <p className="text-text truncate text-[13.5px] leading-[18px] font-semibold mt-0.5">{displayName}</p>
          <p className="text-text-muted truncate text-[11.5px]">{displayEmail}</p>
        </div>

        <DropdownMenuSeparator />

        {/* Roles / Personas Section */}
        <DropdownMenuLabel className="text-[11px] text-text-subtle uppercase tracking-wider">
          Active Persona & Role
        </DropdownMenuLabel>

        {/* Hiring Manager Persona */}
        <DropdownMenuItem
          onClick={() => handleSelectRole('manager')}
          className="justify-between cursor-pointer py-2"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Shield className={cn("h-4 w-4 stroke-[1.75] shrink-0", isManager ? "text-accent" : "text-text-subtle")} />
            <div className="flex flex-col min-w-0 text-left">
              <span className={cn("text-[13px] leading-tight", isManager ? "font-semibold text-text" : "font-medium text-text-muted")}>
                Arjun Kapoor
              </span>
              <span className="text-[11px] text-text-subtle truncate">Hiring Manager · Engineering</span>
            </div>
          </div>
          {isManager && <Check className="h-4 w-4 stroke-[2.2] text-accent shrink-0 ml-2" />}
        </DropdownMenuItem>

        {/* HR Specialist Persona */}
        <DropdownMenuItem
          onClick={() => handleSelectRole('hr')}
          className="justify-between cursor-pointer py-2"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Shield className={cn("h-4 w-4 stroke-[1.75] shrink-0", !isManager ? "text-accent" : "text-text-subtle")} />
            <div className="flex flex-col min-w-0 text-left">
              <span className={cn("text-[13px] leading-tight", !isManager ? "font-semibold text-text" : "font-medium text-text-muted")}>
                Priya Sharma
              </span>
              <span className="text-[11px] text-text-subtle truncate">HR Specialist · People Ops</span>
            </div>
          </div>
          {!isManager && <Check className="h-4 w-4 stroke-[2.2] text-accent shrink-0 ml-2" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Navigation & Toggle */}
        <DropdownMenuItem asChild className="cursor-pointer py-1.5">
          <Link href="/settings">
            <Settings className="h-4 w-4 stroke-[1.75] text-text-subtle" />
            <span>Account & settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleSelectRole(isManager ? 'hr' : 'manager')}
          className="cursor-pointer py-1.5"
        >
          <ArrowLeftRight className="h-4 w-4 stroke-[1.75] text-text-subtle" />
          <span>Quick Switch to {isManager ? 'HR view' : 'Manager view'}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-danger hover:bg-surface-2 focus:bg-surface-2 focus:text-danger cursor-pointer py-1.5"
        >
          <LogOut className="h-4 w-4 stroke-[1.75] text-danger" />
          <span>Log out of HRO</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
