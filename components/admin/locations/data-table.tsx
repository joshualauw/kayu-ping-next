"use client";

import { useCallback, useMemo, useState } from "react";
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Info, Loader2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/shared/data-table";
import { useDataTableState } from "@/components/shared/use-data-table-state";
import { useGetAllLocations } from "@/hooks/swr/locations/use-get-all-locations";
import type { LocationListItem } from "@/lib/services/location-service";
import { formatDate } from "@/lib/utils";
import { deleteLocationAction } from "@/lib/actions/locations/delete-location";

export default function LocationsDataTable() {
  const router = useRouter();
  const { search, setSearch, pagination, setPagination, query, getPageCount } = useDataTableState();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, error, isLoading, isValidating, mutate } = useGetAllLocations(query);
  const locations = data?.locations ?? [];
  const count = data?.count ?? 0;
  const pageCount = getPageCount(count);

  const handleDelete = useCallback(
    async (location: LocationListItem) => {
      const confirmed = window.confirm(`Delete ${location.name}?`);
      if (!confirmed) return;

      setDeletingId(location.id);

      try {
        const result = await deleteLocationAction(location.id);

        if (result.success) {
          toast.success("Location deleted successfully");
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

  const columns = useMemo<ColumnDef<LocationListItem>[]>(
    () => [
      {
        id: "row",
        header: "Row",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => <span className="capitalize">{row.original.type.toLowerCase()}</span>,
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
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon-sm" aria-label={`View ${row.original.name}`}>
              <Link href={`/admin/locations/${row.original.id}`}>
                <Info className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon-sm" aria-label={`Edit ${row.original.name}`}>
              <Link href={`/admin/locations/${row.original.id}/edit`}>
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
    data: locations,
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
      searchPlaceholder="Filter locations..."
      searchAriaLabel="Filter locations"
      count={count}
      entityNamePlural="locations"
      isFetching={isFetching}
      isLoading={isLoading}
      error={error}
    />
  );
}
