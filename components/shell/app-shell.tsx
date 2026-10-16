'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';
import { CommandPalette } from '@/components/shell/command-palette';
import { useUiStore } from '@/lib/store';
import { isRouteAllowed } from '@/lib/navigation';
import { toast } from 'sonner';

function RouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useUiStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const currentRole =
      (typeof window !== 'undefined' &&
        (localStorage.getItem('hro:demo-role') === 'hr' ? 'hr' : role)) ||
      role;
    if (!isRouteAllowed(pathname, currentRole)) {
      toast.error('You do not have access to that page.');
      router.replace('/');
    }
  }, [mounted, pathname, role, router]);

  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg text-text fixed inset-0 flex h-full w-full overflow-hidden">
      {/* Dynamic Route Guard wrapped in Suspense boundary */}
      <React.Suspense fallback={null}>
        <RouteGuard />
      </React.Suspense>

      {/* Skip to Content Link */}
      <a
        href="#main-content"
        className="bg-accent sr-only px-3 py-1.5 font-medium text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded"
      >
        Skip to main content
      </a>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main
          id="main-content"
          tabIndex={-1}
          className="w-full min-w-0 flex-1 overflow-y-auto px-3 py-4 focus:outline-none sm:px-6 sm:py-6 lg:px-8"
        >
          {children}
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
