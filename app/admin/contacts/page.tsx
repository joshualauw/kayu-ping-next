import Link from "next/link";
import { Plus } from "lucide-react";
import ContactsDataTable from "@/components/admin/contacts/data-table";
import { Button } from "@/components/ui/button";

export default function ContactsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-normal">Contacts</h1>
          <p className="text-sm text-muted-foreground">Manage suppliers, customers, truckers, and other contact profiles.</p>
        </div>
        <Button asChild>
          <Link href="/admin/contacts/create">
            <Plus className="size-4" aria-hidden="true" />
            Create Contact
          </Link>
        </Button>
      </div>

      <ContactsDataTable />
    </div>
  );
}
