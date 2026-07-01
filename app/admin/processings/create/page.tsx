import locationService from "@/lib/services/location-service";
import woodService from "@/lib/services/wood-service";
import materialService from "@/lib/services/material-service";
import ProcessingCreateForm from "@/components/admin/processings/create-form";

export default async function CreateProcessingPage() {
  const [locations, woodVariants, materials] = await Promise.all([
    locationService.getLocationsForSelect(),
    woodService.getWoodVariantsForSelect(),
    materialService.getMaterialForSelect(),
  ]);

  return <ProcessingCreateForm locations={locations} woodVariants={woodVariants} materials={materials} />;
}
