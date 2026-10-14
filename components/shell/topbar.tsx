'use client';

import * as React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from './breadcrumbs';
import { ThemeToggle } from './theme-toggle';
import { FullscreenToggle } from './fullscreen-toggle';
import { NotificationsPopover } from './notifications-popover';
import { ProfileDropdown } from './profile-dropdown';
import { Button } from '@/components/ui/button';
import { Search, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useUiStore } from '@/lib/store';

export function Topbar() {
  const { setCommandPaletteOpen, toggleMobileSidebar, sidebarCollapsed, toggleSidebar } = useUiStore();

  return (
    <header className="border-border bg-surface-1/95 shrink-0 z-20 flex h-14 w-full items-center justify-between border-b px-3 sm:px-6 lg:px-8 backdrop-blur relative">
      <div className="flex items-center gap-2.5">
        {/* Desktop Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-text-subtle hover:text-text hover:bg-surface-2 h-9 w-9 cursor-pointer hidden lg:flex shrink-0"
          title={sidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4.5 w-4.5 text-accent" />
          ) : (
            <PanelLeftClose className="h-4.5 w-4.5" />
          )}
        </Button>

        {/* Mobile Hamburger Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileSidebar}
          className="text-text-subtle hover:text-text hover:bg-surface-2 h-9 w-9 cursor-pointer lg:hidden shrink-0"
          title="Open Navigation"
          aria-label="Open Navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile Logo Brand */}
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <div className="bg-accent text-bg flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] font-bold text-xs shadow-xs">
            H
          </div>
          <span className="text-text text-[14px] font-semibold tracking-tight">HRO</span>
        </Link>
      </div>

      {/* Centered Page Title - hidden on mobile to avoid overlapping icons */}
      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center pointer-events-none">
        <React.Suspense fallback={null}>
          <Breadcrumbs />
        </React.Suspense>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Search Icon Trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCommandPaletteOpen(true)}
          className="text-text-subtle hover:text-text hover:bg-surface-2 h-8.5 w-8.5 sm:h-9 sm:w-9 cursor-pointer"
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
