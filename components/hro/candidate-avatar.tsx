'use client';

import * as React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

/**
 * 8-accent color palette directly sampled from the user design reference:
 * 1. Purple (#7c3aed)
 * 2. Blue (#0c66e4)
 * 3. Emerald Green (#10b981)
 * 4. Amber / Orange (#f59e0b)
 * 5. Pink / Rose (#ec4899)
 * 6. Cyan (#06b6d4)
 * 7. Indigo (#6366f1)
 * 8. Teal (#14b8a6)
 */
export const AVATAR_COLOR_PALETTE = [
  { bg: 'bg-[#7c3aed]', text: 'text-white', hex: '#7c3aed' },
  { bg: 'bg-[#0c66e4]', text: 'text-white', hex: '#0c66e4' },
  { bg: 'bg-[#10b981]', text: 'text-white', hex: '#10b981' },
  { bg: 'bg-[#f59e0b]', text: 'text-white', hex: '#f59e0b' },
  { bg: 'bg-[#ec4899]', text: 'text-white', hex: '#ec4899' },
  { bg: 'bg-[#06b6d4]', text: 'text-white', hex: '#06b6d4' },
  { bg: 'bg-[#6366f1]', text: 'text-white', hex: '#6366f1' },
  { bg: 'bg-[#14b8a6]', text: 'text-white', hex: '#14b8a6' },
] as const;

/**
 * Deterministic hash to distribute names evenly across the 8 vibrant avatar accents.
 */
export function getAvatarColor(name: string = '') {
  let h = 0;
  const clean = name.trim();
  for (let i = 0; i < clean.length; i++) {
    h = Math.imul(31, h) + clean.charCodeAt(i) | 0;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  const index = Math.abs(h) % AVATAR_COLOR_PALETTE.length;
  return AVATAR_COLOR_PALETTE[index] ?? AVATAR_COLOR_PALETTE[0];
}

export interface CandidateAvatarProps {
  name: string;
  className?: string;
  fallbackClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  initials?: string;
}

export function CandidateAvatar({
  name,
  className,
  fallbackClassName,
  size = 'md',
  initials,
}: CandidateAvatarProps) {
  const color = React.useMemo(() => getAvatarColor(name), [name]);
  const textInitials = initials || (name ? name.slice(0, 2).toUpperCase() : '??');

  const sizeClass =
    size === 'xs'
      ? 'h-6 w-6 text-[10px]'
      : size === 'sm'
        ? 'h-7 w-7 text-[10.5px]'
        : size === 'lg'
          ? 'h-10 w-10 text-[13px]'
          : size === 'xl'
            ? 'h-14 w-14 text-[20px]'
            : 'h-8.5 w-8.5 text-[11.5px]';

  return (
    <Avatar
      className={cn(
        sizeClass,
        'shrink-0 border border-black/5 dark:border-white/15 shadow-2xs select-none',
        className
      )}
    >
      <AvatarFallback
        className={cn(
          color.bg,
          color.text,
          'font-bold tracking-wide select-none',
          fallbackClassName
        )}
      >
        {textInitials}
      </AvatarFallback>
    </Avatar>
  );
}
