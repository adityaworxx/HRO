'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import type { Opening } from '@/types/entities';
import type { OpeningStatus } from '@/lib/domain/status-transitions';
import { getNextAllowedOpeningStatuses } from '@/lib/domain/status-transitions';
import { useOpenings, useUpdateOpeningStatus } from '../hooks';
import { useCandidates } from '@/features/candidates/hooks';
import { DataTable } from '@/components/hro/data-table';
import { StatusBadge } from '@/components/hro/status-badge';
import { DepartmentClusterView } from './department-cluster-view';
import { OpeningColumnsView } from './opening-columns-view';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { formatCtcRange } from '@/lib/format';
import {
  MoreHorizontal,
  Eye,
  Edit,
  ArrowRightCircle,
  Building2,
  MapPin,
  Plus,
  Search,
  LayoutGrid,
  Columns3,
  List,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

export function OpeningsTable() {
  const router = useRouter();
  const { data: openings = [], isLoading, isError, refetch } = useOpenings();
  const { data: candidates = [] } = useCandidates();
  const updateStatus = useUpdateOpeningStatus();

  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = React.useState<string>('all');

  // Filter openings by search, status, and department
  const filteredOpenings = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return openings.filter((opening) => {
      // Status match
      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : selectedStatus === 'active'
            ? opening.status === 'Open' ||
              opening.status === 'Sourcing' ||
              opening.status === 'Interviewing' ||
              opening.status === 'Offer Stage'
            : opening.status === selectedStatus;

      // Department match
      const matchesDepartment =
        selectedDepartment === 'all' || opening.department === selectedDepartment;

      // Search query match (title, location, department, must-have skills)
      const matchesSearch =
        query === '' ||
        opening.title.toLowerCase().includes(query) ||
        opening.department.toLowerCase().includes(query) ||
        opening.location.toLowerCase().includes(query) ||
        (opening.mustHaveSkills &&
          opening.mustHaveSkills.some((skill) => skill.toLowerCase().includes(query)));

      return matchesStatus && matchesDepartment && matchesSearch;
    });
  }, [openings, selectedStatus, selectedDepartment, searchQuery]);

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
        header: 'Location',
        cell: ({ row }) => {
          const opening = row.original;
          return (
            <div className="text-text flex items-center gap-1.5 text-[13px]">
              <MapPin className="text-text-muted h-3.5 w-3.5 shrink-0" />
              <span>{opening.location}</span>
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
          <span className="text-text text-[13px] font-bold">
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
        cell: ({ row }) => (
          <Badge variant="default" className="text-[11px] font-medium">
            {row.original.urgency}
          </Badge>
        ),
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
    <div className="space-y-3.5 -mt-1">
      {/* 1. Header Toolbar: Status Pills, Search, Department, and Create Button */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Openings', count: openings.length },
            {
              id: 'active',
              label: 'Active',
              count: openings.filter(
                (o) =>
                  o.status === 'Open' ||
                  o.status === 'Sourcing' ||
                  o.status === 'Interviewing' ||
                  o.status === 'Offer Stage'
              ).length,
            },
            {
              id: 'Interviewing',
              label: 'Interviewing',
              count: openings.filter((o) => o.status === 'Interviewing').length,
            },
            {
              id: 'Offer Stage',
              label: 'Offer Stage',
              count: openings.filter((o) => o.status === 'Offer Stage').length,
            },
            {
              id: 'On Hold',
              label: 'On Hold',
              count: openings.filter((o) => o.status === 'On Hold').length,
            },
            {
              id: 'Closed',
              label: 'Closed',
              count: openings.filter((o) => o.status === 'Closed' || o.status === 'Filled')
                .length,
            },
          ].map((tab) => {
            const isSelected = selectedStatus === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-1 text-[13px] font-medium transition-colors ${
                  isSelected
                    ? 'bg-accent text-white shadow-xs'
                    : 'bg-surface-2 text-text-muted hover:bg-surface-3 hover:text-text'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 font-mono text-[11px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-surface-3 text-text-subtle'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Controls: Search + Department + New Opening */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-[200px] lg:w-[220px]">
            <Search className="text-text-subtle pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search openings..."
              aria-label="Search openings"
              className="bg-surface-1 border-border/80 focus:border-border-strong h-8 w-full pl-8 pr-2.5 text-[12.5px]"
            />
          </div>

          {departments.length > 0 && (
            <Select value={selectedDepartment} onValueChange={(val) => setSelectedDepartment(val)}>
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

          <Button
            asChild
            variant="primary"
            size="sm"
            className="h-8 shrink-0 gap-1.5 px-3 text-[12.5px]"
          >
            <Link href="/openings/new">
              <Plus className="h-3.5 w-3.5" />
              <span>New Opening</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Content Body: Loading or Department Columns */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((group) => (
            <div key={group} className="space-y-3">
              <Skeleton className="h-7 w-48 rounded-[6px]" />
              <div className="space-y-2">
                <Skeleton className="h-24 w-full rounded-[10px]" />
                <Skeleton className="h-24 w-full rounded-[10px]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <OpeningColumnsView
          openings={filteredOpenings}
          candidates={candidates}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
