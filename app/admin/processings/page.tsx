import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProcessingsDataTable from "@/components/admin/processings/data-table";

export default function ProcessingsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Processing</h1>
          <p className="text-sm text-muted-foreground">Manage and track wood processing history.</p>
        </div>
        <Button asChild>
          <Link href="/admin/processings/create" className="flex items-center gap-1">
            <Plus className="size-4" />
            Create Processing
          </Link>
        </Button>
      </div>
      <ProcessingsDataTable />
    </div>
  );
}
