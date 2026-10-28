import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=unchecked]:bg-surface-2 border-border/80 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border p-0.5 shadow-2xs transition-colors focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'data-[state=unchecked]:bg-text-subtle pointer-events-none block h-3.5 w-3.5 rounded-full shadow-2xs ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=checked]:bg-white data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;
