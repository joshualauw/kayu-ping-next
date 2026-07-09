import locationService from "@/lib/services/location-service";
import contactService from "@/lib/services/contact-service";
import woodService from "@/lib/services/wood-service";
import materialService from "@/lib/services/material-service";
import gradeService from "@/lib/services/grade-service";
import SaleCreateForm from "@/components/admin/sales/create-form";

export default async function CreateSalePage() {
  const [locations, contacts, woods, materials, grades] = await Promise.all([
    locationService.getLocationsForSelect(),
    contactService.getContactsForSelect(),
    woodService.getWoodForSelect(),
    materialService.getMaterialForSelect(),
    gradeService.getGradesForSelect(),
  ]);

  return (
    <SaleCreateForm
      locations={locations}
      contacts={contacts}
      woods={woods}
      materials={materials}
      grades={grades}
    />
  );
}
