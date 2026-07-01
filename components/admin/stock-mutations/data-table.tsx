"use client";

import { useMemo } from "react";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import DataTable from "@/components/shared/data-table";
import { useDataTableState } from "@/components/shared/use-data-table-state";
import { useGetAllStockMutations } from "@/hooks/swr/stock-mutations/use-get-all-stock-mutations";
import type { StockMutationListItem } from "@/lib/services/stock-mutation-service";
import { formatDate } from "@/lib/utils";
import { generateWoodVariantLabel } from "@/lib/helpers/core";
import { Badge } from "@/components/ui/badge";
import { getReferenceLink } from "@/lib/helpers/core";
import { Button } from "@/components/ui/button";

export default function StockMutationsDataTable() {
  const { search, setSearch, pagination, setPagination, query, getPageCount } = useDataTableState();

  const { data, error, isLoading, isValidating } = useGetAllStockMutations(query);
  const stockMutations = data?.stockMutations ?? [];
  const count = data?.count ?? 0;
  const pageCount = getPageCount(count);

  const columns = useMemo<ColumnDef<StockMutationListItem>[]>(
    () => [
      {
        id: "row",
        header: "Row",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "mutationDate",
        header: "Mutation Date",
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.mutationDate)}</span>,
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
        id: "location",
        header: "Location",
        cell: ({ row }) => <span>{row.original.location.name}</span>,
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.original.type;
          return <Badge variant={type === "IN" ? "success" : "destructive"}>{type}</Badge>;
        },
      },
      {
        id: "volume",
        header: "Volume (m³)",
        cell: ({ row }) => {
          const singleVolume = row.original.variant.volume;
          const totalVol = singleVolume * row.original.quantity;
          return <span>{row.original.type === "IN" ? `+${totalVol.toFixed(4)}` : `-${totalVol.toFixed(4)}`}</span>;
        },
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => <span>{row.original.type === "IN" ? `+${row.original.quantity}` : `-${row.original.quantity}`}</span>,
      },
      {
        id: "reference",
        header: "Reference",
        cell: ({ row }) => {
          const link = getReferenceLink(row.original.referenceType, row.original.referenceId);
          if (!link) return <span className="text-muted-foreground">-</span>;
          return (
            <Button variant="ghost" size="icon-sm">
              <a href={link} target="_blank" aria-label="Open reference page">
                <ExternalLink className="size-3" />
              </a>
            </Button>
          );
        },
      },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: stockMutations,
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
      searchPlaceholder="Filter mutations..."
      searchAriaLabel="Filter mutations"
      count={count}
      entityNamePlural="stock mutations"
      isFetching={isFetching}
      isLoading={isLoading}
      error={error}
    />
  );
}
