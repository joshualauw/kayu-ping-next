"use client";

import { useMemo } from "react";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import DataTable, { DataTableColumnHeader } from "@/components/shared/data-table";
import { useDataTableState } from "@/components/shared/use-data-table-state";
import { useGetAllSales } from "@/hooks/swr/sales/use-get-all-sales";
import type { SaleListItem } from "@/app/api/sales/route";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Info, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SalesDataTable() {
  const { search, setSearch, pagination, setPagination, sorting, setSorting, query, getPageCount } = useDataTableState("saleDate", "desc");

  const { data, error, isLoading, isValidating } = useGetAllSales(query);
  const sales = data?.sales ?? [];
  const count = data?.count ?? 0;
  const pageCount = getPageCount(count);

  const columns = useMemo<ColumnDef<SaleListItem>[]>(
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
        accessorKey: "saleDate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sale Date" />,
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.saleDate)}</span>,
      },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => <span>{row.original.customer.name}</span>,
        enableSorting: false,
      },
      {
        id: "location",
        header: "Location",
        cell: ({ row }) => <span>{row.original.location.name}</span>,
        enableSorting: false,
      },
      {
        accessorKey: "totalPrice",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total Price" />,
        cell: ({ row }) => <span className="whitespace-nowrap">{formatCurrency(row.original.totalPrice)}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon-sm" aria-label="View sale detail">
              <Link href={`/admin/sales/${row.original.id}`}>
                <Info className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon-sm" aria-label="Edit sale notes">
              <Link href={`/admin/sales/${row.original.id}/edit`}>
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
    data: sales,
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
      searchPlaceholder="Filter sales..."
      searchAriaLabel="Filter sales"
      count={count}
      entityNamePlural="sales"
      isFetching={isFetching}
      isLoading={isLoading}
      error={error}
    />
  );
}
