"use client";

import { Fragment } from "react";
import { flexRender, type Table, type Row, type Column } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Search, ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { config } from "@/lib/config";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CalendarDatePicker } from "@/components/shared/calendar-date-picker";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTableProps<TData> {
  table: Table<TData>;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  count: number;
  entityNamePlural: string;
  isFetching: boolean;
  isLoading: boolean;
  error: any;
  renderRowDetails?: (row: Row<TData>) => React.ReactNode;
  filterElement?: React.ReactNode;
  enableDateRangeFilter?: boolean;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  onClearFilters?: () => void;
}

export default function DataTable<TData>({
  table,
  search,
  onSearchChange,
  searchPlaceholder = "Filter...",
  searchAriaLabel = "Filter items",
  count,
  entityNamePlural,
  isFetching,
  isLoading,
  error,
  renderRowDetails,
  filterElement,
  enableDateRangeFilter = false,
  dateRange,
  onDateRangeChange,
  onClearFilters,
}: DataTableProps<TData>) {
  const pagination = table.getState().pagination;
  const pageCount = table.getPageCount();
  const firstRow = count === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const lastRow = Math.min((pagination.pageIndex + 1) * pagination.pageSize, count);
  const hasRows = table.getRowModel().rows.length > 0;
  const columns = table.getVisibleFlatColumns();
  const hasActiveFilters = !!(search || dateRange?.from || dateRange?.to);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="pl-8"
              aria-label={searchAriaLabel}
            />
          </div>
          {enableDateRangeFilter && onDateRangeChange && (
            <div className="flex items-center gap-2">
              <CalendarDatePicker
                date={dateRange || { from: undefined, to: undefined }}
                onDateSelect={(range) => onDateRangeChange(range)}
                className="w-full sm:w-auto"
              />
            </div>
          )}
          {hasActiveFilters && onClearFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-9 px-2 text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          )}
          {filterElement}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isFetching ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          <span>
            {count.toLocaleString("id-ID")} {entityNamePlural}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 caption-bottom text-sm">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} scope="col" className="h-11 px-3 text-left align-middle font-medium text-muted-foreground">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {hasRows ? (
                table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <tr
                      className={`border-b border-border transition-colors last:border-0 hover:bg-muted/40 ${
                        (row.original as any)?.stock === 0 || (row.original as any)?.totalStock === 0 ? "opacity-50 grayscale" : ""
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="h-12 px-3 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    {row.getIsExpanded() && renderRowDetails && (
                      <tr className="border-b border-border bg-muted/10 last:border-0">
                        <td colSpan={columns.length} className="p-0">
                          {renderRowDetails(row)}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-28 px-3 text-center text-sm text-muted-foreground">
                    {error
                      ? `Failed to load ${entityNamePlural}.`
                      : isLoading
                        ? `Loading ${entityNamePlural}...`
                        : `No ${entityNamePlural} found.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {firstRow.toLocaleString("id-ID")} to {lastRow.toLocaleString("id-ID")} of {count.toLocaleString("id-ID")} rows
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page</span>
            <Select value={String(pagination.pageSize)} onValueChange={(value) => table.setPageSize(Number(value))}>
              <SelectTrigger className="h-9 w-18" aria-label="Rows per page">
                <SelectValue placeholder={pagination.pageSize} />
              </SelectTrigger>
              <SelectContent position="popper">
                {config.DATA_TABLE.size_options.map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="min-w-24 text-center text-sm text-muted-foreground">
              Page {pagination.pageIndex + 1} of {pageCount}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                aria-label="Go to first page"
              >
                <ChevronsLeft className="size-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Go to previous page"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Go to next page"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => table.setPageIndex(pageCount - 1)}
                disabled={!table.getCanNextPage()}
                aria-label="Go to last page"
              >
                <ChevronsRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({ column, title, className }: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const isSorted = column.getIsSorted();

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="-ml-3 h-8">
            <span>{title}</span>
            {isSorted === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : isSorted === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
