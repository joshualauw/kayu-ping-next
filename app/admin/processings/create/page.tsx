import locationService from "@/lib/services/location-service";
import woodService from "@/lib/services/wood-service";
import materialService from "@/lib/services/material-service";
import gradeService from "@/lib/services/grade-service";
import ProcessingCreateForm from "@/components/admin/processings/create-form";

export default async function CreateProcessingPage() {
  const [locations, materials, woods, grades] = await Promise.all([
    locationService.getLocationsForSelect(),
    materialService.getMaterialForSelect(),
    woodService.getWoodForSelect(),
    gradeService.getGradesForSelect(),
  ]);

  return <ProcessingCreateForm locations={locations} materials={materials} woods={woods} grades={grades} />;
}
