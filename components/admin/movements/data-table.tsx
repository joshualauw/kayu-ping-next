"use client";

import { useMemo } from "react";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import DataTable from "@/components/shared/data-table";
import { useDataTableState } from "@/components/shared/use-data-table-state";
import { useGetAllMovements } from "@/hooks/swr/movements/use-get-all-movements";
import type { MovementListItem } from "@/app/api/movements/route";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Info, Pencil } from "lucide-react";

export default function MovementsDataTable() {
  const { search, setSearch, pagination, setPagination, query, getPageCount } = useDataTableState();

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
      },
      {
        accessorKey: "tid",
        header: "TID",
        cell: ({ row }) => <span className="font-medium">{row.original.tid}</span>,
      },
      {
        id: "trucker",
        header: "Trucker Name",
        cell: ({ row }) => <span>{row.original.trucker.name}</span>,
      },
      {
        accessorKey: "movementDate",
        header: "Date",
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.movementDate)}</span>,
      },
      {
        id: "fromLocation",
        header: "From Location Name",
        cell: ({ row }) => <span>{row.original.fromLocation.name}</span>,
      },
      {
        id: "toLocation",
        header: "To Location Name",
        cell: ({ row }) => <span>{row.original.toLocation.name}</span>,
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
    },
    manualPagination: true,
    onPaginationChange: setPagination,
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
