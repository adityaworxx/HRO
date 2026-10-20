'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Candidate } from '@/types/entities';
import { useCandidates } from '../hooks';
import { useOpenings } from '@/features/openings/hooks';
import { DataTable } from '@/components/hro/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { CandidateDetailSheet } from './candidate-detail-sheet';
import { CandidateColumnsView } from './candidate-columns-view';
import { formatCtc } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Columns3, List, Search } from 'lucide-react';

export function CandidatesTable() {
  const { data: candidates = [], isLoading, isError, refetch } = useCandidates();
  const { data: openings = [] } = useOpenings();

  const [selectedStage, setSelectedStage] = React.useState<string>('all');
  const [selectedSource, setSelectedSource] = React.useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [viewMode, setViewMode] = React.useState<'columns' | 'table'>('columns');
  const [activeCandidate, setActiveCandidate] = React.useState<Candidate | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const filteredCandidates = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return candidates.filter((c) => {
      const opening = openings.find((o) => o.id === c.openingId);
      const dept = opening?.department || 'General';

      const matchesStage = selectedStage === 'all' || c.stage === selectedStage;
      const matchesSource = selectedSource === 'all' || c.source === selectedSource;
      const matchesDept = selectedDepartment === 'all' || dept === selectedDepartment;

      const matchesSearch =
        query === '' ||
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.currentRole.toLowerCase().includes(query) ||
        c.currentCompany.toLowerCase().includes(query) ||
        (Boolean(opening) && opening!.title.toLowerCase().includes(query));

      return matchesStage && matchesSource && matchesDept && matchesSearch;
    });
  }, [candidates, openings, selectedStage, selectedSource, selectedDepartment, searchQuery]);

  const sources = React.useMemo(() => {
    return Array.from(new Set(candidates.map((c) => c.source)));
  }, [candidates]);

  const departments = React.useMemo(() => {
    const deptSet = new Set<string>();
    for (const c of candidates) {
      const opening = openings.find((o) => o.id === c.openingId);
      if (opening?.department) deptSet.add(opening.department);
    }
    return Array.from(deptSet);
  }, [candidates, openings]);

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
    <div className="space-y-3.5 -mt-1">
      {/* 1. Header Toolbar: Stage Filter Tabs, Search, Department, Source, and View Mode */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Quick Stage Tabs */}
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
                className={`inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-1 text-[13px] font-medium transition-colors ${
                  isSelected
                    ? 'bg-accent text-white shadow-xs'
                    : 'bg-surface-2 text-text-muted hover:bg-surface-3 hover:text-text'
                }`}
              >
                <span>{stage === 'all' ? 'All Applicants' : stage}</span>
                <span
                  className={`py-0.2 rounded-full px-1.5 font-mono text-[11px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-surface-3 text-text-subtle'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Controls: Search + Department + Source + View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-[190px] lg:w-[210px]">
            <Search className="text-text-subtle pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidates..."
              aria-label="Search candidates"
              className="bg-surface-1 border-border/80 focus:border-border-strong h-8 w-full pl-8 pr-2.5 text-[12.5px]"
            />
          </div>

          {/* Department Filter */}
          {departments.length > 0 && (
            <Select
              value={selectedDepartment}
              onValueChange={(val) => setSelectedDepartment(val)}
            >
              <SelectTrigger className="border-border/80 bg-surface-1 hover:bg-surface-2 text-text h-8 w-auto min-w-[130px] gap-1.5 rounded-[var(--radius-sm)] px-2.5 text-[12px] font-medium">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent align="end" className="min-w-[160px]">
                <SelectItem value="all" className="min-h-[32px] rounded-[6px] py-1.5 text-[13px]">
                  All Departments
                </SelectItem>
                {departments.map((dep) => (
                  <SelectItem
                    key={dep}
                    value={dep}
                    className="min-h-[32px] rounded-[6px] py-1.5 text-[13px]"
                  >
                    {dep}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Source Filter */}
          {sources.length > 0 && (
            <Select value={selectedSource} onValueChange={(val) => setSelectedSource(val)}>
              <SelectTrigger className="border-border/80 bg-surface-1 hover:bg-surface-2 text-text h-8 w-auto min-w-[115px] gap-1.5 rounded-[var(--radius-sm)] px-2.5 text-[12px] font-medium">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent align="end" className="min-w-[150px]">
                <SelectItem value="all" className="min-h-[32px] rounded-[6px] py-1.5 text-[13px]">
                  All Sources
                </SelectItem>
                {sources.map((s) => (
                  <SelectItem
                    key={s}
                    value={s}
                    className="min-h-[32px] rounded-[6px] py-1.5 text-[13px]"
                  >
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* View Mode Toggle: Cards vs Table */}
          <div className="flex items-center rounded-[var(--radius-sm)] border border-border/80 bg-surface-1 p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('columns')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer',
                viewMode === 'columns'
                  ? 'bg-surface-3 text-text shadow-2xs'
                  : 'text-text-muted hover:text-text'
              )}
              title="Department Cards View"
            >
              <Columns3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer',
                viewMode === 'table'
                  ? 'bg-surface-3 text-text shadow-2xs'
                  : 'text-text-muted hover:text-text'
              )}
              title="Table View"
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Content Body: Loading skeleton, Department Cards View, or Table View */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((group) => (
            <div key={group} className="space-y-3">
              <Skeleton className="h-7 w-48 rounded-[6px]" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Skeleton className="h-32 w-full rounded-[10px]" />
                <Skeleton className="h-32 w-full rounded-[10px]" />
                <Skeleton className="h-32 w-full rounded-[10px]" />
                <Skeleton className="h-32 w-full rounded-[10px]" />
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'columns' ? (
        <CandidateColumnsView
          candidates={filteredCandidates}
          openings={openings}
          onSelectCandidate={(candidate) => {
            setActiveCandidate(candidate);
            setSheetOpen(true);
          }}
        />
      ) : (
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
      )}

      {/* Candidate Detail Sheet Drawer */}
      <CandidateDetailSheet
        candidate={activeCandidate}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
