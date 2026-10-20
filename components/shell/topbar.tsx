'use client';

import * as React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from './breadcrumbs';
import { ThemeToggle } from './theme-toggle';
import { FullscreenToggle } from './fullscreen-toggle';
import { NotificationsPopover } from './notifications-popover';
import { ProfileDropdown } from './profile-dropdown';
import { Button } from '@/components/ui/button';
import { Search, Menu } from 'lucide-react';
import { useUiStore } from '@/lib/store';

export function Topbar() {
  const { setCommandPaletteOpen, toggleMobileSidebar } = useUiStore();

  return (
    <header className="border-border bg-surface-1/95 z-20 flex h-14 w-full shrink-0 items-center justify-between border-b px-3 backdrop-blur sm:px-6 lg:px-8">
      {/* Left container: left corner title & mobile navigation */}
      <div className="flex min-w-0 flex-1 items-center justify-start gap-2.5 sm:gap-3">
        {/* Mobile Hamburger Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileSidebar}
          className="text-text-subtle hover:text-text hover:bg-surface-2 h-9 w-9 shrink-0 cursor-pointer lg:hidden"
          title="Open Navigation"
          aria-label="Open Navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile Logo Brand */}
        <Link href="/" className="flex items-center gap-2 lg:hidden shrink-0">
          <div className="bg-accent flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-xs font-bold text-white shadow-xs">
            H
          </div>
          <span className="text-text text-[14px] font-semibold tracking-tight">HRO</span>
        </Link>

        {/* Left-Aligned Page Title across dashboards & pages */}
        <div className="flex min-w-0 items-center">
          <React.Suspense fallback={null}>
            <Breadcrumbs />
          </React.Suspense>
        </div>
      </div>

      {/* Right container: actions & utilities */}
      <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
        {/* Search Icon Trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCommandPaletteOpen(true)}
          className="text-text-subtle hover:text-text hover:bg-surface-2 h-8.5 w-8.5 cursor-pointer sm:h-9 sm:w-9"
          title="Search or jump to (Ctrl+K)"
          aria-label="Search (Ctrl+K)"
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>

        {/* Fullscreen Toggle - hidden on extra small mobile screens */}
        <div className="hidden sm:flex">
          <FullscreenToggle />
        </div>

        <NotificationsPopover />
        <ThemeToggle />
        <ProfileDropdown />
      </div>
    </header>
  );
}
