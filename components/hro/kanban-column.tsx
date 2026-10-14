import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';
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
}

export function KanbanColumn({
  id,
  title,
  count,
  children,
  availableStages = [],
  onMoveToStage,
  className,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-surface-2/30 flex h-full min-h-[560px] w-[275px] shrink-0 flex-col rounded-[10px] border p-2.5 transition-colors duration-150',
        isOver
          ? 'border-border-strong bg-surface-2/70 ring-1 ring-border-strong'
          : 'border-border/70',
        className
      )}
    >
      <div className="mb-2.5 flex items-center justify-between px-1 pb-2 border-b border-border/60 select-none">
        <div className="flex items-center gap-2">
          <span className="text-text text-[13px] font-semibold tracking-tight">{title}</span>
          <span className="bg-surface-2 border border-border/60 text-text-subtle flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full font-mono text-[11px] font-medium">
            {count}
          </span>
        </div>

        {availableStages.length > 0 && onMoveToStage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-text-subtle hover:text-text h-6 w-6">
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

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
        {children}
        {isOver && (
          <div className="h-[95px] w-full rounded-[8px] border-2 border-dashed border-border-strong/60 bg-surface-3/30 transition-all flex items-center justify-center text-[11px] text-text-muted font-medium select-none pointer-events-none">
            Drop candidate here
          </div>
        )}
      </div>
    </div>
  );
}
