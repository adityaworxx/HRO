'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';

export interface CompanyLogoProps {
  company: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CompanyLogo({ company = '', className, size = 'sm' }: CompanyLogoProps) {
  const normalized = company.trim().toLowerCase();

  const sizeClass =
    size === 'lg'
      ? 'h-6 w-6 rounded-[6px]'
      : size === 'md'
        ? 'h-5 w-5 rounded-[5px]'
        : 'h-4 w-4 rounded-[4px]';

  // 1. PhonePe (Purple #5F259F with Pe / P)
  if (normalized.includes('phonepe')) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center shrink-0 overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#5F259F" />
          <path
            d="M12.6 5h-3.4v4.2H6.6v2.8h2.6v7h3.4v-7h1.4c2.8 0 4.8-1.5 4.8-3.5S16.8 5 14 5h-1.4zm0 4.4h-1.1V7.6h1.1c1.2 0 1.9.6 1.9 1.4 0 .9-.7 1.4-1.9 1.4z"
            fill="#FFFFFF"
          />
          <circle cx="15.8" cy="15.6" r="1.6" fill="#00D287" />
        </svg>
      </span>
    );
  }

  // 2. Swiggy (Orange #FC8019 with Swiggy map pin/swirl)
  if (normalized.includes('swiggy')) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center shrink-0 overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#FC8019" />
          <path
            d="M12 4.2C8.8 4.2 6.2 6.8 6.2 10c0 4.4 5.8 9.8 5.8 9.8s5.8-5.4 5.8-9.8c0-3.2-2.6-5.8-5.8-5.8zm0 8.2c-1.3 0-2.4-1.1-2.4-2.4s1.1-2.4 2.4-2.4 2.4 1.1 2.4 2.4-1.1 2.4-2.4 2.4z"
            fill="#FFFFFF"
          />
        </svg>
      </span>
    );
  }

  // 3. Zomato (Red #E23744 with clean Z)
  if (normalized.includes('zomato')) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center shrink-0 overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#E23744" />
          <path
            d="M6.5 7.5h11l-7.2 8.5H17.5v2H6.5l7.2-8.5H6.5V7.5z"
            fill="#FFFFFF"
          />
        </svg>
      </span>
    );
  }

  // 4. Razorpay (Navy #0C2340 with electric blue angled bolt)
  if (normalized.includes('razorpay')) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center shrink-0 overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#0C2340" />
          <path
            d="M14.5 4L7 13.5h4.5L10 20l7.5-9.5H13L14.5 4z"
            fill="#0B72E7"
          />
        </svg>
      </span>
    );
  }

  // 5. Flipkart (Blue #2874F0 with yellow bag F)
  if (normalized.includes('flipkart')) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center shrink-0 overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#2874F0" />
          <path d="M7 7.5h10l-1 11H8L7 7.5z" fill="#FFE11B" />
          <path
            d="M10 7.5V5.5c0-1.1.9-2 2-2s2 .9 2 2v2"
            stroke="#2874F0"
            strokeWidth="1.5"
          />
          <path
            d="M10 10.5h4v1.8h-2.5v1.4h2v1.8h-2V17h-1.5v-6.5z"
            fill="#2874F0"
          />
        </svg>
      </span>
    );
  }

  // 6. CRED (Black #0F0F10 with white geometric shield)
  if (normalized.includes('cred')) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center shrink-0 overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#111113" />
          <path
            d="M12 4.5l6 3.5v6.5c0 4-3 6.5-6 8-3-1.5-6-4-6-8V8l6-3.5z"
            stroke="#FFFFFF"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M12 8.5v5.5"
            stroke="#FFFFFF"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <circle cx="12" cy="16.5" r="1" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 7. Atlassian (Blue #0052CC with dual sails)
  if (normalized.includes('atlassian')) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center shrink-0 overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#0052CC" />
          <path
            d="M11.6 8.2c-.2-.4-.6-.6-1-.5L6 17.5c-.1.2 0 .5.2.6.1 0 .2.1.3.1h4.6c.4 0 .7-.2.9-.6l1.2-4.2-1.6-5.2zm2.8 3.6l-1.2 4.2 1.6 5.2c.2.4.6.6 1 .5l4.6-9.8c.1-.2 0-.5-.2-.6-.1 0-.2-.1-.3-.1h-4.6c-.4 0-.7.2-.9.6z"
            fill="#2684FF"
          />
          <path
            d="M11.6 8.2c-.2-.4-.6-.6-1-.5L6 17.5c-.1.2 0 .5.2.6.1 0 .2.1.3.1h4.6c.4 0 .7-.2.9-.6l1.2-4.2-1.6-5.2z"
            fill="#FFFFFF"
            fillOpacity="0.85"
          />
        </svg>
      </span>
    );
  }

  // 8. Microsoft (4 colored squares: Red, Green, Blue, Yellow)
  if (normalized.includes('microsoft')) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center shrink-0 overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#18181B" />
          <rect x="5.5" y="5.5" width="6" height="6" fill="#F25022" />
          <rect x="12.5" y="5.5" width="6" height="6" fill="#7FBA00" />
          <rect x="5.5" y="12.5" width="6" height="6" fill="#00A4EF" />
          <rect x="12.5" y="12.5" width="6" height="6" fill="#FFB900" />
        </svg>
      </span>
    );
  }

  // 9. Google (Iconic 4-color 'G')
  if (normalized.includes('google')) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center shrink-0 overflow-hidden shadow-2xs select-none bg-white',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#FFFFFF" />
          <path
            d="M18.8 12.2c0-.6-.1-1.2-.2-1.7H12v3.3h3.8c-.2 1-.7 1.8-1.5 2.4v2h2.5c1.4-1.3 2.2-3.3 2.2-6z"
            fill="#4285F4"
          />
          <path
            d="M12 19c1.9 0 3.5-.6 4.7-1.7l-2.5-2c-.6.4-1.4.7-2.2.7-1.7 0-3.2-1.2-3.7-2.7H5.7v2c1.2 2.3 3.6 3.7 6.3 3.7z"
            fill="#34A853"
          />
          <path
            d="M8.3 13.3c-.1-.4-.2-.9-.2-1.3s.1-.9.2-1.3V8.7H5.7C5.2 9.7 5 10.8 5 12s.2 2.3.7 3.3l2.6-2z"
            fill="#FBBC05"
          />
          <path
            d="M12 7.6c1 0 2 .4 2.7 1.1l2-2C15.5 5.6 13.9 5 12 5 9.3 5 6.9 6.4 5.7 8.7l2.6 2c.5-1.5 2-3.1 3.7-3.1z"
            fill="#EA4335"
          />
        </svg>
      </span>
    );
  }

  // 10. Zerodha (Blue #387ED1 kite)
  if (normalized.includes('zerodha')) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center shrink-0 overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#387ED1" />
          <path d="M12 4.5l5.5 5.5-5.5 9.5-5.5-9.5L12 4.5z" fill="#FFFFFF" />
          <circle cx="12" cy="11.5" r="2" fill="#387ED1" />
        </svg>
      </span>
    );
  }

  // 11. Meesho (Pink/Magenta #D42A7C)
  if (normalized.includes('meesho')) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center shrink-0 overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#D42A7C" />
          <path
            d="M6 16V8.5l3.5 4 3.5-4V16h2V8h-2l-3.5 4L6 8H4v8h2z"
            fill="#FFFFFF"
          />
        </svg>
      </span>
    );
  }

  // 12. Ola (Black #111 with lime green circle #8DC63F)
  if (normalized.includes('ola')) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center shrink-0 overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#111111" />
          <circle cx="12" cy="12" r="6" stroke="#8DC63F" strokeWidth="2.5" />
          <circle cx="12" cy="12" r="2.5" fill="#8DC63F" />
        </svg>
      </span>
    );
  }

  // 13. Amazon (Dark Navy #232F3E with smile arrow #FF9900)
  if (normalized.includes('amazon')) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center shrink-0 overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#232F3E" />
          <path
            d="M6 14.5c3.5 2.2 8.5 2.2 12 0"
            stroke="#FF9900"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M16 13.5l2.2 1.3-1 2"
            stroke="#FF9900"
            strokeWidth="1.2"
            fill="#FF9900"
          />
        </svg>
      </span>
    );
  }

  // 14. Urban Company (Black #000 with clean UC monogram)
  if (normalized.includes('urban company')) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center shrink-0 overflow-hidden shadow-2xs select-none bg-black text-white font-bold text-[9px] tracking-tight leading-none',
          sizeClass,
          className
        )}
        title={company}
      >
        UC
      </span>
    );
  }

  // 15. Fractal Analytics (Orange #FA6400 geometric F)
  if (normalized.includes('fractal')) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center shrink-0 overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#FA6400" />
          <path
            d="M8 6.5h8V9h-5.5v2.5h4.5v2.5h-4.5V17.5H8V6.5z"
            fill="#FFFFFF"
          />
        </svg>
      </span>
    );
  }

  // 16. BrowserStack (Blue #0066CC with stack bars)
  if (normalized.includes('browserstack')) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center shrink-0 overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#0066CC" />
          <rect x="6" y="6" width="12" height="3" rx="1" fill="#FF4B4B" />
          <rect x="6" y="10.5" width="12" height="3" rx="1" fill="#FFB703" />
          <rect x="6" y="15" width="12" height="3" rx="1" fill="#00C49F" />
        </svg>
      </span>
    );
  }

  // Fallback: Clean Apple-style monogram tile
  const initials = company
    ? company
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CO';

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center shrink-0 rounded-[4px] border border-border/80 bg-surface-2 text-[9px] font-bold text-text-muted shadow-2xs select-none',
        sizeClass,
        className
      )}
      title={company}
    >
      {initials || <Building2 className="h-2.5 w-2.5 text-text-subtle" />}
    </span>
  );
}
