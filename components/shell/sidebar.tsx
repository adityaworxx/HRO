'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUiStore } from '@/lib/store';
import { NAVIGATION_ITEMS } from '@/lib/navigation';
import { RoleSwitcher } from './role-switcher';
import { cn } from '@/lib/utils';
import { PanelLeftClose } from 'lucide-react';
import { Button } from '@/components/ui/button';

function SidebarNav({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const { role } = useUiStore();
  const navItems = NAVIGATION_ITEMS[role];

  return (
    <nav aria-label="Main Navigation" className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.title : undefined}
            className={cn(
              'flex h-9 items-center gap-3 rounded-[8px] px-3 text-[14px] leading-[20px] font-medium text-text select-none transition-colors',
              isActive
                ? 'bg-surface-3 text-text'
                : 'text-text hover:bg-surface-2',
              collapsed && 'w-9 justify-center px-0 mx-auto'
            )}
          >
            <Icon className="h-4 w-4 shrink-0 stroke-[1.75] text-text-subtle" strokeWidth={1.75} />
            {!collapsed && <span className="truncate">{item.title}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isCollapsed = mounted ? sidebarCollapsed : false;

  return (
    <aside
      className={cn(
        'border-border bg-surface-1 relative sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r transition-[width] duration-[150ms]',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          'border-border flex h-14 items-center border-b transition-all',
          isCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'
        )}
      >
        {!isCollapsed ? (
          <>
            <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
              <div className="bg-accent text-bg flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] font-bold shadow-xs">
                H
              </div>
              <span className="text-text truncate text-[15px] font-semibold tracking-tight">
                HRO
              </span>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-text-subtle hover:text-text hidden h-7 w-7 cursor-pointer lg:flex"
              title="Collapse sidebar (Ctrl+B)"
            >
              <PanelLeftClose className="h-4 w-4" />
              <span className="sr-only">Collapse sidebar</span>
            </Button>
          </>
        ) : (
          <button
            type="button"
            onClick={toggleSidebar}
            className="group hover:bg-surface-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius-md)] transition-colors"
            title="Expand sidebar (Ctrl+B)"
          >
            <div className="bg-accent text-bg flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] font-bold shadow-xs transition-transform group-hover:scale-105">
              H
            </div>
            <span className="sr-only">Expand sidebar</span>
          </button>
        )}
      </div>

      {/* Navigation Items in Suspense Boundary */}
      <React.Suspense fallback={<div className="flex-1" />}>
        <SidebarNav collapsed={isCollapsed} />
      </React.Suspense>

      {/* Sidebar Footer with Role Switcher */}
      <div className="border-border border-t p-2">
        <RoleSwitcher isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}
