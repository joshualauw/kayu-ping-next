import locationService from "@/lib/services/location-service";
import gradeService from "@/lib/services/grade-service";
import GradingCreateForm from "@/components/admin/gradings/create-form";

export default async function CreateGradingPage() {
  const [locations, grades] = await Promise.all([locationService.getLocationsForSelect(), gradeService.getGradesForSelect()]);

  return <GradingCreateForm locations={locations} grades={grades} />;
}
