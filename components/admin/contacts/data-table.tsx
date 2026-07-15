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
import { useGetAllContacts } from "@/hooks/swr/contacts/use-get-all-contacts";
import type { ContactListItem } from "@/app/api/contacts/route";
import { formatDate } from "@/lib/utils";
import { deleteContactAction } from "@/lib/actions/contacts/delete-contact";

export default function ContactsDataTable() {
  const router = useRouter();
  const { search, setSearch, pagination, setPagination, sorting, setSorting, query, getPageCount } = useDataTableState();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, error, isLoading, isValidating, mutate } = useGetAllContacts(query);
  const contacts = data?.contacts ?? [];
  const count = data?.count ?? 0;
  const pageCount = getPageCount(count);

  const handleDelete = useCallback(
    async (contact: ContactListItem) => {
      const confirmed = window.confirm(`Delete ${contact.name}?`);
      if (!confirmed) return;

      setDeletingId(contact.id);

      try {
        const result = await deleteContactAction(contact.id);

        if (result.success) {
          toast.success("Contact deleted successfully");
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

  const columns = useMemo<ColumnDef<ContactListItem>[]>(
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
        accessorKey: "type",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ row }) => <span className="capitalize">{row.original.type.toLowerCase()}</span>,
      },
      {
        accessorKey: "phoneNumber",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Phone Number" />,
        cell: ({ row }) => <span>{row.original.phoneNumber || "-"}</span>,
      },
      {
        accessorKey: "email",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
        cell: ({ row }) => <span>{row.original.email || "-"}</span>,
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
              <Link href={`/admin/contacts/${row.original.id}`}>
                <Info className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon-sm" aria-label={`Edit ${row.original.name}`}>
              <Link href={`/admin/contacts/${row.original.id}/edit`}>
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
    data: contacts,
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
      searchPlaceholder="Filter contacts..."
      searchAriaLabel="Filter contacts"
      count={count}
      entityNamePlural="contacts"
      isFetching={isFetching}
      isLoading={isLoading}
      error={error}
    />
  );
}
