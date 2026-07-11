import WoodVariantInventoriesDataTable from "@/components/admin/inventories/wood-variant/data-table";
import LocationInventoriesDataTable from "@/components/admin/inventories/location/data-table";
import GradeInventoriesDataTable from "@/components/admin/inventories/grade/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InventoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-normal">Inventory</h1>
          <p className="text-sm text-muted-foreground">View and search currently stocked wood materials across locations.</p>
        </div>
      </div>

      <Tabs defaultValue="variant" className="w-full">
        <TabsList className="grid w-full max-w-sm grid-cols-3">
          <TabsTrigger value="variant">Wood Variant</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="grade">Grade</TabsTrigger>
        </TabsList>
        <TabsContent value="variant" className="mt-4">
          <WoodVariantInventoriesDataTable />
        </TabsContent>
        <TabsContent value="location" className="mt-4">
          <LocationInventoriesDataTable />
        </TabsContent>
        <TabsContent value="grade" className="mt-4">
          <GradeInventoriesDataTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
