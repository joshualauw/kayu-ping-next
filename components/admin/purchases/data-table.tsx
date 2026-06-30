"use client";

import { useMemo } from "react";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import DataTable from "@/components/shared/data-table";
import { useDataTableState } from "@/components/shared/use-data-table-state";
import { useGetAllPurchases } from "@/hooks/swr/purchases/use-get-all-purchases";
import type { PurchaseListItem } from "@/app/api/purchases/route";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Info, Pencil } from "lucide-react";

export default function PurchasesDataTable() {
  const { search, setSearch, pagination, setPagination, query, getPageCount } = useDataTableState();

  const { data, error, isLoading, isValidating } = useGetAllPurchases(query);
  const purchases = data?.purchases ?? [];
  const count = data?.count ?? 0;
  const pageCount = getPageCount(count);

  const columns = useMemo<ColumnDef<PurchaseListItem>[]>(
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
        accessorKey: "purchaseDate",
        header: "Purchase Date",
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.purchaseDate)}</span>,
      },
      {
        id: "supplier",
        header: "Supplier",
        cell: ({ row }) => <span>{row.original.supplier.name}</span>,
      },
      {
        id: "location",
        header: "Location",
        cell: ({ row }) => <span>{row.original.location.name}</span>,
      },
      {
        accessorKey: "totalPrice",
        header: "Total Price",
        cell: ({ row }) => <span className="whitespace-nowrap">{formatCurrency(row.original.totalPrice)}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon-sm" aria-label="View purchase detail">
              <Link href={`/admin/purchases/${row.original.id}`}>
                <Info className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon-sm" aria-label="Edit purchase notes">
              <Link href={`/admin/purchases/${row.original.id}/edit`}>
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
    data: purchases,
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
      searchPlaceholder="Filter purchases..."
      searchAriaLabel="Filter purchases"
      count={count}
      entityNamePlural="purchases"
      isFetching={isFetching}
      isLoading={isLoading}
      error={error}
    />
  );
}
