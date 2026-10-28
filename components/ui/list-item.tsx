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
          'group text-text relative flex h-9 w-full cursor-pointer items-center gap-3 rounded-[8px] px-3 text-left text-[14px] leading-[20px] font-medium transition-colors outline-none select-none',
          active ? 'bg-surface-3 text-text' : 'text-text hover:bg-surface-2 focus:bg-surface-2',
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
                className="text-text-subtle h-4 w-4 shrink-0 stroke-[1.75] transition-colors"
                strokeWidth={1.75}
              />
            )}
            <span className="text-text flex-1 truncate">{label}</span>
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
