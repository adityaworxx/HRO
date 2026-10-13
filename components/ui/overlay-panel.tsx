import * as React from 'react';
import { cn } from '@/lib/utils';

export const OVERLAY_BACKDROP_CLASS =
  'fixed inset-0 z-50 bg-bg/65 backdrop-blur-[6px] duration-140 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0';

export const OVERLAY_PANEL_CLASS =
  'bg-surface-1 border border-border rounded-[12px] shadow-sm duration-140 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:scale-98 data-[state=open]:scale-100 overflow-hidden';

export const OVERLAY_SECTION_DIVIDER_CLASS = 'border-b border-border';

export interface OverlayPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const OverlayPanel = React.forwardRef<HTMLDivElement, OverlayPanelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(OVERLAY_PANEL_CLASS, className)} {...props}>
        {children}
      </div>
    );
  }
);
OverlayPanel.displayName = 'OverlayPanel';

