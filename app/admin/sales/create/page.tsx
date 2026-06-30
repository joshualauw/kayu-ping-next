import locationService from "@/lib/services/location-service";
import contactService from "@/lib/services/contact-service";
import SaleCreateForm from "@/components/admin/sales/create-form";

export default async function CreateSalePage() {
  const [locations, contacts] = await Promise.all([
    locationService.getLocationsForSelect(),
    contactService.getContactsForSelect(),
  ]);

  return <SaleCreateForm locations={locations} contacts={contacts} />;
}
