"use client";

import { Fragment } from "react";
import { flexRender, type Table, type Row } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { config } from "@/lib/config";

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
}: DataTableProps<TData>) {
  const pagination = table.getState().pagination;
  const pageCount = table.getPageCount();
  const firstRow = count === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const lastRow = Math.min((pagination.pageIndex + 1) * pagination.pageSize, count);
  const hasRows = table.getRowModel().rows.length > 0;
  const columns = table.getVisibleFlatColumns();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                    <tr className="border-b border-border transition-colors last:border-0 hover:bg-muted/40">
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
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Rows per page
            <select
              value={pagination.pageSize}
              onChange={(event) => table.setPageSize(Number(event.target.value))}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              aria-label="Rows per page"
            >
              {config.DATA_TABLE.size_options.map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </label>

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
