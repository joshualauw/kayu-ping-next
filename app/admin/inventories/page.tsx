import InventoriesDataTable from "@/components/admin/inventories/data-table";

export default function InventoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-normal">Inventory</h1>
          <p className="text-sm text-muted-foreground">View and search currently stocked wood materials across locations.</p>
        </div>
      </div>

      <InventoriesDataTable />
    </div>
  );
}
