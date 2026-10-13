'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import type { Opening } from '@/types/entities';
import type { OpeningStatus } from '@/lib/domain/status-transitions';
import { getNextAllowedOpeningStatuses } from '@/lib/domain/status-transitions';
import { useOpenings, useUpdateOpeningStatus } from '../hooks';
import { DataTable } from '@/components/hro/data-table';
import { StatusBadge } from '@/components/hro/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { formatCtcRange } from '@/lib/format';
import { MoreHorizontal, Eye, Edit, ArrowRightCircle, Building2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export function OpeningsTable() {
  const router = useRouter();
  const { data: openings = [], isLoading, isError, refetch } = useOpenings();
  const updateStatus = useUpdateOpeningStatus();

  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>('all');

  // Filter openings
  const filteredOpenings = React.useMemo(() => {
    return openings.filter((opening) => {
      const matchesStatus = selectedStatus === 'all' || opening.status === selectedStatus;
      const matchesDepartment =
        selectedDepartment === 'all' || opening.department === selectedDepartment;
      return matchesStatus && matchesDepartment;
    });
  }, [openings, selectedStatus, selectedDepartment]);

  // Unique departments for filter dropdown
  const departments = React.useMemo(() => {
    const set = new Set(openings.map((o) => o.department));
    return Array.from(set);
  }, [openings]);

  const handleStatusChange = React.useCallback(
    (id: string, newStatus: OpeningStatus, title: string) => {
      updateStatus.mutate(
        { id, status: newStatus },
        {
          onSuccess: () => {
            toast.success(`Updated "${title}" status to ${newStatus}`);
          },
        }
      );
    },
    [updateStatus]
  );

  const columns = React.useMemo<ColumnDef<Opening>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Position & Department',
        cell: ({ row }) => {
          const opening = row.original;
          return (
            <div className="space-y-0.5">
              <Link
                href={`/openings/${opening.id}`}
                className="text-text hover:text-accent text-[14px] font-semibold transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {opening.title}
              </Link>
              <div className="text-text-muted flex items-center gap-1.5 text-[12px]">
                <Building2 className="h-3.5 w-3.5 opacity-70" />
                <span>{opening.department}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'location',
        header: 'Location & Type',
        cell: ({ row }) => {
          const opening = row.original;
          return (
            <div className="space-y-0.5 text-[13px]">
              <div className="text-text flex items-center gap-1.5">
                <MapPin className="text-text-muted h-3.5 w-3.5" />
                <span>{opening.location}</span>
              </div>
              <span className="text-text-muted text-[12px]">{opening.employmentType}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'headcount',
        header: 'Headcount',
        cell: ({ row }) => (
          <span className="text-text font-mono text-[13px] font-medium">
            {row.original.headcount} role{row.original.headcount > 1 ? 's' : ''}
          </span>
        ),
      },
      {
        id: 'experience',
        header: 'Experience',
        cell: ({ row }) => (
          <span className="text-text text-[13px]">
            {row.original.experienceRange.min}-{row.original.experienceRange.max} yrs
          </span>
        ),
      },
      {
        id: 'budget',
        header: 'Budget Range',
        cell: ({ row }) => (
          <span className="text-text font-mono text-[13px]">
            {formatCtcRange(row.original.budgetRange.min, row.original.budgetRange.max)}
          </span>
        ),
      },
      {
        accessorKey: 'urgency',
        header: 'Urgency',
        cell: ({ row }) => {
          const urgency = row.original.urgency;
          const variant =
            urgency === 'High' ? 'danger' : urgency === 'Normal' ? 'accent' : 'default';
          return (
            <Badge variant={variant} className="text-[11px] font-medium">
              {urgency}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} type="opening" />,
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const opening = row.original;
          const allowedTransitions = getNextAllowedOpeningStatuses(opening.status);

          return (
            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/openings/${opening.id}`} className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>View Requisition</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/openings/${opening.id}/edit`} className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      <span>Edit Details</span>
                    </Link>
                  </DropdownMenuItem>

                  {allowedTransitions.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-text-subtle text-[11px]">
                        Change Status
                      </DropdownMenuLabel>
                      {allowedTransitions.map((nextStatus) => (
                        <DropdownMenuItem
                          key={nextStatus}
                          onClick={() => handleStatusChange(opening.id, nextStatus, opening.title)}
                          className="flex items-center gap-2"
                        >
                          <ArrowRightCircle className="text-accent h-3.5 w-3.5" />
                          <span>Move to {nextStatus}</span>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [handleStatusChange]
  );

  return (
    <div className="space-y-4">
      {/* Quick Status Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'Open', 'Sourcing', 'Interviewing', 'Offer Stage', 'On Hold', 'Closed'].map(
            (status) => {
              const isSelected = selectedStatus === status;
              const count =
                status === 'all'
                  ? openings.length
                  : openings.filter((o) => o.status === status).length;

              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-1 text-[13px] font-medium transition-colors ${
                    isSelected
                      ? 'bg-accent text-bg shadow-sm'
                      : 'bg-surface-2 text-text-muted hover:bg-surface-3 hover:text-text'
                  }`}
                >
                  <span>{status === 'all' ? 'All Openings' : status}</span>
                  <span
                    className={`py-0.2 rounded-full px-1.5 font-mono text-[11px] ${
                      isSelected ? 'bg-bg/20 text-bg' : 'bg-surface-3 text-text-subtle'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* Department Filter */}
        {departments.length > 0 && (
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border-border bg-surface-2 text-text focus:ring-accent h-8 rounded-[var(--radius-sm)] border px-2.5 text-[12px] font-medium outline-none focus:ring-1"
          >
            <option value="all">All Departments</option>
            {departments.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* TanStack Data Table */}
      <DataTable
        columns={columns}
        data={filteredOpenings}
        searchPlaceholder="Filter requisitions by title, location, skill..."
        loading={isLoading}
        error={isError ? 'Failed to fetch job requisitions' : null}
        onRetry={() => void refetch()}
        onRowClick={(row) => router.push(`/openings/${row.id}`)}
      />
    </div>
  );
}
