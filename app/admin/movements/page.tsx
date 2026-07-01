import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import MovementsDataTable from "@/components/admin/movements/data-table";

export default function MovementsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movements</h1>
          <p className="text-sm text-muted-foreground">Manage and track wood stock movements between locations.</p>
        </div>
        <Button asChild>
          <Link href="/admin/movements/create" className="flex items-center gap-1">
            <Plus className="size-4" />
            Create Movement
          </Link>
        </Button>
      </div>
      <MovementsDataTable />
    </div>
  );
}
