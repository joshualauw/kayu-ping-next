import { notFound } from "next/navigation";
import LocationUpdateForm from "@/components/admin/locations/update-form";
import locationService from "@/lib/services/location-service";

interface EditLocationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditLocationPage({ params }: EditLocationPageProps) {
  const { id } = await params;
  const locationId = Number(id);

  if (!Number.isInteger(locationId) || locationId <= 0) {
    notFound();
  }

  const location = await locationService.getLocationById(locationId);

  if (!location) {
    notFound();
  }

  return <LocationUpdateForm location={location} />;
}
