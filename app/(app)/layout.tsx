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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg text-text flex min-h-screen">
      {/* Dynamic Route Guard wrapped in Suspense boundary */}
      <React.Suspense fallback={null}>
        <RouteGuard />
      </React.Suspense>

      {/* Skip to Content Link */}
      <a
        href="#main-content"
        className="bg-accent text-bg sr-only px-3 py-1.5 font-medium focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded"
      >
        Skip to main content
      </a>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main
          id="main-content"
          tabIndex={-1}
          className="w-full flex-1 px-4 py-6 focus:outline-none sm:px-6 lg:px-8"
        >
          {children}
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
