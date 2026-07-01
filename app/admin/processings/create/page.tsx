import locationService from "@/lib/services/location-service";
import contactService from "@/lib/services/contact-service";
import woodService from "@/lib/services/wood-service";
import ProcessingCreateForm from "@/components/admin/processings/create-form";

export default async function CreateProcessingPage() {
  const [locations, contacts, woodVariants] = await Promise.all([
    locationService.getLocationsForSelect(),
    contactService.getContactsForSelect(),
    woodService.getWoodVariantsForSelect(),
  ]);

  return <ProcessingCreateForm locations={locations} contacts={contacts} woodVariants={woodVariants} />;
}
