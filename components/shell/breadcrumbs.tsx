'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const pathname = usePathname();

  const segments = React.useMemo(() => {
    if (!pathname || pathname === '/') return [];
    return pathname
      .split('/')
      .filter(Boolean)
      .map((segment, index, array) => {
        const href = `/${array.slice(0, index + 1).join('/')}`;
        const isUuid = /^[0-9a-f-]{10,}$/i.test(segment);
        const title = isUuid
          ? 'Details'
          : segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return { title, href };
      });
  }, [pathname]);

  return (
    <nav aria-label="Breadcrumbs" className="text-text-muted flex items-center text-[13px]">
      <Link
        href="/"
        className="hover:text-text text-text-subtle flex items-center gap-1 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Home</span>
      </Link>

      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        return (
          <React.Fragment key={segment.href}>
            <ChevronRight className="text-text-subtle mx-1.5 h-3.5 w-3.5 shrink-0" />
            {isLast ? (
              <span className="text-text max-w-[200px] truncate font-medium">{segment.title}</span>
            ) : (
              <Link
                href={segment.href}
                className="hover:text-text max-w-[140px] truncate transition-colors"
              >
                {segment.title}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
