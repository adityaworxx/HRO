import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import {
  MoreHorizontal,
  Inbox,
  UserCheck,
  Video,
  CheckCircle2,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
  availableStages?: string[];
  onMoveToStage?: (targetStage: string) => void;
  className?: string;
  footer?: React.ReactNode;
}

const STAGE_ICONS: Record<string, React.ElementType> = {
  Sourced: Inbox,
  'Shared with Manager': UserCheck,
  Interview: Video,
  Selected: CheckCircle2,
  'Offer Sent': Send,
  Joined: Sparkles,
};

export function KanbanColumn({
  id,
  title,
  count,
  children,
  availableStages = [],
  onMoveToStage,
  className,
  footer,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const StageIcon = STAGE_ICONS[title];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-surface-2/30 xs:w-[360px] border-border/70 flex h-full min-h-[560px] w-[340px] max-w-[calc(100vw-2.5rem)] shrink-0 flex-col rounded-[12px] border p-3.5 transition-colors duration-150 sm:w-[380px]',
        isOver
          ? 'border-border-strong bg-surface-2/70 ring-border-strong ring-1'
          : 'border-border/70',
        className
      )}
    >
      <div className="border-border/60 mb-2.5 flex items-center justify-between border-b px-1 pb-2 select-none">
        <div className="flex min-w-0 items-center gap-2">
          {StageIcon ? (
            <div className="bg-surface-3/80 text-text-muted border-border/60 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border">
              <StageIcon className="h-3.5 w-3.5" />
            </div>
          ) : (
            <span className="bg-text-subtle h-2 w-2 shrink-0 rounded-full" />
          )}
          <span className="text-text truncate text-[13px] font-semibold tracking-tight">
            {title}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-text-muted bg-surface-3/90 border-border/60 flex items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums">
            {count}
          </span>

          {availableStages.length > 0 && onMoveToStage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-text-subtle hover:text-text h-6 w-6"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                  <span className="sr-only">Column actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableStages.map((stage) => (
                  <DropdownMenuItem key={stage} onClick={() => onMoveToStage(stage)}>
                    Move items to {stage}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
        {children}
        {isOver && (
          <div className="border-border-strong/60 bg-surface-3/30 text-text-muted pointer-events-none flex h-[95px] w-full items-center justify-center rounded-[8px] border-2 border-dashed text-[11px] font-medium transition-all select-none">
            Drop candidate here
          </div>
        )}
      </div>

      {footer && <div className="mt-2 shrink-0">{footer}</div>}
    </div>
  );
}
