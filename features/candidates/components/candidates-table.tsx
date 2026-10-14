'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Candidate } from '@/types/entities';
import { useCandidates } from '../hooks';
import { DataTable } from '@/components/hro/data-table';
import { StatusBadge } from '@/components/hro/status-badge';
import { Badge } from '@/components/ui/badge';
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
import { Eye, Building2, Mail } from 'lucide-react';

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
        header: 'Candidate Name',
        cell: ({ row }) => {
          const candidate = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-[11px] font-semibold">
                  {candidate.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="text-text hover:text-accent text-[13px] font-semibold">
                  {candidate.name}
                </span>
                <div className="text-text-muted flex items-center gap-1 text-[11px]">
                  <Mail className="h-3 w-3 opacity-60" />
                  <span>{candidate.email}</span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: 'experience',
        header: 'Role & Experience',
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="space-y-0.5 text-[13px]">
              <div className="text-text flex items-center gap-1.5 font-medium">
                <Building2 className="text-text-muted h-3.5 w-3.5" />
                <span>{c.currentRole}</span>
              </div>
              <p className="text-text-muted text-[11px]">
                {c.currentCompany} • {c.experienceYears}y exp
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: 'expectedCtc',
        header: 'Expected CTC',
        cell: ({ row }) => (
          <span className="text-text font-mono text-[13px] font-medium">
            {formatCtc(row.original.expectedCtc)}
          </span>
        ),
      },
      {
        accessorKey: 'noticePeriod',
        header: 'Notice',
        cell: ({ row }) => (
          <span className="text-text-muted text-[12px]">{row.original.noticePeriod}</span>
        ),
      },
      {
        accessorKey: 'source',
        header: 'Source',
        cell: ({ row }) => (
          <Badge variant="default" className="text-[11px]">
            {row.original.source}
          </Badge>
        ),
      },
      {
        accessorKey: 'stage',
        header: 'Current Stage',
        cell: ({ row }) => <StatusBadge status={row.original.stage} type="candidate" />,
      },
      {
        accessorKey: 'managerDecision',
        header: 'Manager Review',
        cell: ({ row }) => {
          const decision = row.original.managerDecision;
          const variant =
            decision === 'Shortlisted' ? 'success' : decision === 'Rejected' ? 'danger' : 'default';
          return (
            <Badge variant={variant} className="text-[11px]">
              {decision}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const candidate = row.original;

          return (
            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveCandidate(candidate);
                  setSheetOpen(true);
                }}
                className="h-7 gap-1 text-[12px]"
              >
                <Eye className="h-3.5 w-3.5" />
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
                className={`inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-1 text-[13px] font-medium transition-colors ${
                  isSelected
                    ? 'bg-accent text-bg shadow-sm'
                    : 'bg-surface-2 text-text-muted hover:bg-surface-3 hover:text-text'
                }`}
              >
                <span>{stage === 'all' ? 'All Applicants' : stage}</span>
                <span
                  className={`py-0.2 rounded-full px-1.5 font-mono text-[11px] ${
                    isSelected ? 'bg-bg/20 text-bg' : 'bg-surface-3 text-text-subtle'
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
            <SelectTrigger className="h-8 w-auto min-w-[140px] gap-2 border-border bg-surface-2 hover:bg-surface-3 text-text px-2.5 text-[12px] font-medium rounded-[var(--radius-sm)]">
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
