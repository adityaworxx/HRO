'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUiStore } from '@/lib/store';
import { NAVIGATION_ITEMS } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { PanelLeftClose, PanelLeftOpen, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { toast } from 'sonner';

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
        className="pointer-events-none z-50 text-[12px] font-medium select-none"
      >
        {title}
      </TooltipContent>
    </Tooltip>
  );
}

function SidebarNav({ collapsed, onItemClick }: { collapsed: boolean; onItemClick?: () => void }) {
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
                'group relative flex h-9 w-full cursor-pointer items-center rounded-[8px] text-[14px] leading-[20px] font-medium transition-colors',
                isActive
                  ? 'bg-accent-subtle text-accent font-semibold'
                  : 'text-text-muted hover:bg-surface-2 hover:text-text'
              )}
            >
              {/* Stationary icon container: Always 36x36px */}
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

              {/* Label with smooth asymmetrical fade & slide */}
              <div
                className={cn(
                  'min-w-0 flex-1 overflow-hidden pr-3 transition-[opacity,transform,max-width] ease-out',
                  collapsed
                    ? 'pointer-events-none max-w-0 -translate-x-2 opacity-0 duration-150'
                    : 'max-w-[180px] translate-x-0 opacity-100 delay-100 duration-200'
                )}
              >
                <span className="block truncate text-[13px]">{item.title}</span>
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
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useUiStore();

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isCollapsed = mounted ? sidebarCollapsed : false;

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hro:demo-role');
      localStorage.removeItem('hro:user');
    }
    toast.success('Logged out successfully');
    router.push('/login');
  };

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
      {/* 1. MOBILE OVERLAY DRAWER (lg:hidden) */}
      <div
        className={cn(
          'fixed inset-0 z-[100] transition-opacity duration-200 lg:hidden',
          mobileSidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
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
            'border-border bg-surface-1 fixed inset-y-0 left-0 z-[101] flex h-full w-72 max-w-[85vw] flex-col border-r shadow-2xl transition-transform duration-200 ease-out',
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
              <div className="bg-accent flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] font-bold text-white shadow-xs">
                H
              </div>
              <span className="text-text text-[15px] font-semibold tracking-tight">HRO</span>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSidebarOpen(false)}
              className="text-text-subtle hover:text-text h-8 w-8 cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="h-4.5 w-4.5" />
            </Button>
          </div>

          {/* Mobile Drawer Nav */}
          <React.Suspense fallback={<div className="flex-1" />}>
            <SidebarNav collapsed={false} onItemClick={() => setMobileSidebarOpen(false)} />
          </React.Suspense>

          {/* Mobile Drawer Footer with Logout */}
          <div className="border-border shrink-0 border-t p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="border-border/70 bg-surface-2 text-text-muted hover:text-danger hover:bg-surface-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[8px] border p-2.5 text-[13px] font-medium transition-colors select-none"
            >
              <LogOut className="h-4 w-4 stroke-[1.75]" />
              <span>Log out</span>
            </button>
          </div>
        </aside>
      </div>

      {/* 2. DESKTOP PERMANENT SIDEBAR (hidden on mobile, flex on lg+) */}
      <TooltipProvider delayDuration={150}>
        <aside
          className={cn(
            'border-border bg-surface-1 relative z-10 hidden h-full flex-col border-r transition-[width] ease-out select-none lg:flex',
            isCollapsed ? 'w-16 duration-150' : 'w-60 duration-200'
          )}
        >
          {/* Sidebar Header with Brand & Collapse Trigger */}
          <div className="border-border relative flex h-14 w-full shrink-0 items-center border-b px-3.5">
            {isCollapsed ? (
              <NavItemTooltip enabled={true} title="Expand sidebar (Ctrl+B)">
                <button
                  type="button"
                  onClick={toggleSidebar}
                  aria-label="Expand sidebar"
                  className="group hover:bg-surface-2 relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)] transition-colors select-none"
                >
                  <div className="bg-accent flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] font-bold text-white shadow-xs transition-opacity duration-150 group-hover:opacity-0">
                    H
                  </div>
                  <div className="text-accent absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <PanelLeftOpen className="h-4.5 w-4.5" />
                  </div>
                </button>
              </NavItemTooltip>
            ) : (
              <div className="flex min-w-0 items-center gap-2.5">
                <Link
                  href="/"
                  className="hover:bg-surface-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-colors select-none"
                >
                  <div className="bg-accent flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] font-bold text-white shadow-xs">
                    H
                  </div>
                </Link>
                <span className="text-text truncate text-[15px] font-semibold tracking-tight select-none">
                  HRO
                </span>
              </div>
            )}

            {/* Collapse Toggle Button: Absolute right, zero layout interference */}
            <div
              className={cn(
                'absolute top-1/2 right-3.5 -translate-y-1/2 transition-[opacity,transform] ease-out',
                isCollapsed
                  ? 'pointer-events-none scale-90 opacity-0 duration-150'
                  : 'scale-100 opacity-100 delay-100 duration-200'
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                tabIndex={isCollapsed ? -1 : 0}
                className="text-text-subtle hover:text-text hidden h-7 w-7 shrink-0 cursor-pointer lg:flex"
                title="Collapse sidebar (Ctrl+B)"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
                <span className="sr-only">Collapse sidebar</span>
              </Button>
            </div>
          </div>

          {/* Navigation Items */}
          <React.Suspense fallback={<div className="flex-1" />}>
            <SidebarNav collapsed={isCollapsed} />
          </React.Suspense>

          {/* Sidebar Footer with Logout ONLY */}
          <div className="border-border shrink-0 border-t p-3">
            {isCollapsed ? (
              <NavItemTooltip enabled={true} title="Log out">
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="hover:bg-surface-2 hover:text-danger text-text-subtle mx-auto flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)] transition-colors select-none"
                >
                  <LogOut className="h-4 w-4 stroke-[1.75]" />
                </button>
              </NavItemTooltip>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="hover:bg-surface-2 hover:text-danger text-text-muted flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-3 text-[13px] font-medium transition-colors select-none"
              >
                <LogOut className="h-4 w-4 shrink-0 stroke-[1.75]" />
                <span className="truncate">Log out</span>
              </button>
            )}
          </div>
        </aside>
      </TooltipProvider>
    </>
  );
}
