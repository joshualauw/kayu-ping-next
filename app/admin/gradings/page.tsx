import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import GradingsDataTable from "@/components/admin/gradings/data-table";

export default function GradingsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grading</h1>
          <p className="text-sm text-muted-foreground">Manage and track wood grading history.</p>
        </div>
        <Button asChild>
          <Link href="/admin/gradings/create" className="flex items-center gap-1">
            <Plus className="size-4" />
            Create Grading
          </Link>
        </Button>
      </div>
      <GradingsDataTable />
    </div>
  );
}
