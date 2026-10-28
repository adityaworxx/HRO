'use client';

import * as React from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from './empty-state';
import { ErrorState } from './error-state';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  showSearch?: boolean;
  showControls?: boolean;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onRowClick?: (row: TData) => void;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  showSearch = true,
  showControls = true,
  loading = false,
  error = null,
  onRetry,
  onRowClick,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [density, setDensity] = React.useState<'compact' | 'normal'>('normal');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  const rowPadding = density === 'compact' ? 'py-2 px-3.5' : 'py-3 px-4';

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Controls Bar */}
      {showControls && (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          {showSearch ? (
            <div className="relative w-full sm:max-w-xs">
              <Search className="text-text-subtle pointer-events-none absolute top-2.5 left-3 h-4 w-4" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="bg-surface-2/40 border-border/70 hover:border-border focus:bg-surface-1 h-9 rounded-[8px] pl-9 text-[13px] shadow-2xs transition-all"
              />
            </div>
          ) : null}

          <div className={cn('flex items-center gap-2', !showSearch && 'ml-auto')}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDensity(density === 'compact' ? 'normal' : 'compact')}
              className="border-border/70 bg-surface-2/40 hover:bg-surface-2 text-text-muted hover:text-text h-9 rounded-[8px] text-[12px] font-medium shadow-2xs transition-all"
            >
              <SlidersHorizontal className="text-text-subtle mr-1.5 h-3.5 w-3.5" />
              {density === 'compact' ? 'Comfortable' : 'Compact'}
            </Button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="border-border/80 bg-surface-1/70 overflow-hidden rounded-[12px] border shadow-xs backdrop-blur-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
            <thead className="border-border/70 bg-surface-2/50 border-b backdrop-blur-sm select-none">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        'text-text-muted text-[11px] font-bold tracking-wider whitespace-nowrap uppercase transition-colors first:pl-5 last:pr-5',
                        rowPadding
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-border/40 divide-y">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`loading-row-${i}`}>
                    {columns.map((_, colIdx) => (
                      <td
                        key={`loading-col-${colIdx}`}
                        className={cn(rowPadding, 'first:pl-5 last:pr-5')}
                      >
                        <Skeleton className="h-4 w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      'group hover:bg-surface-2/50 transition-colors duration-140',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn('text-text align-middle first:pl-5 last:pr-5', rowPadding)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-text-muted p-8 text-center">
                    <EmptyState
                      title="No records found"
                      description="No data matches your current search or filters."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="text-text-muted flex items-center justify-between px-1 text-[12px] font-medium select-none">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-border/70 bg-surface-2/40 hover:bg-surface-2 h-8 w-8 rounded-[6px] p-0 shadow-2xs"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-border/70 bg-surface-2/40 hover:bg-surface-2 h-8 w-8 rounded-[6px] p-0 shadow-2xs"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
