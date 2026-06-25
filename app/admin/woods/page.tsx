import Link from "next/link";
import { Plus } from "lucide-react";
import WoodsDataTable from "@/components/admin/woods/data-table";
import { Button } from "@/components/ui/button";

export default function WoodsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-normal">Woods</h1>
          <p className="text-sm text-muted-foreground">Manage wood types, codes, and their inventory reference data.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/woods/create">
            <Plus className="size-4" aria-hidden="true" />
            Create Wood
          </Link>
        </Button>
      </div>

      <WoodsDataTable />
    </div>
  );
}
