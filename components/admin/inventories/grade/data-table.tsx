"use client";

import { useMemo, useState } from "react";
import { ColumnDef, getCoreRowModel, getExpandedRowModel, useReactTable, type ExpandedState, type Row } from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import DataTable from "@/components/shared/data-table";
import { useDataTableState } from "@/components/shared/use-data-table-state";
import { useGetAllInventoriesByGrade } from "@/hooks/swr/inventories/use-get-all-inventories-by-grade";
import type { InventoryGroupedByGradeItem } from "@/lib/services/inventory-service";
import { generateWoodVariantLabel } from "@/lib/helpers/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function GradeInventoriesDataTable() {
  const { search, setSearch, pagination, setPagination, query, getPageCount } = useDataTableState();
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const [showEmpty, setShowEmpty] = useState(false);
  const { data, error, isLoading, isValidating } = useGetAllInventoriesByGrade(query, showEmpty);
  const inventories = data?.inventories ?? [];
  const count = data?.count ?? 0;
  const pageCount = getPageCount(count);

  const columns = useMemo<ColumnDef<InventoryGroupedByGradeItem>[]>(
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
      },
      {
        id: "row",
        header: "Row",
        cell: ({ row }) => row.index + 1,
      },
      {
        id: "grade",
        header: "Grade",
        cell: ({ row }) => {
          const grade = row.original.grade;
          return grade ? (
            <div className="space-y-0.5">
              <div className="font-medium">{grade.name}</div>
              <div className="text-[10px] text-muted-foreground">{grade.code}</div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">Ungraded</span>
          );
        },
      },
      {
        id: "totalVolume",
        header: "Total Volume (m³)",
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.totalVolume.toFixed(4)}</span>,
      },
      {
        accessorKey: "totalStock",
        header: "Total Stock",
        cell: ({ row }) => <span>{row.original.totalStock}</span>,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: inventories,
    columns,
    pageCount,
    state: {
      pagination,
      expanded,
    },
    manualPagination: true,
    onPaginationChange: setPagination,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const renderRowDetails = (row: Row<InventoryGroupedByGradeItem>) => {
    const items = row.original.items;
    return (
      <div className="border-l-4 border-primary/50 bg-muted/30 px-6 py-4">
        <div className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Inventory Breakdown ({items.length})
        </div>
        <div className="overflow-hidden rounded-md border border-border bg-background shadow-xs">
          <table className="w-full text-xs">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th scope="col" className="h-9 px-3 text-left font-medium text-muted-foreground">
                  Variant
                </th>
                <th scope="col" className="h-9 px-3 text-left font-medium text-muted-foreground">
                  Location
                </th>
                <th scope="col" className="h-9 px-3 text-left font-medium text-muted-foreground">
                  Lot
                </th>
                <th scope="col" className="h-9 px-3 text-left font-medium text-muted-foreground">
                  Volume (m³)
                </th>
                <th scope="col" className="h-9 px-3 text-right font-medium text-muted-foreground">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/20 ${item.stock === 0 ? "opacity-50 grayscale" : ""}`}
                >
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
                  <td className="h-9 px-3 align-middle">{item.location.name}</td>
                  <td className="h-9 px-3 align-middle">
                    <Badge variant="outline" className="font-mono text-xs">
                      {item.lot.code}
                    </Badge>
                  </td>
                  <td className="h-9 px-3 align-middle font-mono text-[10px]">
                    <div className="space-y-0.5">
                      <div>Single: {item.variant.volume.toFixed(4)}</div>
                      <div className="font-semibold text-muted-foreground">Total: {item.volume.toFixed(4)}</div>
                    </div>
                  </td>
                  <td className="h-9 px-3 text-right align-middle font-medium">{item.stock}</td>
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
      searchPlaceholder="Filter inventory..."
      searchAriaLabel="Filter inventory"
      count={count}
      entityNamePlural="inventories"
      isFetching={isFetching}
      isLoading={isLoading}
      error={error}
      renderRowDetails={renderRowDetails}
      filterElement={
        <div className="ml-2 flex items-center gap-2">
          <Checkbox id="show-empty-grade" checked={showEmpty} onCheckedChange={(checked) => setShowEmpty(!!checked)} />
          <label htmlFor="show-empty-grade" className="cursor-pointer text-xs font-medium text-muted-foreground uppercase select-none">
            Show empty stock
          </label>
        </div>
      }
    />
  );
}
