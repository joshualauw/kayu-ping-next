import Link from "next/link";
import { Plus } from "lucide-react";
import MaterialsDataTable from "@/components/admin/materials/data-table";
import { Button } from "@/components/ui/button";

export default function MaterialsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-normal">Materials</h1>
          <p className="text-sm text-muted-foreground">Manage production materials and log/cylinder components.</p>
        </div>
        <Button asChild>
          <Link href="/admin/materials/create">
            <Plus className="size-4" aria-hidden="true" />
            Create Material
          </Link>
        </Button>
      </div>

      <MaterialsDataTable />
    </div>
  );
}
