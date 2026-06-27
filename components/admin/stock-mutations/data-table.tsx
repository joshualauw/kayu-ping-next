"use client";

import { useMemo } from "react";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import DataTable from "@/components/shared/data-table";
import { useDataTableState } from "@/components/shared/use-data-table-state";
import { useGetAllStockMutations } from "@/hooks/swr/stock-mutations/use-get-all-stock-mutations";
import type { StockMutationListItem } from "@/lib/services/stock-mutation-service";
import { formatDate } from "@/lib/utils";
import { Measurement } from "@/generated/prisma/enums";
import { calculateWoodTotalVolume } from "@/lib/helpers/wood-volume";
import { Badge } from "@/components/ui/badge";
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
        id: "wood",
        header: "Wood Code",
        cell: ({ row }) => {
          const wood = row.original.variant.wood;
          return (
            <div>
              <div>{wood.code}</div>
              <div className="text-[10px] text-muted-foreground">{wood.name}</div>
            </div>
          );
        },
      },
      {
        id: "material",
        header: "Material Code",
        cell: ({ row }) => <span>{row.original.variant.material.name}</span>,
      },
      {
        id: "dimension",
        header: "Dimension",
        cell: ({ row }) => {
          const variant = row.original.variant;
          const material = variant.material;
          return (
            <div>
              {material.measurement === Measurement.CUBE && (
                <div>
                  W: {variant.width ?? 0} / H: {variant.height ?? 0}
                </div>
              )}
              {material.measurement === Measurement.CYLINDER && (
                <div>
                  D.0: {variant.diameterSmall ?? 0} / D.1: {variant.diamterLarge ?? 0}
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "length",
        header: "Length (cm)",
        cell: ({ row }) => <span>{row.original.variant.length}</span>,
      },
      {
        id: "volume",
        header: "Volume (m³)",
        cell: ({ row }) => {
          const singleVolume = row.original.variant.volume;
          const totalVol = calculateWoodTotalVolume(singleVolume, row.original.quantity);
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
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.original.type;
          return <Badge variant={type === "IN" ? "default" : "destructive"}>{type}</Badge>;
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
        cell: ({ row }) => (
          <Button asChild variant="ghost" size="icon-sm" className="h-6 w-6">
            <a href={row.original.referenceLink ?? "#"} aria-label="Open reference page" target="_blank">
              <ExternalLink className="size-3" />
            </a>
          </Button>
        ),
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
