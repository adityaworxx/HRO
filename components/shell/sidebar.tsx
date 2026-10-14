'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUiStore } from '@/lib/store';
import { NAVIGATION_ITEMS } from '@/lib/navigation';
import { RoleSwitcher } from './role-switcher';
import { cn } from '@/lib/utils';
import { PanelLeftClose, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

function NavItemTooltip({
  enabled,
  title,
  children,
}: {
  enabled: boolean;
  title: string;
  children: React.ReactNode;
}) {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={14}
        className="font-medium text-[12px] z-50 pointer-events-none select-none"
      >
        {title}
      </TooltipContent>
    </Tooltip>
  );
}

function SidebarNav({
  collapsed,
  onItemClick,
}: {
  collapsed: boolean;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();
  const { role } = useUiStore();
  const navItems = NAVIGATION_ITEMS[role];

  return (
    <nav
      aria-label="Main Navigation"
      className="flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-3.5 py-3 select-none"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <NavItemTooltip key={item.href} enabled={collapsed} title={item.title}>
            <Link
              href={item.href}
              onClick={onItemClick}
              className={cn(
                'group relative flex h-9 w-full items-center rounded-[8px] text-[14px] leading-[20px] font-medium transition-colors cursor-pointer',
                isActive
                  ? 'bg-accent-subtle text-accent font-semibold'
                  : 'text-text-muted hover:bg-surface-2 hover:text-text'
              )}
            >
              {/* Stationary icon container */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center">
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive
                      ? 'text-accent stroke-[2]'
                      : 'text-text-subtle group-hover:text-text stroke-[1.75]'
                  )}
                />
              </div>

              {/* Label with smooth fade & slide */}
              <div
                className={cn(
                  'flex-1 min-w-0 pr-3 overflow-hidden transition-[opacity,transform] duration-200 ease-out',
                  collapsed
                    ? 'opacity-0 -translate-x-2 pointer-events-none'
                    : 'opacity-100 translate-x-0'
                )}
              >
                <span className="truncate block text-[13px]">{item.title}</span>
              </div>
            </Link>
          </NavItemTooltip>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const {
    sidebarCollapsed,
    toggleSidebar,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useUiStore();

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isCollapsed = mounted ? sidebarCollapsed : false;

  // Auto-close mobile drawer when navigating
  React.useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname, setMobileSidebarOpen]);

  // Lock body scroll when mobile drawer is open to prevent background movement
  React.useEffect(() => {
    if (!mobileSidebarOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileSidebarOpen]);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileSidebarOpen, setMobileSidebarOpen]);

  return (
    <>
      {/* 1. MOBILE OVERLAY DRAWER (lg:hidden) - OVERLAYS WITHOUT SHIFTING BACKGROUND */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden transition-opacity duration-200',
          mobileSidebarOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
        aria-hidden={!mobileSidebarOpen}
      >
        {/* Backdrop overlay */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />

        {/* Drawer container (slides from left, fixed over the screen) */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] flex-col border-r border-border bg-surface-1 shadow-2xl transition-transform duration-200 ease-out',
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Mobile Drawer Header */}
          <div className="border-border flex h-14 w-full shrink-0 items-center justify-between border-b px-4">
            <Link
              href="/"
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center gap-2.5 overflow-hidden"
            >
              <div className="bg-accent text-bg flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] font-bold shadow-xs">
                H
              </div>
              <span className="text-text text-[15px] font-semibold tracking-tight">HRO</span>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSidebarOpen(false)}
              className="text-text-subtle hover:text-text h-8 w-8 cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <React.Suspense fallback={<div className="flex-1" />}>
            <SidebarNav collapsed={false} onItemClick={() => setMobileSidebarOpen(false)} />
          </React.Suspense>

          {/* Role Switcher */}
          <div className="border-border border-t px-3.5 py-3 shrink-0">
            <RoleSwitcher isCollapsed={false} />
          </div>
        </aside>
      </div>

      {/* 2. DESKTOP SIDEBAR (hidden on mobile, visible on lg:) */}
      <TooltipProvider delayDuration={50}>
        <aside
          className={cn(
            'border-border bg-surface-1 relative sticky top-0 z-30 hidden lg:flex h-screen shrink-0 flex-col border-r transition-[width] duration-200 ease-in-out overflow-x-hidden',
            isCollapsed ? 'w-16' : 'w-60'
          )}
        >
          {/* Brand Header */}
          <div className="border-border flex h-14 w-full shrink-0 items-center justify-between border-b px-3.5">
            {!isCollapsed ? (
              <>
                <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center">
                    <div className="bg-accent text-bg flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] font-bold shadow-xs">
                      H
                    </div>
                  </div>
                  <span className="text-text truncate text-[15px] font-semibold tracking-tight transition-[opacity,transform] duration-200">
                    HRO
                  </span>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="text-text-subtle hover:text-text hidden h-7 w-7 cursor-pointer lg:flex shrink-0"
                  title="Collapse sidebar (Ctrl+B)"
                >
                  <PanelLeftClose className="h-4 w-4" />
                  <span className="sr-only">Collapse sidebar</span>
                </Button>
              </>
            ) : (
              <NavItemTooltip enabled={isCollapsed} title="Expand sidebar (Ctrl+B)">
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="group hover:bg-surface-2 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)] transition-colors"
                >
                  <div className="bg-accent text-bg flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] font-bold shadow-xs">
                    H
                  </div>
                  <span className="sr-only">Expand sidebar (Ctrl+B)</span>
                </button>
              </NavItemTooltip>
            )}
          </div>

          {/* Navigation Items */}
          <React.Suspense fallback={<div className="flex-1" />}>
            <SidebarNav collapsed={isCollapsed} />
          </React.Suspense>

          {/* Sidebar Footer with Role Switcher */}
          <div className="border-border border-t px-3.5 py-2.5 shrink-0">
            <RoleSwitcher isCollapsed={isCollapsed} />
          </div>
        </aside>
      </TooltipProvider>
    </>
  );
}
