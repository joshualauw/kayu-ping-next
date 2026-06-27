import contactService from "@/lib/services/contact-service";
import locationService from "@/lib/services/location-service";
import woodService from "@/lib/services/wood-service";
import materialService from "@/lib/services/material-service";
import PurchaseCreateForm from "@/components/admin/purchases/create-form";

export default async function CreatePurchasePage() {
  // Parallel server side fetching
  const [contacts, locations, woods, materials] = await Promise.all([
    contactService.getContactsForSelect(),
    locationService.getLocationsForSelect(),
    woodService.getWoodForSelect(),
    materialService.getMaterialForSelect(),
  ]);

  return <PurchaseCreateForm contacts={contacts} locations={locations} woods={woods} materials={materials} />;
}
