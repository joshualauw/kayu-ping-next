import locationService from "@/lib/services/location-service";
import woodService from "@/lib/services/wood-service";
import materialService from "@/lib/services/material-service";
import contactService from "@/lib/services/contact-service";
import PurchaseCreateForm from "@/components/admin/purchases/create-form";

export default async function CreatePurchasePage() {
  const [locations, woods, materials, contacts] = await Promise.all([
    locationService.getLocationsForSelect(),
    woodService.getWoodForSelect(),
    materialService.getMaterialForSelect(),
    contactService.getContactsForSelect(),
  ]);

  return <PurchaseCreateForm locations={locations} woods={woods} materials={materials} contacts={contacts} />;
}
