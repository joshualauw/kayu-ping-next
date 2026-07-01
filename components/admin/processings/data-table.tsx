"use client";

import { useMemo } from "react";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import DataTable from "@/components/shared/data-table";
import { useDataTableState } from "@/components/shared/use-data-table-state";
import { useGetAllProcessings } from "@/hooks/swr/processings/use-get-all-processings";
import type { ProcessingListItem } from "@/app/api/processings/route";
import { formatDate } from "@/lib/utils";

export default function ProcessingsDataTable() {
  const { search, setSearch, pagination, setPagination, query, getPageCount } = useDataTableState();

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
      },
      {
        accessorKey: "tid",
        header: "TID",
        cell: ({ row }) => <span className="font-medium">{row.original.tid}</span>,
      },
      {
        accessorKey: "processingDate",
        header: "Processing Date",
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.processingDate)}</span>,
      },
      {
        id: "location",
        header: "Location",
        cell: ({ row }) => <span>{row.original.location.name}</span>,
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
      searchPlaceholder="Filter processing..."
      searchAriaLabel="Filter processing"
      count={count}
      entityNamePlural="processing records"
      isFetching={isFetching}
      isLoading={isLoading}
      error={error}
    />
  );
}
