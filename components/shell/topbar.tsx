'use client';

import * as React from 'react';
import { Breadcrumbs } from './breadcrumbs';
import { ThemeToggle } from './theme-toggle';
import { NotificationsPopover } from './notifications-popover';
import { ProfileDropdown } from './profile-dropdown';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useUiStore } from '@/lib/store';

export function Topbar() {
  const { setCommandPaletteOpen } = useUiStore();

  return (
    <header className="border-border bg-surface-1/95 sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <React.Suspense fallback={null}>
          <Breadcrumbs />
        </React.Suspense>
      </div>

      <div className="flex items-center gap-2">
        {/* Search Icon Trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCommandPaletteOpen(true)}
          className="text-text-subtle hover:text-text hover:bg-surface-2 h-9 w-9 cursor-pointer"
          title="Search or jump to (Ctrl+K)"
          aria-label="Search (Ctrl+K)"
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>

        <NotificationsPopover />
        <ThemeToggle />
        <ProfileDropdown />
      </div>
    </header>
  );
}
