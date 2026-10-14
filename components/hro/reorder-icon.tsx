'use client';

import * as React from 'react';
import { motion, type DragControls } from 'motion/react';
import { cn } from '@/lib/utils';

export interface ReorderIconProps {
  dragControls?: DragControls;
  isActive?: boolean;
  onPress?: () => void;
  className?: string;
}

export function ReorderIcon({
  dragControls,
  isActive = false,
  onPress,
  className,
}: ReorderIconProps) {
  return (
    <motion.button
      type="button"
      aria-label="Reorder card"
      animate={{ scale: isActive ? 0.82 : 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      onPointerDown={(e) => {
        onPress?.();
        if (dragControls) {
          e.preventDefault();
          dragControls.start(e);
        }
      }}
      className={cn(
        'cursor-grab active:cursor-grabbing text-text-subtle/60 hover:text-text transition-colors p-0.5 rounded-[4px] hover:bg-surface-2 focus:outline-none flex items-center justify-center shrink-0',
        isActive && 'text-text bg-surface-3 cursor-grabbing',
        className
      )}
      style={{ touchAction: 'none' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 39 39"
        className="h-3.5 w-3.5 fill-current"
      >
        <path d="M 5 0 C 7.761 0 10 2.239 10 5 C 10 7.761 7.761 10 5 10 C 2.239 10 0 7.761 0 5 C 0 2.239 2.239 0 5 0 Z" />
        <path d="M 19 0 C 21.761 0 24 2.239 24 5 C 24 7.761 21.761 10 19 10 C 16.239 10 14 7.761 14 5 C 14 2.239 16.239 0 19 0 Z" />
        <path d="M 33 0 C 35.761 0 38 2.239 38 5 C 38 7.761 35.761 10 33 10 C 30.239 10 28 7.761 28 5 C 28 2.239 30.239 0 33 0 Z" />
        <path d="M 33 14 C 35.761 14 38 16.239 38 19 C 38 21.761 35.761 24 33 24 C 30.239 24 28 21.761 28 19 C 28 16.239 30.239 14 33 14 Z" />
        <path d="M 19 14 C 21.761 14 24 16.239 24 19 C 24 21.761 21.761 24 19 24 C 16.239 24 14 21.761 14 19 C 14 16.239 16.239 14 19 14 Z" />
        <path d="M 5 14 C 7.761 14 10 16.239 10 19 C 10 21.761 7.761 24 5 24 C 2.239 24 0 21.761 0 19 C 0 16.239 2.239 14 5 14 Z" />
        <path d="M 5 28 C 7.761 28 10 30.239 10 33 C 10 35.761 7.761 38 5 38 C 2.239 38 0 35.761 0 33 C 0 30.239 2.239 28 5 28 Z" />
        <path d="M 19 28 C 21.761 28 24 30.239 24 33 C 24 35.761 21.761 38 19 38 C 16.239 38 14 35.761 14 33 C 14 30.239 16.239 28 19 28 Z" />
        <path d="M 33 28 C 35.761 28 38 30.239 38 33 C 38 35.761 35.761 38 33 38 C 30.239 38 28 35.761 28 33 C 28 30.239 30.239 28 33 28 Z" />
      </svg>
    </motion.button>
  );
}

