"use client";

import { useMemo } from "react";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import DataTable, { DataTableColumnHeader } from "@/components/shared/data-table";
import { useDataTableState } from "@/components/shared/use-data-table-state";
import { useGetAllMovements } from "@/hooks/swr/movements/use-get-all-movements";
import type { MovementListItem } from "@/app/api/movements/route";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Info, Pencil } from "lucide-react";

export default function MovementsDataTable() {
  const { search, setSearch, pagination, setPagination, sorting, setSorting, query, getPageCount } = useDataTableState("movementDate", "desc");

  const { data, error, isLoading, isValidating } = useGetAllMovements(query);
  const movements = data?.movements ?? [];
  const count = data?.count ?? 0;
  const pageCount = getPageCount(count);

  const columns = useMemo<ColumnDef<MovementListItem>[]>(
    () => [
      {
        id: "row",
        header: "No.",
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
      },
      {
        accessorKey: "tid",
        header: ({ column }) => <DataTableColumnHeader column={column} title="TID" />,
        cell: ({ row }) => <span className="font-medium">{row.original.tid}</span>,
      },
      {
        accessorKey: "movementDate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Movement Date" />,
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.movementDate)}</span>,
      },
      {
        id: "trucker",
        header: "Trucker Name",
        cell: ({ row }) => <span>{row.original.trucker.name}</span>,
        enableSorting: false,
      },
      {
        id: "fromLocation",
        header: "From Location Name",
        cell: ({ row }) => <span>{row.original.fromLocation.name}</span>,
        enableSorting: false,
      },
      {
        id: "toLocation",
        header: "To Location Name",
        cell: ({ row }) => <span>{row.original.toLocation.name}</span>,
        enableSorting: false,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon-sm" aria-label="View movement detail">
              <Link href={`/admin/movements/${row.original.id}`}>
                <Info className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon-sm" aria-label="Edit movement notes">
              <Link href={`/admin/movements/${row.original.id}/edit`}>
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
    data: movements,
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
      searchPlaceholder="Filter movements..."
      searchAriaLabel="Filter movements"
      count={count}
      entityNamePlural="movements"
      isFetching={isFetching}
      isLoading={isLoading}
      error={error}
    />
  );
}
