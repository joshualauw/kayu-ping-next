import Link from "next/link";
import { Plus } from "lucide-react";
import GradesDataTable from "@/components/admin/grades/data-table";
import { Button } from "@/components/ui/button";

export default function GradesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-normal">Grades</h1>
          <p className="text-sm text-muted-foreground">Manage wood grades and their references.</p>
        </div>
        <Button asChild>
          <Link href="/admin/grades/create">
            <Plus className="size-4" aria-hidden="true" />
            Create Grade
          </Link>
        </Button>
      </div>

      <GradesDataTable />
    </div>
  );
}
