'use client';

import * as React from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  useDraggable,
} from '@dnd-kit/core';
import { useCandidates, useUpdateCandidateStage } from '../hooks';
import { useOpenings } from '@/features/openings/hooks';
import type { Candidate } from '@/types/entities';
import type { CandidateStage } from '@/lib/domain/status-transitions';
import { isValidCandidateStageTransition } from '@/lib/domain/status-transitions';
import { KanbanColumn } from '@/components/hro/kanban-column';
import { CandidateCard } from '@/components/hro/candidate-card';
import { CandidateDetailSheet } from './candidate-detail-sheet';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

const PIPELINE_STAGES: CandidateStage[] = [
  'Sourced',
  'Shared with Manager',
  'Interview',
  'Selected',
  'Offer Sent',
  'Joined',
];

function DraggableCandidateCard({
  candidate,
  onClick,
}: {
  candidate: Candidate;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: candidate.id,
    data: { candidate },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <CandidateCard
        candidate={candidate}
        onClick={onClick}
        isDragging={isDragging}
        className={isDragging ? 'ring-accent shadow-lg ring-2' : ''}
      />
    </div>
  );
}

export function PipelineBoard() {
  const { data: candidates = [] } = useCandidates();
  const { data: openings = [] } = useOpenings();
  const updateStage = useUpdateCandidateStage();

  const [selectedOpeningId, setSelectedOpeningId] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [activeCandidate, setActiveCandidate] = React.useState<Candidate | null>(null);
  const [detailCandidate, setDetailCandidate] = React.useState<Candidate | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState<boolean>(false);

  // Configure pointer sensor with small activation distance so clicking doesn't trigger drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Filter candidates
  const filteredCandidates = React.useMemo(() => {
    return candidates.filter((c) => {
      const matchesOpening = selectedOpeningId === 'all' || c.openingId === selectedOpeningId;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.currentCompany.toLowerCase().includes(q) ||
        c.currentRole.toLowerCase().includes(q);
      return matchesOpening && matchesSearch;
    });
  }, [candidates, selectedOpeningId, searchQuery]);

  const handleDragStart = (event: DragStartEvent) => {
    const candidate = candidates.find((c) => c.id === event.active.id);
    if (candidate) {
      setActiveCandidate(candidate);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCandidate(null);

    if (!over) return;

    const candidateId = String(active.id);
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    // Check if target is a valid stage column
    const targetStage = String(over.id) as CandidateStage;
    if (!PIPELINE_STAGES.includes(targetStage)) return;

    if (candidate.stage === targetStage) return;

    // Validate state transition rule
    if (!isValidCandidateStageTransition(candidate.stage, targetStage)) {
      toast.error(
        `Transition from "${candidate.stage}" to "${targetStage}" is not allowed by recruitment workflow.`
      );
      return;
    }

    // Mutate
    updateStage.mutate(
      { id: candidateId, stage: targetStage },
      {
        onSuccess: () => {
          toast.success(`Moved ${candidate.name} to ${targetStage}!`);
        },
      }
    );
  };

  const handleCardClick = (candidate: Candidate) => {
    setDetailCandidate(candidate);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="text-text-muted absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate or company..."
              className="pl-8 text-[13px]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="text-text-muted h-4 w-4 shrink-0" />
            <Select
              value={selectedOpeningId}
              onValueChange={(val) => setSelectedOpeningId(val)}
            >
              <SelectTrigger className="h-9 w-auto min-w-[200px] gap-2 border-border bg-surface-2 hover:bg-surface-3 text-text px-3 text-[13px] font-medium rounded-[var(--radius-sm)]">
                <SelectValue placeholder={`All Requisitions (${openings.length})`} />
              </SelectTrigger>
              <SelectContent align="start" className="min-w-[240px]">
                <SelectItem value="all" className="text-[13px] py-1.5 min-h-[32px] rounded-[6px]">
                  All Requisitions ({openings.length})
                </SelectItem>
                {openings.map((opening) => (
                  <SelectItem key={opening.id} value={opening.id} className="text-[13px] py-1.5 min-h-[32px] rounded-[6px]">
                    {opening.title} ({opening.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-text-muted text-[13px]">
          Showing <span className="text-text font-semibold">{filteredCandidates.length}</span>{' '}
          candidates
        </div>
      </div>

      {/* Kanban Board Canvas */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pt-1 pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageCandidates = filteredCandidates.filter((c) => c.stage === stage);

            return (
              <KanbanColumn key={stage} id={stage} title={stage} count={stageCandidates.length}>
                {stageCandidates.map((candidate) => (
                  <DraggableCandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onClick={() => handleCardClick(candidate)}
                  />
                ))}
              </KanbanColumn>
            );
          })}
        </div>

        {/* Drag Overlay Preview */}
        <DragOverlay>
          {activeCandidate ? (
            <div className="w-72 shadow-2xl">
              <CandidateCard candidate={activeCandidate} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Candidate Profile Drawer */}
      <CandidateDetailSheet
        candidate={detailCandidate}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
