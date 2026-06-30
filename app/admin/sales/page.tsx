import Link from "next/link";
import { Plus } from "lucide-react";
import SalesDataTable from "@/components/admin/sales/data-table";
import { Button } from "@/components/ui/button";

export default function SalesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-normal">Sales</h1>
          <p className="text-sm text-muted-foreground">Manage sale transactions and logs.</p>
        </div>
        <Button asChild>
          <Link href="/admin/sales/create">
            <Plus className="size-4" aria-hidden="true" />
            Create Sale
          </Link>
        </Button>
      </div>

      <SalesDataTable />
    </div>
  );
}
