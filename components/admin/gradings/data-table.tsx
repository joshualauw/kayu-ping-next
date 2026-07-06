"use client";

import { useMemo } from "react";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import DataTable from "@/components/shared/data-table";
import { useDataTableState } from "@/components/shared/use-data-table-state";
import { useGetAllGradings } from "@/hooks/swr/gradings/use-get-all-gradings";
import type { GradingListItem } from "@/app/api/gradings/route";
import { formatDate } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Info, Pencil } from "lucide-react";

export default function GradingsDataTable() {
  const { search, setSearch, pagination, setPagination, query, getPageCount } = useDataTableState();

  const { data, error, isLoading, isValidating } = useGetAllGradings(query);
  const gradings = data?.gradings ?? [];
  const count = data?.count ?? 0;
  const pageCount = getPageCount(count);

  const columns = useMemo<ColumnDef<GradingListItem>[]>(
    () => [
      {
        id: "row",
        header: "Row",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "tid",
        header: "TID",
        cell: ({ row }) => <span className="font-medium">{row.original.tid}</span>,
      },
      {
        accessorKey: "gradingDate",
        header: "Grading Date",
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.gradingDate)}</span>,
      },
      {
        id: "location",
        header: "Location",
        cell: ({ row }) => <span>{row.original.location.name}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon-sm" aria-label="View grading detail">
              <Link href={`/admin/gradings/${row.original.id}`}>
                <Info className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon-sm" aria-label="Edit grading notes">
              <Link href={`/admin/gradings/${row.original.id}/edit`}>
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
    data: gradings,
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
      searchPlaceholder="Filter grading..."
      searchAriaLabel="Filter grading"
      count={count}
      entityNamePlural="gradings"
      isFetching={isFetching}
      isLoading={isLoading}
      error={error}
    />
  );
}
