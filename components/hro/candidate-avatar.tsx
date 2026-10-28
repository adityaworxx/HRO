'use client';

import * as React from 'react';
import { create } from 'zustand';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

/**
 * 8-accent color palette directly sampled from the user design reference:
 * 1. Purple (#7c3aed)
 * 2. Vibrant Blue (#0c66e4)
 * 3. Emerald Green (#10b981)
 * 4. Amber / Orange (#f59e0b)
 * 5. Pink / Rose (#ec4899)
 * 6. Cyan (#06b6d4)
 * 7. Indigo / Blurple (#6366f1)
 * 8. Teal (#14b8a6)
 */
export const AVATAR_COLOR_PALETTE = [
  { bg: 'bg-[#7c3aed]', text: 'text-white', hex: '#7c3aed', name: 'Purple' },
  { bg: 'bg-[#0c66e4]', text: 'text-white', hex: '#0c66e4', name: 'Blue' },
  { bg: 'bg-[#10b981]', text: 'text-white', hex: '#10b981', name: 'Emerald' },
  { bg: 'bg-[#f59e0b]', text: 'text-white', hex: '#f59e0b', name: 'Amber' },
  { bg: 'bg-[#ec4899]', text: 'text-white', hex: '#ec4899', name: 'Pink' },
  { bg: 'bg-[#06b6d4]', text: 'text-white', hex: '#06b6d4', name: 'Cyan' },
  { bg: 'bg-[#6366f1]', text: 'text-white', hex: '#6366f1', name: 'Indigo' },
  { bg: 'bg-[#14b8a6]', text: 'text-white', hex: '#14b8a6', name: 'Teal' },
] as const;

interface AvatarColorStore {
  customColors: Record<string, number>;
  setColor: (key: string, index: number) => void;
  getColor: (key?: string) => number | undefined;
}

const STORAGE_KEY = 'hro:avatar-colors';

function loadInitialColors(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export const useAvatarColorStore = create<AvatarColorStore>((set, get) => ({
  customColors: {},
  setColor: (key: string, index: number) => {
    if (!key) return;
    set((state) => {
      const next = { ...state.customColors, [key]: index };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
      }
      return { customColors: next };
    });
  },
  getColor: (key?: string) => {
    if (!key) return undefined;
    return get().customColors[key];
  },
}));

/**
 * High-dispersion FNV-1a hash to distribute candidate names evenly across the 8 accents.
 */
export function getAvatarColorIndex(name: string = ''): number {
  let h = 0x811c9dc5;
  const s = name.trim();
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return Math.abs(h) % AVATAR_COLOR_PALETTE.length;
}

export function getAvatarColor(
  name: string = '',
  overrideIndex?: number
): (typeof AVATAR_COLOR_PALETTE)[number] {
  if (
    typeof overrideIndex === 'number' &&
    overrideIndex >= 0 &&
    overrideIndex < AVATAR_COLOR_PALETTE.length
  ) {
    const found = AVATAR_COLOR_PALETTE[overrideIndex];
    if (found) return found;
  }
  const index = getAvatarColorIndex(name);
  return AVATAR_COLOR_PALETTE[index] ?? AVATAR_COLOR_PALETTE[0];
}

export interface CandidateAvatarProps {
  name: string;
  candidateId?: string;
  className?: string;
  fallbackClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  initials?: string;
  colorIndex?: number;
}

export function CandidateAvatar({
  name,
  candidateId,
  className,
  fallbackClassName,
  size = 'md',
  initials,
  colorIndex,
}: CandidateAvatarProps) {
  const customColors = useAvatarColorStore((s) => s.customColors);

  // Initialize store on mount if needed
  React.useEffect(() => {
    const loaded = loadInitialColors();
    if (Object.keys(loaded).length > 0) {
      useAvatarColorStore.setState({ customColors: loaded });
    }
  }, []);

  const activeIndex = React.useMemo(() => {
    if (typeof colorIndex === 'number') return colorIndex;
    if (candidateId && typeof customColors[candidateId] === 'number') {
      return customColors[candidateId];
    }
    if (name && typeof customColors[name] === 'number') {
      return customColors[name];
    }
    return getAvatarColorIndex(name);
  }, [colorIndex, candidateId, name, customColors]);

  const color = AVATAR_COLOR_PALETTE[activeIndex] ?? AVATAR_COLOR_PALETTE[0];
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
        'shrink-0 border border-black/5 shadow-2xs transition-transform duration-200 select-none dark:border-white/15',
        className
      )}
    >
      <AvatarFallback
        className={cn(
          color.bg,
          color.text,
          'font-bold tracking-wide transition-colors duration-200 select-none',
          fallbackClassName
        )}
      >
        {textInitials}
      </AvatarFallback>
    </Avatar>
  );
}

/**
 * Exact "Avatar Color Accent" picker component matching the user design reference.
 */
export interface AvatarColorPickerProps {
  value?: number;
  onChange: (index: number) => void;
  className?: string;
  label?: string;
}

export function AvatarColorPicker({
  value,
  onChange,
  className,
  label = 'Avatar Color Accent',
}: AvatarColorPickerProps) {
  return (
    <div className={cn('space-y-2 select-none', className)}>
      {label && (
        <span className="text-text block text-[12.5px] font-semibold tracking-tight">{label}</span>
      )}
      <div className="flex flex-wrap items-center gap-2.5">
        {AVATAR_COLOR_PALETTE.map((item, idx) => {
          const isSelected = value === idx;
          return (
            <button
              key={item.hex}
              type="button"
              onClick={() => onChange(idx)}
              className={cn(
                'relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-all duration-150 select-none',
                item.bg,
                isSelected
                  ? 'ring-offset-surface-1 scale-105 shadow-xs ring-2 ring-emerald-500 ring-offset-2'
                  : 'hover:scale-105 hover:opacity-90 active:scale-95'
              )}
              title={item.name}
              aria-label={`Select ${item.name} accent`}
            >
              {isSelected && <Check className="h-4 w-4 stroke-[3] text-white drop-shadow-xs" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
