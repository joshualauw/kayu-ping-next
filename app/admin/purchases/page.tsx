import Link from "next/link";
import { Plus } from "lucide-react";
import PurchasesDataTable from "@/components/admin/purchases/data-table";
import { Button } from "@/components/ui/button";

export default function PurchasesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-normal">Purchases</h1>
          <p className="text-sm text-muted-foreground">Manage purchase transactions, payments, and logs.</p>
        </div>
        <Button asChild>
          <Link href="/admin/purchases/create">
            <Plus className="size-4" aria-hidden="true" />
            Create Purchase
          </Link>
        </Button>
      </div>

      <PurchasesDataTable />
    </div>
  );
}
