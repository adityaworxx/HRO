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
import { CandidateAvatar } from '@/components/hro/candidate-avatar';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { CandidateDetailSheet } from './candidate-detail-sheet';
import { CandidateColumnsView } from './candidate-columns-view';
import { SourceBadge } from '@/components/hro/source-badge';
import { CompanyLogo } from '@/components/hro/company-logo';
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
        (c.noticePeriod && c.noticePeriod.toLowerCase().includes(query)) ||
        (opening &&
          (opening.title.toLowerCase().includes(query) ||
            opening.department.toLowerCase().includes(query) ||
            (opening.mustHaveSkills &&
              opening.mustHaveSkills.some((s) => s.toLowerCase().includes(query)))));

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
            <div className="flex max-w-[210px] min-w-[160px] items-center gap-2.5">
              <CandidateAvatar name={candidate.name} candidateId={candidate.id} size="sm" />
              <div className="min-w-0">
                <span className="text-text hover:text-text block cursor-pointer truncate text-[13px] font-semibold tracking-tight transition-colors">
                  {candidate.name}
                </span>
                <span className="text-text-muted block truncate text-[11px] font-normal">
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
            <div className="max-w-[220px] min-w-[170px] space-y-0.5">
              <span className="text-text block truncate text-[13px] font-medium">
                {c.currentRole}
              </span>
              <span className="text-text-muted mt-0.5 flex items-center gap-1.5 truncate text-[12px] font-medium">
                <CompanyLogo
                  company={c.currentCompany}
                  className="h-3.5 w-3.5 shrink-0 rounded-[3px] shadow-2xs"
                />
                <span className="truncate">{c.currentCompany}</span>
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'experienceYears',
        header: 'Experience',
        cell: ({ row }) => (
          <span className="text-text font-sans text-[13px] font-bold whitespace-nowrap tabular-nums">
            {row.original.experienceYears} yrs
          </span>
        ),
      },
      {
        accessorKey: 'expectedCtc',
        header: 'Expected CTC',
        cell: ({ row }) => (
          <span className="text-text font-sans text-[13px] font-medium whitespace-nowrap tabular-nums">
            {formatCtc(row.original.expectedCtc)}
          </span>
        ),
      },
      {
        accessorKey: 'source',
        header: 'Source',
        cell: ({ row }) => <SourceBadge source={row.original.source} />,
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
        header: () => <div className="pr-2 text-right whitespace-nowrap">Action</div>,
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
                className="text-accent hover:text-accent hover:bg-accent/10 h-7 rounded-[6px] px-2.5 text-[12px] font-medium whitespace-nowrap transition-colors"
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
    <div className="-mt-1 space-y-3.5">
      {/* 1. Header Toolbar: All in ONE Single Line like Openings */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Quick Stage Tabs */}
        <div className="no-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto">
          {[
            { id: 'all', label: 'All Applicants' },
            { id: 'Sourced', label: 'Sourced' },
            { id: 'Shared with Manager', label: 'Mgr Review' },
            { id: 'Interview', label: 'Interview' },
            { id: 'Selected', label: 'Selected' },
            { id: 'Offer Sent', label: 'Offer Sent' },
            { id: 'Joined', label: 'Joined' },
          ].map((tab) => {
            const isSelected = selectedStage === tab.id;
            const count =
              tab.id === 'all'
                ? candidates.length
                : candidates.filter((c) => c.stage === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStage(tab.id)}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-1 text-[12px] font-medium whitespace-nowrap transition-colors select-none ${
                  isSelected
                    ? 'bg-accent font-semibold text-white shadow-xs'
                    : 'bg-surface-2 text-text-muted hover:bg-surface-3 hover:text-text'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 font-sans text-[11px] font-semibold tabular-nums ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-surface-3 text-text-subtle'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Controls: Search + Department + Source + View Mode Toggle */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="relative w-[130px] sm:w-[150px] lg:w-[170px]">
            <Search className="text-text-subtle pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              aria-label="Search candidates"
              className="bg-surface-1 border-border/80 focus:border-border-strong h-8 w-full pr-2 pl-8 text-[12px]"
            />
          </div>

          {/* Department Filter */}
          {departments.length > 0 && (
            <Select value={selectedDepartment} onValueChange={(val) => setSelectedDepartment(val)}>
              <SelectTrigger className="border-border/80 bg-surface-1 hover:bg-surface-2 text-text h-8 w-auto min-w-[105px] gap-1 rounded-[var(--radius-sm)] px-2 text-[11.5px] font-medium sm:min-w-[120px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent align="end" className="min-w-[160px]">
                <SelectItem value="all" className="min-h-[32px] rounded-[6px] py-1.5 text-[12.5px]">
                  All Departments
                </SelectItem>
                {departments.map((dep) => (
                  <SelectItem
                    key={dep}
                    value={dep}
                    className="min-h-[32px] rounded-[6px] py-1.5 text-[12.5px]"
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
              <SelectTrigger className="border-border/80 bg-surface-1 hover:bg-surface-2 text-text h-8 w-auto min-w-[95px] gap-1 rounded-[var(--radius-sm)] px-2 text-[11.5px] font-medium sm:min-w-[105px]">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent align="end" className="min-w-[150px]">
                <SelectItem value="all" className="min-h-[32px] rounded-[6px] py-1.5 text-[12.5px]">
                  All Sources
                </SelectItem>
                {sources.map((s) => (
                  <SelectItem
                    key={s}
                    value={s}
                    className="min-h-[32px] rounded-[6px] py-1.5 text-[12.5px]"
                  >
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* View Mode Toggle: Cards vs Table */}
          <div className="border-border/80 bg-surface-1 flex shrink-0 items-center rounded-[var(--radius-sm)] border p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('columns')}
              className={cn(
                'flex cursor-pointer items-center gap-1 rounded-[4px] px-2 py-1 text-[11.5px] font-medium transition-colors',
                viewMode === 'columns'
                  ? 'bg-surface-3 text-text shadow-2xs'
                  : 'text-text-muted hover:text-text'
              )}
              title="Department Cards View"
            >
              <Columns3 className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'flex cursor-pointer items-center gap-1 rounded-[4px] px-2 py-1 text-[11.5px] font-medium transition-colors',
                viewMode === 'table'
                  ? 'bg-surface-3 text-text shadow-2xs'
                  : 'text-text-muted hover:text-text'
              )}
              title="Table View"
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          showControls={false}
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
