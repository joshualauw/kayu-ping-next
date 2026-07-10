import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdjustmentsDataTable from "@/components/admin/adjustments/data-table";

export default function AdjustmentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-normal">Adjustments</h1>
          <p className="text-sm text-muted-foreground">Manage inventory adjustments and logs.</p>
        </div>
        <Button asChild>
          <Link href="/admin/adjustments/create">
            <Plus className="size-4" aria-hidden="true" />
            Create Adjustment
          </Link>
        </Button>
      </div>

      <AdjustmentsDataTable />
    </div>
  );
}
