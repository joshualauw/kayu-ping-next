"use client";

import { useMemo } from "react";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import DataTable from "@/components/shared/data-table";
import { useDataTableState } from "@/components/shared/use-data-table-state";
import { useGetAllInventories } from "@/hooks/swr/inventories/use-get-all-inventories";
import type { InventoryListItem } from "@/lib/services/inventory-service";
import { formatDate } from "@/lib/utils";
import { calculateWoodTotalVolume, generateWoodVariantLabel } from "@/lib/helpers/core";

export default function InventoriesDataTable() {
  const { search, setSearch, pagination, setPagination, query, getPageCount } = useDataTableState();

  const { data, error, isLoading, isValidating } = useGetAllInventories(query);
  const inventories = data?.inventories ?? [];
  const count = data?.count ?? 0;
  const pageCount = getPageCount(count);

  const columns = useMemo<ColumnDef<InventoryListItem>[]>(
    () => [
      {
        id: "row",
        header: "Row",
        cell: ({ row }) => row.index + 1,
      },
      {
        id: "variant",
        header: "Variant",
        cell: ({ row }) => {
          const variant = row.original.variant;
          return (
            <div className="font-medium">
              {generateWoodVariantLabel({
                woodCode: variant.wood.code,
                materialCode: variant.material.name,
                width: variant.width,
                height: variant.height,
                diameterSmall: variant.diameterSmall,
                diameterLarge: variant.diamterLarge,
                length: variant.length,
                measurement: variant.material.measurement,
              })}
            </div>
          );
        },
      },
      {
        id: "volume",
        header: "Volume (m³)",
        cell: ({ row }) => {
          const singleVolume = row.original.variant.volume;
          const totalVol = calculateWoodTotalVolume(singleVolume, row.original.stock);
          return (
            <div className="space-y-0.5 font-mono text-xs">
              <div>Single: {singleVolume.toFixed(4)}</div>
              <div className="font-semibold text-muted-foreground">Total: {totalVol.toFixed(4)}</div>
            </div>
          );
        },
      },
      {
        id: "location",
        header: "Location",
        cell: ({ row }) => <span>{row.original.location.name}</span>,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => <span>{row.original.stock}</span>,
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.createdAt)}</span>,
      },
      {
        accessorKey: "updatedAt",
        header: "Updated At",
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.updatedAt)}</span>,
      },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: inventories,
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
      searchPlaceholder="Filter inventory..."
      searchAriaLabel="Filter inventory"
      count={count}
      entityNamePlural="inventories"
      isFetching={isFetching}
      isLoading={isLoading}
      error={error}
    />
  );
}
