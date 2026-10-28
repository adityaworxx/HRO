'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CompanyLogoProps {
  company: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const BRAND_GRADIENTS = [
  'from-[#6366f1] to-[#4338ca]', // Indigo
  'from-[#0284c7] to-[#0369a1]', // Ocean Blue
  'from-[#059669] to-[#047857]', // Emerald
  'from-[#d97706] to-[#b45309]', // Amber
  'from-[#db2777] to-[#be185d]', // Rose
  'from-[#7c3aed] to-[#6d28d9]', // Violet
  'from-[#0d9488] to-[#0f766e]', // Teal
  'from-[#e11d48] to-[#be123c]', // Crimson
];

function getBrandGradient(company: string) {
  let hash = 0;
  const clean = company.trim().toLowerCase();
  for (let i = 0; i < clean.length; i++) {
    hash = (Math.imul(31, hash) + clean.charCodeAt(i)) | 0;
  }
  return BRAND_GRADIENTS[Math.abs(hash) % BRAND_GRADIENTS.length];
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
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
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

  // 2. Swiggy (Orange #FC8019 with Swiggy map pin)
  if (normalized.includes('swiggy')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
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
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#E23744" />
          <path d="M6.5 7.5h11l-7.2 8.5H17.5v2H6.5l7.2-8.5H6.5V7.5z" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 4. Razorpay (Navy #0C2340 with electric blue bolt)
  if (normalized.includes('razorpay')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#0C2340" />
          <path d="M14.5 4L7 13.5h4.5L10 20l7.5-9.5H13L14.5 4z" fill="#0B72E7" />
        </svg>
      </span>
    );
  }

  // 5. Flipkart (Blue #2874F0 with yellow bag)
  if (normalized.includes('flipkart')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#2874F0" />
          <path d="M7 7.5h10l-1 11H8L7 7.5z" fill="#FFE11B" />
          <path d="M10 7.5V5.5c0-1.1.9-2 2-2s2 .9 2 2v2" stroke="#2874F0" strokeWidth="1.5" />
          <path d="M10 10.5h4v1.8h-2.5v1.4h2v1.8h-2V17h-1.5v-6.5z" fill="#2874F0" />
        </svg>
      </span>
    );
  }

  // 6. CRED (Black #111113 with geometric shield)
  if (normalized.includes('cred')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
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
          <path d="M12 8.5v5.5" stroke="#FFFFFF" strokeWidth="1.75" strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="1" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 7. Zerodha (Blue #387ED1 kite)
  if (normalized.includes('zerodha')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
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

  // 8. Groww (Teal #00D09C ascending growth arrow)
  if (normalized.includes('groww')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#00D09C" />
          <path
            d="M6 14.5l4.5-4.5 3 3 5-5"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.5 8H18.5v4"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  // 9. Uber (Black #000000 with clean white U)
  if (normalized.includes('uber')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#000000" />
          <path
            d="M7 6.5v6.5a5 5 0 0 0 10 0V6.5h-2.5v6.5a2.5 2.5 0 0 1-5 0V6.5H7z"
            fill="#FFFFFF"
          />
        </svg>
      </span>
    );
  }

  // 10. Paytm (Navy #002970 with dual-tone white/cyan)
  if (normalized.includes('paytm')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#002970" />
          <path
            d="M5.5 8h3c1.5 0 2.5.8 2.5 2.2s-1 2.3-2.5 2.3h-1.5v3.5H5.5V8zm1.5 3h1.5c.6 0 1-.3 1-.8s-.4-.7-1-.7H7v1.5z"
            fill="#FFFFFF"
          />
          <path
            d="M12 9.5h1.5v1.2c.4-.8 1.2-1.4 2.2-1.4 1.4 0 2.3 1 2.3 2.5V16h-1.5v-4c0-.7-.4-1.2-1.1-1.2-.7 0-1.2.5-1.2 1.3V16H12V9.5z"
            fill="#00BAF2"
          />
        </svg>
      </span>
    );
  }

  // 11. MakeMyTrip (Red #EA2330 with mmt)
  if (normalized.includes('makemytrip') || normalized === 'mmt') {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#EA2330" />
          <text
            x="12"
            y="15.5"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="8"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            mmt
          </text>
        </svg>
      </span>
    );
  }

  // 12. Nykaa (Magenta Pink #FC2779)
  if (normalized.includes('nykaa')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#FC2779" />
          <path d="M7 6.5h2.5l5 7.5V6.5H17v11h-2.5l-5-7.5v7.5H7v-11z" fill="#FFFFFF" />
          <circle cx="17" cy="6.5" r="1.5" fill="#FFE0EB" />
        </svg>
      </span>
    );
  }

  // 13. InMobi (Red #ED1C24)
  if (normalized.includes('inmobi')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#ED1C24" />
          <path d="M7 7.5h2.5v9H7v-9zm4 0h2.5l4 6V7.5H20v9h-2.5l-4-6v6H11v-9z" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 14. Meesho (Pink/Magenta #D42A7C)
  if (normalized.includes('meesho')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#D42A7C" />
          <path d="M6 16V8.5l3.5 4 3.5-4V16h2V8h-2l-3.5 4L6 8H4v8h2z" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 15. Ola (Black #111 with lime circle)
  if (normalized.includes('ola')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
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

  // 16. Urban Company (Black #000 UC monogram)
  if (normalized.includes('urban company')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden bg-black text-[9px] leading-none font-bold tracking-tight text-white shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        UC
      </span>
    );
  }

  // 17. Fractal Analytics (Orange #FA6400 geometric F)
  if (normalized.includes('fractal')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#FA6400" />
          <path d="M8 6.5h8V9h-5.5v2.5h4.5v2.5h-4.5V17.5H8V6.5z" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 18. BrowserStack (Blue #0066CC with stack bars)
  if (normalized.includes('browserstack')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
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

  // 19. Infosys (Navy Blue #007CC3)
  if (normalized.includes('infosys')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#007CC3" />
          <text
            x="12"
            y="15.5"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="9"
            fontWeight="bold"
            fontStyle="italic"
            fontFamily="sans-serif"
          >
            infy
          </text>
        </svg>
      </span>
    );
  }

  // 20. Wipro (White with multi-color petals)
  if (normalized.includes('wipro')) {
    return (
      <span
        className={cn(
          'border-border/60 inline-flex shrink-0 items-center justify-center overflow-hidden border bg-white shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#FFFFFF" />
          <circle cx="9" cy="9" r="3.2" fill="#DC2626" opacity="0.9" />
          <circle cx="15" cy="9" r="3.2" fill="#2563EB" opacity="0.9" />
          <circle cx="9" cy="15" r="3.2" fill="#F59E0B" opacity="0.9" />
          <circle cx="15" cy="15" r="3.2" fill="#10B981" opacity="0.9" />
        </svg>
      </span>
    );
  }

  // 21. TCS (Tata Consultancy Services)
  if (normalized.includes('tcs') || normalized.includes('tata consultancy')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#001838" />
          <text
            x="12"
            y="15.5"
            textAnchor="middle"
            fill="#00A3E0"
            fontSize="8.5"
            fontWeight="900"
            fontFamily="sans-serif"
            letterSpacing="0.5"
          >
            TCS
          </text>
        </svg>
      </span>
    );
  }

  // 22. Atlassian (Blue #0052CC dual sails)
  if (normalized.includes('atlassian')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#0052CC" />
          <path
            d="M11.6 8.2c-.2-.4-.6-.6-1-.5L6 17.5c-.1.2 0 .5.2.6.1 0 .2.1.3.1h4.6c.4 0 .7-.2.9-.6l1.2-4.2-1.6-5.2zm2.8 3.6l-1.2 4.2 1.6 5.2c.2.4.6.6 1 .5l4.6-9.8c.1-.2 0-.5-.2-.6-.1 0-.2-.1-.3-.1h-4.6c-.4 0-.7.2-.9.6z"
            fill="#FFFFFF"
            fillOpacity="0.9"
          />
        </svg>
      </span>
    );
  }

  // 23. Microsoft (4 colored squares)
  if (normalized.includes('microsoft')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
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

  // 24. Google (4-color G)
  if (normalized.includes('google')) {
    return (
      <span
        className={cn(
          'border-border/60 inline-flex shrink-0 items-center justify-center overflow-hidden border bg-white shadow-2xs select-none',
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

  // 25. Amazon (Dark Navy with smile)
  if (normalized.includes('amazon') || normalized.includes('aws')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
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
          <path d="M16 13.5l2.2 1.3-1 2" stroke="#FF9900" strokeWidth="1.2" fill="#FF9900" />
        </svg>
      </span>
    );
  }

  // 26. Zepto (Deep Purple #7000FF with white Z)
  if (normalized.includes('zepto')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#7000FF" />
          <path d="M6.5 7.5h11l-7.2 8.5H17.5v2H6.5l7.2-8.5H6.5V7.5z" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 27. Blinkit (Bright Yellow #F8CB46 with green b)
  if (normalized.includes('blinkit')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#F8CB46" />
          <path
            d="M8 5v14h3.5a4.5 4.5 0 0 0 4.5-4.5v-1a4.5 4.5 0 0 0-4.5-4.5H10.5V5H8zm2.5 6.5h1a2.2 2.2 0 0 1 2.2 2.2v1a2.2 2.2 0 0 1-2.2 2.2h-1v-5.4z"
            fill="#0C831F"
          />
        </svg>
      </span>
    );
  }

  // 28. Postman (Vibrant Orange #FF6C37)
  if (normalized.includes('postman')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#FF6C37" />
          <circle cx="12" cy="10" r="3.8" fill="#FFFFFF" />
          <path d="M12 14.5c-3 0-5.5 1.5-5.5 3.5v1h11v-1c0-2-2.5-3.5-5.5-3.5z" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 29. Zoho (4 Playful Square Blocks)
  if (normalized.includes('zoho')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#18181B" />
          <rect x="5.5" y="5.5" width="6" height="6" rx="1.5" fill="#E42525" />
          <rect x="12.5" y="5.5" width="6" height="6" rx="1.5" fill="#239454" />
          <rect x="5.5" y="12.5" width="6" height="6" rx="1.5" fill="#0F75BC" />
          <rect x="12.5" y="12.5" width="6" height="6" rx="1.5" fill="#F4AA00" />
        </svg>
      </span>
    );
  }

  // 30. Freshworks (Coral #F35D39)
  if (normalized.includes('freshworks')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#F35D39" />
          <circle cx="12" cy="12" r="6" stroke="#FFFFFF" strokeWidth="2.2" fill="none" />
          <circle cx="12" cy="12" r="2.2" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 31. Dream11 (Red #E41D24)
  if (normalized.includes('dream11')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#E41D24" />
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="9.5"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            D11
          </text>
        </svg>
      </span>
    );
  }

  // 32. Lenskart (Dark Navy with eyeglasses)
  if (normalized.includes('lenskart')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#000042" />
          <circle cx="8.5" cy="12" r="3.2" stroke="#00A79D" strokeWidth="1.8" fill="none" />
          <circle cx="15.5" cy="12" r="3.2" stroke="#00A79D" strokeWidth="1.8" fill="none" />
          <path d="M11.7 12h.6" stroke="#00A79D" strokeWidth="1.8" />
        </svg>
      </span>
    );
  }

  // 33. Jio (Blue with Jio circle)
  if (normalized.includes('jio')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#0A2885" />
          <circle cx="12" cy="12" r="7.2" fill="#E31837" />
          <text
            x="12"
            y="14.8"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="7.5"
            fontWeight="900"
            fontStyle="italic"
            fontFamily="sans-serif"
          >
            Jio
          </text>
        </svg>
      </span>
    );
  }

  // 34. Dunzo (Emerald Green lightning bolt)
  if (normalized.includes('dunzo')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#00D382" />
          <path d="M13 4L6 13h5l-1 7 7-9h-5l1-7z" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 35. Apple (Black with white Apple)
  if (normalized === 'apple') {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#000000" />
          <path
            d="M15.5 13c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.6.8-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.5s1.7-.8 3.1-.8 3 .8 3.1 2.5c.8-.5 1.7-1.4 2.2-2.4.7-1 1-2.1 1-2.2-.1 0-1.6-.6-1.6-2.5zM14.2 6.3c.6-.8 1.1-1.9.9-3-.9.1-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1.1.1 2.2-.5 2.8-1.3z"
            fill="#FFFFFF"
          />
        </svg>
      </span>
    );
  }

  // 36. Netflix (Black with red N)
  if (normalized.includes('netflix')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#000000" />
          <path d="M6.5 5h3v14h-3z" fill="#E50914" />
          <path d="M14.5 5h3v14h-3z" fill="#E50914" />
          <path d="M6.5 5l8 14h3L9.5 5z" fill="#B81D24" />
        </svg>
      </span>
    );
  }

  // 37. Meta / Facebook (Blue #0668E1 loop)
  if (normalized.includes('meta') || normalized.includes('facebook')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#0668E1" />
          <path
            d="M12 8.5c-2.5-3-5.5-2.5-6.5-.5-1.5 3-.5 6 2 7 2 .8 4-1.5 4.5-2.5.5 1 2.5 3.3 4.5 2.5 2.5-1 3.5-4 2-7-1-2-4-2.5-6.5.5zm-3 4.5c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8 1.8.8 1.8 1.8-.8 1.8-1.8 1.8zm6 0c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8 1.8.8 1.8 1.8-.8 1.8-1.8 1.8z"
            fill="#FFFFFF"
          />
        </svg>
      </span>
    );
  }

  // 38. Stripe (Blurple #635BFF with S)
  if (normalized.includes('stripe')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#635BFF" />
          <path
            d="M11 7.5c-2 0-3.5 1-3.5 2.5 0 2.5 3.8 2 3.8 3.5 0 .6-.5 1-1.3 1-.9 0-2-.4-2.7-1l-.8 1.8c.8.6 2.2 1 3.5 1 2.5 0 3.8-1.2 3.8-2.8 0-2.5-3.8-2-3.8-3.5 0-.5.4-.8 1.1-.8.8 0 1.8.3 2.4.8l.8-1.8c-.8-.5-1.9-.7-3.3-.7z"
            fill="#FFFFFF"
          />
        </svg>
      </span>
    );
  }

  // 39. Adobe (Red with A)
  if (normalized.includes('adobe')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#FF0000" />
          <path
            d="M6 5h4l4.5 14H11l-1.5-4.5H7.2L6 19H4.5L6 5zm2 7h2.2L7.1 8.8 8 12z"
            fill="#FFFFFF"
          />
        </svg>
      </span>
    );
  }

  // 40. Salesforce (Blue Cloud)
  if (normalized.includes('salesforce')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#00A1E0" />
          <path
            d="M10 7a4 4 0 0 1 4 3 3.5 3.5 0 0 1 4.5 3.5c0 2-1.5 3.5-3.5 3.5H7.5A3.5 3.5 0 0 1 4 13.5 3.5 3.5 0 0 1 7.2 10 4 4 0 0 1 10 7z"
            fill="#FFFFFF"
          />
        </svg>
      </span>
    );
  }

  // 41. LinkedIn (Signature Blue #0A66C2)
  if (normalized.includes('linkedin')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#0A66C2" />
          <path
            d="M7 9h2.5v8H7V9zm1.2-4a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zM11.5 9H14v1.1c.4-.7 1.3-1.3 2.5-1.3 2.2 0 3 1.5 3 3.5V17h-2.5v-4c0-.9-.3-1.5-1.2-1.5-.7 0-1.1.5-1.3 1V17H11.5V9z"
            fill="#FFFFFF"
          />
        </svg>
      </span>
    );
  }

  // 42. Twitter / X
  if (normalized === 'twitter' || normalized === 'x') {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#000000" />
          <path
            d="M6 5.5l5 6.5-5 6.5h2l4-5.2 3.8 5.2H18l-5.3-7 4.8-6h-2l-3.8 4.8-3.7-4.8H6z"
            fill="#FFFFFF"
          />
        </svg>
      </span>
    );
  }

  // 43. Spotify (Green #1ED760)
  if (normalized.includes('spotify')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#1ED760" />
          <path
            d="M7 9.5c3.5-1 7.5-.8 10 .5"
            stroke="#000000"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M8 12.2c2.8-.8 6-.6 8 .5"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M9 14.8c2-.5 4.5-.4 6 .4"
            stroke="#000000"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  // 44. Slack (Aubergine #4A154B)
  if (normalized.includes('slack')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#4A154B" />
          <rect x="7" y="10" width="3" height="7" rx="1.5" fill="#36C5F0" />
          <rect x="10" y="7" width="7" height="3" rx="1.5" fill="#2EB67D" />
          <rect x="14" y="7" width="3" height="7" rx="1.5" fill="#ECB22E" />
          <rect x="7" y="14" width="7" height="3" rx="1.5" fill="#E01E5A" />
        </svg>
      </span>
    );
  }

  // 45. GitHub (Dark #24292F)
  if (normalized.includes('github')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#24292F" />
          <path
            d="M12 5a7 7 0 0 0-2.2 13.6c.35.06.48-.15.48-.34v-1.2c-1.95.42-2.36-.94-2.36-.94-.32-.81-.78-1.03-.78-1.03-.64-.44.05-.43.05-.43.7.05 1.07.72 1.07.72.63 1.07 1.64.76 2.04.58.06-.45.25-.76.45-.94-1.55-.18-3.19-.78-3.19-3.46 0-.76.27-1.39.72-1.88-.07-.18-.31-.89.07-1.85 0 0 .59-.19 1.92.71a6.7 6.7 0 0 1 3.5 0c1.33-.9 1.92-.71 1.92-.71.38.96.14 1.67.07 1.85.45.49.72 1.12.72 1.88 0 2.69-1.64 3.28-3.2 3.45.25.22.48.64.48 1.3v1.92c0 .19.13.4.48.34A7 7 0 0 0 12 5z"
            fill="#FFFFFF"
          />
        </svg>
      </span>
    );
  }

  // 46. Figma (Dark with multi-color dots)
  if (normalized.includes('figma')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#1E1E1E" />
          <circle cx="15.5" cy="8.5" r="2.5" fill="#FF7262" />
          <circle cx="8.5" cy="8.5" r="2.5" fill="#F24E1E" />
          <circle cx="8.5" cy="13.5" r="2.5" fill="#A259FF" />
          <circle cx="15.5" cy="13.5" r="2.5" fill="#1ABCFE" />
          <circle cx="8.5" cy="18.5" r="2.5" fill="#0ACF83" />
        </svg>
      </span>
    );
  }

  // 47. Notion (Black with white N)
  if (normalized.includes('notion')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#000000" />
          <path d="M7 6.5h3l5 8.5V6.5h2.5v11h-3l-5-8.5v8.5H7v-11z" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 48. HCL / HCLTech (Blue #0050A0)
  if (normalized.includes('hcl')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#0050A0" />
          <text
            x="12"
            y="15.5"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="8"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            HCL
          </text>
        </svg>
      </span>
    );
  }

  // 49. Cognizant (Navy Blue)
  if (normalized.includes('cognizant')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#0033A0" />
          <circle
            cx="12"
            cy="12"
            r="6"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="30 10"
          />
        </svg>
      </span>
    );
  }

  // 50. Accenture (Black with Purple >)
  if (normalized.includes('accenture')) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden shadow-2xs select-none',
          sizeClass,
          className
        )}
        title={company}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <rect width="24" height="24" rx="5" fill="#000000" />
          <path
            d="M10 6l5 6-5 6"
            stroke="#A100FF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </span>
    );
  }

  // Fallback: Smart, vibrant brand-gradient monogram tile (NEVER a dull gray box)
  const initials = company
    ? company
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CO';

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[4px] border border-white/20 bg-gradient-to-br text-[9px] font-bold tracking-tight text-white shadow-2xs select-none',
        getBrandGradient(company),
        sizeClass,
        className
      )}
      title={company}
    >
      {initials}
    </span>
  );
}
