"use client";

import { useMemo } from "react";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import DataTable, { DataTableColumnHeader } from "@/components/shared/data-table";
import { useDataTableState } from "@/components/shared/use-data-table-state";
import { useGetAllProcessings } from "@/hooks/swr/processings/use-get-all-processings";
import type { ProcessingListItem } from "@/app/api/processings/route";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Info, Pencil } from "lucide-react";

export default function ProcessingsDataTable() {
  const { search, setSearch, pagination, setPagination, sorting, setSorting, query, getPageCount, dateRange, setDateRange, resetAll } =
    useDataTableState("processingDate", "desc");

  const { data, error, isLoading, isValidating } = useGetAllProcessings(query);
  const processings = data?.processings ?? [];
  const count = data?.count ?? 0;
  const pageCount = getPageCount(count);

  const columns = useMemo<ColumnDef<ProcessingListItem>[]>(
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
        accessorKey: "processingDate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Processing Date" />,
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.processingDate)}</span>,
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
            <Button asChild variant="ghost" size="icon-sm" aria-label="View processing detail">
              <Link href={`/admin/processings/${row.original.id}`}>
                <Info className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon-sm" aria-label="Edit processing notes">
              <Link href={`/admin/processings/${row.original.id}/edit`}>
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
    data: processings,
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
      searchPlaceholder="Filter processing..."
      searchAriaLabel="Filter processing"
      count={count}
      entityNamePlural="processings"
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
