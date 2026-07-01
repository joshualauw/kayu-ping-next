import locationService from "@/lib/services/location-service";
import contactService from "@/lib/services/contact-service";
import MovementCreateForm from "@/components/admin/movements/create-form";

export default async function CreateMovementPage() {
  const [locations, contacts] = await Promise.all([locationService.getLocationsForSelect(), contactService.getContactsForSelect()]);

  return <MovementCreateForm locations={locations} contacts={contacts} />;
}
