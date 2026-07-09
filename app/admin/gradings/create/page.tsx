import locationService from "@/lib/services/location-service";
import gradeService from "@/lib/services/grade-service";
import woodService from "@/lib/services/wood-service";
import materialService from "@/lib/services/material-service";
import GradingCreateForm from "@/components/admin/gradings/create-form";

export default async function CreateGradingPage() {
  const [locations, grades, woods, materials] = await Promise.all([
    locationService.getLocationsForSelect(),
    gradeService.getGradesForSelect(),
    woodService.getWoodForSelect(),
    materialService.getMaterialForSelect(),
  ]);

  return <GradingCreateForm locations={locations} grades={grades} woods={woods} materials={materials} />;
}
