'use client';

import * as React from 'react';
import { Breadcrumbs } from './breadcrumbs';
import { ThemeToggle } from './theme-toggle';
import { NotificationsPopover } from './notifications-popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useUiStore } from '@/lib/store';
import { useCurrentUser } from '@/features/auth/hooks';

export function Topbar() {
  const { setCommandPaletteOpen } = useUiStore();
  const { data: user } = useCurrentUser();

  const displayName = user?.name ?? 'User';
  const displayDepartment = user?.department ?? 'Operations';
  const displayInitials = user?.avatarInitials ?? 'U';

  return (
    <header className="border-border bg-surface-1/95 sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <React.Suspense fallback={null}>
          <Breadcrumbs />
        </React.Suspense>
      </div>

      <div className="flex items-center gap-2">
        {/* Command Palette Trigger */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCommandPaletteOpen(true)}
          className="text-text-subtle border-border hidden h-8 gap-2 px-2.5 text-[12px] sm:flex"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search or jump to...</span>
          <kbd className="bg-surface-3 text-text-subtle rounded px-1.5 py-0.5 font-mono text-[10px]">
            Ctrl+K
          </kbd>
        </Button>

        <NotificationsPopover />
        <ThemeToggle />

        {/* User Block */}
        <div className="border-border flex items-center gap-2.5 border-l pl-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback>{displayInitials}</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col text-left md:flex">
            <span className="text-text text-[12px] leading-tight font-semibold">{displayName}</span>
            <span className="text-text-subtle text-[11px] leading-tight">{displayDepartment}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
