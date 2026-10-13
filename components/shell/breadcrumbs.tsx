'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/openings': 'Openings',
  '/openings/new': 'New Opening',
  '/candidates': 'Candidates',
  '/pipeline': 'Pipeline',
  '/shortlist': 'Shortlist Review',
  '/interviews': 'Interviews',
  '/onboarding': 'Onboarding',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export function Breadcrumbs() {
  const pathname = usePathname();

  const title = React.useMemo(() => {
    if (!pathname || pathname === '/') return 'Dashboard';
    if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
    if (pathname.endsWith('/edit')) return 'Edit Opening';
    if (pathname.startsWith('/openings/')) return 'Opening Details';

    const segments = pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1] || 'Dashboard';
    return last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }, [pathname]);

  return (
    <span className="text-text text-[15px] font-semibold tracking-tight select-none">
      {title}
    </span>
  );
}

