import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { Kbd } from '@/components/ui/kbd';
import { type LucideIcon } from 'lucide-react';

export interface ListItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  icon?: LucideIcon | React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label?: React.ReactNode;
  secondary?: React.ReactNode;
  trailing?: React.ReactNode;
  shortcut?: string;
  active?: boolean;
}

export const ListItem = React.forwardRef<HTMLButtonElement, ListItemProps>(
  (
    {
      className,
      asChild = false,
      icon: Icon,
      label,
      secondary,
      trailing,
      shortcut,
      active = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        disabled={disabled}
        aria-selected={active ? true : undefined}
        data-active={active ? 'true' : undefined}
        className={cn(
          'group relative flex h-9 w-full items-center gap-3 rounded-[8px] px-3 text-[14px] leading-[20px] font-medium text-text select-none cursor-pointer outline-none transition-colors text-left',
          active
            ? 'bg-surface-3 text-text'
            : 'text-text hover:bg-surface-2 focus:bg-surface-2',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
        {...props}
      >
        {children ? (
          children
        ) : (
          <>
            {Icon && (
              <Icon
                className="h-4 w-4 shrink-0 stroke-[1.75] text-text-subtle transition-colors"
                strokeWidth={1.75}
              />
            )}
            <span className="flex-1 truncate text-text">{label}</span>
            {secondary && (
              <span className="text-text-muted shrink-0 text-[12px] leading-[16px] font-normal">
                {secondary}
              </span>
            )}
            {shortcut && <Kbd className="shrink-0">{shortcut}</Kbd>}
            {trailing}
          </>
        )}
      </Comp>
    );
  }
);
ListItem.displayName = 'ListItem';

export interface ListGroupHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ListGroupHeader = React.forwardRef<HTMLDivElement, ListGroupHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'text-text-subtle px-3 py-2 text-[12px] leading-[16px] font-medium select-none',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ListGroupHeader.displayName = 'ListGroupHeader';

