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
        'bg-surface-1 flex h-full min-h-[500px] w-80 shrink-0 flex-col rounded-[var(--radius-md)] border p-3 transition-colors duration-[150ms]',
        isOver ? 'border-accent bg-accent-subtle/30' : 'border-border',
        className
      )}
    >
      <div className="border-border mb-3 flex items-center justify-between border-b pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-text text-[13px] font-semibold">{title}</span>
          <span className="bg-surface-2 text-text-muted flex h-5 w-5 items-center justify-center rounded-full font-mono text-[11px] font-medium">
            {count}
          </span>
        </div>

        {availableStages.length > 0 && onMoveToStage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-text-subtle h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
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

      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto pr-1">{children}</div>
    </div>
  );
}
