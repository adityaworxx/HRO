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
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
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
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { formatRoleTitle } from '@/lib/format';

const PIPELINE_STAGES: CandidateStage[] = [
  'Sourced',
  'Shared with Manager',
  'Interview',
  'Selected',
  'Offer Sent',
  'Joined',
];

const collisionDetectionStrategy: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  return rectIntersection(args);
};

function DraggableCandidateCard({
  candidate,
  onClick,
}: {
  candidate: Candidate;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: candidate.id,
    data: { candidate },
  });

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        className="border-border/80 bg-surface-2/20 pointer-events-none h-[160px] min-h-[160px] w-full rounded-[10px] border border-dashed opacity-40 select-none"
      />
    );
  }

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="touch-none select-none">
      <CandidateCard candidate={candidate} onClick={onClick} />
    </div>
  );
}

export function PipelineBoard() {
  const { data: candidates = [] } = useCandidates();
  const { data: openings = [] } = useOpenings();
  const updateStage = useUpdateCandidateStage();

  const [selectedOpeningId, setSelectedOpeningId] = React.useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [pageByStage, setPageByStage] = React.useState<Record<string, number>>({});
  const [activeCandidate, setActiveCandidate] = React.useState<Candidate | null>(null);
  const [detailCandidate, setDetailCandidate] = React.useState<Candidate | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState<boolean>(false);

  const STAGE_PAGE_SIZE = 5;

  // Reset pagination when filters change
  React.useEffect(() => {
    setPageByStage({});
  }, [selectedOpeningId, selectedDepartment, searchQuery]);

  // Unique departments for filter
  const departments = React.useMemo(() => {
    const deptSet = new Set<string>();
    for (const o of openings) {
      if (o.department) deptSet.add(o.department);
    }
    return Array.from(deptSet);
  }, [openings]);

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
      const opening = openings.find((o) => o.id === c.openingId);
      const matchesOpening = selectedOpeningId === 'all' || c.openingId === selectedOpeningId;
      const matchesDept =
        selectedDepartment === 'all' || (opening && opening.department === selectedDepartment);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.currentCompany.toLowerCase().includes(q) ||
        c.currentRole.toLowerCase().includes(q) ||
        (opening &&
          (opening.title.toLowerCase().includes(q) ||
            opening.department.toLowerCase().includes(q) ||
            opening.mustHaveSkills.some((s) => s.toLowerCase().includes(q))));
      return matchesOpening && matchesDept && matchesSearch;
    });
  }, [candidates, openings, selectedOpeningId, selectedDepartment, searchQuery]);

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
        <div className="flex flex-1 flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="text-text-subtle pointer-events-none absolute top-2.5 left-3 h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate, role, skill..."
              className="bg-surface-2/40 border-border/70 hover:border-border focus:bg-surface-1 h-9 w-full rounded-[8px] pl-9 text-[13px] shadow-2xs transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Department Filter */}
            {departments.length > 0 && (
              <Select
                value={selectedDepartment}
                onValueChange={(val) => setSelectedDepartment(val)}
              >
                <SelectTrigger className="border-border/70 bg-surface-2/40 hover:bg-surface-2 text-text h-9 w-full min-w-0 gap-2 rounded-[8px] px-3 text-[13px] font-medium shadow-2xs sm:w-auto sm:min-w-[150px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent align="start" className="min-w-[180px]">
                  <SelectItem value="all" className="min-h-[32px] rounded-[6px] py-1.5 text-[13px]">
                    All Departments
                  </SelectItem>
                  {departments.map((dept) => (
                    <SelectItem
                      key={dept}
                      value={dept}
                      className="min-h-[32px] rounded-[6px] py-1.5 text-[13px]"
                    >
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Requisition Filter */}
            <Select value={selectedOpeningId} onValueChange={(val) => setSelectedOpeningId(val)}>
              <SelectTrigger className="border-border/70 bg-surface-2/40 hover:bg-surface-2 text-text h-9 w-full min-w-0 gap-2 rounded-[8px] px-3 text-[13px] font-medium shadow-2xs sm:w-auto sm:min-w-[200px]">
                <SelectValue placeholder={`All Requisitions (${openings.length})`} />
              </SelectTrigger>
              <SelectContent align="start" className="min-w-[240px]">
                <SelectItem value="all" className="min-h-[32px] rounded-[6px] py-1.5 text-[13px]">
                  All Requisitions ({openings.length})
                </SelectItem>
                {openings.map((opening) => (
                  <SelectItem
                    key={opening.id}
                    value={opening.id}
                    className="min-h-[32px] rounded-[6px] py-1.5 text-[13px]"
                  >
                    {formatRoleTitle(opening.title)} ({opening.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-text-muted text-[12px] font-medium">
          Showing <span className="text-text font-semibold">{filteredCandidates.length}</span>{' '}
          candidates
        </div>
      </div>

      {/* Kanban Board Canvas */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pt-1 pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageCandidates = filteredCandidates.filter((c) => c.stage === stage);
            const totalInStage = stageCandidates.length;
            const stagePage = pageByStage[stage] || 1;
            const stageTotalPages = Math.ceil(totalInStage / STAGE_PAGE_SIZE);
            const validStagePage = Math.min(Math.max(1, stagePage), Math.max(1, stageTotalPages));
            const startIndex = (validStagePage - 1) * STAGE_PAGE_SIZE;
            const visibleStageCandidates = stageCandidates.slice(
              startIndex,
              startIndex + STAGE_PAGE_SIZE
            );

            const paginationFooter =
              stageTotalPages > 1 ? (
                <div className="border-border/60 flex items-center justify-between border-t pt-2 text-[11.5px] select-none">
                  <button
                    type="button"
                    disabled={validStagePage <= 1}
                    onClick={() =>
                      setPageByStage((prev) => ({
                        ...prev,
                        [stage]: Math.max(1, validStagePage - 1),
                      }))
                    }
                    className="border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-[5px] border transition-colors disabled:cursor-not-allowed disabled:opacity-25"
                    title="Previous page"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>

                  <span className="text-text-subtle font-sans text-[11px] font-semibold tabular-nums">
                    {validStagePage} of {stageTotalPages}
                  </span>

                  <button
                    type="button"
                    disabled={validStagePage >= stageTotalPages}
                    onClick={() =>
                      setPageByStage((prev) => ({
                        ...prev,
                        [stage]: Math.min(stageTotalPages, validStagePage + 1),
                      }))
                    }
                    className="border-border/70 bg-surface-1 text-text-muted hover:text-text hover:bg-surface-2 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-[5px] border transition-colors disabled:cursor-not-allowed disabled:opacity-25"
                    title="Next page"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null;

            return (
              <KanbanColumn
                key={stage}
                id={stage}
                title={stage}
                count={stageCandidates.length}
                footer={paginationFooter}
              >
                {visibleStageCandidates.map((candidate) => (
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
        <DragOverlay
          dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}
        >
          {activeCandidate ? (
            <div className="pointer-events-none w-[356px] cursor-grabbing overflow-hidden rounded-[8px] shadow-2xl select-none">
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
