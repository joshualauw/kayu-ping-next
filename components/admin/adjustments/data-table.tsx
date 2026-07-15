"use client";

import { useMemo } from "react";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import DataTable, { DataTableColumnHeader } from "@/components/shared/data-table";
import { useDataTableState } from "@/components/shared/use-data-table-state";
import { useGetAllAdjustments } from "@/hooks/swr/adjustments/use-get-all-adjustments";
import type { AdjustmentListItem } from "@/app/api/adjustments/route";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Info, Pencil } from "lucide-react";

export default function AdjustmentsDataTable() {
  const { search, setSearch, pagination, setPagination, sorting, setSorting, query, getPageCount, dateRange, setDateRange, resetAll } =
    useDataTableState("adjustmentDate", "desc");

  const { data, error, isLoading, isValidating } = useGetAllAdjustments(query);
  const adjustments = data?.adjustments ?? [];
  const count = data?.count ?? 0;
  const pageCount = getPageCount(count);

  const columns = useMemo<ColumnDef<AdjustmentListItem>[]>(
    () => [
      {
        id: "row",
        header: "Row",
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
      },
      {
        accessorKey: "tid",
        header: ({ column }) => <DataTableColumnHeader column={column} title="TID" />,
        cell: ({ row }) => <span className="font-medium">{row.original.tid}</span>,
      },
      {
        accessorKey: "adjustmentDate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Adjustment Date" />,
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.adjustmentDate)}</span>,
      },
      {
        id: "location",
        header: "Location",
        cell: ({ row }) => <span>{row.original.location.name}</span>,
        enableSorting: false,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon-sm" aria-label="View adjustment detail">
              <Link href={`/admin/adjustments/${row.original.id}`}>
                <Info className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon-sm" aria-label="Edit adjustment notes">
              <Link href={`/admin/adjustments/${row.original.id}/edit`}>
                <Pencil className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ),
        enableHiding: false,
      },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: adjustments,
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  });

  const isFetching = isLoading || isValidating;

  return (
    <DataTable
      table={table}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Filter adjustments..."
      searchAriaLabel="Filter adjustments"
      count={count}
      entityNamePlural="adjustments"
      isFetching={isFetching}
      isLoading={isLoading}
      error={error}
      enableDateRangeFilter={true}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      onClearFilters={resetAll}
    />
  );
}
