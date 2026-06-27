import StockMutationsDataTable from "@/components/admin/stock-mutations/data-table";

export default function StockMutationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-normal">Stock Mutations</h1>
          <p className="text-sm text-muted-foreground">View audit logs of stock adjustments, purchases, and other movements.</p>
        </div>
      </div>

      <StockMutationsDataTable />
    </div>
  );
}
