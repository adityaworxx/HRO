'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Candidate } from '@/types/entities';
import { useCandidates } from '../hooks';
import { DataTable } from '@/components/hro/data-table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { CandidateDetailSheet } from './candidate-detail-sheet';
import { formatCtc } from '@/lib/format';

export function CandidatesTable() {
  const { data: candidates = [], isLoading, isError, refetch } = useCandidates();

  const [selectedStage, setSelectedStage] = React.useState<string>('all');
  const [selectedSource, setSelectedSource] = React.useState<string>('all');
  const [activeCandidate, setActiveCandidate] = React.useState<Candidate | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const filteredCandidates = React.useMemo(() => {
    return candidates.filter((c) => {
      const matchesStage = selectedStage === 'all' || c.stage === selectedStage;
      const matchesSource = selectedSource === 'all' || c.source === selectedSource;
      return matchesStage && matchesSource;
    });
  }, [candidates, selectedStage, selectedSource]);

  const sources = React.useMemo(() => {
    return Array.from(new Set(candidates.map((c) => c.source)));
  }, [candidates]);

  const columns = React.useMemo<ColumnDef<Candidate>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Candidate',
        cell: ({ row }) => {
          const candidate = row.original;
          return (
            <div className="flex items-center gap-2.5 min-w-[160px] max-w-[210px]">
              <Avatar className="h-7 w-7 shrink-0 border border-border/80 bg-surface-3 shadow-2xs">
                <AvatarFallback className="text-[10px] font-semibold text-text bg-surface-3 tracking-wide">
                  {candidate.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <span className="text-text hover:text-accent text-[13px] font-semibold tracking-tight transition-colors block truncate cursor-pointer">
                  {candidate.name}
                </span>
                <span className="text-text-muted text-[11px] block truncate font-normal">
                  {candidate.email}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: 'role',
        header: 'Role & Company',
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="space-y-0.5 min-w-[170px] max-w-[220px]">
              <span className="text-text font-medium text-[13px] block truncate">
                {c.currentRole}
              </span>
              <span className="text-text-muted text-[12px] font-medium block truncate">
                {c.currentCompany}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'experienceYears',
        header: 'Experience',
        cell: ({ row }) => (
          <span className="text-text font-mono text-[13px] font-medium tabular-nums whitespace-nowrap">
            {row.original.experienceYears} yrs
          </span>
        ),
      },
      {
        accessorKey: 'expectedCtc',
        header: 'Expected CTC',
        cell: ({ row }) => (
          <span className="text-text font-mono font-medium text-[13px] tabular-nums whitespace-nowrap">
            {formatCtc(row.original.expectedCtc)}
          </span>
        ),
      },
      {
        accessorKey: 'source',
        header: 'Source',
        cell: ({ row }) => (
          <span className="text-text-muted text-[12px] font-normal whitespace-nowrap">
            {row.original.source}
          </span>
        ),
      },
      {
        accessorKey: 'stage',
        header: 'Stage',
        cell: ({ row }) => (
          <span className="text-text-muted text-[13px] font-normal whitespace-nowrap">
            {row.original.stage}
          </span>
        ),
      },
      {
        accessorKey: 'managerDecision',
        header: 'Manager',
        cell: ({ row }) => (
          <span className="text-text-muted text-[13px] font-normal whitespace-nowrap">
            {row.original.managerDecision}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right whitespace-nowrap pr-2">Action</div>,
        cell: ({ row }) => {
          const candidate = row.original;

          return (
            <div className="flex justify-end pr-1" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveCandidate(candidate);
                  setSheetOpen(true);
                }}
                className="h-7 px-2.5 text-[12px] font-medium text-accent hover:text-accent hover:bg-accent/10 rounded-[6px] transition-colors whitespace-nowrap"
              >
                <span>Review</span>
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      {/* Quick Stage Tabs & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            'all',
            'Sourced',
            'Shared with Manager',
            'Interview',
            'Selected',
            'Offer Sent',
            'Joined',
          ].map((stage) => {
            const isSelected = selectedStage === stage;
            const count =
              stage === 'all'
                ? candidates.length
                : candidates.filter((c) => c.stage === stage).length;

            return (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-1 text-[13px] font-medium transition-all ${
                  isSelected
                    ? 'bg-surface-1 text-text border border-border-strong shadow-xs font-semibold'
                    : 'bg-surface-2/70 text-text-muted hover:bg-surface-2 hover:text-text border border-transparent'
                }`}
              >
                <span>{stage === 'all' ? 'All Applicants' : stage}</span>
                <span
                  className={`py-0.2 rounded-full px-1.5 font-mono text-[11px] ${
                    isSelected ? 'bg-surface-3 text-text font-semibold' : 'bg-surface-3/60 text-text-subtle'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Source Filter */}
        {sources.length > 0 && (
          <Select
            value={selectedSource}
            onValueChange={(val) => setSelectedSource(val)}
          >
            <SelectTrigger className="h-8.5 w-auto min-w-[130px] gap-2 border-border/70 bg-surface-2/50 hover:bg-surface-2 text-text px-2.5 text-[12px] font-medium rounded-[var(--radius-sm)] shadow-2xs">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent align="end" className="min-w-[160px]">
              <SelectItem value="all" className="text-[13px] py-1.5 min-h-[32px] rounded-[6px]">
                All Sources
              </SelectItem>
              {sources.map((s) => (
                <SelectItem key={s} value={s} className="text-[13px] py-1.5 min-h-[32px] rounded-[6px]">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* TanStack Candidates Table */}
      <DataTable
        columns={columns}
        data={filteredCandidates}
        searchPlaceholder="Filter candidate by name, role, email..."
        loading={isLoading}
        error={isError ? 'Failed to fetch candidate directory' : null}
        onRetry={() => void refetch()}
        onRowClick={(row) => {
          setActiveCandidate(row);
          setSheetOpen(true);
        }}
      />

      <CandidateDetailSheet
        candidate={activeCandidate}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
