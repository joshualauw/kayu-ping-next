"use client";

import { useCallback, useMemo, useState } from "react";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Info, Loader2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import DataTable, { DataTableColumnHeader } from "@/components/shared/data-table";
import { useDataTableState } from "@/components/shared/use-data-table-state";
import { useGetAllWoods } from "@/hooks/swr/woods/use-get-all-woods";
import type { Wood } from "@/generated/prisma/client";
import { formatDate } from "@/lib/utils";
import { deleteWoodAction } from "@/lib/actions/woods/delete-wood";

export default function WoodsDataTable() {
  const router = useRouter();
  const { search, setSearch, pagination, setPagination, sorting, setSorting, query, getPageCount } = useDataTableState();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, error, isLoading, isValidating, mutate } = useGetAllWoods(query);
  const woods = data?.woods ?? [];
  const count = data?.count ?? 0;
  const pageCount = getPageCount(count);

  const handleDelete = useCallback(
    async (wood: Wood) => {
      const confirmed = window.confirm(`Delete ${wood.name}?`);
      if (!confirmed) return;

      setDeletingId(wood.id);

      try {
        const result = await deleteWoodAction(wood.id);

        if (result.success) {
          toast.success("Wood deleted successfully");
          await mutate();
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } finally {
        setDeletingId(null);
      }
    },
    [mutate, router],
  );

  const columns = useMemo<ColumnDef<Wood>[]>(
    () => [
      {
        id: "row",
        header: "Row",
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "code",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
        cell: ({ row }) => <span className="whitespace-nowrap">{row.original.code}</span>,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.createdAt)}</span>,
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
        cell: ({ row }) => <span className="whitespace-nowrap">{formatDate(row.original.updatedAt)}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon-sm" aria-label={`View ${row.original.name}`}>
              <Link href={`/admin/woods/${row.original.id}`}>
                <Info className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon-sm" aria-label={`Edit ${row.original.name}`}>
              <Link href={`/admin/woods/${row.original.id}/edit`}>
                <Pencil className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              onClick={() => handleDelete(row.original)}
              disabled={deletingId === row.original.id}
              aria-label={`Delete ${row.original.name}`}
            >
              {deletingId === row.original.id ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        ),
        enableHiding: false,
      },
    ],
    [deletingId, handleDelete],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: woods,
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
      searchPlaceholder="Filter woods..."
      searchAriaLabel="Filter woods"
      count={count}
      entityNamePlural="woods"
      isFetching={isFetching}
      isLoading={isLoading}
      error={error}
    />
  );
}
