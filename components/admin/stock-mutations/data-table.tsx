"use client";

import { useMemo, useState } from "react";
import { ColumnDef, getCoreRowModel, getExpandedRowModel, useReactTable, type ExpandedState, type Row } from "@tanstack/react-table";
import { ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import DataTable, { DataTableColumnHeader } from "@/components/shared/data-table";
import { useDataTableState } from "@/components/shared/use-data-table-state";
import { useGetAllStockMutations } from "@/hooks/swr/stock-mutations/use-get-all-stock-mutations";
import type { StockMutationGroupedItem } from "@/lib/services/stock-mutation-service";
import { formatDate } from "@/lib/utils";
import { generateWoodVariantLabel } from "@/lib/helpers/core";
import { Badge } from "@/components/ui/badge";
import { getReferenceLink } from "@/lib/helpers/core";
import { Button } from "@/components/ui/button";

export default function StockMutationsDataTable() {
  const { search, setSearch, pagination, setPagination, sorting, setSorting, query, getPageCount } = useDataTableState(
    "mutationDate",
    "desc",
  );
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const { data, error, isLoading, isValidating } = useGetAllStockMutations(query);
  const stockMutations = data?.stockMutations ?? [];
  const count = data?.count ?? 0;
  const pageCount = getPageCount(count);

  const columns = useMemo<ColumnDef<StockMutationGroupedItem>[]>(
    () => [
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => row.toggleExpanded()}
            aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
          >
            {row.getIsExpanded() ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </Button>
        ),
        enableSorting: false,
      },
      {
        id: "row",
        header: "Row",
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
      },
      {
        accessorKey: "mutationDate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mutation Date" />,
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.mutationDate)}</span>,
      },
      {
        accessorKey: "referenceType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
        cell: ({ row }) => row.original.referenceType,
      },
      {
        id: "reference",
        header: "Reference",
        cell: ({ row }) => {
          const link = getReferenceLink(row.original.referenceType, row.original.referenceId);
          if (!link) return <span className="text-muted-foreground">-</span>;
          return (
            <Button variant="ghost" size="icon-sm" asChild>
              <a href={link} target="_blank" aria-label="Open reference page">
                <ExternalLink className="size-3" />
              </a>
            </Button>
          );
        },
        enableSorting: false,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: stockMutations,
    columns,
    pageCount,
    state: {
      pagination,
      expanded,
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const renderRowDetails = (row: Row<StockMutationGroupedItem>) => {
    const items = row.original.items;
    return (
      <div className="border-l-4 border-primary/50 bg-muted/30 px-6 py-4">
        <div className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Mutation Items ({items.length})</div>
        <div className="overflow-hidden rounded-md border border-border bg-background shadow-xs">
          <table className="w-full text-xs">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th scope="col" className="h-9 px-3 text-left font-medium text-muted-foreground">
                  Variant
                </th>
                <th scope="col" className="h-9 px-3 text-left font-medium text-muted-foreground">
                  Grade
                </th>
                <th scope="col" className="h-9 px-3 text-left font-medium text-muted-foreground">
                  Lot
                </th>
                <th scope="col" className="h-9 px-3 text-left font-medium text-muted-foreground">
                  Location
                </th>
                <th scope="col" className="h-9 px-3 text-left font-medium text-muted-foreground">
                  Type
                </th>
                <th scope="col" className="h-9 px-3 text-right font-medium text-muted-foreground">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="h-9 px-3 align-middle font-medium">
                    {generateWoodVariantLabel({
                      woodCode: item.variant.wood.code,
                      materialCode: item.variant.material.code,
                      width: item.variant.width,
                      height: item.variant.height,
                      diameterSmall: item.variant.diameterSmall,
                      diameterLarge: item.variant.diamterLarge,
                      length: item.variant.length,
                      measurement: item.variant.material.measurement,
                    })}
                  </td>
                  <td className="h-9 px-3 align-middle">
                    {item.grade ? (
                      <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                        {item.grade.code}
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">Ungraded</span>
                    )}
                  </td>
                  <td className="h-9 px-3 align-middle">
                    <Badge variant="outline" className="font-mono text-xs">
                      {item.lot.code}
                    </Badge>
                  </td>
                  <td className="h-9 px-3 align-middle">{item.location.name}</td>
                  <td className="h-9 px-3 align-middle">
                    <Badge variant={item.type === "IN" ? "success" : "destructive"} className="px-1.5 py-0 text-[10px]">
                      {item.type}
                    </Badge>
                  </td>
                  <td className="h-9 px-3 text-right align-middle font-medium">
                    {item.type === "IN" ? `+${item.quantity}` : `-${item.quantity}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

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
      renderRowDetails={renderRowDetails}
    />
  );
}
