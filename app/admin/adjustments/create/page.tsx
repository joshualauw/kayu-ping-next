import locationService from "@/lib/services/location-service";
import woodService from "@/lib/services/wood-service";
import materialService from "@/lib/services/material-service";
import gradeService from "@/lib/services/grade-service";
import AdjustmentCreateForm from "@/components/admin/adjustments/create-form";

export default async function CreateAdjustmentPage() {
  const [locations, woods, materials, grades] = await Promise.all([
    locationService.getLocationsForSelect(),
    woodService.getWoodForSelect(),
    materialService.getMaterialForSelect(),
    gradeService.getGradesForSelect(),
  ]);

  return (
    <AdjustmentCreateForm
      locations={locations}
      woods={woods}
      materials={materials}
      grades={grades}
    />
  );
}
