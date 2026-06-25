import Link from "next/link";
import { Plus } from "lucide-react";
import LocationsDataTable from "@/components/admin/locations/data-table";
import { Button } from "@/components/ui/button";

export default function LocationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-normal">Locations</h1>
          <p className="text-sm text-muted-foreground">Manage storage, processing facilities, and warehouses.</p>
        </div>
        <Button asChild>
          <Link href="/admin/locations/create">
            <Plus className="size-4" aria-hidden="true" />
            Create Location
          </Link>
        </Button>
      </div>

      <LocationsDataTable />
    </div>
  );
}
